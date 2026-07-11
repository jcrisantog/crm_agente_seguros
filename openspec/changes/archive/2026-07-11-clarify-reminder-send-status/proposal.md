## Why

En produccion, al enviar recordatorios manuales, el cliente puede ver el toast generico "Error al enviar recordatorio / Ocurrio un error inesperado" aunque el recordatorio si llegue. Esto genera ruido operativo porque el sistema no distingue claramente entre fallo real de envio, fallo parcial por canal, timeout, respuesta no normalizada del SDK o fallo de confirmacion.

## What Changes

- Normalizar el resultado del envio manual de recordatorios por canal: correo y WhatsApp.
- Reemplazar mensajes genericos por mensajes accionables que indiquen que canal fallo, cual se completo y si el sistema no pudo confirmar el estado.
- Evitar mostrar error total cuando al menos un canal fue enviado correctamente.
- Preservar el comportamiento actual de envio: no cambia destinatarios, plantillas, payloads de n8n ni logica de MSI.
- Mantener detalles tecnicos en consola o en estructuras diagnosticas, sin exponer mensajes confusos al cliente.

## Capabilities

### New Capabilities
- `reminder-send-status`: Define como el sistema debe reportar al usuario el resultado del envio manual de recordatorios por correo y WhatsApp.

### Modified Capabilities
- Ninguna.

## Impact

- `src/components/clients/ReminderButton.tsx`: flujo de control del envio manual, normalizacion de errores y mensajes toast.
- `src/app/api/webhook-proxy/route.ts`: posible mejora de mensajes de error devueltos por el proxy para distinguir timeout, mala configuracion y error de n8n.
- `send-reminder-email.js`: posible ajuste menor para devolver respuestas consistentes y diagnosticables cuando el correo se envia o falla.
- No requiere cambios de base de datos ni nuevas dependencias.
