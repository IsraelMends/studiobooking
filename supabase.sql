create extension if not exists pgcrypto;

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blocks (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    date date NOT NULL,
    start time without time zone,
    finish time without time zone,
    reason text,
    CONSTRAINT blocks_pkey PRIMARY KEY (id)
);

CREATE TABLE public.booking_policies (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    organization_id uuid NOT NULL,
    policy_type character varying NOT NULL,
    value integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT booking_policies_pkey PRIMARY KEY (id),
        CONSTRAINT booking_policies_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations (id)
);

CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  buffer_until time without time zone NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'finished'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  room_id text,
  kind text,
  cancel_reason text,
  canceled_reason text,
  canceled_at timestamp with time zone,
  organization_id uuid,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT fk_bookings_org FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

CREATE TABLE public.organizations (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name character varying NOT NULL,
    email character varying UNIQUE,
    created_at timestamp
    with
        time zone DEFAULT now(),
        updated_at timestamp
    with
        time zone DEFAULT now(),
        owner_id uuid,
        CONSTRAINT organizations_pkey PRIMARY KEY (id),
        CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users (id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user'::text CHECK (role = ANY (ARRAY['admin'::text, 'user'::text])),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.settings (
  id text NOT NULL DEFAULT 'global'::text,
  open_time time without time zone NOT NULL DEFAULT '08:00:00'::time without time zone,
  close_time time without time zone NOT NULL DEFAULT '22:00:00'::time without time zone,
  cancel_policy_hours integer NOT NULL DEFAULT 6,
  org_daily_quota_minutes integer NOT NULL DEFAULT 180,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);

create index if not exists bookings_day_idx on bookings (date);

create index if not exists bookings_user_idx on bookings (user_id);

alter table profiles enable row level security;

alter table bookings enable row level security;

alter table settings enable row level security;

alter table blocks enable row level security;

create policy "profiles self read" on profiles for
select using (
        auth.uid () = id
        or exists (
            select 1
            from profiles p
            where
                p.id = auth.uid ()
                and p.role = 'admin'
        )
    );

create policy "profiles self update" on profiles for
update using (auth.uid () = id);

create policy "bookings read authed" on bookings for
select using (auth.role () is not null);

create policy "bookings insert self" on bookings for
insert
with
    check (auth.uid () = user_id);

create policy "bookings update own or admin" on bookings for
update using (
    auth.uid () = user_id
    or exists (
        select 1
        from profiles p
        where
            p.id = auth.uid ()
            and p.role = 'admin'
    )
);

create policy "settings read all" on settings for
select using (true);

create policy "settings write admin" on settings for
insert
with
    check (
        exists (
            select 1
            from profiles p
            where
                p.id = auth.uid ()
                and p.role = 'admin'
        )
    );

create policy "settings update admin" on settings for
update using (
    exists (
        select 1
        from profiles p
        where
            p.id = auth.uid ()
            and p.role = 'admin'
    )
);

create policy "blocks read all" on blocks for select using (true);

create policy "blocks write admin" on blocks for
insert
with
    check (
        exists (
            select 1
            from profiles p
            where
                p.id = auth.uid ()
                and p.role = 'admin'
        )
    );

create policy "blocks update admin" on blocks for
update using (
    exists (
        select 1
        from profiles p
        where
            p.id = auth.uid ()
            and p.role = 'admin'
    )
);

create policy "blocks delete admin" on blocks for delete using (
    exists (
        select 1
        from profiles p
        where
            p.id = auth.uid ()
            and p.role = 'admin'
    )
);

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