
-- HÉLIUM MOTORS - SUPABASE SETUP
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text unique,
 full_name text,
 role text default 'admin',
 created_at timestamptz default now()
);

create table if not exists public.vehicles (
 id uuid primary key default gen_random_uuid(),
 title text not null, slug text unique, year integer, mileage integer, price numeric,
 status text default 'Disponible', fuel text, transmission text, color text, origin text,
 history text, cover_image text, published boolean default false, created_at timestamptz default now()
);
create table if not exists public.vehicle_photos (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid references public.vehicles(id) on delete cascade,
 image_url text not null, sort_order integer default 0, created_at timestamptz default now()
);
create table if not exists public.vehicle_equipment (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid references public.vehicles(id) on delete cascade,
 name text not null
);
create table if not exists public.reservations (
 id uuid primary key default gen_random_uuid(), vehicle_id text, full_name text not null, email text not null,
 phone text not null, payment_method text, deposit_percentage numeric default 20, hold_hours integer default 72,
 status text default 'pending', created_at timestamptz default now()
);
create table if not exists public.sale_requests (
 id uuid primary key default gen_random_uuid(), owner_name text, email text, phone text, registration text,
 make_model text, year text, mileage text, desired_price text, general_condition text, technical_control text,
 maintenance_history text, keys_count text, active_financing text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.sale_request_documents (
 id uuid primary key default gen_random_uuid(), sale_request_id uuid references public.sale_requests(id) on delete cascade,
 document_type text, storage_path text, file_name text, created_at timestamptz default now()
);
create table if not exists public.import_requests (
 id uuid primary key default gen_random_uuid(), full_name text, email text, phone text, vehicle_query text,
 budget text, destination text, details text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.brokerage_requests (
 id uuid primary key default gen_random_uuid(), full_name text, email text, phone text, vehicle_query text,
 budget text, max_mileage text, details text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.contact_messages (
 id uuid primary key default gen_random_uuid(), full_name text, email text, phone text, subject text,
 message text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.sold_vehicles (
 id uuid primary key default gen_random_uuid(), title text, image_url text, destination text,
 sold_at date, published boolean default false, created_at timestamptz default now()
);
create table if not exists public.reviews (
 id uuid primary key default gen_random_uuid(), client_name text, vehicle_name text, rating integer,
 content text, image_url text, published boolean default false, created_at timestamptz default now()
);
create table if not exists public.articles (
 id uuid primary key default gen_random_uuid(), title text not null, slug text unique, category text,
 excerpt text, content text, cover_image text, author text default 'Hélium Motors',
 published boolean default false, published_at timestamptz, created_at timestamptz default now()
);

insert into storage.buckets (id,name,public) values ('vehicle-images','vehicle-images',true) on conflict do nothing;
insert into storage.buckets (id,name,public) values ('article-images','article-images',true) on conflict do nothing;
insert into storage.buckets (id,name,public) values ('private-documents','private-documents',false) on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_equipment enable row level security;
alter table public.reservations enable row level security;
alter table public.sale_requests enable row level security;
alter table public.sale_request_documents enable row level security;
alter table public.import_requests enable row level security;
alter table public.brokerage_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.sold_vehicles enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create policy "public read published vehicles" on public.vehicles for select using (published=true or public.is_admin());
create policy "public read vehicle photos" on public.vehicle_photos for select using (exists(select 1 from public.vehicles v where v.id=vehicle_id and (v.published=true or public.is_admin())));
create policy "public read vehicle equipment" on public.vehicle_equipment for select using (exists(select 1 from public.vehicles v where v.id=vehicle_id and (v.published=true or public.is_admin())));
create policy "public read sold vehicles" on public.sold_vehicles for select using (published=true or public.is_admin());
create policy "public read reviews" on public.reviews for select using (published=true or public.is_admin());
create policy "public read articles" on public.articles for select using (published=true or public.is_admin());

create policy "public submit reservations" on public.reservations for insert to anon,authenticated with check (true);
create policy "public submit sale requests" on public.sale_requests for insert to anon,authenticated with check (true);
create policy "public submit sale documents metadata" on public.sale_request_documents for insert to anon,authenticated with check (true);
create policy "public submit import requests" on public.import_requests for insert to anon,authenticated with check (true);
create policy "public submit brokerage requests" on public.brokerage_requests for insert to anon,authenticated with check (true);
create policy "public submit contacts" on public.contact_messages for insert to anon,authenticated with check (true);

create policy "admins full vehicles" on public.vehicles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins full vehicle photos" on public.vehicle_photos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins full equipment" on public.vehicle_equipment for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read reservations" on public.reservations for select to authenticated using (public.is_admin());
create policy "admins read sale requests" on public.sale_requests for select to authenticated using (public.is_admin());
create policy "admins read sale docs" on public.sale_request_documents for select to authenticated using (public.is_admin());
create policy "admins read imports" on public.import_requests for select to authenticated using (public.is_admin());
create policy "admins read brokerage" on public.brokerage_requests for select to authenticated using (public.is_admin());
create policy "admins read contacts" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admins full sold" on public.sold_vehicles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins full reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins full articles" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public upload private docs" on storage.objects for insert to anon,authenticated
with check (bucket_id='private-documents');
create policy "admins read private docs" on storage.objects for select to authenticated
using (bucket_id='private-documents' and public.is_admin());
create policy "admins manage public images" on storage.objects for all to authenticated
using (bucket_id in ('vehicle-images','article-images') and public.is_admin())
with check (bucket_id in ('vehicle-images','article-images') and public.is_admin());
create policy "public view public images" on storage.objects for select to anon,authenticated
using (bucket_id in ('vehicle-images','article-images'));

-- Après création de l'utilisateur Auth heliummotors08@gmail.com, exécuter :
-- insert into public.profiles(id,email,full_name,role)
-- select id,email,'Sloane Bohico','admin' from auth.users where email='heliummotors08@gmail.com'
-- on conflict(id) do update set role='admin', full_name='Sloane Bohico';
