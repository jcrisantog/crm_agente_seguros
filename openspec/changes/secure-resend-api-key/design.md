## Context

El proyecto envia correos desde varias superficies:

- Funciones/scripts de InsForge basados en Deno, como `send-reminder-email.js` y `automated-reminders-batch.js`.
- Rutas server-side de Next.js, como `src/app/api/send-msi-promotions/route.ts`.
- Scripts legacy o temporales que aun pueden estar en el repositorio.

Actualmente algunas inicializaciones de Resend usan llaves hardcodeadas o fallbacks sensibles. Eso expone la credencial si el codigo se sube al repositorio y provoca que Resend pueda invalidarla automaticamente.

## Goals / Non-Goals

**Goals:**
- Usar `RESEND_API_KEY` como unico nombre de configuracion para Resend en todos los entornos.
- Leer la llave desde InsForge Secrets en funciones Edge.
- Leer la llave desde variables server-side en Dokploy y runtime Next.js.
- Fallar de forma explicita si falta la llave, sin usar fallbacks hardcodeados.
- Eliminar llaves reales de scripts activos, legacy y temporales que permanezcan en el repositorio.

**Non-Goals:**
- Cambiar proveedor de correo.
- Cambiar plantillas, destinatarios, reglas MSI o reglas de recordatorios.
- Rotar la llave real de Resend desde el codigo. La rotacion debe hacerse en Resend y luego actualizar secretos/variables por entorno.
- Exponer `RESEND_API_KEY` como variable publica `NEXT_PUBLIC_*`.

## Decisions

### Usar `RESEND_API_KEY` como nombre unico

Se usara `RESEND_API_KEY` en todos los entornos. Esto evita ramas por ambiente y reduce errores al desplegar funciones o la app de Next.js.

Alternativa considerada: usar nombres distintos como `INSFORGE_RESEND_API_KEY` o `DOKPLOY_RESEND_API_KEY`. Se descarta porque duplica configuracion sin aportar seguridad adicional.

### InsForge Secrets para funciones Edge

Las funciones Deno deben leer la llave con `Deno.env.get("RESEND_API_KEY")`. En InsForge, ese valor debe existir como secret por proyecto, por ejemplo produccion y test.

Esto mantiene la credencial fuera del codigo fuente y permite que cada proyecto tenga su propia llave.

### Variables server-side de Dokploy para Next.js

Las rutas API de Next.js deben leer `process.env.RESEND_API_KEY`. En Dokploy, el valor debe configurarse como variable de entorno del servicio. No debe tener prefijo `NEXT_PUBLIC_` porque ese prefijo la expondria al cliente.

### Sin fallback secreto

La inicializacion de Resend no debe tener fallback a una llave real. Si `RESEND_API_KEY` falta o viene vacia, el flujo debe devolver un error claro para operacion, por ejemplo indicando que falta configurar `RESEND_API_KEY` en el entorno actual.

### Manejo de scripts legacy y temporales

Los scripts que ya no se usen deben eliminarse o dejarse sin llaves reales. Si se conservan para referencia operativa, deben leer `RESEND_API_KEY` igual que los scripts activos.

## Risks / Trade-offs

- Configuracion faltante en algun entorno -> Mitigacion: agregar validacion explicita y checklist de despliegue para InsForge y Dokploy.
- Diferentes llaves entre test y produccion -> Mitigacion: documentar que cada proyecto debe tener su propio `RESEND_API_KEY`.
- Falsos positivos al buscar patrones de secretos -> Mitigacion: permitir placeholders no validos, pero bloquear llaves reales con prefijo de Resend en codigo fuente.
- Scripts legacy no usados pueden seguir exponiendo llaves -> Mitigacion: incluirlos en el inventario y decidir si se eliminan o se migran a env.

## Migration Plan

1. Inventariar todos los usos de Resend en codigo activo, rutas server-side y scripts temporales.
2. Cambiar cada inicializacion a lectura de `RESEND_API_KEY` desde el runtime correspondiente.
3. Eliminar fallbacks sensibles y agregar errores explicitos cuando falte la variable.
4. Configurar `RESEND_API_KEY` como secret en cada proyecto de InsForge que ejecute funciones de correo.
5. Configurar `RESEND_API_KEY` como variable server-side en Dokploy para la app Next.js.
6. Verificar que no queden llaves reales en archivos versionables.
7. Probar envio de recordatorio individual, batch automatico y promociones MSI si la ruta sigue disponible.

Rollback: restaurar la version anterior del codigo no es recomendable si contiene llaves hardcodeadas. Si falla el envio, primero validar que `RESEND_API_KEY` exista en el entorno correcto y redeplegar la funcion o servicio afectado.

## Open Questions

- Confirmar si `automated_reminders_v2.js` y `tmp_send_reminder.js` siguen siendo necesarios o si deben eliminarse como parte de limpieza.
- Confirmar si produccion y test usaran la misma llave de Resend o llaves separadas por entorno.
