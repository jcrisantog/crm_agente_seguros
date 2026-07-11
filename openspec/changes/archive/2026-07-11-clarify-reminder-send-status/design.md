## Context

El envio manual de recordatorios se ejecuta desde `ReminderButton.tsx`. Actualmente el flujo invoca `send-reminder-email`, intenta enviar WhatsApp mediante `/api/webhook-proxy` y luego muestra un toast final. En produccion se ha observado que el usuario puede ver "Error al enviar recordatorio / Ocurrio un error inesperado" aunque el recordatorio si llegue, lo que sugiere una respuesta no normalizada, un error capturado como objeto plano, una confirmacion incompleta o un fallo parcial que se presenta como fallo total.

El objetivo es mejorar la claridad operativa sin cambiar el envio real de correos, plantillas, destinatarios ni payloads de n8n.

## Goals / Non-Goals

**Goals:**

- Normalizar el resultado del envio manual en dos canales: correo y WhatsApp.
- Mostrar mensajes diferenciados para exito total, exito parcial, fallo de confirmacion y fallo total.
- Evitar que un objeto de error no tipado termine como "Ocurrio un error inesperado" cuando contiene informacion util.
- Mantener detalles tecnicos disponibles para diagnostico sin confundir al cliente final.
- Preservar el comportamiento actual de envio y los datos enviados a InsForge, Resend y n8n.

**Non-Goals:**

- No redisenar el sistema de logs de recordatorios.
- No cambiar las plantillas de correo ni WhatsApp.
- No cambiar las reglas de MSI ni umbrales de recordatorio.
- No sustituir InsForge Functions, Resend o n8n.
- No agregar nuevas dependencias.

## Decisions

### Decision: Modelar el resultado por canal

El boton manual debe construir un resultado interno con estados separados para `email` y `whatsapp`, por ejemplo `success`, `failed`, `unknown` o `skipped`. La UI debe decidir el toast final a partir de esa matriz, no desde un unico `try/catch` global.

Alternativa considerada: mantener el `try/catch` actual y solo mejorar el texto del error. Se descarta porque seguiria mezclando fallos de correo, fallos de WhatsApp y errores de confirmacion en una sola ruta.

### Decision: Normalizar errores desconocidos

Se debe usar una funcion local para extraer mensajes de `Error`, strings, objetos con `message`, objetos con `error`, objetos con `details` y respuestas JSON de InsForge/n8n. Si no hay informacion util, el mensaje visible debe explicar que el estado no pudo confirmarse, no que necesariamente fallo el envio.

Alternativa considerada: mostrar `JSON.stringify(error)` al usuario. Se descarta porque puede exponer detalles tecnicos, tokens parciales, URLs o mensajes confusos.

### Decision: Toast unico orientado al resultado final

El usuario debe recibir un mensaje final coherente. Cuando un canal falla pero otro se completa, se debe mostrar advertencia o exito parcial, no error total. Los detalles tecnicos pueden ir a `console.warn`/`console.error`.

Alternativa considerada: mostrar multiples toasts, uno por canal. Se descarta como comportamiento principal porque puede generar ruido visual; se puede conservar solo si ya existe una advertencia intermedia y no duplica el mensaje final.

### Decision: El proxy de WhatsApp debe devolver errores clasificables

`/api/webhook-proxy` debe responder con `success`, `status`, `error` y/o `data` suficientemente consistentes para que el boton pueda distinguir mala configuracion, timeout, error HTTP de n8n y respuesta no JSON.

Alternativa considerada: tratar cualquier `!ok` como "No se pudo enviar WhatsApp". Se descarta porque el objetivo es hacer el diagnostico mas explicito.

## Risks / Trade-offs

- [Risk] Un correo puede enviarse pero la funcion responder error por timeout o respuesta tardia -> Mitigation: mostrar "no se pudo confirmar" cuando el estado sea ambiguo, en lugar de afirmar fallo total.
- [Risk] Mensajes demasiado tecnicos pueden asustar al cliente -> Mitigation: separar mensaje visible de detalle tecnico para consola.
- [Risk] Cambiar el flujo de toasts puede ocultar fallos reales -> Mitigation: mantener un estado de fallo total cuando ambos canales fallen o cuando el correo falle antes de cualquier envio confirmado.
- [Risk] La UI no puede confirmar entrega real de WhatsApp, solo respuesta de n8n -> Mitigation: redactar como "WhatsApp enviado/aceptado por n8n" o "no se pudo confirmar", segun el dato disponible.
