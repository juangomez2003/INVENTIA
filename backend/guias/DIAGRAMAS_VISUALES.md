# 📐 DIAGRAMA VISUAL COMPLETO - INVENTIA

## 1. FLUJO DE DATOS COMPLETO

```
╔════════════════════════════════════════════════════════════════════╗
║                     USUARIO FINAL (Restaurante)                    ║
╚════════════════════════════════════════════════════════════════════╝
                              │
                    ┌─────────┴─────────┐
                    │                   │
           ┌────────▼────────┐  ┌──────▼───────┐
           │  Navegador Web  │  │  Móvil App   │
           └────────┬────────┘  └──────┬───────┘
                    │                   │
        ╔═══════════╩═══════════════════╩═══════════════╗
        ║     FRONTEND (React + TypeScript + Vite)      ║
        ║                                               ║
        ║  ┌──────────────┬──────────────────────────┐  ║
        ║  │   Pages      │   Components             │  ║
        ║  │              │                          │  ║
        ║  │ • Dashboard  │ • StatsCard              │  ║
        ║  │ • Inventory  │ • InventoryTable         │  ║
        ║  │ • Sales      │ • ConsumptionChart       │  ║
        ║  │ • AI Insights│ • AIRecommendations      │  ║
        ║  │ • Settings   │ • AlertsPanel            │  ║
        ║  └──────────────┴──────────────────────────┘  ║
        ║                                               ║
        ║  Context: AuthContext (Global State)          ║
        ║  Services: Firebase SDK                       ║
        ╚═══════════════════╤═══════════════════════════╝
                            │ HTTP/REST (HTTPS)
                            │ JSON
                            ▼
        ╔═══════════════════════════════════════════════════════════╗
        ║         BACKEND (Python 3.11 + Flask + Gunicorn)         ║
        ║                                                           ║
        ║ ┌───────────────────────────────────────────────────────┐ ║
        ║ │ Routes Layer (Flask Blueprints)                       │ ║
        ║ │ /api/products  /api/sales  /api/alerts  /api/dash...  │ ║
        ║ └───────────────┬─────────────────────────────────────┘ ║
        ║                 │                                       ║
        ║ ┌───────────────▼─────────────────────────────────────┐ ║
        ║ │ Services Layer (Business Logic)                     │ ║
        ║ │                                                     │ ║
        ║ │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐│ ║
        ║ │ │Firebase Srv. │  │Analytics Srv │  │Auth Service││ ║
        ║ │ └──────────────┘  └──────────────┘  └────────────┘│ ║
        ║ │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐│ ║
        ║ │ │AI Service    │  │Notification │  │Cache Srv.  ││ ║
        ║ │ │(LSTM, Alerts)│  │(Email/SMS)   │  │(Redis)     ││ ║
        ║ │ └──────────────┘  └──────────────┘  └────────────┘│ ║
        ║ └───────────────┬──────────────────────────────────┘ ║
        ║                 │                                     ║
        ║ ┌───────────────▼─────────────────────────────────┐   ║
        ║ │ Models Layer (Data Classes)                     │   ║
        ║ │                                                 │   ║
        ║ │ Product  Sale  User  Alert  Prediction  Stock..│   ║
        ║ └─────────────────────────────────────────────────┘   ║
        ╚═════════════════╤══════════════════════════════════════╝
                          │
                ┌─────────┼─────────┐
                │         │         │
       ┌────────▼───┐ ┌───▼────┐ ┌─▼────────────┐
       │  Firestore │ │ Redis  │ │Cloud Storage │
       │  Database  │ │ Cache  │ │ (Backups)    │
       └────────────┘ └────────┘ └──────────────┘
```

---

## 2. ESTRUCTURA DE CARPETAS COMPLETA

```
inventia/
│
├── frontend/                          ✅ Existente
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── types/
│   │   └── data/
│   └── package.json
│
└── backend/                           📝 A Implementar
    ├── app.py                         ← Punto de entrada
    ├── config.py                      ← Configuración Firebase
    ├── requirements.txt               ← Dependencias
    ├── .env                          ← Variables de entorno
    ├── serviceAccountKey.json        ← Credenciales (NO COMITEAR)
    │
    ├── models/
    │   ├── __init__.py
    │   ├── product.py                ← @dataclass Product
    │   ├── sale.py                   ← @dataclass Sale
    │   ├── user.py                   ← @dataclass User
    │   ├── alert.py                  ← @dataclass AIAlert
    │   ├── prediction.py             ← @dataclass Prediction
    │   ├── stock_movement.py         ← @dataclass StockMovement
    │   └── restaurant.py             ← @dataclass Restaurant
    │
    ├── services/
    │   ├── __init__.py
    │   ├── firebase_service.py       ← CRUD Firestore
    │   ├── product_service.py        ← Lógica productos
    │   ├── sale_service.py           ← Lógica ventas
    │   ├── ai_service.py             ← IA + Predicciones
    │   ├── notification_service.py   ← Email/WhatsApp
    │   ├── analytics_service.py      ← Análisis datos
    │   ├── auth_service.py           ← Autenticación
    │   └── monitoring_service.py     ← Métricas
    │
    ├── routes/
    │   ├── __init__.py
    │   ├── products.py               ← GET/POST/PUT/DELETE
    │   ├── sales.py                  ← Registro ventas
    │   ├── alerts.py                 ← Gestión alertas
    │   ├── predictions.py            ← Predicciones IA
    │   ├── dashboard.py              ← Datos dashboard
    │   ├── users.py                  ← Gestión usuarios
    │   ├── auth.py                   ← Autenticación
    │   └── reports.py                ← Reportes
    │
    ├── utils/
    │   ├── __init__.py
    │   ├── decorators.py             ← @verify_token, @admin_required
    │   ├── validators.py             ← Validación datos
    │   ├── constants.py              ← Constantes app
    │   ├── helpers.py                ← Funciones auxiliares
    │   ├── logger.py                 ← Configuración logs
    │   └── cache.py                  ← Utilidades Redis
    │
    ├── ai_models/
    │   ├── __init__.py
    │   ├── lstm_predictor.py         ← Modelo LSTM
    │   ├── consumption_analyzer.py   ← Análisis consumo
    │   └── models/
    │       ├── lstm_model_v1.h5      ← Modelo entrenado
    │       └── scaler.pkl            ← Escalador datos
    │
    ├── tasks/
    │   ├── __init__.py
    │   ├── celery_app.py             ← Cola Celery (opcional)
    │   ├── ai_tasks.py               ← Tareas IA async
    │   └── batch_predictions.py      ← Predicciones batch
    │
    ├── migrations/
    │   ├── __init__.py
    │   ├── initial_setup.py          ← Setup inicial
    │   └── add_collections.py        ← Migrations
    │
    ├── tests/
    │   ├── __init__.py
    │   ├── test_firebase.py
    │   ├── test_ai_service.py
    │   ├── test_products.py
    │   ├── test_sales.py
    │   └── conftest.py
    │
    ├── logs/
    │   ├── app.log
    │   └── errors.log
    │
    ├── docs/
    │   ├── API.md                    ← Documentación API
    │   ├── SETUP.md                  ← Guía instalación
    │   └── DEPLOYMENT.md             ← Guía deployment
    │
    ├── Dockerfile                    ← Docker image
    ├── .dockerignore
    ├── .gitignore
    ├── README.md
    └── .env.example
```

---

## 3. FLUJO DE AUTENTICACIÓN

```
┌──────────────────────────────────────────────────────────────┐
│                   Usuario Inicia Sesión                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ Frontend (React) │
                  │  Login.tsx       │
                  └────────┬─────────┘
                           │
                  ┌────────▼──────────────────┐
                  │ signInWithEmailAndPassword│
                  │ (Firebase Auth SDK)      │
                  └────────┬─────────────────┘
                           │
            ┌──────────────▼──────────────────┐
            │   Firebase Auth (verificar     │
            │   email/password)              │
            └────────┬──────────────┬────────┘
                     │              │
              ┌──────▼──┐     ┌─────▼──────┐
              │ Válido  │     │  Inválido  │
              └────┬────┘     └─────┬──────┘
                   │                │
        ┌──────────▼──────────┐  ┌─▼─────────────────┐
        │ Generar ID Token    │  │ Error Message     │
        │ (JWT)               │  │ Mostrar al Usuario│
        └────┬────────────────┘  └───────────────────┘
             │
        ┌────▼────────────────────────────────┐
        │ Guardar Token en localStorage       │
        │ (o sessionStorage)                  │
        └────┬────────────────────────────────┘
             │
        ┌────▼────────────────────────────────┐
        │ Enviar a cada request:              │
        │ Authorization: Bearer <token>       │
        └────┬────────────────────────────────┘
             │
        ┌────▼──────────────────────────────────┐
        │       Backend (Flask)                 │
        │  @verify_token decorator             │
        │                                      │
        │ 1. Extrae token del header          │
        │ 2. auth.verify_id_token(token)      │
        │ 3. Valida con Firebase              │
        │ 4. Guarda usuario en request.user   │
        │ 5. Continúa con la función          │
        └────┬──────────────────────────────────┘
             │
        ┌────▼────────────────────────────────┐
        │ Acceso a recurso protegido          │
        └────────────────────────────────────┘
```

---

## 4. FLUJO DE REGISTRO DE VENTA

```
┌─────────────────────────────────────────┐
│  Usuario registra venta en Frontend      │
│  (SalesPanel, modal, formulario)        │
└────────────────┬────────────────────────┘
                 │
      ┌──────────▼──────────┐
      │ Frontend valida     │
      │ - producto          │
      │ - cantidad          │
      │ - precio unitario   │
      └──────────┬──────────┘
                 │
      ┌──────────▼──────────────────────────┐
      │ POST /api/sales                     │
      │ Body: {                             │
      │   restaurantId, productId,          │
      │   quantity, unitPrice, etc          │
      │ }                                   │
      └──────────┬──────────────────────────┘
                 │ Authorization Header
                 │
      ┌──────────▼──────────────────────────┐
      │  Backend: @verify_token             │
      │  Valida JWT Token                   │
      └──────────┬──────────────────────────┘
                 │
      ┌──────────▼──────────────────────────┐
      │  sales.py (route handler)           │
      │  record_sale()                      │
      └──────────┬──────────────────────────┘
                 │
      ┌──────────▼──────────────────────────┐
      │  SaleService.record_sale(sale)      │
      │                                     │
      │  1. Genera ID único para venta      │
      │  2. Obtiene fecha actual            │
      └──────────┬──────────────────────────┘
                 │
         ┌───────┴─────────────────────┐
         │                             │
    ┌────▼──────────────────┐  ┌──────▼─────────────────┐
    │ 3. Guardar en         │  │ 4. Actualizar          │
    │    Firestore          │  │    Cantidad Producto   │
    │                       │  │                        │
    │ db.collection(        │  │ new_qty =              │
    │  'sales'              │  │ current_qty - qty_sale │
    │ ).document(rest_id)   │  │                        │
    │  .collection(         │  │ ProductService.update  │
    │  'transactions'       │  │                        │
    │ ).document(sale_id)   │  │                        │
    │  .set(sale_dict)      │  │                        │
    └────┬──────────────────┘  └──────┬─────────────────┘
         │                            │
         └──────────────┬─────────────┘
                        │
             ┌──────────▼──────────────┐
             │ 5. Registrar Movimiento │
             │    de Stock             │
             │                         │
             │ StockMovementService    │
             │ .record_movement()      │
             │                         │
             │ Tipo: SALIDA            │
             │ Razón: Venta            │
             │ Usuario: user_id        │
             │ Timestamp: now()        │
             └──────────┬──────────────┘
                        │
             ┌──────────▼──────────────┐
             │ 6. Retornar al Frontend │
             │                         │
             │ {                       │
             │   saleId: "abc123",     │
             │   success: true         │
             │ }                       │
             └──────────┬──────────────┘
                        │
             ┌──────────▼──────────────┐
             │ Frontend muestra        │
             │ confirmación            │
             │                         │
             │ ✓ Venta registrada      │
             │   correctamente         │
             └────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ACCIONES POSTERIORES (Asincrónicas)                   │
│                                                        │
│ • AI Service verifica stock                           │
│   → Si stock < minThreshold → Crea alerta            │
│   → Si stock <= minThreshold*0.5 → Alerta crítica   │
│                                                        │
│ • Notificaciones (si alerta)                          │
│   → Email al administrador                            │
│   → WhatsApp al gerente                               │
│   → Push notification en app                          │
└────────────────────────────────────────────────────────┘
```

---

## 5. FLUJO DE PREDICCIÓN DE CONSUMO

```
┌─────────────────────────────────────────────────────────┐
│  Scheduler (cada 2 horas) - Cloud Scheduler            │
│  o Cron job - POST /tasks/generate-predictions         │
└──────────────────────┬────────────────────────────────┘
                       │
           ┌───────────▼────────────┐
           │ ConsumptionPredictor   │
           │ __init__(restaurant_id)│
           └───────────┬────────────┘
                       │
           ┌───────────▼──────────────────┐
           │ Para cada producto:          │
           │ predict_consumption()        │
           └───────────┬──────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ 1. Obtener historial de    │
        │    ventas (últimos 90 días)│
        │                            │
        │ SaleService.get_sales()    │
        └──────────────┬─────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ 2. Filtrar por producto    │
        │    y crear serie temporal   │
        │                            │
        │ daily_consumption =        │
        │ {date: total_qty, ...}     │
        └──────────────┬─────────────┘
                       │
        ┌──────────────▼────────────────────┐
        │ 3. Preparar datos para LSTM      │
        │                                   │
        │ values = [qty1, qty2, ..., qty30]│
        │ shape = (-1, 1)                  │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 4. Entrenar modelo LSTM               │
        │                                       │
        │ model.fit(                            │
        │   values[:-7],      # Input           │
        │   values[7:],       # Target          │
        │   epochs=50,                          │
        │   verbose=0                           │
        │ )                                     │
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 5. Generar predicciones (7 días)     │
        │                                       │
        │ for i in range(7):                   │
        │   pred = model.predict(sequence)     │
        │   predictions.append(pred)            │
        │   Actualizar sequence                │
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 6. Calcular métricas                  │
        │                                       │
        │ avg_consumption = mean(predictions)   │
        │ confidence = 90 + (samples/100)       │
        │ days_remaining = qty / avg_consumption│
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 7. Crear alertas si necesario         │
        │                                       │
        │ if qty <= minThreshold * 0.5:        │
        │   alert = CRITICAL                   │
        │ elif qty <= minThreshold:            │
        │   alert = WARNING                    │
        │ else:                                │
        │   alert = None                       │
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 8. Guardar en Firestore              │
        │                                       │
        │ PredictionService.save_prediction()  │
        │ AIAlertService.create_alert()        │
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 9. Enviar notificaciones              │
        │                                       │
        │ if alert.severity > 7:               │
        │   NotificationService.send_email()   │
        │   NotificationService.send_whatsapp()│
        └──────────────┬────────────────────────┘
                       │
        ┌──────────────▼────────────────────────┐
        │ 10. Frontend obtiene alertas          │
        │                                       │
        │ GET /api/alerts/rest_001             │
        │ ↓                                     │
        │ Mostrar en AlertsPanel                │
        │ Mostrar badge en Sidebar              │
        │ Reproducir sonido de alerta           │
        └────────────────────────────────────────┘
```

---

## 6. JERARQUÍA DE DATOS EN FIRESTORE

```
firestore-root/
│
├── 📁 restaurants/
│   ├── rest_001/
│   │   ├── name: "La Casa del Sabor"
│   │   ├── address: "Av. Principal #123"
│   │   └── settings/ (subcollection)
│   │       └── config_001/
│   │           ├── alertThreshold: 20
│   │           └── notifyWhatsApp: true
│   │
│   └── rest_002/
│       ├── name: "El Sabor Auténtico"
│       └── ...
│
├── 📁 users/
│   ├── user_001/
│   │   ├── name: "Carlos García"
│   │   ├── email: "carlos@email.com"
│   │   ├── restaurantId: "rest_001"
│   │   └── role: "admin"
│   │
│   └── user_002/
│       └── ...
│
├── 📁 products/
│   ├── rest_001/
│   │   └── 📁 items/
│   │       ├── prod_001/
│   │       │   ├── name: "Pollo"
│   │       │   ├── quantity: 8
│   │       │   └── minThreshold: 10
│   │       │
│   │       ├── prod_002/
│   │       │   └── ...
│   │       └── prod_003/
│   │           └── ...
│   │
│   └── rest_002/
│       └── 📁 items/
│           └── ...
│
├── 📁 sales/
│   ├── rest_001/
│   │   └── 📁 transactions/
│   │       ├── sale_001/
│   │       │   ├── productId: "prod_001"
│   │       │   ├── quantity: 3
│   │       │   └── totalRevenue: 16.50
│   │       │
│   │       └── sale_002/
│   │           └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 stockMovements/
│   ├── rest_001/
│   │   └── 📁 movements/
│   │       ├── move_001/
│   │       │   ├── productId: "prod_001"
│   │       │   ├── type: "salida"
│   │       │   └── quantity: 3
│   │       │
│   │       └── move_002/
│   │           └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 aiAlerts/
│   ├── rest_001/
│   │   └── 📁 alerts/
│   │       ├── alert_001/
│   │       │   ├── type: "critical"
│   │       │   ├── productId: "prod_003"
│   │       │   └── isRead: false
│   │       │
│   │       └── alert_002/
│   │           └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 predictions/
│   ├── rest_001/
│   │   └── 📁 items/
│   │       ├── pred_001/
│   │       │   ├── productId: "prod_001"
│   │       │   ├── daysRemaining: 1.54
│   │       │   └── confidence: 92
│   │       │
│   │       └── pred_002/
│   │           └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 consumptionPatterns/
│   ├── rest_001/
│   │   ├── prod_001/
│   │   │   ├── monday: 4.5
│   │   │   ├── tuesday: 4.2
│   │   │   └── ...
│   │   │
│   │   └── prod_002/
│   │       └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 suppliers/
│   ├── rest_001/
│   │   ├── sup_001/
│   │   │   ├── name: "Distribuidora Avícola"
│   │   │   ├── email: "supplier@email.com"
│   │   │   └── products: ["prod_001"]
│   │   │
│   │   └── sup_002/
│   │       └── ...
│   │
│   └── rest_002/
│       └── ...
│
├── 📁 auditLogs/
│   ├── rest_001/
│   │   ├── log_001/
│   │   │   ├── action: "UPDATE_PRODUCT"
│   │   │   ├── entityId: "prod_001"
│   │   │   └── userId: "user_001"
│   │   │
│   │   └── log_002/
│   │       └── ...
│   │
│   └── rest_002/
│       └── ...
│
└── 📁 notifications/
    ├── user_001/
    │   ├── notif_001/
    │   │   ├── type: "email"
    │   │   ├── status: "sent"
    │   │   └── createdAt: 2026-03-12T...
    │   │
    │   └── notif_002/
    │       └── ...
    │
    └── user_002/
        └── ...
```

---

## 7. CICLO DE VIDA DE UNA ALERTA

```
┌─────────────────────────────────────────────────┐
│      Predicción detecta stock bajo              │
│  (ConsumptionPredictor.generate_alerts())      │
└──────────────────┬────────────────────────────┘
                   │
      ┌────────────▼─────────────┐
      │ Crear objeto AIAlert     │
      │                          │
      │ {                        │
      │  type: "critical",       │
      │  title: "Stock Crítico", │
      │  severity: 9,            │
      │  isRead: false,          │
      │  timestamp: now()        │
      │ }                        │
      └────────────┬─────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ Guardar en Firestore         │
      │                              │
      │ /aiAlerts/rest_001/alerts/   │
      │  alert_xyz                   │
      └────────────┬──────────────────┘
                   │
      ┌────────────▼────────────────────┐
      │ Enviar Notificaciones           │
      │                                 │
      │ 1. Email al administrador       │
      │ 2. WhatsApp al gerente          │
      │ 3. Push notification en app     │
      └────────────┬────────────────────┘
                   │
      ┌────────────▼────────────────────┐
      │ Frontend consulta alertas       │
      │ GET /api/alerts/rest_001        │
      └────────────┬────────────────────┘
                   │
      ┌────────────▼────────────────────┐
      │ AlertsPanel muestra            │
      │                                │
      │ ⚠️  Stock Crítico - Tomate      │
      │ Acción: [Reabastecer] [Marcar] │
      └────────────┬────────────────────┘
                   │
      ┌────────────▼────────────────────┐
      │ Usuario marca como leída       │
      │ PUT /api/alerts/alert_xyz/read │
      │                                │
      │ isRead: true                   │
      │ readAt: now()                  │
      └────────────┬────────────────────┘
                   │
      ┌────────────▼────────────────────┐
      │ Usuario realiza compra         │
      │ Cantidad aumenta               │
      │                                │
      │ Predicción siguiente ciclo:    │
      │ Stock ya no es crítico ✓       │
      │                                │
      │ Alerta NO se regenera          │
      └────────────────────────────────┘
```

---

## 8. STACK TECNOLÓGICO VISUAL

```
┌──────────────────────────────────────────────────────────────────┐
│                      CAPA CLIENTE (Frontend)                      │
├──────────────────────────────────────────────────────────────────┤
│  React 19    TypeScript    Vite       Tailwind    Recharts        │
│    ⚛️           📘         ⚡            🎨          📊            │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTPS/REST
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CAPA DE SERVIDOR (Backend)                    │
├──────────────────────────────────────────────────────────────────┤
│  Python 3.11   Flask 3.0   Gunicorn    Docker    Nginx            │
│     🐍          🍻         🦄         🐳        🪜             │
├──────────────────────────────────────────────────────────────────┤
│           Machine Learning / AI                                    │
│  TensorFlow 2.12   Keras    scikit-learn   pandas    numpy        │
│      🤖              🧠         🤖         📊        🔢           │
└──────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌────────────┐     ┌─────────────┐    ┌──────────────┐
    │  Firebase  │     │   Google    │    │    Redis     │
    │ Firestore  │     │  Cloud      │    │    Cache     │
    │  Database  │     │  Storage    │    │              │
    │    🔥      │     │   ☁️       │    │    ⚡       │
    └────────────┘     └─────────────┘    └──────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Google Cloud Run    │
                    │  (Serverless)        │
                    │       ☁️            │
                    └──────────────────────┘
```

---

## 9. MATRIZ DE RESPONSABILIDADES

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────────┐
│ Tarea           │ Frontend │ Backend  │ Firebase │ DevOps       │
├─────────────────┼──────────┼──────────┼──────────┼──────────────┤
│ Autenticación   │   ⚡     │    📋    │    💾    │     -        │
│ Validación      │   ✓      │    ✓     │    -     │     -        │
│ CRUD Datos      │   📤     │    ✓     │    💾    │     -        │
│ Predicciones IA │   -      │    ✓     │    -     │     -        │
│ Alertas         │   📢     │    ✓     │    💾    │     -        │
│ Notificaciones  │   -      │    ✓     │    -     │     -        │
│ Cache           │   -      │    ✓     │    -     │     ⚙️       │
│ Logging         │   -      │    ✓     │    -     │     ⚙️       │
│ Monitoreo       │   -      │    -     │    -     │     ⚙️       │
│ Deployment      │   -      │    -     │    -     │     ⚙️       │
│ Backup          │   -      │    -     │    ✓     │     ⚙️       │
│ Seguridad       │   🔒     │    🔒    │    🔒    │     🔒       │
└─────────────────┴──────────┴──────────┴──────────┴──────────────┘

Leyenda:
⚡ = Responsable
✓ = Contribuye
📤 = Envía datos
📋 = Procesa
💾 = Almacena
📢 = Muestra
⚙️ = Configura
🔒 = Asegura
```

---

Este es un documento de referencia visual completo del sistema INVENTIA.

