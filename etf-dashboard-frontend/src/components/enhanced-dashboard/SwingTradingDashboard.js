import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from '../layout/Header';
import { useToast } from '../../contexts/ToastContext';
import TechnicalChart from './swing-trading/TechnicalChart';
import IndicatorPanel from './swing-trading/IndicatorPanel';
import PatternHighlight from './swing-trading/PatternHighlight';
import SupportResistance from './swing-trading/SupportResistance';
import VolumeAnalysis from './swing-trading/VolumeAnalysis';
import TrendAnalysis from './swing-trading/TrendAnalysis';
import VolatilityMeter from './swing-trading/VolatilityMeter';
import SwingScore from './swing-trading/SwingScore';
import SignalCard from './swing-trading/SignalCard';
import './swing-trading/SwingTrading.css';
import useLiveETFData from '../../hooks/useLiveETFData';

const BASE_URL = 'http://localhost:3001';

// Available timeframes for technical analysis
const TIMEFRAMES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' }
];

// Technical indicators for analysis
const INDICATORS = [
  { key: 'rsi', label: 'RSI', description: 'Relative Strength Index' },
  { key: 'macd', label: 'MACD', description: 'Moving Average Convergence Divergence' },
  { key: 'ema', label: 'EMA', description: 'Exponential Moving Average' },
  { key: 'sma', label: 'SMA', description: 'Simple Moving Average' },
  { key: 'bollinger', label: 'Bollinger', description: 'Bollinger Bands' },
  { key: 'volume', label: 'Volume', description: 'Volume Analysis' },
  { key: 'atr', label: 'ATR', description: 'Average True Range' },
  { key: 'stochastic', label: 'Stochastic', description: 'Stochastic Oscillator' },
];

export default function SwingTradingDashboard() {
  const [etfs, setEtfs] = useState([]);
  const [selectedEtf, setSelectedEtf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedIndicators, setSelectedIndicators] = useState(['rsi', 'macd', 'ema', 'bollinger']);
  const [historicalData, setHistoricalData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [supportResistance, setSupportResistance] = useState({ support: [], resistance: [] });

  const { showSuccess, showError, showInfo } = useToast();

  // Fetch ETF list on initial load
  useEffect(() => {
    fetchEtfList();
  }, []);

  // Fetch ETF list from the API
  const fetchEtfList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/etfs`);
      if (response.data && response.data.data) {
        setEtfs(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedEtf(response.data.data[0]);
        }
      } else {
        // If API not ready, use mock data
        const mockEtfs = generateMockEtfs();
        setEtfs(mockEtfs);
        setSelectedEtf(mockEtfs[0]);
      }
    } catch (err) {
      console.error('Error fetching ETFs:', err);
      setError('Failed to load ETFs');
      // Use mock data for demonstration
      const mockEtfs = generateMockEtfs();
      setEtfs(mockEtfs);
      setSelectedEtf(mockEtfs[0]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data when ETF or timeframe changes
  useEffect(() => {
    if (!selectedEtf) return;

    fetchHistoricalData();
  }, [selectedEtf, timeframe]);

  // Fetch historical data from the API
  const fetchHistoricalData = async () => {
    if (!selectedEtf) return;

    setLoading(true);
    try {
      const symbol = selectedEtf.symbol || selectedEtf.amfiCode;

      // Fetch historical price data
      const historyResponse = await axios.get(
        `${BASE_URL}/api/etfs/${symbol}/historical?timeframe=${timeframe}`
      ).catch(() => ({ data: { data: generateMockHistoricalData() } }));

      setHistoricalData(historyResponse.data.data || []);

      // Fetch trading signals
      const signalsResponse = await axios.get(
        `${BASE_URL}/api/etfs/${symbol}/signals?timeframe=${timeframe}`
      ).catch(() => ({ data: { data: generateMockSignals() } }));

      setSignals(signalsResponse.data.data || []);

      // Fetch pattern recognition data
      const patternsResponse = await axios.get(
        `${BASE_URL}/api/etfs/${symbol}/patterns?timeframe=${timeframe}`
      ).catch(() => ({ data: { data: generateMockPatterns() } }));

      setPatterns(patternsResponse.data.data || []);

      // Fetch support/resistance levels
      const levelsResponse = await axios.get(
        `${BASE_URL}/api/etfs/${symbol}/levels?timeframe=${timeframe}`
      ).catch(() => ({ data: { data: generateMockSupportResistance() } }));

      setSupportResistance(levelsResponse.data.data || { support: [], resistance: [] });

      showSuccess(`Loaded swing trading data for ${selectedEtf.symbol || selectedEtf.schemeName}`);
    } catch (err) {
      console.error('Error fetching technical analysis data:', err);
      setError('Failed to load technical analysis data');

      // Use mock data for demonstration
      setHistoricalData(generateMockHistoricalData());
      setSignals(generateMockSignals());
      setPatterns(generateMockPatterns());
      setSupportResistance(generateMockSupportResistance());
    } finally {
      setLoading(false);
    }
  };

  // Handle ETF selection
  const handleSelectEtf = (etf) => {
    setSelectedEtf(etf);
    showInfo(`Selected ${etf.symbol || etf.schemeName} for swing trading analysis`);
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    showInfo(`Switched to ${newTimeframe} timeframe`);
  };

  // Handle indicator selection
  const handleToggleIndicator = (indicator) => {
    if (selectedIndicators.includes(indicator)) {
      setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
    } else {
      setSelectedIndicators([...selectedIndicators, indicator]);
    }
  };

  // Filter ETFs based on search term
  const filteredEtfs = useMemo(() => {
    if (!searchTerm) return etfs;

    const term = searchTerm.toLowerCase();
    return etfs.filter(etf =>
      (etf.symbol && etf.symbol.toLowerCase().includes(term)) ||
      (etf.schemeName && etf.schemeName.toLowerCase().includes(term))
    );
  }, [etfs, searchTerm]);

  // Get latest price and stats
  const getLatestStats = () => {
    if (!historicalData || historicalData.length === 0) {
      return { price: 0, change: 0, changePercent: 0 };
    }

    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData.length > 1 ? historicalData[historicalData.length - 2] : latest;

    const price = latest.close;
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close * 100).toFixed(2);

    return { price, change, changePercent };
  };

  // Get latest stats
  const latestStats = getLatestStats();

  if (error) {
    return (
      <div className="swing-trading-dashboard">
        <Header />
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchEtfList}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="swing-trading-dashboard">
      <Header />

      <div className="swing-dashboard-header">
        <div className="swing-header-left">
          <h2>Swing Trading Dashboard</h2>
          <p className="dashboard-description">
            Technical analysis and swing trading signals for ETFs
          </p>
        </div>

        <div className="swing-header-right">
          <div className="etf-search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ETFs..."
              className="etf-search-input"
            />
          </div>
        </div>
      </div>

      <div className="swing-dashboard-layout">
        {/* ETF Selection Panel */}
        <div className="etf-selection-panel">
          <div className="panel-header">
            <h3>Select ETF</h3>
          </div>
          <div className="etf-list">
            {loading && !selectedEtf ? (
              <div className="loading-indicator">Loading ETFs...</div>
            ) : (
              <>
                {filteredEtfs.map(etf => (
                  <div
                    key={etf.amfiCode || etf.symbol}
                    className={`etf-list-item ${selectedEtf && (selectedEtf.amfiCode === etf.amfiCode || selectedEtf.symbol === etf.symbol) ? 'selected' : ''}`}
                    onClick={() => handleSelectEtf(etf)}
                  >
                    <div className="etf-list-symbol">{etf.symbol || 'N/A'}</div>
                    <div className="etf-list-name">{etf.schemeName}</div>
                  </div>
                ))}
                {filteredEtfs.length === 0 && (
                  <div className="no-results">No ETFs found matching "{searchTerm}"</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Analysis Panel */}
        <div className="main-analysis-panel">
          {selectedEtf ? (
            <>
              <div className="selected-etf-header">
                <div className="etf-info">
                  <h3>{selectedEtf.symbol || 'ETF'}</h3>
                  <p className="etf-name">{selectedEtf.schemeName}</p>
                </div>

                <div className="etf-price-info">
                  <div className="current-price">₹{latestStats.price.toFixed(2)}</div>
                  <div className={`price-change ${latestStats.change >= 0 ? 'positive' : 'negative'}`}>
                    {latestStats.change >= 0 ? '+' : ''}{latestStats.change.toFixed(2)} ({latestStats.changePercent}%)
                  </div>
                </div>

                <div className="timeframe-selector">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.key}
                      className={`timeframe-btn ${timeframe === tf.key ? 'active' : ''}`}
                      onClick={() => handleTimeframeChange(tf.key)}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="analysis-grid">
                <div className="grid-item chart-container">
                  <TechnicalChart
                    etf={selectedEtf}
                    timeframe={timeframe}
                    data={historicalData}
                    patterns={patterns}
                    supportResistance={supportResistance}
                    loading={loading}
                  />
                </div>

                <div className="grid-item indicator-container">
                  <IndicatorPanel
                    etf={selectedEtf}
                    timeframe={timeframe}
                    data={historicalData}
                    loading={loading}
                    selectedIndicators={selectedIndicators}
                  />
                </div>

                <div className="grid-item signals-container">
                  <div className="panel-header">
                    <h3>Swing Trading Signals</h3>
                  </div>
                  <div className="signals-content">
                    {loading ? (
                      <div className="loading-indicator">Loading signals...</div>
                    ) : (
                      <>
                        {signals.length > 0 ? (
                          <div className="signal-list">
                            {signals.map((signal, index) => (
                              <SignalCard key={index} signal={signal} />
                            ))}
                          </div>
                        ) : (
                          <div className="no-signals">No active signals for this ETF</div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid-item score-container">
                  <SwingScore
                    etf={selectedEtf}
                    data={historicalData}
                    signals={signals}
                    loading={loading}
                  />
                </div>
              </div>

              <div className="secondary-analysis-grid">
                <div className="grid-item">
                  <PatternHighlight
                    patterns={patterns}
                    loading={loading}
                  />
                </div>

                <div className="grid-item">
                  <SupportResistance
                    levels={supportResistance}
                    currentPrice={latestStats.price}
                    loading={loading}
                  />
                </div>

                <div className="grid-item">
                  <VolumeAnalysis
                    data={historicalData}
                    loading={loading}
                  />
                </div>

                <div className="grid-item">
                  <TrendAnalysis
                    data={historicalData}
                    loading={loading}
                  />
                </div>

                <div className="grid-item">
                  <VolatilityMeter
                    data={historicalData}
                    loading={loading}
                  />
                </div>
              </div>

              <div className="indicator-selection">
                <div className="panel-header">
                  <h3>Technical Indicators</h3>
                </div>
                <div className="indicator-buttons">
                  {INDICATORS.map(indicator => (
                    <button
                      key={indicator.key}
                      className={`indicator-btn ${selectedIndicators.includes(indicator.key) ? 'active' : ''}`}
                      onClick={() => handleToggleIndicator(indicator.key)}
                      title={indicator.description}
                    >
                      {indicator.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-etf-selected">
              <h3>Select an ETF to begin swing trading analysis</h3>
              <p>Choose an ETF from the list on the left to view technical analysis and trading signals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data generators for when API isn't available
function generateMockEtfs() {
  return [
    { symbol: 'NIFTYBEES', schemeName: 'Nippon India ETF Nifty BeES', latestNav: 235.67, dailyChange: 0.8, amfiCode: '120046' },
    { symbol: 'BANKBEES', schemeName: 'Nippon India ETF Bank BeES', latestNav: 452.12, dailyChange: -0.3, amfiCode: '120035' },
    { symbol: 'GOLDBEES', schemeName: 'Nippon India ETF Gold BeES', latestNav: 48.75, dailyChange: 1.2, amfiCode: '120027' },
    { symbol: 'JUNIORBEES', schemeName: 'Nippon India ETF Junior BeES', latestNav: 432.58, dailyChange: 0.5, amfiCode: '120091' },
    { symbol: 'LIQUIDBEES', schemeName: 'Nippon India ETF Liquid BeES', latestNav: 1000.32, dailyChange: 0.02, amfiCode: '120018' }
  ];
}

function generateMockHistoricalData() {
  const data = [];
  const today = new Date();
  let basePrice = 100 + Math.random() * 100;
  const volatility = 0.02;

  // Generate 100 days of historical data
  for (let i = 100; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random price movements with slight trend
    const change = (Math.random() - 0.48) * volatility * basePrice;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;
    const volume = Math.floor(100000 + Math.random() * 900000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    basePrice = close;
  }

  return data;
}

function generateMockSignals() {
  const signalTypes = ['BUY', 'SELL', 'NEUTRAL'];
  const strengths = ['Strong', 'Moderate', 'Weak'];
  const timeframes = ['Short-term', 'Medium-term', 'Long-term'];
  const indicators = [
    'RSI Oversold', 'MACD Crossover', 'Golden Cross', 'Support Bounce',
    'RSI Overbought', 'MACD Bearish', 'Death Cross', 'Resistance Rejection'
  ];

  const signals = [];
  const numSignals = Math.floor(Math.random() * 4) + 1; // 1-4 signals

  for (let i = 0; i < numSignals; i++) {
    const type = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const isPositive = type === 'BUY';

    signals.push({
      type,
      strength: strengths[Math.floor(Math.random() * strengths.length)],
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      indicator: indicators[Math.floor(Math.random() * (isPositive ? 4 : indicators.length))],
      price: parseFloat((100 + Math.random() * 100).toFixed(2)),
      date: new Date().toISOString().split('T')[0],
      confidence: Math.floor(Math.random() * 30) + 70 // 70-99%
    });
  }

  return signals;
}

function generateMockPatterns() {
  const patternTypes = [
    'Double Bottom', 'Head and Shoulders', 'Cup and Handle', 'Triangle',
    'Wedge', 'Channel', 'Flag', 'Rectangle'
  ];

  const patterns = [];
  const numPatterns = Math.floor(Math.random() * 3); // 0-2 patterns

  for (let i = 0; i < numPatterns; i++) {
    patterns.push({
      type: patternTypes[Math.floor(Math.random() * patternTypes.length)],
      startIndex: Math.floor(Math.random() * 50),
      endIndex: Math.floor(Math.random() * 20) + 70,
      significance: Math.floor(Math.random() * 40) + 60, // 60-99%
      direction: Math.random() > 0.5 ? 'bullish' : 'bearish'
    });
  }

  return patterns;
}

function generateMockSupportResistance() {
  const basePrice = 100 + Math.random() * 100;

  // Generate 2-4 support levels
  const support = [];
  for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
    support.push({
      price: parseFloat((basePrice * (0.9 - i * 0.05)).toFixed(2)),
      strength: Math.floor(Math.random() * 40) + 60, // 60-99%
      touches: Math.floor(Math.random() * 5) + 1
    });
  }

  // Generate 2-4 resistance levels
  const resistance = [];
  for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
    resistance.push({
      price: parseFloat((basePrice * (1.1 + i * 0.05)).toFixed(2)),
      strength: Math.floor(Math.random() * 40) + 60, // 60-99%
      touches: Math.floor(Math.random() * 5) + 1
    });
  }

  return { support, resistance };
}
