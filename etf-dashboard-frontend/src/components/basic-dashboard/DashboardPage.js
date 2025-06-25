import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/layout/Header';
import useCategories from '../../hooks/useCategories';
import useEtfsByCategory from '../../hooks/useEtfsByCategory';
import DashboardControls from './DashboardControls';
import { fetchLiveEtfs } from '../../api/etfApi';
import { useToast } from '../../contexts/ToastContext';
import CategoryTabs from './CategoryTabs';
import BasicSearch from './BasicSearch';
import BasicETFGrid from './BasicETFGrid';
import SimpleWatchlist from './SimpleWatchlist';

// Category keywords mapping for live filtering
const CATEGORY_KEYWORDS = {
  nifty50: ['nifty 50', 'niftybees', 'niftyetf', 'nifty bees'],
  banking: ['bank', 'banking', 'bankbees', 'nifty bank'],
  psuBanking: ['psu bank', 'psubnkbees'],
  privateBanking: ['private bank', 'pvt bank'],
  largeCap: ['largecap', 'top 100', 'nifty 100'],
  midCap: ['midcap', 'midcap 150', 'juniorbees'],
  smallCap: ['smallcap', 'small cap 250'],
  it: ['it', 'tech', 'nifty it', 'itbees'],
  sensex: ['sensex'],
  gold: ['gold', 'goldbees'],
  silver: ['silver', 'silverbees'],
  next50: ['nifty next 50', 'juniorbees'],
  liquid: ['liquid', 'liquidbees'],
  international: ['nasdaq', 'sp 500', 'international', 'global'],
  consumption: ['consumption', 'consumer'],
  healthcare: ['healthcare', 'pharma'],
  gilt: ['gsec', 'gilt', 'government bond'],
  momentum: ['momentum'],
  value: ['value'],
  quality: ['quality'],
  infrastructure: ['infra', 'infrastructure'],
  lowVolatility: ['low vol', 'lowvol'],
  equalWeight: ['equal weight', 'equalo'],
  metals: ['metal'],
  misc: [],
};

const WATCHLIST_KEY = 'etf_dashboard_watchlist';

function filterLiveEtfsByCategory(liveEtfs, selectedCategory) {
  const keywords = CATEGORY_KEYWORDS[selectedCategory] || [];
  if (!keywords.length) return liveEtfs;
  return liveEtfs.filter(etf => {
    const name = ((etf.assets || '') + ' ' + (etf.symbol || '')).toLowerCase();
    return keywords.some(keyword => name.includes(keyword));
  });
}

function DashboardPage() {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('large-cap');
  const { etfs, loading: etfLoading, error: etfError } = useEtfsByCategory(selectedCategory);

  // Refresh NAV state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  // Live toggle state
  const [live, setLive] = useState(false);
  const [liveEtfs, setLiveEtfs] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  // Watchlist state (persisted in localStorage)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (categories && categories.length > 0) {
      const largeCap = categories.find(c => c.key === 'large-cap');
      setSelectedCategory(largeCap ? largeCap.key : categories[0].key);
    }
  }, [categories]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  // Fetch live ETF data when live is ON
  useEffect(() => {
    if (!live) return;
    setLiveLoading(true);
    setLiveError(null);
    fetchLiveEtfs()
      .then(data => {
        setLiveEtfs(data.data || []);
        showSuccess('Live data loaded successfully!');
      })
      .catch(err => {
        setLiveError(err.message || 'Failed to fetch live ETF data');
        showError('Failed to load live data. Please try again.');
      })
      .finally(() => setLiveLoading(false));
  }, [live, showSuccess, showError]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  // Filtered ETFs
  const filteredEtfs = useMemo(() => {
    let data = etfs || [];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(etf =>
        (etf.schemeName && etf.schemeName.toLowerCase().includes(searchLower)) ||
        (etf.symbol && etf.symbol.toLowerCase().includes(searchLower))
      );
    }
    return data;
  }, [etfs, searchTerm]);

  // Watchlist handlers
  const handleAddRemoveWatchlist = (etf) => {
    const exists = watchlist.find(w => w.amfiCode === etf.amfiCode || w.symbol === etf.symbol);
    if (exists) {
      setWatchlist(watchlist.filter(w => w.amfiCode !== etf.amfiCode && w.symbol !== etf.symbol));
    } else if (watchlist.length < 10) {
      setWatchlist([...watchlist, etf]);
    }
  };
  const handleRemoveFromWatchlist = (etf) => {
    setWatchlist(watchlist.filter(w => w.amfiCode !== etf.amfiCode && w.symbol !== etf.symbol));
  };

  const handleRefreshNavs = async () => {
    setRefreshing(true);
    setRefreshMsg('');
    showInfo('Refreshing NAV data...');
    
    try {
      const res = await fetch('http://localhost:3001/api/nav/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to refresh NAV data');
      await res.json();
      setRefreshMsg('NAV data refreshed! Please wait a few seconds for new data to load.');
      showSuccess('NAV data refreshed successfully!');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setRefreshMsg('Error refreshing NAV data.');
      showError('Failed to refresh NAV data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLiveToggle = () => {
    setLive(l => !l);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSearchTerm('');
  };

  return (
    <div className="dashboard-main">
      <Header />
      
      <section className="dashboard-section dashboard-card">
        <div className="dashboard-controls-row">
          <CategoryTabs
            categories={categories && categories.length > 0 ? categories.filter(cat => cat.key !== 'all') : []}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <BasicSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </div>
        
        <DashboardControls
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categoryOptions={categories && categories.length > 0 ? categories.filter(cat => cat.key !== 'all').map(cat => ({ value: cat.key, label: cat.label })) : []}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onRefresh={handleRefreshNavs}
          refreshing={refreshing}
          live={live}
          onLiveToggle={handleLiveToggle}
        />
        
        {refreshMsg && (
          <div className={`refresh-message ${refreshMsg.includes('Error') ? 'error' : 'success'}`}>
            {refreshMsg}
          </div>
        )}
      </section>
      
      <section className="dashboard-section dashboard-card etf-list-section">
        {(catLoading || etfLoading || liveLoading) && (
          <div data-testid="loading-indicator">
            <span>Loading...</span>
          </div>
        )}
        <BasicETFGrid
          etfs={filteredEtfs}
          watchlist={watchlist}
          onToggleWatchlist={handleAddRemoveWatchlist}
          loading={catLoading || etfLoading || liveLoading}
          error={catError || etfError || liveError}
        />
      </section>
      <div className="dashboard-watchlist-col">
        <SimpleWatchlist watchlist={watchlist} onRemove={handleRemoveFromWatchlist} />
      </div>
    </div>
  );
}

export default DashboardPage;
