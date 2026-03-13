# INVENTIA - Estructura Firebase y Conexión Python

## 📋 ANÁLISIS DEL PROYECTO

El proyecto **INVENTIA** es un sistema de gestión de inventario para restaurantes con las siguientes características:

- **Frontend**: React + TypeScript + Vite
- **Propósito**: Gestión de inventario, predicción IA de consumo, alertas de stock
- **Usuarios**: Administradores de restaurantes
- **Funcionalidades principales**:
  - Gestión de productos (inventario)
  - Ventas y movimientos de stock
  - Predicciones IA de consumo
  - Alertas automáticas
  - Configuración de restaurante
  - Autenticación de usuarios

---

## 🏗️ ESTRUCTURA DE BASE DE DATOS EN FIREBASE

### Arquitectura General

Firebase ofrece dos servicios principales:
1. **Firestore** - Base de datos NoSQL (documentos y colecciones)
2. **Realtime Database** - Base de datos tiempo real

**Recomendación**: Usar **Firestore** por su escalabilidad y consultas avanzadas.

### Colecciones en Firestore

```
firestore-database/
├── restaurants/
│   └── {restaurantId}/
│       ├── name: string
│       ├── address: string
│       ├── phone: string
│       ├── email: string
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── settings/ (subcollection)
│           └── {settingId}/
│
├── users/
│   └── {userId}/
│       ├── name: string
│       ├── email: string
│       ├── role: string
│       ├── restaurantId: string (referencia)
│       ├── avatar: string (URL)
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── products/
│   └── {restaurantId}/
│       └── {productId}/
│           ├── name: string
│           ├── category: string
│           ├── quantity: number
│           ├── unit: string
│           ├── minThreshold: number
│           ├── maxCapacity: number
│           ├── pricePerUnit: number
│           ├── supplier: string
│           ├── lastUpdated: timestamp
│           ├── createdAt: timestamp
│           └── sku: string (Código único)
│
├── sales/
│   └── {restaurantId}/
│       └── {saleId}/
│           ├── productId: string (referencia)
│           ├── productName: string
│           ├── quantity: number
│           ├── unitPrice: number
│           ├── totalRevenue: number
│           ├── date: timestamp
│           ├── userId: string (quién realizó la venta)
│           ├── notes: string
│           └── createdAt: timestamp
│
├── stockMovements/
│   └── {restaurantId}/
│       └── {movementId}/
│           ├── productId: string (referencia)
│           ├── movementType: string (entrada/salida/ajuste)
│           ├── quantity: number
│           ├── reason: string
│           ├── timestamp: timestamp
│           ├── userId: string (quién hizo el movimiento)
│           └── notes: string
│
├── aiAlerts/
│   └── {restaurantId}/
│       └── {alertId}/
│           ├── type: string (critical/warning/info/success)
│           ├── title: string
│           ├── message: string
│           ├── productId: string (referencia)
│           ├── productName: string
│           ├── severity: number (1-10)
│           ├── isRead: boolean
│           ├── timestamp: timestamp
│           ├── resolvedAt: timestamp (null si no resuelto)
│           └── createdAt: timestamp
│
├── predictions/
│   └── {restaurantId}/
│       └── {predictionId}/
│           ├── productId: string (referencia)
│           ├── productName: string
│           ├── currentStock: number
│           ├── dailyConsumption: number
│           ├── daysRemaining: number
│           ├── restockRecommendation: number
│           ├── confidence: number (0-100)
│           ├── unit: string
│           ├── generatedAt: timestamp
│           ├── model: string (versión del modelo IA)
│           └── accuracy: number
│
├── consumptionPatterns/
│   └── {restaurantId}/
│       └── {productId}/
│           ├── monday: number
│           ├── tuesday: number
│           ├── wednesday: number
│           ├── thursday: number
│           ├── friday: number
│           ├── saturday: number
│           ├── sunday: number
│           ├── average: number
│           ├── trend: string (increasing/decreasing/stable)
│           ├── lastUpdated: timestamp
│           └── dataPoints: number
│
├── suppliers/
│   └── {restaurantId}/
│       └── {supplierId}/
│           ├── name: string
│           ├── email: string
│           ├── phone: string
│           ├── address: string
│           ├── products: array
│           ├── lastOrder: timestamp
│           ├── averageDeliveryDays: number
│           ├── rating: number
│           └── active: boolean
│
├── auditLogs/
│   └── {restaurantId}/
│       └── {logId}/
│           ├── action: string
│           ├── entityType: string (product/user/alert)
│           ├── entityId: string
│           ├── userId: string
│           ├── changes: object
│           ├── timestamp: timestamp
│           └── ipAddress: string
│
└── notifications/
    └── {userId}/
        └── {notificationId}/
            ├── type: string (email/whatsapp/push)
            ├── title: string
            ├── message: string
            ├── status: string (pending/sent/failed)
            ├── createdAt: timestamp
            ├── sentAt: timestamp
            └── readAt: timestamp
```

---

## 📊 ESQUEMA DETALLADO DE DOCUMENTOS

### 1. Restaurant (Documento Principal)
```json
{
  "restaurantId": "rest_001",
  "name": "La Casa del Sabor",
  "address": "Av. Principal #123, Centro, Ciudad",
  "phone": "+52 555 123 4567",
  "email": "contacto@lacasadelsabor.com",
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-03-12T14:30:00Z",
  "maxUsers": 10,
  "maxProducts": 500,
  "subscriptionTier": "premium",
  "active": true
}
```

### 2. User
```json
{
  "userId": "user_001",
  "name": "Carlos García",
  "email": "admin@restaurant.com",
  "role": "Administrador",
  "restaurantId": "rest_001",
  "avatar": "https://storage.firebase.com/user_001.jpg",
  "lastLogin": "2026-03-12T10:00:00Z",
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z",
  "active": true,
  "permissions": ["read", "write", "delete", "admin"]
}
```

### 3. Product
```json
{
  "productId": "prod_001",
  "restaurantId": "rest_001",
  "name": "Pollo",
  "category": "Carnes",
  "sku": "POLLO-001",
  "quantity": 8,
  "unit": "kg",
  "minThreshold": 10,
  "maxCapacity": 50,
  "pricePerUnit": 5.50,
  "supplier": "Distribuidora Avícola",
  "supplierId": "sup_001",
  "barcode": "7896543210123",
  "description": "Pollo entero fresco",
  "expiryDate": "2026-03-15",
  "stockStatus": "low",
  "lastUpdated": "2026-03-12T14:30:00Z",
  "createdAt": "2026-03-01T10:00:00Z",
  "images": ["https://storage.firebase.com/pollo_001.jpg"],
  "active": true
}
```

### 4. Sale
```json
{
  "saleId": "sale_001",
  "restaurantId": "rest_001",
  "productId": "prod_001",
  "productName": "Pollo",
  "quantity": 3,
  "unitPrice": 5.50,
  "totalRevenue": 16.50,
  "date": "2026-03-12T10:30:00Z",
  "userId": "user_001",
  "notes": "Venta para plato especial",
  "createdAt": "2026-03-12T10:30:00Z"
}
```

### 5. Stock Movement
```json
{
  "movementId": "move_001",
  "restaurantId": "rest_001",
  "productId": "prod_001",
  "productName": "Pollo",
  "movementType": "entrada",
  "quantity": 20,
  "reason": "Compra proveedor",
  "timestamp": "2026-03-12T10:00:00Z",
  "userId": "user_001",
  "supplierId": "sup_001",
  "notes": "Factura #12345",
  "cost": 110.00
}
```

### 6. AI Alert
```json
{
  "alertId": "alert_001",
  "restaurantId": "rest_001",
  "type": "critical",
  "title": "Stock Crítico",
  "message": "El tomate se acabará en aproximadamente 1.5 días. Recomendamos comprar 15kg inmediatamente.",
  "productId": "prod_003",
  "productName": "Tomate",
  "severity": 9,
  "isRead": false,
  "actions": ["order", "note"],
  "timestamp": "2026-03-12T10:30:00Z",
  "resolvedAt": null,
  "resolvedBy": null,
  "createdAt": "2026-03-12T10:30:00Z"
}
```

### 7. Prediction
```json
{
  "predictionId": "pred_001",
  "restaurantId": "rest_001",
  "productId": "prod_001",
  "productName": "Pollo",
  "currentStock": 8,
  "dailyConsumption": 5.2,
  "daysRemaining": 1.54,
  "restockRecommendation": 25,
  "confidence": 92,
  "unit": "kg",
  "model": "lstm_v2",
  "accuracy": 0.92,
  "factors": {
    "weeklyTrend": "increasing",
    "seasonality": "weekend_high",
    "recentEvents": "promotion_ongoing"
  },
  "generatedAt": "2026-03-12T10:00:00Z"
}
```

### 8. Consumption Pattern
```json
{
  "productId": "prod_001",
  "restaurantId": "rest_001",
  "productName": "Pollo",
  "consumption": {
    "monday": 4.5,
    "tuesday": 4.2,
    "wednesday": 4.0,
    "thursday": 5.1,
    "friday": 6.5,
    "saturday": 7.2,
    "sunday": 6.8
  },
  "average": 5.47,
  "trend": "increasing",
  "lastUpdated": "2026-03-12T10:00:00Z",
  "dataPoints": 156,
  "monthlyData": {
    "march2026": 165.2,
    "february2026": 142.8
  }
}
```

---

## 🐍 CONEXIÓN CON PYTHON

### 1. Instalación de Dependencias

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
pip install firebase-admin numpy pandas scikit-learn tensorflow flask flask-cors python-dotenv requests
```

### 2. Configuración Firebase en Python

**`config.py`**
```python
import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

# Inicializar Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
app = Flask(__name__)
CORS(app)

# Configuración
FIREBASE_DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')
FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')

class FirebaseConfig:
    db = db
    app = app
```

**Obtener `serviceAccountKey.json`:**
1. Ir a Firebase Console → Proyecto → Configuración → Cuentas de servicio
2. Click en "Generar nueva clave privada"
3. Guardar el archivo en el proyecto como `serviceAccountKey.json`

### 3. Modelos de Datos en Python

**`models.py`**
```python
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class StockStatus(Enum):
    CRITICAL = "critical"
    LOW = "low"
    NORMAL = "normal"
    FULL = "full"

class MovementType(Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"
    AJUSTE = "ajuste"

class AlertType(Enum):
    WARNING = "warning"
    CRITICAL = "critical"
    INFO = "info"
    SUCCESS = "success"

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
    sku: Optional[str] = None
    productId: Optional[str] = None
    lastUpdated: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    
    def to_dict(self):
        return {
            k: v.isoformat() if isinstance(v, datetime) else v 
            for k, v in asdict(self).items()
        }

@dataclass
class Sale:
    restaurantId: str
    productId: str
    productName: str
    quantity: float
    unitPrice: float
    totalRevenue: float
    date: datetime
    userId: str
    saleId: Optional[str] = None
    notes: Optional[str] = None
    
    def to_dict(self):
        return {
            k: v.isoformat() if isinstance(v, datetime) else v 
            for k, v in asdict(self).items()
        }

@dataclass
class StockMovement:
    restaurantId: str
    productId: str
    productName: str
    movementType: str
    quantity: float
    reason: str
    userId: str
    timestamp: datetime
    movementId: Optional[str] = None
    notes: Optional[str] = None
    cost: Optional[float] = None
    
    def to_dict(self):
        return {
            k: v.isoformat() if isinstance(v, datetime) else v 
            for k, v in asdict(self).items()
        }

@dataclass
class AIAlert:
    restaurantId: str
    type: str
    title: str
    message: str
    productId: str
    productName: str
    severity: int
    alertId: Optional[str] = None
    isRead: bool = False
    timestamp: Optional[datetime] = None
    
    def to_dict(self):
        return {
            k: v.isoformat() if isinstance(v, datetime) else v 
            for k, v in asdict(self).items()
        }

@dataclass
class Prediction:
    restaurantId: str
    productId: str
    productName: str
    currentStock: float
    dailyConsumption: float
    daysRemaining: float
    restockRecommendation: float
    confidence: float
    unit: str
    model: str
    accuracy: float
    predictionId: Optional[str] = None
    generatedAt: Optional[datetime] = None
    
    def to_dict(self):
        return {
            k: v.isoformat() if isinstance(v, datetime) else v 
            for k, v in asdict(self).items()
        }
```

### 4. Servicios de Base de Datos

**`firebase_service.py`**
```python
from config import FirebaseConfig
from models import *
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
            .collection('items').document(product_id).set(product.to_dict())
        
        return product_id
    
    @staticmethod
    def get_product(restaurant_id: str, product_id: str) -> Optional[Product]:
        """Obtener producto por ID"""
        doc = db.collection('products').document(restaurant_id)\
            .collection('items').document(product_id).get()
        
        return Product(**doc.to_dict()) if doc.exists else None
    
    @staticmethod
    def get_all_products(restaurant_id: str) -> List[Product]:
        """Obtener todos los productos del restaurante"""
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
    
    @staticmethod
    def get_low_stock_products(restaurant_id: str) -> List[Product]:
        """Obtener productos con stock bajo"""
        docs = db.collection('products').document(restaurant_id)\
            .collection('items').where('quantity', '<=', 'minThreshold').stream()
        
        return [Product(**doc.to_dict()) for doc in docs]

class SaleService:
    @staticmethod
    def record_sale(sale: Sale) -> str:
        """Registrar una venta y actualizar stock"""
        sale_id = str(uuid.uuid4())
        sale.saleId = sale_id
        sale.date = datetime.now()
        
        # Guardar venta
        db.collection('sales').document(sale.restaurantId)\
            .collection('transactions').document(sale_id).set(sale.to_dict())
        
        # Actualizar stock del producto
        product = ProductService.get_product(sale.restaurantId, sale.productId)
        if product:
            new_quantity = product.quantity - sale.quantity
            ProductService.update_product(
                sale.restaurantId, 
                sale.productId, 
                {'quantity': new_quantity}
            )
            
            # Registrar movimiento de stock
            movement = StockMovement(
                restaurantId=sale.restaurantId,
                productId=sale.productId,
                productName=sale.productName,
                movementType=MovementType.SALIDA.value,
                quantity=sale.quantity,
                reason=f"Venta: {sale.notes or 'Sin notas'}",
                userId=sale.userId,
                timestamp=datetime.now()
            )
            StockMovementService.record_movement(movement)
        
        return sale_id
    
    @staticmethod
    def get_sales(restaurant_id: str, days: int = 30) -> List[Sale]:
        """Obtener ventas de los últimos N días"""
        since = datetime.now() - timedelta(days=days)
        docs = db.collection('sales').document(restaurant_id)\
            .collection('transactions')\
            .where('date', '>=', since)\
            .order_by('date', direction='DESCENDING').stream()
        
        return [Sale(**doc.to_dict()) for doc in docs]

class StockMovementService:
    @staticmethod
    def record_movement(movement: StockMovement) -> str:
        """Registrar movimiento de stock"""
        movement_id = str(uuid.uuid4())
        movement.movementId = movement_id
        movement.timestamp = datetime.now()
        
        db.collection('stockMovements').document(movement.restaurantId)\
            .collection('movements').document(movement_id).set(movement.to_dict())
        
        return movement_id
    
    @staticmethod
    def get_movements(restaurant_id: str, days: int = 30) -> List[StockMovement]:
        """Obtener movimientos de stock"""
        since = datetime.now() - timedelta(days=days)
        docs = db.collection('stockMovements').document(restaurant_id)\
            .collection('movements')\
            .where('timestamp', '>=', since)\
            .order_by('timestamp', direction='DESCENDING').stream()
        
        return [StockMovement(**doc.to_dict()) for doc in docs]

class AIAlertService:
    @staticmethod
    def create_alert(alert: AIAlert) -> str:
        """Crear alerta"""
        alert_id = str(uuid.uuid4())
        alert.alertId = alert_id
        alert.timestamp = datetime.now()
        
        db.collection('aiAlerts').document(alert.restaurantId)\
            .collection('alerts').document(alert_id).set(alert.to_dict())
        
        return alert_id
    
    @staticmethod
    def get_active_alerts(restaurant_id: str) -> List[AIAlert]:
        """Obtener alertas activas"""
        docs = db.collection('aiAlerts').document(restaurant_id)\
            .collection('alerts')\
            .where('isRead', '==', False)\
            .order_by('timestamp', direction='DESCENDING').stream()
        
        return [AIAlert(**doc.to_dict()) for doc in docs]
    
    @staticmethod
    def mark_alert_as_read(restaurant_id: str, alert_id: str):
        """Marcar alerta como leída"""
        db.collection('aiAlerts').document(restaurant_id)\
            .collection('alerts').document(alert_id)\
            .update({'isRead': True})

class PredictionService:
    @staticmethod
    def save_prediction(prediction: Prediction) -> str:
        """Guardar predicción"""
        prediction_id = str(uuid.uuid4())
        prediction.predictionId = prediction_id
        prediction.generatedAt = datetime.now()
        
        db.collection('predictions').document(prediction.restaurantId)\
            .collection('items').document(prediction_id).set(prediction.to_dict())
        
        return prediction_id
    
    @staticmethod
    def get_latest_predictions(restaurant_id: str) -> List[Prediction]:
        """Obtener predicciones más recientes"""
        docs = db.collection('predictions').document(restaurant_id)\
            .collection('items')\
            .order_by('generatedAt', direction='DESCENDING')\
            .limit(100).stream()
        
        return [Prediction(**doc.to_dict()) for doc in docs]
```

### 5. Servicio de IA con Predicciones

**`ai_service.py`**
```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from tensorflow import keras
from firebase_service import *
from datetime import datetime, timedelta
from typing import List, Tuple

class ConsumptionPredictor:
    def __init__(self, restaurant_id: str):
        self.restaurant_id = restaurant_id
        self.model = self._build_model()
    
    def _build_model(self):
        """Construir modelo LSTM para predicción"""
        model = keras.Sequential([
            keras.layers.LSTM(128, activation='relu', input_shape=(30, 1)),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model
    
    def predict_consumption(self, product_id: str, days_forward: int = 7) -> Tuple[List[float], float]:
        """
        Predecir consumo futuro
        Retorna: (lista de consumos predichos, confianza 0-100)
        """
        # Obtener datos históricos de ventas
        sales = SaleService.get_sales(self.restaurant_id, days=90)
        
        # Filtrar por producto
        product_sales = [s for s in sales if s.productId == product_id]
        
        if len(product_sales) < 7:
            return [], 0  # No hay suficientes datos
        
        # Preparar datos
        daily_consumption = {}
        for sale in product_sales:
            date_key = sale.date.date()
            daily_consumption[date_key] = daily_consumption.get(date_key, 0) + sale.quantity
        
        # Crear series temporal
        dates = sorted(daily_consumption.keys())
        values = np.array([daily_consumption[d] for d in dates]).reshape(-1, 1)
        
        # Entrenar modelo
        try:
            self.model.fit(values[:-7], values[7:], epochs=50, verbose=0)
            
            # Predecir
            last_sequence = values[-30:] if len(values) >= 30 else values
            predictions = []
            current_seq = last_sequence.copy()
            
            for _ in range(days_forward):
                pred = self.model.predict(current_seq.reshape(1, -1, 1), verbose=0)
                predictions.append(float(pred[0][0]))
                current_seq = np.vstack([current_seq[1:], pred])
            
            # Calcular confianza
            avg_consumption = np.mean(values)
            confidence = min(100, 90 + (len(product_sales) / 100))
            
            return predictions, confidence
        
        except Exception as e:
            print(f"Error en predicción: {e}")
            return [], 0
    
    def generate_alerts(self) -> List[AIAlert]:
        """Generar alertas basadas en predicciones"""
        alerts = []
        products = ProductService.get_all_products(self.restaurant_id)
        
        for product in products:
            predictions, confidence = self.predict_consumption(product.productId)
            
            if predictions:
                daily_consumption = np.mean(predictions)
                days_remaining = product.quantity / daily_consumption if daily_consumption > 0 else 999
                
                # Crear alerta si stock es crítico
                if product.quantity <= product.minThreshold * 0.5:
                    alert = AIAlert(
                        restaurantId=self.restaurant_id,
                        type=AlertType.CRITICAL.value,
                        title="Stock Crítico",
                        message=f"{product.name} se agotará en ~{days_remaining:.1f} días",
                        productId=product.productId,
                        productName=product.name,
                        severity=9
                    )
                    alerts.append(alert)
                
                elif product.quantity <= product.minThreshold:
                    alert = AIAlert(
                        restaurantId=self.restaurant_id,
                        type=AlertType.WARNING.value,
                        title="Stock Bajo",
                        message=f"{product.name} alcanzará mínimo en ~{days_remaining:.1f} días",
                        productId=product.productId,
                        productName=product.name,
                        severity=5
                    )
                    alerts.append(alert)
        
        return alerts
    
    def generate_recommendations(self) -> List[Dict]:
        """Generar recomendaciones de reorden"""
        recommendations = []
        products = ProductService.get_all_products(self.restaurant_id)
        
        for product in products:
            predictions, confidence = self.predict_consumption(product.productId, days_forward=30)
            
            if predictions:
                monthly_consumption = sum(predictions)
                restock_amount = product.maxCapacity - product.quantity
                
                recommendation = {
                    'product_id': product.productId,
                    'product_name': product.name,
                    'current_stock': product.quantity,
                    'predicted_consumption_30d': monthly_consumption,
                    'recommended_restock': max(0, restock_amount),
                    'estimated_cost': restock_amount * product.pricePerUnit,
                    'confidence': confidence,
                    'urgency': 'high' if product.quantity <= product.minThreshold else 'low'
                }
                recommendations.append(recommendation)
        
        return recommendations
```

### 6. API REST con Flask

**`api.py`**
```python
from flask import Flask, request, jsonify
from config import FirebaseConfig
from firebase_service import *
from ai_service import ConsumptionPredictor
from datetime import datetime
import traceback

app = FirebaseConfig.app

# ==================== PRODUCTOS ====================
@app.route('/api/products/<restaurant_id>', methods=['GET'])
def get_products(restaurant_id):
    try:
        products = ProductService.get_all_products(restaurant_id)
        return jsonify([p.to_dict() for p in products])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    try:
        data = request.json
        product = Product(**data)
        product_id = ProductService.create_product(product)
        return jsonify({'productId': product_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/products/<restaurant_id>/<product_id>', methods=['PUT'])
def update_product(restaurant_id, product_id):
    try:
        data = request.json
        ProductService.update_product(restaurant_id, product_id, data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ==================== VENTAS ====================
@app.route('/api/sales', methods=['POST'])
def record_sale():
    try:
        data = request.json
        sale = Sale(**data)
        sale_id = SaleService.record_sale(sale)
        return jsonify({'saleId': sale_id}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/sales/<restaurant_id>', methods=['GET'])
def get_sales(restaurant_id):
    try:
        days = request.args.get('days', 30, type=int)
        sales = SaleService.get_sales(restaurant_id, days)
        return jsonify([s.to_dict() for s in sales])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PREDICCIONES ====================
@app.route('/api/predictions/<restaurant_id>', methods=['GET'])
def get_predictions(restaurant_id):
    try:
        predictor = ConsumptionPredictor(restaurant_id)
        predictions = predictor.generate_recommendations()
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/<restaurant_id>', methods=['GET'])
def get_alerts(restaurant_id):
    try:
        alerts = AIAlertService.get_active_alerts(restaurant_id)
        return jsonify([a.to_dict() for a in alerts])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/<restaurant_id>/generate', methods=['POST'])
def generate_alerts(restaurant_id):
    try:
        predictor = ConsumptionPredictor(restaurant_id)
        new_alerts = predictor.generate_alerts()
        
        for alert in new_alerts:
            AIAlertService.create_alert(alert)
        
        return jsonify({
            'alertsGenerated': len(new_alerts),
            'alerts': [a.to_dict() for a in new_alerts]
        }), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ==================== CONSUMO ====================
@app.route('/api/consumption/<restaurant_id>/<product_id>', methods=['GET'])
def get_consumption_prediction(restaurant_id, product_id):
    try:
        predictor = ConsumptionPredictor(restaurant_id)
        predictions, confidence = predictor.predict_consumption(product_id, days_forward=7)
        
        return jsonify({
            'productId': product_id,
            'predictions': predictions,
            'confidence': confidence,
            'generatedAt': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 7. Archivo `.env`

```
FIREBASE_PROJECT_ID=inventia-xxxxx
FIREBASE_DATABASE_URL=https://inventia-xxxxx.firebaseio.com
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 8. Script de Inicialización

**`initialize_db.py`**
```python
from firebase_service import *
from models import *
from datetime import datetime, timedelta
import random

def initialize_restaurant_data(restaurant_id: str):
    """Inicializar datos de prueba"""
    
    # Crear productos
    categories = ['Carnes', 'Verduras', 'Granos', 'Lácteos', 'Frutas']
    suppliers = {
        'Carnes': 'Distribuidora Avícola',
        'Verduras': 'Frutas y Verduras Don José',
        'Granos': 'Granos del Valle',
        'Lácteos': 'Lácteos Frescos',
        'Frutas': 'Frutas y Verduras Don José'
    }
    
    products_data = [
        ('Pollo', 'Carnes', 8, 'kg', 10, 50, 5.50),
        ('Carne de res', 'Carnes', 12, 'kg', 8, 40, 12.00),
        ('Tomate', 'Verduras', 3, 'kg', 5, 30, 2.50),
        ('Arroz', 'Granos', 25, 'kg', 10, 100, 1.20),
        ('Queso mozzarella', 'Lácteos', 2, 'kg', 3, 15, 9.00),
    ]
    
    created_product_ids = []
    
    for name, category, qty, unit, min_th, max_cap, price in products_data:
        product = Product(
            restaurantId=restaurant_id,
            name=name,
            category=category,
            quantity=qty,
            unit=unit,
            minThreshold=min_th,
            maxCapacity=max_cap,
            pricePerUnit=price,
            supplier=suppliers[category]
        )
        product_id = ProductService.create_product(product)
        created_product_ids.append((product_id, name))
        print(f"✓ Producto creado: {name}")
    
    # Crear ventas históricas
    for i in range(30):
        for product_id, product_name in random.sample(created_product_ids, k=2):
            sale = Sale(
                restaurantId=restaurant_id,
                productId=product_id,
                productName=product_name,
                quantity=random.uniform(1, 5),
                unitPrice=random.uniform(5, 15),
                totalRevenue=0,
                date=datetime.now() - timedelta(days=random.randint(1, 90)),
                userId='user_001'
            )
            SaleService.record_sale(sale)
    
    print(f"✓ Base de datos inicializada para {restaurant_id}")

if __name__ == '__main__':
    initialize_restaurant_data('rest_001')
```

---

## 🔐 SEGURIDAD EN FIRESTORE

### Reglas de Seguridad

**`firestore.rules`**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir solo a usuarios autenticados
    match /restaurants/{restaurantId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.allowedUsers;
    }
    
    match /products/{restaurantId}/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.allowedUsers;
    }
    
    match /sales/{restaurantId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /aiAlerts/{restaurantId}/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📡 INTEGRACIÓN FRONTEND-BACKEND

### Archivo de configuración Frontend

**`src/services/firebaseConfig.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
```

---

## 🚀 DEPLOYMENT

### Variables de Entorno Necesarias

```
# Firebase
FIREBASE_PROJECT_ID=inventia-xxxxx
FIREBASE_API_KEY=xxxxxx
FIREBASE_AUTH_DOMAIN=inventia-xxxxx.firebaseapp.com
FIREBASE_DATABASE_URL=https://inventia-xxxxx.firebaseio.com

# Backend
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secret-key

# Frontend
REACT_APP_FIREBASE_PROJECT_ID=inventia-xxxxx
REACT_APP_API_URL=https://api.inventia.com
```

---

## 📊 DIAGRAMA DE RELACIONES

```
┌─────────────────┐
│   Restaurant    │
└────────┬────────┘
         │
    ┌────┼────┬─────────┐
    │    │    │         │
┌───▼─┐ ┌▼──┐ ┌▼────┐ ┌▼───────┐
│User │ │Pro│ │Sales│ │Settings│
└─────┘ └───┘ └─────┘ └────────┘
         │
    ┌────┼─────┐
    │    │     │
┌───▼──┐ ┌▼────▼────┐ ┌▼──────┐
│Stock │ │Consumpt   │ │Suppli │
│Move  │ │Pattern    │ │er     │
└──────┘ └───────────┘ └───────┘

AI Layer:
┌──────────────┐
│ Predictions  │ ─→ Alertas
└──────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear proyecto en Firebase Console
- [ ] Descargar serviceAccountKey.json
- [ ] Configurar Firestore Database
- [ ] Crear colecciones en Firestore
- [ ] Crear índices en Firestore (si es necesario)
- [ ] Instalar dependencias Python
- [ ] Configurar archivo .env
- [ ] Inicializar base de datos con datos de prueba
- [ ] Configurar reglas de seguridad en Firestore
- [ ] Crear API endpoints en Flask
- [ ] Configurar CORS
- [ ] Conectar Frontend con Backend
- [ ] Testing de predicciones IA
- [ ] Deploy a producción

---

## 📚 REFERENCIAS

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Admin Python SDK](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [TensorFlow/Keras Documentation](https://www.tensorflow.org/api_docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [scikit-learn Documentation](https://scikit-learn.org/stable/documentation.html)

