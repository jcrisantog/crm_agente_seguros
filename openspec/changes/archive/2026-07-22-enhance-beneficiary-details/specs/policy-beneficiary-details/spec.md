## ADDED Requirements

### Requirement: Captura de datos ampliados del beneficiario
El sistema SHALL permitir capturar la fecha de nacimiento y el domicilio de cada beneficiario al crear o editar una póliza. La fecha de nacimiento SHALL conservarse como fecha de calendario y el domicilio SHALL conservarse como texto asociado al beneficiario.

#### Scenario: Registrar un beneficiario con datos ampliados
- **WHEN** el usuario captura un beneficiario con nombre, porcentaje, fecha de nacimiento, relación y domicilio propio
- **THEN** el sistema SHALL agregar esos datos al beneficiario que se guardará con la póliza

#### Scenario: Cargar una póliza histórica
- **WHEN** el usuario abre una póliza cuyos beneficiarios no contienen fecha de nacimiento ni domicilio
- **THEN** el sistema SHALL permitir visualizar y editar la póliza sin errores, mostrando esos valores como vacíos

### Requirement: Domicilio compartido con el contratante
El sistema SHALL ofrecer por cada beneficiario una opción «Misma dirección que el contratante», desactivada inicialmente. Cuando la opción esté activada, el domicilio del beneficiario SHALL adoptar el domicilio actual del contratante y no SHALL ser editable de forma independiente.

#### Scenario: Activar dirección compartida
- **WHEN** el usuario activa «Misma dirección que el contratante» para un beneficiario
- **THEN** el sistema SHALL asignar al beneficiario el domicilio actual del contratante y SHALL deshabilitar la edición de su domicilio propio

#### Scenario: Usar dirección propia
- **WHEN** el usuario desactiva «Misma dirección que el contratante»
- **THEN** el sistema SHALL permitir editar y guardar un domicilio independiente para ese beneficiario

#### Scenario: Cambiar domicilio del contratante
- **WHEN** el usuario modifica el domicilio del contratante antes de guardar la póliza
- **THEN** el sistema SHALL actualizar automáticamente el domicilio de todos los beneficiarios que tengan activa la opción de dirección compartida

#### Scenario: Editar una póliza con dirección compartida
- **WHEN** el usuario abre para editar una póliza que tiene un beneficiario con la opción de dirección compartida activa y cambia el domicilio del contratante
- **THEN** el sistema SHALL persistir el nuevo domicilio del contratante también en ese beneficiario al guardar la póliza

### Requirement: Retiro del tipo de beneficiario
El sistema SHALL eliminar el campo y la columna «Tipo» de la captura y visualización de beneficiarios. El sistema SHALL ignorar la presencia del campo histórico `tipo` al cargar pólizas existentes.

#### Scenario: Agregar un beneficiario nuevo
- **WHEN** el usuario abre el formulario para agregar un beneficiario
- **THEN** el sistema SHALL no solicitar ni almacenar un valor de tipo de beneficiario

#### Scenario: Visualizar beneficiarios de una póliza existente
- **WHEN** el sistema carga beneficiarios que incluyen el campo histórico `tipo`
- **THEN** el sistema SHALL no mostrar una columna ni un valor de tipo y SHALL mantener la póliza operable

### Requirement: Edición de beneficiarios existentes
El sistema SHALL permitir editar los datos de cada beneficiario ya agregado desde la lista de beneficiarios, sin requerir eliminarlo y volverlo a capturar.

#### Scenario: Abrir la edición de un beneficiario
- **WHEN** el usuario selecciona la acción de editar en una fila de beneficiario
- **THEN** el sistema SHALL abrir el formulario con los datos existentes de ese beneficiario

#### Scenario: Guardar cambios de un beneficiario
- **WHEN** el usuario confirma la edición de un beneficiario válido
- **THEN** el sistema SHALL actualizar únicamente el beneficiario editado en la lista y SHALL conservar los demás beneficiarios sin cambios
