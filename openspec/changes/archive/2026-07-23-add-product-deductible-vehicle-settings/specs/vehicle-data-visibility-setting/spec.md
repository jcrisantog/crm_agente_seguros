## ADDED Requirements

### Requirement: Preferencia global de visibilidad de vehículo
El sistema SHALL permitir que un usuario autorizado habilite o deshabilite desde Ajustes del Sistema la visualización de datos de vehículo en formularios de póliza.

#### Scenario: Habilitar datos de vehículo
- **WHEN** el usuario activa y guarda la preferencia de datos de vehículo
- **THEN** el sistema persiste la preferencia y muestra la sección de vehículo al crear o editar una póliza

#### Scenario: Deshabilitar datos de vehículo
- **WHEN** el usuario desactiva y guarda la preferencia de datos de vehículo
- **THEN** el sistema persiste la preferencia y oculta la sección de vehículo al crear o editar una póliza

### Requirement: Conservación de datos existentes de vehículo
El sistema SHALL conservar los datos de vehículo ya almacenados cuando la preferencia global esté deshabilitada.

#### Scenario: Editar póliza con vehículo oculto
- **WHEN** el usuario edita y guarda una póliza que ya tiene datos de vehículo mientras la preferencia está deshabilitada
- **THEN** los datos de vehículo existentes permanecen sin cambios

#### Scenario: Reactivar datos de vehículo
- **WHEN** el usuario vuelve a habilitar la preferencia global y abre una póliza con datos de vehículo previos
- **THEN** el sistema muestra los valores de vehículo previamente almacenados

### Requirement: Compatibilidad inicial
El sistema SHALL conservar la visibilidad de vehículo para instalaciones y registros existentes al introducir la preferencia.

#### Scenario: Configuración creada por migración
- **WHEN** se despliega el cambio en una instalación existente
- **THEN** la preferencia inicial de visibilidad de vehículo queda habilitada
