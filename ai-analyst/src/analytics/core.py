"""
Core Financial Analytics class that integrates all components.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import time

from .models import (
    AnalysisRequest, AnalysisResponse, RiskMetrics, QualityMetrics,
    PortfolioMetrics, IntelligenceScore, Recommendation
)
from .api_client import APIClient, create_api_client
from .risk_analyzer import RiskAnalyzer
from .quality_evaluator import QualityEvaluator
from .portfolio_analyzer import PortfolioAnalyzer
from .market_data import MarketDataProvider

logger = logging.getLogger(__name__)


class FinancialAnalytics:
    """
    Comprehensive financial analytics framework for risk assessment,
    fund quality evaluation, and portfolio analysis.
    """
    
    def __init__(self, api_client: Optional[APIClient] = None, risk_free_rate: float = 0.02):
        """
        Initialize the Financial Analytics framework.
        
        Args:
            api_client: API client for data fetching (optional)
            risk_free_rate: Risk-free rate for calculations
        """
        self.api_client = api_client or create_api_client("yahoo")
        self.risk_free_rate = risk_free_rate
        
        # Initialize components
        self.risk_analyzer = RiskAnalyzer(risk_free_rate)
        self.quality_evaluator = QualityEvaluator(risk_free_rate)
        self.portfolio_analyzer = PortfolioAnalyzer(risk_free_rate)
        self.market_data_provider = MarketDataProvider(self.api_client)
        
        logger.info("Financial Analytics framework initialized")
    
    async def analyze_portfolio(self, request: AnalysisRequest) -> AnalysisResponse:
        """
        Perform comprehensive portfolio analysis.
        
        Args:
            request: Analysis request with symbols and parameters
            
        Returns:
            Analysis response with results
        """
        start_time = time.time()
        request_id = f"analysis_{int(start_time)}"
        
        try:
            logger.info(f"Starting portfolio analysis for {len(request.symbols)} symbols")
            
            # Get portfolio data
            portfolio_data = await self.market_data_provider.get_portfolio_data(
                request.symbols, request.period
            )
            
            # Perform analysis based on type
            if request.analysis_type == "risk":
                results = await self._analyze_risk(portfolio_data, request)
            elif request.analysis_type == "quality":
                results = await self._analyze_quality(portfolio_data, request)
            elif request.analysis_type == "portfolio":
                results = await self._analyze_portfolio_metrics(portfolio_data, request)
            elif request.analysis_type == "intelligence":
                results = await self._analyze_intelligence(portfolio_data, request)
            elif request.analysis_type == "comprehensive":
                results = await self._analyze_comprehensive(portfolio_data, request)
            else:
                raise ValueError(f"Unknown analysis type: {request.analysis_type}")
            
            processing_time = time.time() - start_time
            
            return AnalysisResponse(
                request_id=request_id,
                status="success",
                data=results,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Analysis failed: {e}")
            
            return AnalysisResponse(
                request_id=request_id,
                status="error",
                data={},
                errors=[str(e)],
                processing_time=processing_time
            )
    
    async def _analyze_risk(self, portfolio_data: Dict[str, Dict], 
                          request: AnalysisRequest) -> Dict[str, Any]:
        """Analyze risk metrics for portfolio."""
        results = {
            'analysis_type': 'risk',
            'symbols': request.symbols,
            'risk_metrics': {},
            'portfolio_risk': None,
            'correlation_matrix': None
        }
        
        # Individual risk metrics
        for symbol, data in portfolio_data.items():
            historical_data = data.get('historical', [])
            if historical_data:
                prices = [d.close for d in historical_data]
                risk_metrics = self.risk_analyzer.calculate_risk_metrics(prices)
                results['risk_metrics'][symbol] = risk_metrics.dict()
        
        # Portfolio risk (if weights provided)
        if request.weights and len(request.weights) == len(request.symbols):
            # Calculate portfolio risk using weights
            returns_data = {}
            for symbol, data in portfolio_data.items():
                historical_data = data.get('historical', [])
                if len(historical_data) >= 2:
                    prices = [d.close for d in historical_data]
                    returns = pd.Series(prices).pct_change().dropna()
                    returns_data[symbol] = returns
            
            if returns_data:
                returns_df = pd.DataFrame(returns_data)
                returns_df = returns_df.dropna()
                
                if len(returns_df) > 0:
                    portfolio_risk = self.risk_analyzer.calculate_portfolio_risk(
                        returns_df, request.weights
                    )
                    results['portfolio_risk'] = portfolio_risk.dict()
                    
                    # Correlation matrix
                    correlation_matrix = self.risk_analyzer.calculate_correlation_matrix(returns_df)
                    results['correlation_matrix'] = correlation_matrix.to_dict()
        
        return results
    
    async def _analyze_quality(self, portfolio_data: Dict[str, Dict], 
                             request: AnalysisRequest) -> Dict[str, Any]:
        """Analyze quality metrics for portfolio."""
        results = {
            'analysis_type': 'quality',
            'symbols': request.symbols,
            'quality_metrics': {},
            'consistency_metrics': {},
            'risk_adjusted_metrics': {},
            'valuation_metrics': {}
        }
        
        for symbol, data in portfolio_data.items():
            historical_data = data.get('historical', [])
            company_info = data.get('company', {})
            
            if historical_data:
                # Quality evaluation
                quality_metrics = self.quality_evaluator.evaluate_quality(
                    symbol, historical_data, company_info
                )
                results['quality_metrics'][symbol] = quality_metrics.dict()
                
                # Additional metrics
                prices = [d.close for d in historical_data]
                returns = pd.Series(prices).pct_change().dropna()
                
                consistency_metrics = self.quality_evaluator.calculate_consistency_metrics(returns)
                results['consistency_metrics'][symbol] = consistency_metrics
                
                risk_adjusted_metrics = self.quality_evaluator.calculate_risk_adjusted_metrics(returns)
                results['risk_adjusted_metrics'][symbol] = risk_adjusted_metrics
                
                valuation_metrics = self.quality_evaluator.calculate_valuation_metrics(company_info)
                results['valuation_metrics'][symbol] = valuation_metrics
        
        return results
    
    async def _analyze_portfolio_metrics(self, portfolio_data: Dict[str, Dict], 
                                       request: AnalysisRequest) -> Dict[str, Any]:
        """Analyze portfolio-level metrics."""
        results = {
            'analysis_type': 'portfolio',
            'symbols': request.symbols,
            'portfolio_metrics': None,
            'sector_analysis': None,
            'optimization': None
        }
        
        # Portfolio analysis
        portfolio_metrics = self.portfolio_analyzer.analyze_portfolio(
            portfolio_data, request.weights
        )
        results['portfolio_metrics'] = portfolio_metrics.dict()
        
        # Sector analysis
        sector_allocations = portfolio_metrics.sector_allocations
        results['sector_analysis'] = {
            'allocations': [allocation.dict() for allocation in sector_allocations],
            'diversification_score': portfolio_metrics.diversification_score,
            'concentration_risk': portfolio_metrics.concentration_risk
        }
        
        # Portfolio optimization (if requested)
        if request.weights:
            try:
                # Create returns matrix for optimization
                returns_data = {}
                for symbol, data in portfolio_data.items():
                    historical_data = data.get('historical', [])
                    if len(historical_data) >= 2:
                        prices = [d.close for d in historical_data]
                        returns = pd.Series(prices).pct_change().dropna()
                        returns_data[symbol] = returns
                
                if len(returns_data) >= 2:
                    returns_df = pd.DataFrame(returns_data)
                    returns_df = returns_df.dropna()
                    
                    if len(returns_df) > 0:
                        optimization = self.portfolio_analyzer.optimize_portfolio(
                            portfolio_data, target_return=request.risk_free_rate + 0.05
                        )
                        results['optimization'] = optimization
            except Exception as e:
                logger.warning(f"Portfolio optimization failed: {e}")
                results['optimization'] = {'error': str(e)}
        
        return results
    
    async def _analyze_intelligence(self, portfolio_data: Dict[str, Dict], 
                                  request: AnalysisRequest) -> Dict[str, Any]:
        """Analyze portfolio intelligence score."""
        results = {
            'analysis_type': 'intelligence',
            'symbols': request.symbols,
            'intelligence_score': None,
            'recommendations': []
        }
        
        # Calculate intelligence score
        intelligence_score = self.portfolio_analyzer.calculate_intelligence_score(
            portfolio_data, request.weights
        )
        results['intelligence_score'] = intelligence_score.dict()
        
        # Generate recommendations
        results['recommendations'] = intelligence_score.recommendations
        
        return results
    
    async def _analyze_comprehensive(self, portfolio_data: Dict[str, Dict], 
                                   request: AnalysisRequest) -> Dict[str, Any]:
        """Perform comprehensive analysis including all types."""
        results = {
            'analysis_type': 'comprehensive',
            'symbols': request.symbols,
            'risk_analysis': None,
            'quality_analysis': None,
            'portfolio_analysis': None,
            'intelligence_analysis': None,
            'summary': {}
        }
        
        # Perform all analyses
        risk_results = await self._analyze_risk(portfolio_data, request)
        quality_results = await self._analyze_quality(portfolio_data, request)
        portfolio_results = await self._analyze_portfolio_metrics(portfolio_data, request)
        intelligence_results = await self._analyze_intelligence(portfolio_data, request)
        
        results['risk_analysis'] = risk_results
        results['quality_analysis'] = quality_results
        results['portfolio_analysis'] = portfolio_results
        results['intelligence_analysis'] = intelligence_results
        
        # Generate summary
        results['summary'] = self._generate_comprehensive_summary(
            risk_results, quality_results, portfolio_results, intelligence_results
        )
        
        return results
    
    def _generate_comprehensive_summary(self, risk_results: Dict, quality_results: Dict,
                                      portfolio_results: Dict, intelligence_results: Dict) -> Dict[str, Any]:
        """Generate a comprehensive summary of all analyses."""
        summary = {
            'overall_assessment': 'Neutral',
            'key_metrics': {},
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        }
        
        # Extract key metrics
        if 'portfolio_risk' in risk_results and risk_results['portfolio_risk']:
            summary['key_metrics']['volatility'] = risk_results['portfolio_risk']['volatility']
            summary['key_metrics']['sharpe_ratio'] = risk_results['portfolio_risk']['sharpe_ratio']
            summary['key_metrics']['max_drawdown'] = risk_results['portfolio_risk']['max_drawdown']
        
        if 'portfolio_metrics' in portfolio_results and portfolio_results['portfolio_metrics']:
            summary['key_metrics']['total_return'] = portfolio_results['portfolio_metrics']['total_return']
            summary['key_metrics']['diversification_score'] = portfolio_results['portfolio_metrics']['diversification_score']
        
        if 'intelligence_score' in intelligence_results and intelligence_results['intelligence_score']:
            summary['key_metrics']['intelligence_score'] = intelligence_results['intelligence_score']['intelligence_score']
            summary['recommendations'] = intelligence_results['recommendations']
        
        # Assess strengths and weaknesses
        if summary['key_metrics'].get('sharpe_ratio', 0) > 1.0:
            summary['strengths'].append("Good risk-adjusted returns")
        elif summary['key_metrics'].get('sharpe_ratio', 0) < 0.5:
            summary['weaknesses'].append("Poor risk-adjusted returns")
        
        if summary['key_metrics'].get('diversification_score', 0) > 7.0:
            summary['strengths'].append("Well diversified portfolio")
        elif summary['key_metrics'].get('diversification_score', 0) < 4.0:
            summary['weaknesses'].append("Poor diversification")
        
        if summary['key_metrics'].get('intelligence_score', 0) > 7.0:
            summary['overall_assessment'] = 'Excellent'
        elif summary['key_metrics'].get('intelligence_score', 0) > 5.0:
            summary['overall_assessment'] = 'Good'
        elif summary['key_metrics'].get('intelligence_score', 0) > 3.0:
            summary['overall_assessment'] = 'Fair'
        else:
            summary['overall_assessment'] = 'Poor'
        
        return summary
    
    async def get_recommendations(self, symbols: List[str], 
                                analysis_type: str = "comprehensive") -> List[Recommendation]:
        """
        Generate investment recommendations for symbols.
        
        Args:
            symbols: List of symbols to analyze
            analysis_type: Type of analysis to perform
            
        Returns:
            List of recommendations
        """
        try:
            request = AnalysisRequest(
                symbols=symbols,
                analysis_type=analysis_type,
                period="1y"
            )
            
            response = await self.analyze_portfolio(request)
            
            if response.status != "success":
                return []
            
            recommendations = []
            
            # Generate recommendations based on analysis results
            if analysis_type in ["quality", "comprehensive"]:
                quality_data = response.data.get('quality_analysis', {})
                for symbol, metrics in quality_data.get('quality_metrics', {}).items():
                    if metrics.get('quality_score', 0) < 5.0:
                        recommendations.append(Recommendation(
                            symbol=symbol,
                            action="SELL",
                            confidence=0.7,
                            reasoning="Low quality score indicates poor fundamentals",
                            risk_level="High",
                            time_horizon="Short-term"
                        ))
                    elif metrics.get('quality_score', 0) > 8.0:
                        recommendations.append(Recommendation(
                            symbol=symbol,
                            action="BUY",
                            confidence=0.8,
                            reasoning="High quality score indicates strong fundamentals",
                            risk_level="Low",
                            time_horizon="Long-term"
                        ))
            
            if analysis_type in ["risk", "comprehensive"]:
                risk_data = response.data.get('risk_analysis', {})
                for symbol, metrics in risk_data.get('risk_metrics', {}).items():
                    if metrics.get('risk_score', 5) > 8:
                        recommendations.append(Recommendation(
                            symbol=symbol,
                            action="HOLD",
                            confidence=0.6,
                            reasoning="High risk score - monitor closely",
                            risk_level="Very High",
                            time_horizon="Short-term"
                        ))
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def validate_data_quality(self, symbols: List[str]) -> Dict[str, Any]:
        """
        Validate data quality for symbols.
        
        Args:
            symbols: List of symbols to validate
            
        Returns:
            Data quality validation results
        """
        results = {
            'validation_results': {},
            'summary': {
                'total_symbols': len(symbols),
                'valid_symbols': 0,
                'invalid_symbols': 0,
                'average_quality_score': 0
            }
        }
        
        total_quality_score = 0
        valid_count = 0
        
        for symbol in symbols:
            try:
                quality_result = await self.market_data_provider.validate_data_quality(symbol)
                results['validation_results'][symbol] = quality_result
                
                if quality_result.get('quality_score', 0) > 0:
                    valid_count += 1
                    total_quality_score += quality_result.get('quality_score', 0)
                
            except Exception as e:
                logger.error(f"Error validating data quality for {symbol}: {e}")
                results['validation_results'][symbol] = {
                    'symbol': symbol,
                    'quality_score': 0,
                    'issues': [f'Validation error: {str(e)}']
                }
        
        # Update summary
        results['summary']['valid_symbols'] = valid_count
        results['summary']['invalid_symbols'] = len(symbols) - valid_count
        results['summary']['average_quality_score'] = (
            total_quality_score / valid_count if valid_count > 0 else 0
        )
        
        return results
    
    async def close(self):
        """Close all resources."""
        try:
            await self.market_data_provider.close()
            logger.info("Financial Analytics framework closed")
        except Exception as e:
            logger.error(f"Error closing framework: {e}")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        asyncio.create_task(self.close()) 