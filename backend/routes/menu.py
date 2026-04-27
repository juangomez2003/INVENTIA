"""
Menu — CRUD de platos + OCR scan desde imagen/PDF.
"""
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel
import logging

from supabase_service import get_supabase, verify_supabase_token
from utils.auth import extract_token

router = APIRouter(prefix="/menu", tags=["menu"])
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf",
}


# ─── Auth helper ──────────────────────────────────────────────────────────────

def _get_restaurant_id(authorization: Optional[str]) -> str:
    token = extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")
    sb = get_supabase()
    payload = verify_supabase_token(token)
    res = sb.table("restaurants").select("id").eq("owner_id", payload["sub"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return res.data[0]["id"]


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


# ─── CRUD ─────────────────────────────────────────────────────────────────────

@router.get("/dishes")
async def list_dishes(authorization: Optional[str] = Header(None)):
    restaurant_id = _get_restaurant_id(authorization)
    sb = get_supabase()
    res = sb.table("dishes").select(
        "*, dish_ingredients(*, products(name, unit))"
    ).eq("restaurant_id", restaurant_id).order("category").order("name").execute()
    return res.data or []


@router.post("/dishes", status_code=201)
async def create_dish(body: DishCreate, authorization: Optional[str] = Header(None)):
    restaurant_id = _get_restaurant_id(authorization)
    sb = get_supabase()

    dish_res = sb.table("dishes").insert({
        "restaurant_id": restaurant_id,
        "name": body.name,
        "description": body.description,
        "category": body.category,
        "price": body.price,
        "image_url": body.image_url,
    }).execute()

    dish = dish_res.data[0]

    if body.ingredients:
        sb.table("dish_ingredients").insert([
            {"dish_id": dish["id"], "product_id": ing.product_id,
             "quantity": ing.quantity, "unit": ing.unit}
            for ing in body.ingredients
        ]).execute()

    return dish


@router.put("/dishes/{dish_id}")
async def update_dish(
    dish_id: str, body: DishUpdate,
    authorization: Optional[str] = Header(None)
):
    restaurant_id = _get_restaurant_id(authorization)
    sb = get_supabase()

    update_data = {k: v for k, v in body.model_dump(exclude={"ingredients"}).items() if v is not None}
    if update_data:
        from datetime import datetime, timezone
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        sb.table("dishes").update(update_data).eq("id", dish_id).eq(
            "restaurant_id", restaurant_id
        ).execute()

    if body.ingredients is not None:
        sb.table("dish_ingredients").delete().eq("dish_id", dish_id).execute()
        if body.ingredients:
            sb.table("dish_ingredients").insert([
                {"dish_id": dish_id, "product_id": ing.product_id,
                 "quantity": ing.quantity, "unit": ing.unit}
                for ing in body.ingredients
            ]).execute()

    res = sb.table("dishes").select(
        "*, dish_ingredients(*, products(name, unit))"
    ).eq("id", dish_id).limit(1).execute()
    return res.data[0] if res.data else {}


@router.delete("/dishes/{dish_id}", status_code=204)
async def delete_dish(dish_id: str, authorization: Optional[str] = Header(None)):
    restaurant_id = _get_restaurant_id(authorization)
    sb = get_supabase()
    sb.table("dishes").update({"active": False}).eq("id", dish_id).eq(
        "restaurant_id", restaurant_id
    ).execute()


# ─── Importar lote desde OCR ──────────────────────────────────────────────────

@router.post("/dishes/import", status_code=201)
async def import_dishes(body: DishesImport, authorization: Optional[str] = Header(None)):
    """Guarda en lote los platos confirmados por el usuario tras el scan."""
    restaurant_id = _get_restaurant_id(authorization)
    sb = get_supabase()

    created = []
    for dish in body.dishes:
        res = sb.table("dishes").insert({
            "restaurant_id": restaurant_id,
            "name": dish.name,
            "description": dish.description or "",
            "category": dish.category,
            "price": dish.price,
        }).execute()
        if res.data:
            created.append(res.data[0])

    return {"imported": len(created), "dishes": created}


# ─── OCR Scan ─────────────────────────────────────────────────────────────────

@router.post("/scan")
async def scan_menu(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    """
    Recibe imagen (JPG/PNG/WEBP) o PDF del menú.
    Devuelve lista de platos detectados para que el usuario confirme.
    """
    _get_restaurant_id(authorization)   # valida que sea owner

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Formato no soportado. Usa: JPG, PNG, WEBP o PDF."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:   # 20 MB máx
        raise HTTPException(status_code=413, detail="Archivo demasiado grande (máx 20 MB)")

    try:
        from services.menu_ocr import scan_menu as ocr_scan
        result = ocr_scan(file_bytes, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar el archivo")

    return result
