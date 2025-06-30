#!/usr/bin/env python3
"""
Example script demonstrating how to use the AI Analyst API endpoints.
"""

import asyncio
import aiohttp
import json
import sys
from pathlib import Path

# Add the src directory to the Python path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

BASE_URL = "http://localhost:3002"

async def test_health_check():
    """Test the health check endpoint."""
    print("🏥 Testing health check...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/health") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.status}")
                return False

async def test_portfolio_analysis():
    """Test portfolio analysis endpoint."""
    print("\n📊 Testing portfolio analysis...")
    
    # Sample portfolio data
    portfolio_data = {
        "symbols": ["AAPL", "MSFT", "GOOGL"],
        "analysis_type": "comprehensive",
        "period": "1y",
        "risk_free_rate": 0.02
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BASE_URL}/api/v1/analyze/portfolio",
            json=portfolio_data
        ) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Portfolio analysis completed")
                print(f"   Request ID: {data.get('request_id')}")
                print(f"   Status: {data.get('status')}")
                print(f"   Processing Time: {data.get('processing_time', 0):.2f}s")
                return True
            else:
                error_data = await response.text()
                print(f"❌ Portfolio analysis failed: {response.status}")
                print(f"   Error: {error_data}")
                return False

async def test_risk_analysis():
    """Test risk analysis endpoint."""
    print("\n⚠️  Testing risk analysis...")
    
    params = {
        "symbols": ["AAPL", "MSFT"],
        "period": "1y",
        "risk_free_rate": 0.02
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{BASE_URL}/api/v1/analyze/risk", params=params) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Risk analysis completed")
                print(f"   Analyzed {len(data)} symbols")
                return True
            else:
                error_data = await response.text()
                print(f"❌ Risk analysis failed: {response.status}")
                print(f"   Error: {error_data}")
                return False

async def test_quality_evaluation():
    """Test quality evaluation endpoint."""
    print("\n⭐ Testing quality evaluation...")
    
    params = {
        "symbols": ["AAPL", "MSFT"],
        "period": "1y",
        "include_fundamentals": True
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{BASE_URL}/api/v1/analyze/quality", params=params) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Quality evaluation completed")
                print(f"   Evaluated {len(data)} symbols")
                return True
            else:
                error_data = await response.text()
                print(f"❌ Quality evaluation failed: {response.status}")
                print(f"   Error: {error_data}")
                return False

async def test_market_data():
    """Test market data endpoint."""
    print("\n📈 Testing market data retrieval...")
    
    symbol = "AAPL"
    params = {"period": "1m"}
    
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/api/v1/market-data/{symbol}", params=params) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Market data retrieved for {symbol}")
                print(f"   Retrieved {len(data)} data points")
                return True
            else:
                error_data = await response.text()
                print(f"❌ Market data retrieval failed: {response.status}")
                print(f"   Error: {error_data}")
                return False

async def test_recommendations():
    """Test recommendations endpoint."""
    print("\n💡 Testing recommendations...")
    
    params = {
        "symbols": ["AAPL", "MSFT"],
        "analysis_type": "comprehensive"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/api/v1/recommendations", params=params) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Recommendations generated")
                print(f"   Generated {len(data)} recommendations")
                return True
            else:
                error_data = await response.text()
                print(f"❌ Recommendations failed: {response.status}")
                print(f"   Error: {error_data}")
                return False

async def test_cache_operations():
    """Test cache operations."""
    print("\n🗄️  Testing cache operations...")
    
    async with aiohttp.ClientSession() as session:
        # Get cache stats
        async with session.get(f"{BASE_URL}/api/v1/cache-stats") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Cache stats retrieved")
                print(f"   Cache info: {data}")
                return True
            else:
                print(f"❌ Cache stats failed: {response.status}")
                return False

async def main():
    """Run all API tests."""
    print("🧪 AI Analyst API Example")
    print("=" * 50)
    print(f"📍 Testing API at: {BASE_URL}")
    print("   Make sure the server is running with: ./start.sh")
    print()
    
    # Test results
    results = []
    
    # Run tests
    results.append(("Health Check", await test_health_check()))
    results.append(("Portfolio Analysis", await test_portfolio_analysis()))
    results.append(("Risk Analysis", await test_risk_analysis()))
    results.append(("Quality Evaluation", await test_quality_evaluation()))
    results.append(("Market Data", await test_market_data()))
    results.append(("Recommendations", await test_recommendations()))
    results.append(("Cache Operations", await test_cache_operations()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The API is working correctly.")
        print("\n📚 Next steps:")
        print("   - Visit http://localhost:3002/docs for interactive API documentation")
        print("   - Try different analysis types and parameters")
        print("   - Integrate the API into your applications")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Please check the errors above.")
        print("\n💡 Troubleshooting:")
        print("   - Make sure the server is running: ./start.sh")
        print("   - Check the server logs for errors")
        print("   - Verify the server is accessible at http://localhost:3002")

if __name__ == "__main__":
    asyncio.run(main()) 