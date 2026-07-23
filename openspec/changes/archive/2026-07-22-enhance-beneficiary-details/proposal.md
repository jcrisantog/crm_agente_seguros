## Why

La captura de beneficiarios no reúne datos personales y de contacto necesarios para la administración de pólizas. Además, solicitar manualmente un domicilio idéntico al del contratante incrementa la captura repetitiva y el riesgo de datos desactualizados.

## What Changes

- Agregar fecha de nacimiento y domicilio a cada beneficiario de una póliza.
- Incorporar la opción «Misma dirección que el contratante» por beneficiario.
- Sincronizar automáticamente el domicilio de los beneficiarios que mantengan activa esa opción cuando cambie el domicilio del contratante.
- Permitir un domicilio independiente cuando la opción de dirección compartida esté desactivada.
- Eliminar el campo y la columna «Tipo» de la captura y visualización de beneficiarios.
- Permitir editar un beneficiario ya agregado sin tener que eliminarlo y capturarlo de nuevo.
- Mantener la compatibilidad de lectura con pólizas existentes que incluyan el campo histórico `tipo`.

## Capabilities

### New Capabilities

- `policy-beneficiary-details`: Captura, persistencia y presentación de datos ampliados de los beneficiarios de una póliza.

### Modified Capabilities

- Ninguna.

## Impact

- Se modifican las pantallas de alta y edición de pólizas, particularmente sus estados temporales, modal de beneficiarios y tabla de beneficiarios.
- Los datos continúan almacenándose en el campo JSON `beneficiarios` de `client_products`; no se anticipa una migración de base de datos.
- Las pólizas existentes seguirán siendo legibles, aunque su campo histórico `tipo` dejará de mostrarse y editarse.
