// PerformanceChart.js - Portfolio performance stub
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PerformanceChart({ performance = [] }) {
  if (!performance || performance.length === 0) return <div className="performance-chart-empty">No performance data.</div>;
  return (
    <div className="performance-chart" style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performance} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={16} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} name="Portfolio Value" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 