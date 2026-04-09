from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime
import logging

from models import UserCreate
from supabase_service import get_supabase, is_supabase_configured, verify_supabase_token

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register")
async def register_user(user: UserCreate):
    """
    Registra un nuevo usuario con Supabase Auth.
    El trigger create_restaurant_on_signup crea el restaurante automáticamente.
    """
    sb = get_supabase()
    if not sb:
        return {
            "message": "Usuario registrado (demo mode)",
            "user": {"id": "demo-user", "email": user.email, "name": user.name}
        }

    try:
        response = sb.auth.admin.create_user({
            "email": user.email,
            "password": user.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": user.name,
                "restaurant_name": user.restaurant_name,
            }
        })

        new_user = response.user
        if not new_user:
            raise HTTPException(status_code=400, detail="No se pudo crear el usuario")

        return {
            "message": "Usuario registrado exitosamente",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": user.name,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "already registered" in msg or "already exists" in msg:
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail=msg)


@router.get("/me")
async def get_current_user_info(authorization: Optional[str] = Header(None)):
    """Retorna la información del usuario autenticado y su restaurante."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    sb = get_supabase()
    if not sb:
        return {
            "id": "demo-user",
            "email": "demo@inventia.com",
            "name": "Usuario Demo",
            "role": "admin",
            "restaurant": "Mi Restaurante Demo",
        }

    try:
        token = authorization.split(" ")[1]
        payload = verify_supabase_token(token)
        user_id = payload["sub"]

        restaurant = sb.table("restaurants")\
            .select("id, name, plan, status")\
            .eq("owner_id", user_id)\
            .single()\
            .execute()

        restaurant_name = "Mi Restaurante"
        restaurant_id = None
        if restaurant.data:
            restaurant_name = restaurant.data.get("name", "Mi Restaurante")
            restaurant_id = restaurant.data.get("id")

        return {
            "id": user_id,
            "email": payload.get("email", ""),
            "name": payload.get("user_metadata", {}).get("full_name", ""),
            "role": "admin",
            "restaurant": restaurant_name,
            "restaurant_id": restaurant_id,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/verify-token")
async def verify_token(authorization: Optional[str] = Header(None)):
    """Verifica si un token de Supabase es válido."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        token = authorization.split(" ")[1]
        payload = verify_supabase_token(token)
        return {"valid": True, "uid": payload["sub"]}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
