from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from config import settings
from firebase_service import init_firebase
from routes import auth, inventory, ai, settings as settings_router
from routes.admin import router as admin_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = init_firebase()
    if db:
        logger.info("Firebase Firestore conectado exitosamente")
    else:
        logger.warning("Ejecutando en MODO DEMO - Firebase no configurado")
    yield
    # Shutdown (cleanup if needed)


# Create FastAPI app
app = FastAPI(
    title="INVENTIA API",
    description="Backend para el sistema de gestión de inventario con IA para restaurantes",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "app": "INVENTIA API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health_check():
    from firebase_service import get_db
    db = get_db()
    return {
        "status": "healthy",
        "firebase": "connected" if db else "demo_mode",
        "environment": settings.app_env,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
