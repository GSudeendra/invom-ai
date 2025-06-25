import React, { useState, useEffect } from 'react';
import EnhancedETFCard from '../enhanced-dashboard/EnhancedETFCard';
import { ETFGridSkeleton } from '../ui/Skeleton';
import '../enhanced-dashboard/EnhancedETFCard.css';

export default function ETFGrid({ etfs, categoryKey, live, viewMode = 'grid', loading = false, onCardClick }) {
  // Only show ETFs with valid NAV (for non-live)
  const filteredEtfs = live
    ? (etfs || [])
    : (etfs || []).filter(etf => etf.latestNav !== undefined && etf.latestNav !== null && etf.latestNav !== '-');
  
  const [visibleCount, setVisibleCount] = useState(viewMode === 'grid' ? 12 : 20);

  // When categoryKey or viewMode changes, reset visibleCount
  useEffect(() => {
    setVisibleCount(viewMode === 'grid' ? 12 : 20);
  }, [categoryKey, viewMode]);

  // Infinite scroll: load more when user scrolls near bottom (non-live only)
  useEffect(() => {
    if (live || !filteredEtfs.length) return;
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
        setVisibleCount(v => Math.min(v + (viewMode === 'grid' ? 12 : 20), filteredEtfs.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEtfs.length, live, viewMode]);

  // Auto-load more if not scrollable (non-live only)
  useEffect(() => {
    if (live || !filteredEtfs.length) return;
    if (visibleCount >= filteredEtfs.length) return;
    if (window.innerHeight >= document.body.offsetHeight) {
      setTimeout(() => {
        setVisibleCount(v => Math.min(v + (viewMode === 'grid' ? 12 : 20), filteredEtfs.length));
      }, 0);
    }
  }, [visibleCount, filteredEtfs.length, live, viewMode]);

  const visible = live ? filteredEtfs : filteredEtfs.slice(0, visibleCount);

  // Show skeleton loader while loading
  if (loading) {
    return <ETFGridSkeleton count={viewMode === 'grid' ? 6 : 10} />;
  }

  return (
    <div className="etf-grid-container">
      <div className="etf-count">
        {filteredEtfs.length} ETF{filteredEtfs.length !== 1 ? 's' : ''} found
        {viewMode === 'list' && (
          <span className="view-mode-indicator"> • List View</span>
        )}
      </div>
      
      <div className={`etf-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {visible.length > 0 ? (
          visible.map((etf, idx) => (
            <EnhancedETFCard 
              key={etf.amfiCode || etf.symbol || idx} 
              etf={etf} 
              live={live}
              viewMode={viewMode}
              onClick={() => onCardClick(etf)}
            />
          ))
        ) : (
          <div className="no-etfs-message">
            <div className="no-etfs-icon">📊</div>
            <h3>No Large Cap ETFs Available</h3>
            <p>There are currently no ETFs in the Large Cap category. Please check back later.</p>
          </div>
        )}
      </div>
      
      {!live && visibleCount < filteredEtfs.length && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={() => setVisibleCount(v => Math.min(v + (viewMode === 'grid' ? 12 : 20), filteredEtfs.length))}
          >
            Load More ETFs
          </button>
        </div>
      )}
    </div>
  );
}
