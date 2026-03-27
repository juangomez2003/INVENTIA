import firebase_admin
from firebase_admin import credentials, firestore, auth
from config import settings
import logging

logger = logging.getLogger(__name__)

_db = None
_app = None

def init_firebase():
    global _db, _app
    try:
        if not firebase_admin._apps:
            cred_dict = settings.firebase_credentials_dict
            if cred_dict.get("project_id"):
                cred = credentials.Certificate(cred_dict)
                _app = firebase_admin.initialize_app(cred)
                logger.info(f"Firebase initialized for project: {cred_dict['project_id']}")
            else:
                logger.warning("Firebase credentials not configured - running in demo mode")
                return None
        _db = firestore.client()
        return _db
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return None

def get_db():
    global _db
    if _db is None:
        _db = init_firebase()
    return _db

def get_auth():
    return auth
