"""
Vercel Python serverless function — entry point para FastAPI.
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from main import app  # noqa: F401
