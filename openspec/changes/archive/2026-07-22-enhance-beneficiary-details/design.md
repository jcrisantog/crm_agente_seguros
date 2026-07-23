## Context

Los beneficiarios se administran en las pantallas de creación y edición de pólizas y se persisten como objetos dentro del campo JSON `beneficiarios` de `client_products`. Actualmente cada objeto contiene nombre, relación, tipo y porcentaje. El domicilio del contratante se almacena por separado en el objeto JSON `contratante` de la misma póliza.

La mejora debe aplicarse de forma consistente en ambas pantallas, sin alterar los objetos de beneficiarios de pólizas históricas ni requerir cambios de esquema en InsForge.

## Goals / Non-Goals

**Goals:**

- Capturar fecha de nacimiento y domicilio por beneficiario.
- Evitar la recaptura de un domicilio cuando coincide con el del contratante.
- Mantener sincronizado automáticamente el domicilio de cada beneficiario que haya elegido compartirlo con el contratante.
- Eliminar la captura y visualización del campo `tipo` para los beneficiarios nuevos o modificados.
- Conservar la lectura segura de los objetos históricos que aún incluyan `tipo`.

**Non-Goals:**

- Normalizar beneficiarios en una tabla independiente.
- Modificar datos históricos de pólizas que no sean editadas.
- Validar edad, parentesco o distribución total de porcentajes.
- Sincronizar el domicilio con la ficha global del cliente; la fuente de sincronización es exclusivamente el contratante de la póliza.

## Decisions

### Estructura ampliada del beneficiario

Los beneficiarios nuevos usarán los campos `nombre`, `relacion`, `porcentaje`, `fecha_nacimiento`, `direccion` y `misma_direccion_contratante`. La fecha se almacenará con el valor estándar de un campo de fecha (`YYYY-MM-DD`). El indicador booleano conserva la intención del usuario y permite reconstruir la sincronización al volver a editar la póliza.

Se mantiene el almacenamiento JSON existente, ya que el cambio amplía objetos anidados que la aplicación ya guarda y recupera en bloque. Como alternativa se consideró una migración a una tabla relacional, pero sería desproporcionada para esta mejora y ampliaría su alcance.

### Domicilio compartido controlado por indicador

La opción «Misma dirección que el contratante» comenzará desactivada para no asumir que dos personas comparten domicilio. Al activarla, el campo de domicilio del beneficiario mostrará el valor del contratante y no será editable. Al desactivarla, se habilitará la captura de un domicilio propio.

El manejador de cambios del contratante actualizará el domicilio de todos los beneficiarios cuyo indicador sea `true`. Esta sincronización ocurrirá en memoria antes de guardar, tanto para altas como para ediciones, evitando que el JSON persistido contenga un domicilio obsoleto.

La alternativa de copiar el domicilio una sola vez se descartó porque rompería el significado de la opción tras cambios posteriores en el contratante.

### Compatibilidad con pólizas existentes

La interfaz tolerará objetos que no tengan los campos nuevos y usará valores vacíos o `false` como estado inicial efectivo. El campo histórico `tipo` no se mostrará ni se incluirá al crear o guardar beneficiarios nuevos, pero su presencia en datos históricos no deberá causar errores.

### Edición en el mismo modal de beneficiarios

La tabla de beneficiarios incluirá una acción de edición por fila. Al seleccionarla, el modal existente cargará el objeto del beneficiario y conservará su índice dentro de la lista. Al confirmar, el sistema reemplazará únicamente ese elemento, en vez de agregar uno nuevo. La alternativa de una pantalla separada se descartó porque el formulario ya cabe en el modal y la edición requiere los mismos campos que el alta.

## Risks / Trade-offs

- [Un beneficiario marcado con dirección compartida puede guardarse con un domicilio vacío si el contratante no tiene domicilio] → Mostrar la dirección actual del contratante y permitir guardar solo bajo las mismas reglas de obligatoriedad que se definan para el domicilio; no inventar valores.
- [Los beneficiarios existentes no tienen indicador de sincronización] → Tratar su indicador como `false` para conservar su información sin asumir una relación con el contratante.
- [La tabla de beneficiarios gana columnas y puede perder legibilidad] → Mantener el contenedor con desplazamiento horizontal ya existente y adaptar el contenido para pantallas pequeñas si es necesario.
- [Eliminar `tipo` de la interfaz deja el dato histórico en JSON] → Es una compatibilidad deliberada; no se ejecutará una limpieza masiva de datos.

## Migration Plan

1. Desplegar el cambio de interfaz sin migración de base de datos, pues `beneficiarios` ya admite objetos JSON ampliados.
2. Las pólizas nuevas almacenarán los nuevos campos; las pólizas existentes los adquirirán cuando se editen y guarden.
3. Si fuera necesario revertir, la aplicación previa seguirá pudiendo ignorar los campos JSON adicionales. No hay cambios destructivos en la base de datos.

## Open Questions

- La solicitud no define si fecha de nacimiento y domicilio deben ser obligatorios; se propone mantenerlos opcionales, como la relación actual, hasta recibir una regla de negocio distinta.
