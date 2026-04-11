# Plan Maestro: CRM 'AI-Native' para Agentes de Seguros (PRD)

**Status:** Draft | **Versión:** 1.0
**Contexto:** Un sistema CRM optimizado para corredurías y agentes de seguros, integrando inteligencia artificial, automatizaciones avanzadas y una experiencia de usuario (UX) ágil e interactiva.

---

## 1. Executive Summary

Este CRM 'AI-Native' revoluciona la gestión de clientes y pólizas para agentes de seguros. A diferencia de las plataformas legacy y genéricas (salesforce/odoo), este software se centra en una estructura fluida, notificaciones proactivas de cobro y validación de documentos obligatorios por perfil de producto. Entregaremos una agilidad sin precedentes combinando la velocidad de **Next.js**, la versatilidad de la base de datos gestionada mediante **Insforge**, autenticación B2B/B2C con **Insforge** (con límite de 3 usuarios globales), y una interfaz "viva" vitaminada por las librerías punteras **21st.dev** y **React Bits**. Además, contará con un **Dashboard Inicial** dinámico.

---

## 2. Estructura de Base de Datos (Insforge)

La base de datos requiere relaciones flexibles entre los agentes, sus clientes, los productos contratados (pólizas) y la documentación adjunta.

### Tablas Principales y Relaciones

1. **`organizations`** (Agencia/Broker)
   - `id` (UUID, PK)
   - `name` (String)

2. **`users`** (Agentes/Staff)
   - `id` (UUID, PK - vinculado a Insforge)
   - `organization_id` (UUID, FK -> `organizations.id`)
   - `role` (Enum: 'admin', 'agent', 'assistant')
   - `name` (String)

3. **`clients`** (Asegurados)
   - `id` (UUID, PK)
   - `organization_id` (UUID, FK -> `organizations.id`)
   - `full_name` (String)
   - `email` (String, Indexed)
   - `phone` (String)
   - `created_at` (Timestamp)

4. **`products`** (Tipos de Pólizas/Servicios Base)
   - `id` (UUID, PK)
   - `organization_id` (UUID, FK)
   - `name` (String - ej. 'Auto', 'Vida', 'Gastos Médicos Mayores')
   - `description` (Text)
   - `required_docs_schema` (JSONB) - Define la lista de documentos exigidos por el producto (ej. `["identificacion", "comprobante_domicilio", "examen_medico"]`).

5. **`client_products`** (Pólizas contratadas por un cliente)
   - `id` (UUID, PK)
   - `client_id` (UUID, FK -> `clients.id`)
   - `product_id` (UUID, FK -> `products.id`)
   - `policy_number` (String, nullable)
   - `status` (Enum: 'active', 'pending', 'expired', 'canceled')
   - `issued_date` (Date)
   - `expiration_date` (Date)
   - `next_payment_date` (Date, Indexed - Crucial para renovaciones y cobros)

6. **`client_documents`** (Expedientes y Documentos)
   - `id` (UUID, PK)
   - `client_id` (UUID, FK -> `clients.id`)
   - `client_product_id` (UUID, FK -> `client_products.id`)
   - `document_type` (String - coincide con el schema de `products.required_docs_schema`)
   - `file_url` (String - vínculo al almacenamiento integrado)
   - `status` (Enum: 'missing', 'uploaded', 'verified', 'rejected')
   - `uploaded_at` (Timestamp)

*Nota: La segmentación de datos y seguridad multinivel estará sustentada sobre **Insforge**, usando las validaciones a nivel de base de datos interconectadas con el JWT de identidad.*

---

## 3. Flujo de Autenticación (Integración Insforge)

Clerk se encargará de gestionar no solo la autenticación básica, sino el modelo Multi-Tenant para las Organizaciones (Corredurías):

1. **El Creador (Dueño de Agencia):**
   - Se registra usando los servicios de autenticación de **Insforge**. Crea un "Workspace" o "Organización" directamente en el ecosistema.
   - Al crearlo, en Insforge se le asigna el rol `org:admin`. La sincronización es nativa, eliminando la necesidad de webhooks externos para la creación de la organización inicial en la base de datos.
2. **Invitación a Equipo:**
   - El Creador invita a su equipo (Agentes, Asistentes) mediante el envío de invitaciones desde el panel de control de Insforge.
3. **Roles y Permisos (Límite de 3 Usuarios MÁXIMO por CRM):**
   - **`org:admin` (Creador):** Acceso total. Configuración de productos, visualización global de la cartera, facturación y gestión del equipo.
   - **`org:member` (Agente):** Acceso a sus clientes asignados y productos. Modifica documentos y estados de la póliza.
   - **Restricción de Licencia:** El sistema rechazará la creación o invitación de un 4º usuario, manteniendo la exclusividad y cuotas de uso limitadas a 3 personas en total.
   - **Control de Acceso (Middleware):** El sistema de seguridad nativo de Insforge intercepta las rutas y valida el token de sesión (JWT) para inyectar contexto de seguridad en cada acción.

---

## 4. Investigación UI/UX: Componentes Modernos y Animaciones

Para construir un CRM que elimine la fricción y se sienta "vivo" e intuitivo frente al tedioso software de seguros legacy:

### 5 Componentes (vía 21st.dev)
1. **[Cards Inteligentes para Productos]**: Tarjetas con Glassmorphism (Texturas visuales) que muestran a un cliente y condensan de manera visual si la póliza está activa o no (`chip-tag`).
2. **[Command Palette (Input/AI Chat)]**: Un input omnipresente (Dock / AI Chat mode). El agente escribe "/cliente Buscar Juan Perez" o pregunta a la IA "¿Qué cobros vencen hoy?", trayendo agilidad como un "Spotlight" de Mac.
3. **[File Tree / Upload Interactivo]**: Componente de arrastrar y soltar con barras de progreso hermosas, esencial cuando el agente solicita documentos al cliente.
4. **[Tablas de Alta Densidad (Data Tables)]**: Filtrado, sticky headers y acciones rápidas integradas por cliente. Diseñadas para visualizar grandes listados de renovaciones.
5. **[Dialogs / Modals (Deslizantes o tipo Drawer)]**: Al dar clic en una póliza, en lugar de cambiar de página perdiendo contexto, aparece un panel de detalles deslizante, tipo "Sidebar" (como en Linear).

### 3 Animaciones Dinámicas (vía React Bits)
1. **`Text Animations` (Efecto Split/Blur en Dashboards):** Al cargar el resumen matutino ("Bienvenido de nuevo, Carlos. Tienes 3 pólizas por expirar"), el texto se devela suavemente en un blur, atrayendo la mirada a las urgencias.
2. **`Backgrounds Dinámicos` (Grid Motion o Aurora):** Solo se presentarán en la pantalla de Login y en vistas sin datos (Empty States), aportando un aire futurista sofisticado y sin distraer en la operatividad densa.
3. **`Interactive Hover Elements` (Magnet o Fluid Hover):** Botones CTA clave (como "Añadir Póliza" o "Aprobar Documento") reaccionan suavemente a la proximidad del puntero del mouse, incrementando la sensación táctil y predictiva del CRM.

---

## 5. Lógica de Negocio (Core CRM)

El cerebro operativo responde a automatizaciones y validaciones rigurosas que facilitan el trabajo del agente.

### 5.1. Dashboard Inicial (Home)
- **Al Iniciar Sesión:** Todo agente aterrizará directamente en un Main Dashboard antes de ir a secciones específicas.
- **Información Consolidada:** Presentará KPIs inmediatos: Total de pólizas activas, primas recaudadas, y una lista rápida de "Atención Requerida" con la información vital de los clientes (próximos vencimientos o documentación urgente).

### 5.2. Gestión de Cliente (CRUD)
- **Alta:** Puede realizarse manual mediante formulario o automatizada si la IA lee un PDF de KYC / ID.
- **Modificación y Consulta:** Vista 360 del Cliente. El panel deslizante mostrará a la izquierda datos de contacto, al centro todas sus pólizas y a la derecha una línea de tiempo (historial del cliente).
- **Borrado:** Soft-delete (Archive) para cumplir normativas. El registro cambia a inactivo y desaparece de las vistas transaccionales, permaneciendo para trazabilidad.

### 5.3. Gestión de Producto (Pólizas y Seguros)
- El **Admin** gestiona el catálogo maestro (`products`), modificando las coberturas básicas de forma global.
- El **Agente** asocia el catálogo al cliente (`client_products`), inyectando variables específicas (Monto asegurado, fechas de vigencia, tarifa, estatus de riesgo).

### 5.4. Configuración de Documentos Requeridos
- **Lógica Schema-driven:** Cada Producto Maestro tiene un JSON array (ej. `["ID Frontal", "Comprobante Salario", "Solicitud Firmada"]`).
- **Trigger:** Cuando a un Cliente se le contrata un Producto (inserción en `client_products`), un webhook de servidor o trigger en Insforge dispara la creación de registros fantasma en `client_documents` con estado `missing`.
- **Vista Agente:** El CRM muestra instantáneamente "Faltan 3 Documentos" para habilitar la póliza. Al agente le aparece un UI pidiendo subir dichos archivos con el "File Tree".

### 5.5. Notificaciones: Documentos Faltantes
- **Cómo:** Un cron job (background worker o Edge Function) o evaluación asíncrona cruza los `client_documents` con status `missing`.
- **Cuándo:** 
    - Al emitir la póliza (Inmediatamente).
    - 48 horas tras iniciar el trámite (Reminder).
    - El agente ve una notificación global: *"Trámites trabados por Documentos"* con un botón de 1-click para mandar un email/whatsapp automatizado al cliente solicitándolos.

### 5.6. Notificaciones: Vencimiento de Pagos / Vigencias
- **Cómo:** El sistema rastrea el campo `next_payment_date` de `client_products`.
- **Cuándo:** 
    - Se envían alertas de semáforo en el UI del Agente: **Verde** (> 30 días), **Naranja** (<= 30 días, *Renewals Queue*), **Rojo** (<= 5 días, urgencia alta).
    - 30 días antes del vencimiento: Aparece en la cola semanal del agente para enviar propuesta de renovación.
    - 3 días antes: Notificación (Toast UI animado) "Prioridad del día" para hablar a los clientes cuya póliza está a punto de caducar en la semana.
    - Opcional: Mediante IA generativa, se sugiere de antemano un correo de renovación personalizado preparado para ser enviado y con botón "Send" incluido en el panel.
