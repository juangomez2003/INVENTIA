from typing import Optional
from fastapi import HTTPException
from supabase_service import verify_supabase_token


def extract_token(authorization: Optional[str]) -> Optional[str]:
    """Extrae el Bearer token del header Authorization."""
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None


def require_token(authorization: Optional[str]) -> str:
    """Extrae el token o lanza 401 si no está presente."""
    token = extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")
    return token


def get_user_id(authorization: Optional[str]) -> str:
    """Verifica el JWT de Supabase y retorna el user_id."""
    token = require_token(authorization)
    payload = verify_supabase_token(token)
    return payload["sub"]
