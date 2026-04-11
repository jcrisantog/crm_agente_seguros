# Plan de Implementación: CRM 'AI-Native' (PROGRESO)

Este plan detalla la arquitectura técnica y los pasos actuales para el CRM de agentes de seguros.

## Estado Actual: ✅ Fase 4 (En progreso avanzado)

### 1. Sistema de Documentos (Expediente)
- [x] Subida automática a Storage.
- [x] Conexión de metadatos en DB (`client_documents`).
- [x] Filtrado por póliza y sugerencia de nombres.
- [x] Página de **Expediente General** para administración global.

### 2. Gestión de Clientes y Productos
- [x] CRUD de Clientes (Alta, Edición, Perfil 360).
- [x] Catálogo maestro de Seguros (`products`) con esquemas JSON.
- [x] Asignación de pólizas a clientes (`client_products`).
- [x] Edición de pólizas asignadas.

---

## Próximas Tareas Prioritarias

### Fase 5: Notificaciones y Automatización (Pendiente)
1.  **Cálculo de Vigencias:** Implementar lógica en el Dashboard para que los indicadores de "Vencimiento en X días" sean reales basados en `issued_date`.
2.  **Alertas de Documentación:** Sistema que visualice en tiempo real cuántas pólizas activas no tienen sus documentos base cargados.

### Fase 6: Pulido Visual y UX (En curso)
1.  Reemplazar `alert()` y `confirm()` nativos por componentes **Toaster** y **Modals** (de acuerdo al objetivo de "Refining UI Feedback").
2.  Implementar animaciones de transición entre rutas.

## Estructura de Datos (Actualizada)

```sql
-- client_documents (Actualizada con file_key y name)
ALTER TABLE client_documents ADD COLUMN name TEXT;
ALTER TABLE client_documents ADD COLUMN file_key TEXT;
```

## Notas Estratégicas
- La auditoría de backend con Test Sprite sigue programada para el final de la Fase 6.
- El despliegue se mantiene enfocado en cumplir el límite de 3 usuarios activos por organización.
