begin;

alter table public.contact_form_submissions enable row level security;

-- Both the original and consolidated schemas installed permissive contact policies.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'contact_form_submissions'
  loop
    execute format('drop policy %I on public.contact_form_submissions', existing_policy.policyname);
  end loop;
end;
$$;

revoke all on public.contact_form_submissions from public, anon, authenticated;
grant insert (name, email, phone, message) on public.contact_form_submissions to anon, authenticated;
grant select, delete on public.contact_form_submissions to authenticated;
grant update (is_read) on public.contact_form_submissions to authenticated;

create policy "Public can submit contact inquiries"
on public.contact_form_submissions for insert to anon, authenticated
with check (
  char_length(btrim(name)) between 1 and 100
  and char_length(btrim(email)) between 3 and 254
  and position('@' in email) > 1
  and (phone is null or char_length(phone) <= 40)
  and char_length(btrim(message)) between 1 and 4000
);

create policy "Jaycee admin contact select"
on public.contact_form_submissions for select to authenticated
using ((select auth.jwt() -> 'app_metadata' -> 'jaycee_admin') = 'true'::jsonb);

create policy "Jaycee admin contact update"
on public.contact_form_submissions for update to authenticated
using ((select auth.jwt() -> 'app_metadata' -> 'jaycee_admin') = 'true'::jsonb);

create policy "Jaycee admin contact delete"
on public.contact_form_submissions for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' -> 'jaycee_admin') = 'true'::jsonb);

commit;
