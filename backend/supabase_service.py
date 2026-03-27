from supabase import create_client, Client
from config import settings
import logging

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
