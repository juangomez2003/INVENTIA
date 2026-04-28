from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
import logging

from models import RestaurantSettings
from supabase_service import get_supabase
from deps import get_owner_context

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
    "plan": "free",
}


@router.get("/")
async def get_settings(ctx: dict = Depends(get_owner_context)):
    sb = get_supabase()
    result = sb.table("restaurants").select(
        "name, address, phone, email, alert_threshold, notify_email, notify_whatsapp, auto_restock, plan"
    ).eq("owner_id", ctx["user_id"]).limit(1).execute()

    if not result.data:
        return _demo_settings

    data = result.data[0]
    return {
        "name":            data.get("name", ""),
        "address":         data.get("address", ""),
        "phone":           data.get("phone", ""),
        "email":           data.get("email", ""),
        "alert_threshold": data.get("alert_threshold", 20),
        "notify_email":    data.get("notify_email", True),
        "notify_whatsapp": data.get("notify_whatsapp", False),
        "auto_restock":    data.get("auto_restock", False),
        "plan":            data.get("plan", "free"),
    }


@router.put("/")
async def update_settings(
    settings: RestaurantSettings,
    ctx: dict = Depends(get_owner_context),
):
    sb = get_supabase()
    sb.table("restaurants").update({
        "name":            settings.name,
        "address":         settings.address,
        "phone":           settings.phone,
        "email":           settings.email,
        "alert_threshold": settings.alert_threshold,
        "notify_email":    settings.notify_email,
        "notify_whatsapp": settings.notify_whatsapp,
        "auto_restock":    settings.auto_restock,
    }).eq("owner_id", ctx["user_id"]).execute()

    return {"message": "Configuración actualizada", **settings.model_dump()}
