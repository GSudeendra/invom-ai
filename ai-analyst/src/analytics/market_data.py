"""
Market data provider module for fetching and managing financial data.
"""

import asyncio
import pandas as pd
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import logging
import json
import os

from .models import MarketData, DataProviderConfig
from .api_client import APIClient, create_api_client

logger = logging.getLogger(__name__)


class MarketDataProvider:
    """Centralized market data provider with caching and management."""
    
    def __init__(self, api_client: APIClient = None, cache_dir: str = "cache"):
        self.api_client = api_client or create_api_client("yahoo")
        self.cache_dir = cache_dir
        self.cache = {}
        
        # Ensure cache directory exists
        os.makedirs(cache_dir, exist_ok=True)
    
    async def get_historical_data(self, symbol: str, period: str = "1y") -> List[MarketData]:
        """
        Get historical market data for a symbol.
        
        Args:
            symbol: Stock/fund symbol
            period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            
        Returns:
            List of MarketData objects
        """
        try:
            # Check cache first
            cache_key = f"{symbol}_{period}"
            cached_data = self._get_cached_data(cache_key)
            if cached_data:
                return cached_data
            
            # Fetch from API
            data = await self.api_client.get_historical_data(symbol, period)
            
            # Cache the data
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []
    
    async def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """
        Get company information for a symbol.
        
        Args:
            symbol: Stock/fund symbol
            
        Returns:
            Company information dictionary
        """
        try:
            # Check cache first
            cache_key = f"{symbol}_company_info"
            cached_data = self._get_cached_data(cache_key)
            if cached_data:
                return cached_data
            
            # Fetch from API
            data = await self.api_client.get_company_info(symbol)
            
            # Cache the data
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching company info for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}
    
    async def get_sector_info(self, symbol: str) -> Dict[str, Any]:
        """
        Get sector information for a symbol.
        
        Args:
            symbol: Stock/fund symbol
            
        Returns:
            Sector information dictionary
        """
        try:
            # Check cache first
            cache_key = f"{symbol}_sector_info"
            cached_data = self._get_cached_data(cache_key)
            if cached_data:
                return cached_data
            
            # Fetch from API
            data = await self.api_client.get_sector_info(symbol)
            
            # Cache the data
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching sector info for {symbol}: {e}")
            return {'symbol': symbol, 'sector': 'Unknown', 'industry': 'Unknown'}
    
    async def get_portfolio_data(self, symbols: List[str], period: str = "1y") -> Dict[str, Dict]:
        """
        Get comprehensive data for a portfolio of symbols.
        
        Args:
            symbols: List of symbols
            period: Time period for historical data
            
        Returns:
            Dictionary with symbol -> data mapping
        """
        try:
            portfolio_data = {}
            
            # Fetch data for all symbols concurrently
            tasks = []
            for symbol in symbols:
                task = self._fetch_symbol_data(symbol, period)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for symbol, result in zip(symbols, results):
                if isinstance(result, Exception):
                    logger.error(f"Error fetching data for {symbol}: {result}")
                    portfolio_data[symbol] = {
                        'historical': [],
                        'company': {'symbol': symbol, 'error': str(result)},
                        'sector': {'symbol': symbol, 'sector': 'Unknown'}
                    }
                else:
                    portfolio_data[symbol] = result
            
            return portfolio_data
            
        except Exception as e:
            logger.error(f"Error fetching portfolio data: {e}")
            raise
    
    async def _fetch_symbol_data(self, symbol: str, period: str) -> Dict[str, Any]:
        """Fetch all data for a single symbol."""
        try:
            # Fetch data concurrently
            historical_task = self.get_historical_data(symbol, period)
            company_task = self.get_company_info(symbol)
            sector_task = self.get_sector_info(symbol)
            
            historical, company, sector = await asyncio.gather(
                historical_task, company_task, sector_task
            )
            
            return {
                'historical': historical,
                'company': company,
                'sector': sector
            }
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return {
                'historical': [],
                'company': {'symbol': symbol, 'error': str(e)},
                'sector': {'symbol': symbol, 'sector': 'Unknown'}
            }
    
    def _get_cached_data(self, cache_key: str) -> Optional[Any]:
        """Get data from cache."""
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if os.path.exists(cache_file):
            try:
                # Check if cache is still valid (24 hours)
                file_time = os.path.getmtime(cache_file)
                if datetime.now().timestamp() - file_time < 86400:  # 24 hours
                    with open(cache_file, 'r') as f:
                        return json.load(f)
            except Exception as e:
                logger.warning(f"Error reading cache file {cache_file}: {e}")
        
        return None
    
    def _cache_data(self, cache_key: str, data: Any):
        """Cache data to file."""
        try:
            cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
            
            # Convert MarketData objects to dictionaries for JSON serialization
            if isinstance(data, list) and data and hasattr(data[0], 'dict'):
                serializable_data = [item.dict() for item in data]
            else:
                serializable_data = data
            
            with open(cache_file, 'w') as f:
                json.dump(serializable_data, f, default=str)
                
        except Exception as e:
            logger.warning(f"Error caching data for {cache_key}: {e}")
    
    def clear_cache(self, symbol: Optional[str] = None):
        """
        Clear cache for a specific symbol or all cache.
        
        Args:
            symbol: Symbol to clear cache for (None for all)
        """
        try:
            if symbol:
                # Clear cache for specific symbol
                pattern = f"{symbol}_*"
                for filename in os.listdir(self.cache_dir):
                    if filename.startswith(f"{symbol}_"):
                        os.remove(os.path.join(self.cache_dir, filename))
            else:
                # Clear all cache
                for filename in os.listdir(self.cache_dir):
                    if filename.endswith('.json'):
                        os.remove(os.path.join(self.cache_dir, filename))
                        
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            cache_files = [f for f in os.listdir(self.cache_dir) if f.endswith('.json')]
            
            total_size = 0
            for filename in cache_files:
                file_path = os.path.join(self.cache_dir, filename)
                total_size += os.path.getsize(file_path)
            
            return {
                'total_files': len(cache_files),
                'total_size_mb': total_size / (1024 * 1024),
                'cache_dir': self.cache_dir
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {'error': str(e)}
    
    async def validate_data_quality(self, symbol: str, period: str = "1y") -> Dict[str, Any]:
        """
        Validate the quality of market data for a symbol.
        
        Args:
            symbol: Stock/fund symbol
            period: Time period
            
        Returns:
            Data quality assessment
        """
        try:
            historical_data = await self.get_historical_data(symbol, period)
            
            if not historical_data:
                return {
                    'symbol': symbol,
                    'quality_score': 0,
                    'issues': ['No data available'],
                    'data_points': 0
                }
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame([
                {
                    'timestamp': data.timestamp,
                    'close': data.close,
                    'volume': data.volume
                }
                for data in historical_data
            ])
            
            issues = []
            quality_score = 10  # Start with perfect score
            
            # Check for missing data
            expected_days = self._get_expected_days(period)
            actual_days = len(df)
            data_completeness = actual_days / expected_days if expected_days > 0 else 0
            
            if data_completeness < 0.8:
                issues.append(f"Low data completeness: {data_completeness:.1%}")
                quality_score -= 3
            
            # Check for price anomalies
            prices = df['close']
            price_changes = prices.pct_change().dropna()
            
            # Check for extreme price changes (>50% in one day)
            extreme_changes = (abs(price_changes) > 0.5).sum()
            if extreme_changes > 0:
                issues.append(f"Found {extreme_changes} extreme price changes")
                quality_score -= 1
            
            # Check for zero or negative prices
            invalid_prices = (prices <= 0).sum()
            if invalid_prices > 0:
                issues.append(f"Found {invalid_prices} invalid prices")
                quality_score -= 5
            
            # Check for volume data
            volumes = df['volume']
            zero_volumes = (volumes == 0).sum()
            if zero_volumes > len(volumes) * 0.1:  # More than 10% zero volumes
                issues.append(f"High number of zero volume days: {zero_volumes}")
                quality_score -= 1
            
            # Check for recent data
            latest_date = df['timestamp'].max()
            days_since_update = (datetime.now() - latest_date).days
            if days_since_update > 7:
                issues.append(f"Data may be stale (last update: {days_since_update} days ago)")
                quality_score -= 1
            
            return {
                'symbol': symbol,
                'quality_score': max(0, quality_score),
                'issues': issues,
                'data_points': len(df),
                'data_completeness': data_completeness,
                'latest_date': latest_date.isoformat(),
                'days_since_update': days_since_update
            }
            
        except Exception as e:
            logger.error(f"Error validating data quality for {symbol}: {e}")
            return {
                'symbol': symbol,
                'quality_score': 0,
                'issues': [f'Validation error: {str(e)}'],
                'data_points': 0
            }
    
    def _get_expected_days(self, period: str) -> int:
        """Get expected number of trading days for a period."""
        period_map = {
            '1d': 1,
            '5d': 5,
            '1mo': 22,
            '3mo': 66,
            '6mo': 126,
            '1y': 252,
            '2y': 504,
            '5y': 1260,
            '10y': 2520,
            'ytd': 252,  # Approximate
            'max': 2520  # Approximate
        }
        return period_map.get(period, 252)
    
    async def get_market_summary(self, symbols: List[str]) -> Dict[str, Any]:
        """
        Get market summary for a list of symbols.
        
        Args:
            symbols: List of symbols
            
        Returns:
            Market summary data
        """
        try:
            summary = {
                'timestamp': datetime.now().isoformat(),
                'symbols': symbols,
                'market_data': {},
                'summary_stats': {}
            }
            
            # Get latest data for all symbols
            for symbol in symbols:
                try:
                    historical_data = await self.get_historical_data(symbol, "5d")
                    if historical_data:
                        latest = historical_data[-1]
                        previous = historical_data[-2] if len(historical_data) > 1 else latest
                        
                        change = latest.close - previous.close
                        change_pct = (change / previous.close) * 100
                        
                        summary['market_data'][symbol] = {
                            'price': latest.close,
                            'change': change,
                            'change_pct': change_pct,
                            'volume': latest.volume,
                            'timestamp': latest.timestamp.isoformat()
                        }
                except Exception as e:
                    logger.warning(f"Error getting market data for {symbol}: {e}")
                    summary['market_data'][symbol] = {'error': str(e)}
            
            # Calculate summary statistics
            if summary['market_data']:
                prices = [data['price'] for data in summary['market_data'].values() 
                         if 'price' in data]
                changes = [data['change_pct'] for data in summary['market_data'].values() 
                          if 'change_pct' in data]
                
                if prices:
                    summary['summary_stats'] = {
                        'avg_price': sum(prices) / len(prices),
                        'total_change_pct': sum(changes),
                        'advancing': len([c for c in changes if c > 0]),
                        'declining': len([c for c in changes if c < 0]),
                        'unchanged': len([c for c in changes if c == 0])
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting market summary: {e}")
            return {'error': str(e)}
    
    async def close(self):
        """Close the API client."""
        if self.api_client:
            await self.api_client.close() 