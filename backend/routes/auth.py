from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime
import logging

from models import UserCreate
from firebase_service import get_db, get_auth

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register")
async def register_user(user: UserCreate):
    db = get_db()
    auth = get_auth()

    if db is None:
        return {
            "message": "Usuario registrado (demo mode)",
            "user": {"id": "demo-user", "email": user.email, "name": user.name}
        }

    try:
        # Create user in Firebase Auth
        firebase_user = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.name,
        )

        # Create restaurant document in Firestore
        restaurant_ref = db.collection("restaurants").document(firebase_user.uid)
        restaurant_ref.set({
            "name": user.restaurant_name,
            "owner_uid": firebase_user.uid,
            "owner_email": user.email,
            "owner_name": user.name,
            "created_at": datetime.now().isoformat(),
            "settings": {
                "name": user.restaurant_name,
                "alert_threshold": 20,
                "notify_email": True,
                "notify_whatsapp": False,
                "auto_restock": False,
            }
        })

        # Set custom claims
        auth.set_custom_user_claims(firebase_user.uid, {
            "restaurant_id": firebase_user.uid,
            "role": "admin"
        })

        return {
            "message": "Usuario registrado exitosamente",
            "user": {
                "id": firebase_user.uid,
                "email": firebase_user.email,
                "name": firebase_user.display_name,
            }
        }
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me")
async def get_current_user_info(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    auth = get_auth()
    db = get_db()

    try:
        token = authorization.split(" ")[1]
        decoded = auth.verify_id_token(token)
        uid = decoded.get("uid")

        user_record = auth.get_user(uid)

        restaurant_data = {}
        if db:
            restaurant_doc = db.collection("restaurants").document(uid).get()
            if restaurant_doc.exists:
                restaurant_data = restaurant_doc.to_dict()

        return {
            "id": uid,
            "email": user_record.email,
            "name": user_record.display_name or user_record.email,
            "role": decoded.get("role", "admin"),
            "restaurant": restaurant_data.get("name", "Mi Restaurante"),
        }
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/verify-token")
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    auth_client = get_auth()
    try:
        token = authorization.split(" ")[1]
        decoded = auth_client.verify_id_token(token)
        return {"valid": True, "uid": decoded.get("uid")}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido")
