## Requirements

### Requirement: Nombre preferido en recordatorios
El sistema SHALL resolver el nombre del destinatario como el Alias del asegurado despues de eliminar espacios externos cuando dicho valor no este vacio; en caso contrario SHALL usar el Nombre completo del asegurado.

#### Scenario: Recordatorio de asegurado con alias
- **WHEN** un asegurado con nombre completo Guadalupe Cruz Ramirez tiene el Alias `Lupita`
- **THEN** el sistema SHALL usar Lupita como nombre del destinatario en el recordatorio

#### Scenario: Recordatorio de asegurado sin alias
- **WHEN** un asegurado no tiene Alias o su Alias solo contiene espacios
- **THEN** el sistema SHALL usar su Nombre completo como nombre del destinatario en el recordatorio

### Requirement: Alias aplicado a email manual y automatico
El sistema SHALL usar el nombre preferido al sustituir `{{nombre}}` en los emails enviados desde un recordatorio manual y desde el lote automatico, incluidos los flujos de promociones MSI que usen las plantillas de recordatorio.

#### Scenario: Email manual con alias
- **WHEN** un usuario envia manualmente un recordatorio por email a un asegurado con Alias
- **THEN** la sustitucion de `{{nombre}}` SHALL contener el Alias

#### Scenario: Email automatico sin alias
- **WHEN** el lote automatico envia un email a un asegurado sin Alias
- **THEN** la sustitucion de `{{nombre}}` SHALL contener el Nombre completo

### Requirement: Alias aplicado a WhatsApp manual y automatico
El sistema SHALL enviar el nombre preferido en el campo existente `nombre` del payload de WhatsApp/n8n para recordatorios manuales y automaticos, sin retirar otros campos existentes del payload.

#### Scenario: WhatsApp manual con alias
- **WHEN** un usuario envia manualmente un recordatorio a un asegurado con Alias
- **THEN** el payload de WhatsApp SHALL incluir el Alias en el campo `nombre`

#### Scenario: WhatsApp automatico sin alias
- **WHEN** el lote automatico envia un recordatorio a un asegurado sin Alias
- **THEN** el payload de WhatsApp SHALL incluir el Nombre completo en el campo `nombre`
