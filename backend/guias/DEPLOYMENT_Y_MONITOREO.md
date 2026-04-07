# 🚀 DEPLOYMENT Y MONITOREO - INVENTIA

## 1. DEPLOYMENT A PRODUCCIÓN

### Opción 1: Google Cloud Run (Recomendado)

#### Paso 1: Preparar la aplicación

```bash
# En la raíz del backend/

# Crear Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Crear directorios
RUN mkdir -p logs

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "--timeout", "120", "app:app"]
EOF

# Crear .dockerignore
cat > .dockerignore << 'EOF'
venv/
*.pyc
__pycache__/
.env
logs/
tests/
*.log
.git
.gitignore
EOF

# Crear .gcloudignore
cat > .gcloudignore << 'EOF'
.git
.gitignore
venv/
__pycache__/
*.pyc
EOF
```

#### Paso 2: Configurar variables en Cloud Run

```yaml
# cloud-run-config.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: inventia-backend
  namespace: default
spec:
  template:
    spec:
      containers:
      - image: gcr.io/your-project/inventia-backend:latest
        env:
        - name: FLASK_ENV
          value: production
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: firebase-credentials
              key: project-id
        - name: FIREBASE_CREDENTIALS_PATH
          value: /var/secrets/firebase/key.json
        volumeMounts:
        - name: firebase-key
          mountPath: /var/secrets/firebase
          readOnly: true
        resources:
          limits:
            memory: "512Mi"
            cpu: "1000m"
          requests:
            memory: "256Mi"
            cpu: "500m"
      volumes:
      - name: firebase-key
        secret:
          secretName: firebase-credentials
          items:
          - key: serviceAccountKey
            path: key.json
```

#### Paso 3: Desplegar

```bash
# Autenticar con Google Cloud
gcloud auth login
gcloud config set project your-project-id

# Crear secret con credenciales Firebase
gcloud secrets create firebase-credentials \
  --replication-policy="automatic"

gcloud secrets versions add firebase-credentials \
  --data-file=serviceAccountKey.json

# Crear archivo requirements con gunicorn
echo "gunicorn==21.2.0" >> requirements.txt

# Construir y subir imagen
gcloud builds submit --tag gcr.io/your-project/inventia-backend:latest

# Desplegar a Cloud Run
gcloud run deploy inventia-backend \
  --image gcr.io/your-project/inventia-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 120 \
  --set-env-vars FLASK_ENV=production

# Ver URL del servicio
gcloud run services describe inventia-backend --region us-central1
```

### Opción 2: Heroku

```bash
# Crear Procfile
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT app:app" > Procfile

# Crear app en Heroku
heroku create inventia-backend

# Configurar variables de entorno
heroku config:set FLASK_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-project
heroku config:add FIREBASE_CREDENTIALS_PATH=/app/serviceAccountKey.json

# Subir serviceAccountKey.json (mediante buildpack o config var)
heroku config:set FIREBASE_CREDENTIALS='$(cat serviceAccountKey.json)'

# Desplegar
git push heroku main

# Ver logs
heroku logs --tail
```

### Opción 3: AWS EC2 + Nginx + Gunicorn

```bash
#!/bin/bash
# install_production.sh

# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependencias
sudo apt-get install -y python3.11 python3-pip nginx supervisor git

# Clonar repositorio
cd /opt
sudo git clone https://github.com/your-repo/inventia-backend.git
cd inventia-backend

# Crear entorno virtual
sudo python3 -m venv venv
sudo source venv/bin/activate

# Instalar dependencias Python
sudo pip install -r requirements.txt

# Copiar serviceAccountKey.json
sudo cp serviceAccountKey.json .env /opt/inventia-backend/

# Crear archivo de configuración Gunicorn
cat > /opt/inventia-backend/gunicorn_config.py << 'EOF'
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5
EOF

# Configurar Supervisor
sudo tee /etc/supervisor/conf.d/inventia.conf > /dev/null << 'EOF'
[program:inventia]
directory=/opt/inventia-backend
command=/opt/inventia-backend/venv/bin/gunicorn -c gunicorn_config.py app:app
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/inventia/app.log

[program:inventia-worker]
directory=/opt/inventia-backend
command=/opt/inventia-backend/venv/bin/python tasks/worker.py
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/inventia/worker.log
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/inventia
sudo chown www-data:www-data /var/log/inventia

# Actualizar Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start inventia

# Configurar Nginx
sudo tee /etc/nginx/sites-available/inventia > /dev/null << 'EOF'
upstream inventia_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.inventia.com;

    client_max_body_size 16M;

    location / {
        proxy_pass http://inventia_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location /static {
        alias /opt/inventia-backend/static;
        expires 30d;
    }
}
EOF

# Habilitar sitio Nginx
sudo ln -s /etc/nginx/sites-available/inventia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar SSL con Certbot
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.inventia.com
```

---

## 2. MONITOREO Y LOGGING

### Configuración de Logging

```python
# utils/logger.py
import logging
import logging.handlers
import os
from datetime import datetime

def setup_logger(name):
    """Configurar logger con rotación de archivos"""
    
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Handler para archivo - INFO y superiores
    file_handler = logging.handlers.RotatingFileHandler(
        f'{log_dir}/app.log',
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(logging.INFO)
    
    # Handler para errores - ERROR y superiores
    error_handler = logging.handlers.RotatingFileHandler(
        f'{log_dir}/errors.log',
        maxBytes=10485760,
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    
    # Handler para consola - DEBUG y superiores
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if os.getenv('FLASK_ENV') == 'development' else logging.INFO)
    
    # Formato
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    error_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)
    
    return logger
```

### Monitoreo con Google Cloud Logging

```python
# config.py (Agregar)
from google.cloud import logging as cloud_logging
import logging

def setup_cloud_logging():
    """Configurar Google Cloud Logging"""
    if os.getenv('FLASK_ENV') == 'production':
        cloud_logging_client = cloud_logging.Client()
        cloud_logging_client.setup_logging(
            log_level=logging.INFO
        )
```

### Alertas y Métricas

```python
# services/monitoring_service.py
from config import app
from prometheus_client import Counter, Histogram, Gauge
import time

# Métricas
request_count = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('api_request_duration_seconds', 'API request duration', ['method', 'endpoint'])
active_connections = Gauge('active_connections', 'Number of active connections')
database_errors = Counter('database_errors_total', 'Total database errors')

# Decorador para métricas
def track_metrics(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = f(*args, **kwargs)
            status = result[1] if isinstance(result, tuple) else 200
        except Exception as e:
            status = 500
            raise
        finally:
            duration = time.time() - start_time
            method = request.method
            endpoint = request.path
            
            request_count.labels(method, endpoint, status).inc()
            request_duration.labels(method, endpoint).observe(duration)
        
        return result
    return decorated_function

# Endpoint Prometheus
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

@app.route('/metrics', methods=['GET'])
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}
```

### Monitoreo con Datadog

```python
# config.py (Agregar)
from datadog import initialize, api
import os

if os.getenv('FLASK_ENV') == 'production':
    options = {
        'api_key': os.getenv('DATADOG_API_KEY'),
        'app_key': os.getenv('DATADOG_APP_KEY')
    }
    initialize(**options)

# En requests
from datadog import statsd

def log_metric(metric_name, value, tags=None):
    """Enviar métrica a Datadog"""
    statsd.gauge(metric_name, value, tags=tags or [])
```

---

## 3. BACKUP Y RECUPERACIÓN

### Backup Automático en Firebase

```python
# tasks/backup_manager.py
from firebase_admin import firestore
from google.cloud import storage
import json
from datetime import datetime

class BackupManager:
    @staticmethod
    def backup_firestore(bucket_name: str):
        """Crear backup de Firestore"""
        db = firestore.client()
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        
        # Obtener todas las colecciones
        collections = ['restaurants', 'users', 'products', 'sales', 'aiAlerts']
        
        backup_data = {}
        
        for collection in collections:
            docs = db.collection(collection).stream()
            backup_data[collection] = [
                {
                    'id': doc.id,
                    'data': doc.to_dict()
                }
                for doc in docs
            ]
        
        # Guardar en Cloud Storage
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        blob = bucket.blob(f'backups/firestore_{timestamp}.json')
        blob.upload_from_string(
            json.dumps(backup_data, default=str),
            content_type='application/json'
        )
        
        print(f"Backup creado: {blob.name}")

# Ejecutar como Cloud Scheduler job
@app.route('/tasks/backup', methods=['POST'])
def backup_task():
    """Endpoint para Cloud Scheduler"""
    BackupManager.backup_firestore(os.getenv('BACKUP_BUCKET'))
    return {'status': 'backup completed'}, 200
```

### Script de Recuperación

```python
# scripts/restore_backup.py
import json
from firebase_admin import firestore
from google.cloud import storage

def restore_firestore_from_backup(bucket_name: str, backup_file: str):
    """Restaurar Firestore desde backup"""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(backup_file)
    
    data = json.loads(blob.download_as_string())
    db = firestore.client()
    
    for collection_name, documents in data.items():
        for doc in documents:
            db.collection(collection_name).document(doc['id']).set(doc['data'])
    
    print("Restauración completada")

# Uso
# restore_firestore_from_backup('backup-bucket', 'backups/firestore_20260312_020000.json')
```

---

## 4. SEGURIDAD EN PRODUCCIÓN

### HTTPS/SSL

```nginx
# Configuración Nginx con SSL
server {
    listen 443 ssl http2;
    server_name api.inventia.com;

    ssl_certificate /etc/letsencrypt/live/api.inventia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.inventia.com/privkey.pem;

    # Configuración de seguridad
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://inventia_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name api.inventia.com;
    return 301 https://$server_name$request_uri;
}
```

### Rate Limiting

```python
# utils/rate_limit.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# En config.py
limiter.init_app(app)

# En rutas
@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    pass
```

### Validación de Entrada

```python
# utils/validators.py
from typing import Dict, List, Any

def validate_product_data(data: Dict) -> List[str]:
    """Validar datos de producto"""
    errors = []
    
    required_fields = ['restaurantId', 'name', 'category', 'quantity', 'unit', 
                      'minThreshold', 'maxCapacity', 'pricePerUnit', 'supplier']
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Campo requerido: {field}")
    
    if 'quantity' in data and data['quantity'] < 0:
        errors.append("La cantidad no puede ser negativa")
    
    if 'pricePerUnit' in data and data['pricePerUnit'] < 0:
        errors.append("El precio no puede ser negativo")
    
    if 'name' in data and len(data['name']) > 100:
        errors.append("El nombre no puede exceder 100 caracteres")
    
    return errors
```

---

## 5. ESCALABILIDAD

### Usar Colas de Trabajo con Celery

```python
# tasks/celery_app.py
from celery import Celery
import os

celery_app = Celery('inventia')
celery_app.conf.update(
    broker_url=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    result_backend=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Mexico_City',
)

# tasks/ai_tasks.py
from celery_app import celery_app
from services.ai_service import ConsumptionPredictor

@celery_app.task(bind=True, max_retries=3)
def generate_predictions_task(self, restaurant_id: str):
    """Generar predicciones como tarea asincrónica"""
    try:
        predictor = ConsumptionPredictor(restaurant_id)
        alerts = predictor.generate_alerts()
        return {'status': 'success', 'alerts_generated': len(alerts)}
    except Exception as exc:
        self.retry(exc=exc, countdown=60)

# En rutas
@app.route('/api/alerts/<restaurant_id>/generate', methods=['POST'])
def generate_alerts(restaurant_id):
    # Ejecutar tarea en background
    task = generate_predictions_task.delay(restaurant_id)
    return {'task_id': task.id}, 202
```

### Caché con Redis

```python
# utils/cache.py
import redis
import json
import os

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,
    decode_responses=True
)

def cache_get(key: str):
    """Obtener del caché"""
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

def cache_set(key: str, value: dict, ttl: int = 3600):
    """Guardar en caché"""
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        print(f"Error al guardar en caché: {e}")

# Usar en rutas
@app.route('/api/products/<restaurant_id>', methods=['GET'])
def get_products_cached(restaurant_id):
    cache_key = f"products:{restaurant_id}"
    
    # Intentar obtener del caché
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached)
    
    # Si no está en caché, obtener de DB
    products = ProductService.get_all_products(restaurant_id)
    result = [p.to_dict() for p in products]
    
    # Guardar en caché por 1 hora
    cache_set(cache_key, result, ttl=3600)
    
    return jsonify(result)
```

---

## 6. TESTING EN PRODUCCIÓN

### Health Check Endpoint

```python
# routes/health.py
from flask import Blueprint, jsonify
from config import db
import time

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Verificar salud de la aplicación"""
    checks = {}
    
    # Verificar Firebase
    try:
        db.collection('restaurants').limit(1).get()
        checks['firebase'] = 'healthy'
    except Exception as e:
        checks['firebase'] = f'unhealthy: {e}'
    
    # Verificar tiempo de respuesta
    start = time.time()
    checks['response_time'] = time.time() - start
    
    # Verificar memoria
    import psutil
    memory = psutil.virtual_memory()
    checks['memory_percent'] = memory.percent
    
    status = 'healthy' if all('healthy' in str(v) for v in checks.values()) else 'degraded'
    
    return jsonify({'status': status, 'checks': checks}), 200

@health_bp.route('/ready', methods=['GET'])
def readiness_check():
    """Verificar si el servicio está listo"""
    try:
        db.collection('restaurants').limit(1).get()
        return jsonify({'ready': True}), 200
    except:
        return jsonify({'ready': False}), 503
```

---

## 7. CHECKLIST DE DEPLOYMENT

- [ ] Clave de Firebase guardada de forma segura
- [ ] Variables de entorno configuradas
- [ ] HTTPS/SSL configurado
- [ ] Firestore rules actualizadas
- [ ] Backups automáticos habilitados
- [ ] Monitoreo y alertas configurados
- [ ] Logs centralizados
- [ ] Rate limiting activo
- [ ] Validación de entrada implementada
- [ ] CORS configurado correctamente
- [ ] Health checks funcionando
- [ ] CDN configurado (CloudFront/Cloudflare)
- [ ] DNS apuntando correctamente
- [ ] Tests de carga ejecutados
- [ ] Documentación API actualizada

