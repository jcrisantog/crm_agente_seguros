## Why

Las pólizas no permiten registrar ni dar seguimiento a su revisión anual, y tampoco cuentan con un espacio visible para comentarios operativos. Además, las primas calculadas por periodo se muestran sin separador de miles, lo que dificulta leer importes grandes y aumenta el riesgo de interpretación.

## What Changes

- Agregar a cada póliza el resultado de la revisión anual con opciones “Sí” y “No”.
- Registrar una fecha asociada a la revisión: fecha realizada cuando el resultado sea “Sí” y fecha programada o del intento cuando sea “No”.
- Solicitar un motivo cuando la revisión anual no se haya realizado.
- Agregar comentarios libres persistentes a nivel póliza.
- Incorporar los nuevos campos en los flujos de alta y edición de póliza.
- Mostrar las primas por periodo en divisa y en MXN con formato monetario, separador de miles y dos decimales, sin cambiar su valor persistido ni sus cálculos.

## Capabilities

### New Capabilities

- `policy-annual-review-tracking`: Captura, validación y persistencia del resultado, fecha y motivo de la revisión anual por póliza.
- `policy-comments`: Captura y persistencia de comentarios libres asociados a una póliza.
- `policy-premium-formatting`: Presentación uniforme de las primas por periodo con formato monetario legible.

### Modified Capabilities

Ninguna.

## Impact

- Tabla `client_products` de InsForge y sus políticas de acceso.
- Formularios de alta y edición de póliza en `src/app/clients/[id]/products/`.
- Presentación de información de pólizas en la interfaz.
- No se requieren nuevas dependencias ni se modifica la fórmula actual de primas.
