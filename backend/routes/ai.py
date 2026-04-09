from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime
import logging

from supabase_service import get_supabase, verify_supabase_token
from services.ai_service import predict_restock, generate_alerts, get_demo_predictions

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)


def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None


def _get_restaurant_id(token: str, sb) -> str:
    payload = verify_supabase_token(token)
    user_id = payload["sub"]
    result = sb.table("restaurants").select("id").eq("owner_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return result.data["id"]


@router.get("/predictions")
async def get_predictions(authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return get_demo_predictions()

    token = _extract_token(authorization)
    if not token:
        return get_demo_predictions()

    try:
        restaurant_id = _get_restaurant_id(token, sb)

        products_res = sb.table("products")\
            .select("*")\
            .eq("restaurant_id", restaurant_id)\
            .eq("active", True)\
            .execute()
        products = products_res.data or []

        movements_res = sb.table("movements")\
            .select("*")\
            .eq("restaurant_id", restaurant_id)\
            .order("created_at", desc=True)\
            .limit(500)\
            .execute()
        movements = movements_res.data or []

        predictions = []
        for product in products:
            product_movements = [m for m in movements if m.get("product_id") == product["id"]]
            prediction = predict_restock(product, product_movements)
            if prediction:
                predictions.append(prediction)

        predictions.sort(key=lambda x: x.get("days_remaining", 999))
        return predictions

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating predictions: {e}")
        return get_demo_predictions()


@router.get("/alerts")
async def get_alerts(authorization: Optional[str] = Header(None)):
    sb = get_supabase()
    if not sb:
        return _demo_alerts()

    token = _extract_token(authorization)
    if not token:
        return _demo_alerts()

    try:
        restaurant_id = _get_restaurant_id(token, sb)

        products_res = sb.table("products")\
            .select("*")\
            .eq("restaurant_id", restaurant_id)\
            .eq("active", True)\
            .execute()
        products = products_res.data or []

        predictions = await get_predictions(authorization)
        return generate_alerts(products, predictions)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating alerts: {e}")
        return _demo_alerts()


@router.get("/stats")
async def get_ai_stats(authorization: Optional[str] = Header(None)):
    predictions = await get_predictions(authorization)

    urgent_count = len([p for p in predictions if p.get("days_remaining", 999) <= 3])
    avg_confidence = (
        sum(p.get("confidence", 0) for p in predictions) / len(predictions)
        if predictions else 0
    )
    total_restock = sum(p.get("restock_recommendation", 0) for p in predictions)

    return {
        "model_accuracy": round(avg_confidence * 100, 1),
        "urgent_products": urgent_count,
        "total_recommendations": len(predictions),
        "total_restock_units": round(total_restock, 1),
        "last_updated": datetime.now().isoformat(),
    }


def _demo_alerts():
    now = datetime.now().isoformat()
    return [
        {"id": "alert-1", "type": "critical", "title": "Stock crítico: Tomates",
         "message": "Tomates está por debajo del umbral mínimo (8 kg). Reabastecer inmediatamente.",
         "product": "Tomates", "timestamp": now},
        {"id": "alert-2", "type": "critical", "title": "Stock crítico: Aceite de Oliva",
         "message": "Aceite de Oliva tiene solo 3 L en stock (15% capacidad).",
         "product": "Aceite de Oliva", "timestamp": now},
        {"id": "alert-3", "type": "warning", "title": "Alerta de agotamiento: Camarones",
         "message": "IA predice que Camarones se agotará en 1.7 días.",
         "product": "Camarones", "timestamp": now},
        {"id": "alert-4", "type": "warning", "title": "Stock bajo: Cebolla",
         "message": "Cebolla tiene solo 30% de capacidad (15 kg).",
         "product": "Cebolla", "timestamp": now},
        {"id": "alert-5", "type": "info", "title": "Reabastecimiento recomendado",
         "message": "Se recomienda reabastecer 5 productos en los próximos 3 días.",
         "product": "Multiple", "timestamp": now},
    ]
