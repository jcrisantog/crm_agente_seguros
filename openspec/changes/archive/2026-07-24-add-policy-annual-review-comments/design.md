## Context

Las pólizas se almacenan en `client_products` y se administran desde formularios client-side independientes para alta y edición. Actualmente esos formularios no leen ni envían datos de revisión anual o comentarios. Las primas por periodo se calculan en memoria, se conservan como cadenas numéricas durante la captura y se muestran interpolando directamente el valor, por lo que no incluyen separadores de miles.

El código fuente no referencia un campo de comentarios en `client_products`, aunque el esquema remoto debe verificarse antes de crear una columna porque pudo existir fuera del código actual.

## Goals / Non-Goals

**Goals:**

- Persistir el resultado, la fecha y, cuando corresponda, el motivo de la revisión anual por póliza.
- Diferenciar claramente el significado de la fecha según el resultado de la revisión.
- Persistir comentarios operativos multilínea por póliza.
- Mantener los mismos datos y cálculos financieros, cambiando únicamente su presentación.
- Conservar compatibilidad con pólizas históricas que no tengan datos de revisión.

**Non-Goals:**

- No crear recordatorios automáticos, tareas ni notificaciones a partir de la fecha de revisión.
- No mantener un historial de múltiples revisiones; este cambio representa el estado anual vigente de la póliza.
- No modificar la fórmula, precisión persistida ni moneda de las primas.
- No mostrar ni editar los nuevos campos desde listados distintos a los formularios de póliza.

## Decisions

### Campos estructurados en `client_products`

Se usarán campos independientes y tipados para el seguimiento:

- `annual_review_completed`: booleano nullable para representar “Sí”, “No” y el estado histórico “Sin registrar”.
- `annual_review_date`: fecha nullable a nivel de base de datos para permitir la migración, pero obligatoria en la interfaz cuando se guarde una póliza con resultado seleccionado.
- `annual_review_reason`: texto nullable, obligatorio únicamente cuando `annual_review_completed` sea `false`.
- `comments`: texto nullable para comentarios libres.

Antes de agregar `comments`, la implementación consultará el esquema remoto. Si existe una columna compatible, se reutilizará; no se creará una segunda columna equivalente.

Se prefieren columnas estructuradas sobre un objeto JSON porque estos datos tienen reglas condicionales, pueden necesitar consultas futuras y deben conservar tipos claros.

### Significado contextual de la fecha

Cuando el resultado sea “Sí”, `annual_review_date` representará la fecha en que se realizó la revisión. Cuando sea “No”, representará la fecha programada o la fecha del intento de revisión. La interfaz cambiará la etiqueta o ayuda contextual de la fecha para hacer explícito ese significado.

El motivo se mostrará y será obligatorio con resultado “No”. Al cambiar el resultado a “Sí”, el motivo dejará de enviarse y se persistirá como `null` para evitar información contradictoria.

### Compatibilidad con registros históricos

Las nuevas columnas admitirán valores nulos para no atribuir automáticamente un resultado a pólizas existentes. Al editar una póliza histórica sin información de revisión, la interfaz mostrará el resultado sin seleccionar y permitirá guardar sin capturarla. Si el usuario selecciona un resultado, la interfaz solicitará la fecha asociada y, con resultado “No”, también el motivo.

Esta estrategia evita inventar datos durante la migración y permite completar el seguimiento conforme se intervengan las pólizas.

### Comentarios en el formulario de póliza

Los comentarios serán un área de texto multilínea dentro de la ficha “Póliza” en alta y edición. El valor será opcional y se cargará y guardará junto con el resto de `client_products`.

Se prefiere un campo dedicado frente a reutilizar `meses_sin_intereses` u otro texto existente porque esos campos tienen semántica de negocio distinta.

### Formato monetario solo en presentación

Las tarjetas “Prima por Periodo en Divisa” y “Prima Por Periodo en MXN” convertirán de forma segura la cadena calculada a número y la presentarán con `Intl.NumberFormat`, separador de miles y exactamente dos decimales. El valor mostrado seguirá incluyendo el símbolo `$`; la tarjeta en divisa conservará el contexto de la moneda seleccionada.

El estado del formulario, los cálculos y los valores enviados a InsForge continuarán usando números sin caracteres de formato. Esto evita que las comas interfieran con `parseFloat` o con la persistencia.

## Risks / Trade-offs

- [Riesgo] La columna de comentarios podría existir en el backend con otro nombre o tipo. → Mitigación: inspeccionar el esquema antes de ejecutar DDL y reutilizar el campo compatible.
- [Riesgo] Un resultado opcional puede dejar revisiones pendientes sin seguimiento. → Mitigación: mantener valores nulos sin inventar datos y exigir fecha y motivo cuando el usuario capture un resultado.
- [Riesgo] Un cambio de “No” a “Sí” podría dejar un motivo obsoleto. → Mitigación: normalizar el payload y guardar el motivo como `null` cuando la revisión esté realizada.
- [Riesgo] Formatear el valor dentro del estado podría romper cálculos. → Mitigación: aplicar el formato exclusivamente en el render.
- [Riesgo] El término “fecha” puede resultar ambiguo cuando la revisión no ocurrió. → Mitigación: usar etiqueta y texto de ayuda dependientes del resultado.

## Migration Plan

1. Inspeccionar las columnas actuales de `client_products`, especialmente posibles campos de comentarios.
2. Agregar únicamente las columnas ausentes, permitiendo nulos para conservar registros históricos.
3. Verificar las políticas RLS existentes de `client_products`; los nuevos campos deben heredar el mismo acceso por fila.
4. Desplegar los cambios de alta, edición, validación y presentación monetaria.
5. Validar creación, edición de registros históricos y transiciones entre “Sí” y “No”.

Rollback: retirar el uso de los nuevos campos de la interfaz sin eliminar las columnas ni los datos capturados. El formato monetario puede revertirse sin afectar valores persistidos.

## Open Questions

Ninguna. La fecha con resultado “No” se confirmó como fecha programada o del intento de revisión.
