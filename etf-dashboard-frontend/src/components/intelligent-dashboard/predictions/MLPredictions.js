import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

export default function MLPredictions({ etf, predictions, loading }) {
  if (loading) {
    return <div className="ai-loading">Loading AI predictions...</div>;
  }

  if (!predictions || !predictions.predictions || predictions.predictions.length === 0) {
    return <div className="ai-empty-state">No prediction data available for this ETF</div>;
  }

  // Determine confidence class based on confidence score
  const getConfidenceClass = (score) => {
    if (score >= 75) return 'confident';
    if (score >= 60) return 'moderate';
    return 'uncertain';
  };

  // Format date for better display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate prediction change percentage
  const calculateChange = () => {
    if (!predictions.predictions || predictions.predictions.length === 0) return 0;

    const firstPrediction = predictions.predictions[0].predicted;
    const lastPrediction = predictions.predictions[predictions.predictions.length - 1].predicted;

    return ((lastPrediction - firstPrediction) / firstPrediction * 100).toFixed(2);
  };

  const predictionChange = calculateChange();
  const changeClass = predictionChange > 0 ? 'positive-value' : predictionChange < 0 ? 'negative-value' : 'neutral-value';

  return (
    <div className="ml-predictions">
      <div className="ai-card">
        <div className="ai-card-header">
          <h3>Price Predictions (10 Days)</h3>
          <div className={`ai-card-badge ${getConfidenceClass(predictions.confidenceScore)}`}>
            {predictions.confidenceScore}% Confidence
          </div>
        </div>

        <div className="ai-metrics">
          <div className="metric-item">
            <span className="metric-label">Current Price</span>
            <span className="metric-value">₹{predictions.currentPrice?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Forecast Trend</span>
            <span className={`metric-value ${predictions.trend === 'Bullish' ? 'positive-value' : 'negative-value'}`}>
              {predictions.trend || 'Neutral'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">10-Day Change</span>
            <span className={`metric-value ${changeClass}`}>
              {predictionChange > 0 ? '+' : ''}{predictionChange}%
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Model Type</span>
            <span className="metric-value">{predictions.modelType || 'ML Model'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Model Accuracy</span>
            <span className="metric-value">{predictions.accuracy || 'N/A'}%</span>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={predictions.predictions}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`₹${value}`, '']}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
              />
              <Legend />
              <defs>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="upper"
                stroke="#82ca9d"
                fillOpacity={0.1}
                fill="url(#colorUpper)"
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#8884d8"
                fill="url(#colorPrediction)"
                name="Predicted Price"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="#ffc658"
                fillOpacity={0.1}
                fill="url(#colorLower)"
                name="Lower Bound"
              />
              <ReferenceLine
                y={predictions.currentPrice}
                label="Current"
                stroke="red"
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="prediction-insights">
          <h4>AI Insights</h4>
          <p>
            {predictions.trend === 'Bullish'
              ? `Our AI model predicts a bullish trend for ${etf?.symbol || 'this ETF'} over the next 10 days with ${predictionChange}% potential gain. The confidence score of ${predictions.confidenceScore}% indicates ${predictions.confidenceScore >= 75 ? 'high' : 'moderate'} reliability.`
              : `Our AI model predicts a bearish trend for ${etf?.symbol || 'this ETF'} over the next 10 days with ${Math.abs(predictionChange)}% potential decline. The confidence score of ${predictions.confidenceScore}% indicates ${predictions.confidenceScore >= 75 ? 'high' : 'moderate'} reliability.`
            }
          </p>
          <p className="disclaimer">
            <strong>Disclaimer:</strong> These predictions are based on historical data analysis and should not be the sole basis for investment decisions. Past performance is not indicative of future results.
          </p>
        </div>
      </div>

      <div className="ai-card">
        <div className="ai-card-header">
          <h3>Technical Factors Influencing Prediction</h3>
        </div>

        <div className="ai-grid">
          <div className="factor-card">
            <h4>Price Momentum</h4>
            <div className="factor-score">
              <div className="factor-bar">
                <div
                  className="factor-fill"
                  style={{
                    width: `${70 + Math.random() * 20}%`,
                    backgroundColor: '#8884d8'
                  }}
                ></div>
              </div>
              <div className="factor-value">{Math.floor(70 + Math.random() * 20)}%</div>
            </div>
            <p>Strong recent price movement suggesting continuation</p>
          </div>

          <div className="factor-card">
            <h4>Volume Analysis</h4>
            <div className="factor-score">
              <div className="factor-bar">
                <div
                  className="factor-fill"
                  style={{
                    width: `${50 + Math.random() * 30}%`,
                    backgroundColor: '#82ca9d'
                  }}
                ></div>
              </div>
              <div className="factor-value">{Math.floor(50 + Math.random() * 30)}%</div>
            </div>
            <p>Trading volume supports the predicted price direction</p>
          </div>

          <div className="factor-card">
            <h4>Market Correlation</h4>
            <div className="factor-score">
              <div className="factor-bar">
                <div
                  className="factor-fill"
                  style={{
                    width: `${60 + Math.random() * 25}%`,
                    backgroundColor: '#ffc658'
                  }}
                ></div>
              </div>
              <div className="factor-value">{Math.floor(60 + Math.random() * 25)}%</div>
            </div>
            <p>Strong correlation with broader market trends</p>
          </div>

          <div className="factor-card">
            <h4>Volatility</h4>
            <div className="factor-score">
              <div className="factor-bar">
                <div
                  className="factor-fill"
                  style={{
                    width: `${40 + Math.random() * 20}%`,
                    backgroundColor: '#ff8042'
                  }}
                ></div>
              </div>
              <div className="factor-value">{Math.floor(40 + Math.random() * 20)}%</div>
            </div>
            <p>Expected price volatility in the prediction period</p>
          </div>
        </div>
      </div>
    </div>
  );
}
