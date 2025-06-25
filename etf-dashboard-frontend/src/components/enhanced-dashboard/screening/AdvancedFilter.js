import React from 'react';

export default function AdvancedFilter({ filters, onChange, categories = [] }) {
  // Handlers for each filter
  const handleSlider = (key, value) => {
    onChange({ ...filters, [key]: value });
  };
  const handleDropdown = (key, value) => {
    onChange({ ...filters, [key]: value });
  };
  const handleCheckbox = (key, checked) => {
    onChange({ ...filters, [key]: checked });
  };

  return (
    <div className="advanced-filter" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Advanced ETF Filter</div>
      <div className="filter-row" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Category dropdown */}
        <div>
          <label>Category</label><br />
          <select value={filters.category || ''} onChange={e => handleDropdown('category', e.target.value)}>
            <option value="">All</option>
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
        {/* RSI slider */}
        <div>
          <label>RSI Range</label><br />
          <input type="range" min="0" max="100" value={filters.rsi || 50} onChange={e => handleSlider('rsi', Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{filters.rsi || 50}</span>
        </div>
        {/* MACD slider */}
        <div>
          <label>MACD Min</label><br />
          <input type="range" min="-5" max="5" step="0.1" value={filters.macd || 0} onChange={e => handleSlider('macd', Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{filters.macd || 0}</span>
        </div>
        {/* AUM slider */}
        <div>
          <label>AUM Min (Cr)</label><br />
          <input type="range" min="0" max="10000" step="100" value={filters.aum || 0} onChange={e => handleSlider('aum', Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{filters.aum || 0}</span>
        </div>
        {/* Returns slider */}
        <div>
          <label>1Y Return Min (%)</label><br />
          <input type="range" min="-50" max="100" value={filters.return1y || 0} onChange={e => handleSlider('return1y', Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{filters.return1y || 0}</span>
        </div>
        {/* Volatility slider */}
        <div>
          <label>Volatility Max (%)</label><br />
          <input type="range" min="0" max="100" value={filters.volatility || 100} onChange={e => handleSlider('volatility', Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{filters.volatility || 100}</span>
        </div>
        {/* Technical signals checkboxes */}
        <div>
          <label>Signals</label><br />
          <label><input type="checkbox" checked={!!filters.bullish} onChange={e => handleCheckbox('bullish', e.target.checked)} /> Bullish</label><br />
          <label><input type="checkbox" checked={!!filters.bearish} onChange={e => handleCheckbox('bearish', e.target.checked)} /> Bearish</label><br />
          <label><input type="checkbox" checked={!!filters.breakout} onChange={e => handleCheckbox('breakout', e.target.checked)} /> Breakout</label>
        </div>
      </div>
    </div>
  );
} 