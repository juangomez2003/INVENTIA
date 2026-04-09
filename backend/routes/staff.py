"""
Staff management & invite codes — feature de plan de pago.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from pydantic import BaseModel
import random
import string
import logging

from supabase_service import get_supabase

router = APIRouter(prefix="/staff", tags=["staff"])
logger = logging.getLogger(__name__)

PAID_PLANS = {"pro", "premium", "enterprise"}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _generate_code(length: int = 8) -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


async def _get_current_staff(authorization: Optional[str] = Header(None)):
    """Devuelve (user_id, restaurant_id, role) del staff autenticado."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ")[1]
    sb = get_supabase()
    try:
        res = sb.auth.get_user(token)
        user = res.user
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Buscar en restaurant_staff
    staff_res = sb.table("restaurant_staff").select(
        "restaurant_id, role, name, active"
    ).eq("user_id", user.id).eq("active", True).limit(1).execute()

    if not staff_res.data:
        # Quizás es el owner
        rest_res = sb.table("restaurants").select("id, plan").eq("owner_id", user.id).limit(1).execute()
        if rest_res.data:
            return {
                "user_id": user.id,
                "restaurant_id": rest_res.data[0]["id"],
                "role": "owner",
                "plan": rest_res.data[0].get("plan", "free"),
            }
        raise HTTPException(status_code=403, detail="No perteneces a ningún restaurante")

    # Obtener plan del restaurante
    s = staff_res.data[0]
    rest_res = sb.table("restaurants").select("plan").eq("id", s["restaurant_id"]).limit(1).execute()
    plan = rest_res.data[0].get("plan", "free") if rest_res.data else "free"

    return {
        "user_id": user.id,
        "restaurant_id": s["restaurant_id"],
        "role": s["role"],
        "plan": plan,
    }


def _require_owner(ctx: dict):
    if ctx["role"] != "owner":
        raise HTTPException(status_code=403, detail="Solo el propietario puede realizar esta acción")


def _require_paid(ctx: dict):
    if ctx.get("plan", "free") not in PAID_PLANS:
        raise HTTPException(status_code=402, detail="Esta función requiere un plan de pago")


# ─── Models ───────────────────────────────────────────────────────────────────

class InviteCreate(BaseModel):
    role: str  # mesero | chef | cajero | inventario


class StaffJoin(BaseModel):
    code: str
    name: str
    email: str
    password: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_my_profile(ctx: dict = Depends(_get_current_staff)):
    """Retorna perfil del usuario autenticado (role, restaurant_id, plan)."""
    return ctx


@router.post("/invites")
async def create_invite(body: InviteCreate, ctx: dict = Depends(_get_current_staff)):
    """Owner genera un código de invitación para un rol."""
    _require_owner(ctx)
    _require_paid(ctx)

    if body.role not in ("mesero", "chef", "cajero", "inventario"):
        raise HTTPException(status_code=400, detail="Rol inválido")

    sb = get_supabase()
    # Generar código único
    for _ in range(5):
        code = _generate_code()
        existing = sb.table("staff_invites").select("id").eq("code", code).maybe_single().execute()
        if not existing.data:
            break
    else:
        raise HTTPException(status_code=500, detail="No se pudo generar un código único")

    res = sb.table("staff_invites").insert({
        "restaurant_id": ctx["restaurant_id"],
        "code": code,
        "role": body.role,
        "created_by": ctx["user_id"],
    }).execute()

    return res.data[0] if res.data else {"code": code}


@router.get("/invites")
async def list_invites(ctx: dict = Depends(_get_current_staff)):
    """Lista todos los códigos generados por el restaurante."""
    _require_owner(ctx)
    _require_paid(ctx)

    sb = get_supabase()
    res = sb.table("staff_invites").select("*").eq(
        "restaurant_id", ctx["restaurant_id"]
    ).order("created_at", desc=True).execute()
    return res.data or []


@router.delete("/invites/{invite_id}")
async def delete_invite(invite_id: str, ctx: dict = Depends(_get_current_staff)):
    """Elimina / revoca un código de invitación."""
    _require_owner(ctx)
    sb = get_supabase()
    sb.table("staff_invites").delete().eq("id", invite_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).execute()
    return {"ok": True}


@router.post("/join")
async def join_with_code(body: StaffJoin):
    """
    Staff usa un código para unirse al restaurante.
    Crea cuenta Supabase Auth + entrada en restaurant_staff.
    """
    sb = get_supabase()

    # Validar código
    invite_res = sb.table("staff_invites").select("*").eq("code", body.code.upper()).limit(1).execute()
    if not invite_res.data:
        raise HTTPException(status_code=404, detail="Código inválido")
    inv = invite_res.data[0]
    if inv.get("used_by"):
        raise HTTPException(status_code=409, detail="Este código ya fue utilizado")

    from datetime import datetime, timezone
    expires = datetime.fromisoformat(inv["expires_at"].replace("Z", "+00:00"))
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="El código ha expirado")

    # Crear usuario en Supabase Auth
    try:
        user_res = sb.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,
            "user_metadata": {"name": body.name, "role": inv["role"]},
        })
        new_user = user_res.user
        if not new_user:
            raise ValueError("No se creó el usuario")
    except Exception as e:
        err = str(e)
        if "already registered" in err.lower() or "already been registered" in err.lower():
            raise HTTPException(status_code=409, detail="El email ya está registrado")
        raise HTTPException(status_code=400, detail=f"Error al crear cuenta: {err}")

    # Agregar a restaurant_staff
    sb.table("restaurant_staff").insert({
        "restaurant_id": inv["restaurant_id"],
        "user_id": new_user.id,
        "role": inv["role"],
        "name": body.name,
    }).execute()

    # Marcar código como usado
    from datetime import datetime, timezone
    sb.table("staff_invites").update({
        "used_by": new_user.id,
        "used_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", inv["id"]).execute()

    return {
        "ok": True,
        "role": inv["role"],
        "restaurant_id": inv["restaurant_id"],
        "message": f"Cuenta creada con rol '{inv['role']}'. Ya puedes iniciar sesión.",
    }


@router.get("/list")
async def list_staff(ctx: dict = Depends(_get_current_staff)):
    """Lista el personal activo del restaurante."""
    _require_owner(ctx)

    sb = get_supabase()
    res = sb.table("restaurant_staff").select("*").eq(
        "restaurant_id", ctx["restaurant_id"]
    ).order("created_at", desc=True).execute()
    return res.data or []


@router.delete("/list/{staff_id}")
async def remove_staff(staff_id: str, ctx: dict = Depends(_get_current_staff)):
    """Desactiva un empleado del restaurante."""
    _require_owner(ctx)

    sb = get_supabase()
    sb.table("restaurant_staff").update({"active": False}).eq("id", staff_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).execute()
    return {"ok": True}


# ─── Modules ──────────────────────────────────────────────────────────────────

@router.get("/modules")
async def get_modules(ctx: dict = Depends(_get_current_staff)):
    """Retorna los módulos habilitados del restaurante."""
    sb = get_supabase()
    res = sb.table("restaurant_modules").select("module_key, enabled").eq(
        "restaurant_id", ctx["restaurant_id"]
    ).execute()
    return {row["module_key"]: row["enabled"] for row in (res.data or [])}
