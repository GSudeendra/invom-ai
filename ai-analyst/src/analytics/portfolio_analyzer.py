"""
Portfolio analysis module for comprehensive portfolio evaluation.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import logging

from .models import PortfolioMetrics, SectorAllocation, IntelligenceScore, RiskMetrics, QualityMetrics
from .risk_analyzer import RiskAnalyzer
from .quality_evaluator import QualityEvaluator

logger = logging.getLogger(__name__)


class PortfolioAnalyzer:
    """Comprehensive portfolio analysis and optimization."""
    
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate
        self.annualization_factor = 252
        self.risk_analyzer = RiskAnalyzer(risk_free_rate)
        self.quality_evaluator = QualityEvaluator(risk_free_rate)
        
        # Sector mapping for classification
        self.sector_mapping = {
            'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN', 'TSLA', 'NVDA', 'NFLX'],
            'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO', 'ABT', 'DHR', 'LLY'],
            'Finance': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'AXP'],
            'Consumer': ['WMT', 'HD', 'MCD', 'SBUX', 'NKE', 'DIS', 'KO', 'PG'],
            'Energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'PSX', 'VLO', 'MPC'],
            'Utilities': ['NEE', 'DUK', 'SO', 'AEP', 'D', 'EXC', 'SRE', 'XEL'],
            'Industrials': ['BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'FDX', 'LMT'],
            'Materials': ['LIN', 'APD', 'FCX', 'NEM', 'BLL', 'SHW', 'ECL', 'APD'],
            'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'O', 'SPG', 'DLR'],
            'Communication': ['T', 'VZ', 'CMCSA', 'CHTR', 'TMUS', 'PARA', 'FOX', 'NWSA']
        }
    
    def analyze_portfolio(self, portfolio_data: Dict[str, Dict], 
                         weights: Optional[List[float]] = None) -> PortfolioMetrics:
        """
        Analyze a portfolio comprehensively.
        
        Args:
            portfolio_data: Dictionary with symbol -> data mapping
            weights: Portfolio weights (optional, equal weight if not provided)
            
        Returns:
            PortfolioMetrics object
        """
        try:
            symbols = list(portfolio_data.keys())
            
            if not weights:
                weights = [1.0 / len(symbols)] * len(symbols)
            
            if len(weights) != len(symbols):
                raise ValueError("Number of weights must match number of symbols")
            
            # Calculate portfolio-level metrics
            total_value = self._calculate_portfolio_value(portfolio_data, weights)
            total_return = self._calculate_portfolio_return(portfolio_data, weights)
            annual_return = self._calculate_annual_return(portfolio_data, weights)
            
            # Risk metrics
            risk_metrics = self._calculate_portfolio_risk(portfolio_data, weights)
            
            # Sector analysis
            sector_allocations = self._analyze_sector_allocation(portfolio_data, weights)
            diversification_score = self._calculate_diversification_score(sector_allocations)
            concentration_risk = self._calculate_concentration_risk(sector_allocations)
            
            return PortfolioMetrics(
                total_value=total_value,
                total_return=total_return,
                annual_return=annual_return,
                volatility=risk_metrics.volatility,
                sharpe_ratio=risk_metrics.sharpe_ratio,
                max_drawdown=risk_metrics.max_drawdown,
                sector_allocations=sector_allocations,
                diversification_score=diversification_score,
                concentration_risk=concentration_risk
            )
            
        except Exception as e:
            logger.error(f"Error analyzing portfolio: {e}")
            raise
    
    def calculate_intelligence_score(self, portfolio_data: Dict[str, Dict],
                                   weights: Optional[List[float]] = None) -> IntelligenceScore:
        """
        Calculate portfolio intelligence score.
        
        Args:
            portfolio_data: Dictionary with symbol -> data mapping
            weights: Portfolio weights (optional)
            
        Returns:
            IntelligenceScore object
        """
        try:
            symbols = list(portfolio_data.keys())
            
            if not weights:
                weights = [1.0 / len(symbols)] * len(symbols)
            
            # Analyze individual components
            individual_scores = []
            risk_scores = []
            
            for symbol in symbols:
                # Quality analysis
                quality = self.quality_evaluator.evaluate_quality(
                    symbol, 
                    portfolio_data[symbol].get('historical', []),
                    portfolio_data[symbol].get('company', {})
                )
                individual_scores.append(quality.quality_score)
                
                # Risk analysis
                historical_data = portfolio_data[symbol].get('historical', [])
                if historical_data:
                    prices = pd.Series([d.close for d in historical_data])
                    risk_metrics = self.risk_analyzer.calculate_risk_metrics(prices)
                    risk_scores.append(risk_metrics.risk_score)
                else:
                    risk_scores.append(5)  # Default medium risk
            
            # Portfolio-level analysis
            portfolio_metrics = self.analyze_portfolio(portfolio_data, weights)
            
            # Calculate weighted averages
            avg_quality = np.average(individual_scores, weights=weights) if individual_scores else 5
            avg_risk = np.average(risk_scores, weights=weights) if risk_scores else 5
            
            # Intelligence score combines quality, risk management, and diversification
            risk_intelligence = 10 - avg_risk  # Invert risk (lower risk = higher intelligence)
            
            intelligence_score = (
                avg_quality * 0.4 +  # 40% quality
                risk_intelligence * 0.3 +  # 30% risk management
                portfolio_metrics.diversification_score * 0.3  # 30% diversification
            )
            
            # Generate recommendations
            recommendations = self._generate_intelligence_recommendations(
                avg_quality, avg_risk, portfolio_metrics
            )
            
            return IntelligenceScore(
                portfolio_symbols=symbols,
                weights=weights,
                average_quality_score=avg_quality,
                average_risk_score=avg_risk,
                diversification_score=portfolio_metrics.diversification_score,
                intelligence_score=intelligence_score,
                intelligence_rating=self._get_intelligence_rating(intelligence_score),
                recommendations=recommendations,
                risk_metrics=risk_metrics,
                quality_metrics=quality
            )
            
        except Exception as e:
            logger.error(f"Error calculating intelligence score: {e}")
            raise
    
    def _calculate_portfolio_value(self, portfolio_data: Dict[str, Dict], 
                                 weights: List[float]) -> float:
        """Calculate total portfolio value."""
        total_value = 0
        for symbol, data in portfolio_data.items():
            historical = data.get('historical', [])
            if historical:
                latest_price = historical[-1].close
                total_value += latest_price * weights[list(portfolio_data.keys()).index(symbol)]
        return total_value
    
    def _calculate_portfolio_return(self, portfolio_data: Dict[str, Dict], 
                                  weights: List[float]) -> float:
        """Calculate total portfolio return."""
        total_return = 0
        for symbol, data in portfolio_data.items():
            historical = data.get('historical', [])
            if len(historical) >= 2:
                initial_price = historical[0].close
                final_price = historical[-1].close
                asset_return = (final_price / initial_price) - 1
                total_return += asset_return * weights[list(portfolio_data.keys()).index(symbol)]
        return total_return
    
    def _calculate_annual_return(self, portfolio_data: Dict[str, Dict], 
                               weights: List[float]) -> float:
        """Calculate annualized portfolio return."""
        total_return = self._calculate_portfolio_return(portfolio_data, weights)
        
        # Calculate average holding period
        min_length = float('inf')
        for data in portfolio_data.values():
            historical = data.get('historical', [])
            if historical:
                min_length = min(min_length, len(historical))
        
        if min_length == float('inf'):
            return 0
        
        # Annualize return
        return (1 + total_return) ** (self.annualization_factor / min_length) - 1
    
    def _calculate_portfolio_risk(self, portfolio_data: Dict[str, Dict], 
                                weights: List[float]) -> RiskMetrics:
        """Calculate portfolio risk metrics."""
        # Create returns matrix
        returns_data = {}
        for symbol, data in portfolio_data.items():
            historical = data.get('historical', [])
            if len(historical) >= 2:
                prices = pd.Series([d.close for d in historical])
                returns = prices.pct_change().dropna()
                returns_data[symbol] = returns
        
        if not returns_data:
            # Return default risk metrics if no data
            return RiskMetrics(
                volatility=0,
                downside_volatility=0,
                var_95=0,
                var_99=0,
                max_drawdown=0,
                risk_score=5
            )
        
        # Align all return series
        returns_df = pd.DataFrame(returns_data)
        returns_df = returns_df.dropna()
        
        if len(returns_df) == 0:
            return RiskMetrics(
                volatility=0,
                downside_volatility=0,
                var_95=0,
                var_99=0,
                max_drawdown=0,
                risk_score=5
            )
        
        # Calculate portfolio returns
        portfolio_returns = (returns_df * weights[:len(returns_df.columns)]).sum(axis=1)
        
        return self.risk_analyzer.calculate_risk_metrics(portfolio_returns)
    
    def _analyze_sector_allocation(self, portfolio_data: Dict[str, Dict], 
                                 weights: List[float]) -> List[SectorAllocation]:
        """Analyze sector allocation of the portfolio."""
        sector_values = {}
        sector_counts = {}
        
        for i, (symbol, data) in enumerate(portfolio_data.items()):
            sector = self._classify_sector(symbol, data.get('company', {}))
            
            # Get current value
            historical = data.get('historical', [])
            current_value = historical[-1].close if historical else 0
            weighted_value = current_value * weights[i]
            
            if sector not in sector_values:
                sector_values[sector] = 0
                sector_counts[sector] = 0
            
            sector_values[sector] += weighted_value
            sector_counts[sector] += 1
        
        # Calculate total portfolio value
        total_value = sum(sector_values.values())
        
        # Create sector allocations
        sector_allocations = []
        for sector, value in sector_values.items():
            allocation = SectorAllocation(
                sector=sector,
                allocation=(value / total_value * 100) if total_value > 0 else 0,
                value=value,
                count=sector_counts[sector]
            )
            sector_allocations.append(allocation)
        
        # Sort by allocation
        sector_allocations.sort(key=lambda x: x.allocation, reverse=True)
        
        return sector_allocations
    
    def _classify_sector(self, symbol: str, company_info: Dict[str, Any]) -> str:
        """Classify a symbol into a sector."""
        # First try company info
        if company_info and company_info.get('sector'):
            return company_info['sector']
        
        # Fall back to symbol mapping
        symbol_upper = symbol.upper()
        for sector, symbols in self.sector_mapping.items():
            if symbol_upper in [s.upper() for s in symbols]:
                return sector
        
        return 'Unknown'
    
    def _calculate_diversification_score(self, sector_allocations: List[SectorAllocation]) -> float:
        """Calculate diversification score based on sector distribution."""
        if not sector_allocations:
            return 0
        
        # Herfindahl-Hirschman Index (lower is more diversified)
        hhi = sum((allocation.allocation / 100) ** 2 for allocation in sector_allocations)
        
        # Convert to diversification score (0-10 scale, higher is better)
        base_score = (1 - hhi) * 10
        
        # Bonus for number of sectors
        sector_bonus = min(len(sector_allocations) * 0.5, 2)
        
        # Penalty for concentration (if any sector > 40%)
        concentration_penalty = sum(
            max(0, allocation.allocation - 40) * 0.1 
            for allocation in sector_allocations
        )
        
        final_score = base_score + sector_bonus - concentration_penalty
        return max(0, min(10, final_score))
    
    def _calculate_concentration_risk(self, sector_allocations: List[SectorAllocation]) -> float:
        """Calculate concentration risk score."""
        if not sector_allocations:
            return 0
        
        # Calculate concentration risk based on largest allocations
        max_allocation = max(allocation.allocation for allocation in sector_allocations)
        top_3_allocation = sum(
            allocation.allocation 
            for allocation in sector_allocations[:3]
        )
        
        # Risk increases with concentration
        concentration_risk = (max_allocation / 100) * 5 + (top_3_allocation / 100) * 5
        return min(10, concentration_risk)
    
    def _get_intelligence_rating(self, score: float) -> str:
        """Convert intelligence score to rating."""
        if score >= 8.5:
            return "Highly Intelligent"
        elif score >= 7.0:
            return "Intelligent"
        elif score >= 5.5:
            return "Moderately Intelligent"
        elif score >= 4.0:
            return "Below Average"
        else:
            return "Needs Improvement"
    
    def _generate_intelligence_recommendations(self, avg_quality: float, avg_risk: float,
                                             portfolio_metrics: PortfolioMetrics) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # Quality recommendations
        if avg_quality < 5:
            recommendations.append("Consider replacing low-quality holdings with higher-performing alternatives")
        
        if avg_quality < 6:
            recommendations.append("Focus on improving overall portfolio quality through better stock selection")
        
        # Risk recommendations
        if avg_risk > 7:
            recommendations.append("Portfolio has high risk - consider adding defensive stocks or bonds")
        
        if avg_risk > 8:
            recommendations.append("Very high risk portfolio - review risk tolerance and consider rebalancing")
        
        # Diversification recommendations
        if portfolio_metrics.diversification_score < 5:
            recommendations.append("Improve diversification by adding stocks from underrepresented sectors")
        
        if portfolio_metrics.diversification_score < 3:
            recommendations.append("Poor diversification - significant concentration risk detected")
        
        if len(portfolio_metrics.sector_allocations) < 4:
            recommendations.append("Expand sector exposure to reduce concentration risk")
        
        # Concentration recommendations
        if portfolio_metrics.concentration_risk > 7:
            recommendations.append("High concentration risk - consider reducing exposure to largest holdings")
        
        # Performance recommendations
        if portfolio_metrics.sharpe_ratio < 0.5:
            recommendations.append("Risk-adjusted returns are below optimal levels")
        
        if portfolio_metrics.max_drawdown < -0.20:
            recommendations.append("High maximum drawdown - consider risk management strategies")
        
        if not recommendations:
            recommendations.append("Portfolio shows good balance across quality, risk, and diversification metrics")
        
        return recommendations
    
    def optimize_portfolio(self, portfolio_data: Dict[str, Dict],
                          target_return: Optional[float] = None,
                          risk_tolerance: float = 0.5) -> Dict[str, Any]:
        """
        Optimize portfolio weights using Modern Portfolio Theory.
        
        Args:
            portfolio_data: Dictionary with symbol -> data mapping
            target_return: Target annual return (optional)
            risk_tolerance: Risk tolerance (0-1, higher = more risk)
            
        Returns:
            Optimization results
        """
        try:
            symbols = list(portfolio_data.keys())
            
            # Create returns matrix
            returns_data = {}
            for symbol, data in portfolio_data.items():
                historical = data.get('historical', [])
                if len(historical) >= 2:
                    prices = pd.Series([d.close for d in historical])
                    returns = prices.pct_change().dropna()
                    returns_data[symbol] = returns
            
            if len(returns_data) < 2:
                raise ValueError("Need at least 2 assets for optimization")
            
            # Align all return series
            returns_df = pd.DataFrame(returns_data)
            returns_df = returns_df.dropna()
            
            if len(returns_df) == 0:
                raise ValueError("No overlapping return data available")
            
            # Calculate expected returns and covariance matrix
            expected_returns = returns_df.mean() * self.annualization_factor
            cov_matrix = returns_df.cov() * self.annualization_factor
            
            # Optimize weights
            if target_return is not None:
                # Optimize for minimum risk given target return
                optimal_weights = self._optimize_min_risk_target_return(
                    expected_returns, cov_matrix, target_return
                )
            else:
                # Optimize for maximum Sharpe ratio
                optimal_weights = self._optimize_max_sharpe_ratio(
                    expected_returns, cov_matrix
                )
            
            # Calculate optimized portfolio metrics
            optimized_returns = (returns_df * optimal_weights).sum(axis=1)
            optimized_risk_metrics = self.risk_analyzer.calculate_risk_metrics(optimized_returns)
            
            return {
                'optimal_weights': dict(zip(symbols, optimal_weights)),
                'expected_return': np.sum(expected_returns * optimal_weights),
                'expected_volatility': optimized_risk_metrics.volatility,
                'expected_sharpe_ratio': optimized_risk_metrics.sharpe_ratio,
                'risk_metrics': optimized_risk_metrics
            }
            
        except Exception as e:
            logger.error(f"Error optimizing portfolio: {e}")
            raise
    
    def _optimize_min_risk_target_return(self, expected_returns: pd.Series, 
                                       cov_matrix: pd.DataFrame, 
                                       target_return: float) -> np.ndarray:
        """Optimize for minimum risk given target return."""
        from scipy.optimize import minimize
        
        n_assets = len(expected_returns)
        
        def objective(weights):
            return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # weights sum to 1
            {'type': 'eq', 'fun': lambda x: np.sum(expected_returns * x) - target_return}  # target return
        ]
        
        bounds = tuple((0, 1) for _ in range(n_assets))  # weights between 0 and 1
        
        result = minimize(
            objective,
            n_assets * [1./n_assets],
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        if not result.success:
            raise ValueError("Optimization failed")
        
        return result.x
    
    def _optimize_max_sharpe_ratio(self, expected_returns: pd.Series, 
                                 cov_matrix: pd.DataFrame) -> np.ndarray:
        """Optimize for maximum Sharpe ratio."""
        from scipy.optimize import minimize
        
        n_assets = len(expected_returns)
        
        def objective(weights):
            portfolio_return = np.sum(expected_returns * weights)
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
            return -sharpe_ratio  # Minimize negative Sharpe ratio
        
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}  # weights sum to 1
        ]
        
        bounds = tuple((0, 1) for _ in range(n_assets))  # weights between 0 and 1
        
        result = minimize(
            objective,
            n_assets * [1./n_assets],
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        if not result.success:
            raise ValueError("Optimization failed")
        
        return result.x 