<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run lint` — runs `eslint` (flat config, ESLint 9). This is **not** `next lint`; don't run `next lint`.
- Typecheck: `npx tsc --noEmit` (there is no `typecheck` script).
- No test framework is configured — don't invent test commands.

## Stack notes

- Next.js 16.2.10 (App Router) + React 19.2.4. TypeScript strict, `noEmit`, `moduleResolution: bundler`.
- Path alias `@/*` maps to the repo root (`./*`), not `src/`.
- Tailwind CSS v4: configured inline via `@import "tailwindcss"` + `@theme` in `app/globals.css` and the `@tailwindcss/postcss` plugin. There is **no** `tailwind.config.ts`; do not create one.

## Project context

- `open-daycare`: a Spanish-language daycare management app (staff + family/parent flows). UI copy is in Spanish.
- `app/page.tsx` is still the default create-next-app scaffold — the real UI has not been built yet.
- `references/pantallas/*.dc.html` are the design source of truth for each screen; open `references/pantallas/index.dc.html` for the catalog of 15 screens. `references/screenshots/*.png` are rendered previews. Implement against these: fonts are Fredoka (headings) + Nunito (body) on a warm palette (background `#f6ecdf`, accent `#d9583c`/`#f2937a`, staff blue `#2e89a6`, family purple `#7b5fc0`).

## Backend: Supabase

- Supabase is the backend. Project ref `qzvutyhfgmoohiditlli` (`https://qzvutyhfgmoohiditlli.supabase.co`), reachable through the **Supabase MCP server** — prefer MCP over the CLI/Management API.
- Current state: **zero tables and zero migrations applied** in `public`. The schema is still to be designed; the data model reference lives in the `docs` reference (`../07-DB-Schema`).
- `@supabase/supabase-js` and `@supabase/ssr` are **not installed yet**. Env: `.env`/`.env.template` currently only define `SUPABASE_DB_PASSWORD`. Anything the app needs (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be added to `.env.template` when introduced.
- No `supabase/` directory and the Supabase CLI is not installed — don't assume `supabase link`, `supabase start`, or local stack commands work.
- MCP workflow conventions:
  - DDL / schema / migration changes → `supabase_apply_migration` (with a `snake_case` name), **never** `supabase_execute_sql`.
  - Read-only inspection and data queries → `supabase_execute_sql`, `supabase_list_tables`, `supabase_list_migrations`, `supabase_list_extensions`.
  - After DDL changes, run `supabase_get_advisors` (both `security` and `performance`) and fix what it reports.
  - Debug unexpected behavior with `supabase_query_logs` (ClickHouse, max 24h window; always pass explicit ISO start/end).
  - For risky/experimental DB work prefer a dev branch: `supabase_create_branch` → work → `supabase_merge_branch` / `supabase_delete_branch`.
  - Never commit secrets. `SUPABASE_DB_PASSWORD` and any `service_role`/secret key stay in `.env` only.
- Non-negotiable Supabase rules (see the `supabase` skill for the full list): enable RLS on every table in exposed schemas, grant Data API access explicitly when needed, never authorize on `user_metadata`, always pair `TO authenticated` with an ownership predicate, use `WITH (security_invoker = true)` on views, and use the `TO` clause instead of the deprecated `auth.role()`.

## MCPs

- Playwright: screenshots and any Playwright output go in `.playwright-mcp/` (gitignored).
- Context7: use it to fetch current framework docs instead of relying on training data.
- Supabase: schema/migrations, data queries, advisors, and logs — see **Backend: Supabase** above.

## Agents

- `spec-verifier`: Verifies acceptance criteria of a spec file. Reviews implementation against each criterion, fixes code/spec issues found, and marks checkboxes. Uses Playwright MCP with vision to compare screenshots against references, and Context7 MCP to validate Next.js best practices.

## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl Usaremos esta skill para hacer las implementaciones.
- /verify-spec Usaremos este comando para verificar los criterios de aceptación de una spec.

## Skills (installed under `.agents/skills/`, mirrored as junctions in `.claude/skills/`)

Load a skill with the `skill` tool when the task matches it.

- `supabase` (from `supabase/agent-skills`, v0.1.2) — **use for any Supabase work**: DB/Auth/Storage/Realtime/Edge Functions/Cron/Queues/Vectors, `supabase-js`/`@supabase/ssr` integrations, auth/session/JWT/cookies, CLI/MCP, schema changes, migrations, security audits, RLS, Postgres extensions, error troubleshooting, and log queries. Also fetch `https://supabase.com/changelog.md` first — Supabase breaks things between versions.
- `supabase-postgres-best-practices` (from `supabase/agent-skills`, v1.1.1) — **load before writing any SQL**: table/column design, constraints, migrations, indexes, RLS policies, triggers, functions, pg_cron/pgmq, pgvector, plus diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking and bloat. Detailed rules live in `.agents/skills/supabase-postgres-best-practices/references/` (`query-*`, `conn-*`, `security-*`, `schema-*`, `lock-*`, `data-*`, `monitor-*`, `advanced-*`).
- `spec` / `spec-impl` — spec-driven workflow described above.

## Reglas de código

- Usar código limpio, nombres, funciones, variables, etc. en inglés.
