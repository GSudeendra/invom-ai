import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BacktestResults({ results }) {
  if (!results) return <div className="backtest-results-empty">No backtest results available.</div>;
  const { totalReturn, winRate, maxDrawdown, sharpeRatio, equityCurve = [], trades = [] } = results;

  return (
    <div className="backtest-results" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Backtest Results</div>
      <div className="backtest-metrics" style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
        <div>Total Return: <b>{(totalReturn * 100).toFixed(2)}%</b></div>
        <div>Win Rate: <b>{(winRate * 100).toFixed(1)}%</b></div>
        <div>Max Drawdown: <b>{(maxDrawdown * 100).toFixed(1)}%</b></div>
        <div>Sharpe Ratio: <b>{sharpeRatio?.toFixed(2) ?? 'N/A'}</b></div>
      </div>
      <div className="backtest-equity-curve" style={{ width: '100%', height: 180, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={equityCurve} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={16} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="equity" stroke="#3b82f6" dot={false} strokeWidth={2} name="Equity Curve" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="backtest-trades-table" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 6 }}>Entry Date</th>
              <th style={{ padding: 6 }}>Exit Date</th>
              <th style={{ padding: 6 }}>Entry</th>
              <th style={{ padding: 6 }}>Exit</th>
              <th style={{ padding: 6 }}>PnL</th>
              <th style={{ padding: 6 }}>Win/Loss</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No trades</td></tr>
            ) : (
              trades.map((trade, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: 6 }}>{trade.entryDate}</td>
                  <td style={{ padding: 6 }}>{trade.exitDate}</td>
                  <td style={{ padding: 6 }}>{trade.entryPrice}</td>
                  <td style={{ padding: 6 }}>{trade.exitPrice}</td>
                  <td style={{ padding: 6, color: trade.pnl > 0 ? 'green' : trade.pnl < 0 ? 'red' : '#222' }}>{trade.pnl.toFixed(2)}</td>
                  <td style={{ padding: 6 }}>{trade.pnl > 0 ? 'Win' : trade.pnl < 0 ? 'Loss' : 'Even'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 