## Why

La promocion de Meses Sin Intereses (MSI) hoy se controla de forma global desde ajustes del sistema, pero el negocio necesita decidirla por poliza porque un mismo cliente puede tener varias polizas con condiciones comerciales distintas. Este cambio permite que cada poliza active su propia promocion MSI con meses y rango de fechas, manteniendo la configuracion global como valor por defecto cuando la poliza no tenga promocion propia.

## What Changes

- Agregar configuracion MSI estructurada a nivel de poliza en `client_products`.
- Permitir activar o desactivar la promocion MSI por poliza.
- Permitir seleccionar opciones MSI por poliza entre 3, 6, 9 y 12 meses.
- Permitir configurar rango de fechas de promocion por poliza.
- Resolver la promocion MSI con prioridad de poliza sobre la configuracion general:
  - General activa + poliza activa: aplica poliza.
  - General activa + poliza desactivada: aplica general.
  - General desactivada + poliza activa: aplica poliza.
  - General desactivada + poliza desactivada: no aplica MSI.
- Mantener las plantillas globales de MSI para correo y WhatsApp.
- Actualizar recordatorios automaticos y envio manual para usar la configuracion MSI efectiva de cada poliza.
- Retirar o dejar fuera de uso el flujo manual global de "Enviar Promociones MSI" si ya no es util para el usuario.

## Capabilities

### New Capabilities

- `policy-level-msi-settings`: Define la configuracion MSI por poliza, su prioridad frente a la configuracion general y su uso en recordatorios.

### Modified Capabilities

- Ninguna.

## Impact

- Base de datos InsForge: tabla `client_products`, con nuevos campos para MSI por poliza.
- UI de polizas: formularios de crear y editar poliza, y posiblemente el detalle del cliente donde se listan polizas.
- Recordatorios: `automated-reminders-batch.js`, `send-reminder-email.js` y `src/components/clients/ReminderButton.tsx`.
- Ajustes: `src/app/settings/page.tsx` conserva configuracion global y plantillas MSI, pero el envio masivo global de promociones MSI deja de ser el flujo principal.
- API MSI legacy: `src/app/api/send-msi-promotions/route.ts` debe revisarse para eliminarla o aislarla si el flujo comentado ya no se usa.
