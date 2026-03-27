from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime
import logging

from models import RestaurantSettings
from firebase_service import get_db, get_auth

router = APIRouter(prefix="/settings", tags=["settings"])
logger = logging.getLogger(__name__)

_demo_settings = {
    "name": "Mi Restaurante",
    "address": "Calle Principal 123",
    "phone": "+57 300 000 0000",
    "email": "contacto@mirestaurante.com",
    "alert_threshold": 20,
    "notify_whatsapp": False,
    "notify_email": True,
    "auto_restock": False,
}


@router.get("/")
async def get_settings(authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return _demo_settings

    try:
        if not authorization or not authorization.startswith("Bearer "):
            return _demo_settings
        auth = get_auth()
        decoded = auth.verify_id_token(authorization.split(" ")[1])
        restaurant_id = decoded.get("restaurant_id") or decoded.get("uid", "demo")

        doc = db.collection("restaurants").document(restaurant_id).get()
        if doc.exists:
            return doc.to_dict().get("settings", _demo_settings)
        return _demo_settings
    except Exception as e:
        logger.error(f"Error fetching settings: {e}")
        return _demo_settings


@router.put("/")
async def update_settings(settings: RestaurantSettings, authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return {"message": "Configuración guardada (demo mode)", **settings.model_dump()}

    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token requerido")
        auth = get_auth()
        decoded = auth.verify_id_token(authorization.split(" ")[1])
        restaurant_id = decoded.get("restaurant_id") or decoded.get("uid", "demo")

        db.collection("restaurants").document(restaurant_id).set(
            {"settings": settings.model_dump(), "updated_at": datetime.now().isoformat()},
            merge=True
        )
        return {"message": "Configuración actualizada", **settings.model_dump()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
