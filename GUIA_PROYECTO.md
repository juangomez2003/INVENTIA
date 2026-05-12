# GUIA COMPLETA DE INVENTIA
### Para alguien que nunca ha visto este código

---

## ¿Qué es INVENTIA?

INVENTIA es un **sistema de gestión de inventario para restaurantes**. Permite a los dueños de restaurantes controlar su stock de ingredientes, recibir alertas de bajo stock, ver predicciones de consumo con inteligencia artificial, y gestionar a su personal (meseros, chefs, cajeros) desde una sola plataforma.

---

## Tecnologías usadas

| Tecnología | Para qué sirve |
|---|---|
| **React + TypeScript** | El frontend (lo que el usuario ve) |
| **Vite** | La herramienta que compila y sirve el frontend |
| **React Router** | Maneja las rutas/páginas de la app |
| **Tailwind CSS** | Estilos visuales |
| **Supabase** | Base de datos y autenticación de usuarios |
| **Recharts** | Gráficas e indicadores visuales |
| **Lucide React** | Íconos |
| **Backend (API REST)** | Servidor separado en `http://localhost:8000/api/v1` |

---

## Estructura de carpetas

```
INVENTIA/
└── INVENTIA/
    └── frontend/
        └── src/
            ├── main.tsx              ← Punto de entrada de la app
            ├── App.tsx               ← Raíz: rutas y proveedores de contexto
            ├── index.css             ← Estilos globales y variables de tema
            │
            ├── types/
            │   └── index.ts          ← Todos los tipos TypeScript del proyecto
            │
            ├── lib/
            │   ├── supabase.ts       ← Conexión a Supabase (base de datos)
            │   └── staffSession.ts   ← Manejo de sesión del personal (por código)
            │
            ├── context/
            │   ├── AuthContext.tsx       ← Login/logout de dueños de restaurante
            │   ├── AdminAuthContext.tsx  ← Login/logout del super administrador
            │   └── ThemeContext.tsx      ← Modo claro / oscuro
            │
            ├── services/
            │   ├── api.ts            ← Función genérica para llamar al backend
            │   ├── inventoryService.ts ← CRUD de productos del inventario
            │   ├── aiService.ts      ← Predicciones e alertas de IA
            │   ├── staffService.ts   ← Gestión de personal y pedidos
            │   ├── menuService.ts    ← Gestión del menú
            │   └── adminService.ts   ← Métricas y administración global
            │
            ├── utils/
            │   └── stockUtils.ts     ← Lógica para calcular estado del stock
            │
            ├── pages/
            │   ├── Landing.tsx       ← Página de inicio (pública)
            │   ├── Login.tsx         ← Login del restaurante
            │   ├── Register.tsx      ← Registro de nuevo restaurante
            │   ├── Dashboard.tsx     ← Panel principal del restaurante
            │   ├── Inventory.tsx     ← Gestión de inventario
            │   ├── Menu.tsx          ← Gestión del menú
            │   ├── AIInsights.tsx    ← Predicciones de inteligencia artificial
            │   ├── Settings.tsx      ← Configuración del restaurante
            │   │
            │   ├── admin/            ← Páginas del super administrador
            │   │   ├── AdminDashboard.tsx
            │   │   ├── AdminUsers.tsx
            │   │   ├── AdminCompanies.tsx
            │   │   ├── AdminProducts.tsx
            │   │   ├── AdminModules.tsx
            │   │   └── AdminAnalytics.tsx
            │   │
            │   └── staff/            ← Páginas del personal del restaurante
            │       ├── StaffAccess.tsx   ← Ingresar con código de turno
            │       ├── StaffHub.tsx      ← Centro de trabajo según rol
            │       ├── StaffLogin.tsx    ← Login con cuenta Supabase
            │       ├── StaffJoin.tsx     ← Registrarse con código de invitación
            │       ├── MeseroView.tsx    ← Vista del mesero (tomar pedidos)
            │       ├── ChefView.tsx      ← Vista del chef (ver órdenes en cocina)
            │       └── CajeroView.tsx    ← Vista del cajero (cobrar)
            │
            └── components/
                ├── Layout.tsx            ← Estructura con sidebar para el restaurante
                ├── Sidebar.tsx           ← Menú lateral del restaurante
                ├── ProtectedRoute.tsx    ← Bloquea rutas si no hay sesión
                ├── StatsCard.tsx         ← Tarjeta de estadística
                ├── AlertsPanel.tsx       ← Panel de alertas IA
                ├── AIRecommendations.tsx ← Recomendaciones de IA
                ├── ConsumptionChart.tsx  ← Gráfica de consumo semanal
                ├── TopProductsChart.tsx  ← Gráfica de productos top
                ├── InventoryTable.tsx    ← Tabla de inventario
                ├── ThemeToggle.tsx       ← Botón claro/oscuro
                ├── Logo.tsx              ← Logo de INVENTIA
                └── admin/
                    ├── AdminLayout.tsx       ← Estructura del panel admin
                    ├── AdminSidebar.tsx      ← Menú lateral del admin
                    └── AdminProtectedRoute.tsx ← Bloquea rutas si no es super admin
```

---

## La raíz de todo: cómo arranca la aplicación

### 1. `main.tsx` — El primer archivo que se ejecuta

```
React → renderiza <App /> dentro de <StrictMode>
```

Es solo 10 líneas. Su único trabajo es arrancar React y montar el componente `App`.

---

### 2. `App.tsx` — El corazón del enrutamiento

Aquí viven **todos los proveedores de contexto** y **todas las rutas**:

```
<ThemeProvider>           ← Tema claro/oscuro
  <AdminAuthProvider>     ← Sesión del super admin
    <AuthProvider>        ← Sesión del restaurante
      <AppRoutes />       ← Todas las rutas de la app
    </AuthProvider>
  </AdminAuthProvider>
</ThemeProvider>
```

Hay **3 grupos de rutas**:

| Grupo | Ejemplo de rutas | Quién puede entrar |
|---|---|---|
| **Públicas** | `/landing`, `/login`, `/register` | Cualquiera |
| **Staff** | `/staff/access`, `/staff` | Personal con código de turno |
| **Admin** | `/admin/dashboard`, `/admin/users` | Solo super admin |
| **App** | `/dashboard`, `/inventory`, `/menu` | Dueños autenticados |

---

## Los 3 tipos de usuario

### Usuario 1: El dueño del restaurante
- Se registra en `/register`
- Inicia sesión en `/login` (con email/contraseña via Supabase)
- Accede a: Dashboard, Inventario, Menú, IA Insights, Configuración
- Puede generar **códigos de invitación** para su personal

### Usuario 2: El personal (mesero, chef, cajero)
- Entra por `/staff/access` con un **código de turno** (no necesita cuenta)
- El código es validado por el backend → genera un token de sesión temporal
- La sesión dura **16 horas** (guardada en localStorage)
- Según su rol, ve una vista diferente:
  - **Mesero** → tomar pedidos de mesa
  - **Chef** → ver órdenes que llegan de cocina
  - **Cajero** → cerrar pedidos y cobrar

### Usuario 3: El super administrador (INVENTIA)
- Entra por `/login` con credenciales especiales (`role: super_admin` en Supabase)
- O en modo demo: `superadmin@inventia.com` / `SuperAdmin2024!`
- Gestiona todos los restaurantes registrados en la plataforma

---

## Cómo funciona la autenticación

### Modo Producción (con Supabase configurado)
```
Usuario ingresa email + password
  → Supabase verifica credenciales
  → Si es super_admin: redirige a /admin
  → Si es usuario normal: redirige a /dashboard
```

### Modo Demo (sin Supabase configurado)
```
Email:    admin@restaurant.com
Password: demo123
  → Funciona sin conexión real a base de datos
  → Los datos se guardan en localStorage
```

### Sesión del personal (por código)
```
Personal ingresa código de 6-10 caracteres
  → POST /api/v1/staff/code-session
  → Backend devuelve session_token + role + restaurant
  → Se guarda en localStorage con TTL de 16 horas
```

---

## Cómo se comunica con el backend

Hay **un archivo central** para todas las llamadas: `src/services/api.ts`

```
api.get('/inventory/products')    → GET    /api/v1/inventory/products
api.post('/inventory/products', data) → POST
api.put('/inventory/products/123', data) → PUT
api.delete('/inventory/products/123') → DELETE
```

Todas las llamadas:
1. Obtienen el token JWT de Supabase automáticamente
2. Lo envían en el header `Authorization: Bearer <token>`
3. Si el servidor responde con error, lanzan una excepción con el mensaje

La URL base del backend se configura con la variable de entorno:
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Los servicios — cómo se usa cada uno

### `inventoryService` — Inventario de productos
```typescript
inventoryService.getProducts()                    // Listar todos
inventoryService.createProduct(producto)          // Crear nuevo
inventoryService.updateProduct(id, cambios)       // Editar
inventoryService.deleteProduct(id)                // Eliminar
inventoryService.recordMovement(id, tipo, cant)   // Registrar entrada/salida/ajuste
```
Los tipos de movimiento son: `'entrada'` | `'salida'` | `'ajuste'`

---

### `aiService` — Inteligencia Artificial
```typescript
aiService.getPredictions()  // Cuántos días queda cada producto, qué pedir
aiService.getAlerts()       // Alertas de stock crítico
aiService.getStats()        // Precisión del modelo, cantidad de recomendaciones
```

---

### `staffService` — Personal y pedidos
```typescript
generateInviteCode(role)               // Crear código de invitación para un rol
listInvites()                          // Ver códigos activos
joinWithCode({ code, name, email })    // Personal se registra con código
listStaff()                            // Ver todo el personal
createOrder({ table_number, items })   // Crear un pedido de mesa
updateOrderStatus(orderId, status)     // Cambiar estado del pedido
listOrders()                           // Ver todos los pedidos
```

Los estados de un pedido son:
```
pending → in_kitchen → ready → paid
                              → cancelled
```

---

### `adminService` — Panel de administración global
```typescript
adminService.getMetrics()              // KPIs globales de la plataforma
adminService.getCompanies()           // Todos los restaurantes
adminService.createCompany(datos)     // Crear restaurante manualmente
adminService.setCompanyStatus(id, status) // Suspender o activar restaurante
adminService.getUsers()               // Todos los usuarios
adminService.toggleModule(companyId, moduleKey, enabled) // Activar/desactivar módulos
```

---

## Cómo funciona el estado del stock

En `src/utils/stockUtils.ts` está la lógica central:

```
quantity <= minThreshold * 0.5  →  CRÍTICO (rojo)
quantity <= minThreshold        →  BAJO    (amarillo)
quantity >= 80% de maxCapacity  →  LLENO   (azul)
cualquier otro caso             →  NORMAL  (verde)
```

**Ejemplo:** Producto con `minThreshold: 10` y `maxCapacity: 100`
- 5 unidades → Crítico (≤ 5)
- 8 unidades → Bajo (≤ 10)
- 85 unidades → Lleno (≥ 80)
- 50 unidades → Normal

---

## Las variables de entorno necesarias

Crear un archivo `.env` en `frontend/`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_API_URL=http://localhost:8000/api/v1
```

Si no configuras Supabase, la app funciona en **modo demo** con datos de prueba.

---

## Cómo correr el proyecto

```bash
# Entrar a la carpeta del frontend
cd INVENTIA/frontend

# Instalar dependencias (solo la primera vez)
npm install

# Correr en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## Planes de suscripción

La app tiene 3 planes (visibles en la landing):

| Plan | Precio | Límites |
|---|---|---|
| **Starter** | $49.900/mes | Hasta 50 productos, alertas por email |
| **Pro** | $99.900/mes | Predicción IA, alertas WhatsApp, reportes |
| **Enterprise** | $249.900/mes | Sucursales ilimitadas, API pública, POS |

---

## Flujo completo de un usuario típico

```
1. Dueño entra a /landing
2. Se registra en /register → crea su restaurante en Supabase
3. Inicia sesión → va a /dashboard
4. Agrega productos en /inventory
5. El sistema de IA analiza consumo y genera predicciones
6. Dueño genera códigos de turno para su personal
7. Mesero entra a /staff/access con su código
8. Mesero toma pedido de una mesa → sistema actualiza inventario
9. Chef ve pedido en cocina → lo marca como listo
10. Cajero cierra el pedido → queda como pagado
```

---

## Puntos importantes para no confundirse

1. **Hay dos sistemas de login separados**: el de dueños (Supabase auth) y el del personal (código de turno → JWT temporal). Ambos envían tokens JWT al backend, pero de fuentes diferentes.

2. **El frontend NO tiene base de datos directa**: todo va a través del backend (`localhost:8000`). Supabase solo se usa para autenticación de dueños y super admin.

3. **`staffSession.ts` vs `AuthContext`**: El personal usa `staffSession` (localStorage). Los dueños usan `AuthContext` (Supabase). Son sistemas paralelos.

4. **Modo demo funciona sin backend**: con las credenciales demo, parte del sistema funciona offline con datos en localStorage. Pero el inventario real necesita el backend corriendo.

5. **El super admin gestiona la plataforma entera**, no un restaurante específico. Ve métricas globales de todos los restaurantes registrados.
