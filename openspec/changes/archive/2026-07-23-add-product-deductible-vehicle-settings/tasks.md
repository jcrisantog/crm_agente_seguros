## 1. Modelo de datos y acceso

- [X]  1.1 Crear una migración de InsForge para agregar `has_deductible` booleano no nulo con valor predeterminado `false` a `products`.
- [X]  1.2 Crear la estructura de configuración global persistente con `show_vehicle_data` booleano y crear su valor inicial en `true`.
- [X]  1.3 Verificar o definir las políticas RLS necesarias para leer y actualizar la configuración desde Ajustes del Sistema.

## 2. Catálogo de productos

- [X]  2.1 Agregar el control “¿Maneja deducible?” al alta de productos y persistir `has_deductible`.
- [X]  2.2 Cargar, mostrar y actualizar `has_deductible` en la edición de productos.
- [X]  2.3 Mostrar un distintivo o texto claro de deducible en el listado del catálogo.

## 3. Ajustes y formularios de póliza

- [X]  3.1 Agregar una sección o pestaña apropiada en Ajustes del Sistema para administrar “Habilitar datos de vehículo en pólizas”.
- [X]  3.2 Cargar, guardar y aplicar un respaldo seguro de `true` cuando no exista todavía una configuración global.
- [X]  3.3 Consultar la preferencia al crear una póliza y mostrar la sección de vehículo solo cuando esté habilitada.
- [X]  3.4 Consultar la preferencia al editar una póliza y mostrar la sección de vehículo solo cuando esté habilitada.
- [X]  3.5 Garantizar que guardar una edición con los campos ocultos conserva los datos de vehículo existentes.

## 4. Validación

- [X]  4.1 Validar la creación y edición de productos con y sin deducible.
- [X]  4.2 Validar la visibilidad de vehículo con la preferencia habilitada y deshabilitada en alta y edición de póliza.
- [X]  4.3 Validar que una póliza existente conserva tipo, marca, modelo, placas, VIN y motor al guardar con la preferencia deshabilitada, y que los recupera al reactivarla.
- [X]  4.4 Ejecutar `npm run lint` y `npm run build` tras implementar los cambios de TypeScript, React y rutas.
