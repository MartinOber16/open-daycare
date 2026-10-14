# SPEC 07 — Tabla `daycares` y patrón de migraciones

> **Estado:** Aprobado
> **Depende de:** — (sin specs previas; es la primera spec de backend)
> **Referencia de datos:** `docs` → `opendaycare-database-schema.md`, tabla 1 `daycares`
> **Fecha:** 2026-10-03
> **Objetivo:** Dejar la tabla `daycares` creada en Supabase, con su DDL versionado en `supabase/migrations/*.sql`, el trigger `set_updated_at()` aplicado y el patrón de migraciones documentado en `AGENTS.md`.

## Scope

**In:**

- Baseline versionado de la tabla ya aplicada en Supabase: `supabase/migrations/20261003030229_create_daycares.sql` con el DDL exacto que está en la base (id uuid PK default gen_random_uuid(), name text not null con check, created_at / updated_at timestamptz default now(), comment de tabla, `enable row level security`). El archivo se regenera desde cero en la implementación.
- Convención de nombres de archivo: `<version>_<snake_case>.sql`, donde `<version>` es el timestamp que devuelve `supabase_apply_migration`.
- Nueva migración `set_updated_at`: función trigger en `public` (`security invoker`, `set search_path = ''`) que asigna `new.updated_at := now()`, más un trigger `before update` sobre `daycares`. Queda disponible para que las tablas siguientes la reutilicen.
- Actualizar `AGENTS.md`: documentar el patrón (SQL en git + apply vía MCP), el estado real del schema (tabla `daycares` creada, RLS on, sin políticas) y corregir las líneas que dicen "zero tables and zero migrations applied" y "No `supabase/` directory".
- Verificación: introspección de columnas/defaults/constraints/trigger, fila de prueba insertada y borrada, y `supabase_get_advisors` (security + performance) sin avisos nuevos.

**Out of scope (para specs futuras):**

- Políticas RLS de `daycares`. Sin `users` no hay forma de evaluar pertenencia; llegan con la spec de `users`, como anticipa el comment de la tabla.
- `revoke` explícito de los grants por defecto a `anon` / `authenticated`. Con RLS on y cero políticas la tabla ya es inaccesible para ambos.
- Los enums del dominio (`user_role`, `user_status`, `relationship_type`, `invitation_status`, `post_type`, `child_status`).
- Seed permanente de datos. La fila de prueba se borra al terminar la verificación.
- Cliente de Supabase en Next.js: `@supabase/supabase-js`, `@supabase/ssr`, variables en `.env.template`. Va en la spec de setup de auth.
- El resto de las tablas del diccionario: `users`, `rooms`, `children`, `parent_children`, `invitations`, `posts`, `post_children`, `post_photos`, `reactions`, `comments`, `daily_summaries`, `devices`.

## Data model

No hay estructuras de datos en la app todavía (no hay cliente Supabase). Lo que introduce esta spec son las estructuras en Postgres y el layout de migraciones en git.

### Layout de migraciones

```text
supabase/
  migrations/
    <version>_<snake_case>.sql
```

Un archivo por migración aplicada, en el mismo orden que el historial remoto. `<version>` es el timestamp que devuelve `supabase_apply_migration`; si el archivo se escribe antes de aplicar, se renombra con la versión devuelta.

### Migración 1 — `daycares` (baseline, ya aplicada en remoto)

```sql
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
```

### Migración 2 — `set_updated_at`

```sql
-- supabase/migrations/<version>_add_updated_at_trigger.sql

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
```

Convenciones:

- Tablas y columnas en `snake_case` y en inglés. Las etiquetas visibles al usuario se traducen en la capa de UI.
- PK `id uuid` con `gen_random_uuid()`; `created_at` / `updated_at` como `timestamptz not null default now()`.
- El check de `name` rechaza vacío y solo espacios: `length(btrim(name)) > 0`.
- La función trigger es `security invoker` con `set search_path = ''`. No necesita `security definer` (solo escribe en la fila que Postgres le pasa) y el `search_path` fijo evita el hijacking. `now()` resuelve por `pg_catalog`, que siempre está implícito.
- `create or replace function` para que la migración sea re-aplicable; el trigger lleva nombre explícito `<tabla>_set_updated_at`.

## Implementation plan

1. **Baseline de `daycares` en git.** Borrar el borrador `supabase/migrations/20261003030229_create_daycares.sql` y escribirlo de nuevo con el SQL de la sección Data model, sin cambios respecto de la tabla ya aplicada.
   - _Prueba: `supabase_list_tables` (verbose) sobre `public.daycares` devuelve `id` / `name` / `created_at` / `updated_at` con los mismos tipos, nullability, defaults y constraints que el archivo._

2. **Aplicar el trigger `set_updated_at`.** `supabase_apply_migration` con nombre `add_updated_at_trigger` y el SQL de la sección Data model (función + trigger).
   - _Prueba: `supabase_list_migrations` muestra `add_updated_at_trigger` con una versión nueva, y la consulta de `pg_trigger` sobre `public.daycares` devuelve una fila `daycares_set_updated_at`._

3. **Versionar la segunda migración.** Crear `supabase/migrations/<version>_add_updated_at_trigger.sql` usando la versión que devolvió el paso 2, con el mismo SQL aplicado.
   - _Prueba: los dos archivos de `supabase/migrations/` están en el mismo orden y con los mismos nombres que las dos migraciones del historial remoto._

4. **Verificar el comportamiento del trigger.** Con `supabase_execute_sql`: insertar una fila de prueba, leer su `updated_at`, hacer `update` del `name`, leer `updated_at` de nuevo, y borrar la fila.
   - _Prueba: el segundo `updated_at` es mayor que el primero y la tabla vuelve a 0 filas._

5. **Advisors.** `supabase_get_advisors` con tipo `security` y con tipo `performance`.
   - _Prueba: no hay avisos nuevos atribuibles a esta spec; si aparece alguno, se corrige con una migración nueva en vez de editar la anterior._

6. **Documentar el patrón.** Actualizar `AGENTS.md`: el patrón de migraciones (un archivo SQL en `supabase/migrations/` por migración, aplicado vía MCP con `supabase_apply_migration`), el estado real del schema (`daycares` creada, RLS on, sin políticas, trigger `set_updated_at`), y corregir las líneas que dicen "zero tables and zero migrations applied" y "No `supabase/` directory".
   - _Prueba: releer la sección de AGENTS.md y contrastarla con `supabase_list_migrations` y `supabase_list_tables`; no puede contradecir lo que devuelve la base._

## Acceptance criteria

- [ ] `supabase/migrations/20261003030229_create_daycares.sql` existe y su DDL coincide con la tabla aplicada: `id uuid` PK default `gen_random_uuid()`, `name text` not null, `created_at` / `updated_at timestamptz not null default now()`, check `length(btrim(name)) > 0` con nombre `daycares_name_check`, comment de tabla y RLS habilitado.
- [ ] `supabase/migrations/<version>_add_updated_at_trigger.sql` existe con el mismo SQL que está aplicado en la base.
- [ ] Los nombres de los dos archivos corresponden a las dos migraciones del historial remoto (`20261003030229_create_daycares` y `add_updated_at_trigger`).
- [ ] `supabase_list_migrations` devuelve exactamente 2 migraciones.
- [ ] `public.daycares` tiene RLS habilitado y 0 políticas.
- [ ] Existe la función `public.set_updated_at()` con `security invoker` y `search_path` vacío, y el trigger `daycares_set_updated_at` (`before update`, `for each row`) sobre `public.daycares`.
- [ ] Un `update` que solo cambia `name` modifica `updated_at` sin que el `update` lo mencione.
- [ ] Un `insert` con `name = '   '` es rechazado por `daycares_name_check`.
- [ ] `public.daycares` tiene 0 filas al terminar.
- [ ] `supabase_get_advisors` (security y performance) no reporta ningún aviso que mencione `set_updated_at`, ni ningún aviso de nivel `WARN` o `ERROR` atribuible a esta spec. El `INFO` `rls_enabled_no_policy` sobre `daycares` es esperado y no cuenta como incumplimiento: es consecuencia directa de no tener políticas todavía, y se resuelve en la spec de `users`.
- [ ] `AGENTS.md` documenta el patrón: un archivo SQL en `supabase/migrations/` por migración, aplicado con `supabase_apply_migration`.
- [ ] `AGENTS.md` ya no dice "zero tables and zero migrations applied" ni "No `supabase/` directory", y el estado de schema que describe coincide con `supabase_list_tables`.

## Decisions

- **Sí:** el archivo del baseline se llama `20261003030229_create_daycares.sql`, con la versión remota real. Motivo: `supabase migration list` puede matchear local contra remoto. La alternativa era un timestamp propio, que desalinea el historial.
- **Sí:** el DDL del baseline se escribe tal cual está aplicado, sin mejorarlo. El archivo documenta lo que se aplicó, no lo que se hubiera aplicado. Por eso `updated_at` se mantiene aunque la tabla 1 del diccionario solo liste `created_at`: la cabecera del doc fija `created_at` / `updated_at` como convención.
- **No:** drop + recreate de `daycares` para demostrar el ciclo completo de migración. La tabla está vacía y es correcta; recrearla solo agrega ruido al historial remoto.
- **No:** enums del dominio en esta spec. Ninguna columna los usa todavía; se crean junto con la primera tabla que los consuma (`users` para `user_role` / `user_status`, `children` para `child_status`).
- **Sí:** `set_updated_at()` como función compartida en `public`, no un trigger por tabla. Una sola definición reutilizable para `rooms`, `children`, `posts` y el resto.
- **No:** `security definer` para la función trigger. No lee ni escribe fuera de la fila que Postgres le pasa. Además, una función `SECURITY DEFINER` en `public` es ejecutable por `anon` y `authenticated` (heredan `EXECUTE` de `PUBLIC`), así que además de innecesario sería una superficie de ataque.
- **No:** políticas RLS en `daycares` ahora. Sin `users` no hay forma de evaluar "esta guardería es la mía", y una policy `USING (true)` abriría la lectura a cualquier usuario autenticado (BOLA). Se agregan en la spec de `users`, como anticipa el comment de la tabla.
- **No:** `revoke` explícito a `anon` / `authenticated`. Con RLS on y cero políticas la tabla ya es inaccesible para ambos roles; los grants por defecto no exponen nada por sí solos.
- **Sí:** SQL de migraciones en git, aplicado con `supabase_apply_migration`. El SQL queda versionado y auditable en el repo, y el MCP evita tener que linkear la CLI al proyecto remoto.
- **No:** Supabase CLI (`supabase link` + `supabase db push`). Exige `SUPABASE_DB_PASSWORD` y credenciales del proyecto para algo que el MCP ya resuelve. La CLI sigue disponible vía `npx supabase` por si más adelante se quiere el stack local.
- **No:** seed permanente de una guardería. La fila de verificación se borra; la primera guardería real la crea el flujo de setup de la app.

## Risks

| Riesgo                                                           | Mitigación                                                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| El timestamp del archivo local no coincide con la versión remota | Se renombra con la versión que devuelve `supabase_apply_migration` (paso 3) y `supabase_list_migrations` contrasta ambos historiales. |
| Editar el archivo baseline para meterle algo nuevo               | Los cambios van siempre en una migración nueva. Editar un archivo ya aplicado produce drift invisible entre git y la base.            |
| Re-ejecutar el baseline sobre una base que ya tiene la tabla     | Falla con "relation already exists". Es intencional: las migraciones no son idempotentes. Sobre una base nueva el archivo funciona.   |
| Cambiar la firma de `set_updated_at()` en el futuro              | `create or replace` no actualiza los triggers ya enganchados. Si cambia la firma, migración nueva con `drop trigger` + recreación.    |
| Filas con `updated_at` desactualizado de antes del trigger       | No hay backfill: la tabla tiene 0 filas. Si alguna tabla futura nace con datos, el backfill va en su propia migración.                |

## What is **not** in this spec

- Políticas RLS de `daycares` (llegan con la spec de `users`).
- Los enums del dominio.
- `revoke` de grants a `anon` / `authenticated`.
- Seed permanente de datos.
- Cliente de Supabase en Next.js y variables en `.env.template`.
- El resto de las tablas del diccionario.

Cada uno de esos, si llega, va en su propia spec.
