# EJEMPLOS PRÁCTICOS - INVENTIA Sistema Firebase y Python

## 1️⃣ EJEMPLO: Crear un Producto

### Frontend (React)
```typescript
// src/services/productService.ts
import { apiCall } from './firebaseConfig';
import type { Product } from '../types';

export const createProduct = async (product: Product, restaurantId: string) => {
  return apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      restaurantId,
      ...product
    })
  });
};

// En componente
import { useState } from 'react';
import { createProduct } from '../services/productService';

export function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Carnes',
    quantity: 0,
    unit: 'kg',
    minThreshold: 10,
    maxCapacity: 50,
    pricePerUnit: 0,
    supplier: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { productId } = await createProduct(formData, 'rest_001');
      console.log('Producto creado:', productId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name"
        placeholder="Nombre del producto"
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <button type="submit">Crear Producto</button>
    </form>
  );
}
```

### Backend (Python)
```python
# Solicitud POST a http://localhost:5000/api/products
POST /api/products HTTP/1.1
Content-Type: application/json

{
  "restaurantId": "rest_001",
  "name": "Pollo Premium",
  "category": "Carnes",
  "quantity": 15,
  "unit": "kg",
  "minThreshold": 10,
  "maxCapacity": 50,
  "pricePerUnit": 6.50,
  "supplier": "Distribuidora Avícola Premium"
}

# Respuesta
{
  "productId": "prod_12345"
}
```

---

## 2️⃣ EJEMPLO: Registrar una Venta

### Frontend
```typescript
// src/services/saleService.ts
export const recordSale = async (
  restaurantId: string,
  productId: string,
  quantity: number,
  notes: string = ''
) => {
  return apiCall('/api/sales', {
    method: 'POST',
    body: JSON.stringify({
      restaurantId,
      productId,
      productName: 'Pollo', // En realidad obtendrías del producto
      quantity,
      unitPrice: 5.50,
      totalRevenue: quantity * 5.50,
      userId: 'user_001',
      notes
    })
  });
};

// En componente
export function SaleForm() {
  const handleSale = async () => {
    await recordSale('rest_001', 'prod_001', 3, 'Venta para mesa 5');
    alert('Venta registrada');
  };

  return <button onClick={handleSale}>Registrar Venta</button>;
}
```

### Base de Datos Firestore
```
sales/
└── rest_001/
    └── transactions/
        └── sale_xyz/
            {
              "saleId": "sale_xyz",
              "restaurantId": "rest_001",
              "productId": "prod_001",
              "productName": "Pollo",
              "quantity": 3,
              "unitPrice": 5.50,
              "totalRevenue": 16.50,
              "date": "2026-03-12T14:30:00Z",
              "userId": "user_001",
              "notes": "Venta para mesa 5"
            }
```

---

## 3️⃣ EJEMPLO: Generar Predicciones y Alertas

### Script Python Independiente
```python
# batch_predictions.py
from firebase_service import *
from ai_service import ConsumptionPredictor
from datetime import datetime
import json

def run_daily_predictions():
    """Ejecutar predicciones cada día (via Cron)"""
    restaurants = ['rest_001', 'rest_002', 'rest_003']
    
    all_results = {
        'timestamp': datetime.now().isoformat(),
        'restaurants': []
    }
    
    for restaurant_id in restaurants:
        print(f"\n📊 Procesando predicciones para {restaurant_id}...")
        predictor = ConsumptionPredictor(restaurant_id)
        
        try:
            # Generar alertas
            alerts = predictor.generate_alerts()
            for alert in alerts:
                AIAlertService.create_alert(alert)
                print(f"  ⚠️  Alerta creada: {alert.title}")
            
            # Generar recomendaciones
            recommendations = predictor.generate_recommendations()
            
            # Guardar recomendaciones
            for rec in recommendations:
                prediction = Prediction(
                    restaurantId=restaurant_id,
                    productId=rec['product_id'],
                    productName=rec['product_name'],
                    currentStock=rec['current_stock'],
                    dailyConsumption=rec['predicted_consumption_30d'] / 30,
                    daysRemaining=0,  # Calculado
                    restockRecommendation=rec['recommended_restock'],
                    confidence=rec['confidence'],
                    unit='kg',
                    model='lstm_v2',
                    accuracy=rec['confidence'] / 100
                )
                PredictionService.save_prediction(prediction)
            
            all_results['restaurants'].append({
                'restaurantId': restaurant_id,
                'alertsGenerated': len(alerts),
                'recommendationsGenerated': len(recommendations)
            })
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    # Log de resultados
    print("\n✅ Predicciones completadas")
    print(json.dumps(all_results, indent=2))
    
    return all_results

if __name__ == '__main__':
    run_daily_predictions()
```

### Configurar Cron Job (Linux/macOS)
```bash
# Ejecutar cada día a las 2 AM
0 2 * * * cd /path/to/project && /usr/bin/python3 batch_predictions.py >> /var/log/inventia/predictions.log 2>&1
```

### Windows Task Scheduler
```powershell
# Crear tarea programada
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
$action = New-ScheduledTaskAction -Execute "C:\Python310\python.exe" `
  -Argument "batch_predictions.py" `
  -WorkingDirectory "C:\inventia\backend"
Register-ScheduledTask -TaskName "INVENTIA-DailyPredictions" -Trigger $trigger -Action $action
```

---

## 4️⃣ EJEMPLO: Obtener Productos Críticos

### Desde Frontend
```typescript
// src/hooks/useCriticalProducts.ts
import { useEffect, useState } from 'react';
import { apiCall } from '../services/firebaseConfig';

export function useCriticalProducts(restaurantId: string) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriticalProducts = async () => {
      try {
        const allProducts = await apiCall(`/api/products/${restaurantId}`);
        const critical = allProducts.filter((p: any) => 
          p.quantity <= p.minThreshold * 0.5
        );
        setProducts(critical);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalProducts();
  }, [restaurantId]);

  return { products, loading };
}

// En componente
export function CriticalProductsWidget() {
  const { products, loading } = useCriticalProducts('rest_001');

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="critical-products">
      <h3>Productos Críticos ({products.length})</h3>
      {products.map(product => (
        <div key={product.id} className="product-alert">
          <span className="alert-icon">🚨</span>
          <div>
            <h4>{product.name}</h4>
            <p>Stock: {product.quantity}{product.unit}</p>
            <p>Mínimo: {product.minThreshold}{product.unit}</p>
          </div>
          <button>Reabastecer</button>
        </div>
      ))}
    </div>
  );
}
```

### Desde Python (API)
```python
# Consulta personalizada
@app.route('/api/products/<restaurant_id>/critical', methods=['GET'])
def get_critical_products(restaurant_id):
    try:
        products = ProductService.get_all_products(restaurant_id)
        critical = [
            p.to_dict() for p in products 
            if p.quantity <= p.minThreshold * 0.5
        ]
        return jsonify({
            'count': len(critical),
            'products': critical
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 5️⃣ EJEMPLO: Dashboard de Análisis

### Análisis Completo en Python
```python
# analytics.py
from firebase_service import *
from datetime import datetime, timedelta
import pandas as pd

def get_dashboard_data(restaurant_id: str):
    """Generar datos completos para dashboard"""
    
    # 1. Obtener productos
    products = ProductService.get_all_products(restaurant_id)
    total_inventory_value = sum(p.quantity * p.pricePerUnit for p in products)
    
    # 2. Ventas de hoy
    today = datetime.now().date()
    all_sales = SaleService.get_sales(restaurant_id, days=30)
    today_sales = [s for s in all_sales if s.date.date() == today]
    today_revenue = sum(s.totalRevenue for s in today_sales)
    
    # 3. Productos en stock bajo
    low_stock = [p for p in products if p.quantity <= p.minThreshold]
    critical_stock = [p for p in products if p.quantity <= p.minThreshold * 0.5]
    
    # 4. Tendencias
    sales_df = pd.DataFrame([
        {
            'date': s.date.date(),
            'productId': s.productId,
            'quantity': s.quantity,
            'revenue': s.totalRevenue
        }
        for s in all_sales
    ])
    
    daily_revenue = sales_df.groupby('date')['revenue'].sum()
    weekly_trend = daily_revenue.tail(7).tolist()
    
    # 5. Productos más vendidos
    top_products = sales_df.groupby('productId')['quantity'].sum().nlargest(5)
    
    return {
        'summary': {
            'totalInventoryValue': float(total_inventory_value),
            'todayRevenue': float(today_revenue),
            'todayTransactions': len(today_sales),
            'productsInStock': len(products),
            'lowStockProducts': len(low_stock),
            'criticalStockProducts': len(critical_stock)
        },
        'inventory': {
            'total_value': float(total_inventory_value),
            'products': [p.to_dict() for p in products]
        },
        'sales': {
            'today': float(today_revenue),
            'weeklyTrend': weekly_trend,
            'topProducts': top_products.to_dict()
        },
        'alerts': {
            'critical': len(critical_stock),
            'warning': len(low_stock) - len(critical_stock)
        },
        'timestamp': datetime.now().isoformat()
    }

# Endpoint API
@app.route('/api/dashboard/<restaurant_id>', methods=['GET'])
def get_dashboard(restaurant_id):
    try:
        data = get_dashboard_data(restaurant_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Hook React para el Dashboard
```typescript
// src/hooks/useDashboard.ts
export function useDashboard(restaurantId: string, refreshInterval: number = 60000) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiCall(`/api/dashboard/${restaurantId}`);
        setDashboardData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    
    // Refrescar cada cierto tiempo
    const interval = setInterval(fetchDashboard, refreshInterval);
    return () => clearInterval(interval);
  }, [restaurantId, refreshInterval]);

  return { dashboardData, loading };
}
```

---

## 6️⃣ EJEMPLO: Autenticación Firebase

### Configuración en Frontend
```typescript
// src/services/authService.ts
import { 
  signInWithEmailAndPassword, 
  signOut,
  User,
  Auth 
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getUserIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.getIdToken();
};
```

### Validación en Backend
```python
# middleware.py
import firebase_admin
from firebase_admin import auth
from functools import wraps
from flask import request, jsonify

def verify_token(f):
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

# Usar en endpoints
@app.route('/api/protected', methods=['GET'])
@verify_token
def protected_endpoint():
    user_id = request.user['uid']
    return jsonify({'message': f'Hello {user_id}'})
```

---

## 7️⃣ EJEMPLO: Notificaciones por Email/WhatsApp

### Servicio de Notificaciones
```python
# notification_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from config import os

class NotificationService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str, is_html: bool = True):
        """Enviar email"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = os.getenv('SMTP_FROM_EMAIL')
            msg['To'] = to_email
            
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASSWORD'))
            server.sendmail(os.getenv('SMTP_FROM_EMAIL'), to_email, msg.as_string())
            server.quit()
            
            return True
        except Exception as e:
            print(f'Error enviando email: {e}')
            return False
    
    @staticmethod
    def send_whatsapp(phone: str, message: str):
        """Enviar WhatsApp via Twilio"""
        try:
            url = "https://api.twilio.com/2010-04-01/Accounts/{}/Messages.json".format(
                os.getenv('TWILIO_ACCOUNT_SID')
            )
            data = {
                "From": f"whatsapp:{os.getenv('TWILIO_PHONE')}",
                "To": f"whatsapp:{phone}",
                "Body": message
            }
            
            response = requests.post(
                url,
                auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')),
                data=data
            )
            
            return response.status_code == 201
        except Exception as e:
            print(f'Error enviando WhatsApp: {e}')
            return False

# Usar en alertas críticas
def notify_critical_alert(restaurant: dict, product: dict, alert_message: str):
    restaurant_email = restaurant['email']
    restaurant_phone = restaurant['phone']
    
    # Email
    email_body = f"""
    <html>
        <body>
            <h2>⚠️ Alerta de Inventario Crítico</h2>
            <p><strong>{product['name']}</strong> está en estado crítico</p>
            <p>{alert_message}</p>
            <a href="https://inventia.com/dashboard">Ver detalles</a>
        </body>
    </html>
    """
    NotificationService.send_email(restaurant_email, "Alerta Crítica de Inventario", email_body)
    
    # WhatsApp
    whatsapp_message = f"🚨 ALERTA: {product['name']} en stock crítico. {alert_message}"
    NotificationService.send_whatsapp(restaurant_phone, whatsapp_message)
```

---

## 8️⃣ EJEMPLO: Testing Unitario

### Tests en Python
```python
# test_firebase_service.py
import unittest
from firebase_service import ProductService, SaleService
from models import Product, Sale
from datetime import datetime

class TestProductService(unittest.TestCase):
    def setUp(self):
        self.restaurant_id = 'test_rest_001'
        self.product = Product(
            restaurantId=self.restaurant_id,
            name='Prueba Pollo',
            category='Carnes',
            quantity=10,
            unit='kg',
            minThreshold=5,
            maxCapacity=50,
            pricePerUnit=5.50,
            supplier='Test Supplier'
        )
    
    def test_create_product(self):
        """Test crear producto"""
        product_id = ProductService.create_product(self.product)
        self.assertIsNotNone(product_id)
        
        # Verificar que se creó
        retrieved = ProductService.get_product(
            self.restaurant_id, 
            product_id
        )
        self.assertEqual(retrieved.name, self.product.name)
    
    def test_update_product(self):
        """Test actualizar producto"""
        product_id = ProductService.create_product(self.product)
        
        ProductService.update_product(
            self.restaurant_id,
            product_id,
            {'quantity': 20}
        )
        
        updated = ProductService.get_product(
            self.restaurant_id,
            product_id
        )
        self.assertEqual(updated.quantity, 20)
    
    def test_get_low_stock(self):
        """Test obtener productos con stock bajo"""
        ProductService.create_product(self.product)
        
        low_stock = ProductService.get_low_stock_products(
            self.restaurant_id
        )
        self.assertTrue(len(low_stock) > 0)

class TestSaleService(unittest.TestCase):
    def setUp(self):
        self.restaurant_id = 'test_rest_001'
        self.sale = Sale(
            restaurantId=self.restaurant_id,
            productId='prod_test_001',
            productName='Pollo Test',
            quantity=5,
            unitPrice=5.50,
            totalRevenue=27.50,
            date=datetime.now(),
            userId='user_test_001'
        )
    
    def test_record_sale(self):
        """Test registrar venta"""
        sale_id = SaleService.record_sale(self.sale)
        self.assertIsNotNone(sale_id)

if __name__ == '__main__':
    unittest.main()
```

### Tests en Frontend
```typescript
// src/__tests__/firebaseService.test.ts
import { apiCall } from '../services/firebaseConfig';

jest.mock('../services/firebaseConfig');

describe('Firebase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProduct should call API correctly', async () => {
    const mockProduct = {
      restaurantId: 'rest_001',
      name: 'Pollo',
      category: 'Carnes'
    };

    (apiCall as jest.Mock).mockResolvedValue({ productId: 'prod_001' });

    const result = await apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(mockProduct)
    });

    expect(result.productId).toBe('prod_001');
  });
});
```

---

## 📋 CHECKLIST DE CONFIGURACIÓN

- [ ] Cuenta en Firebase Console
- [ ] Proyecto creado en Firebase
- [ ] Firestore Database activada
- [ ] Authentication habilitada
- [ ] Storage activado (para imágenes)
- [ ] Descargar serviceAccountKey.json
- [ ] Crear archivo .env con credenciales
- [ ] Instalar dependencias Python
- [ ] Configurar Gunicorn para producción
- [ ] Configurar SSL/HTTPS
- [ ] Crear base de datos inicial con datos de prueba
- [ ] Configurar backups automáticos
- [ ] Monitoreo y logging activos

