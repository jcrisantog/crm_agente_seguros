## Context

La configuracion MSI actual vive en `reminder_settings` como ajuste global: activo, opciones de meses, rango de fechas, asunto y plantilla. Esa configuracion se usa en recordatorios automaticos, envio manual desde el boton de recordatorio y el flujo legacy de promociones MSI.

El nuevo requerimiento mueve la decision comercial de MSI al nivel de poliza. Un cliente puede tener varias polizas y cada una puede requerir una promocion distinta. La configuracion global debe mantenerse como respaldo y como fuente de plantillas, no como unico origen de elegibilidad.

El proyecto ya guarda polizas en `client_products` y tiene un campo libre `meses_sin_intereses`. Ese campo no es suficiente para resolver activacion, opciones permitidas ni vigencia de la promocion de forma confiable.

## Goals / Non-Goals

**Goals:**

- Agregar una configuracion MSI estructurada por poliza en `client_products`.
- Hacer que una poliza con MSI activo tenga prioridad sobre la configuracion global.
- Usar la configuracion global cuando la poliza no tenga MSI activo y el global si este activo.
- Permitir que una poliza active MSI aunque la configuracion global este desactivada.
- Reutilizar las plantillas globales de MSI para correo y WhatsApp.
- Actualizar recordatorios automaticos y envio manual para calcular una configuracion MSI efectiva por poliza.
- Reducir ruido en UI retirando el flujo manual global "Enviar Promociones MSI" si ya no se usa.

**Non-Goals:**

- No crear plantillas MSI personalizadas por poliza.
- No crear una configuracion MSI a nivel cliente.
- No cambiar las reglas principales de seleccion de polizas para recordatorios.
- No modificar credenciales, integraciones de Resend, InsForge o N8N fuera de los datos enviados por recordatorios.
- No resolver historiales antiguos de MSI salvo que sea necesario para evitar referencias rotas.

## Decisions

1. Guardar MSI por poliza en `client_products`.

   La poliza es la entidad que define vigencia, prima, forma de pago y fecha limite de pago. Poner MSI aqui evita ambiguedad cuando un cliente tiene varias polizas con promociones diferentes.

   Alternativa considerada: guardar MSI en `clients`. Se descarta porque aplicaria una misma promocion a todas las polizas del cliente y no cubre el caso de polizas con condiciones distintas.

2. Usar campos estructurados nuevos y mantener `meses_sin_intereses` como dato legacy.

   Campos propuestos:

   - `msi_promo_active`: booleano.
   - `msi_options`: arreglo o JSON con valores `"3"`, `"6"`, `"9"`, `"12"`.
   - `msi_start_date`: fecha de inicio.
   - `msi_end_date`: fecha de fin.

   El campo `meses_sin_intereses` debe seguir visible como nota legacy en la UI, pero la logica nueva no debe parsear texto libre para tomar decisiones de negocio.

3. Resolver MSI con prioridad de poliza.

   Regla efectiva:

   ```text
   si poliza.msi_promo_active es true:
       usar opciones y rango de la poliza
   si no, si reminder_settings.msi_active es true:
       usar opciones y rango global
   si no:
       no incluir promocion MSI
   ```

   Esta regla permite que una poliza activa en MSI aplique aunque la configuracion global este desactivada. Tambien permite que una poliza desactivada herede la configuracion global cuando esta exista.

4. Validar configuraciones incompletas como "no aplicables" con mensajes claros.

   Una configuracion MSI activa necesita opciones y rango de fechas. Si faltan datos, el flujo no debe inventar una promocion ni caer silenciosamente en datos incorrectos. En UI se debe prevenir guardar una configuracion activa incompleta; en procesos de envio se debe omitir MSI para esa poliza y registrar o devolver el motivo cuando aplique.

5. Mantener plantillas MSI globales.

   El origen de la configuracion efectiva decide `{{msi_opciones}}`, `{{fecha_pago_menos_10}}` y fechas de promocion. El cuerpo y asunto MSI siguen saliendo de `reminder_settings.msi_email_template` y `reminder_settings.msi_email_subject`, con fallback a las plantillas normales cuando corresponda.

6. Centralizar el calculo de MSI efectivo.

   La logica de MSI aparece en varios lugares. La implementacion debe preferir un helper compartido en `src` para UI/rutas Next y una funcion equivalente o copiada de forma controlada para scripts de raiz si no pueden importar TypeScript directamente. El objetivo es que recordatorio manual, automatico y email resuelvan MSI igual.

## Risks / Trade-offs

- [Riesgo] El esquema de InsForge puede no tener columnas MSI por poliza. -> Mitigacion: crear migracion/SQL o instrucciones de alter table antes de actualizar UI y envios.
- [Riesgo] `automated-reminders-batch.js` y `send-reminder-email.js` son archivos JavaScript de raiz y pueden no compartir imports con `src`. -> Mitigacion: mantener la funcion de resolucion pequena y duplicarla solo si el entorno de despliegue lo requiere.
- [Riesgo] Configuraciones activas incompletas pueden causar promociones incorrectas. -> Mitigacion: validacion en UI y omision explicita en runtime con motivo registrable.
- [Riesgo] El boton o API legacy de promociones MSI puede seguir siendo llamado por usuarios o automatizaciones. -> Mitigacion: confirmar que el boton esta comentado/no disponible, y retirar la ruta solo si no hay consumidores; si hay duda, dejarla devolviendo un mensaje claro o adaptarla al modelo por poliza.
- [Riesgo] Pueden existir datos en `meses_sin_intereses`. -> Mitigacion: no borrar el campo en este cambio; tratarlo como referencia visual o dato historico hasta decidir migracion.

## Migration Plan

1. Agregar columnas MSI por poliza en `client_products` con valores por defecto inactivos o nulos.
2. Actualizar formularios de crear y editar poliza para guardar la nueva configuracion.
3. Actualizar queries de recordatorios para traer campos MSI de `client_products`.
4. Implementar resolucion de configuracion MSI efectiva por poliza.
5. Actualizar payloads de correo y WhatsApp para usar opciones/rango efectivos.
6. Retirar o neutralizar el flujo manual global de "Enviar Promociones MSI" si no se usa.
7. Validar con lint/build y pruebas manuales de las cuatro combinaciones de prioridad.

Rollback: si la configuracion por poliza causa problemas, desactivar lectura de los campos nuevos en la resolucion y volver a usar solo `reminder_settings`, dejando las columnas sin eliminar para evitar perdida de datos.

## Open Questions

- Ninguna por ahora.

## Confirmed Decisions

- `meses_sin_intereses` permanece visible como nota legacy en la UI.
- `src/app/api/send-msi-promotions/route.ts` no se elimina en este cambio; el flujo queda inaccesible desde la UI.
