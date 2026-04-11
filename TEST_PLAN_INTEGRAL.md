# Plan de Pruebas Integrales - CRM Seguros

Este documento define los escenarios de prueba críticos para validar la funcionalidad completa del CRM, desde la persistencia de datos hasta la integridad de la experiencia de usuario.

---

## 1. Módulo: Dashboard (KPIs y Alertas)
**Objetivo:** Validar que los indicadores reflejen el estado real de la base de datos y que las alertas sean oportunas.

| ID | Escenario | Resultado Esperado |
| :--- | :--- | :--- |
| **D-01** | Cálculo de Prima Total Automática | La suma de `total_premium` de todas las pólizas activas debe coincidir con el KPI superior. |
| **D-02** | Alerta de Pago Próximo | Cualquier póliza con `payment_limit` en los próximos 7 días debe aparecer en la sección de "Atención Urgente". |
| **D-03** | Alerta de Documentos Faltantes | Si una póliza asignada carece de un archivo definido en el `required_docs_schema` de su producto, debe generar una alerta en el dashboard. |
| **D-04** | Navegación de Alertas | Hacer clic en una alerta de 'Documento Faltante' debe redirigir directamente al expediente del cliente con el filtro de la póliza activo. |

---

## 2. Módulo: Gestión de Clientes (CRUD 360)
**Objetivo:** Asegurar la integridad de la información del asegurado.

| ID | Escenario | Resultado Esperado |
| :--- | :--- | :--- |
| **C-01** | Registro de Nuevo Asegurado | Al guardar, los datos deben persistir en Insforge y redirigir automáticamente al perfil del nuevo cliente. |
| **C-02** | Validación de Campos Obligatorios | Intentar guardar sin 'Nombre Completo' debe activar el estilo de error en el componente `<Input />` y bloquear el envío. |
| **C-03** | Filtro de Búsqueda Reactivo | Escribir en el buscador del directorio debe filtrar la lista de clientes instantáneamente sin recargar la página. |
| **C-04** | Formateo de Datos | El teléfono y correo deben visualizarse correctamente en la tabla de clientes y en el perfil individual. |

---

## 3. Módulo: Pólizas y Riesgos
**Objetivo:** Validar la asignación compleja de productos y cálculos financieros.

| ID | Escenario | Resultado Esperado |
| :--- | :--- | :--- |
| **P-01** | Asignación de Póliza Vehicular | Registrar una póliza con marca, modelo y placas. Verificar que aparezcan en el resumen de 'Riesgos' del cliente. |
| **P-02** | Manejo de Decimales (Prima) | Ingresar `150.25` en Prima Neta y `24.04` en IVA. Validar que la DB guarde los valores exactos y el UI los muestre con símbolo de moneda. |
| **P-03** | Estatus Dinámico | Cambiar una póliza de 'Activa' a 'Cancelada'. El Dashboard debe actualizar el conteo global de pólizas activas. |
| **P-04** | Catálogo de Productos | El selector de "Tipo de Seguro" debe cargar dinámicamente las opciones desde la tabla `products`. |

---

## 4. Módulo: Expediente Digital (Documentos)
**Objetivo:** Probar la sincronización entre Storage y Database.

| ID | Escenario | Resultado Esperado |
| :--- | :--- | :--- |
| **DOC-01** | Carga de Archivo Real | Subir un PDF/Imagen. Verificar que se genere un registro en `client_documents` y que el archivo sea accesible mediante el botón "Descargar". |
| **DOC-02** | Integridad del Borrado | Eliminar un documento. Se debe abrir el `ConfirmModal`, y tras confirmar, el archivo debe borrarse tanto de la nube (Storage) como de la lista. |
| **DOC-03** | Sugerencia de Nombre | Al subir un archivo, el sistema debe sugerir el nombre basándose en los documentos requeridos de la póliza seleccionada. |

---

## 5. Sistema-Wide (UI/UX y Errores)
**Objetivo:** Validar la estabilidad global y el feedback al usuario.

| ID | Escenario | Resultado Esperado |
| :--- | :--- | :--- |
| **SYS-01** | Notificaciones (Toasts) | Cada acción exitosa (Subida, Registro, Borrado) debe disparar un toast de `sonner` en la esquina superior derecha. |
| **SYS-02** | Error Boundary (Red/DB) | Simular pérdida de conexión a Insforge. El sistema debe mostrar `error.tsx` con el botón de "Reintentar" en lugar de quedar en blanco. |
| **SYS-03** | Responsividad | Validar que el Dashboard y los formularios se adapten a dispositivos móviles sin pérdida de funcionalidad. |
| **SYS-04** | Animación de Navegación | Asegurar que las transiciones entre páginas mantengan el efecto *fade-in slide* de Framer Motion. |

---

## Instrucciones para Ejecución Manual
1. Abrir la consola del navegador (F12) para monitorear errores de red.
2. Seguir cada caso de prueba en orden secuencial.
3. Al finalizar, verificar los registros en el **Dashboard de Insforge** para confirmar que no hay datos huérfanos.
