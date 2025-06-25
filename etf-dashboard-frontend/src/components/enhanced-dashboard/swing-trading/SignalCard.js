import React from 'react';

/**
 * SignalCard - Displays trading signals for swing trading with confidence and explanations
 */
export default function SignalCard({ signal }) {
  if (!signal) return null;

  // Determine signal type class for styling
  const getSignalTypeClass = (type) => {
    switch (type.toUpperCase()) {
      case 'BUY':
        return 'signal-buy';
      case 'SELL':
        return 'signal-sell';
      case 'NEUTRAL':
        return 'signal-neutral';
      default:
        return 'signal-neutral';
    }
  };

  // Determine strength class for styling
  const getStrengthClass = (strength) => {
    switch (strength.toLowerCase()) {
      case 'strong':
        return 'strength-strong';
      case 'moderate':
        return 'strength-moderate';
      case 'weak':
        return 'strength-weak';
      default:
        return 'strength-moderate';
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`signal-card ${getSignalTypeClass(signal.type)}`}>
      <div className="signal-header">
        <div className="signal-type-badge">
          {signal.type}
        </div>
        <div className={`signal-strength ${getStrengthClass(signal.strength)}`}>
          {signal.strength}
        </div>
      </div>

      <div className="signal-details">
        <div className="signal-indicator">
          {signal.indicator}
        </div>
        <div className="signal-price">
          ₹{signal.price?.toFixed(2) || 'N/A'}
        </div>
      </div>

      <div className="signal-meta">
        <div className="signal-timeframe">
          <span className="meta-label">Timeframe:</span>
          <span className="meta-value">{signal.timeframe}</span>
        </div>
        <div className="signal-date">
          <span className="meta-label">Date:</span>
          <span className="meta-value">{formatDate(signal.date)}</span>
        </div>
      </div>

      <div className="signal-confidence">
        <div className="confidence-label">Confidence</div>
        <div className="confidence-bar-container">
          <div
            className="confidence-bar"
            style={{ width: `${signal.confidence || 0}%` }}
          ></div>
        </div>
        <div className="confidence-value">{signal.confidence || 0}%</div>
      </div>

      {signal.description && (
        <div className="signal-description">
          {signal.description}
        </div>
      )}
    </div>
  );
}
