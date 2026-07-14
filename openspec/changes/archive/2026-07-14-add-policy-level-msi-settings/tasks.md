## 1. Modelo de Datos

- [x] 1.1 Revisar el esquema actual de `client_products` y confirmar si existen columnas MSI estructuradas.
- [x] 1.2 Agregar columnas MSI por poliza en `client_products`: `msi_promo_active`, `msi_options`, `msi_start_date` y `msi_end_date`.
- [x] 1.3 Definir valores por defecto seguros para polizas existentes, dejando MSI por poliza desactivado si no hay datos.
- [x] 1.4 Mantener `meses_sin_intereses` visible como nota legacy, sin usarlo para resolver la promocion MSI efectiva.

## 2. UI de Polizas

- [x] 2.1 Agregar seccion "Promocion MSI" en el formulario de crear poliza.
- [x] 2.2 Agregar seccion "Promocion MSI" en el formulario de editar poliza.
- [x] 2.3 Permitir activar MSI por poliza y seleccionar opciones 3, 6, 9 y 12 meses.
- [x] 2.4 Permitir capturar fecha inicio y fecha fin de MSI por poliza.
- [x] 2.5 Validar que una poliza con MSI activo tenga al menos una opcion de meses y rango de fechas completo antes de guardar.
- [x] 2.6 Mostrar en el detalle/listado de polizas un resumen claro del estado MSI de cada poliza cuando aporte valor al usuario.

## 3. Resolucion de MSI Efectivo

- [x] 3.1 Crear una funcion de resolucion MSI efectiva que reciba configuracion global y datos de poliza.
- [x] 3.2 Implementar la matriz de prioridad: poliza activa usa poliza; poliza desactivada usa global solo si global esta activa; si ambas desactivadas no hay MSI.
- [x] 3.3 Validar opciones y rango de fechas antes de declarar MSI aplicable.
- [x] 3.4 Mantener las plantillas MSI globales como origen del asunto y cuerpo del mensaje.

## 4. Recordatorios y WhatsApp

- [x] 4.1 Actualizar `automated-reminders-batch.js` para consultar los campos MSI por poliza.
- [x] 4.2 Actualizar `automated-reminders-batch.js` para usar MSI efectivo en email y payload de WhatsApp.
- [x] 4.3 Actualizar `send-reminder-email.js` para usar MSI efectivo por poliza en el envio manual/funcion de email.
- [x] 4.4 Actualizar `src/components/clients/ReminderButton.tsx` para usar MSI efectivo al preparar el payload de WhatsApp.
- [x] 4.5 Asegurar que `{{msi_opciones}}`, fechas de promocion y datos relacionados usen la fuente efectiva correcta.
- [x] 4.6 Evitar envios automaticos duplicados por poliza cuando el batch se dispare mas de una vez.

## 5. Ajustes y Flujo Legacy

- [x] 5.1 Mantener en ajustes la configuracion MSI global como fallback y fuente de plantillas.
- [x] 5.2 Revisar el boton comentado "Enviar Promociones MSI" y eliminarlo de la experiencia activa si ya no se usa.
- [x] 5.3 Mantener `src/app/api/send-msi-promotions/route.ts`, pero dejar el flujo de envio masivo MSI inaccesible desde la UI.
- [x] 5.4 Ajustar textos de UI para explicar que la configuracion global aplica solo cuando la poliza no tiene MSI activo.

## 6. Verificacion

- [X] 6.1 Probar general activa + poliza activa: debe aplicar configuracion de poliza.
- [X] 6.2 Probar general activa + poliza desactivada: debe aplicar configuracion global.
- [X] 6.3 Probar general desactivada + poliza activa: debe aplicar configuracion de poliza.
- [X] 6.4 Probar general desactivada + poliza desactivada: no debe incluir promocion MSI.
- [X] 6.5 Probar envio manual de recordatorio con correo y WhatsApp.
- [X] 6.6 Probar proceso automatico de recordatorios con al menos una poliza por cada combinacion de prioridad.
- [x] 6.7 Ejecutar `npm run lint` y documentar si falla por deuda existente.
- [x] 6.8 Ejecutar `npm run build` porque el cambio toca rutas, componentes y logica de recordatorios.
