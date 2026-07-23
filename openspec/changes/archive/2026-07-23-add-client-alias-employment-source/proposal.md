## Why

Los recordatorios se dirigen hoy al nombre completo del asegurado, lo que puede hacer que la comunicacion sea menos personal. Tambien falta registrar de manera estructurada su situacion laboral y el origen comercial del contacto, datos utiles para seguimiento y analisis.

## What Changes

- Agregar al asegurado un alias opcional que se use preferentemente como nombre en los recordatorios de email y WhatsApp, conservando el nombre completo como respaldo.
- Agregar la Situacion laboral del asegurado con las opciones Empleado, Independiente y Otro.
- Agregar una Fuente de contacto de texto libre con sugerencias de valores utilizados previamente, mediante coincidencia parcial que no distinga mayusculas ni acentos.
- Mostrar y permitir capturar estos datos al crear, editar y consultar el perfil del asegurado.

## Capabilities

### New Capabilities

- `client-contact-profile`: Datos de perfil comercial y personal del asegurado: alias, situacion laboral y fuente con sugerencias reutilizables.
- `reminder-preferred-name`: Resolucion consistente del nombre preferido en los mensajes de recordatorio por email y WhatsApp.

### Modified Capabilities

- Ninguna.

## Impact

- Tabla `clients` y sus politicas de acceso para nuevos campos y consulta de fuentes existentes.
- Formularios y perfil de asegurados en `src/app/clients`.
- Flujos de recordatorios manuales y automaticos: `send-reminder-email.js`, `automated-reminders-batch.js` y `src/components/clients/ReminderButton.tsx`.
- Payload enviado a n8n para WhatsApp y sustitucion del placeholder `{{nombre}}` en plantillas de email.
