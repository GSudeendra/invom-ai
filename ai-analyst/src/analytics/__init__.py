"""
AI Analyst - Financial Analytics Framework

A comprehensive financial analytics system with risk assessment,
fund quality evaluation, and portfolio analysis capabilities.
"""

from .core import FinancialAnalytics
from .api_client import APIClient, DataProvider
from .risk_analyzer import RiskAnalyzer
from .quality_evaluator import QualityEvaluator
from .portfolio_analyzer import PortfolioAnalyzer
from .market_data import MarketDataProvider
from .models import (
    RiskMetrics,
    QualityMetrics,
    PortfolioMetrics,
    IntelligenceScore,
    SectorAllocation,
    Recommendation
)

__version__ = "0.1.0"
__author__ = "AI Analyst Team"

__all__ = [
    "FinancialAnalytics",
    "APIClient",
    "DataProvider", 
    "RiskAnalyzer",
    "QualityEvaluator",
    "PortfolioAnalyzer",
    "MarketDataProvider",
    "RiskMetrics",
    "QualityMetrics", 
    "PortfolioMetrics",
    "IntelligenceScore",
    "SectorAllocation",
    "Recommendation"
] 