const connectDB = require('../src/db');
const HighLiquidityEtf = require('../src/models/HighLiquidityEtf');
const highLiquidityEtfsData = require('../src/data/highLiquidityEtfs.json');

async function seedHighLiquidityEtfs() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await HighLiquidityEtf.deleteMany({});
    console.log('Cleared existing high liquidity ETFs data');

    // Insert new data
    const result = await HighLiquidityEtf.insertMany(highLiquidityEtfsData);
    console.log(`Successfully seeded ${result.length} high liquidity ETFs`);

    // Log some sample data
    console.log('\nSample ETFs:');
    const sampleEtfs = await HighLiquidityEtf.find().limit(5).select('rank etfName symbol category');
    sampleEtfs.forEach(etf => {
      console.log(`${etf.rank}. ${etf.etfName} (${etf.symbol}) - ${etf.category}`);
    });

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding high liquidity ETFs:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedHighLiquidityEtfs(); 