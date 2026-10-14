-- supabase/migrations/20261003030229_create_daycares.sql

create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daycares_name_check check (length(btrim(name)) > 0)
);

comment on table public.daycares is
  'Daycare centers: root tenant entity. Membership policies arrive with the users migration.';

alter table public.daycares enable row level security;
