## 1. Inventario y limpieza de superficies

- [x] 1.1 Identificar todos los archivos versionables que inicializan Resend o envian correos.
- [x] 1.2 Clasificar cada archivo como activo, legacy o temporal antes de modificarlo o eliminarlo.
- [x] 1.3 Confirmar si `automated_reminders_v2.js` y `tmp_send_reminder.js` deben conservarse; si se conservan, migrarlos a `RESEND_API_KEY`.

## 2. Codigo de funciones y rutas

- [x] 2.1 Actualizar `send-reminder-email.js` para leer Resend desde `Deno.env.get("RESEND_API_KEY")`.
- [x] 2.2 Actualizar `automated-reminders-batch.js` para leer Resend desde `Deno.env.get("RESEND_API_KEY")`.
- [x] 2.3 Actualizar `automated_reminders_v2.js` si sigue siendo operativo o dejarlo sin secretos reales si solo queda como referencia legacy.
- [x] 2.4 Actualizar `src/app/api/send-msi-promotions/route.ts` para usar exclusivamente `process.env.RESEND_API_KEY`.
- [x] 2.5 Eliminar cualquier fallback hardcodeado de Resend y agregar errores explicitos cuando falte `RESEND_API_KEY`.

## 3. Configuracion por entorno

- [x] 3.1 Documentar que InsForge produccion y test deben tener un secret activo `RESEND_API_KEY`.
- [x] 3.2 Documentar que Dokploy debe tener `RESEND_API_KEY` como variable server-side del servicio Next.js.
- [x] 3.3 Confirmar que no se use `NEXT_PUBLIC_RESEND_API_KEY` ni ningun prefijo publico para la llave de Resend.

## 4. Verificacion

- [x] 4.1 Ejecutar una busqueda de patrones para confirmar que no quedan llaves reales de Resend en archivos versionables.
- [x] 4.2 Ejecutar `npm run lint` si se toca codigo TypeScript o rutas Next.js.
- [x] 4.3 Ejecutar `npm run build` si se modifica la ruta API o configuracion que pueda afectar compilacion.
- [ ] 4.4 Probar envio de recordatorio individual, batch automatico y promociones MSI si la ruta sigue accesible.
