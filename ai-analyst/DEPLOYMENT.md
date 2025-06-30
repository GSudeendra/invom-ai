# AI Analyst API Deployment Guide

This guide covers different deployment options for the AI Analyst Financial Analytics API.

## 🚀 Quick Start

### Option 1: Local Development (Recommended for testing)

```bash
# Clone and setup
git clone <repository-url>
cd ai-analyst

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
./start.sh
```

The API will be available at:
- **API**: http://localhost:3002
- **Swagger UI**: http://localhost:3002/docs
- **ReDoc**: http://localhost:3002/redoc

### Option 2: Docker Deployment

```bash
# Build and run with Docker
docker build -t ai-analyst-api .
docker run -p 3002:3002 ai-analyst-api

# Or use docker-compose
docker-compose up -d
```

### Option 3: Docker Compose (Recommended for production)

```bash
# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## 🌐 Production Deployment

### Environment Variables

Create a `.env` file for production:

```env
# Server Configuration
HOST=0.0.0.0
PORT=3002
RELOAD=false
LOG_LEVEL=warning

# API Configuration
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Data Provider Configuration
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Cache Configuration
CACHE_TTL=600
CACHE_DIR=/app/cache

# Analytics Configuration
DEFAULT_RISK_FREE_RATE=0.02
DEFAULT_ANALYSIS_PERIOD=1y

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Logging
LOG_FILE=/app/logs/ai_analyst.log
```

### Production with Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Start with gunicorn
gunicorn src.api.server:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:3002 \
  --access-logfile /app/logs/access.log \
  --error-logfile /app/logs/error.log \
  --log-level warning
```

### Production with Docker

```bash
# Build production image
docker build -t ai-analyst-api:production .

# Run with environment variables
docker run -d \
  --name ai-analyst-api \
  -p 3002:3002 \
  --env-file .env \
  -v $(pwd)/cache:/app/cache \
  -v $(pwd)/logs:/app/logs \
  ai-analyst-api:production
```

## 🔧 Configuration

### API Configuration

The API can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `3002` | Server port |
| `RELOAD` | `true` | Enable auto-reload |
| `LOG_LEVEL` | `info` | Logging level |
| `CORS_ORIGINS` | `*` | CORS origins |
| `RATE_LIMIT_PER_MINUTE` | `100` | Rate limiting |

### Data Provider Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_DATA_PROVIDER` | `yahoo` | Default data provider |
| `ALPHA_VANTAGE_API_KEY` | `None` | Alpha Vantage API key |

### Cache Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_TTL` | `300` | Cache TTL in seconds |
| `CACHE_DIR` | `cache` | Cache directory |

## 🔒 Security Considerations

### CORS Configuration

For production, configure CORS properly:

```python
# In production, specify exact origins
CORS_ORIGINS = [
    "https://yourdomain.com",
    "https://api.yourdomain.com",
    "https://dashboard.yourdomain.com"
]
```

### Rate Limiting

The API includes rate limiting to prevent abuse:

```python
# Configure rate limiting
RATE_LIMIT_PER_MINUTE = 100  # Requests per minute per IP
```

### API Authentication

For production, consider adding authentication:

```python
# Example with API key authentication
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != "your-secret-api-key":
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key
```

## 📊 Monitoring

### Health Checks

The API includes health check endpoints:

```bash
# Health check
curl http://localhost:3002/health

# Expected response
{
  "status": "healthy",
  "service": "AI Analyst Financial Analytics API",
  "version": "1.0.0"
}
```

### Logging

Configure logging for production:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("/app/logs/ai_analyst.log"),
        logging.StreamHandler()
    ]
)
```

### Metrics

Consider adding metrics collection:

```python
# Example with Prometheus metrics
from prometheus_client import Counter, Histogram
import time

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests')
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

# Use in middleware
@app.middleware("http")
async def add_metrics(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.inc()
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response
```

## 🚀 Scaling

### Horizontal Scaling

For high traffic, consider horizontal scaling:

```yaml
# docker-compose.yml with multiple instances
version: '3.8'
services:
  ai-analyst-api:
    build: .
    deploy:
      replicas: 3
    ports:
      - "3002-3004:3002"
```

### Load Balancing

Use a load balancer (nginx, HAProxy) in front of multiple API instances:

```nginx
# nginx.conf example
upstream ai_analyst_api {
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://ai_analyst_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3002
   lsof -i :3002
   
   # Kill the process or use a different port
   export PORT=3003
   ```

2. **Dependencies not found**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

3. **Cache issues**
   ```bash
   # Clear cache
   curl -X DELETE http://localhost:3002/api/v1/cache
   ```

4. **Memory issues**
   ```bash
   # Monitor memory usage
   docker stats ai-analyst-api
   
   # Increase memory limits
   docker run --memory=2g ai-analyst-api
   ```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
export LOG_LEVEL=debug
export RELOAD=true
python run.py
```

## 📞 Support

For deployment issues:
- Check the logs: `docker-compose logs -f`
- Test the health endpoint: `curl http://localhost:3002/health`
- Review the API documentation: http://localhost:3002/docs
- Check the configuration in `config.py` 