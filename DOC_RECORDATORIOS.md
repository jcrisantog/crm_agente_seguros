# 🛡️ Guía Técnica: Recordatorios de Pago Automáticos (v2)

Esta guía detalla la solución implementada para corregir el sistema de envío de correos que presentaba fallas en la detección de pólizas y en el historial de envíos.

## 🚨 Problemas Identificados (v1)

1. **Comparación de Fechas Rígida:** El sistema solo buscaba pólizas cuya `fecha_pago` coincidiera *exactamente* con `hoy + N días`. Si el proceso fallaba un día, las pólizas de ese día se perdían para siempre.
2. **Exclusión de Pólizas Vencidas:** No se tomaban en cuenta pólizas en estado "Pendiente" o aquellas cuya fecha ya había pasado pero seguían activas.
3. **Errores de Zona Horaria:** Los componentes de fecha a veces causaban saltos de un día dependiendo de la hora de ejecución del servidor.
4. **Resend Sandbox:** La cuenta de Resend (proveedor de emails) está en modo de prueba, lo que restringe los envíos únicamente a la dirección de correo autorizada (jcrisantog@gmail.com).

---

## ✅ Solución Aplicada (v2)

Se reescribió la Edge Function `automated-reminders-batch` con las siguientes mejoras:

### 1. Detección por Rango (Detección Proactiva)
En lugar de buscar un día específico, la función ahora:
- Calcula el umbral máximo configurado (ej. 15 días).
- Consulta todas las pólizas cuya fecha de pago sea **menor o igual** a `hoy + 15 días`.
- Esto permite detectar tanto las que están por vencer como las que ya vencieron (**pago atrasado**).

### 2. Lógica de Envío Inteligente
Dentro del proceso, se evalúa cada póliza de forma individual:
- **Si faltan exactamente 15, 10 o 5 días:** Se envía el recordatorio correspondiente.
- **Si faltan 0 días o son negativos:** Se envía como "Aviso de Pago Vencido".
- **Otros casos:** Se registra en el log como "Analizada" pero no se envía correo para evitar spam.

### 3. Normalización de Fechas
Se forzó el uso de la zona horaria `America/Mexico_City` y se normalizaron todas las horas a las `12:00:00` para asegurar que las comparaciones de días sean exactas y no dependan de si el servidor corre en UTC o localmente.

### 4. Mejora en el Historial (Logs)
Se corrigió el contador del historial:
- **Pólizas Analizadas:** Ahora incluye todas las pólizas que el sistema revisó meticulosamente.
- **Envíos Realizados:** Solo cuenta los correos que salieron con éxito hacia Resend.
- **Detalles:** En la base de datos `reminder_logs`, el campo `details` ahora guarda el motivo exacto por el cual no se envió un correo (ej: "Días no coinciden con umbrales").

---

## 🛠️ Mantenimiento Futuro

Si el sistema vuelve a reportar "0 envíos" habiendo pólizas próximas:

1. **Verificar Umbrales:** Asegúrate de que los días configurados en **Ajustes > Recordatorios Email** coincidan con los días que faltan para el vencimiento de tus pólizas.
2. **Revisar Estatus:** La póliza en la base de datos debe estar marcada como **"Activa"** o **"Pendiente"**.
3. **Validar Emails en Resend:** Si el cliente tiene un email distinto a `jcrisantog@gmail.com`, el envío fallará hasta que verifiques un dominio en [Resend.com](https://resend.com/domains).
4. **Logs de Error:** Revisa la tabla `reminder_logs` en el panel de Insforge para ver el campo `error_details` si el estado es `error`.

---

## 📄 Archivos Relevantes
- **Edge Function:** `automated-reminders-batch`
- **Configuración:** Tabla `reminder_settings`
- **Historial:** Tabla `reminder_logs`
