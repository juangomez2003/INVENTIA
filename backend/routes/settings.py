from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import logging

from models import RestaurantSettings
from supabase_service import get_supabase, verify_supabase_token

router = APIRouter(prefix="/settings", tags=["settings"])
logger = logging.getLogger(__name__)

_demo_settings = {
    "name": "Mi Restaurante Demo",
    "address": "Calle Principal 123",
    "phone": "+57 300 000 0000",
    "email": "contacto@mirestaurante.com",
    "alert_threshold": 20,
    "notify_whatsapp": False,
    "notify_email": True,
    "auto_restock": False,
}


def _get_user_id(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ")[1]
    payload = verify_supabase_token(token)
    return payload["sub"]


@router.get("/")
async def get_settings(authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return _demo_settings

    try:
        user_id = _get_user_id(authorization)
        result = sb.table("restaurants")\
            .select("name, address, phone, email, alert_threshold, "
                    "notify_email, notify_whatsapp, auto_restock")\
            .eq("owner_id", user_id)\
            .single()\
            .execute()

        if not result.data:
            return _demo_settings

        data = result.data
        return {
            "name":             data.get("name", ""),
            "address":          data.get("address", ""),
            "phone":            data.get("phone", ""),
            "email":            data.get("email", ""),
            "alert_threshold":  data.get("alert_threshold", 20),
            "notify_email":     data.get("notify_email", True),
            "notify_whatsapp":  data.get("notify_whatsapp", False),
            "auto_restock":     data.get("auto_restock", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching settings: {e}")
        return _demo_settings


@router.put("/")
async def update_settings(
    settings: RestaurantSettings,
    authorization: Optional[str] = Header(None),
):
    sb = get_supabase()
    if not sb:
        return {"message": "Configuración guardada (demo mode)", **settings.model_dump()}

    try:
        user_id = _get_user_id(authorization)
        update_data = {
            "name":             settings.name,
            "address":          settings.address,
            "phone":            settings.phone,
            "email":            settings.email,
            "alert_threshold":  settings.alert_threshold,
            "notify_email":     settings.notify_email,
            "notify_whatsapp":  settings.notify_whatsapp,
            "auto_restock":     settings.auto_restock,
        }

        sb.table("restaurants")\
            .update(update_data)\
            .eq("owner_id", user_id)\
            .execute()

        return {"message": "Configuración actualizada", **settings.model_dump()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
