# INVENTIA — Resumen Ejecutivo

> Sistema de gestión de inventario con IA para restaurantes — Abril 2026

---

## Visión General

**INVENTIA** es una plataforma SaaS multi-tenant para restaurantes que combina:
- Gestión de inventario en tiempo real
- Predicciones de reabastecimiento con IA
- Panel de administración de la plataforma

---

## Tech Stack Real

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind 4, Framer Motion, Recharts |
| Auth cliente | Firebase JS SDK v11 |
| Backend | Python FastAPI + Uvicorn |
| Auth servidor | Firebase Admin SDK (verify ID tokens) |
| DB por restaurante | Firebase Firestore |
| DB admin plataforma | Supabase (PostgreSQL) |
| IA | scikit-learn, numpy, pandas |
| Admin auth | Supabase JWT / token demo |

---

## Arquitectura del Sistema

```
┌────────────────────────────────────────────────┐
│  Frontend — React + TypeScript (puerto 5173)   │
│                                                │
│  Landing → Login → Dashboard → Inventory       │
│  AIInsights → Settings → Admin Panel           │
└──────────────────┬─────────────────────────────┘
                   │ HTTP/REST + Firebase ID Token
                   ▼
┌────────────────────────────────────────────────┐
│  Backend — FastAPI (puerto 8000)               │
│                                                │
│  /auth  /inventory  /ai  /settings  /admin     │
└──────┬──────────────────────────────┬──────────┘
       │                              │
       ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│ Firebase        │          │ Supabase         │
│ Firestore       │          │ PostgreSQL       │
│                 │          │                  │
│ restaurants/    │          │ companies        │
│  {uid}/         │          │ platform_users   │
│   products/     │          │ company_modules  │
│   movements/    │          │ admin_profiles   │
└─────────────────┘          │ admin_audit_log  │
                             └──────────────────┘
```

---

## Estructura de Datos

### Firebase Firestore (por restaurante)

```
restaurants/{uid}/
  ├── name, owner_uid, owner_email, owner_name, created_at
  ├── settings: { name, address, phone, email, alert_threshold,
  │               notify_email, notify_whatsapp, auto_restock }
  ├── products/{id}/
  │   ├── name, category, quantity, unit
  │   ├── min_threshold, max_capacity, price_per_unit
  │   ├── supplier, last_updated, restaurant_id
  └── movements/{id}/
      ├── product_id, movement_type (entrada|salida|ajuste)
      ├── quantity, notes, timestamp
      └── restaurant_id, user_id
```

### Supabase PostgreSQL (plataforma admin)

```
companies        → empresas/restaurantes registrados
platform_users   → usuarios sincronizados desde Firebase Auth
company_modules  → feature flags por empresa
admin_profiles   → super-admins de Inventia
admin_audit_log  → registro de acciones del panel
```

---

## Flujo de Autenticación

```
Usuario escribe email/password
        │
        ▼
Firebase Authentication
        │
        ▼ retorna ID Token (JWT)
        │
        ▼
Frontend guarda token en memoria
        │
        ▼
Todas las llamadas API incluyen:
  Authorization: Bearer <id_token>
        │
        ▼
Backend verifica con firebase_admin.auth.verify_id_token()
        │
        ▼
Extrae uid → accede a restaurants/{uid}/ en Firestore
```

---

## Flujo de Predicción IA

```
1. GET /ai/predictions con token
2. Backend obtiene todos los productos del restaurante
3. Backend obtiene últimos 500 movimientos
4. Para cada producto:
   - Filtra salidas del producto
   - Calcula consumo diario promedio (base 30 días)
   - Calcula días restantes de stock
   - Calcula cantidad a reabastecer (cubrir 14 días)
5. Ordena por días_restantes ascendente (más urgente primero)
6. Retorna lista de predicciones
```

---

## Modo Demo vs Modo Real

El proyecto funciona en **modo demo** si no hay credenciales configuradas:

| Condición | Comportamiento |
|-----------|---------------|
| `FIREBASE_PROJECT_ID` vacío | Retorna datos de ejemplo en todos los endpoints |
| `SUPABASE_URL` vacío | Panel admin retorna datos mock |
| Token `demo-admin-token-inventia-2024` | Acceso al panel admin sin Supabase |
| Variables configuradas | Datos reales de Firebase/Supabase |

---

## Estructura de Archivos

```
INVENTIA/
├── firestore.rules              ← Security Rules de Firestore
├── frontend/
│   ├── .env                     ← Variables de entorno frontend
│   ├── .env.example             ← Plantilla
│   └── src/
│       ├── lib/
│       │   ├── firebase.ts      ← Inicialización Firebase JS SDK
│       │   └── supabase.ts      ← Inicialización Supabase cliente
│       ├── services/
│       │   ├── api.ts           ← Fetch wrapper con auth token
│       │   ├── inventoryService.ts  ← CRUD productos
│       │   ├── aiService.ts     ← Predicciones y alertas
│       │   └── adminService.ts  ← Panel admin
│       ├── pages/               ← Dashboard, Inventory, AIInsights...
│       └── components/          ← InventoryTable, AlertsPanel...
└── backend/
    ├── .env                     ← Variables de entorno backend
    ├── .env.example             ← Plantilla
    ├── main.py                  ← FastAPI app + CORS + routers
    ├── config.py                ← Settings con pydantic-settings
    ├── models.py                ← Pydantic models (Product, Movement...)
    ├── firebase_service.py      ← Init Firebase Admin SDK
    ├── supabase_service.py      ← Init Supabase client
    ├── requirements.txt
    ├── routes/
    │   ├── auth.py              ← /auth/register, /auth/me
    │   ├── inventory.py         ← /inventory/products, /movements
    │   ├── ai.py                ← /ai/predictions, /alerts, /stats
    │   ├── settings.py          ← /settings/
    │   └── admin.py             ← /admin/* (requiere Supabase JWT)
    ├── services/
    │   └── ai_service.py        ← predict_restock, generate_alerts
    ├── middleware/
    │   └── admin_auth.py        ← Verificación JWT Supabase
    └── supabase/
        └── migrations/
            └── 001_schema.sql   ← Schema completo de Supabase
```

---

## Comandos para Iniciar

```bash
# Activar venv (Windows)
source C:/Users/juan/Desktop/INVENTIA/venv/Scripts/activate

# Backend
cd INVENTIA/backend
pip install -r requirements.txt
python main.py              # → http://localhost:8000
                            # → Docs: http://localhost:8000/api/docs

# Frontend (otra terminal)
cd INVENTIA/frontend
npm install
npm run dev                 # → http://localhost:5173
```

---

## Checklist de Activación con Firebase Real

```
□ Crear proyecto Firebase
□ Habilitar Firestore (modo producción)
□ Aplicar reglas de firestore.rules
□ Habilitar Authentication (Email/Password)
□ Descargar Service Account JSON → llenar backend/.env
□ Registrar Web App → copiar VITE_FIREBASE_* a frontend/.env
□ (Opcional) Crear proyecto Supabase
□ (Opcional) Ejecutar backend/supabase/migrations/001_schema.sql
□ Verificar: GET http://localhost:8000/health
```
