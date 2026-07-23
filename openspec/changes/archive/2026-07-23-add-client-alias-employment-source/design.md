## Context

El CRM guarda a los asegurados en `clients`. La alta y edicion del perfil se realizan en paginas cliente de `src/app/clients`, y el detalle carga el registro completo. Los recordatorios usan el nombre completo desde implementaciones separadas: la funcion de email manual (`send-reminder-email.js`), el lote automatico (`automated-reminders-batch.js`) y el payload manual de WhatsApp construido por `ReminderButton.tsx` y enviado a n8n.

La fuente debe poder capturarse libremente sin obligar a mantener un catalogo, pero reutilizar valores registrados reduce variaciones de escritura y facilita su consulta futura.

## Goals / Non-Goals

**Goals:**

- Persistir `alias`, `situacion_laboral` y `fuente` como atributos opcionales del asegurado.
- Usar el alias no vacio como nombre de comunicacion y conservar `full_name` como respaldo en todos los recordatorios de email y WhatsApp.
- Ofrecer sugerencias de fuentes ya usadas con coincidencia parcial, insensible a mayusculas y acentos, sin impedir escribir valores nuevos.
- Mantener los campos disponibles y visibles en alta, edicion y perfil del asegurado.

**Non-Goals:**

- No sustituir `full_name` como nombre legal, de busqueda o de documentos.
- No crear un catalogo administrable, clasificacion automatica ni reporte de fuentes en este cambio.
- No cambiar el contenido, los umbrales, destinatarios ni la configuracion de plantillas de recordatorios.
- No cambiar el flujo interno de n8n; solo el valor de nombre que recibe en el payload existente.

## Decisions

### Campos opcionales directamente en `clients`

Se agregaran columnas de texto opcionales `alias` y `fuente`, y una columna de texto opcional `situacion_laboral`. Este ultimo campo se capturara con un selector de opciones fijas: `Empleado`, `Independiente` y `Otro`.

Se prefiere una restriccion a nivel de datos para la situacion laboral, ademas del selector de interfaz, para impedir valores no admitidos desde otros clientes del SDK. Los campos se mantienen opcionales para no bloquear los asegurados historicos ni la captura cuando el dato se desconoce.

Alternativa descartada: almacenar los tres valores dentro de `additional_info` o un JSON. Se descarta porque dificulta validacion, sugerencias de fuentes y uso confiable del alias por las funciones de recordatorio.

### Nombre preferido con respaldo seguro

Cada emisor de recordatorios resolvera el nombre como `alias` limpio cuando exista; de lo contrario utilizara `full_name`. El resultado conserva el nombre de variable o placeholder existente (`{{nombre}}` para email y `nombre` para WhatsApp) para no requerir cambios en plantillas ni flujos de n8n.

Las consultas que cargan el asegurado para email y recordatorios automaticos incluiran `alias`. El envio manual de WhatsApp tambien incluira el campo al consultar el cliente. Esto cubre los cuatro recorridos: email manual, email automatico, WhatsApp manual y WhatsApp automatico.

Alternativa descartada: crear `{{alias}}` como placeholder adicional. Se descarta porque dejaría plantillas actuales usando el nombre legal y exigiría que el usuario las modifique para obtener el beneficio solicitado.

### Fuente libre con sugerencias normalizadas al consultar

La interfaz pedira valores distintos de `clients.fuente` con contenido, y filtrara por coincidencia de subcadena sin distinguir mayusculas ni acentos. Las sugerencias se deduplicaran por una clave normalizada (recorte de espacios, minusculas y sin acentos), preservando un valor legible para mostrar. Seleccionar una sugerencia completa el campo; el usuario puede conservar o guardar cualquier texto nuevo.

La consulta se ejecutara con una espera breve mientras se escribe y un limite de resultados para evitar cargar todos los asegurados o realizar una solicitud por pulsacion. Debe respetar las politicas existentes de lectura de `clients`; no se expondran fuentes de registros que el usuario no pueda consultar.

Alternativa descartada: un `datalist` alimentado con todos los valores al abrir el formulario. Se descarta por escalabilidad, falta de control sobre deduplicacion y experiencia limitada en dispositivos moviles.

## Risks / Trade-offs

- [Riesgo] Alias vacio, solo con espacios o desactualizado. → Mitigacion: recortar el valor antes de resolverlo y usar `full_name` como respaldo obligatorio.
- [Riesgo] Valores equivalentes de Fuente como `Facebook` y `facebook` generan sugerencias repetidas. → Mitigacion: deduplicar con una clave normalizada en la capa de sugerencias.
- [Riesgo] Una consulta de sugerencias por cada caracter puede afectar la respuesta de la pantalla. → Mitigacion: aplicar debounce, minimo de caracteres y limite de resultados; indexar o ajustar la estrategia de consulta si el volumen de asegurados lo exige.
- [Riesgo] Las funciones de recordatorio estan fuera de `src` y se despliegan por separado. → Mitigacion: incluir los dos archivos de funciones y verificar sus payloads y reemplazos de plantilla antes del despliegue.
- [Riesgo] RLS puede impedir leer fuentes de algunos asegurados. → Mitigacion: usar el mismo contexto autenticado y aceptar que las sugerencias reflejen solo registros autorizados.

## Migration Plan

1. Aplicar una migracion aditiva para crear los tres campos en `clients`, con valores nulos permitidos y validacion para `situacion_laboral`.
2. Desplegar los cambios de interfaz y de funciones de recordatorio; los registros existentes seguiran usando `full_name` por el respaldo.
3. Validar altas, ediciones, sugerencias y los cuatro recorridos de recordatorio con asegurados con y sin alias.
4. Si se requiere reversa, retirar el uso de los campos en la aplicacion primero. Las columnas pueden permanecer sin afectar los flujos existentes; solo se eliminan mediante una migracion explicita posterior si se aprueba.

## Open Questions

- No hay preguntas abiertas que bloqueen la implementacion. Los tres campos se tratan como opcionales y la coincidencia de Fuente ya se definio como parcial, sin distincion de mayusculas ni acentos.
