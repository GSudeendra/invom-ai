import React, { useState } from 'react';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import clsx from 'clsx';
import Modal from '../ui/Modal';
import ETFDetailView from './ETFDetailView';
import Tooltip from '../ui/Tooltip';
import { useToast } from '../../contexts/ToastContext';

function isValid(val) {
  return val !== undefined && val !== null && val !== '-' && val !== 'N/A';
}

// Badge component for tags
function Badge({ children, variant = 'default', className = '' }) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
}

// RSI indicator component with progress bar
function RSIIndicator({ rsi, color }) {
  if (!isValid(rsi)) return null;

  const getRSILabel = (rsi) => {
    if (rsi >= 70) return 'Overbought';
    if (rsi <= 30) return 'Oversold';
    return 'Neutral';
  };

  const getRSIVariant = (rsi) => {
    if (rsi >= 70) return 'danger';
    if (rsi <= 30) return 'success';
    return 'warning';
  };

  const getRSIColor = (rsi) => {
    if (rsi >= 70) return '#EF4444';
    if (rsi <= 30) return '#10B981';
    return '#F59E0B';
  };

  return (
    <div className="rsi-indicator">
      <div className="rsi-header">
        <span className="rsi-label">RSI</span>
        <span className="rsi-value" style={{ color: getRSIColor(rsi) }}>
          {rsi}
        </span>
      </div>
      <div className="rsi-progress-container">
        <div 
          className="rsi-progress-bar"
          style={{ 
            width: `${rsi}%`,
            backgroundColor: getRSIColor(rsi)
          }}
        />
      </div>
      <Badge variant={getRSIVariant(rsi)}>
        {getRSILabel(rsi)}
      </Badge>
    </div>
  );
}

// SMA Crossover indicator
function SMACrossoverIndicator({ smaCrossover }) {
  if (!smaCrossover) return null;

  const isBullish = smaCrossover === 'bullish';
  
  return (
    <Badge variant={isBullish ? 'success' : 'danger'}>
      <span className="mr-1">📈</span>
      {isBullish ? 'Bullish' : 'Bearish'} Crossover
    </Badge>
  );
}

// Volatility indicator
function VolatilityIndicator({ volatility, tag }) {
  if (!isValid(volatility)) return null;

  const getVolatilityVariant = (tag) => {
    switch (tag) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getVolatilityIcon = (tag) => {
    switch (tag) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌊';
      default: return '📊';
    }
  };

  return (
    <Badge variant={getVolatilityVariant(tag)}>
      <span className="mr-1">{getVolatilityIcon(tag)}</span>
      Vol: {volatility}%
    </Badge>
  );
}

// Change percentage component
function ChangePercentage({ value, label, className = '' }) {
  if (!isValid(value)) return null;

  const num = Number(value);
  const isPositive = num > 0;
  const isNegative = num < 0;

  return (
    <div className={clsx('change-percentage', className)}>
      <span className="change-label">{label}</span>
      <span 
        className={clsx('change-value', {
          'positive': isPositive,
          'negative': isNegative
        })}
      >
        {isPositive ? '+' : ''}{value}%
      </span>
    </div>
  );
}

// Mini sparkline chart component
function MiniSparklineChart({ data, width = 60, height = 20 }) {
  if (!data || data.length < 2) return null;

  return (
    <div className="mini-sparkline">
      <Sparklines data={data} width={width} height={height} margin={1}>
        <SparklinesCurve 
          style={{ fill: "none", stroke: "#3b82f6", strokeWidth: 1 }} 
        />
      </Sparklines>
    </div>
  );
}

// Volume indicator
function VolumeIndicator({ volume }) {
  if (!isValid(volume)) return null;

  const getVolumeColor = (vol) => {
    const num = Number(vol);
    if (num > 1000000) return '#10B981'; // High volume
    if (num > 500000) return '#F59E0B'; // Medium volume
    return '#EF4444'; // Low volume
  };

  return (
    <div className="volume-indicator">
      <span className="volume-icon">📊</span>
      <span className="volume-value" style={{ color: getVolumeColor(volume) }}>
        {Number(volume).toLocaleString()}
      </span>
    </div>
  );
}

export default function EnhancedETFCard({ etf, live, viewMode = 'grid', onClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { showSuccess, showError } = useToast();

  // Helper for live percent sign
  const getLivePercent = () => {
    if (!isValid(etf.per)) return '';
    const num = Number(etf.per);
    if (num > 0) return `(+${etf.per}%)`;
    if (num < 0) return `(${etf.per}%)`;
    return `(${etf.per}%)`;
  };

  // Helper for live price display
  const getLivePriceDisplay = () => {
    if (!isValid(etf.ltP)) return <span className="text-muted">N/A</span>;
    const color = Number(etf.per) > 0 ? '#10B981' : Number(etf.per) < 0 ? '#EF4444' : undefined;
    return (
      <span style={{ color, fontWeight: 600 }}>
        ₹{etf.ltP} {isValid(etf.per) ? getLivePercent() : ''}
      </span>
    );
  };

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleAddToWatchlist = () => {
    try {
      // Simulate API call
      setTimeout(() => {
        showSuccess(`${live ? etf.symbol : etf.schemeName} added to watchlist!`);
      }, 500);
    } catch (error) {
      showError('Failed to add to watchlist. Please try again.');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showSuccess(
      isFavorite 
        ? `${live ? etf.symbol : etf.schemeName} removed from favorites`
        : `${live ? etf.symbol : etf.schemeName} added to favorites`
    );
  };

  const cardClass = clsx('enhanced-etf-card', {
    'list-view': viewMode === 'list',
    'grid-view': viewMode === 'grid'
  });

  return (
    <>
      <div className={cardClass} data-category={live ? etf.assets : etf.category}>
        {live && (
          <span className="live-dot" title="Live"></span>
        )}
        
        {/* Header with name and symbol */}
        <div className="etf-header">
          <div className="etf-title-section">
            <h2 className="etf-name">{live ? etf.symbol : etf.schemeName || etf.symbol}</h2>
            <div className="etf-symbol">{live ? etf.assets : etf.symbol}</div>
          </div>
          <Tooltip content={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <button 
              className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="favorite-icon">{isFavorite ? '★' : '☆'}</span>
            </button>
          </Tooltip>
        </div>

        {/* Price and chart section */}
        <div className="price-chart-section">
          <div className="price-section">
            <div className="current-price">
              {live
                ? getLivePriceDisplay()
                : (isValid(etf.latestNav) ? `₹${etf.latestNav}` : <span className="text-muted">N/A</span>)}
            </div>
            <div className="price-details">
              <ChangePercentage value={etf.dailyChangePercent} label="1D" />
              <ChangePercentage value={etf.weeklyChangePercent} label="5D" />
            </div>
          </div>
          
          <div className="chart-section">
            <Tooltip content="Price trend over time">
              <div>
                <MiniSparklineChart data={etf.historicalPrices} />
              </div>
            </Tooltip>
            <VolumeIndicator volume={etf.volume} />
          </div>
        </div>

        {/* Technical indicators section - only for non-live data */}
        {!live && (
          <div className="technical-indicators">
            <RSIIndicator rsi={etf.rsi} color={etf.rsiColor} />
            
            <div className="indicators-row">
              <SMACrossoverIndicator smaCrossover={etf.smaCrossover} />
              <VolatilityIndicator volatility={etf.volatility} tag={etf.volatilityTag} />
            </div>
            {/* Render signal for test visibility */}
            {etf.signal && (
              <span className="etf-signal">{etf.signal}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="card-actions">
          <Tooltip content="View detailed information">
            <button className="action-btn primary" onClick={e => { handleViewDetails(); if (onClick) onClick(e); }}>
              View Details
            </button>
          </Tooltip>
          <Tooltip content="Add to your watchlist">
            <button className="action-btn secondary" onClick={handleAddToWatchlist}>
              Add to Watchlist
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${live ? etf.symbol : etf.schemeName} - Details`}
        size="lg"
      >
        <ETFDetailView etf={etf} live={live} />
      </Modal>
    </>
  );
} 