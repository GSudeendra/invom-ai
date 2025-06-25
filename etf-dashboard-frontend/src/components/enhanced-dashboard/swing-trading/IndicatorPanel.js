import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SwingTrading.css';

const BASE_URL = 'http://localhost:3001';

// Technical indicators with descriptions
const INDICATORS = {
  rsi: {
    name: 'RSI',
    description: 'Relative Strength Index - Measures momentum and overbought/oversold conditions',
    interpretation: {
      bullish: 'RSI crossing above 30 from below (oversold)',
      bearish: 'RSI crossing below 70 from above (overbought)',
      neutral: 'RSI between 30 and 70'
    }
  },
  macd: {
    name: 'MACD',
    description: 'Moving Average Convergence Divergence - Trend following momentum indicator',
    interpretation: {
      bullish: 'MACD line crosses above signal line',
      bearish: 'MACD line crosses below signal line',
      neutral: 'MACD and signal lines moving together'
    }
  },
  ema20_50: {
    name: 'EMA Cross (20/50)',
    description: 'Exponential Moving Average crossover between 20 and 50 period',
    interpretation: {
      bullish: '20 EMA crosses above 50 EMA (Golden Cross)',
      bearish: '20 EMA crosses below 50 EMA (Death Cross)',
      neutral: '20 and 50 EMAs moving parallel'
    }
  },
  bollinger: {
    name: 'Bollinger Bands',
    description: 'Volatility bands based on standard deviation',
    interpretation: {
      bullish: 'Price bouncing off lower band',
      bearish: 'Price touching upper band and reversing',
      neutral: 'Price moving within the bands'
    }
  },
  volume: {
    name: 'Volume Analysis',
    description: 'Trading volume pattern analysis',
    interpretation: {
      bullish: 'Increasing price with increasing volume',
      bearish: 'Decreasing price with increasing volume',
      neutral: 'Average volume with no significant price change'
    }
  }
};

export default function IndicatorPanel({ etf }) {
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (!etf || !etf.symbol) {
      setError('No ETF selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch technical indicators for this ETF
    axios.get(`${BASE_URL}/api/etfs/${etf.symbol}/indicators`)
      .then(response => {
        if (response.data && response.data.data) {
          setIndicators(response.data.data);
        } else {
          // If API isn't ready yet, use mock data for demonstration
          setIndicators(generateMockIndicatorData(etf));
        }
      })
      .catch(err => {
        console.error('Error fetching indicators:', err);
        setError('Failed to load technical indicators');
        // Use mock data for demonstration
        setIndicators(generateMockIndicatorData(etf));
      })
      .finally(() => setLoading(false));
  }, [etf]);

  if (loading) return <div className="indicators-loading">Loading indicators...</div>;
  if (error) return <div className="indicators-error">Error: {error}</div>;

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="indicator-summary">
            <div className="indicator-signal-summary">
              <div className="signal-header">
                <h4>Signal Summary</h4>
                <div className={`overall-signal ${indicators.overallSignal?.toLowerCase() || 'neutral'}`}>
                  {indicators.overallSignal || 'Neutral'}
                </div>
              </div>
              <p className="signal-description">
                {getOverallSignalDescription(indicators.overallSignal)}
              </p>
            </div>

            <div className="key-indicators">
              {Object.keys(INDICATORS).map(key => {
                const indicator = INDICATORS[key];
                const value = indicators[key];
                const signal = indicators[`${key}Signal`] || 'Neutral';

                return (
                  <div key={key} className="indicator-card">
                    <div className="indicator-header">
                      <h5>{indicator.name}</h5>
                      <div className={`indicator-signal ${signal.toLowerCase()}`}>
                        {signal}
                      </div>
                    </div>
                    <p className="indicator-value">{renderIndicatorValue(key, value)}</p>
                    <p className="indicator-desc">{indicator.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'momentum':
        return (
          <div className="indicator-group">
            <h4>Momentum Indicators</h4>
            <div className="indicator-detail">
              <h5>RSI (14)</h5>
              <div className="indicator-value-large">{indicators.rsi?.toFixed(2) || 'N/A'}</div>
              <div className="indicator-gauge">
                <div className="gauge-scale">
                  <span>0</span>
                  <span>30</span>
                  <span>70</span>
                  <span>100</span>
                </div>
                <div className="gauge-bar">
                  <div
                    className="gauge-marker"
                    style={{ left: `${indicators.rsi || 50}%` }}
                  ></div>
                </div>
                <div className="gauge-zones">
                  <div className="zone oversold" title="Oversold"></div>
                  <div className="zone neutral" title="Neutral"></div>
                  <div className="zone overbought" title="Overbought"></div>
                </div>
              </div>
              <p className="indicator-interpretation">
                {getInterpretation('rsi', indicators.rsi)}
              </p>
            </div>

            <div className="indicator-detail">
              <h5>MACD</h5>
              <div className="indicator-values-row">
                <div className="value-item">
                  <span className="value-label">MACD Line:</span>
                  <span className="value">{indicators.macd?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">Signal Line:</span>
                  <span className="value">{indicators.macdSignal?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">Histogram:</span>
                  <span className="value">{indicators.macdHistogram?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
              <p className="indicator-interpretation">
                {getInterpretation('macd', indicators.macd, indicators.macdSignal)}
              </p>
            </div>
          </div>
        );

      case 'trend':
        return (
          <div className="indicator-group">
            <h4>Trend Indicators</h4>
            <div className="indicator-detail">
              <h5>Moving Averages</h5>
              <div className="indicator-values-row">
                <div className="value-item">
                  <span className="value-label">EMA 20:</span>
                  <span className="value">₹{indicators.ema20?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">EMA 50:</span>
                  <span className="value">₹{indicators.ema50?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">EMA 200:</span>
                  <span className="value">₹{indicators.ema200?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
              <div className="moving-avg-signals">
                <div className="signal-item">
                  <span className="signal-label">20/50 Cross:</span>
                  <span className={`signal ${indicators.ema20_50Signal?.toLowerCase() || 'neutral'}`}>
                    {indicators.ema20_50Signal || 'Neutral'}
                  </span>
                </div>
                <div className="signal-item">
                  <span className="signal-label">50/200 Cross:</span>
                  <span className={`signal ${indicators.ema50_200Signal?.toLowerCase() || 'neutral'}`}>
                    {indicators.ema50_200Signal || 'Neutral'}
                  </span>
                </div>
              </div>
              <p className="indicator-interpretation">
                {getInterpretation('ema20_50', indicators.ema20, indicators.ema50)}
              </p>
            </div>
          </div>
        );

      case 'volatility':
        return (
          <div className="indicator-group">
            <h4>Volatility Indicators</h4>
            <div className="indicator-detail">
              <h5>Bollinger Bands</h5>
              <div className="indicator-values-row">
                <div className="value-item">
                  <span className="value-label">Upper Band:</span>
                  <span className="value">₹{indicators.bollingerUpper?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">Middle Band (SMA 20):</span>
                  <span className="value">₹{indicators.bollingerMiddle?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">Lower Band:</span>
                  <span className="value">₹{indicators.bollingerLower?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
              <div className="value-item">
                <span className="value-label">Bandwidth:</span>
                <span className="value">{indicators.bollingerBandwidth?.toFixed(2) || 'N/A'}%</span>
              </div>
              <p className="indicator-interpretation">
                {getInterpretation('bollinger',
                  indicators.lastPrice,
                  indicators.bollingerUpper,
                  indicators.bollingerLower)}
              </p>
            </div>

            <div className="indicator-detail">
              <h5>ATR (Average True Range)</h5>
              <div className="value-item">
                <span className="value-label">ATR (14):</span>
                <span className="value">₹{indicators.atr?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="value-item">
                <span className="value-label">ATR %:</span>
                <span className="value">{indicators.atrPercent?.toFixed(2) || 'N/A'}%</span>
              </div>
            </div>
          </div>
        );

      case 'volume':
        return (
          <div className="indicator-group">
            <h4>Volume Analysis</h4>
            <div className="indicator-detail">
              <h5>Volume Indicators</h5>
              <div className="indicator-values-row">
                <div className="value-item">
                  <span className="value-label">Current Volume:</span>
                  <span className="value">{formatVolume(indicators.volume) || 'N/A'}</span>
                </div>
                <div className="value-item">
                  <span className="value-label">Avg Volume (20D):</span>
                  <span className="value">{formatVolume(indicators.avgVolume20) || 'N/A'}</span>
                </div>
              </div>
              <div className="value-item">
                <span className="value-label">Volume vs Avg:</span>
                <span className={`value ${getVolumeChangeClass(indicators.volumeChange)}`}>
                  {indicators.volumeChange > 0 ? '+' : ''}{indicators.volumeChange?.toFixed(2) || 0}%
                </span>
              </div>
              <div className="value-item">
                <span className="value-label">OBV (On-Balance Volume):</span>
                <span className="value">{formatVolume(indicators.obv) || 'N/A'}</span>
              </div>
              <p className="indicator-interpretation">
                {getInterpretation('volume',
                  indicators.volumeChange,
                  indicators.priceChange)}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="indicator-panel">
      <div className="indicator-navigation">
        <button
          className={`indicator-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`indicator-tab ${activeTab === 'momentum' ? 'active' : ''}`}
          onClick={() => setActiveTab('momentum')}
        >
          Momentum
        </button>
        <button
          className={`indicator-tab ${activeTab === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveTab('trend')}
        >
          Trend
        </button>
        <button
          className={`indicator-tab ${activeTab === 'volatility' ? 'active' : ''}`}
          onClick={() => setActiveTab('volatility')}
        >
          Volatility
        </button>
        <button
          className={`indicator-tab ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          Volume
        </button>
      </div>

      <div className="indicator-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Helper function to format volume numbers
function formatVolume(volume) {
  if (!volume) return 'N/A';

  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume;
}

// Helper function to get color class for volume change
function getVolumeChangeClass(change) {
  if (!change) return '';
  if (change > 20) return 'very-positive';
  if (change > 0) return 'positive';
  if (change < -20) return 'very-negative';
  if (change < 0) return 'negative';
  return '';
}

// Helper function for rendering indicator values based on type
function renderIndicatorValue(key, value) {
  if (value === undefined || value === null) return 'N/A';

  switch (key) {
    case 'rsi':
      return `${value.toFixed(2)}`;
    case 'macd':
      return `${value.toFixed(2)}`;
    case 'ema20_50':
      return 'EMA 20/50 Cross';
    case 'bollinger':
      return 'Width: ' + value.toFixed(2) + '%';
    case 'volume':
      return formatVolume(value);
    default:
      return value.toString();
  }
}

// Get overall signal interpretation
function getOverallSignalDescription(signal) {
  switch (signal) {
    case 'Bullish':
      return 'Technical indicators suggest a positive outlook. Consider buy opportunities with proper risk management.';
    case 'Bearish':
      return 'Technical indicators suggest a negative outlook. Be cautious with new positions and consider reducing exposure.';
    case 'Neutral':
      return 'Technical indicators are mixed. Wait for clearer signals before making significant position changes.';
    case 'Strong Bullish':
      return 'Multiple strong buy signals across indicators. Favorable conditions for entering long positions.';
    case 'Strong Bearish':
      return 'Multiple strong sell signals across indicators. Consider defensive positioning or hedging strategies.';
    default:
      return 'Analyzing current market conditions...';
  }
}

// Get interpretation for specific indicators
function getInterpretation(indicator, ...values) {
  if (!INDICATORS[indicator]) return '';

  switch (indicator) {
    case 'rsi':
      const rsi = values[0];
      if (!rsi) return INDICATORS[indicator].interpretation.neutral;
      if (rsi < 30) return INDICATORS[indicator].interpretation.bullish;
      if (rsi > 70) return INDICATORS[indicator].interpretation.bearish;
      return INDICATORS[indicator].interpretation.neutral;

    case 'macd':
      const macd = values[0];
      const signal = values[1];
      if (!macd || !signal) return INDICATORS[indicator].interpretation.neutral;
      if (macd > signal) return INDICATORS[indicator].interpretation.bullish;
      if (macd < signal) return INDICATORS[indicator].interpretation.bearish;
      return INDICATORS[indicator].interpretation.neutral;

    case 'ema20_50':
      const ema20 = values[0];
      const ema50 = values[1];
      if (!ema20 || !ema50) return INDICATORS[indicator].interpretation.neutral;
      if (ema20 > ema50) return INDICATORS[indicator].interpretation.bullish;
      if (ema20 < ema50) return INDICATORS[indicator].interpretation.bearish;
      return INDICATORS[indicator].interpretation.neutral;

    case 'bollinger':
      const price = values[0];
      const upper = values[1];
      const lower = values[2];
      if (!price || !upper || !lower) return INDICATORS[indicator].interpretation.neutral;
      if (price <= lower * 1.02) return INDICATORS[indicator].interpretation.bullish;
      if (price >= upper * 0.98) return INDICATORS[indicator].interpretation.bearish;
      return INDICATORS[indicator].interpretation.neutral;

    case 'volume':
      const volumeChange = values[0];
      const priceChange = values[1];
      if (!volumeChange || !priceChange) return INDICATORS[indicator].interpretation.neutral;
      if (volumeChange > 20 && priceChange > 0) return INDICATORS[indicator].interpretation.bullish;
      if (volumeChange > 20 && priceChange < 0) return INDICATORS[indicator].interpretation.bearish;
      return INDICATORS[indicator].interpretation.neutral;

    default:
      return INDICATORS[indicator].interpretation.neutral;
  }
}

// Generate mock indicator data for demonstration purposes
function generateMockIndicatorData(etf) {
  const basePrice = etf.latestNav || 100;

  // Randomize whether the ETF is in an uptrend, downtrend, or neutral
  const trend = Math.random();
  let trendType;

  if (trend < 0.33) {
    trendType = 'bullish';
  } else if (trend < 0.66) {
    trendType = 'bearish';
  } else {
    trendType = 'neutral';
  }

  // Generate appropriate indicator values based on the trend
  let rsi, macd, macdSignal, macdHistogram, ema20, ema50, ema200;
  let bollingerUpper, bollingerMiddle, bollingerLower, bollingerBandwidth;
  let volume, avgVolume20, volumeChange, priceChange, obv;
  let atr, atrPercent;

  switch (trendType) {
    case 'bullish':
      rsi = 55 + Math.random() * 15; // 55-70
      macd = 1 + Math.random() * 2; // 1-3
      macdSignal = macd - (0.5 + Math.random()); // MACD above signal
      macdHistogram = macd - macdSignal;
      ema20 = basePrice * (1 + Math.random() * 0.05); // Above price
      ema50 = ema20 * 0.98; // EMA20 > EMA50
      ema200 = ema50 * 0.97; // EMA50 > EMA200
      bollingerMiddle = basePrice;
      bollingerBandwidth = 3 + Math.random() * 2;
      bollingerUpper = bollingerMiddle * (1 + bollingerBandwidth/100);
      bollingerLower = bollingerMiddle * (1 - bollingerBandwidth/100);
      volume = 500000 + Math.random() * 500000;
      avgVolume20 = volume * 0.7;
      volumeChange = 20 + Math.random() * 40; // 20-60% increase
      priceChange = 2 + Math.random() * 5; // 2-7% increase
      obv = 1000000 + Math.random() * 500000;
      atr = basePrice * 0.01; // 1% of price
      atrPercent = 1 + Math.random();
      break;

    case 'bearish':
      rsi = 30 - Math.random() * 10; // 20-30
      macd = -1 - Math.random() * 2; // -1 to -3
      macdSignal = macd + (0.5 + Math.random()); // MACD below signal
      macdHistogram = macd - macdSignal;
      ema20 = basePrice * (1 - Math.random() * 0.05); // Below price
      ema50 = ema20 * 1.02; // EMA20 < EMA50
      ema200 = ema50 * 1.02; // EMA50 < EMA200
      bollingerMiddle = basePrice;
      bollingerBandwidth = 4 + Math.random() * 3;
      bollingerUpper = bollingerMiddle * (1 + bollingerBandwidth/100);
      bollingerLower = bollingerMiddle * (1 - bollingerBandwidth/100);
      volume = 600000 + Math.random() * 500000;
      avgVolume20 = volume * 0.8;
      volumeChange = 10 + Math.random() * 30; // 10-40% increase
      priceChange = -2 - Math.random() * 5; // -2 to -7% decrease
      obv = 900000 - Math.random() * 300000;
      atr = basePrice * 0.02; // 2% of price
      atrPercent = 1.5 + Math.random();
      break;

    default: // neutral
      rsi = 40 + Math.random() * 20; // 40-60
      macd = -0.5 + Math.random(); // -0.5 to 0.5
      macdSignal = macd + (-0.3 + Math.random() * 0.6); // Close to MACD
      macdHistogram = macd - macdSignal;
      ema20 = basePrice * (1 + (-0.02 + Math.random() * 0.04)); // Near price
      ema50 = ema20 * (1 + (-0.01 + Math.random() * 0.02)); // Near EMA20
      ema200 = ema50 * (1 + (-0.01 + Math.random() * 0.02)); // Near EMA50
      bollingerMiddle = basePrice;
      bollingerBandwidth = 2 + Math.random();
      bollingerUpper = bollingerMiddle * (1 + bollingerBandwidth/100);
      bollingerLower = bollingerMiddle * (1 - bollingerBandwidth/100);
      volume = 300000 + Math.random() * 200000;
      avgVolume20 = volume * (0.8 + Math.random() * 0.4);
      volumeChange = -10 + Math.random() * 20; // -10 to 10% change
      priceChange = -1 + Math.random() * 2; // -1 to 1% change
      obv = 950000 + Math.random() * 100000;
      atr = basePrice * 0.007; // 0.7% of price
      atrPercent = 0.7 + Math.random() * 0.6;
      break;
  }

  // Generate signals based on the indicator values
  const rsiSignal = rsi > 70 ? 'Bearish' : rsi < 30 ? 'Bullish' : 'Neutral';
  const macdSignalValue = macd > macdSignal ? 'Bullish' : macd < macdSignal ? 'Bearish' : 'Neutral';
  const ema20_50Signal = ema20 > ema50 ? 'Bullish' : ema20 < ema50 ? 'Bearish' : 'Neutral';
  const ema50_200Signal = ema50 > ema200 ? 'Bullish' : ema50 < ema200 ? 'Bearish' : 'Neutral';

  const lastPrice = basePrice * (1 + priceChange/100);
  const bollingerSignal = lastPrice >= bollingerUpper * 0.98 ? 'Bearish' :
                        lastPrice <= bollingerLower * 1.02 ? 'Bullish' : 'Neutral';

  const volumeSignal = volumeChange > 20 && priceChange > 0 ? 'Bullish' :
                     volumeChange > 20 && priceChange < 0 ? 'Bearish' : 'Neutral';

  // Overall signal based on a weighted average of all signals
  let signals = [rsiSignal, macdSignalValue, ema20_50Signal, ema50_200Signal, bollingerSignal, volumeSignal];
  let bullishCount = signals.filter(s => s === 'Bullish').length;
  let bearishCount = signals.filter(s => s === 'Bearish').length;

  let overallSignal;
  if (bullishCount > bearishCount && bullishCount >= 4) {
    overallSignal = 'Strong Bullish';
  } else if (bearishCount > bullishCount && bearishCount >= 4) {
    overallSignal = 'Strong Bearish';
  } else if (bullishCount > bearishCount) {
    overallSignal = 'Bullish';
  } else if (bearishCount > bullishCount) {
    overallSignal = 'Bearish';
  } else {
    overallSignal = 'Neutral';
  }

  return {
    // Momentum indicators
    rsi,
    rsiSignal,
    macd,
    macdSignal,
    macdHistogram,
    macdSignal: macdSignalValue,

    // Trend indicators
    ema20,
    ema50,
    ema200,
    ema20_50Signal,
    ema50_200Signal,

    // Volatility indicators
    atr,
    atrPercent,
    bollingerUpper,
    bollingerMiddle,
    bollingerLower,
    bollingerBandwidth,
    bollingerSignal,

    // Volume indicators
    volume,
    avgVolume20,
    volumeChange,
    priceChange,
    obv,
    volumeSignal,

    // Price data
    lastPrice,

    // Overall signal
    overallSignal
  };
}
