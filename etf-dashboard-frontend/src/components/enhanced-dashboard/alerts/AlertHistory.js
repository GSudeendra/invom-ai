// AlertHistory.js - Alert history stub
import React from 'react';

const MOCK_HISTORY = [
  {
    id: 1,
    time: '2025-06-24 10:15',
    etf: 'NIFTY50',
    type: 'Price',
    condition: 'Above',
    threshold: 220,
    status: 'Triggered'
  },
  {
    id: 2,
    time: '2025-06-23 14:05',
    etf: 'GOLDBEES',
    type: 'RSI',
    condition: 'Below',
    threshold: 30,
    status: 'Triggered'
  }
];

export default function AlertHistory() {
  return (
    <div className="alert-history" style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Alert History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 6 }}>Time</th>
            <th style={{ padding: 6 }}>ETF</th>
            <th style={{ padding: 6 }}>Type</th>
            <th style={{ padding: 6 }}>Condition</th>
            <th style={{ padding: 6 }}>Threshold</th>
            <th style={{ padding: 6 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_HISTORY.length === 0 ? (
            <tr><td colSpan={6} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No alert history.</td></tr>
          ) : (
            MOCK_HISTORY.map(alert => (
              <tr key={alert.id}>
                <td style={{ padding: 6 }}>{alert.time}</td>
                <td style={{ padding: 6 }}>{alert.etf}</td>
                <td style={{ padding: 6 }}>{alert.type}</td>
                <td style={{ padding: 6 }}>{alert.condition}</td>
                <td style={{ padding: 6 }}>{alert.threshold}</td>
                <td style={{ padding: 6 }}>{alert.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 