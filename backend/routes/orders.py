"""
Orders — flujo: Mesero crea → Chef marca listo → Cajero paga → Inventario se descuenta.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from pydantic import BaseModel
import logging

from supabase_service import get_supabase

router = APIRouter(prefix="/orders", tags=["orders"])
logger = logging.getLogger(__name__)


# ─── Auth helper ──────────────────────────────────────────────────────────────

async def _get_current_staff(authorization: Optional[str] = Header(None)):
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

    # Staff member?
    staff_res = sb.table("restaurant_staff").select(
        "restaurant_id, role, active"
    ).eq("user_id", user.id).eq("active", True).limit(1).execute()

    if staff_res.data:
        s = staff_res.data[0]
        return {
            "user_id": user.id,
            "restaurant_id": s["restaurant_id"],
            "role": s["role"],
        }

    # Owner?
    rest_res = sb.table("restaurants").select("id").eq("owner_id", user.id).limit(1).execute()
    if rest_res.data:
        return {
            "user_id": user.id,
            "restaurant_id": rest_res.data[0]["id"],
            "role": "owner",
        }

    raise HTTPException(status_code=403, detail="No perteneces a ningún restaurante")


# ─── Models ───────────────────────────────────────────────────────────────────

class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    unit: str
    price_per_unit: float


class OrderCreate(BaseModel):
    table_number: int
    notes: Optional[str] = None
    items: List[OrderItemIn]


class OrderStatusUpdate(BaseModel):
    status: str  # in_kitchen | ready | paid | cancelled


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def list_orders(ctx: dict = Depends(_get_current_staff)):
    """
    Retorna órdenes filtradas por rol:
    - mesero: sus propias órdenes activas (pending / in_kitchen)
    - chef:   todas las pending / in_kitchen del restaurante
    - cajero: todas las ready
    - owner / inventario: todas
    """
    sb = get_supabase()
    rid = ctx["restaurant_id"]
    role = ctx["role"]

    q = sb.table("orders").select(
        "*, order_items(*)"
    ).eq("restaurant_id", rid)

    if role == "mesero":
        q = q.eq("created_by", ctx["user_id"]).in_("status", ["pending", "in_kitchen", "ready"])
    elif role == "chef":
        q = q.in_("status", ["pending", "in_kitchen"])
    elif role == "cajero":
        q = q.in_("status", ["ready", "paid"])
    # owner / inventario ven todo

    res = q.order("created_at", desc=True).execute()
    return res.data or []


@router.post("")
async def create_order(body: OrderCreate, ctx: dict = Depends(_get_current_staff)):
    """Mesero crea una orden nueva."""
    if ctx["role"] not in ("mesero", "owner"):
        raise HTTPException(status_code=403, detail="Solo los meseros pueden crear órdenes")

    if not body.items:
        raise HTTPException(status_code=400, detail="La orden debe tener al menos un producto")

    sb = get_supabase()
    total = sum(i.quantity * i.price_per_unit for i in body.items)

    order_res = sb.table("orders").insert({
        "restaurant_id": ctx["restaurant_id"],
        "table_number": body.table_number,
        "notes": body.notes,
        "total": round(total, 2),
        "status": "pending",
        "created_by": ctx["user_id"],
    }).execute()

    if not order_res.data:
        raise HTTPException(status_code=500, detail="Error al crear la orden")

    order_id = order_res.data[0]["id"]

    items_payload = [
        {
            "order_id": order_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit": item.unit,
            "price_per_unit": item.price_per_unit,
        }
        for item in body.items
    ]
    sb.table("order_items").insert(items_payload).execute()

    # Fetch items back so the DB-generated subtotal is included
    items_res = sb.table("order_items").select("*").eq("order_id", order_id).execute()
    return {**order_res.data[0], "order_items": items_res.data or items_payload}


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    ctx: dict = Depends(_get_current_staff),
):
    """
    Actualiza el estado de una orden según el rol:
    - chef:   pending → in_kitchen, in_kitchen → ready
    - cajero: ready → paid, cualquiera → cancelled
    - mesero: pending → cancelled (solo sus propias)
    - owner:  cualquier transición
    """
    sb = get_supabase()
    role = ctx["role"]
    new_status = body.status

    # Validar rol vs transición permitida
    allowed = {
        "chef":   ["in_kitchen", "ready"],
        "cajero": ["paid", "cancelled"],
        "mesero": ["cancelled"],
        "owner":  ["in_kitchen", "ready", "paid", "cancelled"],
    }
    if role in allowed and new_status not in allowed.get(role, []):
        raise HTTPException(
            status_code=403,
            detail=f"El rol '{role}' no puede poner la orden en estado '{new_status}'"
        )

    # Obtener orden actual
    order = sb.table("orders").select("*").eq("id", order_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).maybe_single().execute()

    if not order.data:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Mesero solo puede cancelar sus propias órdenes
    if role == "mesero" and order.data.get("created_by") != ctx["user_id"]:
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tus propias órdenes")

    update_data: dict = {"status": new_status}
    if new_status == "paid":
        update_data["closed_by"] = ctx["user_id"]

    res = sb.table("orders").update(update_data).eq("id", order_id).execute()
    return res.data[0] if res.data else {"ok": True}


@router.get("/{order_id}")
async def get_order(order_id: str, ctx: dict = Depends(_get_current_staff)):
    """Detalle de una orden con sus items."""
    sb = get_supabase()
    res = sb.table("orders").select("*, order_items(*)").eq("id", order_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).maybe_single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return res.data
