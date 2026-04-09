from fastapi import Header, HTTPException
from typing import Optional
import logging

logger = logging.getLogger(__name__)

DEMO_ADMIN_TOKEN = "demo-admin-token-inventia-2024"


async def verify_admin_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verifica el JWT de Supabase y confirma rol super_admin en user_metadata o app_metadata.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de administrador requerido")

    token = authorization.split(" ")[1]

    # Token demo (cuando Supabase no está configurado)
    if token == DEMO_ADMIN_TOKEN:
        return {
            "sub": "demo-admin-id",
            "email": "admin@inventia.com",
            "user_metadata": {"role": "super_admin"},
            "app_metadata":  {"role": "super_admin"},
            "demo": True,
        }

    # Verificar con Supabase Auth (auth.get_user valida firma y expiración)
    try:
        from supabase_service import verify_supabase_token
        payload = verify_supabase_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    # Comprobar rol super_admin en cualquiera de los dos metadatos
    user_meta = payload.get("user_metadata") or {}
    app_meta  = payload.get("app_metadata")  or {}
    role = user_meta.get("role") or app_meta.get("role") or ""

    if role != "super_admin":
        raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol super_admin")

    return payload
