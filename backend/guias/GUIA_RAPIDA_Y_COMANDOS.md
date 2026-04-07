# 🎯 GUÍA RÁPIDA - COMANDOS Y REFERENCIAS

## 📦 Instalación Rápida

```bash
# 1. Clonar y navegar
git clone <repo-url>
cd backend

# 2. Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (macOS/Linux)
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear archivo .env
cp .env.example .env

# 5. Descargar serviceAccountKey.json
# (desde Firebase Console)

# 6. Ejecutar servidor
python app.py

# Servidor disponible en: http://localhost:5000
```

---

## 📝 Estructura .env Mínima

```env
# REQUERIDO
FIREBASE_PROJECT_ID=inventia-12345
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json

# OPCIONAL
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=5000
```

---

## 🔗 Endpoints Principales de API

### Autenticación
```
POST /api/auth/login
  Body: { email, password }
  Response: { user, token }

POST /api/auth/logout
  Response: { success }
```

### Productos
```
GET /api/products/<restaurant_id>
  Response: [ Product, ... ]

POST /api/products
  Body: { restaurantId, name, category, ... }
  Response: { productId }

PUT /api/products/<restaurant_id>/<product_id>
  Body: { quantity, price, ... }
  Response: { success }

DELETE /api/products/<restaurant_id>/<product_id>
  Response: { success }

GET /api/products/<restaurant_id>/critical
  Response: { count, products }
```

### Ventas
```
POST /api/sales
  Body: { restaurantId, productId, quantity, ... }
  Response: { saleId }

GET /api/sales/<restaurant_id>
  Query: ?days=30
  Response: [ Sale, ... ]
```

### Predicciones
```
GET /api/predictions/<restaurant_id>
  Response: [ Prediction, ... ]

GET /api/consumption/<restaurant_id>/<product_id>
  Response: { predictions, confidence }
```

### Alertas
```
GET /api/alerts/<restaurant_id>
  Response: [ Alert, ... ]

POST /api/alerts/<restaurant_id>/generate
  Response: { alertsGenerated, alerts }

PUT /api/alerts/<restaurant_id>/<alert_id>/read
  Response: { success }
```

### Dashboard
```
GET /api/dashboard/<restaurant_id>
  Response: {
    summary: { totalInventoryValue, todayRevenue, ... },
    inventory: { ... },
    sales: { ... },
    alerts: { ... }
  }
```

---

## 📊 Queries en Firestore

### Obtener todos los productos de un restaurante
```python
db.collection('products').document(restaurant_id)\
  .collection('items').stream()
```

### Obtener productos con stock bajo
```python
db.collection('products').document(restaurant_id)\
  .collection('items')\
  .where('quantity', '<=', 'minThreshold').stream()
```

### Obtener alertas activas (no leídas)
```python
db.collection('aiAlerts').document(restaurant_id)\
  .collection('alerts')\
  .where('isRead', '==', False)\
  .order_by('timestamp', direction='DESCENDING').stream()
```

### Obtener ventas de los últimos 30 días
```python
since = datetime.now() - timedelta(days=30)
db.collection('sales').document(restaurant_id)\
  .collection('transactions')\
  .where('date', '>=', since)\
  .order_by('date', direction='DESCENDING').stream()
```

### Obtener stock movements
```python
db.collection('stockMovements').document(restaurant_id)\
  .collection('movements')\
  .where('movementType', '==', 'entrada')\
  .stream()
```

---

## 🧪 Testing con CURL

### Crear producto
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId": "rest_001",
    "name": "Pollo",
    "category": "Carnes",
    "quantity": 10,
    "unit": "kg",
    "minThreshold": 5,
    "maxCapacity": 50,
    "pricePerUnit": 5.50,
    "supplier": "Proveedor ABC"
  }'
```

### Obtener productos
```bash
curl -X GET http://localhost:5000/api/products/rest_001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Registrar venta
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId": "rest_001",
    "productId": "prod_001",
    "productName": "Pollo",
    "quantity": 3,
    "unitPrice": 5.50,
    "totalRevenue": 16.50,
    "userId": "user_001",
    "notes": "Venta normal"
  }'
```

### Generar predicciones
```bash
curl -X POST http://localhost:5000/api/alerts/rest_001/generate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ver alertas
```bash
curl -X GET http://localhost:5000/api/alerts/rest_001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐍 Comandos Python Útiles

### Ejecutar script de inicialización
```bash
python scripts/initialize_db.py
```

### Ejecutar predicciones manualmente
```bash
python -c "
from services.ai_service import ConsumptionPredictor
predictor = ConsumptionPredictor('rest_001')
alerts = predictor.generate_alerts()
print(f'Alertas generadas: {len(alerts)}')
"
```

### Limpiar caché Redis
```bash
python -c "
from utils.cache import redis_client
redis_client.flushdb()
print('Caché limpiado')
"
```

### Hacer backup de Firestore
```bash
python -c "
from tasks.backup_manager import BackupManager
BackupManager.backup_firestore('mi-bucket-backup')
"
```

---

## 🚀 Deployment Rápido

### Docker Build & Run
```bash
# Construir imagen
docker build -t inventia-backend:latest .

# Ejecutar localmente
docker run -p 5000:5000 \
  -e FIREBASE_PROJECT_ID=tu-proyecto \
  -e FLASK_ENV=production \
  inventia-backend:latest

# Ejecutar con archivo .env
docker run -p 5000:5000 --env-file .env inventia-backend:latest
```

### Google Cloud Run Deploy
```bash
# Autenticar
gcloud auth login
gcloud config set project tu-proyecto-id

# Crear secret
gcloud secrets create firebase-key --data-file=serviceAccountKey.json

# Deploy
gcloud run deploy inventia-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi

# Ver URL
gcloud run services describe inventia-backend --region us-central1
```

### Heroku Deploy
```bash
# Login
heroku login

# Crear app
heroku create inventia-backend

# Agregar variables
heroku config:set FIREBASE_PROJECT_ID=tu-proyecto
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

---

## 📋 Checklists Desarrollo

### Antes de hacer commit
```bash
# 1. Tests
pytest tests/ -v

# 2. Linting
pylint services/ routes/
flake8 services/ routes/

# 3. Formatter
black services/ routes/

# 4. Coverage
pytest --cov=services --cov=routes tests/

# 5. Git
git status
git diff
git add .
git commit -m "Mensaje descriptivo"
```

### Antes de push a producción
```bash
# 1. Verificar variables .env
echo $FIREBASE_PROJECT_ID
echo $FLASK_ENV

# 2. Run local tests
pytest tests/ -v

# 3. Build Docker image
docker build -t inventia-backend:v1.0 .

# 4. Test Docker image
docker run -p 5000:5000 --env-file .env inventia-backend:v1.0

# 5. Check health endpoint
curl http://localhost:5000/health

# 6. Push image
docker tag inventia-backend:v1.0 gcr.io/proyecto/inventia:v1.0
docker push gcr.io/proyecto/inventia:v1.0
```

---

## 🔍 Debugging y Monitoreo

### Ver logs en desarrollo
```bash
# Logs en tiempo real
tail -f logs/app.log

# Filtrar por nivel de error
grep "ERROR" logs/errors.log

# Ver últimas 50 líneas
tail -50 logs/app.log

# Ver con timestamp
cat logs/app.log | grep "2026-03-12"
```

### Monitorear en Google Cloud
```bash
# Ver logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=inventia-backend" --limit 50

# Ver métricas
gcloud monitoring time-series list --filter='metric.type=run.googleapis.com/request_count'

# Ver errores
gcloud error-reporting list
```

### Health Check
```bash
# Local
curl http://localhost:5000/health

# Producción
curl https://api.inventia.com/health

# Con certificado
curl --cacert /path/to/cert.pem https://api.inventia.com/health
```

---

## 🎨 Ejemplo Completo: Agregar Nuevo Endpoint

### 1. Crear modelo (si es necesario)
```python
# models/feedback.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Feedback:
    restaurantId: str
    message: str
    rating: int  # 1-5
    userId: str
    feedbackId: Optional[str] = None
    createdAt: Optional[datetime] = None
```

### 2. Crear servicio
```python
# services/feedback_service.py
from config import db
from models.feedback import Feedback
from datetime import datetime
import uuid

class FeedbackService:
    @staticmethod
    def create_feedback(feedback: Feedback) -> str:
        feedback_id = str(uuid.uuid4())
        feedback.feedbackId = feedback_id
        feedback.createdAt = datetime.now()
        
        db.collection('feedback').document(feedback.restaurantId)\
            .collection('messages').document(feedback_id)\
            .set(feedback.to_dict())
        
        return feedback_id
    
    @staticmethod
    def get_feedback(restaurant_id: str):
        docs = db.collection('feedback').document(restaurant_id)\
            .collection('messages').order_by('createdAt', direction='DESCENDING').stream()
        
        return [Feedback(**doc.to_dict()) for doc in docs]
```

### 3. Crear ruta
```python
# routes/feedback.py
from flask import Blueprint, request, jsonify
from services.feedback_service import FeedbackService
from models.feedback import Feedback
from utils.decorators import verify_token

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/', methods=['POST'])
@verify_token
def create_feedback():
    try:
        data = request.json
        feedback = Feedback(**data)
        feedback_id = FeedbackService.create_feedback(feedback)
        return jsonify({'feedbackId': feedback_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@feedback_bp.route('/<restaurant_id>', methods=['GET'])
@verify_token
def get_feedback(restaurant_id):
    try:
        feedback = FeedbackService.get_feedback(restaurant_id)
        return jsonify([f.to_dict() for f in feedback])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 4. Registrar en app.py
```python
# app.py
from routes import feedback

app.register_blueprint(feedback.feedback_bp, url_prefix='/api/feedback')
```

### 5. Usar en Frontend
```typescript
// src/services/feedbackService.ts
import { apiCall } from './firebaseConfig';

export const submitFeedback = async (
  restaurantId: string,
  message: string,
  rating: number
) => {
  return apiCall('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
      restaurantId,
      message,
      rating,
      userId: 'current-user-id'
    })
  });
};

export const getFeedback = async (restaurantId: string) => {
  return apiCall(`/api/feedback/${restaurantId}`);
};
```

---

## 📚 Referencias Rápidas

### Documentación Oficial
- [Firebase](https://firebase.google.com/docs)
- [Flask](https://flask.palletsprojects.com/)
- [Python](https://docs.python.org/3/)
- [TensorFlow](https://www.tensorflow.org/)
- [React](https://react.dev)

### Librerías Importantes
```python
# Firestore
from firebase_admin import firestore

# Datos
import pandas as pd
import numpy as np

# IA
from tensorflow import keras
from sklearn.preprocessing import StandardScaler

# Web
from flask import Flask, request, jsonify
from flask_cors import CORS

# Utilidades
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
```

### Patrones Comunes

#### Decorador para timing
```python
def timing(f):
    import time
    from functools import wraps
    @wraps(f)
    def wrapped(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        print(f"{f.__name__} took {time.time() - start:.2f}s")
        return result
    return wrapped

@timing
def slow_function():
    pass
```

#### Decorador para caché
```python
def cache_result(ttl=3600):
    def decorator(f):
        from functools import wraps
        from utils.cache import cache_get, cache_set
        @wraps(f)
        def wrapped(*args, **kwargs):
            key = f"{f.__name__}:{str(args)}:{str(kwargs)}"
            result = cache_get(key)
            if result:
                return result
            result = f(*args, **kwargs)
            cache_set(key, result, ttl)
            return result
        return wrapped
    return decorator

@cache_result(ttl=3600)
def expensive_operation():
    pass
```

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "No module named 'firebase_admin'"
```bash
# Solución: Reinstalar dependencias
pip install --upgrade firebase-admin
```

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
```python
# Solución: Verificar CORS config en app.py
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Error: "Firestore missing write permission"
```
Solución: Actualizar rules en Firestore Console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Error: "Token expired"
```typescript
// Solución: Refrescar token
const newToken = await getCurrentUser()?.getIdToken(true);
localStorage.setItem('authToken', newToken);
```

---

## 🎯 Roadmap Desarrollo

**Semana 1-2**: Setup Básico
- [ ] Crear proyecto Firebase
- [ ] Configurar estructura backend
- [ ] Implementar CRUD básico

**Semana 3-4**: Predicciones
- [ ] Implementar AI Service
- [ ] Entrenar modelos
- [ ] Generar alertas

**Semana 5**: Notificaciones
- [ ] Email service
- [ ] WhatsApp integration
- [ ] Push notifications

**Semana 6-7**: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Deploy a producción

**Semana 8+**: Optimizaciones
- [ ] Caching
- [ ] Monitoreo
- [ ] Mejoras performance

---

**¡Éxito en tu desarrollo!** 🚀

