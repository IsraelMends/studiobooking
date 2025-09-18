create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role text check (role in ('admin','user')) not null default 'user',
  name text not null,
  email text not null unique,
  phone text,
  organization text,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id text primary key default 'global',
  open_time time not null default '08:00',
  close_time time not null default '22:00',
  cancel_policy_hours int not null default 6
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start time,
  finish time,
  reason text
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  buffer_until time not null,
  status text not null check (status in ('active','canceled')) default 'active',
  created_at timestamptz not null default now(),
  room_id text,
  kind text,
  cancel_reason text
);

create index if not exists bookings_day_idx on bookings(date);
create index if not exists bookings_user_idx on bookings(user_id);

alter table profiles enable row level security;
alter table bookings enable row level security;
alter table settings enable row level security;
alter table blocks enable row level security;

create policy "profiles self read" on profiles for select
  using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));
create policy "profiles self update" on profiles for update using (auth.uid() = id);

create policy "bookings read authed" on bookings for select using (auth.role() is not null);
create policy "bookings insert self" on bookings for insert with check (auth.uid() = user_id);
create policy "bookings update own or admin" on bookings for update using (
  auth.uid() = user_id or exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);

create policy "settings read all" on settings for select using (true);
create policy "settings write admin" on settings for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));
create policy "settings update admin" on settings for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));

create policy "blocks read all" on blocks for select using (true);
create policy "blocks write admin" on blocks for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));
create policy "blocks update admin" on blocks for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));
create policy "blocks delete admin" on blocks for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin'));

create or replace function create_booking(p_user_id uuid, p_date date, p_start time)
returns bookings
language plpgsql
security definer
as $$
declare
  s settings;
  new_b bookings;
  v_end time;
  v_buffer time;
  conflict_count int;
begin
  select * into s from settings where id='global';
  if s is null then
    s.open_time := time '08:00';
    s.close_time := time '22:00';
    s.cancel_policy_hours := 6;
  end if;

  v_end := (p_start + interval '60 minutes')::time;
  v_buffer := (v_end + interval '10 minutes')::time;

  if p_start < s.open_time or v_end > s.close_time then
    raise exception 'OUT_OF_WINDOW';
  end if;

  if exists (
    select 1 from blocks b
    where b.date = p_date
      and (
        (b.start is null and b.finish is null) or
        (p_start >= b.start and p_start < coalesce(b.finish, time '23:59'))
      )
  ) then
    raise exception 'BLOCKED';
  end if;

  select count(*) into conflict_count
  from bookings b
  where b.date = p_date
    and b.status = 'active'
    and (p_start < b.buffer_until and v_end > b.start_time);

  if conflict_count > 0 then
    raise exception 'CONFLICT';
  end if;

  insert into bookings(user_id, date, start_time, end_time, buffer_until, status)
  values (p_user_id, p_date, p_start, v_end, v_buffer, 'active')
  returning * into new_b;

  return new_b;
end;
$$;
