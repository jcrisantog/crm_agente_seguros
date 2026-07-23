## Requirements

### Requirement: Perfil del asegurado con datos comerciales adicionales
El sistema SHALL permitir que cada asegurado tenga un Alias opcional, una Situacion laboral opcional y una Fuente opcional, sin alterar el nombre completo existente como dato principal del perfil.

#### Scenario: Alta de asegurado con los nuevos datos
- **WHEN** un usuario registra un asegurado y captura Alias, Situacion laboral y Fuente
- **THEN** el sistema SHALL guardar los tres valores asociados al asegurado junto con sus datos existentes

#### Scenario: Asegurado historico sin nuevos datos
- **WHEN** un usuario consulta o edita un asegurado creado antes de esta funcionalidad
- **THEN** el sistema SHALL mostrar los nuevos campos vacios y permitir guardar el perfil sin exigirlos

### Requirement: Situacion laboral controlada
El sistema SHALL presentar el campo visible Situacion laboral con exactamente las opciones Empleado, Independiente y Otro, y SHALL rechazar valores fuera de esas opciones cuando se persistan por los canales de la aplicacion.

#### Scenario: Seleccion de situacion laboral valida
- **WHEN** un usuario selecciona Independiente al crear o editar un asegurado
- **THEN** el sistema SHALL guardar Independiente como la situacion laboral del asegurado

#### Scenario: Valor laboral no permitido
- **WHEN** un intento de guardado incluye una situacion laboral distinta de Empleado, Independiente u Otro
- **THEN** el sistema SHALL rechazar el valor y conservar la integridad de los datos permitidos

### Requirement: Fuente libre con sugerencias reutilizables
El sistema SHALL permitir capturar Fuente como texto libre y SHALL ofrecer sugerencias de fuentes no vacias ya registradas en los asegurados que el usuario tenga permiso de consultar.

#### Scenario: Seleccion de una fuente sugerida
- **WHEN** el usuario escribe texto que coincide con una fuente existente y selecciona una sugerencia
- **THEN** el sistema SHALL completar el campo Fuente con el valor seleccionado

#### Scenario: Registro de una fuente nueva
- **WHEN** el usuario escribe una fuente que no aparece entre las sugerencias y guarda el asegurado
- **THEN** el sistema SHALL permitir guardar ese texto como una nueva Fuente

### Requirement: Coincidencia de fuentes predecible
El sistema SHALL filtrar las sugerencias por coincidencia parcial en cualquier posicion del texto, sin distinguir mayusculas ni acentos, y SHALL evitar mostrar duplicados que solo difieran por espacios externos, mayusculas o acentos.

#### Scenario: Coincidencia parcial sin diferencia de mayusculas
- **WHEN** el usuario escribe `inst` y existe una fuente registrada como `Instagram`
- **THEN** el sistema SHALL incluir Instagram en las sugerencias

#### Scenario: Coincidencia sin diferencia de acentos
- **WHEN** el usuario escribe `referido` y existe una fuente registrada como `Referído`
- **THEN** el sistema SHALL tratar ambos textos como coincidentes para fines de sugerencia

#### Scenario: Fuentes equivalentes duplicadas
- **WHEN** existen fuentes registradas como `Facebook` y `facebook`
- **THEN** el sistema SHALL mostrar una sola sugerencia equivalente para esa fuente

### Requirement: Visibilidad del perfil comercial
El sistema SHALL permitir capturar Alias, Situacion laboral y Fuente tanto al dar de alta como al editar un asegurado, y SHALL mostrarlos en el perfil del asegurado cuando tengan valor.

#### Scenario: Consulta del perfil con nuevos datos
- **WHEN** un usuario abre el perfil de un asegurado que tiene Alias, Situacion laboral y Fuente
- **THEN** el sistema SHALL mostrar los tres valores en la informacion del perfil
