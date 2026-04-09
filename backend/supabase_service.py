from supabase import create_client, Client
from config import settings
import logging
import base64
import json

logger = logging.getLogger(__name__)
_client: Client | None = None


def get_supabase() -> Client | None:
    global _client
    if _client is None and settings.supabase_url and settings.supabase_service_key:
        try:
            _client = create_client(settings.supabase_url, settings.supabase_service_key)
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to init Supabase: {e}")
    return _client


def is_supabase_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_key)


def _decode_jwt_payload(token: str) -> dict:
    """Decodifica el payload del JWT sin verificar firma."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("JWT malformado")
        payload_b64 = parts[1]
        # Agregar padding si falta
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
        return payload
    except Exception as e:
        raise ValueError(f"No se pudo decodificar el token: {e}")


def verify_supabase_token(token: str) -> dict:
    """
    Verifica un JWT de Supabase Auth y retorna el payload.
    Usa sb.auth.get_user() para validar contra Supabase.
    Lanza ValueError si el token es inválido.
    """
    sb = get_supabase()

    if sb:
        try:
            response = sb.auth.get_user(token)
            if not response or not response.user:
                raise ValueError("Token inválido")
            user = response.user
            return {
                "sub":           user.id,
                "email":         user.email or "",
                "user_metadata": user.user_metadata or {},
                "app_metadata":  user.app_metadata or {},
            }
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Token inválido: {e}")

    # Fallback sin Supabase: decodificar payload sin verificar
    # (solo válido en modo demo donde no hay auth real)
    payload = _decode_jwt_payload(token)
    if "sub" not in payload:
        raise ValueError("Token sin campo 'sub'")
    return payload


def get_user_id(token: str) -> str:
    """Retorna el UUID del usuario desde el token de Supabase."""
    payload = verify_supabase_token(token)
    return payload["sub"]
