# INVENTIA Backend

API REST con FastAPI + Firebase Admin SDK para el sistema de gestión de inventario con IA.

## Requisitos

- Python 3.11+
- Firebase project configurado

## Instalación

```bash
# 1. Activar entorno virtual (ya creado en el proyecto)
source ../../venv/Scripts/activate   # Windows bash
# o: ..\..\..\venv\Scripts\Activate.ps1   # PowerShell

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

## Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un proyecto (o usa uno existente)
3. Ve a **Configuración del proyecto > Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Copia los valores del JSON descargado a tu archivo `.env`

## Ejecutar el servidor

```bash
# Desde la carpeta backend/
source ../../venv/Scripts/activate
python main.py
# o: uvicorn main:app --reload --port 8000
```

Servidor disponible en: http://localhost:8000
Documentación API: http://localhost:8000/api/docs

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Estado del servidor |
| POST | /api/v1/auth/register | Registrar usuario |
| GET | /api/v1/auth/me | Info del usuario actual |
| GET | /api/v1/inventory/products | Listar productos |
| POST | /api/v1/inventory/products | Crear producto |
| PUT | /api/v1/inventory/products/{id} | Actualizar producto |
| DELETE | /api/v1/inventory/products/{id} | Eliminar producto |
| POST | /api/v1/inventory/movements | Registrar movimiento |
| GET | /api/v1/ai/predictions | Predicciones de IA |
| GET | /api/v1/ai/alerts | Alertas generadas |
| GET | /api/v1/ai/stats | Estadísticas del modelo |
| GET | /api/v1/settings/ | Obtener configuración |
| PUT | /api/v1/settings/ | Actualizar configuración |

## Modo Demo

Si no configuras las credenciales de Firebase (`.env` vacío), el backend
funciona en **modo demo** retornando datos de ejemplo para todas las rutas.
Esto permite desarrollar el frontend sin Firebase configurado.

## Estructura

```
backend/
├── main.py              # Punto de entrada FastAPI
├── config.py            # Configuración y variables de entorno
├── firebase_service.py  # Conexión Firebase Admin SDK
├── models.py            # Modelos Pydantic
├── requirements.txt     # Dependencias Python
├── .env.example         # Plantilla de variables de entorno
├── routes/
│   ├── auth.py          # Endpoints de autenticación
│   ├── inventory.py     # CRUD de inventario
│   ├── ai.py            # Predicciones e insights de IA
│   └── settings.py      # Configuración del restaurante
└── services/
    └── ai_service.py    # Lógica de predicciones y alertas
```
