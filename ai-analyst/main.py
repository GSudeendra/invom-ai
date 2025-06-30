#!/usr/bin/env python3
"""
Main entry point for the AI Analyst Financial Analytics API.

This script starts the FastAPI server on port 3002 with Swagger documentation.
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the src directory to the Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from src.api.server import app

def main():
    """Start the FastAPI server."""
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 3002))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info")
    
    print(f"🚀 Starting AI Analyst Financial Analytics API")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔄 Reload: {reload}")
    print(f"📝 Log Level: {log_level}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"📖 ReDoc Documentation: http://{host}:{port}/redoc")
    print(f"🔍 OpenAPI Spec: http://{host}:{port}/openapi.json")
    print(f"❤️  Health Check: http://{host}:{port}/health")
    print("-" * 60)
    
    # Start the server
    uvicorn.run(
        "src.api.server:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level,
        access_log=True
    )

if __name__ == "__main__":
    main() 