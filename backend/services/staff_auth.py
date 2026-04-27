from datetime import datetime, timezone, timedelta
from typing import Optional
from jose import jwt, JWTError

STAFF_TOKEN_TYPE = "staff_session"
ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 16  # un turno de trabajo


def create_staff_session_token(role: str, restaurant_id: str, code_id: str, secret: str) -> str:
    payload = {
        "type": STAFF_TOKEN_TYPE,
        "role": role,
        "restaurant_id": restaurant_id,
        "code_id": code_id,
        "exp": (datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)).timestamp(),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def decode_staff_session_token(token: str, secret: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        if payload.get("type") != STAFF_TOKEN_TYPE:
            return None
        return payload
    except JWTError:
        return None
