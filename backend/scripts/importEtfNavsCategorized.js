const connectDB = require('../src/db');
const EtfNavCategorized = require('../src/models/EtfNavCategorized');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../nav_data/etf_navs_categorized_2025-06-26.json');

async function importEtfNavsCategorized() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Read and parse the JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);
    const categories = jsonData.categories || {};

    // Prepare documents for insertion
    const docs = Object.entries(categories).map(([categoryKey, cat]) => ({
      categoryKey,
      label: cat.label,
      description: cat.description,
      keywords: cat.keywords,
      funds: cat.funds,
      importedAt: new Date()
    }));

    // Remove existing documents for these categories
    const categoryKeys = docs.map(doc => doc.categoryKey);
    await EtfNavCategorized.deleteMany({ categoryKey: { $in: categoryKeys } });
    console.log('Cleared existing categorized ETF NAVs for:', categoryKeys.join(', '));

    // Insert new documents
    const result = await EtfNavCategorized.insertMany(docs);
    console.log(`Successfully imported ${result.length} ETF NAV categories.`);

    // Log sample
    console.log('\nSample category:');
    console.log(result[0]);

    console.log('\nImport completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing categorized ETF NAVs:', error);
    process.exit(1);
  }
}

importEtfNavsCategorized(); 