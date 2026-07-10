# AGENTS.md

Guia para agentes que trabajen en este repositorio.

## Reglas Criticas

- Nunca subir codigo a Git ni a GitHub sin instruccion expresa del usuario.
- Esta prohibido ejecutar por cuenta propia comandos como `git add`, `git commit`, `git push` o equivalentes.
- No revertir cambios existentes del usuario. Si hay un arbol de trabajo sucio, trabajar alrededor de esos cambios y preguntar solo si bloquean la tarea.
- No imprimir, copiar ni exponer secretos. Tratar `.env.local`, llaves de InsForge, Resend y tokens como informacion sensible.
- Antes de modificar archivos, inspeccionar el contexto cercano y respetar los patrones existentes.
- Redactar los artefactos OpenSpec futuros en espanol, salvo que el usuario pida otro idioma. Mantener solo los encabezados o palabras clave que OpenSpec necesite para parsear correctamente.

## Resumen Del Proyecto

Este repositorio es un CRM para agentes de seguros construido con Next.js App Router. Centraliza clientes, polizas/productos, documentos, agentes, reportes, ajustes de facturacion y recordatorios automaticos de pago.

Stack principal:

- Next.js `16.1.6` con App Router en `src/app`.
- React `19.2.3`.
- TypeScript estricto (`strict: true`).
- Tailwind CSS v4 con tokens CSS en `src/app/globals.css`.
- InsForge como backend, autenticacion, base de datos, storage y functions.
- Resend para envio de correos.
- `sonner` para toasts.
- `lucide-react` para iconos.
- `next-themes` para tema claro/oscuro.

## Comandos Usuales

- Instalar dependencias: `npm install`
- Desarrollo local: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Produccion local: `npm run start`

Version minima de Node: `>=20.9.0`.

Validar con `npm run lint` cuando se toque TypeScript, React, estilos, rutas o APIs. Usar `npm run build` cuando el cambio afecte rutas de Next, Server Components, middleware, variables de entorno o integraciones.

## Estructura Importante

- `src/app/`: rutas de Next.js App Router.
- `src/app/api/`: route handlers del servidor.
- `src/components/`: componentes reutilizables.
- `src/components/ui/`: primitives locales como `Button`, `Input`, `Select`, `ConfirmModal`.
- `src/components/layout/`: layout general y sidebar.
- `src/lib/insforge.ts`: cliente global de InsForge y helpers de sesion.
- `src/lib/utils.ts`: helper `cn` con `clsx` y `tailwind-merge`.
- `src/middleware.ts`: middleware de autenticacion InsForge.
- `public/`: assets estaticos.
- `testsprite_tests/`: planes y artefactos de TestSprite.
- Archivos raiz `automated-reminders-batch.js`, `send-reminder-email.js`, `automated_reminders_v2.js` y similares: scripts/funciones operativas relacionadas con recordatorios y despliegue.
- `.agent/` y `.agents/`: reglas, agentes, workflows y herramientas auxiliares locales. No asumir que todo ahi es codigo de la app.

## Variables De Entorno

El proyecto espera:

- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` cuando aplique
- `RESEND_API_KEY` para correos

No agregar nuevas credenciales hardcodeadas. Si un archivo existente tiene fallbacks sensibles, no replicar ese patron en codigo nuevo; preferir variables de entorno y manejo explicito de error si faltan.

## Backend Y Datos

InsForge es el backend principal. El proyecto no sigue un patron REST tradicional para todas las entidades; muchas operaciones usan el SDK:

```ts
insforge.database.from("clients").select("*")
```

Tablas relevantes vistas en el codigo y docs:

- `clients`
- `client_products`
- `client_documents`
- `reminder_settings`
- `reminder_logs`
- `billing_settings`
- `sent_messages`

Storage:

- Bucket `documents` para expedientes/documentos de clientes.

Practicas esperadas:

- Revisar `{ data, error }` en llamadas al SDK.
- En Server Components, lanzar error cuando falle una carga critica para que `src/app/error.tsx` maneje la recuperacion.
- En Client Components, usar `toast` de `sonner` y mensajes accionables.
- No confiar seguridad solo a filtros del frontend; RLS/politicas del backend deben proteger datos.
- Mantener filtros de negocio coherentes, por ejemplo polizas `Activa` y `Pendiente` en recordatorios.

## Autenticacion

- La app usa `@insforge/nextjs`.
- `src/middleware.ts` protege rutas y define public routes como `/login`, `/logged-out`, `/api/auth` y logout.
- `src/app/api/auth/route.ts` reescribe cookies quitando `Domain=...` para que funcionen en el dominio actual.
- `src/components/layout/AppLayout.tsx` contiene una hidratacion manual de sesion con `localStorage` para sincronizar el SDK.

Tocar auth con cuidado: cambios pequenos pueden romper login, logout o cookies en localhost/produccion.

## Recordatorios Y Correos

El flujo de recordatorios automaticos es una zona sensible del dominio:

- Edge/function principal documentada: `automated-reminders-batch`.
- Configuracion: `reminder_settings`.
- Historial: `reminder_logs`.
- Promociones MSI: `src/app/api/send-msi-promotions/route.ts` y logs en `sent_messages`.
- Zona horaria esperada para recordatorios: `America/Mexico_City`.
- Evitar comparaciones fragiles de fecha exacta cuando el dominio requiere rangos.
- Variables de plantillas usadas: `{{nombre}}`, `{{fecha_pago}}`, `{{dias_restantes}}`, `{{monto}}`, `{{msi_opciones}}`, `{{fecha_pago_menos_10}}`, `{{tarjeta_principal}}`, `{{banco}}`, `{{poliza}}`.

Antes de cambiar recordatorios, leer `DOC_RECORDATORIOS.md` y revisar `src/app/settings/page.tsx`.

## Frontend Y UI

Convenciones observadas:

- Textos de UI principalmente en espanol.
- Componentes client-side con `"use client"` cuando usan estado, efectos, eventos, browser APIs o hooks de auth.
- Imports con alias `@/*`.
- Tailwind directo en JSX y tokens desde `globals.css`.
- Usar `cn(...)` para combinar clases condicionales cuando convenga.
- Usar `lucide-react` para iconografia.
- Mantener soporte responsive: tablas en desktop y tarjetas o layout adaptado en mobile cuando el flujo lo requiera.
- Reutilizar primitives de `src/components/ui` antes de crear variantes nuevas.
- El layout principal vive en `AppLayout`; no duplicar sidebar/top-level shell en paginas.

Evitar cambios visuales amplios si la tarea es funcional. Si se toca UI, conservar el estilo sobrio de dashboard operativo.

## TypeScript Y Estilo De Codigo

- `strict: true` esta activo.
- El proyecto usa `allowJs: true`, pero preferir TypeScript para codigo nuevo dentro de `src`.
- Evitar `any` nuevo salvo que sea necesario por una respuesta dinamica del SDK; si se usa, mantenerlo acotado.
- No introducir abstracciones grandes si el patron local es directo.
- Comentarios solo cuando aclaren reglas de negocio o integraciones no obvias.
- Mantener nombres de tablas, campos y estados exactamente como los espera InsForge.

## Pruebas Y Verificacion

No hay un test runner npm dedicado en `package.json`; la validacion base es:

- `npm run lint`
- `npm run build` para cambios con riesgo de compilacion/runtime

Tambien existen artefactos de TestSprite en `testsprite_tests/`, pero su ejecucion depende de configuracion externa.

Cuando no sea posible ejecutar una verificacion, dejarlo claro en la respuesta final.

## Documentacion Local Relevante

- `README.md`: vision general, instalacion, estructura y variables.
- `DOCS_API.md`: patrones de datos con InsForge.
- `DOC_RECORDATORIOS.md`: logica de recordatorios automaticos.
- `TEST_PLAN_INTEGRAL.md`: plan de pruebas integral.
- `.agents/rules/limites.md`: reglas de Git del usuario.
- `.agent/ARCHITECTURE.md`: toolkit local de agentes, skills y workflows.

## Cuidado Con Archivos Generados O Temporales

No editar sin necesidad:

- `.next/`
- `node_modules/`
- `package-lock.json` salvo que cambien dependencias.
- `tsconfig.tsbuildinfo`
- logs como `tailwindcss-28132.log`
- archivos `tmp_*` salvo que la tarea los mencione.

## Checklist Antes De Entregar

- Confirmar que no se uso `git add`, `git commit` ni `git push`.
- Revisar que no se expusieron secretos.
- Ejecutar `npm run lint` cuando aplique.
- Ejecutar `npm run build` cuando el cambio pueda afectar compilacion o rutas.
- Resumir archivos modificados y verificaciones realizadas.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **AgentesSeguros** (API base `https://fbmf8gg8.us-west.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
