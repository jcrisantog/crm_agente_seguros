## 1. Modelo de datos en InsForge

- [X]  1.1 Inspeccionar el esquema actual de `client_products` y confirmar si ya existe un campo compatible de comentarios.
- [X]  1.2 Agregar a `client_products` las columnas nullable ausentes para resultado, fecha, motivo y comentarios de revisión anual, reutilizando el campo de comentarios si ya existe.
- [X]  1.3 Verificar que las políticas RLS actuales de `client_products` permiten leer y escribir las nuevas columnas con el mismo alcance que el resto de la póliza.

## 2. Formulario de alta de póliza

- [X]  2.1 Extender el estado del formulario de alta con resultado, fecha, motivo y comentarios.
- [X]  2.2 Incorporar en la ficha “Póliza” el selector Sí/No, la fecha con etiqueta contextual, el motivo condicional y el área de comentarios multilínea.
- [X]  2.3 Validar resultado y fecha, exigir motivo cuando el resultado sea “No” y mostrar mensajes accionables antes del guardado.
- [X]  2.4 Incluir los nuevos campos en el payload de creación y normalizar el motivo a `null` cuando el resultado sea “Sí”.

## 3. Formulario de edición de póliza

- [X]  3.1 Cargar los nuevos campos desde `client_products` sin inferir valores para pólizas históricas.
- [X]  3.2 Replicar los controles y las validaciones condicionales de revisión anual y comentarios en la ficha de edición.
- [X]  3.3 Persistir las modificaciones y limpiar el motivo al cambiar una revisión de “No” a “Sí”.

## 4. Formato monetario

- [X]  4.1 Crear o reutilizar un helper de presentación que convierta valores numéricos de forma segura y produzca símbolo `$`, separador de miles y dos decimales.
- [X]  4.2 Aplicar el helper a “Prima por Periodo en Divisa” y “Prima Por Periodo en MXN” en los formularios de alta y edición sin modificar el estado numérico ni los cálculos.

## 5. Verificación

- [X]  5.1 Validar manualmente alta y edición con revisión “Sí”, fecha obligatoria y motivo nulo.
- [X]  5.2 Validar manualmente revisión “No”, fecha programada o de intento, motivo obligatorio y persistencia multilínea de comentarios.
- [X]  5.3 Validar una póliza histórica sin revisión y la transición de “No” a “Sí” sin conservar un motivo obsoleto.
- [X]  5.4 Verificar importes cero, importes con miles y recálculos en ambas tarjetas de primas.
- [X]  5.5 Ejecutar `npm run lint` y `npm run build`.
