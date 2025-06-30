"""
Risk analysis module for financial instruments and portfolios.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime, timedelta
import logging
from scipy import stats
from scipy.optimize import minimize

from .models import RiskMetrics, MarketData

logger = logging.getLogger(__name__)


class RiskAnalyzer:
    """Comprehensive risk analysis for financial instruments."""
    
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate
        self.annualization_factor = 252  # Trading days per year
    
    def calculate_risk_metrics(self, prices: pd.Series, 
                             market_prices: pd.Series = None,
                             weights: List[float] = None) -> RiskMetrics:
        """
        Calculate comprehensive risk metrics for a financial instrument or portfolio.
        
        Args:
            prices: Price series for the asset/portfolio
            market_prices: Market benchmark prices (optional)
            weights: Portfolio weights (for portfolio analysis)
            
        Returns:
            RiskMetrics object with all calculated metrics
        """
        try:
            # Convert to pandas Series if needed
            if not isinstance(prices, pd.Series):
                prices = pd.Series(prices)
            
            # Calculate returns
            returns = prices.pct_change().dropna()
            
            if len(returns) < 30:  # Need minimum data points
                raise ValueError("Insufficient data for risk analysis (minimum 30 data points required)")
            
            # Basic risk metrics
            volatility = returns.std() * np.sqrt(self.annualization_factor)
            downside_returns = returns[returns < 0]
            downside_volatility = downside_returns.std() * np.sqrt(self.annualization_factor) if len(downside_returns) > 0 else 0
            
            # Value at Risk (VaR)
            var_95 = np.percentile(returns, 5)
            var_99 = np.percentile(returns, 1)
            
            # Expected Shortfall (Conditional VaR)
            es_95 = returns[returns <= var_95].mean() if len(returns[returns <= var_95]) > 0 else var_95
            es_99 = returns[returns <= var_99].mean() if len(returns[returns <= var_99]) > 0 else var_99
            
            # Maximum Drawdown
            cumulative = (1 + returns).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = drawdown.min()
            
            # Calculate beta if market data provided
            beta = None
            if market_prices is not None:
                market_returns = market_prices.pct_change().dropna()
                aligned_returns = returns.align(market_returns, join='inner')
                if len(aligned_returns[0]) > 0:
                    beta = np.cov(aligned_returns[0], aligned_returns[1])[0,1] / np.var(aligned_returns[1])
            
            # Sharpe and Sortino ratios
            annual_return = returns.mean() * self.annualization_factor
            sharpe_ratio = (annual_return - self.risk_free_rate) / volatility if volatility > 0 else 0
            sortino_ratio = (annual_return - self.risk_free_rate) / downside_volatility if downside_volatility > 0 else 0
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(
                volatility, max_drawdown, downside_volatility, beta
            )
            
            return RiskMetrics(
                volatility=volatility,
                downside_volatility=downside_volatility,
                var_95=var_95,
                var_99=var_99,
                max_drawdown=max_drawdown,
                risk_score=risk_score,
                beta=beta,
                sharpe_ratio=sharpe_ratio,
                sortino_ratio=sortino_ratio
            )
            
        except Exception as e:
            logger.error(f"Error calculating risk metrics: {e}")
            raise
    
    def _calculate_risk_score(self, volatility: float, max_drawdown: float, 
                            downside_vol: float, beta: Optional[float] = None) -> int:
        """
        Calculate risk score from 1 (low risk) to 10 (high risk).
        
        Args:
            volatility: Annualized volatility
            max_drawdown: Maximum drawdown
            downside_vol: Downside volatility
            beta: Beta coefficient (optional)
            
        Returns:
            Risk score from 1 to 10
        """
        # Normalize metrics to 0-10 scale
        vol_score = min(volatility * 10, 10)  # Cap at 10
        drawdown_score = min(abs(max_drawdown) * 20, 10)  # Cap at 10
        downside_score = min(downside_vol * 10, 10)  # Cap at 10
        
        # Beta contribution (if available)
        beta_score = 0
        if beta is not None:
            beta_score = min(max(beta * 2, 0), 10)  # Beta of 5 = max score
        
        # Weighted average
        weights = [0.3, 0.3, 0.2, 0.2]  # volatility, drawdown, downside, beta
        scores = [vol_score, drawdown_score, downside_score, beta_score]
        
        composite_score = sum(w * s for w, s in zip(weights, scores)) / sum(weights[:3])  # Normalize by sum of first 3 weights
        
        return max(1, min(10, int(round(composite_score))))
    
    def calculate_portfolio_risk(self, returns_matrix: pd.DataFrame, 
                               weights: List[float]) -> RiskMetrics:
        """
        Calculate portfolio risk metrics using Modern Portfolio Theory.
        
        Args:
            returns_matrix: DataFrame with returns for each asset (columns) over time (rows)
            weights: Portfolio weights for each asset
            
        Returns:
            RiskMetrics for the portfolio
        """
        try:
            # Validate inputs
            if len(weights) != len(returns_matrix.columns):
                raise ValueError("Number of weights must match number of assets")
            
            if abs(sum(weights) - 1.0) > 0.01:
                raise ValueError("Weights must sum to 1.0")
            
            # Calculate portfolio returns
            portfolio_returns = (returns_matrix * weights).sum(axis=1)
            
            # Calculate portfolio risk metrics
            return self.calculate_risk_metrics(portfolio_returns)
            
        except Exception as e:
            logger.error(f"Error calculating portfolio risk: {e}")
            raise
    
    def calculate_efficient_frontier(self, returns_matrix: pd.DataFrame, 
                                   risk_free_rate: float = None) -> Dict[str, np.ndarray]:
        """
        Calculate efficient frontier using Modern Portfolio Theory.
        
        Args:
            returns_matrix: DataFrame with returns for each asset
            risk_free_rate: Risk-free rate (uses instance default if None)
            
        Returns:
            Dictionary with efficient frontier data
        """
        if risk_free_rate is None:
            risk_free_rate = self.risk_free_rate
        
        try:
            # Calculate expected returns and covariance matrix
            expected_returns = returns_matrix.mean() * self.annualization_factor
            cov_matrix = returns_matrix.cov() * self.annualization_factor
            
            n_assets = len(expected_returns)
            
            # Generate random portfolios
            n_portfolios = 10000
            portfolio_returns = []
            portfolio_volatilities = []
            portfolio_weights = []
            
            for _ in range(n_portfolios):
                # Generate random weights
                weights = np.random.random(n_assets)
                weights = weights / np.sum(weights)
                
                # Calculate portfolio metrics
                portfolio_return = np.sum(expected_returns * weights)
                portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
                
                portfolio_returns.append(portfolio_return)
                portfolio_volatilities.append(portfolio_volatility)
                portfolio_weights.append(weights)
            
            # Find efficient frontier
            efficient_frontier = []
            efficient_weights = []
            
            for target_return in np.linspace(min(portfolio_returns), max(portfolio_returns), 100):
                # Minimize volatility for given return
                constraints = [
                    {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # weights sum to 1
                    {'type': 'eq', 'fun': lambda x: np.sum(expected_returns * x) - target_return}  # target return
                ]
                
                bounds = tuple((0, 1) for _ in range(n_assets))  # weights between 0 and 1
                
                result = minimize(
                    lambda x: np.sqrt(np.dot(x.T, np.dot(cov_matrix, x))),
                    n_assets * [1./n_assets],
                    method='SLSQP',
                    bounds=bounds,
                    constraints=constraints
                )
                
                if result.success:
                    efficient_frontier.append(result.fun)
                    efficient_weights.append(result.x)
            
            return {
                'volatilities': np.array(efficient_frontier),
                'returns': np.linspace(min(portfolio_returns), max(portfolio_returns), 100),
                'weights': np.array(efficient_weights)
            }
            
        except Exception as e:
            logger.error(f"Error calculating efficient frontier: {e}")
            raise
    
    def calculate_var_historical(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """
        Calculate Value at Risk using historical simulation.
        
        Args:
            returns: Return series
            confidence_level: Confidence level (e.g., 0.95 for 95% VaR)
            
        Returns:
            VaR value
        """
        return np.percentile(returns, (1 - confidence_level) * 100)
    
    def calculate_var_parametric(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """
        Calculate Value at Risk using parametric method (assuming normal distribution).
        
        Args:
            returns: Return series
            confidence_level: Confidence level
            
        Returns:
            VaR value
        """
        mean_return = returns.mean()
        std_return = returns.std()
        z_score = stats.norm.ppf(1 - confidence_level)
        
        return mean_return + z_score * std_return
    
    def calculate_stress_test(self, returns: pd.Series, 
                            stress_scenarios: Dict[str, float]) -> Dict[str, float]:
        """
        Perform stress testing on returns.
        
        Args:
            returns: Return series
            stress_scenarios: Dictionary of stress scenarios and their multipliers
            
        Returns:
            Dictionary with stress test results
        """
        results = {}
        
        for scenario, multiplier in stress_scenarios.items():
            # Apply stress scenario
            stressed_returns = returns * multiplier
            
            # Calculate stressed metrics
            stressed_volatility = stressed_returns.std() * np.sqrt(self.annualization_factor)
            stressed_var = self.calculate_var_historical(stressed_returns, 0.95)
            stressed_max_dd = self._calculate_max_drawdown(stressed_returns)
            
            results[scenario] = {
                'volatility': stressed_volatility,
                'var_95': stressed_var,
                'max_drawdown': stressed_max_dd
            }
        
        return results
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown from returns."""
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return drawdown.min()
    
    def calculate_correlation_matrix(self, returns_matrix: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate correlation matrix for assets.
        
        Args:
            returns_matrix: DataFrame with returns for each asset
            
        Returns:
            Correlation matrix
        """
        return returns_matrix.corr()
    
    def calculate_beta(self, asset_returns: pd.Series, market_returns: pd.Series) -> float:
        """
        Calculate beta for an asset relative to the market.
        
        Args:
            asset_returns: Asset return series
            market_returns: Market return series
            
        Returns:
            Beta coefficient
        """
        # Align the series
        aligned_returns = asset_returns.align(market_returns, join='inner')
        
        if len(aligned_returns[0]) == 0:
            raise ValueError("No overlapping data between asset and market returns")
        
        asset_ret, market_ret = aligned_returns
        
        # Calculate beta
        covariance = np.cov(asset_ret, market_ret)[0, 1]
        market_variance = np.var(market_ret)
        
        return covariance / market_variance if market_variance > 0 else 0
    
    def calculate_treynor_ratio(self, asset_returns: pd.Series, 
                              market_returns: pd.Series) -> float:
        """
        Calculate Treynor ratio (excess return per unit of systematic risk).
        
        Args:
            asset_returns: Asset return series
            market_returns: Market return series
            
        Returns:
            Treynor ratio
        """
        beta = self.calculate_beta(asset_returns, market_returns)
        excess_return = asset_returns.mean() * self.annualization_factor - self.risk_free_rate
        
        return excess_return / beta if beta != 0 else 0
    
    def calculate_information_ratio(self, portfolio_returns: pd.Series, 
                                  benchmark_returns: pd.Series) -> float:
        """
        Calculate information ratio (excess return per unit of tracking error).
        
        Args:
            portfolio_returns: Portfolio return series
            benchmark_returns: Benchmark return series
            
        Returns:
            Information ratio
        """
        # Align the series
        aligned_returns = portfolio_returns.align(benchmark_returns, join='inner')
        
        if len(aligned_returns[0]) == 0:
            raise ValueError("No overlapping data between portfolio and benchmark returns")
        
        portfolio_ret, benchmark_ret = aligned_returns
        
        # Calculate excess returns
        excess_returns = portfolio_ret - benchmark_ret
        
        # Calculate information ratio
        average_excess_return = excess_returns.mean() * self.annualization_factor
        tracking_error = excess_returns.std() * np.sqrt(self.annualization_factor)
        
        return average_excess_return / tracking_error if tracking_error > 0 else 0 