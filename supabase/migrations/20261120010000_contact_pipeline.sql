begin;

alter table public.contact_form_submissions
  add column sales_stage text not null default 'new'
    check (sales_stage in ('new', 'qualified', 'contacted', 'quotation', 'won', 'lost')),
  add column follow_up_notes text not null default '' check (char_length(follow_up_notes) <= 4000),
  add column source_url text check (char_length(source_url) <= 1000 and source_url ~ '^https?://'),
  add column business_location text check (char_length(business_location) <= 120),
  add column business_category text check (char_length(business_category) <= 120);

grant insert (source_url, business_location, business_category)
  on public.contact_form_submissions to authenticated;
grant update (sales_stage, follow_up_notes)
  on public.contact_form_submissions to authenticated;

create policy "Only Jaycee staff can add prospect details"
on public.contact_form_submissions as restrictive for insert to authenticated
with check (
  (source_url is null and business_location is null and business_category is null)
  or ((select auth.jwt() -> 'app_metadata' -> 'jaycee_admin') = 'true'::jsonb)
);

create policy "Jaycee staff can record sourced prospects"
on public.contact_form_submissions for insert to authenticated
with check (
  (select auth.jwt() -> 'app_metadata' -> 'jaycee_admin') = 'true'::jsonb
  and source_url is not null
  and char_length(btrim(name)) between 1 and 100
  and char_length(email) <= 254
  and (email = '' or position('@' in email) > 1)
  and (phone is null or char_length(phone) <= 40)
  and char_length(btrim(message)) between 1 and 4000
);

commit;
