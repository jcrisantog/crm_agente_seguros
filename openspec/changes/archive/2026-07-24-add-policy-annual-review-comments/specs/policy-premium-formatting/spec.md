## ADDED Requirements

### Requirement: Formato legible de primas por periodo
El sistema SHALL mostrar las primas por periodo en divisa y en MXN con símbolo `$`, separador de miles y exactamente dos decimales en los formularios de alta y edición de póliza.

#### Scenario: Mostrar importe con miles
- **WHEN** una prima por periodo calculada tiene el valor numérico `12345.6`
- **THEN** el sistema SHALL mostrarla como `$12,345.60`

#### Scenario: Mostrar importe cero
- **WHEN** todavía no existe una prima por periodo calculada o su valor es cero
- **THEN** el sistema SHALL mostrar `$0.00`

#### Scenario: Mostrar ambas primas calculadas
- **WHEN** cambian la prima anual, la frecuencia de pago o el tipo de cambio
- **THEN** el sistema SHALL actualizar con el mismo formato tanto la prima por periodo en divisa como la prima por periodo en MXN

### Requirement: Separación entre presentación y valor financiero
El sistema SHALL aplicar el formato monetario únicamente al renderizar y SHALL conservar valores numéricos sin separadores para cálculos y persistencia.

#### Scenario: Guardar después de mostrar una prima formateada
- **WHEN** el usuario guarda una póliza cuya prima se muestra con separadores de miles
- **THEN** el sistema SHALL persistir el valor numérico equivalente sin incorporar comas ni símbolos

#### Scenario: Recalcular un importe formateado
- **WHEN** el sistema recalcula las primas después de un cambio financiero
- **THEN** el cálculo SHALL utilizar el valor numérico y no el texto formateado mostrado
