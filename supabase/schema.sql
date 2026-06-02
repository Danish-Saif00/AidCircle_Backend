create extension if not exists postgis;

create type public.user_role as enum (
  'user',
  'helper',
  'admin'
);

create type public.emergency_status as enum (
  'active',
  'resolved',
  'cancelled',
  'expired'
);

create type public.emergency_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.responder_status as enum (
  'accepted',
  'on_way',
  'arrived',
  'cancelled'
);

create type public.notification_status as enum (
  'pending',
  'sent',
  'failed',
  'read'
);

create type public.report_status as enum (
  'pending',
  'reviewed',
  'dismissed',
  'action_taken'
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  role public.user_role not null default 'user',
  is_verified boolean not null default false,
  is_helper_available boolean not null default true,
  is_blocked boolean not null default false,
  blood_group text,
  medical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  location_point geography(point, 4326) not null,
  accuracy_meters double precision,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint user_locations_latitude_check
    check (latitude >= -90 and latitude <= 90),

  constraint user_locations_longitude_check
    check (longitude >= -180 and longitude <= 180)
);

create unique index user_locations_user_id_unique
  on public.user_locations(user_id);

create index user_locations_location_point_gix
  on public.user_locations
  using gist (location_point);

create table public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  platform text not null,
  device_token text not null,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_devices_platform_check
    check (platform in ('android', 'ios'))
);

create unique index user_devices_device_token_unique
  on public.user_devices(device_token);

create index user_devices_user_id_idx
  on public.user_devices(user_id);

create table public.emergency_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  priority public.emergency_priority not null default 'medium',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index emergency_categories_slug_unique
  on public.emergency_categories(slug);

insert into public.emergency_categories (name, slug, description, priority)
values
  ('Medical Help', 'medical-help', 'Medical assistance needed.', 'critical'),
  ('Accident', 'accident', 'Road, vehicle, or physical accident.', 'critical'),
  ('Unsafe Situation', 'unsafe-situation', 'Harassment, threat, or unsafe situation.', 'high'),
  ('Fire', 'fire', 'Fire or smoke emergency.', 'critical'),
  ('Vehicle Breakdown', 'vehicle-breakdown', 'Urgent vehicle breakdown help.', 'medium'),
  ('Lost Person', 'lost-person', 'Lost person or missing companion help.', 'high'),
  ('Other', 'other', 'Other urgent assistance request.', 'medium')
on conflict (slug) do nothing;

create table public.emergencies (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.user_profiles(id) on delete cascade,
  category_id uuid not null references public.emergency_categories(id),
  title text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  location_point geography(point, 4326) not null,
  radius_km double precision not null default 5,
  status public.emergency_status not null default 'active',
  priority public.emergency_priority not null default 'medium',
  resolved_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint emergencies_latitude_check
    check (latitude >= -90 and latitude <= 90),

  constraint emergencies_longitude_check
    check (longitude >= -180 and longitude <= 180),

  constraint emergencies_radius_check
    check (radius_km > 0 and radius_km <= 50)
);

create index emergencies_requester_id_idx
  on public.emergencies(requester_id);

create index emergencies_category_id_idx
  on public.emergencies(category_id);

create index emergencies_status_idx
  on public.emergencies(status);

create index emergencies_created_at_idx
  on public.emergencies(created_at desc);

create index emergencies_location_point_gix
  on public.emergencies
  using gist (location_point);

create table public.emergency_responders (
  id uuid primary key default gen_random_uuid(),
  emergency_id uuid not null references public.emergencies(id) on delete cascade,
  responder_id uuid not null references public.user_profiles(id) on delete cascade,
  status public.responder_status not null default 'accepted',
  accepted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint emergency_responders_unique
    unique (emergency_id, responder_id)
);

create index emergency_responders_emergency_id_idx
  on public.emergency_responders(emergency_id);

create index emergency_responders_responder_id_idx
  on public.emergency_responders(responder_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  emergency_id uuid references public.emergencies(id) on delete set null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  sent_at timestamptz,
  read_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx
  on public.notifications(user_id);

create index notifications_emergency_id_idx
  on public.notifications(emergency_id);

create index notifications_status_idx
  on public.notifications(status);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.user_profiles(id) on delete cascade,
  emergency_id uuid references public.emergencies(id) on delete cascade,
  reported_user_id uuid references public.user_profiles(id) on delete cascade,
  reason text not null,
  description text,
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),

  constraint reports_target_check
    check (
      emergency_id is not null
      or reported_user_id is not null
    )
);

create index reports_reporter_id_idx
  on public.reports(reporter_id);

create index reports_emergency_id_idx
  on public.reports(emergency_id);

create index reports_reported_user_id_idx
  on public.reports(reported_user_id);

create index reports_status_idx
  on public.reports(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

create trigger set_user_devices_updated_at
before update on public.user_devices
for each row
execute function public.set_updated_at();

create trigger set_emergency_categories_updated_at
before update on public.emergency_categories
for each row
execute function public.set_updated_at();

create trigger set_emergencies_updated_at
before update on public.emergencies
for each row
execute function public.set_updated_at();

create trigger set_emergency_responders_updated_at
before update on public.emergency_responders
for each row
execute function public.set_updated_at();

create or replace function public.build_location_point()
returns trigger
language plpgsql
as $$
begin
  new.location_point = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$;

create trigger build_user_location_point
before insert or update of latitude, longitude on public.user_locations
for each row
execute function public.build_location_point();

create trigger build_emergency_location_point
before insert or update of latitude, longitude on public.emergencies
for each row
execute function public.build_location_point();

alter table public.user_profiles enable row level security;
alter table public.user_locations enable row level security;
alter table public.user_devices enable row level security;
alter table public.emergency_categories enable row level security;
alter table public.emergencies enable row level security;
alter table public.emergency_responders enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;