# AI Analyst: Learnings & Rationale

Welcome! This document is a collaborative, beginner-friendly guide to the **ai-analyst** project. We'll cover why we chose specific libraries, what each API endpoint does, and how the analytics logic works—so we can learn and grow together.

---

## 1. Project Overview

**ai-analyst** is a modular financial analytics system built in Python. It provides:
- Risk assessment
- Fund quality evaluation
- Portfolio analysis
- Market data integration
- Investment recommendations

It exposes these analytics via a FastAPI-powered REST API, with contract-first OpenAPI documentation.

---

## 2. Library Choices & Why We Use Them

| Library            | Why We Use It                                                                 |
|--------------------|-------------------------------------------------------------------------------|
| **pandas**         | Data manipulation, time series, and analytics. Essential for financial data.  |
| **numpy**          | Fast numerical operations, array math, and statistics.                        |
| **scikit-learn**   | Machine learning, metrics, and some statistical tools.                        |
| **matplotlib/seaborn/plotly** | Visualization of analytics and results.                             |
| **yfinance**       | Fetching historical market data from Yahoo Finance.                           |
| **requests/aiohttp** | HTTP requests for data providers and async API calls.                       |
| **fastapi**        | Modern, fast web API framework with automatic docs (Swagger/OpenAPI).         |
| **uvicorn**        | ASGI server for running FastAPI apps.                                         |
| **pydantic**       | Data validation and serialization for API models.                             |
| **pytest**         | Testing framework for robust, repeatable tests.                               |
| **python-dotenv**  | Manage environment variables and secrets.                                     |
| **redis/celery**   | (Optional) Caching and background tasks for scalability.                      |

**Why these?**
- **pandas/numpy** are industry standards for data science and finance.
- **FastAPI** is async, type-safe, and generates docs automatically.
- **pydantic** ensures all API data is validated and well-typed.
- **yfinance** and **requests** make it easy to fetch real-world data.
- **pytest** keeps our code reliable.

---

## 3. API Endpoints Explained

All endpoints are documented in Swagger at `/docs`.

| Endpoint                        | Method | What It Does                                                      |
|----------------------------------|--------|-------------------------------------------------------------------|
| `/health`                       | GET    | Health check: is the API running?                                 |
| `/`                             | GET    | Root: welcome/info message.                                       |
| `/analyze/portfolio`            | POST   | Analyze a portfolio: returns risk, quality, and intelligence.     |
| `/analyze/risk`                 | POST   | Analyze risk for given symbols (volatility, VaR, drawdown, etc).  |
| `/analyze/quality`              | POST   | Evaluate quality (returns, Sharpe, consistency, fundamentals).    |
| `/analyze/intelligence`         | POST   | Compute intelligence score for a portfolio.                       |
| `/recommendations`              | GET    | Get investment recommendations for symbols.                       |
| `/market-data/{symbol}`         | GET    | Fetch historical market data for a symbol.                        |
| `/company-info/{symbol}`        | GET    | Get company/stock info (sector, fundamentals, etc).               |
| `/validate-data-quality`        | POST   | Check if data is sufficient and clean for analysis.               |
| `/cache-stats`                  | GET    | Show cache usage and stats.                                       |
| `/cache`                        | DELETE | Clear cache (all or for a symbol).                                |

**How to use:**
- Most analysis endpoints accept a list of symbols and a period (e.g., 1y, 6m).
- POST endpoints expect a JSON body; GET endpoints use query params.

---

## 4. Analytics Logic: How It Works

### a) **Risk Analysis**
- **Input:** Price series for one or more assets.
- **Process:**
  - Calculate daily returns.
  - Compute volatility, downside volatility, Value at Risk (VaR), max drawdown.
  - If market data is provided, compute beta (market risk).
  - Calculate Sharpe and Sortino ratios (risk-adjusted returns).
  - Assign a risk score (1-10) based on these metrics.
- **Output:** `RiskMetrics` model with all values.

### b) **Quality Evaluation**
- **Input:** Historical prices, company info.
- **Process:**
  - Calculate total and annualized returns.
  - Compute Sharpe ratio, positive periods ratio, return consistency.
  - Assess financial health (debt/equity, PE, etc.).
  - Assign a quality score and rating.
- **Output:** `QualityMetrics` model.

### c) **Portfolio Analysis**
- **Input:** Multiple assets, weights.
- **Process:**
  - Aggregate returns and risk across assets.
  - Compute diversification, sector allocation, concentration risk.
  - Calculate overall portfolio metrics (return, volatility, Sharpe, drawdown).
- **Output:** `PortfolioMetrics` and `IntelligenceScore` models.

### d) **Market Data**
- **Input:** Symbol, period.
- **Process:**
  - Fetch from Yahoo Finance or Alpha Vantage.
  - Cache results for speed and rate limiting.
- **Output:** List of `MarketData` entries.

### e) **Recommendations**
- **Input:** Symbols, analysis type.
- **Process:**
  - Analyze risk, quality, and portfolio fit.
  - Suggest BUY/SELL/HOLD with confidence and reasoning.
- **Output:** List of `Recommendation` models.

---

## 5. Key Takeaways & Learning Points

- **Modularity:** Each analytics function is a separate, testable module.
- **Type Safety:** Pydantic models ensure all data is validated and documented.
- **Async APIs:** FastAPI and async data fetching make the system scalable.
- **OpenAPI Docs:** Contract-first design means the API is always documented and testable.
- **Real Data:** Integration with Yahoo/Alpha Vantage means analytics are grounded in reality.
- **Testing:** Pytest ensures every module and endpoint works as expected.
- **Extensible:** Easy to add new analytics, data providers, or endpoints.

---

## Let's Learn Together!

This project is designed to be a learning journey. If you have questions, ideas, or want to contribute, add your notes here or open an issue. Let's keep improving and learning as a team! 