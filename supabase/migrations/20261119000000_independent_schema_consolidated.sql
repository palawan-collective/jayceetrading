-- ============================================================
-- JayCee Trading & Services — independent Supabase schema
-- Reconstructed from repo migrations + live old-project schema.
-- Safe to re-run (idempotent where practical).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- catalog ----------
create table if not exists public.products (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  category text not null default 'General',
  cost_of_goods numeric not null default 0,
  price numeric not null default 0,
  unit text not null default 'piece',
  inventory integer not null default 0,
  inventory_min_threshold integer not null default 5,
  image_url text,
  is_available boolean not null default true,
  is_special boolean not null default false,
  special_price numeric,
  special_end_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id serial primary key,
  value text not null unique,
  label text not null,
  example text,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id text not null primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_type text not null default 'pickup',
  delivery_address text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  total_price numeric not null default 0,
  profit numeric not null default 0,
  payment_method text not null default 'cash',
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  whatsapp_confirmation_sent boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  whatsapp_ready_sent boolean not null default false,
  email_confirmation_sent boolean not null default false,
  email_ready_sent boolean not null default false,
  confirmed_at timestamptz,
  ready_at timestamptz,
  paid_at timestamptz,
  paid_via text,
  invoice_number text,
  reward_code_used text
);

-- ---------- settings ----------
create table if not exists public.business_settings (
  id integer not null default 1 primary key check (id = 1),
  business_name text not null default 'My Food Business',
  business_phone text not null default '',
  business_email text not null default '',
  business_address text not null default '',
  google_maps_url text,
  copyright_text text not null default '© 2025 My Food Business',
  currency_symbol text not null default '₱',
  whatsapp_business_number text,
  logo_url text,
  favicon_url text,
  facebook_url text default '',
  instagram_url text default '',
  confirmation_whatsapp_template text not null default 'Hello {name}, your order #{id} has been CONFIRMED. Total: {total}. We will notify you when ready.',
  ready_whatsapp_template text not null default 'Hello {name}, your order #{id} is READY for {delivery_type}. Please come to {address} or await delivery.',
  confirmation_email_template text not null default 'Dear {name}, your order #{id} has been confirmed. Total: {total}. We will notify you when it is ready.',
  ready_email_template text not null default 'Dear {name}, your order #{id} is now READY for {delivery_type}.',
  brand_red text not null default '#E11D2E',
  brand_yellow text not null default '#FFC107',
  brand_green text not null default '#0B7D32',
  brand_charcoal text not null default '#222222',
  brand_sand text not null default '#F4F1E8',
  heading_font text not null default 'Montserrat',
  body_font text not null default 'Inter',
  hero_title_line1 text not null default 'Savor the taste.',
  hero_title_line2 text not null default 'Indulge in quality.',
  hero_intro text not null default 'A trusted food distribution partner for homes, hotels, restaurants, and businesses across Palawan since 2017.',
  site_tagline text not null default 'More than a supplier. A partner in your success.',
  hero_image_url text
);

create table if not exists public.header_settings (
  id integer not null default 1 primary key check (id = 1),
  show_logo boolean not null default true,
  show_cart_icon boolean not null default true,
  show_admin_icon boolean not null default true,
  show_theme_toggle boolean not null default true,
  header_background_color text not null default '#0f172a',
  header_text_color text not null default '#ffffff'
);

create table if not exists public.footer_settings (
  id integer not null default 1 primary key check (id = 1),
  show_social_icons boolean not null default true,
  show_contact_info boolean not null default true,
  show_newsletter boolean not null default true,
  footer_background_color text not null default '#1e293b',
  footer_text_color text not null default '#94a3b8',
  copyright_text text not null default '© 2025 My Food Business. All rights reserved.'
);

create table if not exists public.social_media_links (
  id serial primary key,
  platform_name text not null,
  icon_name text not null,
  url text not null default '',
  is_enabled boolean not null default true,
  display_order integer not null default 0
);

create table if not exists public.payment_methods (
  id serial primary key,
  method_name text not null,
  is_enabled boolean not null default true,
  qr_code_url text,
  display_order integer not null default 0
);

create table if not exists public.payment_settings (
  id integer primary key default 1,
  show_gcash_on_invoice boolean not null default true,
  show_phqr_on_invoice boolean not null default true,
  show_bank_on_invoice boolean not null default true,
  gcash_qr_url text,
  phqr_qr_url text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  invoice_layout text not null default 'show_all',
  show_cod_on_invoice boolean not null default true,
  show_cop_on_invoice boolean not null default true,
  cod_instructions text default 'Please prepare the exact amount for Cash on Delivery.',
  cop_instructions text default 'Please pay at the counter upon pickup.'
);

-- ---------- content ----------
create table if not exists public.website_pages (
  id serial primary key,
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  display_order integer not null default 0,
  seo_title text,
  seo_description text
);

create table if not exists public.content_sections (
  id serial primary key,
  page_slug text not null,
  section_type text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.faqs (
  id serial primary key,
  question text not null,
  answer text not null,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid not null default gen_random_uuid() primary key,
  customer_name text not null,
  customer_image text,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  review_text text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.specials (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  special_type text not null default 'daily',
  start_date timestamptz not null default now(),
  end_date timestamptz not null default now() + interval '7 days',
  discount_percent numeric,
  products_included jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  image_url text
);

create table if not exists public.newsletter_subscribers (
  id uuid not null default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists public.contact_form_submissions (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- ---------- loyalty ----------
create table if not exists public.loyalty_customers (
  id uuid not null default gen_random_uuid() primary key,
  phone text not null,
  name text,
  email text,
  total_orders integer default 0,
  total_spent numeric default 0,
  stamp_count integer default 0,
  lifetime_stamps integer default 0,
  tier text default 'regular',
  created_at timestamptz default now(),
  last_order_at timestamptz
);

create table if not exists public.loyalty_rewards (
  id uuid not null default gen_random_uuid() primary key,
  customer_phone text not null,
  reward_code text not null unique,
  discount_amount numeric,
  is_claimed boolean default false,
  claimed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  customer_id uuid,
  reward_type text,
  status text default 'unclaimed',
  earned_at timestamptz default now()
);

create table if not exists public.loyalty_stamp_log (
  id uuid not null default gen_random_uuid() primary key,
  customer_id uuid references public.loyalty_customers(id) on delete cascade,
  order_id text,
  invoice_number text,
  stamps_earned integer,
  order_total numeric,
  created_at timestamptz default now()
);

create table if not exists public.loyalty_stamps (
  id uuid not null default gen_random_uuid() primary key,
  customer_phone text not null,
  order_id text not null unique references public.orders(id) on delete cascade,
  stamps_awarded integer,
  created_at timestamptz default now()
);

-- ---------- RLS ----------
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.units enable row level security;
alter table public.orders enable row level security;
alter table public.business_settings enable row level security;
alter table public.header_settings enable row level security;
alter table public.footer_settings enable row level security;
alter table public.social_media_links enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payment_settings enable row level security;
alter table public.website_pages enable row level security;
alter table public.content_sections enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.specials enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_form_submissions enable row level security;
alter table public.loyalty_customers enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.loyalty_stamp_log enable row level security;
alter table public.loyalty_stamps enable row level security;

-- ---------- policies (public read, anon+authenticated write) ----------
do $$
declare
  t text;
  tbls text[] := array[
    'products','categories','units','orders','business_settings','header_settings',
    'footer_settings','social_media_links','payment_methods','payment_settings',
    'website_pages','content_sections','faqs','testimonials','specials',
    'newsletter_subscribers','contact_form_submissions','loyalty_customers',
    'loyalty_rewards','loyalty_stamp_log','loyalty_stamps'
  ];
begin
  foreach t in array tbls loop
    execute format('drop policy if exists %I on public.%I', t || '_public_select', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_public_select', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_insert', t);
    execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', t || '_public_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_update', t);
    execute format('create policy %I on public.%I for update to anon, authenticated using (true) with check (true)', t || '_public_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_delete', t);
    execute format('create policy %I on public.%I for delete to anon, authenticated using (true)', t || '_public_delete', t);
  end loop;
end $$;

-- ---------- invoice number ----------
create or replace function public.generate_invoice_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  year_str text;
  seq_num int;
begin
  year_str := to_char(now(), 'YYYY');
  select count(*) + 1 into seq_num
    from public.orders
   where invoice_number is not null
     and invoice_number like 'INV-' || year_str || '-%';
  new.invoice_number := 'INV-' || year_str || '-' || lpad(seq_num::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists set_invoice_number on public.orders;
create trigger set_invoice_number
  before insert on public.orders
  for each row
  when (new.invoice_number is null)
  execute function public.generate_invoice_number();

-- ---------- realtime ----------
alter table public.orders replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values
  ('product-images','product-images',true),
  ('specials','specials',true),
  ('logos','logos',true)
on conflict (id) do update set public = excluded.public;

do $$
declare
  b text;
  buckets text[] := array['product-images','specials','logos'];
begin
  foreach b in array buckets loop
    execute format('drop policy if exists %I on storage.objects', b || '_read');
    execute format('create policy %I on storage.objects for select using (bucket_id = %L)', b || '_read', b);

    execute format('drop policy if exists %I on storage.objects', b || '_insert');
    execute format('create policy %I on storage.objects for insert with check (bucket_id = %L)', b || '_insert', b);

    execute format('drop policy if exists %I on storage.objects', b || '_update');
    execute format('create policy %I on storage.objects for update using (bucket_id = %L)', b || '_update', b);

    execute format('drop policy if exists %I on storage.objects', b || '_delete');
    execute format('create policy %I on storage.objects for delete using (bucket_id = %L)', b || '_delete', b);
  end loop;
end $$;

-- ---------- default rows ----------
insert into public.business_settings (id) values (1) on conflict (id) do nothing;
insert into public.header_settings (id) values (1) on conflict (id) do nothing;
insert into public.footer_settings (id) values (1) on conflict (id) do nothing;
insert into public.payment_settings (id) values (1) on conflict (id) do nothing;
