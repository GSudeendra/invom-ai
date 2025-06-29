const { stockSectorService } = require('./src/services/stockSectorService');
const connectDB = require('./src/db');

async function testStockSectorService() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully\n');

    console.log('🧪 Testing Stock Sector Service...');
    console.log('=====================================\n');

    // Test with actual Indian stocks from the user's CSV
    const testSymbols = [
      'RELIANCE', 'WAAREEENER', 'TITAGARH', 'HCLTECH', 'LTTS', 
      'TATAELXSI', 'DEEPAKNTR', 'PFC', 'JIOFIN', 'IRCTC',
      'MEDIASSIST', 'PGEL', 'GANECOS', 'PATELENG', 'ADANIPOWER',
      'NEWGEN', 'SENCO', 'PNGJL', 'YATHARTH', 'KPIGREEN',
      'RATEGAIN', 'TIMETECHNO', 'SWIGGY', 'EPACK', 'AVANTEL',
      'MARKSANS', 'EXICOM', 'MOREPENLAB', 'SGMART', 'JYOTISTRUC'
    ];

    for (const symbol of testSymbols) {
      console.log(`📊 Testing symbol: ${symbol}`);
      console.log('-------------------------------------');
      
      const startTime = Date.now();
      const sectorInfo = await stockSectorService.getStockSector(symbol);
      const timeTaken = Date.now() - startTime;
      
      if (sectorInfo) {
        console.log(`✅ Success! Found sector info for ${symbol}:`);
        console.log(`   Sector: ${sectorInfo.sector}`);
        console.log(`   Industry: ${sectorInfo.industry}`);
        console.log(`   Market Cap: ${sectorInfo.marketCap || 'N/A'}`);
        console.log(`   Exchange: ${sectorInfo.exchange}`);
        console.log(`   Source: ${sectorInfo.source}`);
        console.log(`   Time taken: ${timeTaken}ms\n`);
      } else {
        console.log(`❌ No sector info found for ${symbol}\n`);
      }
    }

    console.log('📦 Testing batch functionality...');
    console.log('=====================================');
    
    const batchStartTime = Date.now();
    const batchResults = await stockSectorService.getMultipleStockSectors(testSymbols);
    const batchTimeTaken = Date.now() - batchStartTime;
    
    console.log(`✅ Batch request completed in ${batchTimeTaken}ms`);
    console.log(`   Found: ${Object.keys(batchResults).length}/${testSymbols.length} symbols`);
    
    Object.entries(batchResults).forEach(([symbol, info]) => {
      console.log(`   ${symbol}: ${info.sector} (${info.source})`);
    });
    console.log();

    console.log('📈 Testing cache statistics...');
    console.log('=====================================');
    
    const stats = await stockSectorService.getCacheStats();
    console.log('✅ Cache statistics:');
    console.log(`   Memory cache size: ${stats.memoryCacheSize}`);
    console.log(`   Database cache size: ${stats.databaseCacheSize}`);
    console.log(`   Cache timeout: ${stats.cacheTimeout}ms (${Math.round(stats.cacheTimeout / (1000 * 60 * 60))} hours)\n`);

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testStockSectorService(); 