## 1. Normalizacion De Errores

- [x] 1.1 Agregar una utilidad local en `ReminderButton.tsx` para extraer mensajes seguros desde `Error`, string, objetos con `message`, `error`, `details` y respuestas desconocidas.
- [x] 1.2 Definir mensajes visibles de respaldo que indiquen "no se pudo confirmar el estado" cuando el error no sea clasificable, evitando "Ocurrio un error inesperado".
- [x] 1.3 Mantener detalles tecnicos completos en `console.warn` o `console.error` para diagnostico sin exponerlos directamente al cliente.

## 2. Resultado Por Canal En Recordatorio Manual

- [x] 2.1 Reestructurar `handleSendReminder` para registrar estado separado de correo y WhatsApp.
- [x] 2.2 Evaluar primero la respuesta de `send-reminder-email` y clasificarla como exito, fallo o estado desconocido.
- [x] 2.3 Ejecutar WhatsApp solo cuando corresponda y clasificar la respuesta de `/api/webhook-proxy` como exito, fallo o estado desconocido.
- [x] 2.4 Mostrar exito total cuando correo y WhatsApp sean confirmados.
- [x] 2.5 Mostrar exito parcial o advertencia cuando al menos un canal se haya completado y otro falle o no pueda confirmarse.
- [x] 2.6 Mostrar error total solo cuando no haya ningun canal confirmado como exitoso.

## 3. Proxy De WhatsApp Diagnostico

- [x] 3.1 Ajustar `/api/webhook-proxy` para devolver mensajes diferenciados para mala configuracion, timeout, error HTTP de n8n y error desconocido.
- [x] 3.2 Preservar la forma `success`, `status`, `error` y `data` para que el boton pueda interpretar la respuesta sin depender de texto libre.
- [x] 3.3 Evitar imprimir o devolver `N8N_API_TOKEN` u otros secretos en errores, logs o respuestas.

## 4. Funcion De Correo

- [x] 4.1 Revisar `send-reminder-email.js` para confirmar que las respuestas exitosas y fallidas sean consistentes para el cliente.
- [x] 4.2 Si es necesario, ajustar la respuesta de error para incluir un mensaje claro sin cambiar el comportamiento de envio.

## 5. Verificacion

- [x] 5.1 Probar mentalmente o manualmente los casos: exito total, correo exitoso con WhatsApp fallido, correo fallido antes de WhatsApp y error desconocido.
- [x] 5.2 Ejecutar `npm run build`.
- [x] 5.3 Ejecutar `npm run lint` o documentar la deuda existente si falla por problemas no relacionados.
- [x] 5.4 Confirmar que no se modificaron plantillas, destinatarios, payloads funcionales ni reglas MSI fuera del alcance del cambio.
