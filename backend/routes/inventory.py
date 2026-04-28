from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List
from datetime import datetime
import logging

from models import ProductCreate, ProductUpdate, StockMovement
from supabase_service import get_supabase, verify_supabase_token
from deps import get_restaurant_id, extract_token

router = APIRouter(prefix="/inventory", tags=["inventory"])
logger = logging.getLogger(__name__)


@router.get("/products", response_model=List[dict])
async def get_products(restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    result = sb.table("products").select("*").eq("restaurant_id", restaurant_id).eq("active", True).order("name").execute()
    return result.data or []


@router.post("/products", response_model=dict, status_code=201)
async def create_product(product: ProductCreate, restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    data = {**product.model_dump(), "restaurant_id": restaurant_id, "last_updated": datetime.now().isoformat()}
    result = sb.table("products").insert(data).execute()
    return result.data[0]


@router.put("/products/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    restaurant_id: str = Depends(get_restaurant_id),
):
    sb = get_supabase()
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    update_data["last_updated"] = datetime.now().isoformat()
    result = sb.table("products").update(update_data).eq("id", product_id).eq("restaurant_id", restaurant_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return result.data[0]


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    sb.table("products").update({"active": False, "last_updated": datetime.now().isoformat()}).eq("id", product_id).eq("restaurant_id", restaurant_id).execute()
    return {"message": "Producto eliminado exitosamente"}


@router.post("/movements")
async def record_movement(movement: StockMovement, authorization: Optional[str] = Header(None)):
    """Registra un movimiento de stock manual."""
    token = extract_token(authorization)
    try:
        payload = verify_supabase_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user_id = payload["sub"]
    sb = get_supabase()

    rest_res = sb.table("restaurants").select("id").eq("owner_id", user_id).limit(1).execute()
    if not rest_res.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    restaurant_id = rest_res.data[0]["id"]

    prod = sb.table("products").select("name, unit").eq("id", movement.product_id).eq("restaurant_id", restaurant_id).limit(1).execute()
    if not prod.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    result = sb.table("movements").insert({
        "restaurant_id": restaurant_id,
        "product_id": movement.product_id,
        "product_name": prod.data[0]["name"],
        "movement_type": movement.movement_type,
        "quantity": movement.quantity,
        "unit": prod.data[0]["unit"],
        "notes": movement.notes or "",
        "user_id": user_id,
    }).execute()
    return {"message": "Movimiento registrado", "id": result.data[0]["id"]}


@router.get("/movements")
async def get_movements(
    limit: int = 50,
    product_id: Optional[str] = None,
    restaurant_id: str = Depends(get_restaurant_id),
):
    sb = get_supabase()
    query = sb.table("movements").select("*").eq("restaurant_id", restaurant_id).order("created_at", desc=True).limit(limit)
    if product_id:
        query = query.eq("product_id", product_id)
    return query.execute().data or []
