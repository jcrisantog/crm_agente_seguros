## ADDED Requirements

### Requirement: Captura del resultado de revisión anual
El sistema SHALL permitir registrar en cada póliza si la revisión anual se realizó mediante las opciones “Sí” y “No”, sin asignar automáticamente un resultado a pólizas históricas.

#### Scenario: Registrar revisión realizada
- **WHEN** el usuario selecciona “Sí” en la revisión anual
- **THEN** el sistema SHALL representar el resultado como revisión realizada para esa póliza

#### Scenario: Registrar revisión no realizada
- **WHEN** el usuario selecciona “No” en la revisión anual
- **THEN** el sistema SHALL representar el resultado como revisión no realizada para esa póliza

#### Scenario: Abrir póliza histórica sin revisión
- **WHEN** el usuario abre una póliza existente que no tiene resultado de revisión anual
- **THEN** el sistema SHALL mostrar el resultado sin seleccionar y no SHALL inferir “Sí” ni “No”

#### Scenario: Guardar sin capturar revisión anual
- **WHEN** el usuario guarda una póliza sin seleccionar un resultado de revisión anual
- **THEN** el sistema SHALL permitir el guardado y SHALL persistir el resultado, la fecha y el motivo como nulos

### Requirement: Fecha obligatoria con significado contextual
El sistema SHALL requerir una fecha al guardar el resultado de revisión anual y SHALL comunicar su significado de acuerdo con el resultado seleccionado.

#### Scenario: Fecha de revisión realizada
- **WHEN** el usuario selecciona “Sí”
- **THEN** el sistema SHALL tratar la fecha como la fecha en que se realizó la revisión anual

#### Scenario: Fecha programada o de intento
- **WHEN** el usuario selecciona “No”
- **THEN** el sistema SHALL tratar la fecha como la fecha programada o la fecha del intento de revisión

#### Scenario: Intento de guardar sin fecha
- **WHEN** el usuario intenta guardar una póliza con resultado de revisión seleccionado y sin fecha
- **THEN** el sistema SHALL impedir el guardado y SHALL indicar que la fecha es obligatoria

### Requirement: Motivo condicional de revisión no realizada
El sistema SHALL solicitar y persistir un motivo cuando la revisión anual no se haya realizado, y SHALL evitar conservar ese motivo cuando la revisión figure como realizada.

#### Scenario: Guardar revisión no realizada con motivo
- **WHEN** el usuario selecciona “No”, captura fecha y motivo, y guarda la póliza
- **THEN** el sistema SHALL persistir el resultado, la fecha y el motivo

#### Scenario: Intento de guardar revisión no realizada sin motivo
- **WHEN** el usuario selecciona “No” e intenta guardar sin motivo
- **THEN** el sistema SHALL impedir el guardado y SHALL indicar que el motivo es obligatorio

#### Scenario: Cambiar una revisión de No a Sí
- **WHEN** una póliza con motivo de no revisión cambia su resultado a “Sí” y se guarda
- **THEN** el sistema SHALL persistir el motivo como nulo

### Requirement: Persistencia y recuperación de revisión anual
El sistema SHALL guardar y recuperar los datos de revisión anual asociados exclusivamente a la póliza correspondiente.

#### Scenario: Volver a abrir una póliza con revisión
- **WHEN** el usuario vuelve a abrir una póliza previamente guardada
- **THEN** el sistema SHALL mostrar el resultado, la fecha y el motivo aplicable que fueron persistidos

#### Scenario: Pólizas del mismo cliente con revisiones distintas
- **WHEN** un cliente tiene varias pólizas con datos de revisión diferentes
- **THEN** el sistema SHALL mantener los datos de cada póliza de manera independiente
