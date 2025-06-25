// AlertCreator.js - Create new alerts stub
import React, { useState } from 'react';

const ALERT_TYPES = [
  { value: 'Price', label: 'Price' },
  { value: 'RSI', label: 'RSI' },
  { value: 'Volume', label: 'Volume' },
  { value: 'News', label: 'News' }
];
const CONDITIONS = [
  { value: 'Above', label: 'Above' },
  { value: 'Below', label: 'Below' },
  { value: 'Equals', label: 'Equals' }
];

export default function AlertCreator({ onCreate }) {
  const [type, setType] = useState('Price');
  const [etf, setEtf] = useState('');
  const [condition, setCondition] = useState('Above');
  const [threshold, setThreshold] = useState('');
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!etf || !threshold) return;
    onCreate({ type, etf, condition, threshold, enabled });
    setEtf('');
    setThreshold('');
    setType('Price');
    setCondition('Above');
    setEnabled(true);
  };

  return (
    <form className="alert-creator" onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <label>Type</label><br />
        <select value={type} onChange={e => setType(e.target.value)}>
          {ALERT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label>ETF</label><br />
        <input type="text" value={etf} onChange={e => setEtf(e.target.value)} placeholder="ETF symbol" />
      </div>
      <div>
        <label>Condition</label><br />
        <select value={condition} onChange={e => setCondition(e.target.value)}>
          {CONDITIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label>Threshold</label><br />
        <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
      </div>
      <div>
        <label>Enabled</label><br />
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
      </div>
      <button type="submit" style={{ padding: '6px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Create Alert</button>
    </form>
  );
} 