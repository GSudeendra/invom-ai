// Using built-in fetch API (available in Node.js 18+)
// const fetch = require('node-fetch'); // Remove this line

const BASE_URL = 'http://localhost:3001';

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`❌ Assertion failed: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArray(actual, message) {
  if (!Array.isArray(actual)) {
    throw new Error(`❌ Assertion failed: ${message}. Expected array, got: ${typeof actual}`);
  }
}

function assertObject(actual, message) {
  if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
    throw new Error(`❌ Assertion failed: ${message}. Expected object, got: ${typeof actual}`);
  }
}

function assertNotEmpty(actual, message) {
  if (!actual || (Array.isArray(actual) && actual.length === 0)) {
    throw new Error(`❌ Assertion failed: ${message}. Expected non-empty value`);
  }
}

async function testEndpoint(endpoint, expectedStatus = 200, validator = null) {
  try {
    console.log(`🧪 Testing: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    assertEqual(response.status, expectedStatus, `Status code for ${endpoint}`);
    
    if (validator) {
      validator(data);
    }
    
    console.log(`✅ ${endpoint} - Status: ${response.status}`);
    return data;
  } catch (error) {
    console.log(`❌ ${endpoint} - ${error.message}`);
    throw error;
  }
}

async function testBackend() {
  console.log('🧪 Starting Comprehensive Backend Tests...\n');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Health Check');
    await testEndpoint('/api/health', 200, (data) => {
      assertObject(data, 'Health response should be an object');
      assert(data.status === 'OK', 'Health status should be OK');
      assert(data.timestamp, 'Health should have timestamp');
      assert(data.version, 'Health should have version');
    });
    console.log('✅ Health check passed\n');

    // Test 2: Categories
    console.log('📋 Test 2: ETF Categories');
    const categoriesData = await testEndpoint('/api/etfs/categories', 200, (data) => {
      assertArray(data, 'Categories should be an array');
      assertNotEmpty(data, 'Categories data should not be empty');
      // Validate category structure
      data.forEach((category, index) => {
        assert(category.key, `Category ${index} should have key`);
        assert(category.label, `Category ${index} should have label`);
        assert(category.key !== 'misc', `Category ${index} should not be 'misc'`);
      });
    });
    console.log(`✅ Categories test passed. Found ${categoriesData.length} categories\n`);

    // Test 3: ETFs by Category
    console.log('📋 Test 3: ETFs by Category');
    for (const category of categoriesData) {
      const catKey = category.key;
      const catLabel = category.label;
      const catData = await testEndpoint(`/api/etfs/category/${catKey}`, 200, (data) => {
        assertObject(data, `Category ${catKey} response should be an object`);
        assert(Array.isArray(data.funds), `Category ${catKey} should have a 'funds' array`);
        assertNotEmpty(data.funds, `Category ${catKey} funds should not be empty`);
        data.funds.forEach((etf, idx) => {
          assert(etf.schemeName, `ETF ${idx} in ${catKey} should have schemeName`);
          assert(etf.amfiCode, `ETF ${idx} in ${catKey} should have amfiCode`);
          assert(etf.latestNav, `ETF ${idx} in ${catKey} should have latestNav`);
          assert(etf.navDate, `ETF ${idx} in ${catKey} should have navDate`);
        });
      });
      console.log(`  - ${catLabel} (${catKey}): ${catData.funds.length} ETFs`);
    }
    console.log('✅ ETFs by Category test passed\n');

    // Test 4: Basic ETF Data
    console.log('📋 Test 4: Basic ETF Data');
    const basicEtfData = await testEndpoint('/api/etfs/category/all', 200, (data) => {
      assert(data.success === true, 'Basic ETF response should have success: true');
      assertArray(data.data, 'Basic ETF should have data array');
      assertNotEmpty(data.data, 'Basic ETF data should not be empty');
      
      // Validate ETF structure
      data.data.forEach((etf, index) => {
        assert(etf.id, `ETF ${index} should have id`);
        assert(etf.name, `ETF ${index} should have name`);
        assert(etf.schemeName, `ETF ${index} should have schemeName`);
        assert(etf.symbol, `ETF ${index} should have symbol`);
        assert(typeof etf.price === 'number', `ETF ${index} should have numeric price`);
        assert(typeof etf.latestNav === 'number', `ETF ${index} should have numeric latestNav`);
        assert(typeof etf.change1d === 'number', `ETF ${index} should have numeric change1d`);
        assert(typeof etf.dailyChangePercent === 'number', `ETF ${index} should have numeric dailyChangePercent`);
        assert(etf.category, `ETF ${index} should have category`);
      });
    });
    console.log('✅ Basic ETF test passed\n');

    // Test 5: Enhanced ETF Data
    console.log('📋 Test 5: Enhanced ETF Data');
    await testEndpoint('/api/etfs/enhanced', 200, (data) => {
      assert(data.success === true, 'Enhanced ETF response should have success: true');
      assertArray(data.data, 'Enhanced ETF should have data array');
      assertNotEmpty(data.data, 'Enhanced ETF data should not be empty');
      
      // Validate enhanced ETF structure
      data.data.forEach((etf, index) => {
        assert(etf.id, `Enhanced ETF ${index} should have id`);
        assert(etf.name, `Enhanced ETF ${index} should have name`);
        assert(etf.symbol, `Enhanced ETF ${index} should have symbol`);
        assert(typeof etf.price === 'number', `Enhanced ETF ${index} should have numeric price`);
        assert(typeof etf.latestNav === 'number', `Enhanced ETF ${index} should have numeric latestNav`);
        assert(etf.category, `Enhanced ETF ${index} should have category`);
        assert(etf.marketCap, `Enhanced ETF ${index} should have marketCap`);
        assert(etf.expenseRatio, `Enhanced ETF ${index} should have expenseRatio`);
        assert(etf.liquidity, `Enhanced ETF ${index} should have liquidity`);
        assert(etf.riskLevel, `Enhanced ETF ${index} should have riskLevel`);
      });
    });
    console.log('✅ Enhanced ETF test passed\n');

    // Test 6: Intelligent ETF Data
    console.log('📋 Test 6: Intelligent ETF Data');
    await testEndpoint('/api/etfs/intelligent', 200, (data) => {
      assert(data.success === true, 'Intelligent ETF response should have success: true');
      assertArray(data.data, 'Intelligent ETF should have data array');
      assertNotEmpty(data.data, 'Intelligent ETF data should not be empty');
      
      // Validate intelligent ETF structure
      data.data.forEach((etf, index) => {
        assert(etf.id, `Intelligent ETF ${index} should have id`);
        assert(etf.name, `Intelligent ETF ${index} should have name`);
        assert(etf.symbol, `Intelligent ETF ${index} should have symbol`);
        assert(etf.category, `Intelligent ETF ${index} should have category`);
        assert(etf.analysis, `Intelligent ETF ${index} should have analysis object`);
        
        const analysis = etf.analysis;
        assert(typeof analysis.technicalScore === 'number', `Analysis ${index} should have numeric technicalScore`);
        assert(typeof analysis.fundamentalScore === 'number', `Analysis ${index} should have numeric fundamentalScore`);
        assert(typeof analysis.overallScore === 'number', `Analysis ${index} should have numeric overallScore`);
        assert(analysis.recommendation, `Analysis ${index} should have recommendation`);
        assert(typeof analysis.confidence === 'number', `Analysis ${index} should have numeric confidence`);
      });
    });
    console.log('✅ Intelligent ETF test passed\n');

    // Test 7: Live ETF Data
    console.log('📋 Test 7: Live ETF Data');
    await testEndpoint('/api/etfs/live', 200, (data) => {
      assert(data.success === true, 'Live ETF response should have success: true');
      assertArray(data.data, 'Live ETF should have data array');
      assertNotEmpty(data.data, 'Live ETF data should not be empty');
      
      // Validate live ETF structure
      data.data.forEach((etf, index) => {
        assert(etf.id, `Live ETF ${index} should have id`);
        assert(etf.name, `Live ETF ${index} should have name`);
        assert(etf.schemeName, `Live ETF ${index} should have schemeName`);
        assert(etf.symbol, `Live ETF ${index} should have symbol`);
        assert(typeof etf.price === 'number', `Live ETF ${index} should have numeric price`);
        assert(typeof etf.latestNav === 'number', `Live ETF ${index} should have numeric latestNav`);
        assert(typeof etf.change1d === 'number', `Live ETF ${index} should have numeric change1d`);
        assert(typeof etf.dailyChangePercent === 'number', `Live ETF ${index} should have numeric dailyChangePercent`);
        assert(etf.category, `Live ETF ${index} should have category`);
        assert(etf.lastUpdated, `Live ETF ${index} should have lastUpdated`);
      });
    });
    console.log('✅ Live ETF test passed\n');

    // Test 8: Category Filtering
    console.log('📋 Test 8: Category Filtering');
    await testEndpoint('/api/etfs/category/large-cap', 200, (data) => {
      assert(data.success === true, 'Category filter response should have success: true');
      assertArray(data.data, 'Category filter should have data array');
      
      // All returned ETFs should have the correct category
      data.data.forEach((etf, index) => {
        assertEqual(etf.category, 'large-cap', `ETF ${index} should have category 'large-cap'`);
      });
    });
    console.log('✅ Category filtering test passed\n');

    // Test 9: Swing Trading Analysis
    console.log('📋 Test 9: Swing Trading Analysis');
    await testEndpoint('/api/swing-trading/analysis/1', 200, (data) => {
      assert(data.success === true, 'Swing trading response should have success: true');
      assertObject(data.data, 'Swing trading should have data object');
      
      const analysis = data.data;
      assert(analysis.etfId, 'Analysis should have etfId');
      assert(analysis.latestSignal, 'Analysis should have latestSignal');
      assert(analysis.riskMetrics, 'Analysis should have riskMetrics');
      assert(analysis.positionRecommendation, 'Analysis should have positionRecommendation');
      assert(analysis.technicalIndicators, 'Analysis should have technicalIndicators');
      
      // Validate latest signal
      const signal = analysis.latestSignal;
      assert(signal.action, 'Latest signal should have action');
      assert(typeof signal.confidence === 'number', 'Latest signal should have numeric confidence');
      assert(signal.price, 'Latest signal should have price');
      assert(signal.timestamp, 'Latest signal should have timestamp');
      assertArray(signal.reasons, 'Latest signal should have reasons array');
    });
    console.log('✅ Swing trading analysis test passed\n');

    // Test 10: Portfolio Optimization
    console.log('📋 Test 10: Portfolio Optimization');
    await testEndpoint('/api/swing-trading/portfolio-optimization', 200, (data) => {
      assert(data.success === true, 'Portfolio optimization response should have success: true');
      assertObject(data.data, 'Portfolio optimization should have data object');
      
      const portfolio = data.data.portfolio;
      assert(typeof portfolio.totalValue === 'number', 'Portfolio should have numeric totalValue');
      assertArray(portfolio.positions, 'Portfolio should have positions array');
      assert(portfolio.riskMetrics, 'Portfolio should have riskMetrics');
      
      // Validate positions
      portfolio.positions.forEach((position, index) => {
        assert(position.etfId, `Position ${index} should have etfId`);
        assert(position.name, `Position ${index} should have name`);
        assert(position.symbol, `Position ${index} should have symbol`);
        assert(typeof position.allocation === 'number', `Position ${index} should have numeric allocation`);
        assert(typeof position.shares === 'number', `Position ${index} should have numeric shares`);
        assert(typeof position.currentValue === 'number', `Position ${index} should have numeric currentValue`);
      });
    });
    console.log('✅ Portfolio optimization test passed\n');

    // Test 11: Technical Indicators
    console.log('📋 Test 11: Technical Indicators');
    await testEndpoint('/api/swing-trading/indicators/1', 200, (data) => {
      assert(data.success === true, 'Technical indicators response should have success: true');
      assertObject(data.data, 'Technical indicators should have data object');
      
      const indicators = data.data;
      assert(indicators.etfId, 'Indicators should have etfId');
      assert(typeof indicators.period === 'number', 'Indicators should have numeric period');
      assert(typeof indicators.rsi === 'number', 'Indicators should have numeric rsi');
      assert(indicators.macd, 'Indicators should have macd object');
      assert(indicators.movingAverages, 'Indicators should have movingAverages object');
      assert(indicators.bollingerBands, 'Indicators should have bollingerBands object');
      assert(indicators.volume, 'Indicators should have volume object');
    });
    console.log('✅ Technical indicators test passed\n');

    // Test 12: Error Handling - Invalid Dashboard
    console.log('📋 Test 12: Error Handling - Invalid Dashboard');
    await testEndpoint('/api/etfs/invalid-dashboard', 400, (data) => {
      assert(data.error, 'Error response should have error object');
      assert(data.error.message, 'Error should have message');
      assert(data.error.code, 'Error should have code');
      assert(data.error.status === 400, 'Error should have status 400');
    });
    console.log('✅ Error handling test passed\n');

    // Test 13: Error Handling - 404
    console.log('📋 Test 13: Error Handling - 404');
    await testEndpoint('/api/nonexistent-endpoint', 404, (data) => {
      assert(data.error, '404 response should have error object');
      assert(data.error.message, '404 should have message');
      assert(data.error.code === 'NOT_FOUND', '404 should have NOT_FOUND code');
      assert(data.error.status === 404, '404 should have status 404');
    });
    console.log('✅ 404 error handling test passed\n');

    console.log('\n🎉 All tests passed successfully!');
    console.log('📊 Test Summary:');
    console.log('   ✅ Health Check');
    console.log('   ✅ ETF Categories');
    console.log('   ✅ ETFs by Category');
    console.log('   ✅ Basic ETF Data');
    console.log('   ✅ Enhanced ETF Data');
    console.log('   ✅ Intelligent ETF Data');
    console.log('   ✅ Live ETF Data');
    console.log('   ✅ Category Filtering');
    console.log('   ✅ Swing Trading Analysis');
    console.log('   ✅ Portfolio Optimization');
    console.log('   ✅ Technical Indicators');
    console.log('   ✅ Error Handling');
    console.log('   ✅ 404 Error Handling');
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    allTestsPassed = false;
  }
  
  if (!allTestsPassed) {
    process.exit(1);
  }
}

// Run tests
testBackend().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
}); 