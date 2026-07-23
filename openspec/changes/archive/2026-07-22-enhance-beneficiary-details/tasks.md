## 1. Modelo y sincronización de beneficiarios

- [X]  1.1 Ampliar el estado temporal y los objetos persistidos de beneficiarios con fecha de nacimiento, domicilio y el indicador de dirección compartida en las pantallas de alta y edición.
- [X]  1.2 Eliminar el campo `tipo` de los objetos de beneficiarios creados o actualizados, conservando la tolerancia a objetos históricos que aún lo contengan.
- [X]  1.3 Actualizar el manejo del domicilio del contratante para sincronizarlo en todos los beneficiarios cuyo indicador de dirección compartida esté activo.

## 2. Captura y visualización

- [X]  2.1 Actualizar el modal de beneficiarios al crear una póliza con los campos de fecha de nacimiento, domicilio y la opción «Misma dirección que el contratante».
- [X]  2.2 Actualizar el modal de beneficiarios al editar una póliza con el mismo comportamiento de dirección compartida e independiente.
- [X]  2.3 Actualizar las tablas de beneficiarios de ambas pantallas para mostrar los datos nuevos relevantes y retirar la columna «Tipo».
- [X]  2.4 Comprobar que los datos ausentes de pólizas históricas se presenten de forma segura durante la edición.
- [X]  2.5 Incorporar una acción de edición por beneficiario y reutilizar el modal para actualizar únicamente el registro seleccionado.

## 3. Verificación

- [X]  3.1 Verificar manualmente la captura de un beneficiario con domicilio propio y otro con el domicilio del contratante en la creación de una póliza.
- [X]  3.2 Verificar manualmente que cambiar el domicilio del contratante actualice únicamente a los beneficiarios con dirección compartida, tanto en alta como en edición.
- [X]  3.5 Verificar manualmente la edición de un beneficiario y que no modifique a los demás registros.
- [X]  3.3 Ejecutar `npm run lint` y corregir los problemas atribuibles al cambio.
- [X]  3.4 Ejecutar `npm run build` y corregir los problemas atribuibles al cambio.
