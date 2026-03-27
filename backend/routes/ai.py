from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from datetime import datetime
import logging

from firebase_service import get_db, get_auth
from services.ai_service import predict_restock, generate_alerts, get_demo_predictions
from routes.inventory import get_demo_products

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)


@router.get("/predictions")
async def get_predictions(authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return get_demo_predictions()

    try:
        auth = get_auth()
        if not authorization or not authorization.startswith("Bearer "):
            return get_demo_predictions()

        token = authorization.split(" ")[1]
        decoded = auth.verify_id_token(token)
        restaurant_id = decoded.get("restaurant_id") or decoded.get("uid", "demo")

        # Get products
        products_ref = db.collection("restaurants").document(restaurant_id).collection("products")
        products = [{"id": d.id, **d.to_dict()} for d in products_ref.stream()]

        # Get recent movements (last 30 days)
        movements_ref = db.collection("restaurants").document(restaurant_id).collection("movements")
        movements = [d.to_dict() for d in movements_ref.order_by("timestamp", direction="DESCENDING").limit(500).stream()]

        predictions = []
        for product in products:
            product_movements = [m for m in movements if m.get("product_id") == product["id"]]
            prediction = predict_restock(product, product_movements)
            if prediction:
                predictions.append(prediction)

        # Sort by days_remaining (most urgent first)
        predictions.sort(key=lambda x: x.get("days_remaining", 999))
        return predictions

    except Exception as e:
        logger.error(f"Error generating predictions: {e}")
        return get_demo_predictions()


@router.get("/alerts")
async def get_alerts(authorization: Optional[str] = Header(None)):
    db = get_db()
    if db is None:
        return get_demo_alerts()

    try:
        auth = get_auth()
        if not authorization or not authorization.startswith("Bearer "):
            return get_demo_alerts()

        token = authorization.split(" ")[1]
        decoded = auth.verify_id_token(token)
        restaurant_id = decoded.get("restaurant_id") or decoded.get("uid", "demo")

        products_ref = db.collection("restaurants").document(restaurant_id).collection("products")
        products = [{"id": d.id, **d.to_dict()} for d in products_ref.stream()]

        predictions_response = await get_predictions(authorization)
        alerts = generate_alerts(products, predictions_response)
        return alerts

    except Exception as e:
        logger.error(f"Error generating alerts: {e}")
        return get_demo_alerts()


@router.get("/stats")
async def get_ai_stats(authorization: Optional[str] = Header(None)):
    predictions = await get_predictions(authorization)

    urgent_count = len([p for p in predictions if p.get("days_remaining", 999) <= 3])
    avg_confidence = sum(p.get("confidence", 0) for p in predictions) / len(predictions) if predictions else 0
    total_restock = sum(p.get("restock_recommendation", 0) for p in predictions)

    return {
        "model_accuracy": round(avg_confidence * 100, 1),
        "urgent_products": urgent_count,
        "total_recommendations": len(predictions),
        "total_restock_units": round(total_restock, 1),
        "last_updated": datetime.now().isoformat(),
    }


def get_demo_alerts():
    now = datetime.now().isoformat()
    return [
        {"id": "alert-1", "type": "critical", "title": "Stock crítico: Tomates", "message": "Tomates está por debajo del umbral mínimo (8 kg). Reabastecer inmediatamente.", "product": "Tomates", "timestamp": now},
        {"id": "alert-2", "type": "critical", "title": "Stock crítico: Aceite de Oliva", "message": "Aceite de Oliva tiene solo 3 L en stock (15% capacidad).", "product": "Aceite de Oliva", "timestamp": now},
        {"id": "alert-3", "type": "warning", "title": "Alerta de agotamiento: Camarones", "message": "IA predice que Camarones se agotará en 1.7 días.", "product": "Camarones", "timestamp": now},
        {"id": "alert-4", "type": "warning", "title": "Stock bajo: Cebolla", "message": "Cebolla tiene solo 30% de capacidad (15 kg).", "product": "Cebolla", "timestamp": now},
        {"id": "alert-5", "type": "info", "title": "Reabastecimiento recomendado", "message": "Se recomienda reabastecer 5 productos en los próximos 3 días.", "product": "Multiple", "timestamp": now},
    ]
