// CSV Parser utility for portfolio data

export function parseCSV(csvText) {
  try {
    // Split by lines and filter out empty lines
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse data rows
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        throw new Error(`Row ${index + 2} has ${values.length} values but header has ${headers.length} columns`);
      }
      
      const row = {};
      headers.forEach((header, i) => {
        let value = values[i];
        
        // Convert numeric values
        if (header === 'Qty.' || header === 'qty') {
          value = parseInt(value) || 0;
        } else if (['Avg. cost', 'LTP', 'Invested', 'Cur. val', 'P&L', 'Net chg.', 'Day chg.'].includes(header)) {
          value = parseFloat(value) || 0;
        }
        
        row[header] = value;
      });
      
      return row;
    });
    
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

// Convert CSV data to the format expected by PortfolioDashboard
export function convertCSVToStockData(csvData) {
  return csvData.map(row => ({
    name: row['Instrument'] || row['instrument'] || row['Name'] || row['name'],
    sector: row['Sector'] || row['sector'] || 'Unknown', // Add sector if available in CSV
    qty: row['Qty.'] || row['qty'] || row['Quantity'] || row['quantity'] || 0,
    avgCost: row['Avg. cost'] || row['avgCost'] || row['Average Cost'] || 0,
    ltp: row['LTP'] || row['ltp'] || row['Last Traded Price'] || 0,
    invested: row['Invested'] || row['invested'] || row['Investment'] || 0,
    current: row['Cur. val'] || row['current'] || row['Current Value'] || 0,
    pnl: row['P&L'] || row['pnl'] || row['Profit/Loss'] || 0,
    netChange: row['Net chg.'] || row['netChange'] || row['Net Change'] || 0,
    dayChange: row['Day chg.'] || row['dayChange'] || row['Day Change'] || 0,
    risk: row['Risk'] || row['risk'] || 'Medium' // Add risk if available in CSV
  }));
}

// Detect if a string is CSV format
export function isCSVFormat(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return false;
  
  const firstLine = lines[0];
  const secondLine = lines[1];
  
  // Check if first line has comma-separated values
  const firstLineCommas = (firstLine.match(/,/g) || []).length;
  const secondLineCommas = (secondLine.match(/,/g) || []).length;
  
  // Both lines should have similar number of commas
  return firstLineCommas > 0 && Math.abs(firstLineCommas - secondLineCommas) <= 1;
} 