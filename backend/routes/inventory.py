from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from datetime import datetime
import logging

from models import ProductCreate, ProductUpdate, StockMovement
from supabase_service import get_supabase, verify_supabase_token

router = APIRouter(prefix="/inventory", tags=["inventory"])
logger = logging.getLogger(__name__)


def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None


def _get_restaurant_id(token: str, sb) -> str:
    """Obtiene el restaurant_id del usuario autenticado."""
    payload = verify_supabase_token(token)
    user_id = payload["sub"]

    result = sb.table("restaurants")\
        .select("id")\
        .eq("owner_id", user_id)\
        .single()\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return result.data["id"]


@router.get("/products", response_model=List[dict])
async def get_products(authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return _demo_products()

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        restaurant_id = _get_restaurant_id(token, sb)
        result = sb.table("products")\
            .select("*")\
            .eq("restaurant_id", restaurant_id)\
            .eq("active", True)\
            .order("name")\
            .execute()
        return result.data or []
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=dict, status_code=201)
async def create_product(product: ProductCreate, authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return {"id": "demo-new", **product.model_dump(), "last_updated": datetime.now().isoformat()}

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        restaurant_id = _get_restaurant_id(token, sb)
        data = {
            **product.model_dump(),
            "restaurant_id": restaurant_id,
            "last_updated": datetime.now().isoformat(),
        }
        result = sb.table("products").insert(data).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    authorization: Optional[str] = Header(None),
):
    sb = get_supabase()
    if not sb:
        return {"id": product_id, **product.model_dump(exclude_none=True)}

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        restaurant_id = _get_restaurant_id(token, sb)
        update_data = {k: v for k, v in product.model_dump().items() if v is not None}
        update_data["last_updated"] = datetime.now().isoformat()

        result = sb.table("products")\
            .update(update_data)\
            .eq("id", product_id)\
            .eq("restaurant_id", restaurant_id)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return {"message": "Producto eliminado (demo mode)"}

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        restaurant_id = _get_restaurant_id(token, sb)
        # Soft delete: marcar como inactivo en vez de eliminar
        sb.table("products")\
            .update({"active": False, "last_updated": datetime.now().isoformat()})\
            .eq("id", product_id)\
            .eq("restaurant_id", restaurant_id)\
            .execute()
        return {"message": "Producto eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/movements")
async def record_movement(movement: StockMovement, authorization: Optional[str] = Header(None)):
    """
    Registra un movimiento de stock.
    El trigger apply_stock_movement actualiza la quantity del producto automáticamente.
    """
    sb = get_supabase()
    if not sb:
        return {"message": "Movimiento registrado (demo mode)", "id": "demo-movement"}

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        payload = verify_supabase_token(token)
        user_id = payload["sub"]
        restaurant_id = _get_restaurant_id(token, sb)

        # Obtener nombre del producto
        prod = sb.table("products")\
            .select("name, unit")\
            .eq("id", movement.product_id)\
            .eq("restaurant_id", restaurant_id)\
            .single()\
            .execute()

        if not prod.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        data = {
            "restaurant_id": restaurant_id,
            "product_id": movement.product_id,
            "product_name": prod.data["name"],
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "unit": prod.data["unit"],
            "notes": movement.notes or "",
            "user_id": user_id,
        }

        result = sb.table("movements").insert(data).execute()
        return {"message": "Movimiento registrado", "id": result.data[0]["id"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording movement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/movements")
async def get_movements(
    limit: int = 50,
    product_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    sb = get_supabase()
    if not sb:
        return []

    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    try:
        restaurant_id = _get_restaurant_id(token, sb)
        query = sb.table("movements")\
            .select("*")\
            .eq("restaurant_id", restaurant_id)\
            .order("created_at", desc=True)\
            .limit(limit)

        if product_id:
            query = query.eq("product_id", product_id)

        result = query.execute()
        return result.data or []
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching movements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _demo_products():
    now = datetime.now().isoformat()
    return [
        {"id": "1", "name": "Pollo", "category": "Carnes", "quantity": 45, "unit": "kg",
         "min_threshold": 20, "max_capacity": 100, "price_per_unit": 8500,
         "supplier": "Carnes Premium", "last_updated": now, "active": True},
        {"id": "2", "name": "Res", "category": "Carnes", "quantity": 30, "unit": "kg",
         "min_threshold": 15, "max_capacity": 80, "price_per_unit": 12000,
         "supplier": "Carnes Premium", "last_updated": now, "active": True},
        {"id": "3", "name": "Tomates", "category": "Verduras", "quantity": 8, "unit": "kg",
         "min_threshold": 10, "max_capacity": 50, "price_per_unit": 2500,
         "supplier": "Verduras Frescas", "last_updated": now, "active": True},
        {"id": "4", "name": "Aceite vegetal", "category": "Aceites", "quantity": 3, "unit": "L",
         "min_threshold": 5, "max_capacity": 20, "price_per_unit": 15000,
         "supplier": "Gourmet Dist.", "last_updated": now, "active": True},
    ]
