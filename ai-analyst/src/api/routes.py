"""
API routes for the AI Analyst financial analytics system.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from ..analytics import FinancialAnalytics
from ..analytics.models import (
    AnalysisRequest, 
    AnalysisResponse, 
    RiskMetrics, 
    QualityMetrics, 
    PortfolioMetrics,
    IntelligenceScore,
    Recommendation,
    MarketData
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Global analytics instance
analytics = None

async def get_analytics() -> FinancialAnalytics:
    """Dependency to get the analytics instance."""
    global analytics
    if analytics is None:
        analytics = FinancialAnalytics()
    return analytics

@router.post("/analyze/portfolio", response_model=AnalysisResponse, tags=["Portfolio Analysis"])
async def analyze_portfolio(
    request: AnalysisRequest,
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Perform comprehensive portfolio analysis.
    
    This endpoint analyzes a portfolio of financial instruments and provides
    risk metrics, quality evaluation, portfolio metrics, and intelligence scoring.
    
    Args:
        request: Analysis request containing symbols and parameters
        analytics_instance: Analytics engine instance
        
    Returns:
        AnalysisResponse: Comprehensive analysis results
        
    Raises:
        HTTPException: If analysis fails or invalid request
    """
    try:
        logger.info(f"Starting portfolio analysis for {len(request.symbols)} symbols")
        start_time = datetime.now()
        
        result = await analytics_instance.analyze_portfolio(request)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        result.processing_time = processing_time
        
        logger.info(f"Portfolio analysis completed in {processing_time:.2f}s")
        return result
        
    except Exception as e:
        logger.error(f"Portfolio analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze/risk", response_model=Dict[str, Any], tags=["Risk Analysis"])
async def analyze_risk(
    symbols: List[str] = Query(..., description="List of symbols to analyze"),
    period: str = Query("1y", description="Analysis period"),
    risk_free_rate: float = Query(0.02, description="Risk-free rate"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Perform risk analysis for financial instruments.
    
    Calculates volatility, VaR, drawdown, beta, Sharpe ratio, and other risk metrics.
    
    Args:
        symbols: List of financial instrument symbols
        period: Analysis period (e.g., "1y", "6m", "3m")
        risk_free_rate: Risk-free rate for calculations
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Risk analysis results for each symbol
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        logger.info(f"Starting risk analysis for {len(symbols)} symbols")
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="risk",
            period=period,
            risk_free_rate=risk_free_rate
        )
        
        result = await analytics_instance.analyze_portfolio(request)
        return result.data.get("risk_analysis", {})
        
    except Exception as e:
        logger.error(f"Risk analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")

@router.post("/analyze/quality", response_model=Dict[str, Any], tags=["Quality Evaluation"])
async def analyze_quality(
    symbols: List[str] = Query(..., description="List of symbols to analyze"),
    period: str = Query("1y", description="Analysis period"),
    include_fundamentals: bool = Query(True, description="Include fundamental analysis"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Perform quality evaluation for financial instruments.
    
    Assesses performance consistency, risk-adjusted returns, and financial health.
    
    Args:
        symbols: List of financial instrument symbols
        period: Analysis period
        include_fundamentals: Whether to include fundamental analysis
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Quality evaluation results for each symbol
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        logger.info(f"Starting quality evaluation for {len(symbols)} symbols")
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="quality",
            period=period
        )
        
        result = await analytics_instance.analyze_portfolio(request)
        return result.data.get("quality_analysis", {})
        
    except Exception as e:
        logger.error(f"Quality evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Quality evaluation failed: {str(e)}")

@router.post("/analyze/intelligence", response_model=IntelligenceScore, tags=["Intelligence Scoring"])
async def analyze_intelligence(
    symbols: List[str] = Query(..., description="List of portfolio symbols"),
    weights: Optional[List[float]] = Query(None, description="Portfolio weights"),
    period: str = Query("1y", description="Analysis period"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Calculate portfolio intelligence score.
    
    Generates a comprehensive intelligence score based on quality, risk, and diversification.
    
    Args:
        symbols: List of portfolio symbols
        weights: Portfolio weights (optional)
        period: Analysis period
        analytics_instance: Analytics engine instance
        
    Returns:
        IntelligenceScore: Portfolio intelligence analysis
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        logger.info(f"Starting intelligence analysis for {len(symbols)} symbols")
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="intelligence",
            period=period,
            weights=weights
        )
        
        result = await analytics_instance.analyze_portfolio(request)
        return result.data.get("intelligence_analysis", {})
        
    except Exception as e:
        logger.error(f"Intelligence analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Intelligence analysis failed: {str(e)}")

@router.get("/recommendations", response_model=List[Recommendation], tags=["Recommendations"])
async def get_recommendations(
    symbols: List[str] = Query(..., description="List of symbols to analyze"),
    analysis_type: str = Query("comprehensive", description="Type of analysis"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Generate investment recommendations.
    
    Provides buy/sell/hold recommendations with confidence levels and reasoning.
    
    Args:
        symbols: List of symbols to analyze
        analysis_type: Type of analysis (comprehensive, risk, quality)
        analytics_instance: Analytics engine instance
        
    Returns:
        List[Recommendation]: Investment recommendations
        
    Raises:
        HTTPException: If recommendation generation fails
    """
    try:
        logger.info(f"Generating recommendations for {len(symbols)} symbols")
        
        recommendations = await analytics_instance.get_recommendations(symbols, analysis_type)
        return recommendations
        
    except Exception as e:
        logger.error(f"Recommendation generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

@router.get("/market-data/{symbol}", response_model=List[MarketData], tags=["Market Data"])
async def get_market_data(
    symbol: str,
    period: str = Query("1y", description="Data period"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Fetch market data for a symbol.
    
    Retrieves historical price data from configured data providers.
    
    Args:
        symbol: Financial instrument symbol
        period: Data period (e.g., "1y", "6m", "3m")
        analytics_instance: Analytics engine instance
        
    Returns:
        List[MarketData]: Historical market data
        
    Raises:
        HTTPException: If data retrieval fails
    """
    try:
        logger.info(f"Fetching market data for {symbol}")
        
        market_data = await analytics_instance.market_data_provider.get_historical_data(symbol, period)
        return market_data
        
    except Exception as e:
        logger.error(f"Market data retrieval failed for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Market data retrieval failed: {str(e)}")

@router.get("/company-info/{symbol}", response_model=Dict[str, Any], tags=["Market Data"])
async def get_company_info(
    symbol: str,
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Fetch company information for a symbol.
    
    Retrieves fundamental data and company details.
    
    Args:
        symbol: Financial instrument symbol
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Company information
        
    Raises:
        HTTPException: If data retrieval fails
    """
    try:
        logger.info(f"Fetching company info for {symbol}")
        
        company_info = await analytics_instance.market_data_provider.get_company_info(symbol)
        return company_info
        
    except Exception as e:
        logger.error(f"Company info retrieval failed for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Company info retrieval failed: {str(e)}")

@router.post("/validate-data-quality", response_model=Dict[str, Any], tags=["Data Quality"])
async def validate_data_quality(
    symbols: List[str] = Query(..., description="List of symbols to validate"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Validate data quality for symbols.
    
    Checks data completeness, consistency, and accuracy.
    
    Args:
        symbols: List of symbols to validate
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Data quality validation results
        
    Raises:
        HTTPException: If validation fails
    """
    try:
        logger.info(f"Validating data quality for {len(symbols)} symbols")
        
        validation_results = await analytics_instance.validate_data_quality(symbols)
        return validation_results
        
    except Exception as e:
        logger.error(f"Data quality validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data quality validation failed: {str(e)}")

@router.get("/cache-stats", response_model=Dict[str, Any], tags=["System"])
async def get_cache_stats(
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Get cache statistics.
    
    Returns information about cached data and performance.
    
    Args:
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Cache statistics
        
    Raises:
        HTTPException: If retrieval fails
    """
    try:
        cache_stats = analytics_instance.market_data_provider.get_cache_stats()
        return cache_stats
        
    except Exception as e:
        logger.error(f"Cache stats retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cache stats retrieval failed: {str(e)}")

@router.delete("/cache", response_model=Dict[str, str], tags=["System"])
async def clear_cache(
    symbol: Optional[str] = Query(None, description="Specific symbol to clear (optional)"),
    analytics_instance: FinancialAnalytics = Depends(get_analytics)
):
    """
    Clear cache data.
    
    Clears all cached data or data for a specific symbol.
    
    Args:
        symbol: Specific symbol to clear (optional)
        analytics_instance: Analytics engine instance
        
    Returns:
        dict: Clear operation result
        
    Raises:
        HTTPException: If clear operation fails
    """
    try:
        analytics_instance.market_data_provider.clear_cache(symbol)
        message = f"Cache cleared for {symbol}" if symbol else "All cache cleared"
        return {"message": message}
        
    except Exception as e:
        logger.error(f"Cache clear failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cache clear failed: {str(e)}") 