# Diagnóstico de Rentabilidad para Gestorías

SaaS multi-tenant para que gestorías y asesorías ofrezcan diagnósticos de rentabilidad a sus clientes potenciales.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Deploy**: Vercel

## Características

- ✅ Multi-tenant por slug: `/d/[tenantSlug]`
- ✅ Wizard de diagnóstico (14 preguntas, 8 pantallas) sin login
- ✅ Scoring por 4 áreas + nota global (A/B/C) + urgencia
- ✅ 3 palancas prioritarias personalizadas
- ✅ Dashboard para advisors (gestorías) con filtros y export CSV
- ✅ Panel admin con métricas agregadas (sin acceso a datos individuales)
- ✅ RLS estricta: advisors solo ven su tenant, admin solo ve agregados
- ✅ Webhook a Make.com al completar diagnósticos
- ✅ Branding personalizable por tenant

## Setup

### 1. Crear proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Anota la URL del proyecto y las keys (anon y service_role)

### 2. Ejecutar SQL scripts

En el SQL Editor de Supabase, ejecuta en orden:

```sql
-- 1. Schema (tablas, views, funciones)
-- Copia el contenido de supabase/schema.sql

-- 2. RLS policies
-- Copia el contenido de supabase/rls.sql

-- 3. Seed data (opcional, para pruebas)
-- Copia el contenido de supabase/seed.sql
```

### 3. Crear usuarios en Supabase Auth

En el dashboard de Supabase > Authentication > Users:

1. **Admin** (Pablo):
   - Email: `admin@example.com`
   - Password: (elige una segura)
   - Anota el UUID generado

2. **Advisor** (ejemplo):
   - Email: `advisor@gestoria-demo.com`
   - Password: (elige una segura)
   - Anota el UUID generado

### 4. Insertar usuarios en la tabla `users`

Ejecuta en SQL Editor con los UUIDs reales:

```sql
INSERT INTO users (id, email, role, tenant_id, full_name) VALUES
    ('UUID-DEL-ADMIN', 'admin@example.com', 'admin', NULL, 'Pablo Admin'),
    ('UUID-DEL-ADVISOR', 'advisor@gestoria-demo.com', 'advisor', '11111111-1111-1111-1111-111111111111', 'María García');
```

### 5. Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Instalar dependencias y correr local

```bash
npm install
npm run dev
```

Visita:
- Wizard demo: http://localhost:3000/d/demo
- Login: http://localhost:3000/login
- Dashboard advisor: http://localhost:3000/dashboard
- Panel admin: http://localhost:3000/admin

### 7. Deploy en Vercel

1. Push tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura las variables de entorno (las mismas de `.env.local`)
4. Deploy

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   └── submissions/     # API route handlers
│   ├── d/[tenantSlug]/      # Wizard público
│   │   ├── page.tsx
│   │   └── result/[id]/
│   ├── dashboard/           # Panel advisors
│   ├── admin/               # Panel admin
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── ui/                  # Componentes base
│   ├── wizard/              # Componentes del wizard
│   ├── dashboard/           # Componentes del dashboard
│   └── admin/               # Componentes del admin
├── lib/
│   ├── supabase/            # Clientes Supabase
│   ├── constants/           # Preguntas, opciones
│   └── utils/               # Scoring, helpers
└── types/                   # TypeScript types
```

## Roles y permisos

| Rol | Puede hacer |
|-----|-------------|
| **Public** | Completar wizard, ver resultado (con UUID) |
| **Advisor** | Ver submissions de su tenant, export CSV, editar branding |
| **Admin** | Ver métricas agregadas por tenant (no submissions individuales) |

## Seguridad (RLS)

- **Admin NO puede** leer la tabla `submissions` directamente
- Admin solo accede a funciones `SECURITY DEFINER` que devuelven agregados
- Advisors solo ven submissions donde `tenant_id = su_tenant_id`
- Inserciones se hacen vía API con `service_role` (no desde cliente)

## Webhook a Make

Cuando se completa un diagnóstico, si el tenant tiene `webhook_url` configurado:

```json
POST webhook_url
{
  "tenant_slug": "demo",
  "submission_id": "uuid",
  "grade": "A|B|C",
  "urgency": "high|medium|low",
  "red_areas": ["control", "precios"],
  "created_at": "2024-01-01T12:00:00Z",
  "email": "opcional (si send_contact_to_make=true)",
  "phone": "opcional (si send_contact_to_make=true)"
}
```

## Tests

```bash
npm run test        # Watch mode
npm run test:run    # Single run
```

## Crear nuevo tenant

1. Inserta en tabla `tenants`:

```sql
INSERT INTO tenants (slug, name, brand_color) VALUES
    ('mi-gestoria', 'Mi Gestoría', '#FF5733');
```

2. Crea usuario en Auth y asígnalo:

```sql
INSERT INTO users (id, email, role, tenant_id, full_name) VALUES
    ('UUID-DEL-NUEVO-USUARIO', 'usuario@migestoria.com', 'advisor', 'UUID-DEL-TENANT', 'Nombre');
```

## License

MIT
