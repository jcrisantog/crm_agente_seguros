## Requirements

### Requirement: Comentarios libres por póliza
El sistema SHALL permitir capturar comentarios opcionales y multilínea asociados a una póliza en los flujos de alta y edición.

#### Scenario: Crear póliza con comentarios
- **WHEN** el usuario captura comentarios al crear una póliza y guarda el formulario
- **THEN** el sistema SHALL persistir los comentarios en la póliza creada

#### Scenario: Crear póliza sin comentarios
- **WHEN** el usuario crea una póliza sin capturar comentarios
- **THEN** el sistema SHALL permitir el guardado sin exigir contenido en el campo

#### Scenario: Editar comentarios existentes
- **WHEN** el usuario abre una póliza con comentarios, modifica el contenido y guarda
- **THEN** el sistema SHALL reemplazar los comentarios anteriores por el nuevo contenido

### Requirement: Recuperación íntegra de comentarios
El sistema SHALL recuperar los comentarios de la póliza conservando su separación en líneas para su consulta y edición posterior.

#### Scenario: Volver a abrir comentarios multilínea
- **WHEN** el usuario vuelve a abrir una póliza con comentarios que contienen varias líneas
- **THEN** el sistema SHALL mostrar el contenido persistido con sus saltos de línea

#### Scenario: Independencia de comentarios entre pólizas
- **WHEN** un cliente tiene varias pólizas
- **THEN** el sistema SHALL mostrar en cada formulario únicamente los comentarios de la póliza correspondiente
