# AI Analyst - Financial Analytics System

A comprehensive financial analytics system with risk assessment, fund quality evaluation, portfolio analysis capabilities, and testing strategies.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-analyst
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Running the API Server

The AI Analyst system includes a FastAPI server with comprehensive Swagger documentation.

#### Option 1: Using the startup script (Recommended)
```bash
./start.sh
```

#### Option 2: Using Python directly
```bash
python run.py
```

#### Option 3: Using uvicorn directly
```bash
uvicorn src.api.server:app --host 0.0.0.0 --port 3002 --reload
```

### API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:3002/docs
- **ReDoc**: http://localhost:3002/redoc
- **OpenAPI Spec**: http://localhost:3002/openapi.json
- **Health Check**: http://localhost:3002/health

## 📚 API Features

### Core Analytics

- **Risk Analysis**: Volatility, VaR, drawdown, beta, Sharpe/Sortino ratios
- **Quality Evaluation**: Performance consistency, risk-adjusted returns, financial health
- **Portfolio Analysis**: Allocation, diversification, concentration risk, optimization
- **Intelligence Scoring**: Composite scoring system for investment decisions
- **Market Data**: Multi-provider data fetching with caching

### API Endpoints

#### Portfolio Analysis
- `POST /api/v1/analyze/portfolio` - Comprehensive portfolio analysis
- `POST /api/v1/analyze/risk` - Risk analysis for financial instruments
- `POST /api/v1/analyze/quality` - Quality evaluation for financial instruments
- `POST /api/v1/analyze/intelligence` - Portfolio intelligence scoring

#### Market Data
- `GET /api/v1/market-data/{symbol}` - Fetch historical market data
- `GET /api/v1/company-info/{symbol}` - Fetch company information

#### Recommendations
- `GET /api/v1/recommendations` - Generate investment recommendations

#### System Management
- `GET /api/v1/cache-stats` - Get cache statistics
- `DELETE /api/v1/cache` - Clear cache data
- `POST /api/v1/validate-data-quality` - Validate data quality

## 🏗️ System Architecture

### Core Components

```
ai-analyst/src/
├── analytics/
│   ├── core.py                 # Main analytics engine
│   ├── risk_analyzer.py        # Risk analysis module
│   ├── quality_evaluator.py    # Quality evaluation module
│   ├── portfolio_analyzer.py   # Portfolio analysis module
│   ├── market_data.py          # Market data provider
│   └── api_client.py           # API client for data providers
├── api/
│   ├── server.py               # FastAPI server
│   └── routes.py               # API routes
└── models/
    └── models.py               # Data models
```

### Data Models

- **RiskMetrics**: Volatility, VaR, drawdown, risk scores
- **QualityMetrics**: Performance metrics, quality scores, ratings
- **PortfolioMetrics**: Portfolio-level analysis and metrics
- **IntelligenceScore**: Composite intelligence scoring
- **Recommendation**: Investment recommendations with confidence

## 🔧 Configuration

### Environment Variables

- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 3002)
- `RELOAD`: Enable auto-reload (default: true)
- `LOG_LEVEL`: Logging level (default: info)

### Data Providers

The system supports multiple data providers:
- **Yahoo Finance**: Free, comprehensive market data
- **Alpha Vantage**: Premium data with API key
- **Custom Providers**: Extensible provider system

## 📊 Usage Examples

### Python API Usage

```python
from src.analytics import FinancialAnalytics

# Initialize analytics engine
analytics = FinancialAnalytics()

# Portfolio analysis
request = AnalysisRequest(
    symbols=["AAPL", "MSFT", "GOOGL"],
    analysis_type="comprehensive",
    period="1y"
)

result = await analytics.analyze_portfolio(request)
print(f"Portfolio Intelligence Score: {result.data['intelligence_analysis']['intelligence_score']}")
```

### REST API Usage

```bash
# Portfolio analysis
curl -X POST "http://localhost:3002/api/v1/analyze/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "MSFT", "GOOGL"],
    "analysis_type": "comprehensive",
    "period": "1y"
  }'

# Risk analysis
curl -X POST "http://localhost:3002/api/v1/analyze/risk?symbols=AAPL&symbols=MSFT&period=1y"

# Get recommendations
curl "http://localhost:3002/api/v1/recommendations?symbols=AAPL&symbols=MSFT"
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test module
pytest tests/test_risk_analyzer.py
```

## 📈 Features

### Risk Analysis
- **Individual Risk**: Volatility, downside risk, VaR, maximum drawdown
- **Portfolio Risk**: Correlation analysis, portfolio volatility, systematic risk
- **Advanced Metrics**: Beta calculation, Sharpe/Sortino ratios, efficient frontier

### Quality Evaluation
- **Performance Consistency**: Rolling returns, drawdown analysis
- **Risk-Adjusted Metrics**: Information ratio, Calmar ratio, Treynor ratio
- **Valuation Analysis**: P/E, P/B ratios, growth metrics
- **Quality Scoring**: Composite scores with configurable weights

### Portfolio Analysis
- **Allocation Analysis**: Sector, asset class, geographic distribution
- **Diversification Metrics**: Herfindahl index, effective number of holdings
- **Concentration Risk**: Top holdings analysis, sector concentration
- **Optimization**: Modern Portfolio Theory implementation

### Intelligence System
- **Composite Scoring**: Risk, quality, and portfolio metrics integration
- **Recommendation Engine**: Buy/hold/sell recommendations with confidence
- **Data Quality Validation**: Completeness, consistency, accuracy checks

## 🔌 Integration

The system is designed to integrate with existing infrastructure:
- **Backend API**: Can consume data from ETF/stock APIs
- **Frontend**: Provides structured data for React dashboards
- **Broker Connector**: Can analyze portfolio data from trading systems
- **Data Pipeline**: Extensible for additional data sources

## 🚀 Deployment

### Development
```bash
./start.sh
```

### Production
```bash
# Set production environment variables
export HOST=0.0.0.0
export PORT=3002
export RELOAD=false
export LOG_LEVEL=warning

# Start with gunicorn (recommended for production)
pip install gunicorn
gunicorn src.api.server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3002
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@ai-analyst.com
- Documentation: http://localhost:3002/docs
- Issues: GitHub Issues 