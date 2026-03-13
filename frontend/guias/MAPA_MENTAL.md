# 🗺️ MAPA MENTAL - INVENTIA

## Estructura General del Proyecto

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PROYECTO INVENTIA                              │
│                    Sistema de Gestión de Inventario IA                  │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
        ┌─────────────┼──────────────────────────┐
        │             │                          │
        ▼             ▼                          ▼
    ┌────────┐   ┌────────┐              ┌──────────────┐
    │Frontend│   │ Backend│              │   Database   │
    └────────┘   └────────┘              └──────────────┘
        │             │                          │
        │             │                  (Firestore + Storage)
        ├─ React      ├─ Python 3.11             │
        ├─ TypeScript ├─ Flask                   ├─ Collections
        ├─ Vite       ├─ Gunicorn                ├─ Documents
        ├─ Tailwind   ├─ TensorFlow              ├─ Subcollections
        └─ Firebase   └─ scikit-learn             └─ Rules
```

---

## Flujo de Componentes

```
USUARIO FINAL
    │
    ├─ FRONTEND (React)
    │   ├─ Pages
    │   │   ├─ Dashboard (vista principal)
    │   │   ├─ Inventory (productos)
    │   │   ├─ Sales (ventas)
    │   │   ├─ AI Insights (predicciones)
    │   │   └─ Settings (configuración)
    │   │
    │   ├─ Components
    │   │   ├─ StatsCard
    │   │   ├─ InventoryTable
    │   │   ├─ AlertsPanel
    │   │   ├─ ConsumptionChart
    │   │   └─ AIRecommendations
    │   │
    │   └─ Services
    │       ├─ Firebase Auth
    │       └─ API Calls (REST)
    │
    └─ BACKEND (Python/Flask)
        ├─ Routes (API Endpoints)
        │   ├─ /api/products
        │   ├─ /api/sales
        │   ├─ /api/alerts
        │   ├─ /api/predictions
        │   └─ /api/dashboard
        │
        ├─ Services (Lógica de Negocio)
        │   ├─ ProductService
        │   ├─ SaleService
        │   ├─ AIService
        │   ├─ NotificationService
        │   └─ AnalyticsService
        │
        ├─ Models (Data)
        │   ├─ Product
        │   ├─ Sale
        │   ├─ User
        │   ├─ Alert
        │   └─ Prediction
        │
        ├─ AI Engine
        │   ├─ LSTM Model
        │   ├─ Consumption Predictor
        │   └─ Alert Generator
        │
        └─ Integrations
            ├─ Firestore
            ├─ Redis Cache
            ├─ Email (SMTP)
            └─ WhatsApp (Twilio)
```

---

## Stack Tecnológico

```
CAPA PRESENTACIÓN
    React 19
    TypeScript
    Tailwind CSS
    Framer Motion
    Recharts
           │
           ▼
CAPA LÓGICA / API
    Flask
    Python 3.11
    Gunicorn
           │
           ├─── ┐
           │    │
    ┌─────▼─┐  │ Machine Learning
    │Services│  │ TensorFlow
    │ + CRUD │  │ scikit-learn
    └───────┘   │ Keras
           │    │
           ├─── ┘
           ▼
CAPA DATOS / ALMACENAMIENTO
    Firestore (NoSQL)
    Cloud Storage
    Redis Cache
    
CAPA INFRAESTRUCTURA
    Docker
    Google Cloud Run (o alternatives)
    Cloud Scheduler
    Cloud Monitoring
```

---

## Ciclos de Datos

```
CICLO 1: ENTRADA DE VENTA
    Usuario Registra Venta
        │
        ▼
    Frontend: POST /api/sales
        │
        ▼
    Backend: Valida y Guarda
        │
        ├─ Guardar en Firestore
        ├─ Actualizar Stock
        └─ Registrar Movimiento
        │
        ▼
    Base de Datos: Firestore Updated
        │
        ▼
    Frontend: Actualiza UI (Success)

CICLO 2: PREDICCIÓN (2H)
    Scheduler Ejecuta
        │
        ▼
    Python: ConsumptionPredictor
        │
        ├─ Lee histórico (90 días)
        ├─ Entrena modelo LSTM
        └─ Genera predicciones
        │
        ▼
    Analiza y Crea Alertas
        │
        ├─ Stock crítico? → Alerta CRITICAL
        ├─ Stock bajo? → Alerta WARNING
        └─ Stock normal? → No alerta
        │
        ▼
    Guarda en Firestore
        │
        ▼
    Frontend: Obtiene GET /api/alerts
        │
        ├─ Muestra AlertsPanel
        ├─ Reproduce sonido
        └─ Notifica al usuario
        │
        ▼
    Envía Notificaciones
        │
        ├─ Email al Admin
        └─ WhatsApp al Gerente

CICLO 3: VISUALIZACIÓN (Real-time)
    Usuario Abre Dashboard
        │
        ▼
    GET /api/dashboard/rest_001
        │
        ▼
    Backend Calcula KPIs
        │
        ├─ Valor total inventario
        ├─ Ventas hoy
        ├─ Productos críticos
        └─ Tendencias semanales
        │
        ▼
    Retorna JSON
        │
        ▼
    Frontend: Render Gráficos y Cards
```

---

## Estructura de Decisiones

```
¿Es una venta?
    ├─ YES → Registra en sales
    │        ├─ Actualiza cantidad
    │        ├─ Crea movimiento
    │        └─ Verifica stock
    │
    └─ NO → ¿Es un movimiento de stock?
            ├─ YES → Registra movimiento
            │        └─ Entrada/Salida/Ajuste
            │
            └─ NO → ¿Es una predicción?
                    ├─ YES → Corre modelo IA
                    │        ├─ Analiza consumo histórico
                    │        ├─ Genera recomendaciones
                    │        └─ Crea alertas
                    │
                    └─ NO → Otra operación (config, etc)
```

---

## Tipos de Usuarios y Permisos

```
ADMINISTRADOR
    ├─ Ver todo
    ├─ Crear/editar/eliminar productos
    ├─ Crear/editar/eliminar usuarios
    ├─ Ver reportes
    ├─ Configurar alertas
    └─ Configurar restaurante

GERENTE
    ├─ Ver dashboard
    ├─ Registrar ventas
    ├─ Ver inventario
    ├─ Ver alertas
    ├─ Editar productos (cantidad, precio)
    └─ Ver reportes (lectura)

OPERARIO
    ├─ Ver inventario
    ├─ Registrar ventas
    ├─ Registrar movimientos
    └─ Ver alertas (lectura)
```

---

## Dependencias Críticas

```
FRONTEND → Firebase Auth (autenticación)
        → Backend API (datos)
        → Firebase SDK

BACKEND → Firebase Admin SDK (datos)
       → TensorFlow (predicciones)
       → Redis (caché)
       → SMTP (emails)
       → Twilio (WhatsApp)
       → Google Cloud (infraestructura)

FIREBASE → Google Cloud Account
        → Credenciales configuradas
        → Security rules definidas

IA → Datos históricos (>=30 días)
  → Modelo entrenado
  → Escalador de datos
```

---

## Timeline de Desarrollo Recomendado

```
SEMANA 1
├─ Setup Firebase
├─ Setup estructura backend
├─ Implementar CRUD productos
└─ Crear endpoints básicos

SEMANA 2
├─ Implementar CRUD ventas
├─ Crear movimientos de stock
├─ Integrar frontend con backend
└─ Testing básico

SEMANA 3
├─ Implementar modelo IA
├─ Generador de alertas
├─ Entrenar con datos históricos
└─ Testing IA

SEMANA 4
├─ Notificaciones email
├─ Notificaciones WhatsApp
├─ Dashboard metricas
└─ Reportes

SEMANA 5-6
├─ Testing exhaustivo
├─ Optimizaciones
├─ Documentación
└─ Preparar deployment

SEMANA 7
├─ Deployment staging
├─ Testing producción
├─ Monitoreo setup
└─ Deployment producción
```

---

## Matriz de Tecnologías

```
CATEGORÍA           TECNOLOGÍA                  ALTERNATIVAS
─────────────────────────────────────────────────────────────────
Frontend            React                       Vue, Angular
Styling             Tailwind CSS                Bootstrap, Material
Build               Vite                        Webpack, Parcel
Backend             Python Flask                Node.js Express, Go
Database            Firestore                   MongoDB, PostgreSQL
Cache               Redis                       Memcached
AI/ML               TensorFlow LSTM             PyTorch, Scikit-learn
Hosting             Google Cloud Run            AWS Lambda, Heroku
Monitor             Google Cloud               Datadog, New Relic
Email               SMTP Gmail                  SendGrid, Mailgun
SMS/WhatsApp        Twilio                      Vonage, MessageBird
```

---

## Métricas y KPIs

```
OPERACIONAL
├─ Disponibilidad API (target: 99.9%)
├─ Tiempo respuesta (target: <200ms)
├─ Errores por día (target: 0)
└─ Uptime aplicación (target: 99.95%)

NEGOCIO
├─ Exactitud predicciones (target: >85%)
├─ Alertas generadas/día (target: 5-20)
├─ Usuarios activos/día
└─ Utilización del sistema

DATOS
├─ Registros de ventas/día
├─ Productos monitoreados
├─ Histórico procesado (días)
└─ Tamaño BD (GB)

SEGURIDAD
├─ Intentos login fallidos/día
├─ Accesos no autorizados (target: 0)
├─ Vulnerabilidades detectadas (target: 0)
└─ Backups completados (target: 100%)
```

---

## Configuración Mínima Requerida

```
ANTES DE EMPEZAR
├─ Proyecto Firebase Console ✓
├─ serviceAccountKey.json ✓
├─ Python 3.11 ✓
├─ pip install -r requirements.txt ✓
├─ Archivo .env configurado ✓
├─ Base de datos inicializada ✓
└─ Tests pasando ✓

ANTES DE PRODUCCIÓN
├─ HTTPS/SSL ✓
├─ Firestore rules ✓
├─ Backups automáticos ✓
├─ Monitoreo activo ✓
├─ Logging centralizado ✓
├─ Rate limiting ✓
├─ CORS correcto ✓
├─ Variables secretas ✓
└─ Tests de carga ✓
```

---

## Troubleshooting Rápido

```
PROBLEMA                    SOLUCIÓN
─────────────────────────────────────────────────────────
No conecta a Firebase       - Verificar credenciales
                           - Verificar reglas
                           - Verificar conexión

API devuelve 500           - Revisar logs
                           - Verificar modelo IA
                           - Verificar credenciales

Predicciones inexactas      - Más datos históricos
                           - Reentrenar modelo
                           - Ajustar parámetros

Frontend no actualiza       - Verificar CORS
                           - Verificar token
                           - Verificar caché

Alertas no se envían        - Verificar email config
                           - Verificar Twilio
                           - Ver logs
```

---

## Cambios Importantes Necesarios

```
EN FRONTEND
├─ AuthContext.tsx → Conectar con backend
├─ services/ → Crear API service
├─ useEffect → Obtener datos de API
└─ localStorage → Guardar JWT token

EN BACKEND
├─ Crear estructura de carpetas
├─ Implementar servicios
├─ Configurar Firestore
├─ Entrenar modelos IA
└─ Crear scheduler de tareas

EN FIRESTORE
├─ Crear colecciones
├─ Crear índices
├─ Definir reglas de seguridad
└─ Hacer backup inicial
```

---

## Checklist Visual de Implementación

```
FASE 1: FOUNDATION ███░░░░░░
├─ Firebase Setup      ✓
├─ Backend Structure   ✓
├─ Modelos Datos      ✓
└─ CRUD Básico        ⏳

FASE 2: CORE ████░░░░░
├─ API Endpoints      ⏳
├─ Frontend Conn      □
├─ Auth Service       □
└─ Testing            □

FASE 3: FEATURES █████░░░
├─ IA/Predicciones   □
├─ Alertas            □
├─ Notificaciones     □
└─ Dashboard          □

FASE 4: POLISH ██████░░
├─ Optimización      □
├─ Monitoreo         □
├─ Documentación     □
└─ QA                □

FASE 5: LAUNCH ███████░
├─ Deployment        □
├─ Staging Test      □
├─ Production        □
└─ Monitoring        □
```

---

Este mapa mental te ayuda a:
- Entender la estructura del proyecto rápidamente
- Visualizar los flujos de datos
- Identificar dependencias
- Planificar el desarrollo
- Resolver problemas comunes

