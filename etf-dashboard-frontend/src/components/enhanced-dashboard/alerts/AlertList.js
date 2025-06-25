// AlertList.js - Active alerts list stub
import React from 'react';

export default function AlertList({ alerts = [], onToggle, onDelete }) {
  if (!alerts.length) return <div style={{ color: '#888', fontStyle: 'italic' }}>No active alerts.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ background: '#f3f4f6' }}>
          <th style={{ padding: 6 }}>Type</th>
          <th style={{ padding: 6 }}>ETF</th>
          <th style={{ padding: 6 }}>Condition</th>
          <th style={{ padding: 6 }}>Threshold</th>
          <th style={{ padding: 6 }}>Enabled</th>
          <th style={{ padding: 6 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map(alert => (
          <tr key={alert.id} style={{ background: alert.enabled ? '#fff' : '#f9fafb' }}>
            <td style={{ padding: 6 }}>{alert.type}</td>
            <td style={{ padding: 6 }}>{alert.etf}</td>
            <td style={{ padding: 6 }}>{alert.condition}</td>
            <td style={{ padding: 6 }}>{alert.threshold}</td>
            <td style={{ padding: 6 }}>
              <input type="checkbox" checked={alert.enabled} onChange={() => onToggle(alert.id)} />
            </td>
            <td style={{ padding: 6 }}>
              <button onClick={() => onDelete(alert.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 