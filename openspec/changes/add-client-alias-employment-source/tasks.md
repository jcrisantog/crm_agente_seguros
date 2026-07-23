## 1. Modelo de datos

- [X]  1.1 Crear una migracion de InsForge para agregar `alias`, `situacion_laboral` y `fuente` opcionales a `clients`.
- [X]  1.2 Restringir `situacion_laboral` a Empleado, Independiente y Otro, manteniendo compatibilidad con registros existentes sin valor.
- [X]  1.3 Verificar que las politicas de lectura y escritura permitan los nuevos campos y las consultas de Fuente solo en el alcance autorizado.

## 2. Captura y consulta del perfil de asegurado

- [X]  2.1 Agregar Alias, Situacion laboral y Fuente al formulario de alta de asegurado y persistirlos al guardar.
- [X]  2.2 Agregar los tres campos al formulario de edicion, cargando sus valores existentes y actualizandolos al guardar.
- [X]  2.3 Mostrar Alias, Situacion laboral y Fuente en el perfil del asegurado cuando tengan valor.
- [X]  2.4 Implementar las sugerencias de Fuente con debounce, limite de resultados, coincidencia parcial sin distinguir mayusculas ni acentos, y deduplicacion de valores equivalentes.
- [X]  2.5 Mantener la captura de Fuente como texto libre cuando el usuario no seleccione una sugerencia.

## 3. Nombre preferido en recordatorios

- [X]  3.1 Actualizar `send-reminder-email.js` para consultar Alias y sustituir `{{nombre}}` por Alias limpio o Nombre completo como respaldo en todos sus flujos de plantilla.
- [X]  3.2 Actualizar `automated-reminders-batch.js` para consultar Alias y usar el nombre preferido en las plantillas de email y payloads automaticos de WhatsApp.
- [X]  3.3 Actualizar `ReminderButton.tsx` para consultar Alias y enviar el nombre preferido en el campo `nombre` del payload manual de WhatsApp.
- [X]  3.4 Confirmar que los payloads existentes de n8n y los placeholders de las plantillas se conservan sin cambios fuera del valor resuelto de nombre.

## 4. Validacion

- [X]  4.1 Validar alta, edicion y perfil con los tres campos completos y con campos opcionales vacios.
- [X]  4.2 Validar sugerencias de Fuente para coincidencias parciales, sin distincion de mayusculas ni acentos, duplicados equivalentes y valores nuevos.
- [X]  4.3 Validar email y WhatsApp manuales y automaticos con asegurados con Alias, sin Alias y con Alias compuesto solo por espacios.
- [ ]  4.4 Ejecutar `npm run lint` y `npm run build` despues de los cambios de aplicacion, y registrar cualquier verificacion de funciones o migracion que dependa de InsForge.
