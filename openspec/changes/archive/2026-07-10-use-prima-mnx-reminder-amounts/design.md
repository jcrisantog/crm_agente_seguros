## Contexto

El CRM envia recordatorios de pago por email y WhatsApp. Las plantillas de email usan el placeholder `{{monto}}`, mientras que los mensajes de WhatsApp envian a n8n un payload JSON con el campo `monto`. Las implementaciones actuales obtienen ese valor de forma inconsistente: los recordatorios manuales y automaticos usan `net_premium`, y la ruta de promocion MSI usa `total_premium`.

La creacion y edicion de polizas ya calcula y persiste `prima_mnx`, que es el monto de prima visible para el cliente convertido a pesos mexicanos despues de aplicar frecuencia de pago, comision y tipo de cambio. El comportamiento solicitado es mostrar este monto en MXN tanto en email como en WhatsApp.

## Objetivos / No Objetivos

**Objetivos:**

- Usar `prima_mnx` como fuente unica del monto en mensajes de recordatorio y promocion MSI visibles para el cliente.
- Mantener la variable de plantilla existente `{{monto}}` para que las plantillas guardadas sigan funcionando.
- Agregar `{{prima_mnx}}` como variable explicita para plantillas nuevas de recordatorios y promociones MSI.
- Formatear `{{monto}}`, `{{prima_mnx}}` y el campo `monto` de WhatsApp como montos en pesos mexicanos.
- Aplicar el cambio de forma consistente en recordatorios manuales, batch automatico de recordatorios y emails de promocion MSI.

**No Objetivos:**

- Renombrar `prima_mnx` a `prima_mxn` o migrar columnas de base de datos.
- Cambiar como se calcula `prima_mnx` al crear o editar polizas.
- Cambiar la programacion de recordatorios, umbrales de elegibilidad, reglas de promocion MSI, destinatarios o comportamiento del workflow de n8n.
- Reemplazar URLs/tokens hardcodeados de n8n por variables de entorno como parte de esta correccion de fuente de monto.

## Decisiones

1. Soportar `{{monto}}` y `{{prima_mnx}}` como variables de monto en plantillas.

   Razonamiento: Las plantillas de recordatorio existentes ya usan `{{monto}}`, por lo que debe mantenerse como alias compatible. Al mismo tiempo, `{{prima_mnx}}` comunica mejor la fuente del dato para plantillas nuevas y evita ambiguedad sobre que monto se esta mostrando.

   Alternativa considerada: Reemplazar `{{monto}}` por `{{prima_mnx}}`. Esto seria mas explicito, pero obligaria a editar plantillas guardadas y podria romper mensajes existentes.

2. Obtener los montos visibles para el cliente desde `prima_mnx`.

   Razonamiento: `prima_mnx` ya se calcula en los formularios de poliza como el monto en MXN por periodo de pago. Eso coincide con la expectativa de negocio: que los recordatorios muestren el monto en pesos mexicanos en lugar del valor original de prima anual/neta.

   Alternativa considerada: Recalcular montos MXN en el codigo de recordatorios usando `net_premium`, `frecuencia_pago`, `tipo_de_cambio` y campos de comision. Esto puede provocar divergencia de formulas respecto al formulario de poliza y duplica logica de negocio.

3. Preferir una estrategia de formateo pequena y consistente dentro de cada ruta de ejecucion tocada.

   Razonamiento: Los archivos afectados incluyen tanto TypeScript de la app como funciones JavaScript estilo InsForge/Deno. Un helper compartido completo podria no ser importable directamente en todos los contextos de despliegue. La implementacion aun debe mantener consistente la expresion de formateo.

   Alternativa considerada: Introducir un modulo helper central. Seria mas limpio a largo plazo, pero podria no ser usable desde archivos de edge functions desplegadas sin cambios adicionales de bundling o despliegue.

4. Tratar la ausencia de `prima_mnx` como un caso para fallback defensivo.

   Razonamiento: Registros antiguos podrian no tener `prima_mnx` poblado. La implementacion debe evitar enviar `NaN` o montos vacios. Un fallback puede preservar el envio de mensajes dejando clara la fuente preferida.

   Alternativa considerada: Fallar el envio del recordatorio cuando falte `prima_mnx`. Esto reforzaria la calidad de datos, pero podria interrumpir recordatorios operativos para polizas legacy.

## Riesgos / Trade-offs

- `prima_mnx` faltante o desactualizado en polizas antiguas -> Usar un fallback defensivo y considerar despues una tarea de limpieza/backfill de datos.
- El nombre de campo `prima_mnx` esta escrito distinto al natural `prima_mxn` -> Mantener el nombre existente en base de datos para evitar alcance de migracion de esquema.
- Logica de formateo y reemplazo duplicada entre archivos -> Mantener la expresion consistente por ahora; considerar un helper compartido solo si estas funciones se mueven a un runtime comun.
- La URL/token de n8n actualmente estan hardcodeados en algunas rutas a pesar de existir entradas en `.env.local` -> Documentarlo como fuera de alcance para que la correccion del monto siga enfocada.
