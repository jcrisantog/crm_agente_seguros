## ADDED Requirements

### Requirement: Reminder templates use prima_mnx for monto
El sistema SHALL reemplazar el placeholder `{{monto}}` en plantillas de email de recordatorios con el valor `prima_mnx` de la poliza formateado como monto en pesos mexicanos.

#### Scenario: Manual reminder email amount
- **WHEN** un usuario envia un email de recordatorio manual para una poliza con `prima_mnx`
- **THEN** el email generado SHALL renderizar `{{monto}}` usando el valor `prima_mnx` de esa poliza en formato de moneda MXN

#### Scenario: Automated reminder email amount
- **WHEN** el batch automatico de recordatorios envia un email para una poliza con `prima_mnx`
- **THEN** el email generado SHALL renderizar `{{monto}}` usando el valor `prima_mnx` de esa poliza en formato de moneda MXN

### Requirement: WhatsApp reminder payload uses prima_mnx for monto
El sistema SHALL enviar el valor `prima_mnx` de la poliza como campo `monto` del payload de WhatsApp/n8n para mensajes de recordatorio.

#### Scenario: Manual WhatsApp reminder amount
- **WHEN** un usuario envia un recordatorio manual que dispara el webhook de n8n para una poliza con `prima_mnx`
- **THEN** el payload del webhook SHALL incluir `monto` formateado desde el valor `prima_mnx` de esa poliza

#### Scenario: Automated WhatsApp reminder amount
- **WHEN** el batch automatico de recordatorios dispara el webhook de n8n para una poliza con `prima_mnx`
- **THEN** el payload del webhook SHALL incluir `monto` formateado desde el valor `prima_mnx` de esa poliza

### Requirement: MSI promotion templates use prima_mnx for monto
El sistema SHALL reemplazar el placeholder `{{monto}}` en plantillas de email de promocion MSI con el valor `prima_mnx` de la poliza formateado como monto en pesos mexicanos.

#### Scenario: MSI promotion email amount
- **WHEN** se genera un email de promocion MSI para una poliza con `prima_mnx`
- **THEN** el email generado SHALL renderizar `{{monto}}` usando el valor `prima_mnx` de esa poliza en formato de moneda MXN

### Requirement: Existing monto template variable remains supported
El sistema SHALL seguir soportando el placeholder existente `{{monto}}` para plantillas de recordatorios y promociones MSI.

#### Scenario: Existing template compatibility
- **WHEN** una plantilla guardada de recordatorio o MSI contiene `{{monto}}`
- **THEN** el sistema SHALL reemplazar `{{monto}}` sin requerir que la plantilla sea editada

### Requirement: New prima_mnx template variable is supported
El sistema SHALL soportar el placeholder `{{prima_mnx}}` en plantillas de recordatorios y promociones MSI, usando el mismo valor formateado en MXN que `{{monto}}`.

#### Scenario: Reminder template uses prima_mnx variable
- **WHEN** una plantilla de recordatorio contiene `{{prima_mnx}}`
- **THEN** el sistema SHALL reemplazar `{{prima_mnx}}` con el valor `prima_mnx` de la poliza en formato de moneda MXN

#### Scenario: MSI template uses prima_mnx variable
- **WHEN** una plantilla de promocion MSI contiene `{{prima_mnx}}`
- **THEN** el sistema SHALL reemplazar `{{prima_mnx}}` con el valor `prima_mnx` de la poliza en formato de moneda MXN
