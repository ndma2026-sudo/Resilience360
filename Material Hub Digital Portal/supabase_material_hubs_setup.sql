-- Material Hubs Portal live backend setup (Supabase)
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.material_hubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  district text not null,
  latitude double precision not null,
  longitude double precision not null,
  capacity integer not null default 0,
  status text not null default 'ready' check (status in ('ready', 'moderate', 'critical')),
  stock_percentage integer not null default 0,
  damage_percentage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_material_entries (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid not null references public.material_hubs(id) on delete cascade,
  name text not null,
  unit text not null,
  opening integer not null default 0,
  received integer not null default 0,
  issued integer not null default 0,
  closing integer not null default 0,
  damaged integer not null default 0,
  percentage_remaining integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_material_hubs on public.material_hubs;
create trigger trg_touch_material_hubs
before update on public.material_hubs
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_touch_hub_material_entries on public.hub_material_entries;
create trigger trg_touch_hub_material_entries
before update on public.hub_material_entries
for each row execute procedure public.touch_updated_at();

alter table public.material_hubs enable row level security;
alter table public.hub_material_entries enable row level security;

-- Public read access
create policy if not exists material_hubs_select_all
on public.material_hubs
for select
using (true);

create policy if not exists hub_material_entries_select_all
on public.hub_material_entries
for select
using (true);

-- Authenticated users (admins) can write
create policy if not exists material_hubs_write_authenticated
on public.material_hubs
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy if not exists hub_material_entries_write_authenticated
on public.hub_material_entries
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

alter publication supabase_realtime add table public.material_hubs;
alter publication supabase_realtime add table public.hub_material_entries;

-- Optional starter data
insert into public.material_hubs (name, location, district, latitude, longitude, capacity, status, stock_percentage, damage_percentage)
select 'Gilgit Material Hub', 'Gilgit', 'Gilgit-Baltistan', 35.9208, 74.3080, 200, 'ready', 92, 2
where not exists (select 1 from public.material_hubs where name = 'Gilgit Material Hub');

insert into public.material_hubs (name, location, district, latitude, longitude, capacity, status, stock_percentage, damage_percentage)
select 'Muzaffargarh Material Hub', 'Muzaffargarh', 'Muzaffargarh', 30.0704, 71.1932, 200, 'moderate', 68, 12
where not exists (select 1 from public.material_hubs where name = 'Muzaffargarh Material Hub');

insert into public.material_hubs (name, location, district, latitude, longitude, capacity, status, stock_percentage, damage_percentage)
select 'Sukkur Material Hub', 'Sukkur', 'Sukkur', 27.7052, 68.8574, 200, 'critical', 54, 18
where not exists (select 1 from public.material_hubs where name = 'Sukkur Material Hub');
