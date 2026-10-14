-- supabase/migrations/20261003031517_add_updated_at_trigger.sql

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger daycares_set_updated_at
before update on public.daycares
for each row
execute function public.set_updated_at();
