// AlertCenter.js - Alert management center stub
import React, { useState } from 'react';
import AlertCreator from './AlertCreator';
import AlertList from './AlertList';
import AlertHistory from './AlertHistory';

const MOCK_ALERTS = [
  {
    id: 1,
    type: 'Price',
    etf: 'NIFTY50',
    condition: 'Above',
    threshold: 220,
    enabled: true
  },
  {
    id: 2,
    type: 'RSI',
    etf: 'GOLDBEES',
    condition: 'Below',
    threshold: 30,
    enabled: false
  }
];

export default function AlertCenter() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const handleToggle = (id) => {
    setAlerts(alerts => alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };
  const handleDelete = (id) => {
    setAlerts(alerts => alerts.filter(a => a.id !== id));
  };
  const handleCreate = (alert) => {
    setAlerts(alerts => [...alerts, { ...alert, id: Date.now() }]);
  };

  return (
    <div className="alert-center" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Alert Center</h2>
      <AlertCreator onCreate={handleCreate} />
      <div className="alert-list" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Active Alerts</h3>
        <AlertList alerts={alerts} onToggle={handleToggle} onDelete={handleDelete} />
      </div>
      <AlertHistory />
    </div>
  );
} 