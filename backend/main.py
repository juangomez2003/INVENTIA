from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from config import settings
from supabase_service import get_supabase, is_supabase_configured
from routes import auth, inventory, ai, settings as settings_router
from routes.admin import router as admin_router
from routes.payments import router as payments_router
from routes.staff import router as staff_router
from routes.orders import router as orders_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    sb = get_supabase()
    if sb:
        logger.info("Supabase conectado exitosamente")
    else:
        logger.warning("Ejecutando en MODO DEMO — Supabase no configurado")
    yield


app = FastAPI(
    title="INVENTIA API",
    description="Backend para el sistema de gestión de inventario con IA para restaurantes",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

_origins = (
    ["*"]
    if settings.app_env == "development"
    else settings.cors_origins_list
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,            prefix="/api/v1")
app.include_router(inventory.router,       prefix="/api/v1")
app.include_router(ai.router,              prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(admin_router,           prefix="/api/v1")
app.include_router(payments_router,        prefix="/api/v1")
app.include_router(staff_router,           prefix="/api/v1")
app.include_router(orders_router,          prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "app": "INVENTIA API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health_check():
    sb = get_supabase()
    return {
        "status": "healthy",
        "supabase": "connected" if sb else "demo_mode",
        "environment": settings.app_env,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
