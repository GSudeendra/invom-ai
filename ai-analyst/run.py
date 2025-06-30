#!/usr/bin/env python3
"""
Run script for the AI Analyst Financial Analytics API.

Usage:
    python run.py
    python run.py --port 8000
    python run.py --host 127.0.0.1 --port 7000
"""

import argparse
import os
import sys
from pathlib import Path

def main():
    """Start the FastAPI server."""
    parser = argparse.ArgumentParser(description="AI Analyst Financial Analytics API")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=3002, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", default=True, help="Enable auto-reload")
    parser.add_argument("--log-level", default="info", help="Log level")
    
    args = parser.parse_args()
    
    # Add the src directory to the Python path
    src_path = Path(__file__).parent / "src"
    sys.path.insert(0, str(src_path))
    
    print(f"🚀 Starting AI Analyst Financial Analytics API")
    print(f"📍 Host: {args.host}")
    print(f"🔌 Port: {args.port}")
    print(f"🔄 Reload: {args.reload}")
    print(f"📝 Log Level: {args.log_level}")
    print(f"📚 API Documentation: http://{args.host}:{args.port}/docs")
    print(f"📖 ReDoc Documentation: http://{args.host}:{args.port}/redoc")
    print(f"🔍 OpenAPI Spec: http://{args.host}:{args.port}/openapi.json")
    print(f"❤️  Health Check: http://{args.host}:{args.port}/health")
    print("-" * 60)
    
    # Import and run uvicorn
    try:
        import uvicorn
        uvicorn.run(
            "src.api.server:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level=args.log_level,
            access_log=True
        )
    except ImportError:
        print("❌ Error: uvicorn not found. Please install it with:")
        print("   pip install uvicorn[standard]")
        sys.exit(1)

if __name__ == "__main__":
    main() 