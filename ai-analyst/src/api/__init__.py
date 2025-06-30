"""
API module for the AI Analyst financial analytics system.
"""

from .server import app
from .routes import router

__all__ = ["app", "router"] 