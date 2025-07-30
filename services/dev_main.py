#!/usr/bin/env python3
"""
Development server entry point for Solar Website Builder
Runs without database dependencies for quick local testing
"""

import os
import sys
from pathlib import Path

# Add the services directory to Python path
services_dir = Path(__file__).parent
sys.path.insert(0, str(services_dir))

# Set development environment
os.environ.setdefault("ENV", "sandbox")
os.environ.setdefault("JWT_SECRET", "dev-jwt-secret-for-local-only")
os.environ.setdefault("PUBLIC_DOMAIN", "localhost:8000")

try:
    # Try to import the full application
    from api.bootstrap import app
    print("✅ Full application loaded successfully")
except ImportError as e:
    print(f"⚠️  Database dependencies not available: {e}")
    print("🚀 Starting minimal API server...")
    
    # Create a minimal FastAPI app for development
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    
    app = FastAPI(
        title="Solar Website Builder API (Development)",
        description="Minimal API server for local development",
        version="1.0.0-dev"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {
            "message": "Solar Website Builder API (Development Mode)",
            "status": "ready",
            "mode": "development",
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "mode": "development"
        }
    
    @app.get("/api/websites")
    async def list_websites():
        return {
            "websites": [],
            "message": "Development mode - no database connected"
        }
    
    print("✅ Minimal development server ready")

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    env = os.getenv("ENV", "sandbox")
    is_development = env in ["sandbox", "development"]
    
    print(f"🚀 Starting Solar Website Builder API ({env} mode)")
    print(f"📱 Frontend should connect to: http://localhost:8000")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0" if is_development else "127.0.0.1",
        port=int(os.getenv("PORT", 8000)),
        reload=is_development,
        log_level=os.getenv("LOG_LEVEL", "info"),
        access_log=is_development,
    )