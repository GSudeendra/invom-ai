import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import './SwingTrading.css';

const BASE_URL = 'http://localhost:3001';

// Default time periods for different chart views
const TIME_PERIODS = {
  daily: { label: '1D', days: 1 },
  weekly: { label: '1W', days: 7 },
  monthly: { label: '1M', days: 30 },
  quarterly: { label: '3M', days: 90 },
  yearly: { label: '1Y', days: 365 },
};

export default function TechnicalChart({ etf, timeframe = 'daily' }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [showVolume, setShowVolume] = useState(true);

  useEffect(() => {
    if (!etf || !etf.symbol) {
      setError('No ETF selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch historical data for this ETF
    axios.get(`${BASE_URL}/api/etfs/${etf.symbol}/historical?timeframe=${selectedTimeframe}`)
      .then(response => {
        if (response.data && response.data.data) {
          setChartData(response.data.data);
        } else {
          // If API isn't ready yet, use mock data for demonstration
          setChartData(generateMockChartData(etf, selectedTimeframe));
        }
      })
      .catch(err => {
        console.error('Error fetching historical data:', err);
        setError('Failed to load chart data');
        // Use mock data for demonstration
        setChartData(generateMockChartData(etf, selectedTimeframe));
      })
      .finally(() => setLoading(false));
  }, [etf, selectedTimeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  if (loading) return <div className="chart-loading">Loading chart data...</div>;
  if (error) return <div className="chart-error">Error: {error}</div>;
  if (!chartData || chartData.length === 0) return <div className="chart-empty">No chart data available</div>;

  return (
    <div className="technical-chart-container">
      <div className="chart-header">
        <h3>{etf.schemeName || etf.symbol} Chart</h3>
        <div className="chart-controls">
          <div className="timeframe-selector">
            {Object.keys(TIME_PERIODS).map((key) => (
              <button
                key={key}
                className={`timeframe-btn ${selectedTimeframe === key ? 'active' : ''}`}
                onClick={() => handleTimeframeChange(key)}
              >
                {TIME_PERIODS[key].label}
              </button>
            ))}
          </div>
          <button
            className={`toggle-volume-btn ${showVolume ? 'active' : ''}`}
            onClick={toggleVolume}
          >
            Volume
          </button>
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
            />
            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
              />
            )}
            <Tooltip
              formatter={(value, name) => {
                if (name === 'price') return [`₹${value}`, 'Price'];
                if (name === 'volume') return [`${formatVolume(value)}`, 'Volume'];
                if (name === 'sma20') return [`₹${value}`, '20 SMA'];
                if (name === 'sma50') return [`₹${value}`, '50 SMA'];
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              dot={false}
              yAxisId="price"
              name="Price"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#ff7300"
              dot={false}
              yAxisId="price"
              name="20 SMA"
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#82ca9d"
              dot={false}
              yAxisId="price"
              name="50 SMA"
              strokeWidth={1.5}
            />
            {showVolume && (
              <Area
                type="monotone"
                dataKey="volume"
                fill="#82ca9d"
                stroke="#82ca9d"
                yAxisId="volume"
                name="Volume"
                opacity={0.3}
              />
            )}
            <ReferenceLine
              y={chartData[chartData.length - 1]?.price || 0}
              stroke="red"
              strokeDasharray="3 3"
              strokeWidth={1}
              yAxisId="price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <div className="chart-stats">
          <div className="stat">
            <span className="stat-label">Latest Price:</span>
            <span className="stat-value">₹{chartData[chartData.length - 1]?.price || 'N/A'}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Change:</span>
            <span className={`stat-value ${calculateChange(chartData) >= 0 ? 'positive' : 'negative'}`}>
              {calculateChange(chartData) >= 0 ? '+' : ''}{calculateChange(chartData)}%
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">High:</span>
            <span className="stat-value">₹{findHighest(chartData, 'price')}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Low:</span>
            <span className="stat-value">₹{findLowest(chartData, 'price')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format volume numbers
function formatVolume(volume) {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume;
}

// Helper function to calculate percentage change
function calculateChange(data) {
  if (!data || data.length < 2) return 0;
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  return ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
}

// Helper function to find highest value
function findHighest(data, key) {
  if (!data || data.length === 0) return 'N/A';
  const highest = Math.max(...data.map(item => item[key]));
  return highest.toFixed(2);
}

// Helper function to find lowest value
function findLowest(data, key) {
  if (!data || data.length === 0) return 'N/A';
  const lowest = Math.min(...data.map(item => item[key]));
  return lowest.toFixed(2);
}

// Generate mock chart data for demonstration purposes
function generateMockChartData(etf, timeframe) {
  const basePrice = etf.latestNav || (Math.random() * 100 + 100).toFixed(2);
  const days = TIME_PERIODS[timeframe].days;
  const volatility = 0.01; // 1% daily volatility
  const trend = Math.random() > 0.5 ? 1 : -1; // random trend direction

  const data = [];
  let currentPrice = basePrice;

  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random price movement with slight trend
    const change = (Math.random() - 0.5) * volatility * currentPrice + (trend * 0.002 * currentPrice);
    currentPrice = Number(currentPrice) + change;
    if (currentPrice < 1) currentPrice = 1; // Ensure price doesn't go below 1

    // Calculate simple moving averages
    let sma20 = null;
    let sma50 = null;

    if (i >= 20) {
      sma20 = data.slice(-20).reduce((sum, item) => sum + item.price, 0) / 20;
    }

    if (i >= 50) {
      sma50 = data.slice(-50).reduce((sum, item) => sum + item.price, 0) / 50;
    }

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      sma20: sma20 !== null ? parseFloat(sma20.toFixed(2)) : null,
      sma50: sma50 !== null ? parseFloat(sma50.toFixed(2)) : null,
    });
  }

  return data;
}
