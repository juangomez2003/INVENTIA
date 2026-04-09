"""
Vercel serverless entry point — wraps the FastAPI app.
"""
import sys
import os

# Agregar el backend al path de Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app  # noqa: F401 — Vercel busca 'app' en este módulo
