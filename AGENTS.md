<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MCPs

- Playwright Screenshots y cualquier cosa relacionada a Playwright tiene que estar en la carpeta .playwright-mcp
- Context7 Usaremos este MCP para traer la documentación actualizada del framework.

# Comandos

- `npm run dev` — servidor de desarrollo en el puerto 3000.
- `npm run lint` — ESLint (config flat en `eslint.config.mjs`).
- `npm run build` — es el único typecheck. No hay script de typecheck aparte ni test framework instalado.

# Flujo de trabajo: desarrollo guiado por specs

- Para cualquier funcionalidad relevante, usa los skills del repo — [`/spec`](.agents/skills/spec/SKILL.md) para diseñar y [`/spec-impl`](.agents/skills/spec-impl/SKILL.md) para implementar — en lugar de escribir código directamente.
- Las specs viven en `specs/`, numeradas `NN-slug.md` (secuencial desde la más alta existente; `specs/` aún no existe). Escritas en español, acorde al idioma del repo.
- `/spec-impl` solo trabaja sobre specs cuyo estado significa "Approved"; crea la rama git `spec-NN-slug` e implementa paso a paso, pausando para revisar los diffs. Nunca commitea automáticamente — el commit es decisión del usuario.
- `/spec-verify NN-slug` delega en el agente [`spec-verifier`](.opencode/agent/spec-verifier.md), que recorre los criterios de aceptación de la spec, los verifica con lint/build, Playwright y visión, marca los checks que pasan y repara el código cuando algo falla. Tampoco commitea.

# Fuente de verdad del diseño

- `references/pantallas/*.dc.html` son los mockups de UI de la app (pantallas de guardería: index, login, feed, niños, avisos, …). Sigue su layout, textos y estilos al construir UI.
- Son comps HTML estáticos (cargados vía `support.js` con CSS embebido). No los edites ni copies su infraestructura de `<style>` inline dentro de la app.
- Sistema de diseño: tipografías Fredoka (títulos) y Nunito (cuerpo) de Google Fonts; fondo crema cálido `#f6ecdf` con texto marrón oscuro `#3f362e`.
- `references/screenshots/*.png` son capturas de referencia.

# Particularidades de la app

- Next.js 16 App Router, React 19, TypeScript strict, alias de rutas `@/*` → raíz del repo.
- Tailwind CSS v4: `@import "tailwindcss"` en `app/globals.css` con tokens `@theme` — no hay `tailwind.config`. Usa sintaxis v4; consulta la doc v4 vía Context7 si tienes dudas.
- Textos de UI y documentación en español.
- `opencode.json` solo registra el MCP local de Playwright; no hay archivos de instrucciones extra.
- `CLAUDE.md` simplemente referencia este archivo.