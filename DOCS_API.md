# Guia de Datos y Patrones (Backend-as-a-Service)

El proyecto utiliza **Insforge** como backend unificado. No existen endpoints REST tradicionales administrados en este repositorio; en su lugar, se utiliza el patrón de acceso directo a datos mediante el SDK, protegido por políticas de RLS (Row Level Security).

## Esquema de Datos Principal

### 1. Clientes (`clients`)
Gestiona la información básica del asegurado.

| Operación | Método SDK | Descripción |
| :--- | :--- | :--- |
| **Listar** | `insforge.database.from("clients").select("*")` | Obtiene todos los asegurados. |
| **Crear** | `insforge.database.from("clients").insert({...})` | Registra un nuevo asegurado. |
| **Detalle** | `insforge.database.from("clients").select("*").eq("id", id)` | Obtiene perfil único. |

---

### 2. Pólizas (`client_products`)
Relaciona a un cliente con un producto de seguro específico.

- **Filtros comunes:**
  - `status`: 'Activa', 'Pendiente', 'Cancelada'.
  - `payment_limit`: Fecha límite para gestión de cobranza.

**Ejemplo de Inserción (Body):**
```json
{
  "client_id": "uuid",
  "product_id": "uuid",
  "insurer": "GNP",
  "policy_number": "POL-123",
  "status": "Activa",
  "total_premium": 15000.50
}
```

---

### 3. Documentos (`client_documents`)
Gestión de archivos binarios y metadatos.

- **Almacenamiento (Storage):** Se utiliza el bucket `documents`.
- **Base de Datos:** Se guarda la relación `file_url` y `file_key`.

**Flujo de Subida:**
1. `insforge.storage.from("documents").uploadAuto(file)` -> Retorna `url` y `key`.
2. `insforge.database.from("client_documents").insert({ file_url, file_key, ... })`.

---

## Gestión de Errores

El sistema utiliza un patrón de errores "Fail-Fast" en Server Components:

1. Si una consulta devuelve `{ error }`, se lanza una excepción: `throw new Error(...)`.
2. El archivo `src/app/error.tsx` captura la excepción y muestra al usuario una interfaz de recuperación.
3. En el cliente, se utiliza `sonner` para mostrar toasts reactivos con el mensaje de error técnico formateado.

## Seguridad y Acceso

- **RLS (SQL):** El acceso está restringido por la `anon_key` y políticas SQL que aseguran que los datos solo sean accesibles por usuarios autorizados (se asume configuración en Insforge).
- **Client Side Safety:** Ningún componente filtra datos sensibles basándose únicamente en lógica JS; la base de datos debe aplicar los filtros de seguridad.
