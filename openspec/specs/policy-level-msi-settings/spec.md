## Requirements

### Requirement: Configuracion MSI por poliza
El sistema SHALL permitir configurar la promocion MSI en cada poliza de un cliente, incluyendo activacion, opciones de meses y rango de fechas.

#### Scenario: Poliza con MSI activo y datos completos
- **WHEN** el usuario activa MSI en una poliza y captura al menos una opcion de meses, fecha inicio y fecha fin
- **THEN** el sistema guarda la configuracion MSI estructurada para esa poliza

#### Scenario: Poliza con MSI activo y datos incompletos
- **WHEN** el usuario intenta guardar una poliza con MSI activo sin opciones de meses o sin rango de fechas completo
- **THEN** el sistema bloquea el guardado y muestra un mensaje accionable indicando los datos faltantes

### Requirement: Prioridad de MSI por poliza
El sistema SHALL resolver la configuracion MSI efectiva con prioridad de poliza sobre la configuracion general.

#### Scenario: General activa y poliza activa
- **WHEN** la configuracion global MSI esta activa y la poliza tambien tiene MSI activo
- **THEN** el sistema usa las opciones y fechas MSI de la poliza

#### Scenario: General activa y poliza desactivada
- **WHEN** la configuracion global MSI esta activa y la poliza no tiene MSI activo
- **THEN** el sistema usa las opciones y fechas MSI globales

#### Scenario: General desactivada y poliza activa
- **WHEN** la configuracion global MSI esta desactivada y la poliza tiene MSI activo
- **THEN** el sistema usa las opciones y fechas MSI de la poliza

#### Scenario: General desactivada y poliza desactivada
- **WHEN** la configuracion global MSI esta desactivada y la poliza no tiene MSI activo
- **THEN** el sistema no incluye promocion MSI en el recordatorio

### Requirement: Uso de plantillas globales MSI
El sistema SHALL reutilizar las plantillas globales de MSI para correo y WhatsApp, aun cuando las opciones y fechas MSI provengan de la poliza.

#### Scenario: Promocion MSI efectiva desde poliza
- **WHEN** una poliza tiene MSI aplicable por configuracion propia
- **THEN** el sistema renderiza la plantilla MSI global usando las opciones y fechas de esa poliza

#### Scenario: Promocion MSI efectiva desde configuracion global
- **WHEN** una poliza hereda MSI desde la configuracion global
- **THEN** el sistema renderiza la plantilla MSI global usando las opciones y fechas globales

### Requirement: Recordatorios con MSI efectivo por poliza
El sistema SHALL usar la configuracion MSI efectiva de cada poliza en recordatorios automaticos y envios manuales.

#### Scenario: Recordatorio automatico con MSI de poliza
- **WHEN** el proceso automatico evalua una poliza candidata con MSI propio aplicable
- **THEN** el correo y el payload de WhatsApp incluyen la promocion MSI de la poliza

#### Scenario: Recordatorio manual con MSI de poliza
- **WHEN** el usuario envia un recordatorio manual para una poliza con MSI propio aplicable
- **THEN** el correo y el payload de WhatsApp incluyen la promocion MSI de la poliza

#### Scenario: Recordatorio sin MSI aplicable
- **WHEN** una poliza no tiene MSI propio aplicable y no existe MSI global aplicable
- **THEN** el sistema envia el recordatorio normal sin variables de promocion MSI

### Requirement: Flujo global legacy de promociones MSI
El sistema SHALL retirar de la experiencia principal el envio masivo global de promociones MSI cuando ya no sea util para el usuario.

#### Scenario: Boton global de envio MSI comentado o no usado
- **WHEN** el flujo "Enviar Promociones MSI" no forma parte de la operacion actual
- **THEN** el sistema no muestra controles activos que permitan disparar ese envio masivo global
