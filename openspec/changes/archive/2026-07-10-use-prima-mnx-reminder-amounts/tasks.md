## 1. Formateo De Montos

- [x] 1.1 Definir una expresion consistente para formatear `prima_mnx` como monto MXN, con fallback defensivo cuando falte el valor.
- [x] 1.2 Usar el mismo comportamiento de formateo en archivos de funciones JavaScript y archivos TypeScript de la app sin introducir una dependencia entre runtimes.

## 2. Actualizaciones De Email De Recordatorios

- [x] 2.1 Actualizar `send-reminder-email.js` para seleccionar `prima_mnx` desde `client_products`.
- [x] 2.2 Actualizar el reemplazo de `{{monto}}` en email de recordatorio manual para usar `prima_mnx` formateado.
- [x] 2.3 Actualizar el reemplazo de `{{monto}}` en la ruta MSI de `send-reminder-email.js` para usar `prima_mnx` formateado.
- [x] 2.4 Actualizar los reemplazos de `{{monto}}` en emails de recordatorio de `automated-reminders-batch.js` para usar `prima_mnx` formateado.
- [x] 2.5 Agregar reemplazo de `{{prima_mnx}}` en las plantillas de email de recordatorios manuales, automaticos y MSI.

## 3. Actualizaciones De Payload WhatsApp

- [x] 3.1 Actualizar el payload manual de WhatsApp en `src/components/clients/ReminderButton.tsx` para que `monto` use `prima_mnx` formateado.
- [x] 3.2 Actualizar el payload automatico de WhatsApp/n8n en `automated-reminders-batch.js` para que `monto` use `prima_mnx` formateado.
- [x] 3.3 Preservar todos los campos existentes del payload del webhook que no sean el monto y mantener el comportamiento de ruteo de n8n.

## 4. Actualizaciones De Promocion MSI

- [x] 4.1 Actualizar `src/app/api/send-msi-promotions/route.ts` para usar `prima_mnx` formateado en `{{monto}}`.
- [x] 4.2 Agregar reemplazo de `{{prima_mnx}}` en plantillas de promocion MSI.
- [x] 4.3 Asegurar que el filtrado de promociones MSI, variables de plantilla existentes, logging de mensajes enviados y comportamiento de Resend permanezcan sin cambios.

## 5. Verificacion

- [x] 5.1 Buscar en las rutas modificadas de recordatorios y MSI para confirmar que ningun `{{monto}}`, `{{prima_mnx}}` visible para el cliente ni `monto` de webhook siga usando `net_premium` o `total_premium`.
- [x] 5.2 Ejecutar `npm run lint`.
- [x] 5.3 Ejecutar `npm run build` si los cambios en TypeScript o rutas de Next requieren verificacion de compilacion.
- [x] 5.4 Documentar cualquier deuda restante de configuracion de webhook fuera de alcance, como URL/token de n8n hardcodeados.
