## Context

El catálogo `products` actualmente guarda nombre, descripción y esquema de documentos requeridos. Las pólizas se guardan en `client_products`, donde ya existen los campos `vehicle_type`, `vehicle_brand`, `vehicle_model`, `vehicle_plates`, `vehicle_serial` y `vehicle_motor`. Los formularios de alta y edición de póliza los muestran siempre.

La pantalla de Ajustes administra datos persistentes especializados en tablas distintas. No existe una configuración global genérica que sea semánticamente adecuada para mezclar con recordatorios o facturación.

## Goals / Non-Goals

**Goals:**

- Persistir si cada producto maneja deducible.
- Permitir administrar ese indicador desde el catálogo de productos.
- Controlar globalmente si la sección de datos de vehículo aparece en los formularios de póliza.
- Mantener los datos de vehículo históricos e impedir que se borren por cambiar una preferencia visual.

**Non-Goals:**

- No capturar monto, porcentaje, moneda ni condiciones del deducible por póliza.
- No aplicar reglas de validación o cálculo financiero basadas en el indicador de deducible.
- No eliminar columnas ni datos de vehículo existentes.
- No decidir la visibilidad de vehículo por producto ni por póliza en este cambio; la preferencia es global.

## Decisions

### Indicador booleano en `products`

Se agregará una columna booleana `has_deductible` a `products`, con valor por defecto `false`. Los formularios de alta y edición usarán una opción inequívoca, por ejemplo “¿Maneja deducible?”, y el listado mostrará el estado cuando ayude a distinguir el producto.

El indicador describe una capacidad del producto; no representa un importe ni obliga a que una póliza particular tenga deducible.

### Configuración global aislada

Se creará una configuración persistente de una sola fila, por ejemplo en una tabla `system_settings`, con el booleano `show_vehicle_data`. Se prefiere esta tabla sobre añadir la columna a `reminder_settings` o `billing_settings`, porque la visibilidad de vehículo no pertenece a esos dominios y la separación evita dependencias confusas.

La configuración iniciará con `show_vehicle_data = true`, preservando el comportamiento actual para instalaciones y registros existentes. La UI debe poder recuperar una configuración ausente con ese mismo valor seguro mientras se crea o migra el registro inicial.

### Ocultar sin alterar datos de póliza

Cuando `show_vehicle_data` sea `false`, la sección completa de vehículo no se renderizará en alta ni edición de póliza. En edición, los valores cargados deben conservarse en el estado o excluirse cuidadosamente de una actualización que pudiera sobrescribirlos: cambiar la preferencia nunca debe convertir datos existentes en cadenas vacías o nulos.

Al reactivar la opción, los datos previamente guardados vuelven a estar disponibles para consulta y edición.

## Risks / Trade-offs

- [Riesgo] La configuración inexistente podría ocultar inesperadamente los campos. → Mitigación: usar `true` como valor de respaldo y sembrar la fila de configuración en la migración.
- [Riesgo] Una edición de póliza con la sección oculta podría borrar datos. → Mitigación: verificar explícitamente el payload de actualización con datos de vehículo existentes y la preferencia apagada.
- [Riesgo] El booleano de deducible podría interpretarse como importe. → Mitigación: textos de UI claros y no agregar campos de monto o porcentaje en este alcance.
- [Riesgo] RLS puede impedir leer o actualizar la configuración. → Mitigación: definir y verificar políticas para el mismo alcance administrativo que ya usa Ajustes del Sistema.

## Migration Plan

1. Agregar `products.has_deductible` como booleano no nulo con valor predeterminado `false`.
2. Crear la tabla o estructura de configuración global y su fila inicial con `show_vehicle_data = true`.
3. Verificar las políticas de lectura y escritura necesarias para el catálogo y Ajustes.
4. Desplegar la interfaz del catálogo, Ajustes y formularios de póliza.
5. Validar que desactivar y reactivar la preferencia no modifica datos históricos de vehículo.

Rollback: dejar las columnas y configuración sin eliminar; retirar su uso de la interfaz para volver al comportamiento anterior sin pérdida de datos.

## Open Questions

- Ninguna. El deducible se confirmó como indicador del catálogo solamente.
