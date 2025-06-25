// Intelligent ETF Categorization System
export class ETFCategorizer {
  static categoryRules = {
    // Index-based categories (High Priority)
    'Nifty 50': {
      keywords: ['nifty 50', 'niftybees', 'niftyetf', 'nifty bees', 'nifty50', 'nifty 50 index'],
      patterns: [/nifty\s*50/i, /nifty\s*bees/i, /nifty50/i],
      priority: 1,
      description: 'ETFs tracking the Nifty 50 index'
    },
    'Nifty 100': {
      keywords: ['nifty 100', 'nifty100', 'nifty next 50', 'nifty next50'],
      patterns: [/nifty\s*100/i, /nifty\s*next\s*50/i, /nifty100/i],
      priority: 1,
      description: 'ETFs tracking Nifty 100 or Next 50 indices'
    },
    'Nifty 500': {
      keywords: ['nifty 500', 'nifty500', 'nifty broad market'],
      patterns: [/nifty\s*500/i, /nifty500/i],
      priority: 1,
      description: 'ETFs tracking the Nifty 500 index'
    },
    'Bank Nifty': {
      keywords: ['bank nifty', 'banknifty', 'banking', 'nifty bank'],
      patterns: [/bank\s*nifty/i, /banking/i, /nifty\s*bank/i],
      priority: 1,
      description: 'ETFs tracking banking sector indices'
    },
    'Sensex': {
      keywords: ['sensex', 'bse sensex', 'bse 30'],
      patterns: [/sensex/i, /bse\s*sensex/i, /bse\s*30/i],
      priority: 1,
      description: 'ETFs tracking the BSE Sensex'
    },
    
    // Sectoral ETFs (Medium Priority)
    'Sectoral ETFs': {
      keywords: ['pharma', 'auto', 'fmcg', 'it', 'energy', 'metal', 'realty', 'psu', 'infrastructure', 'consumer', 'financial', 'technology'],
      patterns: [/pharma/i, /auto/i, /fmcg/i, /\bit\b/i, /energy/i, /metal/i, /realty/i, /psu/i, /infra/i, /consumer/i, /financial/i, /technology/i],
      priority: 2,
      description: 'Sector-specific ETFs'
    },
    
    // Thematic ETFs (Medium Priority)
    'Thematic ETFs': {
      keywords: ['momentum', 'quality', 'value', 'growth', 'dividend', 'low vol', 'multi cap', 'small cap', 'mid cap', 'large cap', 'alpha', 'beta'],
      patterns: [/momentum/i, /quality/i, /value/i, /growth/i, /dividend/i, /low\s*vol/i, /multi\s*cap/i, /small\s*cap/i, /mid\s*cap/i, /large\s*cap/i, /alpha/i, /beta/i],
      priority: 2,
      description: 'Thematic and factor-based ETFs'
    },
    
    // International ETFs (High Priority)
    'International ETFs': {
      keywords: ['nasdaq', 'sp500', 's&p', 'hang seng', 'nikkei', 'international', 'global', 'us', 'europe', 'asia', 'emerging markets'],
      patterns: [/nasdaq/i, /s&p/i, /sp\s*500/i, /hang\s*seng/i, /nikkei/i, /international/i, /global/i, /\bus\b/i, /europe/i, /asia/i, /emerging\s*markets/i],
      priority: 1,
      description: 'International and global ETFs'
    },
    
    // Commodity ETFs (High Priority)
    'Gold ETFs': {
      keywords: ['gold', 'goldbees', 'precious metal', 'gold etf'],
      patterns: [/gold/i, /goldbees/i, /precious\s*metal/i, /gold\s*etf/i],
      priority: 1,
      description: 'Gold and precious metal ETFs'
    },
    'Silver ETFs': {
      keywords: ['silver', 'silver etf'],
      patterns: [/silver/i, /silver\s*etf/i],
      priority: 1,
      description: 'Silver ETFs'
    },
    
    // Debt ETFs (High Priority)
    'Debt ETFs': {
      keywords: ['gilt', 'gsec', 'liquid', 'corporate bond', 'government securities', 'treasury', 'money market'],
      patterns: [/gilt/i, /gsec/i, /liquid/i, /corporate\s*bond/i, /government\s*securities/i, /treasury/i, /money\s*market/i],
      priority: 1,
      description: 'Debt and fixed income ETFs'
    },
    
    // Size-based ETFs (Medium Priority)
    'SmallCap ETFs': {
      keywords: ['small cap', 'smallcap', 'micro cap', 'nifty smallcap'],
      patterns: [/small\s*cap/i, /micro\s*cap/i, /nifty\s*smallcap/i],
      priority: 2,
      description: 'Small-cap focused ETFs'
    },
    'MidCap ETFs': {
      keywords: ['mid cap', 'midcap', 'nifty midcap'],
      patterns: [/mid\s*cap/i, /nifty\s*midcap/i],
      priority: 2,
      description: 'Mid-cap focused ETFs'
    },
    'LargeCap ETFs': {
      keywords: ['large cap', 'largecap', 'nifty largecap'],
      patterns: [/large\s*cap/i, /nifty\s*largecap/i],
      priority: 2,
      description: 'Large-cap focused ETFs'
    },
    
    // Fund of Funds (Low Priority)
    'Fund of Funds': {
      keywords: ['fof', 'fund of fund', 'feeder', 'etf of etf'],
      patterns: [/fof/i, /fund\s*of\s*fund/i, /feeder/i, /etf\s*of\s*etf/i],
      priority: 3,
      description: 'Fund of Funds ETFs'
    },
    
    // ESG/Sustainable ETFs (Medium Priority)
    'ESG ETFs': {
      keywords: ['esg', 'sustainable', 'green', 'environmental', 'social', 'governance'],
      patterns: [/esg/i, /sustainable/i, /green/i, /environmental/i, /social/i, /governance/i],
      priority: 2,
      description: 'ESG and sustainable investing ETFs'
    }
  };

  static categorizeETF(name, assets = '', symbol = '') {
    const searchText = `${name} ${assets} ${symbol}`.toLowerCase();
    let bestMatch = { category: 'Miscellaneous', confidence: 0, description: 'Other ETFs' };

    for (const [category, rules] of Object.entries(this.categoryRules)) {
      let confidence = 0;

      // Check keywords
      for (const keyword of rules.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          confidence += 10 / rules.priority;
        }
      }

      // Check patterns
      for (const pattern of rules.patterns) {
        if (pattern.test(searchText)) {
          confidence += 15 / rules.priority;
        }
      }

      // Bonus for exact matches
      if (searchText.includes(category.toLowerCase())) {
        confidence += 20 / rules.priority;
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = { 
          category, 
          confidence, 
          description: rules.description 
        };
      }
    }

    return bestMatch.confidence > 5 ? bestMatch : { 
      category: 'Miscellaneous', 
      confidence: 0, 
      description: 'Other ETFs' 
    };
  }

  static getSmartCategories(etfs) {
    const categoryCounts = {};
    const categoryDescriptions = {};
    
    etfs.forEach(etf => {
      const result = this.categorizeETF(etf.name || etf.schemeName, etf.assets, etf.symbol);
      const category = result.category;
      
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
        categoryDescriptions[category] = result.description;
      }
      categoryCounts[category]++;
    });

    // Sort categories by count and relevance
    return Object.entries(categoryCounts)
      .sort(([a, countA], [b, countB]) => {
        // Put Miscellaneous at the end
        if (a === 'Miscellaneous' && b !== 'Miscellaneous') return 1;
        if (b === 'Miscellaneous' && a !== 'Miscellaneous') return -1;
        return countB - countA;
      })
      .map(([category, count]) => ({ 
        category, 
        count, 
        description: categoryDescriptions[category] 
      }));
  }

  // Enhanced categorization with confidence scoring
  static categorizeWithConfidence(etf) {
    const result = this.categorizeETF(
      etf.name || etf.schemeName, 
      etf.assets, 
      etf.symbol
    );
    
    return {
      ...etf,
      smartCategory: result.category,
      categoryConfidence: result.confidence,
      categoryDescription: result.description
    };
  }
}

export function categorizeETF(name, assets = '') {
  if (typeof ETFCategorizer?.categorizeWithConfidence === 'function') {
    return ETFCategorizer.categorizeWithConfidence({ name, assets });
  }
  // Fallback: simple keyword match
  const text = `${name} ${assets}`.toLowerCase();
  if (text.includes('nifty')) return { category: 'Nifty', confidence: 1 };
  if (text.includes('gold')) return { category: 'Gold', confidence: 1 };
  return { category: 'Miscellaneous', confidence: 0 };
} 