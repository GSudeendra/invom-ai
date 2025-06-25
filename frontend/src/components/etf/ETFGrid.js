import React, { useState, useEffect } from 'react';
import ETFCard from './ETFCard';

export default function ETFGrid({ etfs, categoryKey, live }) {
  // Only show ETFs with valid NAV (for non-live)
  const filteredEtfs = live
    ? (etfs || [])
    : (etfs || []).filter(etf => etf.latestNav !== undefined && etf.latestNav !== null && etf.latestNav !== '-');
  const [visibleCount, setVisibleCount] = useState(8);

  // When categoryKey changes, reset visibleCount to 8
  useEffect(() => {
    setVisibleCount(8);
  }, [categoryKey]);

  // Infinite scroll: load more when user scrolls near bottom (non-live only)
  useEffect(() => {
    if (live || !filteredEtfs.length) return;
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
        setVisibleCount(v => Math.min(v + 8, filteredEtfs.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEtfs.length, live]);

  // Auto-load more if not scrollable (non-live only)
  useEffect(() => {
    if (live || !filteredEtfs.length) return;
    if (visibleCount >= filteredEtfs.length) return;
    if (window.innerHeight >= document.body.offsetHeight) {
      setTimeout(() => {
        setVisibleCount(v => Math.min(v + 8, filteredEtfs.length));
      }, 0);
    }
  }, [visibleCount, filteredEtfs.length, live]);

  const visible = live ? filteredEtfs : filteredEtfs.slice(0, visibleCount);

  return (
    <div>
      <div className="etf-count">{filteredEtfs.length} ETFs found</div>
      <div className="etf-grid">
        {visible.length > 0 ? (
          visible.map((etf, idx) => (
            <ETFCard key={etf.amfiCode || etf.symbol || idx} etf={etf} live={live} />
          ))
        ) : (
          <div className="no-etfs-message">No ETFs found</div>
        )}
      </div>
    </div>
  );
}
