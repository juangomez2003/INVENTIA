"""
Menu — CRUD de platos del menú + OCR scan desde imagen/PDF.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timezone
import logging

from supabase_service import get_supabase
from deps import get_restaurant_id

router = APIRouter(prefix="/menu", tags=["menu"])
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"}


# ─── Models ───────────────────────────────────────────────────────────────────

class IngredientIn(BaseModel):
    product_id: str
    quantity: float
    unit: str

class DishCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    category: str = "General"
    price: float = 0
    image_url: Optional[str] = None
    ingredients: List[IngredientIn] = []

class DishUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None
    ingredients: Optional[List[IngredientIn]] = None

class DishesImport(BaseModel):
    dishes: List[DishCreate]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _sync_ingredients(sb, dish_id: str, ingredients: List[IngredientIn]):
    """Reemplaza los ingredientes de un plato."""
    sb.table("dish_ingredients").delete().eq("dish_id", dish_id).execute()
    if ingredients:
        sb.table("dish_ingredients").insert([
            {"dish_id": dish_id, "product_id": ing.product_id,
             "quantity": ing.quantity, "unit": ing.unit}
            for ing in ingredients
        ]).execute()


def _fetch_dish(sb, dish_id: str, restaurant_id: str) -> dict:
    res = sb.table("dishes").select(
        "*, dish_ingredients(*, products(name, unit))"
    ).eq("id", dish_id).eq("restaurant_id", restaurant_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    return res.data[0]


# ─── CRUD ─────────────────────────────────────────────────────────────────────

@router.get("/dishes")
async def list_dishes(restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    res = sb.table("dishes").select(
        "*, dish_ingredients(*, products(name, unit))"
    ).eq("restaurant_id", restaurant_id).eq("active", True).order("category").order("name").execute()
    return res.data or []


@router.post("/dishes/import", status_code=201)
async def import_dishes(body: DishesImport, restaurant_id: str = Depends(get_restaurant_id)):
    """Guarda en lote los platos confirmados tras el scan OCR."""
    sb = get_supabase()
    if not body.dishes:
        raise HTTPException(status_code=400, detail="No se enviaron platos")

    rows = [
        {"restaurant_id": restaurant_id, "name": d.name,
         "description": d.description or "", "category": d.category, "price": d.price}
        for d in body.dishes
    ]
    res = sb.table("dishes").insert(rows).execute()
    return {"imported": len(res.data or []), "dishes": res.data or []}


@router.post("/dishes", status_code=201)
async def create_dish(body: DishCreate, restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    res = sb.table("dishes").insert({
        "restaurant_id": restaurant_id,
        "name": body.name, "description": body.description,
        "category": body.category, "price": body.price,
        "image_url": body.image_url,
    }).execute()
    dish = res.data[0]
    if body.ingredients:
        _sync_ingredients(sb, dish["id"], body.ingredients)
    return dish


@router.put("/dishes/{dish_id}")
async def update_dish(
    dish_id: str, body: DishUpdate,
    restaurant_id: str = Depends(get_restaurant_id),
):
    sb = get_supabase()
    update_data = {k: v for k, v in body.model_dump(exclude={"ingredients"}).items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        sb.table("dishes").update(update_data).eq("id", dish_id).eq("restaurant_id", restaurant_id).execute()
    if body.ingredients is not None:
        _sync_ingredients(sb, dish_id, body.ingredients)
    return _fetch_dish(sb, dish_id, restaurant_id)


@router.delete("/dishes/{dish_id}", status_code=204)
async def delete_dish(dish_id: str, restaurant_id: str = Depends(get_restaurant_id)):
    sb = get_supabase()
    sb.table("dishes").update({"active": False}).eq("id", dish_id).eq("restaurant_id", restaurant_id).execute()


# ─── OCR Scan ─────────────────────────────────────────────────────────────────

@router.post("/scan")
async def scan_menu(
    file: UploadFile = File(...),
    restaurant_id: str = Depends(get_restaurant_id),
):
    """Recibe imagen o PDF del menú físico y devuelve platos detectados para confirmar."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Formato no soportado. Usa: JPG, PNG, WEBP o PDF.")

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Archivo demasiado grande (máx 20 MB)")

    try:
        from services.menu_ocr import scan_menu as ocr_scan
        return ocr_scan(file_bytes, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar el archivo")
