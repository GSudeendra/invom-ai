// RiskMetrics.js - Portfolio risk metrics stub
import React from 'react';

export default function RiskMetrics({ risk = {} }) {
  if (!risk || Object.keys(risk).length === 0) return <div className="risk-metrics-empty">No risk data.</div>;
  const { sharpe, maxDrawdown, beta, volatility, stddev, cvar } = risk;

  const getRiskColor = (val, type) => {
    if (type === 'sharpe') return val >= 1 ? 'green' : val >= 0.5 ? 'orange' : 'red';
    if (type === 'maxDrawdown') return val <= 0.1 ? 'green' : val <= 0.2 ? 'orange' : 'red';
    if (type === 'beta') return Math.abs(val - 1) < 0.2 ? 'green' : 'orange';
    if (type === 'volatility' || type === 'stddev') return val <= 0.15 ? 'green' : val <= 0.25 ? 'orange' : 'red';
    if (type === 'cvar') return val <= 0.1 ? 'green' : val <= 0.2 ? 'orange' : 'red';
    return 'gray';
  };

  return (
    <div className="risk-metrics" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Risk Metrics</div>
      <div>Sharpe Ratio: <span style={{ color: getRiskColor(sharpe, 'sharpe'), fontWeight: 500 }}>{sharpe !== undefined ? sharpe.toFixed(2) : 'N/A'}</span></div>
      <div>Max Drawdown: <span style={{ color: getRiskColor(maxDrawdown, 'maxDrawdown'), fontWeight: 500 }}>{maxDrawdown !== undefined ? (maxDrawdown * 100).toFixed(1) + '%' : 'N/A'}</span></div>
      <div>Beta: <span style={{ color: getRiskColor(beta, 'beta'), fontWeight: 500 }}>{beta !== undefined ? beta.toFixed(2) : 'N/A'}</span></div>
      <div>Volatility: <span style={{ color: getRiskColor(volatility, 'volatility'), fontWeight: 500 }}>{volatility !== undefined ? (volatility * 100).toFixed(1) + '%' : 'N/A'}</span></div>
      <div>Std Dev: <span style={{ color: getRiskColor(stddev, 'stddev'), fontWeight: 500 }}>{stddev !== undefined ? (stddev * 100).toFixed(1) + '%' : 'N/A'}</span></div>
      <div>CVaR: <span style={{ color: getRiskColor(cvar, 'cvar'), fontWeight: 500 }}>{cvar !== undefined ? (cvar * 100).toFixed(1) + '%' : 'N/A'}</span></div>
    </div>
  );
} 