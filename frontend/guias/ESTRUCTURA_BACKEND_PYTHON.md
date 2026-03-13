# Estructura de Carpetas - Backend Python

```
backend/
├── app.py                          # Punto de entrada de la aplicación
├── config.py                       # Configuración de Firebase y Flask
├── requirements.txt                # Dependencias Python
├── .env                           # Variables de entorno
├── .gitignore                     # Archivo Git ignore
├── serviceAccountKey.json         # Credenciales Firebase (NO COMITEAR)
│
├── models/                        # Modelos de datos
│   ├── __init__.py
│   ├── product.py                # Modelo Product
│   ├── sale.py                   # Modelo Sale
│   ├── user.py                   # Modelo User
│   ├── alert.py                  # Modelo AIAlert
│   ├── prediction.py             # Modelo Prediction
│   ├── stock_movement.py         # Modelo StockMovement
│   └── restaurant.py             # Modelo Restaurant
│
├── services/                      # Servicios de lógica de negocio
│   ├── __init__.py
│   ├── firebase_service.py       # Servicios CRUD Firebase
│   ├── product_service.py        # Lógica de productos
│   ├── sale_service.py           # Lógica de ventas
│   ├── ai_service.py             # Servicio de IA y predicciones
│   ├── notification_service.py   # Notificaciones email/WhatsApp
│   ├── analytics_service.py      # Análisis y reportes
│   └── auth_service.py           # Autenticación con Firebase
│
├── routes/                        # Rutas/Endpoints API
│   ├── __init__.py
│   ├── products.py               # GET, POST, PUT, DELETE productos
│   ├── sales.py                  # Registro de ventas
│   ├── alerts.py                 # Gestión de alertas
│   ├── predictions.py            # Predicciones IA
│   ├── dashboard.py              # Datos del dashboard
│   ├── users.py                  # Gestión de usuarios
│   ├── reports.py                # Reportes
│   └── auth.py                   # Autenticación
│
├── utils/                        # Utilidades
│   ├── __init__.py
│   ├── decorators.py             # Decoradores (verificación token, etc)
│   ├── validators.py             # Validadores de datos
│   ├── constants.py              # Constantes de la app
│   ├── helpers.py                # Funciones auxiliares
│   └── logger.py                 # Configuración de logging
│
├── ai_models/                    # Modelos de Machine Learning
│   ├── __init__.py
│   ├── lstm_predictor.py         # Modelo LSTM para predicciones
│   ├── consumption_analyzer.py   # Analizador de consumo
│   └── models/                   # Modelos entrenados (pickle/h5)
│       ├── lstm_model_v1.h5
│       └── scaler.pkl
│
├── migrations/                   # Scripts de migración (si aplica)
│   ├── __init__.py
│   ├── initial_setup.py          # Setup inicial
│   └── add_new_collections.py
│
├── tests/                        # Tests
│   ├── __init__.py
│   ├── test_firebase_service.py
│   ├── test_ai_service.py
│   ├── test_products.py
│   ├── test_sales.py
│   └── conftest.py               # Configuración de pytest
│
├── logs/                         # Logs de la aplicación
│   ├── app.log
│   └── errors.log
│
└── docs/                         # Documentación
    ├── API.md                    # Documentación de API
    ├── SETUP.md                  # Guía de instalación
    └── DEPLOYMENT.md             # Guía de deployment
```

---

## 📄 Archivos Clave

### `requirements.txt`
```
flask==3.0.0
flask-cors==4.0.0
firebase-admin==6.2.0
python-dotenv==1.0.0
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.2.0
tensorflow==2.12.0
requests==2.31.0
gunicorn==21.2.0
python-dateutil==2.8.2
pytz==2023.3
Werkzeug==3.0.0
```

### `config.py`
```python
import os
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import logging

load_dotenv()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Inicializar Firebase
try:
    cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json'))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Firebase initialization failed: {e}")
    raise

# Crear aplicación Flask
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

class FirebaseConfig:
    db = db
    app = app
    logger = logger

# Health check
@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'service': 'INVENTIA Backend'}, 200
```

### `app.py`
```python
from config import app, logger
from routes import products, sales, alerts, predictions, dashboard, users, auth

# Registrar blueprints (rutas)
app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
app.register_blueprint(products.products_bp, url_prefix='/api/products')
app.register_blueprint(sales.sales_bp, url_prefix='/api/sales')
app.register_blueprint(alerts.alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(predictions.predictions_bp, url_prefix='/api/predictions')
app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(users.users_bp, url_prefix='/api/users')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {error}")
    return {'error': 'Internal server error'}, 500

@app.errorhandler(400)
def bad_request(error):
    return {'error': 'Bad request'}, 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

### `models/product.py`
```python
from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime

@dataclass
class Product:
    restaurantId: str
    name: str
    category: str
    quantity: float
    unit: str
    minThreshold: float
    maxCapacity: float
    pricePerUnit: float
    supplier: str
    
    # Opcionales
    productId: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    expiryDate: Optional[str] = None
    lastUpdated: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    active: bool = True
    
    def to_dict(self):
        """Convertir a diccionario"""
        result = {}
        for k, v in asdict(self).items():
            if isinstance(v, datetime):
                result[k] = v.isoformat()
            elif v is not None:
                result[k] = v
        return result
    
    def to_firestore(self):
        """Convertir para Firestore"""
        return self.to_dict()
    
    @property
    def stock_percentage(self) -> float:
        """Porcentaje de stock"""
        return (self.quantity / self.maxCapacity) * 100 if self.maxCapacity > 0 else 0
    
    @property
    def status(self) -> str:
        """Estado del stock"""
        if self.quantity <= self.minThreshold * 0.5:
            return 'critical'
        elif self.quantity <= self.minThreshold:
            return 'low'
        elif self.stock_percentage >= 80:
            return 'full'
        return 'normal'
```

### `services/firebase_service.py`
```python
from config import FirebaseConfig
from models.product import Product
from models.sale import Sale
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid

db = FirebaseConfig.db

class ProductService:
    @staticmethod
    def create_product(product: Product) -> str:
        """Crear nuevo producto"""
        product_id = str(uuid.uuid4())
        product.productId = product_id
        product.createdAt = datetime.now()
        product.lastUpdated = datetime.now()
        
        db.collection('products').document(product.restaurantId)\
            .collection('items').document(product_id)\
            .set(product.to_firestore())
        
        return product_id
    
    @staticmethod
    def get_product(restaurant_id: str, product_id: str) -> Optional[Product]:
        """Obtener producto por ID"""
        doc = db.collection('products').document(restaurant_id)\
            .collection('items').document(product_id).get()
        
        if doc.exists:
            return Product(**doc.to_dict())
        return None
    
    @staticmethod
    def get_all_products(restaurant_id: str) -> List[Product]:
        """Obtener todos los productos"""
        docs = db.collection('products').document(restaurant_id)\
            .collection('items').stream()
        
        return [Product(**doc.to_dict()) for doc in docs]
    
    @staticmethod
    def update_product(restaurant_id: str, product_id: str, data: Dict):
        """Actualizar producto"""
        data['lastUpdated'] = datetime.now()
        db.collection('products').document(restaurant_id)\
            .collection('items').document(product_id).update(data)
    
    @staticmethod
    def delete_product(restaurant_id: str, product_id: str):
        """Eliminar producto"""
        db.collection('products').document(restaurant_id)\
            .collection('items').document(product_id).delete()
```

### `routes/products.py`
```python
from flask import Blueprint, request, jsonify
from services.firebase_service import ProductService
from models.product import Product
from utils.decorators import verify_token
from utils.validators import validate_product_data
import traceback

products_bp = Blueprint('products', __name__)

@products_bp.route('/<restaurant_id>', methods=['GET'])
@verify_token
def get_products(restaurant_id):
    """Obtener todos los productos de un restaurante"""
    try:
        products = ProductService.get_all_products(restaurant_id)
        return jsonify([p.to_dict() for p in products])
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'])
@verify_token
def create_product():
    """Crear nuevo producto"""
    try:
        data = request.json
        
        # Validar datos
        errors = validate_product_data(data)
        if errors:
            return jsonify({'errors': errors}), 400
        
        product = Product(**data)
        product_id = ProductService.create_product(product)
        
        return jsonify({'productId': product_id}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@products_bp.route('/<restaurant_id>/<product_id>', methods=['PUT'])
@verify_token
def update_product(restaurant_id, product_id):
    """Actualizar producto"""
    try:
        data = request.json
        ProductService.update_product(restaurant_id, product_id, data)
        return jsonify({'success': True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@products_bp.route('/<restaurant_id>/<product_id>', methods=['DELETE'])
@verify_token
def delete_product(restaurant_id, product_id):
    """Eliminar producto"""
    try:
        ProductService.delete_product(restaurant_id, product_id)
        return jsonify({'success': True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400
```

### `utils/decorators.py`
```python
from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth

def verify_token(f):
    """Verificar token JWT de Firebase"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remover "Bearer " del token
            token = token.split(' ')[1] if ' ' in token else token
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function

def admin_required(f):
    """Verificar que el usuario sea administrador"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.user.get('admin'):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function
```

### `.env` Plantilla
```
# Firebase
FIREBASE_PROJECT_ID=inventia-xxxxx
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DATABASE_URL=firestore

# AI/ML
AI_MODEL_PATH=ai_models/models/
PREDICTION_CONFIDENCE_THRESHOLD=0.8

# Notifications
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@inventia.com

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE=+1234567890

# API
PORT=5000
MAX_WORKERS=4

# Logging
LOG_LEVEL=INFO
```

---

## 🚀 Comandos de Instalación y Ejecución

### Instalación Inicial
```bash
# Clonar repositorio
git clone <repo-url>
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Descargar serviceAccountKey.json de Firebase Console
# y guardarlo en la raíz del proyecto

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones
```

### Ejecución Local
```bash
# Desarrollo
python app.py

# Producción con Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Con auto-reload
gunicorn -w 1 -b 0.0.0.0:5000 --reload app:app
```

### Tests
```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=services --cov=routes tests/

# Tests específicos
pytest tests/test_firebase_service.py -v
```

### Linting
```bash
# Verificar código
pylint services/ routes/

# Formatear código
autopep8 --in-place --aggressive --aggressive -r services/ routes/
```

---

## 📊 Estructura de Datos en Firestore (Vista Rápida)

```
firestore/
├── restaurants/
├── users/
├── products/
├── sales/
├── stockMovements/
├── aiAlerts/
├── predictions/
├── consumptionPatterns/
├── suppliers/
├── auditLogs/
└── notifications/
```

---

## 🔄 Flujo de Datos

```
Frontend (React)
    ↓
    ├─→ HTTP Request → Flask API
    │                      ↓
    │                Firebase Services
    │                      ↓
    │                Firestore Database
    │
    └─→ WebSocket (opcional)
              ↓
        Real-time Updates
```

---

## 📝 Notas Importantes

1. **Seguridad**: Nunca comitear `serviceAccountKey.json`
2. **Logging**: Revisar logs en `logs/` regularmente
3. **Backups**: Firebase automáticamente hace backups diarios
4. **Escalabilidad**: Usar Firestore indexes para queries complejas
5. **Caching**: Implementar Redis para datos frecuentes
6. **Rate Limiting**: Considerar implementar rate limiting en producción

