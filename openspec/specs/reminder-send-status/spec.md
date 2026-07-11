## Requirements

### Requirement: Manual reminder result is reported by channel
El sistema SHALL evaluar el resultado del envio manual de recordatorios separando el canal de correo y el canal de WhatsApp.

#### Scenario: Email and WhatsApp are confirmed
- **WHEN** un usuario envia un recordatorio manual y el correo y WhatsApp son confirmados como exitosos
- **THEN** el sistema SHALL mostrar un mensaje de exito indicando que el recordatorio fue enviado por correo y WhatsApp

#### Scenario: Email succeeds and WhatsApp fails
- **WHEN** un usuario envia un recordatorio manual y el correo es exitoso pero WhatsApp falla o no puede confirmarse
- **THEN** el sistema SHALL mostrar un mensaje de exito parcial o advertencia indicando que el correo fue enviado y WhatsApp no se pudo enviar o confirmar

#### Scenario: Email fails and WhatsApp is not attempted
- **WHEN** un usuario envia un recordatorio manual y el correo falla antes de intentar WhatsApp
- **THEN** el sistema SHALL mostrar un error indicando que el correo no pudo enviarse y que WhatsApp no fue ejecutado

### Requirement: Manual reminder errors are explicit
El sistema SHALL transformar errores desconocidos del envio manual de recordatorios en mensajes visibles claros y accionables.

#### Scenario: Error object has message
- **WHEN** el envio manual falla con un error que contiene `message`
- **THEN** el sistema SHALL mostrar ese mensaje o una version segura y comprensible del mismo en la descripcion del toast

#### Scenario: Error object has error or details
- **WHEN** el envio manual falla con un objeto que contiene `error` o `details`
- **THEN** el sistema SHALL usar esa informacion para generar una descripcion especifica en lugar de mostrar "Ocurrio un error inesperado"

#### Scenario: Error cannot be classified
- **WHEN** el envio manual produce un error sin informacion util para el usuario
- **THEN** el sistema SHALL mostrar un mensaje que indique que no se pudo confirmar el estado del envio, sin afirmar falsamente que el recordatorio no llego

### Requirement: WhatsApp proxy errors are diagnosable
El sistema SHALL devolver desde el proxy de WhatsApp una respuesta consistente que permita distinguir errores de configuracion, timeout, respuesta fallida de n8n y error desconocido.

#### Scenario: WhatsApp proxy is missing configuration
- **WHEN** `N8N_WEBHOOK_URL` o `N8N_API_TOKEN` no estan configurados
- **THEN** el proxy SHALL devolver una respuesta con `success: false` y un error que indique que falta configuracion de n8n

#### Scenario: n8n returns non-success status
- **WHEN** n8n responde con un estado HTTP no exitoso
- **THEN** el proxy SHALL devolver `success: false`, el `status` recibido y un mensaje que permita identificar que n8n rechazo o no completo la solicitud

#### Scenario: WhatsApp proxy times out
- **WHEN** la llamada a n8n excede el tiempo maximo permitido
- **THEN** el proxy SHALL devolver `success: false` con un mensaje que identifique timeout de WhatsApp/n8n
