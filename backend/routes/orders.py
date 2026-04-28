"""
Orders — flujo: Mesero crea → Chef marca listo → Cajero paga → Inventario se descuenta.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from pydantic import BaseModel
import logging

from supabase_service import get_supabase
from deps import get_staff_context

router = APIRouter(prefix="/orders", tags=["orders"])
logger = logging.getLogger(__name__)


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


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _deduct_inventory(sb, order_id: str, restaurant_id: str, table_number: int, user_id: str):
    """
    Descuenta inventario al pagar una orden.
    - Si el ítem tiene dish_id: descuenta los ingredientes del plato * cantidad pedida.
    - Si tiene product_id directo: descuenta ese producto.
    """
    items_res = sb.table("order_items").select("*").eq("order_id", order_id).execute()
    items = items_res.data or []

    movements = []
    note_prefix = f"Venta - Mesa {table_number} (Orden {order_id[:8]})"

    for item in items:
        qty_ordered = item.get("quantity", 1)

        # — Plato con receta (dish_ingredients) —
        if item.get("dish_id"):
            ings_res = sb.table("dish_ingredients").select(
                "quantity, unit, product_id, products(name)"
            ).eq("dish_id", item["dish_id"]).execute()

            for ing in (ings_res.data or []):
                movements.append({
                    "restaurant_id": restaurant_id,
                    "product_id": ing["product_id"],
                    "product_name": ing["products"]["name"] if ing.get("products") else ing["product_id"],
                    "movement_type": "salida",
                    "quantity": round(ing["quantity"] * qty_ordered, 4),
                    "unit": ing["unit"],
                    "notes": f"{note_prefix} — {item['product_name']}",
                    "user_id": user_id,
                })
            continue

        # — Producto directo (sin receta) —
        if item.get("product_id"):
            prod_res = sb.table("products").select("unit").eq(
                "id", item["product_id"]
            ).eq("restaurant_id", restaurant_id).limit(1).execute()
            unit = prod_res.data[0]["unit"] if prod_res.data else item.get("unit", "u")
            movements.append({
                "restaurant_id": restaurant_id,
                "product_id": item["product_id"],
                "product_name": item["product_name"],
                "movement_type": "salida",
                "quantity": qty_ordered,
                "unit": unit,
                "notes": note_prefix,
                "user_id": user_id,
            })

    if movements:
        sb.table("movements").insert(movements).execute()
        logger.info(f"Inventario descontado: {len(movements)} movimiento(s) de orden {order_id[:8]}")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def list_orders(ctx: dict = Depends(get_staff_context)):
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
async def create_order(body: OrderCreate, ctx: dict = Depends(get_staff_context)):
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

    items_res = sb.table("order_items").select("*").eq("order_id", order_id).execute()
    return {**order_res.data[0], "order_items": items_res.data or items_payload}


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    ctx: dict = Depends(get_staff_context),
):
    """
    Actualiza el estado de una orden según el rol.
    Al pasar a 'paid', descuenta automáticamente el inventario.
    """
    sb = get_supabase()
    role = ctx["role"]
    new_status = body.status

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

    order = sb.table("orders").select("*").eq("id", order_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).limit(1).execute()

    if not order.data:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    if role == "mesero" and order.data.get("created_by") != ctx["user_id"]:
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tus propias órdenes")

    # Verificar que no se pague dos veces
    if new_status == "paid" and order.data.get("status") == "paid":
        raise HTTPException(status_code=409, detail="Esta orden ya fue pagada")

    update_data: dict = {"status": new_status}
    if new_status == "paid":
        update_data["closed_by"] = ctx["user_id"]

    res = sb.table("orders").update(update_data).eq("id", order_id).execute()

    # Descontar inventario al cobrar
    if new_status == "paid":
        try:
            _deduct_inventory(
                sb=sb,
                order_id=order_id,
                restaurant_id=ctx["restaurant_id"],
                table_number=order.data["table_number"],
                user_id=ctx["user_id"],
            )
        except Exception as e:
            logger.error(f"Error descontando inventario para orden {order_id}: {e}")

    return res.data[0] if res.data else {"ok": True}


@router.get("/{order_id}")
async def get_order(order_id: str, ctx: dict = Depends(get_staff_context)):
    """Detalle de una orden con sus items."""
    sb = get_supabase()
    res = sb.table("orders").select("*, order_items(*)").eq("id", order_id).eq(
        "restaurant_id", ctx["restaurant_id"]
    ).limit(1).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return res.data
