# INVENTIA — Estructura de Base de Datos y Conexión Python

> Documentación actualizada con la arquitectura real del proyecto (Abril 2026)

---

## 🗄️ ARQUITECTURA DE DATOS

INVENTIA usa **dos bases de datos** con responsabilidades distintas:

```
┌──────────────────────────────────────────────────────────┐
│  Firebase Firestore                                       │
│  → Datos por restaurante (productos, movimientos,         │
│    configuración). Cada restaurante es tenant aislado.   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL)                                    │
│  → Panel de administración de la plataforma:             │
│    empresas registradas, usuarios, feature flags.        │
└──────────────────────────────────────────────────────────┘
```

---

## 🔥 FIREBASE FIRESTORE — Estructura completa

### Colección raíz: `restaurants`

El documento raíz de cada restaurante usa el **UID de Firebase Auth** como ID.
Esto permite que las Security Rules validen `uid == restaurantId` sin queries adicionales.

```
restaurants/
  {uid}/
    ├── name            : string       — "La Casa del Sabor"
    ├── owner_uid       : string       — UID de Firebase Auth
    ├── owner_email     : string       — "carlos@restaurante.com"
    ├── owner_name      : string       — "Carlos García"
    ├── created_at      : string       — ISO 8601 "2026-01-15T10:30:00"
    └── settings        : map
        ├── name              : string   — nombre visible del restaurante
        ├── address           : string   — "Calle 123 # 45-67, Bogotá"
        ├── phone             : string   — "+57 300 000 0000"
        ├── email             : string   — "contacto@restaurante.com"
        ├── alert_threshold   : number   — umbral % para alertas (10–50, default 20)
        ├── notify_email      : boolean  — default true
        ├── notify_whatsapp   : boolean  — default false
        └── auto_restock      : boolean  — default false
```

---

### Subcolección: `restaurants/{uid}/products`

```
products/
  {auto-id}/
    ├── name            : string   — "Pollo"
    ├── category        : string   — "Carnes" | "Verduras" | "Aceites" | etc.
    ├── quantity        : number   — stock actual en float (ej: 45.5)
    ├── unit            : string   — "kg" | "L" | "unidad" | "g" | "ml"
    ├── min_threshold   : number   — umbral mínimo para activar alertas
    ├── max_capacity    : number   — capacidad máxima del almacén
    ├── price_per_unit  : number   — precio por unidad en COP (ej: 8500)
    ├── supplier        : string   — "Carnes Premium S.A."
    ├── last_updated    : string   — ISO 8601
    └── restaurant_id   : string   — UID del restaurante (redundante para queries)
```

**Ejemplo de documento:**
```json
{
  "id": "abc123xyz",
  "name": "Pollo",
  "category": "Carnes",
  "quantity": 45.0,
  "unit": "kg",
  "min_threshold": 20.0,
  "max_capacity": 100.0,
  "price_per_unit": 8500,
  "supplier": "Carnes Premium",
  "last_updated": "2026-04-07T14:23:11",
  "restaurant_id": "uid-del-restaurante"
}
```

---

### Subcolección: `restaurants/{uid}/movements`

Registro inmutable de todos los movimientos de stock. No se actualizan ni eliminan.

```
movements/
  {auto-id}/
    ├── product_id      : string   — ID del documento en products/
    ├── movement_type   : string   — "entrada" | "salida" | "ajuste"
    ├── quantity        : number   — cantidad del movimiento (siempre positivo)
    ├── notes           : string   — opcional, descripción del movimiento
    ├── timestamp       : string   — ISO 8601
    ├── restaurant_id   : string   — UID del restaurante
    └── user_id         : string   — UID de Firebase Auth del operador
```

**Lógica de actualización de stock al registrar movimiento:**
- `entrada`  → `quantity_actual + movement.quantity`
- `salida`   → `max(0, quantity_actual - movement.quantity)`
- `ajuste`   → `movement.quantity` (reemplaza el valor directamente)

---

## 🔐 Security Rules de Firestore

Archivo: `firestore.rules` en la raíz del proyecto.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /restaurants/{restaurantId} {
      // Solo el dueño (uid == restaurantId) accede a sus datos
      allow read, write: if request.auth != null
                         && request.auth.uid == restaurantId;

      match /products/{productId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == restaurantId;
      }

      match /movements/{movementId} {
        allow read:   if request.auth != null
                      && request.auth.uid == restaurantId;
        allow create: if request.auth != null
                      && request.auth.uid == restaurantId;
        // Movimientos son inmutables — no update/delete
      }
    }
  }
}
```

---

## 🐘 SUPABASE (PostgreSQL) — Schema del Panel Admin

Script completo: `backend/supabase/migrations/001_schema.sql`

### Tabla: `companies`

Registra cada restaurante/empresa que usa la plataforma.

```sql
CREATE TABLE public.companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,           -- UID del dueño en Firebase Auth
  name         TEXT NOT NULL,         -- nombre de la empresa
  owner_email  TEXT NOT NULL,
  owner_name   TEXT,
  plan         TEXT DEFAULT 'free',   -- 'free' | 'pro' | 'enterprise'
  status       TEXT DEFAULT 'active', -- 'active' | 'suspended' | 'deleted'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `platform_users`

Usuarios sincronizados desde Firebase Auth.

```sql
CREATE TABLE public.platform_users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  email        TEXT NOT NULL,
  display_name TEXT,
  role         TEXT DEFAULT 'admin',   -- 'admin' | 'usuario'
  status       TEXT DEFAULT 'active',  -- 'active' | 'suspended'
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `company_modules`

Feature flags por empresa (qué módulos tiene habilitados).

```sql
CREATE TABLE public.company_modules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,    -- 'inventory' | 'ai_insights' | 'alerts'
                               --  'whatsapp' | 'reports' | 'multi_user' | 'integrations'
  enabled    BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, module_key)
);
```

### Tabla: `admin_profiles`

Perfiles de super-admins de la plataforma (Supabase Auth).

```sql
CREATE TABLE public.admin_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `admin_audit_log`

Registro de todas las acciones del panel admin.

```sql
CREATE TABLE public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,   -- 'create_company' | 'suspend_user' | etc.
  target_type TEXT,            -- 'company' | 'user' | 'module'
  target_id   TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🐍 CONEXIÓN PYTHON (FastAPI + Firebase Admin SDK)

### Inicialización de Firebase (`backend/firebase_service.py`)

```python
import firebase_admin
from firebase_admin import credentials, firestore, auth
from config import settings

def init_firebase():
    if not firebase_admin._apps:
        cred_dict = settings.firebase_credentials_dict
        if cred_dict.get("project_id"):
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
    return firestore.client()

def get_db():
    return firestore.client() if firebase_admin._apps else None
```

### Variables de entorno — backend/.env

```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY_ID=tu-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=tu-jwt-secret

APP_ENV=development
CORS_ORIGINS=http://localhost:5173
```

### Variables de entorno — frontend/.env

```bash
VITE_API_URL=http://localhost:8000/api/v1

VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 🔄 OPERACIONES CRUD — Ejemplos Python

### Crear producto

```python
db = get_db()
restaurant_id = user["uid"]

data = {
    "name": "Pollo",
    "category": "Carnes",
    "quantity": 50.0,
    "unit": "kg",
    "min_threshold": 20.0,
    "max_capacity": 100.0,
    "price_per_unit": 8500,
    "supplier": "Carnes Premium",
    "last_updated": datetime.now().isoformat(),
    "restaurant_id": restaurant_id,
}

doc_ref = db.collection("restaurants") \
            .document(restaurant_id) \
            .collection("products") \
            .add(data)

product_id = doc_ref[1].id
```

### Registrar movimiento y actualizar stock

```python
# 1. Guardar movimiento
movement = {
    "product_id": product_id,
    "movement_type": "salida",
    "quantity": 5.0,
    "notes": "Consumo cocina",
    "timestamp": datetime.now().isoformat(),
    "restaurant_id": restaurant_id,
    "user_id": user["uid"],
}
db.collection("restaurants").document(restaurant_id) \
  .collection("movements").add(movement)

# 2. Actualizar cantidad en producto
product_ref = db.collection("restaurants") \
                .document(restaurant_id) \
                .collection("products") \
                .document(product_id)

current_qty = product_ref.get().to_dict().get("quantity", 0)
new_qty = max(0, current_qty - 5.0)

product_ref.update({
    "quantity": new_qty,
    "last_updated": datetime.now().isoformat()
})
```

### Obtener todos los productos

```python
products = []
for doc in db.collection("restaurants") \
             .document(restaurant_id) \
             .collection("products").stream():
    data = doc.to_dict()
    data["id"] = doc.id
    products.append(data)
```

---

## 🤖 MÓDULO DE IA

### Lógica de predicción (`backend/services/ai_service.py`)

```python
def predict_restock(product: dict, movements: list) -> dict:
    # Solo salidas del producto
    salidas = [m["quantity"] for m in movements
               if m.get("movement_type") == "salida"]

    if not salidas:
        return None

    # Consumo diario promedio (base 30 días)
    daily_avg = sum(salidas) / 30

    # Días restantes con stock actual
    days_remaining = product["quantity"] / daily_avg if daily_avg > 0 else 999

    # Recomendación: cubrir 14 días de consumo
    restock_recommendation = max(0, (daily_avg * 14) - product["quantity"])

    return {
        "product": product["name"],
        "product_id": product["id"],
        "current_stock": product["quantity"],
        "daily_consumption": round(daily_avg, 2),
        "days_remaining": round(days_remaining, 1),
        "restock_recommendation": round(restock_recommendation, 1),
        "confidence": min(0.95, len(salidas) / 30),
        "unit": product["unit"],
    }
```

---

## 📡 API ENDPOINTS

Base URL: `http://localhost:8000/api/v1`

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/health` | — | Estado del servidor y Firebase |
| POST | `/auth/register` | — | Registrar nuevo restaurante |
| GET | `/auth/me` | Firebase | Info del usuario autenticado |
| POST | `/auth/verify-token` | Firebase | Verificar token Firebase |
| GET | `/inventory/products` | Firebase | Listar productos |
| POST | `/inventory/products` | Firebase | Crear producto |
| PUT | `/inventory/products/{id}` | Firebase | Actualizar producto |
| DELETE | `/inventory/products/{id}` | Firebase | Eliminar producto |
| POST | `/inventory/movements` | Firebase | Registrar movimiento de stock |
| GET | `/ai/predictions` | Firebase | Predicciones de reabastecimiento |
| GET | `/ai/alerts` | Firebase | Alertas activas |
| GET | `/ai/stats` | Firebase | Estadísticas del modelo IA |
| GET | `/settings/` | Firebase | Configuración del restaurante |
| PUT | `/settings/` | Firebase | Actualizar configuración |
| GET | `/admin/metrics/overview` | Supabase | Métricas del panel admin |
| GET | `/admin/companies` | Supabase | Listar empresas |
| POST | `/admin/companies` | Supabase | Crear empresa |
| PUT | `/admin/companies/{id}` | Supabase | Actualizar empresa |
| PUT | `/admin/companies/{id}/status` | Supabase | Cambiar estado empresa |
| DELETE | `/admin/companies/{id}` | Supabase | Eliminar empresa |
| GET | `/admin/users` | Supabase | Listar usuarios de la plataforma |
| PUT | `/admin/users/{id}` | Supabase | Actualizar usuario |
| DELETE | `/admin/users/{id}` | Supabase | Eliminar usuario |
| GET | `/admin/modules` | Supabase | Feature flags por empresa |
| PUT | `/admin/modules/{id}/{key}` | Supabase | Toggle módulo |

**Auth Firebase:** `Authorization: Bearer <firebase-id-token>`
**Auth Supabase/Admin:** `Authorization: Bearer <supabase-jwt>` o `demo-admin-token-inventia-2024`

---

## 🚀 PASOS PARA ACTIVAR BASES DE DATOS

### Firebase
1. Crear proyecto en [console.firebase.google.com](https://console.firebase.google.com)
2. Activar **Firestore Database** → modo producción
3. Copiar reglas de `firestore.rules` → pegarlas en la consola (pestaña Reglas)
4. Activar **Authentication** → habilitar proveedor **Email/Contraseña**
5. Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada → llenar `backend/.env`
6. Agregar app web → copiar variables `VITE_FIREBASE_*` a `frontend/.env`

### Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → ejecutar `backend/supabase/migrations/001_schema.sql`
3. Settings → API → copiar URL, anon key y JWT secret a los `.env`

### Arrancar el proyecto

```bash
# Backend
cd INVENTIA/backend
pip install -r requirements.txt
python main.py              # http://localhost:8000

# Frontend
cd INVENTIA/frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## ✅ Checklist de Activación

```
Firebase
  □ Proyecto creado
  □ Firestore habilitado (modo producción)
  □ Security Rules aplicadas (firestore.rules)
  □ Authentication habilitado (Email/Password)
  □ Service Account descargado y backend/.env completado

Supabase
  □ Proyecto creado
  □ SQL migration 001_schema.sql ejecutado
  □ backend/.env y frontend/.env completados con vars Supabase

Verificación
  □ GET /health devuelve firebase: "connected"
  □ Registro de usuario funciona
  □ Login funciona
  □ CRUD de productos funciona
  □ Panel Admin carga datos reales
```
