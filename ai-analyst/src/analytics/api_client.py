"""
Generic API client for financial data providers.
"""

import asyncio
import aiohttp
import requests
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import time
import json
import logging
from abc import ABC, abstractmethod
from asyncio_throttle import Throttler

from .models import DataProviderConfig, MarketData, AnalysisRequest, AnalysisResponse

logger = logging.getLogger(__name__)


class DataProvider(ABC):
    """Abstract base class for data providers."""
    
    def __init__(self, config: DataProviderConfig):
        self.config = config
        self.session = None
        self.throttler = Throttler(rate_limit=config.rate_limit, period=60)
        self.cache = {}
        self.last_request_time = 0
        
    @abstractmethod
    async def get_historical_data(self, symbol: str, period: str = "1y") -> List[MarketData]:
        """Get historical market data for a symbol."""
        pass
    
    @abstractmethod
    async def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """Get company information and fundamentals."""
        pass
    
    @abstractmethod
    async def get_sector_info(self, symbol: str) -> Dict[str, Any]:
        """Get sector classification for a symbol."""
        pass
    
    async def _make_request(self, url: str, params: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        """Make a rate-limited API request."""
        await self.throttler.acquire()
        
        # Respect rate limits
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_interval = 60.0 / self.config.rate_limit
        
        if time_since_last < min_interval:
            await asyncio.sleep(min_interval - time_since_last)
        
        try:
            if self.session is None:
                self.session = aiohttp.ClientSession(
                    timeout=aiohttp.ClientTimeout(total=self.config.timeout)
                )
            
            async with self.session.get(url, params=params, headers=headers) as response:
                self.last_request_time = time.time()
                
                if response.status == 200:
                    return await response.json()
                elif response.status == 429:  # Rate limited
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited, waiting {retry_after} seconds")
                    await asyncio.sleep(retry_after)
                    return await self._make_request(url, params, headers)
                else:
                    response.raise_for_status()
                    
        except Exception as e:
            logger.error(f"API request failed: {e}")
            raise
    
    def _get_cache_key(self, symbol: str, data_type: str, period: str = None) -> str:
        """Generate cache key for data."""
        return f"{self.config.name}:{symbol}:{data_type}:{period}"
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid."""
        if cache_key not in self.cache:
            return False
        
        cache_time, _ = self.cache[cache_key]
        return (datetime.now() - cache_time).seconds < self.config.cache_ttl
    
    def _cache_data(self, cache_key: str, data: Any):
        """Cache data with timestamp."""
        self.cache[cache_key] = (datetime.now(), data)
    
    async def close(self):
        """Close the session."""
        if self.session:
            await self.session.close()


class YahooFinanceProvider(DataProvider):
    """Yahoo Finance data provider."""
    
    def __init__(self, config: DataProviderConfig = None):
        if config is None:
            config = DataProviderConfig(
                name="yahoo_finance",
                base_url="https://query1.finance.yahoo.com",
                rate_limit=100,
                timeout=30
            )
        super().__init__(config)
    
    async def get_historical_data(self, symbol: str, period: str = "1y") -> List[MarketData]:
        """Get historical data from Yahoo Finance."""
        cache_key = self._get_cache_key(symbol, "historical", period)
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key][1]
        
        try:
            import yfinance as yf
            
            # Use yfinance for historical data
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if hist.empty:
                return []
            
            market_data = []
            for timestamp, row in hist.iterrows():
                data = MarketData(
                    symbol=symbol,
                    timestamp=timestamp.to_pydatetime(),
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']),
                    adjusted_close=float(row['Close']) if 'Adj Close' not in row else float(row['Adj Close'])
                )
                market_data.append(data)
            
            self._cache_data(cache_key, market_data)
            return market_data
            
        except Exception as e:
            logger.error(f"Failed to get historical data for {symbol}: {e}")
            return []
    
    async def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """Get company information from Yahoo Finance."""
        cache_key = self._get_cache_key(symbol, "company_info")
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key][1]
        
        try:
            import yfinance as yf
            
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Extract relevant information
            company_info = {
                'symbol': symbol,
                'name': info.get('longName', ''),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                'debt_to_equity': info.get('debtToEquity'),
                'profit_margins': info.get('profitMargins'),
                'return_on_equity': info.get('returnOnEquity'),
                'beta': info.get('beta'),
                'dividend_yield': info.get('dividendYield'),
                'price_to_book': info.get('priceToBook'),
                'enterprise_value': info.get('enterpriseValue')
            }
            
            self._cache_data(cache_key, company_info)
            return company_info
            
        except Exception as e:
            logger.error(f"Failed to get company info for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}
    
    async def get_sector_info(self, symbol: str) -> Dict[str, Any]:
        """Get sector information from Yahoo Finance."""
        company_info = await self.get_company_info(symbol)
        
        return {
            'symbol': symbol,
            'sector': company_info.get('sector', 'Unknown'),
            'industry': company_info.get('industry', 'Unknown'),
            'sub_industry': company_info.get('sub_industry', 'Unknown')
        }


class AlphaVantageProvider(DataProvider):
    """Alpha Vantage data provider."""
    
    def __init__(self, api_key: str):
        config = DataProviderConfig(
            name="alpha_vantage",
            api_key=api_key,
            base_url="https://www.alphavantage.co/query",
            rate_limit=5,  # Alpha Vantage has strict rate limits
            timeout=30
        )
        super().__init__(config)
    
    async def get_historical_data(self, symbol: str, period: str = "1y") -> List[MarketData]:
        """Get historical data from Alpha Vantage."""
        cache_key = self._get_cache_key(symbol, "historical", period)
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key][1]
        
        try:
            params = {
                'function': 'TIME_SERIES_DAILY_ADJUSTED',
                'symbol': symbol,
                'apikey': self.config.api_key,
                'outputsize': 'full' if period in ['2y', '5y', 'max'] else 'compact'
            }
            
            data = await self._make_request(self.config.base_url, params=params)
            
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage error: {data['Error Message']}")
                return []
            
            time_series = data.get('Time Series (Daily)', {})
            market_data = []
            
            for date_str, values in time_series.items():
                data_point = MarketData(
                    symbol=symbol,
                    timestamp=datetime.strptime(date_str, '%Y-%m-%d'),
                    open=float(values['1. open']),
                    high=float(values['2. high']),
                    low=float(values['3. low']),
                    close=float(values['4. close']),
                    volume=int(values['6. volume']),
                    adjusted_close=float(values['5. adjusted close'])
                )
                market_data.append(data_point)
            
            # Sort by date and limit to requested period
            market_data.sort(key=lambda x: x.timestamp)
            
            if period != 'max':
                days_map = {'1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730, '5y': 1825}
                days = days_map.get(period, 365)
                cutoff_date = datetime.now() - timedelta(days=days)
                market_data = [d for d in market_data if d.timestamp >= cutoff_date]
            
            self._cache_data(cache_key, market_data)
            return market_data
            
        except Exception as e:
            logger.error(f"Failed to get historical data for {symbol}: {e}")
            return []
    
    async def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """Get company information from Alpha Vantage."""
        cache_key = self._get_cache_key(symbol, "company_info")
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key][1]
        
        try:
            params = {
                'function': 'OVERVIEW',
                'symbol': symbol,
                'apikey': self.config.api_key
            }
            
            data = await self._make_request(self.config.base_url, params=params)
            
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage error: {data['Error Message']}")
                return {'symbol': symbol, 'error': data['Error Message']}
            
            company_info = {
                'symbol': symbol,
                'name': data.get('Name', ''),
                'sector': data.get('Sector', ''),
                'industry': data.get('Industry', ''),
                'market_cap': float(data.get('MarketCapitalization', 0)),
                'pe_ratio': float(data.get('PERatio', 0)),
                'debt_to_equity': float(data.get('DebtToEquityRatio', 0)),
                'profit_margins': float(data.get('ProfitMargin', 0)),
                'return_on_equity': float(data.get('ReturnOnEquityTTM', 0)),
                'beta': float(data.get('Beta', 0)),
                'dividend_yield': float(data.get('DividendYield', 0)),
                'price_to_book': float(data.get('PriceToBookRatio', 0)),
                'enterprise_value': float(data.get('MarketCapitalization', 0))
            }
            
            self._cache_data(cache_key, company_info)
            return company_info
            
        except Exception as e:
            logger.error(f"Failed to get company info for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}
    
    async def get_sector_info(self, symbol: str) -> Dict[str, Any]:
        """Get sector information from Alpha Vantage."""
        company_info = await self.get_company_info(symbol)
        
        return {
            'symbol': symbol,
            'sector': company_info.get('sector', 'Unknown'),
            'industry': company_info.get('industry', 'Unknown'),
            'sub_industry': company_info.get('sub_industry', 'Unknown')
        }


class APIClient:
    """Main API client that manages multiple data providers."""
    
    def __init__(self, providers: List[DataProvider] = None):
        self.providers = providers or []
        self.primary_provider = None
        self.fallback_providers = []
        
        if self.providers:
            self.primary_provider = self.providers[0]
            self.fallback_providers = self.providers[1:]
    
    def add_provider(self, provider: DataProvider, primary: bool = False):
        """Add a data provider."""
        if primary or not self.primary_provider:
            self.fallback_providers.insert(0, self.primary_provider)
            self.primary_provider = provider
        else:
            self.fallback_providers.append(provider)
    
    async def get_historical_data(self, symbol: str, period: str = "1y") -> List[MarketData]:
        """Get historical data from primary provider with fallback."""
        providers_to_try = [self.primary_provider] + self.fallback_providers
        
        for provider in providers_to_try:
            if not provider:
                continue
                
            try:
                data = await provider.get_historical_data(symbol, period)
                if data:
                    return data
            except Exception as e:
                logger.warning(f"Provider {provider.config.name} failed for {symbol}: {e}")
                continue
        
        logger.error(f"All providers failed to get historical data for {symbol}")
        return []
    
    async def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """Get company information from primary provider with fallback."""
        providers_to_try = [self.primary_provider] + self.fallback_providers
        
        for provider in providers_to_try:
            if not provider:
                continue
                
            try:
                info = await provider.get_company_info(symbol)
                if info and 'error' not in info:
                    return info
            except Exception as e:
                logger.warning(f"Provider {provider.config.name} failed for {symbol}: {e}")
                continue
        
        logger.error(f"All providers failed to get company info for {symbol}")
        return {'symbol': symbol, 'error': 'All providers failed'}
    
    async def get_sector_info(self, symbol: str) -> Dict[str, Any]:
        """Get sector information from primary provider with fallback."""
        providers_to_try = [self.primary_provider] + self.fallback_providers
        
        for provider in providers_to_try:
            if not provider:
                continue
                
            try:
                info = await provider.get_sector_info(symbol)
                if info and 'error' not in info:
                    return info
            except Exception as e:
                logger.warning(f"Provider {provider.config.name} failed for {symbol}: {e}")
                continue
        
        logger.error(f"All providers failed to get sector info for {symbol}")
        return {'symbol': symbol, 'sector': 'Unknown', 'industry': 'Unknown'}
    
    async def analyze_portfolio(self, request: AnalysisRequest) -> AnalysisResponse:
        """Analyze a portfolio using multiple providers."""
        start_time = time.time()
        request_id = f"analysis_{int(start_time)}"
        
        try:
            # Get data for all symbols
            all_data = {}
            errors = []
            warnings = []
            
            for symbol in request.symbols:
                try:
                    historical_data = await self.get_historical_data(symbol, request.period)
                    company_info = await self.get_company_info(symbol)
                    sector_info = await self.get_sector_info(symbol)
                    
                    if historical_data:
                        all_data[symbol] = {
                            'historical': historical_data,
                            'company': company_info,
                            'sector': sector_info
                        }
                    else:
                        errors.append(f"No historical data available for {symbol}")
                        
                except Exception as e:
                    errors.append(f"Failed to get data for {symbol}: {str(e)}")
            
            processing_time = time.time() - start_time
            
            if errors and not all_data:
                return AnalysisResponse(
                    request_id=request_id,
                    status="error",
                    data={},
                    errors=errors,
                    processing_time=processing_time
                )
            
            status = "success" if not errors else "partial_success"
            
            return AnalysisResponse(
                request_id=request_id,
                status=status,
                data=all_data,
                errors=errors,
                warnings=warnings,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return AnalysisResponse(
                request_id=request_id,
                status="error",
                data={},
                errors=[f"Analysis failed: {str(e)}"],
                processing_time=processing_time
            )
    
    async def close(self):
        """Close all provider sessions."""
        for provider in [self.primary_provider] + self.fallback_providers:
            if provider:
                await provider.close()


# Factory function for creating API clients
def create_api_client(provider_type: str = "yahoo", **kwargs) -> APIClient:
    """Create an API client with the specified provider."""
    
    if provider_type.lower() == "yahoo":
        provider = YahooFinanceProvider()
        return APIClient([provider])
    
    elif provider_type.lower() == "alphavantage":
        api_key = kwargs.get('api_key')
        if not api_key:
            raise ValueError("API key required for Alpha Vantage")
        provider = AlphaVantageProvider(api_key)
        return APIClient([provider])
    
    elif provider_type.lower() == "hybrid":
        # Create a hybrid client with multiple providers
        providers = []
        
        # Add Yahoo Finance as primary
        providers.append(YahooFinanceProvider())
        
        # Add Alpha Vantage if API key provided
        api_key = kwargs.get('alpha_vantage_key')
        if api_key:
            providers.append(AlphaVantageProvider(api_key))
        
        return APIClient(providers)
    
    else:
        raise ValueError(f"Unknown provider type: {provider_type}") 