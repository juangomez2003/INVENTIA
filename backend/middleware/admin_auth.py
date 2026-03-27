from fastapi import Header, HTTPException
from typing import Optional
from jose import jwt, JWTError
from config import settings
import logging

logger = logging.getLogger(__name__)

DEMO_ADMIN_TOKEN = "demo-admin-token-inventia-2024"

async def verify_admin_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify Supabase JWT and ensure the user has super_admin role.
    Accepts a demo token when Supabase is not configured.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de administrador requerido")

    token = authorization.split(" ")[1]

    # Demo mode: accept hardcoded token
    if token == DEMO_ADMIN_TOKEN:
        return {
            "sub": "demo-admin-id",
            "email": "admin@inventia.com",
            "app_metadata": {"role": "super_admin"},
            "demo": True,
        }

    if not settings.supabase_jwt_secret:
        raise HTTPException(status_code=503, detail="Supabase no configurado. Use el token demo.")

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        role = payload.get("app_metadata", {}).get("role", "")
        if role != "super_admin":
            raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol super_admin")
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
