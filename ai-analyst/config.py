"""
Configuration settings for the AI Analyst Financial Analytics API.
"""

import os
from typing import Optional

class Config:
    """Application configuration."""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 3002))
    RELOAD: bool = os.getenv("RELOAD", "true").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # API settings
    API_TITLE: str = "AI Analyst Financial Analytics API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = """
    Comprehensive financial analytics system with risk assessment, 
    fund quality evaluation, and portfolio analysis capabilities.
    """
    
    # Data provider settings
    DEFAULT_DATA_PROVIDER: str = "yahoo"
    ALPHA_VANTAGE_API_KEY: Optional[str] = os.getenv("ALPHA_VANTAGE_API_KEY")
    
    # Cache settings
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes
    CACHE_DIR: str = os.getenv("CACHE_DIR", "cache")
    
    # Analytics settings
    DEFAULT_RISK_FREE_RATE: float = float(os.getenv("DEFAULT_RISK_FREE_RATE", "0.02"))
    DEFAULT_ANALYSIS_PERIOD: str = os.getenv("DEFAULT_ANALYSIS_PERIOD", "1y")
    
    # CORS settings
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))
    
    # Logging
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")
    
    @classmethod
    def get_database_url(cls) -> str:
        """Get database URL from environment."""
        return os.getenv("DATABASE_URL", "sqlite:///./ai_analyst.db")
    
    @classmethod
    def is_development(cls) -> bool:
        """Check if running in development mode."""
        return os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production mode."""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"

# Create a global config instance
config = Config() 