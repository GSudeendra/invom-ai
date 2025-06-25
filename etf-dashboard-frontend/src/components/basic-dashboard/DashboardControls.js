import React, { useState } from 'react';
import './DashboardControls.css';

export default function DashboardControls({
  searchTerm = '',
  onSearchChange,
  selectedCategory = '',
  onCategoryChange,
  categoryOptions = [],
  sortBy = 'name',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  onRefresh,
  refreshing = false,
  live = false,
  onLiveToggle
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="dashboard-controls-container">
      {/* Top Row: Dashboard Type, Live Toggle, Refresh */}
      <div className="controls-top-row">
        <div className="dashboard-type-indicator">
          <span className="type-icon">📊</span>
          <span className="type-text">ETF Dashboard</span>
        </div>
        
        <div className="controls-actions">
          <button
            className={`live-toggle-btn ${live ? 'active' : ''}`}
            data-testid="live-toggle-btn"
            onClick={onLiveToggle}
            title={live ? 'Switch to Historical Data' : 'Switch to Live Data'}
          >
            <span className="toggle-icon">📡</span>
            <span className="toggle-text">{live ? 'Live' : 'Historical'}</span>
            {live && <span className="live-indicator"></span>}
          </button>
          
          <button
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            data-testid="refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
          >
            <span className="refresh-icon">🔄</span>
            <span className="refresh-text">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search, Filters, Sort, View */}
      <div className="controls-bottom-row">
        <div className="search-container">
          <div className={`search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ETFs by name or symbol..."
              className="search-input"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label" htmlFor="category-select">
              Category
            </label>
            <select
              id="category-select"
              data-testid="category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="filter-select"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="sort-select">
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name</option>
              <option value="nav">NAV</option>
              <option value="performance">Performance</option>
              <option value="volume">Volume</option>
              <option value="rsi">RSI</option>
            </select>
          </div>

          <div className="view-toggle">
            <label className="filter-label" htmlFor="view-toggle">
              View
            </label>
            <div className="toggle-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Grid View"
              >
                <span className="view-icon">⊞</span>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => onViewModeChange('list')}
                title="List View"
              >
                <span className="view-icon">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 