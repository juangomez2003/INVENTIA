"""
Dependencias compartidas de FastAPI — auth y contexto de restaurante.
Centraliza toda la lógica de autenticación para evitar duplicación entre rutas.
"""
from fastapi import HTTPException, Header
from typing import Optional

from supabase_service import get_supabase, verify_supabase_token
from services.staff_auth import decode_staff_session_token
from config import settings


def extract_token(authorization: Optional[str]) -> str:
    """Extrae el Bearer token o lanza 401."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    return authorization.split(" ", 1)[1]


def get_restaurant_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependencia FastAPI — devuelve el restaurant_id del owner autenticado.
    Uso: restaurant_id: str = Depends(get_restaurant_id)
    """
    token = extract_token(authorization)
    try:
        payload = verify_supabase_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")

    sb = get_supabase()
    res = sb.table("restaurants").select("id").eq("owner_id", payload["sub"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return res.data[0]["id"]


def get_owner_context(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependencia FastAPI — devuelve {user_id, restaurant_id, role, plan}.
    Igual que get_restaurant_id pero incluye contexto completo del owner.
    """
    token = extract_token(authorization)
    try:
        payload = verify_supabase_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")

    sb = get_supabase()
    res = sb.table("restaurants").select("id, plan").eq("owner_id", payload["sub"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    return {
        "user_id": payload["sub"],
        "restaurant_id": res.data[0]["id"],
        "role": "owner",
        "plan": res.data[0].get("plan", "free"),
    }


async def get_staff_context(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependencia FastAPI — resuelve cualquier tipo de sesión de staff:
      1. Staff session token  (acceso por código, sin cuenta)
      2. Supabase auth token  (cuenta registrada)
      3. Owner token          (dueño del restaurante)
    Devuelve {user_id, restaurant_id, role, plan}.
    """
    token = extract_token(authorization)

    # 1. Staff session token (código de turno)
    staff_payload = decode_staff_session_token(token, settings.secret_key)
    if staff_payload:
        sb = get_supabase()
        res = sb.table("restaurants").select("plan").eq(
            "id", staff_payload["restaurant_id"]
        ).limit(1).execute()
        plan = res.data[0].get("plan", "free") if res.data else "free"
        return {
            "user_id": f"code:{staff_payload['code_id']}",
            "restaurant_id": staff_payload["restaurant_id"],
            "role": staff_payload["role"],
            "plan": plan,
        }

    # 2 & 3. Supabase auth token
    try:
        payload = verify_supabase_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user_id = payload["sub"]
    sb = get_supabase()

    # ¿Es miembro del staff?
    staff_res = sb.table("restaurant_staff").select(
        "restaurant_id, role"
    ).eq("user_id", user_id).eq("active", True).limit(1).execute()

    if staff_res.data:
        s = staff_res.data[0]
        plan_res = sb.table("restaurants").select("plan").eq(
            "id", s["restaurant_id"]
        ).limit(1).execute()
        plan = plan_res.data[0].get("plan", "free") if plan_res.data else "free"
        return {
            "user_id": user_id,
            "restaurant_id": s["restaurant_id"],
            "role": s["role"],
            "plan": plan,
        }

    # ¿Es owner?
    rest_res = sb.table("restaurants").select("id, plan").eq(
        "owner_id", user_id
    ).limit(1).execute()
    if rest_res.data:
        return {
            "user_id": user_id,
            "restaurant_id": rest_res.data[0]["id"],
            "role": "owner",
            "plan": rest_res.data[0].get("plan", "free"),
        }

    raise HTTPException(status_code=403, detail="No perteneces a ningún restaurante")


def require_owner(ctx: dict) -> dict:
    """Guard — lanza 403 si el contexto no es owner."""
    if ctx["role"] != "owner":
        raise HTTPException(status_code=403, detail="Solo el propietario puede realizar esta acción")
    return ctx


def require_paid(ctx: dict) -> dict:
    """Guard — lanza 402 si el plan es free."""
    PAID = {"pro", "premium", "enterprise"}
    if ctx.get("plan", "free") not in PAID:
        raise HTTPException(status_code=402, detail="Esta función requiere un plan de pago")
    return ctx
