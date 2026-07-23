## ADDED Requirements

### Requirement: Indicador de deducible en productos
El sistema SHALL almacenar para cada producto de seguro un indicador booleano que determine si el producto maneja deducible.

#### Scenario: Crear producto que maneja deducible
- **WHEN** el usuario registra un producto y activa la opción de deducible
- **THEN** el sistema guarda el producto con `has_deductible` en verdadero

#### Scenario: Crear producto sin deducible
- **WHEN** el usuario registra un producto sin activar la opción de deducible
- **THEN** el sistema guarda el producto con `has_deductible` en falso

#### Scenario: Editar indicador de deducible
- **WHEN** el usuario cambia la opción de deducible de un producto existente y guarda
- **THEN** el sistema persiste el nuevo valor sin alterar el nombre, descripción ni documentos requeridos fuera de los cambios hechos por el usuario

### Requirement: Consulta clara del indicador
El sistema SHALL permitir identificar en el catálogo si un producto maneja deducible.

#### Scenario: Listado de productos
- **WHEN** el usuario consulta el catálogo de productos
- **THEN** puede distinguir los productos con deducible de los que no lo manejan mediante un texto o distintivo claro
