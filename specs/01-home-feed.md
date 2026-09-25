# SPEC 01 — Feed de la guardería en la ruta `/`

> **Estado:** Aprobado
> **Depende en:** —
> **Fecha:** 2026-09-25
> **Objetivo:** Convertir la pantalla `references/pantallas/feed.dc.html` en la ruta `/` de la app, replicando su diseño con Tailwind y datos mock, sin autenticación ni base de datos.

## Por qué existe esta spec

Es la primera pantalla real de la app y la que fija el vocabulario visual (paleta, tipografías, radios, sombras) que las otras 14 pantallas de `references/pantallas/` van a reutilizar. Si los colores viven como valores arbitrarios en el JSX, cada pantalla siguiente los re-inventa.

## Alcance

**Dentro:**

- La ruta `/` renderiza el feed del mockup: sidebar, header, barra de composición, separador "PUBLICADO HOY" y 3 tarjetas de publicación.
- Tokens de diseño en `app/globals.css` (`@theme` de Tailwind v4) con la paleta y las familias tipográficas del mockup.
- Fredoka + Nunito vía `next/font/google` en `app/layout.tsx`, `lang="es"` y metadata de OpenDayCare.
- 3 publicaciones mock tipadas en `lib/mock/feed.ts` (milestone, activity con foto, announcement).
- Like local con `useState` en cada tarjeta (sin persistencia).
- Layout responsive: sidebar fijo desde 1024px; header con hamburguesa + drawer lateral con overlay por debajo.
- Links de navegación sin ruta real renderizados como elementos no navegables (mismo estilo, sin `href`).

**Fuera de alcance (specs futuras):**

- Autenticación, login, activación de cuenta, roles.
- Base de datos, API, server actions, mutaciones.
- `/ninos`, `/avisos`, `/mi-cuenta`, `/crear-publicacion`, detalle de publicación, visor de foto, resumen del día, feed de familia, perfil de niño.
- Persistencia de likes, comentarios, subida de fotos.
- Estados vacíos, de error y de carga.
- Favicon e identidad definitiva de marca.

## Modelo de datos

`lib/mock/feed.ts` — sin persistencia, sin I/O. Tipos exportados para que la spec que traiga datos reales los reutilice.

```ts
export type PostType = 'milestone' | 'activity' | 'announcement';
export type AvatarPalette = 'child' | 'staff' | 'system';

export interface Author {
	name: string; // "Mateo" | "Anuncio general"
	meta: string; // "14:20 · publicado por vos"
	initial?: string; // "M" — ausente cuando hay icono
	icon?: 'megaphone'; // presente solo en posts de sistema
	palette: AvatarPalette;
}

export interface Post {
	id: string;
	type: PostType;
	author: Author;
	audience: string; // "Para: familia de Mateo"
	body: string;
	photo?: { alt: string }; // presente solo en el post de actividad
	likes: number; // 3, 5, 8
	liked: boolean; // true: el mockup muestra los corazones llenos
	comments: number; // 1, 2, 0
}

export interface Session {
	name: string; // "Caro Giménez"
	role: string; // "Maestra · Soles"
	initial: string; // "C"
	classroom: string; // "Sala Soles"
	childrenCount: number; // 12
	date: string; // "martes 17 jun" → se renderiza "12 niños · martes 17 jun"
}

export const session: Session;
export const posts: Post[]; // exactamente 3, en orden: milestone, activity, announcement
```

El badge de tipo se deriva de `type` con un mapa de estilos en `components/post-card.tsx` (milestone `#CFEBD8`/`#3E9B6C`, activity `#C7E7F1`/`#2E89A6`, announcement `#CCD8F4`/`#4E72C8`). El avatar se deriva de `palette` (child `#A9D9E8`/`#1F7A93`, staff `#F2937A`/blanco, system `#CCD8F4` con megáfono). Ningún color de badge o avatar va en los datos.

`app/globals.css` — dos bloques de tema:

```css
@theme {
	/* colores literales */
	--color-cream: #f6ecdf;
	--color-card: #fffdf9;
	--color-border: #ece0d0;
	--color-border-soft: #f0e6d8;
	--color-divider: #e7dac8;
	--color-brown: #3f362e;
	--color-brown-body: #4a4038;
	--color-text-soft: #a89a8b;
	--color-text-faint: #94887b;
	--color-text-nav: #6e6359;
	--color-text-today: #8a7c6d;
	--color-terracotta: #d9583c;
	--color-terracotta-strong: #c5503a;
	--color-heart: #e0654a;
	--color-coral-soft: #fbe3d8;
	--color-orange: #f2937a;
	--color-orange-soft: #f8c3a8;
	--color-orange-button: #ee8164;
	--color-amber: #f4ece1;
	--color-photo-frame: #dbcdba;
	--color-photo-text: #b0a290;
	--color-green: #3e9b6c;
	--color-green-soft: #cfebd8;
	--color-sky: #2e89a6;
	--color-sky-soft: #c7e7f1;
	--color-indigo: #4e72c8;
	--color-indigo-soft: #ccd8f4;
	--color-avatar-child: #a9d9e8;
	--color-avatar-child-text: #1f7a93;
}

@theme inline {
	/* fuentes: resuelven la variable de next/font */
	--font-fredoka: var(--font-fredoka-src);
	--font-nunito: var(--font-nunito-src);
}
```

En `app/layout.tsx`, `next/font/google` declara las variables con sufijo `-src` (`Fredoka` con `weight: ["500","600"]`, `Nunito` con `weight: ["400","600","700","800"]`, `subsets: ["latin"]`). El sufijo evita la colisión entre la variable de next/font y el token del tema. `body` queda `min-h-full bg-cream font-nunito text-brown antialiased`. Se borran los tokens `--background`/`--foreground` y el bloque `prefers-color-scheme: dark` de create-next-app. El scrollbar custom (10px, thumb `#E4D6C4`, radio 8px, `background-clip: content-box`) va como CSS plano en `globals.css`: no es una utility de Tailwind.

Valores de layout que no se negocian (del mockup, copiados textualmente): wrapper `flex min-h-100vh`; aside 248px, `padding 24px 16px`, `sticky top-0 h-100vh`, bg card, `border-r` border; nav items `padding 11px 12px` radio 12px, activo bg coral-soft + terracotta `font-extrabold`, inactivo text-nav `font-semibold`; main `flex-1 min-w-0 h-100vh overflow-y-auto`; contenido `max-w-760px` `padding 34px 40px 80px`; tarjeta `padding 20px 22px` radio 20px sombra `0 4px 16px -12px rgba(120,90,60,.5)`; barra de composición radio 18px `padding 14px 18px`; separador `mb-14px` con línea `1px` divider; posts `gap-16px`; pie de tarjeta `mt-16px pt-14px border-t` border-soft `gap-18px`; bloque de foto `h-200px` borde punteado 1.5px photo-frame sobre amber; CTA gradiente `180deg #f4977e→#ee8164` radio 14px sombra `0 8px 18px -8px rgba(238,129,100,.75)`; marca gradiente `155deg #f8c3a8→#f2937a`. Sin estilos hover: el feed del mockup no los tiene.

## Plan de implementación

Antes de escribir código, leer `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`, `.../14-metadata-and-og-images.md` y `03-api-reference/02-components/link.md` (regla de `AGENTS.md`: esta versión de Next tiene breaking changes). Fredoka y Nunito están confirmados en el catálogo de `next/font/google` de next 16.3.6.

1. **`app/globals.css`**: los dos bloques `@theme`, estilos de `body` y scrollbar custom; borrar el boilerplate de create-next-app. Verificar: `npm run dev` muestra el fondo cream.
2. **`app/layout.tsx`**: Fredoka + Nunito con variables `-src`, `lang="es"`, `title: "OpenDayCare"`, `description: "Muro de la guardería · Sala Soles"`, clases de body nuevas. Verificar: los `h1` se ven en Fredoka.
3. **`lib/mock/feed.ts`**: tipos + `session` + `posts` con los textos exactos del mockup. Sin componente todavía.
4. **`components/icons.tsx`**: 14 iconos (marca, plus, casa, niños, campana, usuario, logout, corazón, comentario, cámara, imagen, megáfono, menú, X) como `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">` **sin** `width`/`height`: el tamaño sale de `size-*` de Tailwind.
5. **`components/post-card.tsx`** (`"use client"`): tarjeta completa, mapa de estilos por `type`, bloque de foto condicional, like con `useState(post.liked)` + `useState(post.likes)`; el corazón alterna `fill-heart` / `fill-none`.
6. **`components/sidebar.tsx`** (`"use client"`): exporta `SidebarContent({ onNavigate })` (marca, CTA, nav, bloque de usuario) y `Sidebar` (el `<aside>` de desktop). El array de navegación vive acá, con `href: string | null`: `Feed` → `/` (navega), el resto → `null` (se renderizan como `<span>` sin `href`).
7. **`app/page.tsx`** (server component): wrapper flex, `<Sidebar />`, `<main>` con header, barra de composición, separador y `posts.map(...)`. Importa los datos y los pasa por props a los componentes cliente. Verificar a 1440x900 contra el mockup.
8. **`components/mobile-nav.tsx`** (`"use client"`) + wiring en `page.tsx`: header pegajoso (`sticky top-0`, marca + hamburguesa) visible solo `<lg`, drawer `fixed inset-y-0 left-0 w-72` con `translate-x` + `transition`, overlay `bg-black/40`, botón X, `aria-expanded`/`aria-controls` en la hamburguesa. Cierra con overlay, X, `Escape` (un `useEffect` de `keydown`) y con cualquier click en un item del nav. Visible solo `<lg`, así que el aside de desktop queda intacto.
9. **Verificación**: `npm run lint` y `npm run build` limpios, y tres capturas con Playwright en `.playwright-mcp/` a 1440x900, 768x1024 y 390x844.

## Criterios de aceptación

- [ ] `npm run dev` renderiza `/` sin errores ni warnings en la consola del navegador.
- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] A 1440x900 el aside mide 248px, con fondo `#FFFDF9` y borde derecho `#ECE0D0`.
- [ ] El contenido principal tiene 760px de ancho máximo y está centrado.
- [ ] Las 3 tarjetas tienen radio 20px, fondo `#FFFDF9` y la sombra `0 4px 16px -12px rgba(120,90,60,.5)`.
- [ ] "OpenDayCare", "Buenas, Caro" y los nombres de niño se renderizan en Fredoka; el resto del texto en Nunito.
- [ ] Aparecen exactamente 3 publicaciones, en orden milestone → activity → announcement, bajo el separador "PUBLICADO HOY", y solo la de actividad tiene el bloque de foto punteado.
- [ ] Los badges se ven verde (milestone), celeste (activity) e índigo (announcement).
- [ ] Los corazones arrancan llenos con 3, 5 y 8; al clickear el primero el contador pasa a 2 y el corazón queda vacío; al recargar vuelve a 3 y lleno.
- [ ] El bloque "Para: familia de Mateo" / "Para: toda la sala" se muestra en las 3 tarjetas.
- [ ] `/ninos`, `/avisos`, `/mi-cuenta`, "Nueva publicación", "Editar", el logout, el link de comentarios y el bloque de foto se ven con el estilo del mockup pero no navegan: no tienen `href` y no existen rutas que devuelvan 404.
- [ ] La marca del sidebar navega a `/`.
- [ ] A 390x844 no se ve el aside, aparece un header pegajoso con la marca y una hamburguesa, y no hay scroll horizontal.
- [ ] La hamburguesa abre un drawer con el CTA, los 4 items de nav y el bloque de usuario; el overlay, la X y `Escape` lo cierran.
- [ ] A 768x1024 el contenido no desborda horizontalmente.
- [ ] La captura de `/` a 1440x900 es indistinguible a simple vista de `references/screenshots/feed.png`.
- [ ] El navegador no pide nada a `fonts.googleapis.com` ni a `fonts.gstatic.com` (self-hosting de next/font).

## Decisiones

- **Sí:** identificadores en inglés (tipos, campos, tokens, props, rutas de archivo) y textos de UI en español. El código se comparte con un repo en español donde los términos de dominio se traducen mal, y los datos de la app son todos de la UI.
- **Sí:** tokens `@theme` en `globals.css` en vez de `bg-[#F6ECDF]`. Es el vocabulario que las 15 pantallas van a compartir; los valores arbitrarios se repiten y divergen.
- **Sí:** los tokens llevan traducción literal del color (`cream`, `brown`, `terracotta`, `coral-soft`, `photo-frame`), no nombres semánticos. El diseño es claro único y de color fijo, así que el nombre literal del color documenta el hex contra el mockup.
- **Sí:** colores literales en `@theme`, fuentes en `@theme inline` (solo ellas necesitan resolver otra variable).
- **Sí:** variables de next/font con sufijo `-src` para no colisionar con los tokens `--font-fredoka` / `--font-nunito`.
- **No:** el bloque `prefers-color-scheme: dark` de create-next-app. El diseño es claro únicamente; dejarlo hace el feed ilegible si el sistema está en dark.
- **Sí:** datos mock en `lib/mock/feed.ts` con tipos exportados. La spec de datos reales los importa y no toca los componentes.
- **No:** los datos inline en `page.tsx`, o un componente por tarjeta con texto hardcodeado.
- **Sí:** elementos sin ruta como `<span>` sin `href`. Cero 404 y cero stubs.
- **No:** páginas stub para `/ninos`, `/avisos` y `/mi-cuenta`. Cada pantalla es su propia spec.
- **Sí:** las rutas en español (`/ninos`, `/avisos`, `/mi-cuenta`) porque son las de los mockups, y `references/` no se edita.
- **Sí:** like con estado en el componente, sin persistencia.
- **No:** `localStorage` o `sessionStorage` para los likes. No hay usuario real todavía; persistir el like de un anónimo no significa nada.
- **Sí:** un solo `SidebarContent` reutilizado por el aside y el drawer, en lugar de duplicar el markup.
- **Sí:** drawer lateral con overlay, cierre por overlay, X y `Escape`.
- **No:** scroll-lock del body con el drawer abierto. El drawer entra completo en 390x844 y el overlay cubre el viewport; un `overflow: hidden` sobre body es un efecto extra sin ganancia.
- **No:** estilos hover. El feed del mockup no los tiene; el índice de pantallas sí, y ese comportamiento se decide cuando se implemente esa pantalla.
- **No:** los artefactos `<x-dc>`, `<helmet>` y `<template>` del mockup. Son del bundler de referencias.

## Riesgos

| Riesgo                                                                                                                                        | Mitigación                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next/font/google` necesita salida a `fonts.googleapis.com` en el primer build; sin red el build falla.                                       | Verificar temprano en el paso 2. Si el entorno no tiene red, caer a `<link>` a Google Fonts como en el mockup, o a fuentes locales en `public/`. |
| Los SVG del mockup están en atributos `width`/`height` fijos; copiarlos con esos atributos ignora `size-*` y rompe el layout flexible.        | Todos los iconos de `components/icons.tsx` se definen sin `width`/`height`; el tamaño sale siempre de `size-*`.                                  |
| El drawer necesita estado de cliente y la página era toda server; un `"use client"` mal puesto arrastra los datos mock al bundle del cliente. | `page.tsx` sigue siendo server component; solo `sidebar.tsx`, `post-card.tsx` y `mobile-nav.tsx` llevan `"use client"`.                          |

## Qué **no** entra en esta spec

- Autenticación, roles, login, activación de cuenta.
- Base de datos, API, server actions.
- Las otras 14 pantallas de `references/pantallas/`.
- Persistencia de likes, comentarios, subida de fotos.
- Estados vacíos, de error y de carga.

Cada una de esas, si aterriza, va en su propia spec.
