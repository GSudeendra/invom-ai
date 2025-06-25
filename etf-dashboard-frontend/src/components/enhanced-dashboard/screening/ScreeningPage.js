import React, { useState, useMemo } from 'react';
import AdvancedFilter from './AdvancedFilter';
import EnhancedETFCard from '../EnhancedETFCard';

// Mock ETF data for now (replace with real fetch)
const MOCK_ETFS = [
  {
    id: 1,
    schemeName: 'Nifty 50 ETF',
    symbol: 'NIFTY50',
    category: 'large-cap',
    rsi: 62,
    macd: 1.2,
    aum: 5000,
    return1y: 18,
    volatility: 12,
    signals: ['bullish', 'breakout'],
    latestNav: 210.5,
    dailyChangePercent: 0.5,
    volume: 100000,
    fundHouse: 'ABC AMC'
  },
  {
    id: 2,
    schemeName: 'Gold ETF',
    symbol: 'GOLDBEES',
    category: 'commodity',
    rsi: 48,
    macd: -0.3,
    aum: 1200,
    return1y: 12,
    volatility: 8,
    signals: ['bearish'],
    latestNav: 45.2,
    dailyChangePercent: -0.2,
    volume: 50000,
    fundHouse: 'XYZ AMC'
  }
  // ...more mock ETFs
];

const MOCK_CATEGORIES = [
  { key: 'large-cap', label: 'Large Cap' },
  { key: 'commodity', label: 'Commodity' }
];

export default function ScreeningPage() {
  const [filters, setFilters] = useState({});

  // Filter ETFs based on filters
  const filteredEtfs = useMemo(() => {
    return MOCK_ETFS.filter(etf => {
      if (filters.category && etf.category !== filters.category) return false;
      if (filters.rsi !== undefined && etf.rsi < filters.rsi) return false;
      if (filters.macd !== undefined && etf.macd < filters.macd) return false;
      if (filters.aum !== undefined && etf.aum < filters.aum) return false;
      if (filters.return1y !== undefined && etf.return1y < filters.return1y) return false;
      if (filters.volatility !== undefined && etf.volatility > filters.volatility) return false;
      if (filters.bullish && !(etf.signals || []).includes('bullish')) return false;
      if (filters.bearish && !(etf.signals || []).includes('bearish')) return false;
      if (filters.breakout && !(etf.signals || []).includes('breakout')) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="screening-page" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>ETF Advanced Screening</h2>
      <AdvancedFilter filters={filters} onChange={setFilters} categories={MOCK_CATEGORIES} />
      <div className="screening-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {filteredEtfs.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: '#888', fontStyle: 'italic' }}>No ETFs match the selected criteria.</div>
        ) : (
          filteredEtfs.map(etf => (
            <EnhancedETFCard key={etf.id || etf.symbol} etf={etf} />
          ))
        )}
      </div>
    </div>
  );
} 