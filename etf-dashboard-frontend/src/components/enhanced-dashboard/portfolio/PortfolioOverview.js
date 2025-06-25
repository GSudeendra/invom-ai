import React from 'react';
import AllocationPieChart from './AllocationPieChart';
import RiskMetrics from './RiskMetrics';
import PerformanceChart from './PerformanceChart';

export default function PortfolioOverview({ portfolio }) {
  if (!portfolio) return <div className="portfolio-overview-empty">No portfolio data available.</div>;
  const { totalValue, positions, allocation, riskMetrics, performance } = portfolio;

  return (
    <div className="portfolio-overview" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Portfolio Overview</div>
      <div className="portfolio-summary" style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
        <div>Total Value: <b>₹{totalValue?.toLocaleString() ?? 'N/A'}</b></div>
        <div>Positions: <b>{positions?.length ?? 0}</b></div>
      </div>
      <div className="portfolio-charts" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <AllocationPieChart allocation={allocation} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <RiskMetrics risk={riskMetrics} />
        </div>
        <div style={{ flex: 2, minWidth: 320 }}>
          <PerformanceChart performance={performance} />
        </div>
      </div>
    </div>
  );
} 