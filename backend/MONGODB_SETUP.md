# MongoDB Setup Guide for ETF Dashboard

## Prerequisites

1. **Install MongoDB** (if not already installed):
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt install mongodb`
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)

2. **Start MongoDB Service**:
   - **macOS**: `brew services start mongodb-community`
   - **Ubuntu**: `sudo systemctl start mongodb`
   - **Windows**: Start MongoDB service from Services

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install mongoose
```

### 2. Configure MongoDB Connection
The connection is configured in `src/db.js` with the following options:
- **Default URI**: `mongodb://localhost:27017/invom_ai`
- **Environment Variable**: Set `MONGODB_URI` for custom connection

### 3. Seed High Liquidity ETFs Data
```bash
# Run the seeding script
node scripts/seedHighLiquidityEtfs.js
```

### 4. Verify Setup
```bash
# Test the database connection and data
node test-seed.js
```

### 5. Start the Server
```bash
npm start
```

## API Endpoints

### High Liquidity ETFs
- **GET** `/api/etfs/high-liquidity`
- **Query Parameters**:
  - `category`: Filter by category (e.g., "Large Cap", "Banking")
  - `limit`: Number of results (default: 50)
  - `page`: Page number (default: 1)
  - `sortBy`: Sort field (default: "rank")
  - `sortOrder`: Sort direction "asc" or "desc" (default: "asc")
  - `search`: Search in ETF name, symbol, or scheme name

### Example API Calls
```bash
# Get all high liquidity ETFs
curl "http://localhost:3001/api/etfs/high-liquidity"

# Get ETFs by category
curl "http://localhost:3001/api/etfs/high-liquidity?category=Large%20Cap"

# Search ETFs
curl "http://localhost:3001/api/etfs/high-liquidity?search=nifty"

# Paginated results
curl "http://localhost:3001/api/etfs/high-liquidity?page=1&limit=10"
```

## Database Schema

### HighLiquidityEtf Collection
```javascript
{
  rank: Number,           // Unique ranking
  etfName: String,        // ETF name
  symbol: String,         // Trading symbol (unique)
  category: String,       // ETF category
  indexTracked: String,   // Index being tracked
  schemeCode: Number,     // AMFI scheme code (unique)
  schemeName: String,     // Full scheme name
  isinGrowth: String,     // ISIN code (unique)
  createdAt: Date,        // Auto-generated timestamp
  updatedAt: Date         // Auto-generated timestamp
}
```

## Troubleshooting

### Connection Issues
1. **MongoDB not running**: Start MongoDB service
2. **Wrong port**: Check if MongoDB is running on port 27017
3. **Authentication**: If using authentication, update MONGODB_URI

### Seeding Issues
1. **Duplicate key errors**: Clear existing data first
2. **Validation errors**: Check data format in JSON file
3. **Permission errors**: Ensure write access to database

### API Issues
1. **404 errors**: Check if server is running
2. **500 errors**: Check server logs for MongoDB connection issues
3. **Empty results**: Verify data was seeded correctly

## Data Management

### Clear All Data
```javascript
// In MongoDB shell or via script
db.high_liquidity_etfs.deleteMany({})
```

### Backup Data
```bash
# Export collection
mongoexport --db invom_ai --collection high_liquidity_etfs --out backup.json

# Import collection
mongoimport --db invom_ai --collection high_liquidity_etfs --file backup.json
```

## Next Steps

1. **Add more ETF data**: Extend the model for additional ETF information
2. **Real-time updates**: Implement WebSocket for live data updates
3. **Analytics**: Add aggregation queries for ETF performance analysis
4. **User preferences**: Store user portfolio and preferences 