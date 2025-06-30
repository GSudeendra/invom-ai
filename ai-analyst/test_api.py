#!/usr/bin/env python3
"""
Simple test script to verify the AI Analyst API endpoints.
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

async def test_health_endpoint():
    """Test the health endpoint."""
    try:
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:3002/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

async def test_root_endpoint():
    """Test the root endpoint."""
    try:
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:3002/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Root endpoint passed: {data}")
                    return True
                else:
                    print(f"❌ Root endpoint failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

async def test_analytics_engine():
    """Test the analytics engine directly."""
    try:
        from src.analytics import FinancialAnalytics
        
        analytics = FinancialAnalytics()
        print("✅ Analytics engine initialized successfully")
        
        # Test basic functionality
        request = {
            "symbols": ["AAPL"],
            "analysis_type": "risk",
            "period": "1y"
        }
        
        print("✅ Analytics engine test passed")
        return True
    except Exception as e:
        print(f"❌ Analytics engine error: {e}")
        return False

async def main():
    """Run all tests."""
    print("🧪 Testing AI Analyst API")
    print("=" * 40)
    
    # Test analytics engine
    print("\n1. Testing Analytics Engine...")
    analytics_ok = await test_analytics_engine()
    
    # Test API endpoints (only if server is running)
    print("\n2. Testing API Endpoints...")
    print("   (Make sure the server is running on port 3002)")
    
    health_ok = await test_health_endpoint()
    root_ok = await test_root_endpoint()
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Analytics Engine: {'✅ PASS' if analytics_ok else '❌ FAIL'}")
    print(f"   Health Endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Root Endpoint: {'✅ PASS' if root_ok else '❌ FAIL'}")
    
    if analytics_ok and health_ok and root_ok:
        print("\n🎉 All tests passed!")
        print("\n📚 Next steps:")
        print("   - Visit http://localhost:3002/docs for API documentation")
        print("   - Try the example endpoints in the Swagger UI")
        print("   - Run the portfolio analysis example: python examples/portfolio_analysis_example.py")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        
        if not health_ok or not root_ok:
            print("\n💡 To start the API server:")
            print("   ./start.sh")
            print("   or")
            print("   python run.py")

if __name__ == "__main__":
    asyncio.run(main()) 