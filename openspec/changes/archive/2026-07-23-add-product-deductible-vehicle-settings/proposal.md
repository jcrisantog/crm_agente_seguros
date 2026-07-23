## Why

El catálogo de tipos de seguro no identifica hoy si un producto maneja deducible, lo que limita la consulta rápida de sus características. Además, los campos de vehículo ya existen en las pólizas, pero se muestran siempre aunque no todos los equipos o productos los necesiten.

## What Changes

- Agregar al catálogo de productos un indicador booleano: “¿Maneja deducible?”.
- Permitir capturar y editar ese indicador al crear o modificar un tipo de seguro, y mostrarlo de forma clara en el catálogo.
- Agregar a Ajustes del Sistema una preferencia global para habilitar o deshabilitar los datos de vehículo en formularios de pólizas.
- Mostrar los campos existentes de vehículo al crear y editar una póliza únicamente cuando la preferencia global esté habilitada.
- Conservar sin modificación los datos de vehículo almacenados al deshabilitar la preferencia.

## Capabilities

### New Capabilities

- `product-deductible-indicator`: Identificación de productos de seguro que manejan deducible.
- `vehicle-data-visibility-setting`: Configuración global para controlar la visibilidad de datos de vehículo en pólizas.

### Modified Capabilities

- Ninguna.

## Impact

- Base de datos InsForge: tabla `products` y una configuración global persistente para el sistema.
- Catálogo de productos: alta, edición y listado en `src/app/products` y `src/components/products`.
- Ajustes del Sistema: `src/app/settings/page.tsx`.
- Formularios de creación y edición de pólizas en `src/app/clients/[id]/products`.
