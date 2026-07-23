## Why

La llave de API de Resend no debe vivir en codigo fuente, scripts temporales ni fallbacks hardcodeados porque al subirla al repositorio queda expuesta y Resend puede invalidarla automaticamente. El envio de correos debe depender de configuracion segura por entorno para que produccion, test y despliegues en Dokploy funcionen sin filtrar secretos.

## What Changes

- Reemplazar cualquier inicializacion de Resend con llave hardcodeada por lectura server-side de `RESEND_API_KEY`.
- Usar `RESEND_API_KEY` como nombre unico de variable/secreto en todos los runtimes:
  - Secret de InsForge para funciones Edge como recordatorios automaticos o envio individual.
  - Variable de entorno server-side en Dokploy para rutas Next.js.
  - Variable local en `.env.local`, sin valor real en documentacion ni codigo.
- Eliminar fallbacks sensibles para Resend; si falta `RESEND_API_KEY`, el flujo debe fallar con un error explicito y accionable.
- Revisar scripts temporales o legacy relacionados con correos para que no conserven llaves reales.
- Mantener los envios existentes de recordatorios y promociones MSI, cambiando solo la fuente de la credencial.

## Capabilities

### New Capabilities
- `secure-resend-secret-management`: Define como la aplicacion y las funciones deben consumir la llave de Resend sin exponerla en el repositorio.

### Modified Capabilities
- Ninguna. Las promociones MSI y recordatorios mantienen su comportamiento funcional; solo cambia la forma segura de obtener la credencial de Resend.

## Impact

- Archivos de envio de correo y recordatorios: `send-reminder-email.js`, `automated-reminders-batch.js`, `automated_reminders_v2.js` si sigue operativo, y `tmp_send_reminder.js` si se conserva.
- Ruta de promociones MSI: `src/app/api/send-msi-promotions/route.ts`.
- Configuracion operativa:
  - InsForge Secrets por proyecto para funciones.
  - Variables de entorno de Dokploy para el servicio Next.js.
  - `.env.local` solo como archivo local no versionado.
- Verificacion por busqueda de patrones sensibles y prueba de envio de correo.
