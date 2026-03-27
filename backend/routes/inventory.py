from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List
from datetime import datetime
import logging

from models import Product, ProductCreate, ProductUpdate, StockMovement
from firebase_service import get_db, get_auth

router = APIRouter(prefix="/inventory", tags=["inventory"])
logger = logging.getLogger(__name__)


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ")[1]
    try:
        auth = get_auth()
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Token inválido")


def get_restaurant_id(user: dict) -> str:
    return user.get("restaurant_id") or user.get("uid", "demo")


@router.get("/products", response_model=List[dict])
async def get_products(authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        # Demo mode - return mock products
        return get_demo_products()

    try:
        user = await get_current_user(authorization)
        restaurant_id = get_restaurant_id(user)
        products_ref = db.collection("restaurants").document(restaurant_id).collection("products")
        docs = products_ref.stream()
        products = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            products.append(data)
        return products
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=dict, status_code=201)
async def create_product(product: ProductCreate, authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return {"id": "demo-new", **product.model_dump(), "last_updated": datetime.now().isoformat()}

    try:
        user = await get_current_user(authorization)
        restaurant_id = get_restaurant_id(user)
        products_ref = db.collection("restaurants").document(restaurant_id).collection("products")

        data = product.model_dump()
        data["last_updated"] = datetime.now().isoformat()
        data["restaurant_id"] = restaurant_id

        doc_ref = products_ref.add(data)
        data["id"] = doc_ref[1].id
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}", response_model=dict)
async def update_product(product_id: str, product: ProductUpdate, authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return {"id": product_id, **product.model_dump(exclude_none=True), "last_updated": datetime.now().isoformat()}

    try:
        user = await get_current_user(authorization)
        restaurant_id = get_restaurant_id(user)
        doc_ref = db.collection("restaurants").document(restaurant_id).collection("products").document(product_id)

        update_data = {k: v for k, v in product.model_dump().items() if v is not None}
        update_data["last_updated"] = datetime.now().isoformat()

        doc_ref.update(update_data)
        doc = doc_ref.get()
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return {"message": "Producto eliminado (demo mode)"}

    try:
        user = await get_current_user(authorization)
        restaurant_id = get_restaurant_id(user)
        doc_ref = db.collection("restaurants").document(restaurant_id).collection("products").document(product_id)
        doc_ref.delete()
        return {"message": "Producto eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/movements")
async def record_movement(movement: StockMovement, authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return {"message": "Movimiento registrado (demo mode)", "id": "demo-movement"}

    try:
        user = await get_current_user(authorization)
        restaurant_id = get_restaurant_id(user)

        movements_ref = db.collection("restaurants").document(restaurant_id).collection("movements")
        data = movement.model_dump()
        data["timestamp"] = datetime.now().isoformat()
        data["restaurant_id"] = restaurant_id
        data["user_id"] = user.get("uid")

        doc_ref = movements_ref.add(data)

        # Update product quantity
        product_ref = db.collection("restaurants").document(restaurant_id).collection("products").document(movement.product_id)
        product_doc = product_ref.get()
        if product_doc.exists:
            current_qty = product_doc.to_dict().get("quantity", 0)
            if movement.movement_type == "entrada":
                new_qty = current_qty + movement.quantity
            elif movement.movement_type == "salida":
                new_qty = max(0, current_qty - movement.quantity)
            else:  # ajuste
                new_qty = movement.quantity
            product_ref.update({"quantity": new_qty, "last_updated": datetime.now().isoformat()})

        return {"message": "Movimiento registrado", "id": doc_ref[1].id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording movement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def get_demo_products():
    return [
        {"id": "1", "name": "Pollo", "category": "Carnes", "quantity": 45, "unit": "kg", "min_threshold": 20, "max_capacity": 100, "price_per_unit": 8500, "supplier": "Carnes Premium", "last_updated": datetime.now().isoformat()},
        {"id": "2", "name": "Res", "category": "Carnes", "quantity": 30, "unit": "kg", "min_threshold": 15, "max_capacity": 80, "price_per_unit": 12000, "supplier": "Carnes Premium", "last_updated": datetime.now().isoformat()},
        {"id": "3", "name": "Tomates", "category": "Verduras", "quantity": 8, "unit": "kg", "min_threshold": 10, "max_capacity": 50, "price_per_unit": 2500, "supplier": "Verduras Frescas", "last_updated": datetime.now().isoformat()},
        {"id": "4", "name": "Cebolla", "category": "Verduras", "quantity": 15, "unit": "kg", "min_threshold": 8, "max_capacity": 40, "price_per_unit": 1800, "supplier": "Verduras Frescas", "last_updated": datetime.now().isoformat()},
        {"id": "5", "name": "Aceite de Oliva", "category": "Aceites", "quantity": 3, "unit": "L", "min_threshold": 5, "max_capacity": 20, "price_per_unit": 15000, "supplier": "Distribuidora Gourmet", "last_updated": datetime.now().isoformat()},
    ]
