# Stock Sector Web Scraping API

This module provides comprehensive stock sector information through web scraping from multiple sources, with intelligent caching and fallback mechanisms.

## Features

- **Multi-source scraping**: Yahoo Finance, Alpha Vantage API, MarketWatch
- **Intelligent caching**: Memory and database caching with 24-hour TTL
- **Batch processing**: Get sector info for multiple stocks efficiently
- **Fallback mechanisms**: Multiple scraping methods for reliability
- **Rate limiting protection**: Random user agents and timeouts
- **Comprehensive data**: Sector, industry, market cap, exchange info

## API Endpoints

### 1. Get Sector for Single Stock

```http
GET /api/stock/sector/{symbol}
```

**Parameters:**
- `symbol` (path): Stock symbol (e.g., AAPL, MSFT, RELIANCE)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "marketCap": 2500000,
    "exchange": "NASDAQ",
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "source": "yahoo"
  }
}
```

### 2. Get Sectors for Multiple Stocks

```http
POST /api/stock/sectors/batch
```

**Request Body:**
```json
{
  "symbols": ["AAPL", "MSFT", "GOOGL", "RELIANCE", "TCS"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "AAPL": {
      "symbol": "AAPL",
      "sector": "Technology",
      "industry": "Consumer Electronics",
      "marketCap": 2500000,
      "exchange": "NASDAQ",
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "source": "yahoo"
    },
    "MSFT": {
      "symbol": "MSFT",
      "sector": "Technology",
      "industry": "Software",
      "marketCap": 2200000,
      "exchange": "NASDAQ",
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "source": "yahoo"
    }
  },
  "found": 2,
  "requested": 5
}
```

### 3. Refresh Sector Information

```http
POST /api/stock/sector/{symbol}/refresh
```

Forces a refresh by clearing cache and re-scraping.

### 4. Get Cache Statistics

```http
GET /api/stock/sectors/cache/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memoryCacheSize": 150,
    "databaseCacheSize": 500,
    "cacheTimeout": 86400000
  }
}
```

### 5. Clear All Cache

```http
POST /api/stock/sectors/cache/clear
```

Clears both memory and database cache.

## Usage Examples

### Frontend Integration

```javascript
import { getStockSector, getMultipleStockSectors, enhanceStockDataWithSectors } from '../utils/stockSectorApi';

// Get sector for single stock
const sectorInfo = await getStockSector('AAPL');
console.log(sectorInfo.data.sector); // "Technology"

// Get sectors for multiple stocks
const batchResult = await getMultipleStockSectors(['AAPL', 'MSFT', 'GOOGL']);
console.log(batchResult.data);

// Enhance stock portfolio data with sectors
const stockData = [
  { name: 'AAPL', current: 100000 },
  { name: 'MSFT', current: 150000 }
];
const enhancedData = await enhanceStockDataWithSectors(stockData);
```

### Backend Direct Usage

```javascript
const { stockSectorService } = require('./src/services/stockSectorService');

// Get sector information
const sectorInfo = await stockSectorService.getStockSector('AAPL');

// Get multiple sectors
const sectors = await stockSectorService.getMultipleStockSectors(['AAPL', 'MSFT']);

// Get cache statistics
const stats = await stockSectorService.getCacheStats();
```

## Data Sources

### 1. Yahoo Finance (Primary)
- **URL**: `https://finance.yahoo.com/quote/{symbol}/profile`
- **Data**: Sector, industry, market cap
- **Reliability**: High
- **Rate Limits**: Moderate

### 2. Alpha Vantage API (Fallback)
- **URL**: `https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={key}`
- **Data**: Sector, industry, market cap, exchange
- **Reliability**: High (requires API key)
- **Rate Limits**: 5 requests/minute (free tier)

### 3. MarketWatch (Fallback)
- **URL**: `https://www.marketwatch.com/investing/stock/{symbol}`
- **Data**: Sector information
- **Reliability**: Medium
- **Rate Limits**: Moderate

## Caching Strategy

### Memory Cache
- **Duration**: 24 hours
- **Storage**: In-memory Map
- **Performance**: Fastest access
- **Limitation**: Lost on server restart

### Database Cache
- **Duration**: 24 hours
- **Storage**: MongoDB collection `stock_sectors`
- **Performance**: Fast
- **Persistence**: Survives server restarts

### Cache Priority
1. Memory cache (fastest)
2. Database cache (fast)
3. Web scraping (slowest)

## Error Handling

The service includes comprehensive error handling:

- **Network timeouts**: 10-second timeout for all requests
- **Rate limiting**: Automatic retry with exponential backoff
- **Invalid responses**: Fallback to alternative sources
- **Missing data**: Graceful degradation with default values

## Configuration

### Environment Variables

```bash
# Optional: Alpha Vantage API key for enhanced data
ALPHA_VANTAGE_API_KEY=your_api_key_here

# MongoDB connection (already configured)
MONGODB_URI=mongodb://localhost:27017/invom-ai
```

### Cache Configuration

```javascript
// In stockSectorService.js
this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
```

## Testing

Run the test script to verify functionality:

```bash
node test-stock-sector.js
```

This will test:
- Individual stock sector retrieval
- Batch processing
- Cache functionality
- Error handling

## Performance Considerations

### Optimization Tips

1. **Use batch requests** for multiple stocks
2. **Cache frequently accessed symbols**
3. **Monitor cache hit rates**
4. **Set appropriate timeouts**

### Rate Limiting

- Yahoo Finance: ~1 request/second
- Alpha Vantage: 5 requests/minute (free)
- MarketWatch: ~1 request/second

### Memory Usage

- Memory cache: ~1KB per stock
- Database cache: ~2KB per stock
- Typical usage: 100-1000 stocks cached

## Troubleshooting

### Common Issues

1. **No sector data found**
   - Check if symbol is valid
   - Verify network connectivity
   - Check rate limiting

2. **Slow responses**
   - Check cache hit rates
   - Monitor network latency
   - Consider increasing timeouts

3. **Cache not working**
   - Verify MongoDB connection
   - Check cache statistics
   - Clear cache if needed

### Debug Mode

Enable debug logging by setting:

```javascript
process.env.DEBUG = 'stock-sector:*';
```

## Integration with Portfolio Dashboard

The stock sector API is automatically integrated with the Portfolio Dashboard:

1. **Automatic enhancement**: Stock data is enhanced with sector information
2. **Sector distribution**: Visual charts showing sector allocation
3. **Industry breakdown**: Detailed industry analysis
4. **Real-time updates**: Sector data is refreshed automatically

## Future Enhancements

- [ ] Additional data sources (Reuters, Bloomberg)
- [ ] Real-time sector changes detection
- [ ] Sector performance analytics
- [ ] Custom sector classifications
- [ ] API rate limiting and quotas
- [ ] Webhook notifications for sector changes 