"""
Quality evaluation module for financial instruments.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

from .models import QualityMetrics, MarketData

logger = logging.getLogger(__name__)


class QualityEvaluator:
    """Comprehensive quality evaluation for financial instruments."""
    
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate
        self.annualization_factor = 252  # Trading days per year
    
    def evaluate_quality(self, symbol: str, historical_data: List[MarketData], 
                        company_info: Dict[str, Any]) -> QualityMetrics:
        """
        Evaluate the quality of a financial instrument.
        
        Args:
            symbol: Symbol/ticker
            historical_data: Historical market data
            company_info: Company information and fundamentals
            
        Returns:
            QualityMetrics object with all calculated metrics
        """
        try:
            if not historical_data:
                raise ValueError("No historical data provided")
            
            # Convert to pandas DataFrame
            df = pd.DataFrame([
                {
                    'timestamp': data.timestamp,
                    'close': data.close,
                    'volume': data.volume
                }
                for data in historical_data
            ])
            
            df = df.sort_values('timestamp').reset_index(drop=True)
            prices = df['close']
            
            # Calculate performance metrics
            total_return = (prices.iloc[-1] / prices.iloc[0]) - 1
            annual_return = (1 + total_return) ** (self.annualization_factor / len(prices)) - 1
            
            # Calculate returns for consistency analysis
            returns = prices.pct_change().dropna()
            
            # Consistency metrics
            positive_periods_ratio = (returns > 0).sum() / len(returns)
            return_consistency = 1 - (returns.std() / abs(returns.mean())) if returns.mean() != 0 else 0
            
            # Risk-adjusted returns
            volatility = returns.std() * np.sqrt(self.annualization_factor)
            sharpe_ratio = (annual_return - self.risk_free_rate) / volatility if volatility > 0 else 0
            
            # Financial health assessment
            financial_health_score = self._assess_financial_health(company_info)
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(
                annual_return, sharpe_ratio, positive_periods_ratio,
                return_consistency, financial_health_score
            )
            
            # Get quality rating
            quality_rating = self._get_quality_rating(quality_score)
            
            return QualityMetrics(
                symbol=symbol,
                total_return=total_return,
                annual_return=annual_return,
                sharpe_ratio=sharpe_ratio,
                positive_periods_ratio=positive_periods_ratio,
                return_consistency=return_consistency,
                financial_health_score=financial_health_score,
                quality_score=quality_score,
                quality_rating=quality_rating,
                market_cap=company_info.get('market_cap'),
                pe_ratio=company_info.get('pe_ratio'),
                debt_to_equity=company_info.get('debt_to_equity')
            )
            
        except Exception as e:
            logger.error(f"Error evaluating quality for {symbol}: {e}")
            raise
    
    def _assess_financial_health(self, company_info: Dict[str, Any]) -> float:
        """
        Assess financial health based on company information.
        
        Args:
            company_info: Company information dictionary
            
        Returns:
            Financial health score from 0 to 10
        """
        health_score = 5.0  # Default neutral score
        
        # Profit margins
        profit_margins = company_info.get('profit_margins')
        if profit_margins is not None:
            if profit_margins > 0.15:
                health_score += 1.5
            elif profit_margins > 0.10:
                health_score += 1.0
            elif profit_margins > 0.05:
                health_score += 0.5
            elif profit_margins < 0:
                health_score -= 2.0
            elif profit_margins < 0.02:
                health_score -= 1.0
        
        # Debt to equity ratio
        debt_to_equity = company_info.get('debt_to_equity')
        if debt_to_equity is not None:
            if debt_to_equity < 30:
                health_score += 1.0
            elif debt_to_equity < 50:
                health_score += 0.5
            elif debt_to_equity > 100:
                health_score -= 1.5
            elif debt_to_equity > 70:
                health_score -= 1.0
        
        # Return on equity
        roe = company_info.get('return_on_equity')
        if roe is not None:
            if roe > 0.20:
                health_score += 1.5
            elif roe > 0.15:
                health_score += 1.0
            elif roe > 0.10:
                health_score += 0.5
            elif roe < 0:
                health_score -= 1.5
            elif roe < 0.05:
                health_score -= 0.5
        
        # Market capitalization (size factor)
        market_cap = company_info.get('market_cap')
        if market_cap is not None:
            if market_cap > 100e9:  # Large cap (>$100B)
                health_score += 0.5
            elif market_cap < 1e9:  # Small cap (<$1B)
                health_score -= 0.5
        
        # P/E ratio
        pe_ratio = company_info.get('pe_ratio')
        if pe_ratio is not None and pe_ratio > 0:
            if pe_ratio < 15:
                health_score += 0.5
            elif pe_ratio > 50:
                health_score -= 0.5
            elif pe_ratio > 100:
                health_score -= 1.0
        
        return max(0, min(10, health_score))
    
    def _calculate_quality_score(self, annual_return: float, sharpe_ratio: float,
                               positive_ratio: float, consistency: float,
                               financial_health: float) -> float:
        """
        Calculate composite quality score.
        
        Args:
            annual_return: Annualized return
            sharpe_ratio: Sharpe ratio
            positive_ratio: Ratio of positive periods
            consistency: Return consistency measure
            financial_health: Financial health score
            
        Returns:
            Quality score from 0 to 10
        """
        # Normalize metrics to 0-10 scale
        return_score = min(max(annual_return * 10, 0), 10)
        sharpe_score = min(max(sharpe_ratio * 2, 0), 10)
        positive_score = positive_ratio * 10
        consistency_score = min(max(consistency * 10, 0), 10)
        
        # Weighted average
        weights = [0.25, 0.25, 0.15, 0.15, 0.20]
        scores = [return_score, sharpe_score, positive_score, consistency_score, financial_health]
        
        return sum(w * s for w, s in zip(weights, scores)) / sum(weights)
    
    def _get_quality_rating(self, score: float) -> str:
        """
        Convert quality score to rating.
        
        Args:
            score: Quality score from 0 to 10
            
        Returns:
            Quality rating string
        """
        if score >= 8.0:
            return "Excellent"
        elif score >= 6.5:
            return "Good"
        elif score >= 5.0:
            return "Average"
        elif score >= 3.5:
            return "Below Average"
        else:
            return "Poor"
    
    def calculate_consistency_metrics(self, returns: pd.Series) -> Dict[str, float]:
        """
        Calculate additional consistency metrics.
        
        Args:
            returns: Return series
            
        Returns:
            Dictionary of consistency metrics
        """
        # Rolling volatility
        rolling_vol = returns.rolling(window=30).std() * np.sqrt(self.annualization_factor)
        vol_stability = 1 - (rolling_vol.std() / rolling_vol.mean()) if rolling_vol.mean() > 0 else 0
        
        # Maximum consecutive losses
        consecutive_losses = 0
        max_consecutive_losses = 0
        for ret in returns:
            if ret < 0:
                consecutive_losses += 1
                max_consecutive_losses = max(max_consecutive_losses, consecutive_losses)
            else:
                consecutive_losses = 0
        
        # Recovery time (time to recover from maximum drawdown)
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        
        # Find recovery periods
        recovery_times = []
        in_drawdown = False
        drawdown_start = 0
        
        for i, dd in enumerate(drawdown):
            if dd < 0 and not in_drawdown:
                in_drawdown = True
                drawdown_start = i
            elif dd >= 0 and in_drawdown:
                in_drawdown = False
                recovery_times.append(i - drawdown_start)
        
        avg_recovery_time = np.mean(recovery_times) if recovery_times else 0
        
        return {
            'volatility_stability': vol_stability,
            'max_consecutive_losses': max_consecutive_losses,
            'avg_recovery_time': avg_recovery_time,
            'positive_periods_ratio': (returns > 0).sum() / len(returns),
            'return_consistency': 1 - (returns.std() / abs(returns.mean())) if returns.mean() != 0 else 0
        }
    
    def calculate_risk_adjusted_metrics(self, returns: pd.Series) -> Dict[str, float]:
        """
        Calculate risk-adjusted performance metrics.
        
        Args:
            returns: Return series
            
        Returns:
            Dictionary of risk-adjusted metrics
        """
        volatility = returns.std() * np.sqrt(self.annualization_factor)
        annual_return = returns.mean() * self.annualization_factor
        
        # Sharpe ratio
        sharpe_ratio = (annual_return - self.risk_free_rate) / volatility if volatility > 0 else 0
        
        # Sortino ratio (using downside deviation)
        downside_returns = returns[returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(self.annualization_factor) if len(downside_returns) > 0 else 0
        sortino_ratio = (annual_return - self.risk_free_rate) / downside_deviation if downside_deviation > 0 else 0
        
        # Calmar ratio (return / max drawdown)
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = abs(drawdown.min())
        calmar_ratio = annual_return / max_drawdown if max_drawdown > 0 else 0
        
        # Information ratio (assuming zero benchmark)
        information_ratio = annual_return / volatility if volatility > 0 else 0
        
        return {
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'calmar_ratio': calmar_ratio,
            'information_ratio': information_ratio,
            'volatility': volatility,
            'annual_return': annual_return
        }
    
    def calculate_valuation_metrics(self, company_info: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate valuation metrics.
        
        Args:
            company_info: Company information
            
        Returns:
            Dictionary of valuation metrics
        """
        metrics = {}
        
        # P/E ratio
        pe_ratio = company_info.get('pe_ratio')
        if pe_ratio is not None and pe_ratio > 0:
            metrics['pe_ratio'] = pe_ratio
            metrics['pe_percentile'] = self._calculate_percentile(pe_ratio, 'pe_ratio')
        
        # Price to Book ratio
        pb_ratio = company_info.get('price_to_book')
        if pb_ratio is not None and pb_ratio > 0:
            metrics['pb_ratio'] = pb_ratio
            metrics['pb_percentile'] = self._calculate_percentile(pb_ratio, 'pb_ratio')
        
        # Enterprise Value to EBITDA
        ev_ebitda = company_info.get('enterprise_value_to_ebitda')
        if ev_ebitda is not None and ev_ebitda > 0:
            metrics['ev_ebitda'] = ev_ebitda
            metrics['ev_ebitda_percentile'] = self._calculate_percentile(ev_ebitda, 'ev_ebitda')
        
        # Dividend yield
        dividend_yield = company_info.get('dividend_yield')
        if dividend_yield is not None:
            metrics['dividend_yield'] = dividend_yield
        
        return metrics
    
    def _calculate_percentile(self, value: float, metric_type: str) -> float:
        """
        Calculate percentile for a valuation metric (simplified).
        In a real implementation, this would compare against industry peers.
        
        Args:
            value: Metric value
            metric_type: Type of metric
            
        Returns:
            Percentile (0-100)
        """
        # Simplified percentile calculation
        # In practice, this would use industry benchmarks
        if metric_type == 'pe_ratio':
            if value < 10:
                return 10
            elif value < 15:
                return 25
            elif value < 20:
                return 50
            elif value < 25:
                return 75
            else:
                return 90
        elif metric_type == 'pb_ratio':
            if value < 1:
                return 10
            elif value < 2:
                return 30
            elif value < 3:
                return 60
            elif value < 5:
                return 80
            else:
                return 95
        else:
            return 50  # Default to median
    
    def generate_quality_report(self, symbol: str, quality_metrics: QualityMetrics,
                              consistency_metrics: Dict[str, float],
                              risk_adjusted_metrics: Dict[str, float],
                              valuation_metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate a comprehensive quality report.
        
        Args:
            symbol: Symbol/ticker
            quality_metrics: Quality metrics
            consistency_metrics: Consistency metrics
            risk_adjusted_metrics: Risk-adjusted metrics
            valuation_metrics: Valuation metrics
            
        Returns:
            Comprehensive quality report
        """
        report = {
            'symbol': symbol,
            'overall_quality': {
                'score': quality_metrics.quality_score,
                'rating': quality_metrics.quality_rating,
                'summary': self._generate_quality_summary(quality_metrics)
            },
            'performance': {
                'total_return': quality_metrics.total_return,
                'annual_return': quality_metrics.annual_return,
                'sharpe_ratio': quality_metrics.sharpe_ratio
            },
            'consistency': consistency_metrics,
            'risk_adjusted': risk_adjusted_metrics,
            'valuation': valuation_metrics,
            'financial_health': {
                'score': quality_metrics.financial_health_score,
                'assessment': self._assess_financial_health_text(quality_metrics.financial_health_score)
            },
            'recommendations': self._generate_quality_recommendations(
                quality_metrics, consistency_metrics, risk_adjusted_metrics, valuation_metrics
            )
        }
        
        return report
    
    def _generate_quality_summary(self, quality_metrics: QualityMetrics) -> str:
        """Generate a text summary of quality metrics."""
        if quality_metrics.quality_score >= 8:
            return f"{quality_metrics.symbol} shows excellent quality with strong performance and financial health."
        elif quality_metrics.quality_score >= 6.5:
            return f"{quality_metrics.symbol} demonstrates good quality with solid fundamentals."
        elif quality_metrics.quality_score >= 5:
            return f"{quality_metrics.symbol} shows average quality with mixed performance indicators."
        elif quality_metrics.quality_score >= 3.5:
            return f"{quality_metrics.symbol} shows below-average quality with some concerning metrics."
        else:
            return f"{quality_metrics.symbol} shows poor quality with significant issues to consider."
    
    def _assess_financial_health_text(self, health_score: float) -> str:
        """Generate text assessment of financial health."""
        if health_score >= 8:
            return "Excellent financial health with strong profitability and low debt."
        elif health_score >= 6:
            return "Good financial health with solid fundamentals."
        elif health_score >= 4:
            return "Moderate financial health with some areas of concern."
        elif health_score >= 2:
            return "Poor financial health with significant issues."
        else:
            return "Very poor financial health with major concerns."
    
    def _generate_quality_recommendations(self, quality_metrics: QualityMetrics,
                                        consistency_metrics: Dict[str, float],
                                        risk_adjusted_metrics: Dict[str, float],
                                        valuation_metrics: Dict[str, float]) -> List[str]:
        """Generate actionable recommendations based on quality analysis."""
        recommendations = []
        
        # Performance recommendations
        if quality_metrics.annual_return < 0.05:
            recommendations.append("Consider the low annual return relative to risk-free alternatives")
        
        if quality_metrics.sharpe_ratio < 0.5:
            recommendations.append("Risk-adjusted returns are below optimal levels")
        
        # Consistency recommendations
        if consistency_metrics.get('max_consecutive_losses', 0) > 5:
            recommendations.append("High number of consecutive losses indicates poor consistency")
        
        if consistency_metrics.get('volatility_stability', 0) < 0.5:
            recommendations.append("Volatility is unstable, consider risk management")
        
        # Financial health recommendations
        if quality_metrics.financial_health_score < 4:
            recommendations.append("Poor financial health - review fundamentals before investing")
        
        # Valuation recommendations
        pe_ratio = valuation_metrics.get('pe_ratio')
        if pe_ratio and pe_ratio > 25:
            recommendations.append("High P/E ratio suggests overvaluation risk")
        
        if not recommendations:
            recommendations.append("Quality metrics are generally favorable")
        
        return recommendations 