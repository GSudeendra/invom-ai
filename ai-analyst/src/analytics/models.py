"""
Data models for the financial analytics framework.
"""

from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
import pandas as pd


class RiskMetrics(BaseModel):
    """Risk metrics for a financial instrument."""
    
    volatility: float = Field(..., ge=0, description="Annualized volatility")
    downside_volatility: float = Field(..., ge=0, description="Downside volatility")
    var_95: float = Field(..., description="95% Value at Risk")
    var_99: float = Field(..., description="99% Value at Risk")
    max_drawdown: float = Field(..., le=0, description="Maximum drawdown")
    risk_score: int = Field(..., ge=1, le=10, description="Risk score 1-10")
    beta: Optional[float] = Field(None, description="Beta relative to market")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio")
    
    @validator('risk_score')
    def validate_risk_score(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('Risk score must be between 1 and 10')
        return v


class QualityMetrics(BaseModel):
    """Quality metrics for a financial instrument."""
    
    symbol: str = Field(..., description="Symbol/ticker")
    total_return: float = Field(..., description="Total return over period")
    annual_return: float = Field(..., description="Annualized return")
    sharpe_ratio: float = Field(..., description="Sharpe ratio")
    positive_periods_ratio: float = Field(..., ge=0, le=1, description="Ratio of positive periods")
    return_consistency: float = Field(..., description="Return consistency measure")
    financial_health_score: float = Field(..., ge=0, le=10, description="Financial health score")
    quality_score: float = Field(..., ge=0, le=10, description="Overall quality score")
    quality_rating: str = Field(..., description="Quality rating")
    market_cap: Optional[float] = Field(None, description="Market capitalization")
    pe_ratio: Optional[float] = Field(None, description="P/E ratio")
    debt_to_equity: Optional[float] = Field(None, description="Debt to equity ratio")
    
    @validator('quality_rating')
    def validate_quality_rating(cls, v):
        valid_ratings = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor']
        if v not in valid_ratings:
            raise ValueError(f'Quality rating must be one of {valid_ratings}')
        return v


class SectorAllocation(BaseModel):
    """Sector allocation information."""
    
    sector: str = Field(..., description="Sector name")
    allocation: float = Field(..., ge=0, le=100, description="Allocation percentage")
    value: float = Field(..., ge=0, description="Allocated value")
    count: int = Field(..., ge=0, description="Number of instruments in sector")


class PortfolioMetrics(BaseModel):
    """Portfolio-level metrics."""
    
    total_value: float = Field(..., ge=0, description="Total portfolio value")
    total_return: float = Field(..., description="Total portfolio return")
    annual_return: float = Field(..., description="Annualized portfolio return")
    volatility: float = Field(..., ge=0, description="Portfolio volatility")
    sharpe_ratio: float = Field(..., description="Portfolio Sharpe ratio")
    max_drawdown: float = Field(..., le=0, description="Portfolio maximum drawdown")
    sector_allocations: List[SectorAllocation] = Field(default_factory=list)
    diversification_score: float = Field(..., ge=0, le=10, description="Diversification score")
    concentration_risk: float = Field(..., ge=0, le=10, description="Concentration risk score")


class IntelligenceScore(BaseModel):
    """Portfolio intelligence score and analysis."""
    
    portfolio_symbols: List[str] = Field(..., description="Portfolio symbols")
    weights: Optional[List[float]] = Field(None, description="Portfolio weights")
    average_quality_score: float = Field(..., ge=0, le=10, description="Average quality score")
    average_risk_score: float = Field(..., ge=1, le=10, description="Average risk score")
    diversification_score: float = Field(..., ge=0, le=10, description="Diversification score")
    intelligence_score: float = Field(..., ge=0, le=10, description="Overall intelligence score")
    intelligence_rating: str = Field(..., description="Intelligence rating")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations")
    risk_metrics: Optional[RiskMetrics] = Field(None, description="Portfolio risk metrics")
    quality_metrics: Optional[QualityMetrics] = Field(None, description="Portfolio quality metrics")
    
    @validator('intelligence_rating')
    def validate_intelligence_rating(cls, v):
        valid_ratings = ['Highly Intelligent', 'Intelligent', 'Moderately Intelligent', 'Below Average', 'Needs Improvement']
        if v not in valid_ratings:
            raise ValueError(f'Intelligence rating must be one of {valid_ratings}')
        return v


class Recommendation(BaseModel):
    """Investment recommendation."""
    
    symbol: str = Field(..., description="Symbol/ticker")
    action: str = Field(..., description="Recommended action")
    confidence: float = Field(..., ge=0, le=1, description="Confidence level")
    reasoning: str = Field(..., description="Reasoning for recommendation")
    risk_level: str = Field(..., description="Risk level")
    time_horizon: str = Field(..., description="Recommended time horizon")
    target_price: Optional[float] = Field(None, description="Target price")
    stop_loss: Optional[float] = Field(None, description="Stop loss price")
    
    @validator('action')
    def validate_action(cls, v):
        valid_actions = ['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']
        if v not in valid_actions:
            raise ValueError(f'Action must be one of {valid_actions}')
        return v
    
    @validator('risk_level')
    def validate_risk_level(cls, v):
        valid_levels = ['Low', 'Medium', 'High', 'Very High']
        if v not in valid_levels:
            raise ValueError(f'Risk level must be one of {valid_levels}')
        return v


class MarketData(BaseModel):
    """Market data structure."""
    
    symbol: str = Field(..., description="Symbol/ticker")
    timestamp: datetime = Field(..., description="Data timestamp")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="High price")
    low: float = Field(..., description="Low price")
    close: float = Field(..., description="Closing price")
    volume: int = Field(..., ge=0, description="Trading volume")
    adjusted_close: Optional[float] = Field(None, description="Adjusted closing price")
    
    @validator('close')
    def validate_close_price(cls, v):
        if v <= 0:
            raise ValueError('Close price must be positive')
        return v


class AnalysisRequest(BaseModel):
    """Request model for analysis operations."""
    
    symbols: List[str] = Field(..., description="List of symbols to analyze")
    analysis_type: str = Field(..., description="Type of analysis to perform")
    period: str = Field(default="1y", description="Analysis period")
    weights: Optional[List[float]] = Field(None, description="Portfolio weights")
    risk_free_rate: float = Field(default=0.02, description="Risk-free rate")
    include_benchmark: bool = Field(default=False, description="Include benchmark comparison")
    benchmark_symbol: Optional[str] = Field(None, description="Benchmark symbol")
    
    @validator('analysis_type')
    def validate_analysis_type(cls, v):
        valid_types = ['risk', 'quality', 'portfolio', 'intelligence', 'comprehensive']
        if v not in valid_types:
            raise ValueError(f'Analysis type must be one of {valid_types}')
        return v


class AnalysisResponse(BaseModel):
    """Response model for analysis operations."""
    
    request_id: str = Field(..., description="Unique request identifier")
    timestamp: datetime = Field(default_factory=datetime.now, description="Analysis timestamp")
    status: str = Field(..., description="Analysis status")
    data: Dict[str, Any] = Field(..., description="Analysis results")
    errors: List[str] = Field(default_factory=list, description="Any errors encountered")
    warnings: List[str] = Field(default_factory=list, description="Any warnings")
    processing_time: float = Field(..., description="Processing time in seconds")
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['success', 'partial_success', 'error', 'processing']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class DataProviderConfig(BaseModel):
    """Configuration for data providers."""
    
    name: str = Field(..., description="Provider name")
    api_key: Optional[str] = Field(None, description="API key")
    base_url: str = Field(..., description="Base URL for API")
    rate_limit: int = Field(default=100, description="Requests per minute")
    timeout: int = Field(default=30, description="Request timeout in seconds")
    retry_attempts: int = Field(default=3, description="Number of retry attempts")
    cache_ttl: int = Field(default=300, description="Cache TTL in seconds")
    enabled: bool = Field(default=True, description="Whether provider is enabled")
    
    class Config:
        extra = "allow"  # Allow additional fields for provider-specific config 