
-- HÉLIUM MOTORS PHASE 2
create table if not exists public.clients (
 id uuid primary key default gen_random_uuid(),
 full_name text,
 email text,
 phone text,
 source text,
 status text default 'prospect',
 assigned_to text default 'Sloane Bohico',
 notes text,
 last_contact_at timestamptz,
 created_at timestamptz default now()
);

create table if not exists public.client_notes (
 id uuid primary key default gen_random_uuid(),
 client_id uuid references public.clients(id) on delete cascade,
 content text not null,
 created_by uuid references auth.users(id),
 created_at timestamptz default now()
);

create table if not exists public.site_settings (
 id uuid primary key default gen_random_uuid(),
 setting_key text unique not null,
 setting_value jsonb,
 updated_at timestamptz default now()
);

create table if not exists public.media_library (
 id uuid primary key default gen_random_uuid(),
 file_name text,
 file_url text,
 bucket text,
 file_type text,
 size_bytes bigint,
 alt_text text,
 created_at timestamptz default now()
);

create table if not exists public.activity_log (
 id uuid primary key default gen_random_uuid(),
 activity_type text,
 title text,
 details jsonb,
 created_at timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.client_notes enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_library enable row level security;
alter table public.activity_log enable row level security;

create policy "admins full clients" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins full client notes" on public.client_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read settings" on public.site_settings for select to anon,authenticated using (true);
create policy "admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage media" on public.media_library for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read activity" on public.activity_log for select to authenticated using (public.is_admin());
create policy "admins insert activity" on public.activity_log for insert to authenticated with check (public.is_admin());

alter table public.vehicles
 add column if not exists slug text,
 add column if not exists discounted_price numeric,
 add column if not exists vin text,
 add column if not exists interior_color text,
 add column if not exists power text,
 add column if not exists owners_count integer,
 add column if not exists warranty_text text,
 add column if not exists video_url text,
 add column if not exists seo_title text,
 add column if not exists seo_description text,
 add column if not exists featured boolean default false;

alter table public.articles
 add column if not exists seo_title text,
 add column if not exists seo_description text,
 add column if not exists updated_at timestamptz default now();

insert into public.site_settings(setting_key,setting_value) values
('contact', '{"phone":"+33 7 82 68 46 07","email":"heliummotors08@gmail.com","whatsapp":"+33 7 82 68 46 07","hours":"24/7 WhatsApp · Chat 8h-20h"}'),
('branding', '{"primary":"#050505","accent":"#c89a48","company":"Hélium Motors"}'),
('stats', '{"vehicles_sold":14,"clients_satisfied":14,"recommendation_rate":98}')
on conflict(setting_key) do nothing;
