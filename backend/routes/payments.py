from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging
import os

from config import settings

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Precios en centavos de COP (COP * 100)
PLAN_PRICES: dict[str, int] = {
    "starter":    4_990_000,   # $49.900 COP
    "pro":        9_990_000,   # $99.900 COP
    "enterprise": 24_990_000,  # $249.900 COP
}


class CreateIntentRequest(BaseModel):
    plan: str
    email: str


def get_stripe():
    """Devuelve el módulo stripe configurado o None si no está disponible."""
    secret_key = settings.stripe_secret_key
    if not secret_key:
        return None
    try:
        import stripe
        stripe.api_key = secret_key
        return stripe
    except ImportError:
        logger.warning("Paquete 'stripe' no instalado")
        return None


@router.post("/create-intent")
async def create_payment_intent(body: CreateIntentRequest):
    plan_key = body.plan.lower()
    if plan_key not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail=f"Plan '{plan_key}' no existe")

    amount = PLAN_PRICES[plan_key]
    stripe = get_stripe()

    # Modo demo: devuelve un client_secret falso para testing de UI
    if stripe is None:
        logger.warning("STRIPE_SECRET_KEY no configurada — retornando client_secret demo")
        return {
            "client_secret": "pi_demo_secret_inventia",
            "amount": amount,
            "currency": "cop",
            "plan": plan_key,
            "demo": True,
        }

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="cop",
            receipt_email=body.email,
            metadata={"plan": plan_key},
            automatic_payment_methods={"enabled": True},
        )
        return {
            "client_secret": intent.client_secret,
            "amount": intent.amount,
            "currency": intent.currency,
            "plan": plan_key,
        }
    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/webhook")
async def stripe_webhook():
    """
    Endpoint para webhooks de Stripe.
    Configura en Stripe Dashboard → Webhooks → Add endpoint:
      URL: https://tu-dominio.com/api/v1/payments/webhook
      Eventos: payment_intent.succeeded, customer.subscription.deleted
    """
    # TODO: implementar verificación de firma y lógica de negocio
    return {"status": "ok"}
