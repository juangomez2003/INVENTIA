import sys
import os

# Add backend root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app  # Vercel @vercel/python runtime supports ASGI natively
