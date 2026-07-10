## Por Que

Los recordatorios actualmente muestran y envian montos de pago desde campos de prima inconsistentes. Los recordatorios por email y WhatsApp usan `net_premium`, mientras que una ruta de promocion MSI usa `total_premium`; la expectativa de negocio es que los montos visibles para el cliente aparezcan en pesos mexicanos usando el valor almacenado en `prima_mnx`.

## Que Cambia

- Usar `prima_mnx` como fuente del placeholder `{{monto}}` visible para el cliente en plantillas de email de recordatorios.
- Agregar `{{prima_mnx}}` como nueva variable explicita de plantilla para recordatorios y promociones MSI.
- Usar `prima_mnx` como fuente del campo `monto` enviado a WhatsApp/n8n en flujos manuales y automaticos de recordatorios.
- Usar `prima_mnx` para reemplazar el monto en emails de promocion MSI, de modo que la mensajeria MSI sea consistente con los recordatorios.
- Preservar la variable de plantilla existente `{{monto}}` como alias compatible para que las plantillas actuales no tengan que reescribirse.
- Formatear los montos renderizados como valores en pesos mexicanos.
- Mantener sin cambios la programacion de recordatorios, elegibilidad MSI, tarjeta, banco, poliza y destinatarios.

## Capacidades

### Nuevas Capacidades

- `reminder-amounts`: Define como se obtienen y formatean los montos visibles para el cliente en recordatorios y promociones.

### Capacidades Modificadas

Ninguna.

## Impacto

- Funcion de email de recordatorio afectada: `send-reminder-email.js`.
- Batch automatico de recordatorios afectado: `automated-reminders-batch.js`.
- Disparador manual de WhatsApp afectado: `src/components/clients/ReminderButton.tsx`.
- Ruta API de promociones MSI afectada: `src/app/api/send-msi-promotions/route.ts`.
- Las plantillas existentes de ajustes de recordatorios continuan usando `{{monto}}`; las plantillas nuevas pueden usar `{{prima_mnx}}`.
- No se esperan nuevas dependencias.
