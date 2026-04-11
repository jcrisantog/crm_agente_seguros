# AI-Native Insurance CRM

Sistema de gestión de relaciones con clientes (CRM) diseñado específicamente para agentes de seguros, optimizado para la eficiencia en la gestión de pólizas, expedientes digitales y seguimiento de renovaciones.

**Problema que resuelve:** Elimina la dispersión de información y la falta de seguimiento en carteras de seguros mediante la centralización de datos de clientes, automatización de alertas de pago/renovación y digitalización del expediente del asegurado en una interfaz de alto rendimiento.

## 🛠️ Requisitos Previos

- **Node.js**: v20.x o superior
- **npm**: v10.x o superior
- **Insforge Project**: Una instancia activa de Insforge para la base de datos y almacenamiento.

## 🚀 Instalación y Arranque Rápido

Ejecuta estos comandos para tener el proyecto listo en menos de 30 segundos:

```bash
# 1. Clonar (o entrar al directorio) e instalar dependencias
npm install

# 2. Configurar variables de entorno (Copia el ejemplo)
echo "NEXT_PUBLIC_INSFORGE_URL=https://tu-proyecto.insforge.com
NEXT_PUBLIC_INSFORGE_ANON_KEY=tu-anon-key-aqui" > .env.local

# 3. Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📂 Estructura del Proyecto

```text
CRM/
├── src/
│   ├── app/                # Rutas de Next.js (App Router)
│   │   ├── clients/        # Gestión de asegurados y expedientes
│   │   ├── products/       # Catálogo y asignación de pólizas
│   │   ├── globals.css     # Estilos globales y Tailwind config
│   │   └── page.tsx        # Dashboard principal (KPIs)
│   ├── components/
│   │   └── ui/             # Sistema de diseño (Button, Input, Modals)
│   ├── lib/
│   │   ├── insforge.ts     # Configuración del SDK de Backend
│   │   └── utils.ts        # Funciones auxiliares (clsx, twMerge)
├── public/                 # Assets estáticos
└── testsprite_tests/       # Planes y reportes de pruebas automatizadas
```

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo | Obligatoria |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_INSFORGE_URL` | URL base de la API de Insforge | `https://xyz.insforge.com` | Sí |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Llave pública de acceso (Anon Key) | `eyJhbGciOiJIUzI1...` | Sí |

---

## 🧪 Pruebas

El proyecto utiliza **TestSprite** para pruebas integrales y auditoría de código.

```bash
# Ejecutar linting
npm run lint

# Para pruebas con TestSprite (requiere mcp-server configurado)
# Ver directorio /testsprite_tests para planes de ejecución
```

---

## 📝 Guía de Endpoints e Interacción de Datos

El sistema utiliza **Insforge SDK** directamente en el frontend (Client-Side) y backend (Server Components).

### Entidades Principales

#### 1. Clients (`/clients`)
- **GET**: Recupera la lista de asegurados con conteo de pólizas.
- **POST**: Registra un nuevo asegurado.

#### 2. Policies (`/client_products`)
- **GET**: Filtra pólizas por `client_id` o vigencia.
- **POST**: Asigna una póliza a un cliente (incluye datos de riesgo/vehículo).

#### 3. Documents (`/client_documents`)
- **POST**: Sube archivos al bucket `documents` y registra la URL en la DB.
- **DELETE**: Elimina el archivo del almacenamiento y el registro en DB.

---

## 🤝 Contribuir

1. Crea un branch: `git checkout -b feat/nueva-funcionalidad`
2. Realiza tus cambios y verifica con `npm run lint`.
3. Envía un PR detallando los cambios en la lógica de negocio.
