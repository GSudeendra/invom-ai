"""
FastAPI server for the AI Analyst financial analytics system.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from .routes import router

# Create FastAPI app
app = FastAPI(
    title="AI Analyst Financial Analytics API",
    description="""
    Comprehensive financial analytics system with risk assessment, 
    fund quality evaluation, and portfolio analysis capabilities.
    
    ## Features
    
    * **Risk Analysis** - Calculate volatility, VaR, drawdown, and other risk metrics
    * **Quality Evaluation** - Assess financial instrument quality and performance
    * **Portfolio Analysis** - Analyze portfolio allocation, diversification, and optimization
    * **Market Data** - Fetch and manage market data from multiple providers
    * **Intelligence Scoring** - Generate portfolio intelligence scores and recommendations
    
    ## Getting Started
    
    1. Use the `/docs` endpoint to explore the API interactively
    2. Use the `/redoc` endpoint for alternative documentation
    3. All endpoints support async operations for better performance
    """,
    version="1.0.0",
    contact={
        "name": "AI Analyst Team",
        "email": "support@ai-analyst.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "defaultModelExpandDepth": 1,
        "displayRequestDuration": True,
        "docExpansion": "list",
        "filter": True,
        "showExtensions": True,
        "showCommonExtensions": True,
        "tryItOutEnabled": True,
    }
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API status.
    
    Returns:
        dict: API status information
    """
    return {
        "status": "healthy",
        "service": "AI Analyst Financial Analytics API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.
    
    Returns:
        dict: API information and available endpoints
    """
    return {
        "message": "AI Analyst Financial Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
        "health": "/health"
    }

# Serve static files for OpenAPI spec
resources_path = Path(__file__).parent.parent.parent / "resources"
if resources_path.exists():
    app.mount("/resources", StaticFiles(directory=str(resources_path)), name="resources")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.server:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    ) 