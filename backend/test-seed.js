const connectDB = require('./src/db');
const HighLiquidityEtf = require('./src/models/HighLiquidityEtf');

async function testSeeding() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Check if data exists
    const count = await HighLiquidityEtf.countDocuments();
    console.log(`Current ETF count: ${count}`);

    if (count === 0) {
      console.log('No data found. You need to run the seeding script first.');
      console.log('Run: node scripts/seedHighLiquidityEtfs.js');
    } else {
      // Show sample data
      const sample = await HighLiquidityEtf.findOne().lean();
      console.log('Sample ETF:', sample);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testSeeding(); 