try:
    import numpy as np
except ImportError:
    import math
    class np:  # type: ignore
        @staticmethod
        def mean(lst): return sum(lst) / len(lst) if lst else 0.0
        @staticmethod
        def std(lst):
            if not lst: return 0.0
            m = sum(lst) / len(lst)
            return math.sqrt(sum((x - m) ** 2 for x in lst) / len(lst))
        @staticmethod
        def clip(val, lo, hi): return max(lo, min(hi, val))
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def calculate_daily_consumption(movements: List[Dict]) -> float:
    """Calculate average daily consumption from movement history."""
    if not movements:
        return 0.0

    outflows = [m["quantity"] for m in movements if m.get("movement_type") == "salida"]
    if not outflows:
        return 0.0

    # Group by day and sum
    daily_totals = {}
    for m in movements:
        if m.get("movement_type") == "salida":
            date_str = m.get("timestamp", "")[:10]  # YYYY-MM-DD
            daily_totals[date_str] = daily_totals.get(date_str, 0) + m["quantity"]

    if not daily_totals:
        return 0.0

    return sum(daily_totals.values()) / len(daily_totals)


def predict_restock(product: Dict, movements: List[Dict]) -> Dict:
    """Generate AI prediction for a product."""
    try:
        daily_consumption = calculate_daily_consumption(movements)

        if daily_consumption == 0:
            # Estimate from product data if no movement history
            daily_consumption = max(product.get("quantity", 0) * 0.05, 0.1)

        current_stock = product.get("quantity", 0)
        min_threshold = product.get("min_threshold", 0)
        max_capacity = product.get("max_capacity", 100)

        days_remaining = current_stock / daily_consumption if daily_consumption > 0 else 999

        # Calculate restock recommendation
        restock_recommendation = max_capacity - current_stock
        if restock_recommendation < 0:
            restock_recommendation = 0

        # Calculate confidence based on data quality
        confidence = min(0.95, 0.60 + (len(movements) / 100) * 0.35)

        # Determine urgency
        threshold_percentage = (current_stock / max_capacity * 100) if max_capacity > 0 else 100

        return {
            "product": product.get("name", ""),
            "product_id": product.get("id", ""),
            "current_stock": current_stock,
            "daily_consumption": round(daily_consumption, 2),
            "days_remaining": round(days_remaining, 1),
            "restock_recommendation": round(restock_recommendation, 1),
            "confidence": round(confidence, 2),
            "unit": product.get("unit", ""),
            "threshold_percentage": round(threshold_percentage, 1),
        }
    except Exception as e:
        logger.error(f"Error generating prediction for {product.get('name')}: {e}")
        return {}


def generate_alerts(products: List[Dict], predictions: List[Dict]) -> List[Dict]:
    """Generate AI alerts based on current stock levels and predictions."""
    alerts = []
    now = datetime.now().isoformat()

    for product in products:
        qty = product.get("quantity", 0)
        min_threshold = product.get("min_threshold", 0)
        max_capacity = product.get("max_capacity", 100)
        name = product.get("name", "")

        stock_percentage = (qty / max_capacity * 100) if max_capacity > 0 else 100

        if qty <= 0:
            alerts.append({
                "id": f"alert-{product.get('id', '')}-empty",
                "type": "critical",
                "title": f"Stock agotado: {name}",
                "message": f"{name} está completamente agotado. Requiere reabastecimiento urgente.",
                "product": name,
                "timestamp": now,
            })
        elif qty <= min_threshold:
            alerts.append({
                "id": f"alert-{product.get('id', '')}-critical",
                "type": "critical",
                "title": f"Stock crítico: {name}",
                "message": f"{name} está por debajo del umbral mínimo ({qty} {product.get('unit', '')}). Reabastecer inmediatamente.",
                "product": name,
                "timestamp": now,
            })
        elif stock_percentage <= 30:
            alerts.append({
                "id": f"alert-{product.get('id', '')}-warning",
                "type": "warning",
                "title": f"Stock bajo: {name}",
                "message": f"{name} tiene solo {round(stock_percentage)}% de capacidad ({qty} {product.get('unit', '')}).",
                "product": name,
                "timestamp": now,
            })

    # Check predictions for upcoming shortages
    for pred in predictions:
        if pred.get("days_remaining", 999) <= 3 and pred.get("days_remaining", 999) > 0:
            product_name = pred.get("product", "")
            days = pred.get("days_remaining", 0)
            # Avoid duplicate alerts
            existing = [a for a in alerts if a.get("product") == product_name]
            if not existing:
                alerts.append({
                    "id": f"alert-pred-{pred.get('product_id', '')}-days",
                    "type": "warning",
                    "title": f"Alerta de agotamiento: {product_name}",
                    "message": f"IA predice que {product_name} se agotará en {days} días.",
                    "product": product_name,
                    "timestamp": datetime.now().isoformat(),
                })

    return alerts[:10]  # Return top 10 most important alerts


def get_demo_predictions() -> List[Dict]:
    """Return demo predictions when Firebase is not configured."""
    return [
        {"product": "Pollo", "product_id": "demo-1", "current_stock": 15, "daily_consumption": 8.5, "days_remaining": 1.8, "restock_recommendation": 85, "confidence": 0.92, "unit": "kg"},
        {"product": "Tomates", "product_id": "demo-2", "current_stock": 8, "daily_consumption": 4.2, "days_remaining": 1.9, "restock_recommendation": 42, "confidence": 0.88, "unit": "kg"},
        {"product": "Aceite de Oliva", "product_id": "demo-3", "current_stock": 3, "daily_consumption": 0.8, "days_remaining": 3.75, "restock_recommendation": 17, "confidence": 0.85, "unit": "L"},
        {"product": "Cebolla", "product_id": "demo-4", "current_stock": 12, "daily_consumption": 2.5, "days_remaining": 4.8, "restock_recommendation": 28, "confidence": 0.90, "unit": "kg"},
        {"product": "Camarones", "product_id": "demo-5", "current_stock": 5, "daily_consumption": 3.0, "days_remaining": 1.7, "restock_recommendation": 55, "confidence": 0.87, "unit": "kg"},
    ]
