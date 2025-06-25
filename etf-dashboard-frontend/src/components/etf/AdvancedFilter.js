import React, { useState } from 'react';

export default function AdvancedFilter({
  category = '',
  onCategoryChange,
  categoryOptions = [],
  recommendation = '',
  onRecommendationChange,
  price = '',
  onPriceChange,
  onClear,
  defaultCategory = 'nifty50',
}) {
  const [open, setOpen] = useState(false);
  const [localCategory, setLocalCategory] = useState(category || defaultCategory);
  const [localRecommendation, setLocalRecommendation] = useState(recommendation);
  const [localPrice, setLocalPrice] = useState(price);

  const isFilterActive = category !== 'nifty50' || recommendation !== 'All' || price !== 'All';
  const filterCount = [category !== 'nifty50', recommendation !== 'All', price !== 'All'].filter(Boolean).length;

  const handleApply = () => {
    onCategoryChange && onCategoryChange(localCategory);
    onRecommendationChange && onRecommendationChange(localRecommendation);
    onPriceChange && onPriceChange(localPrice);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalCategory(defaultCategory);
    setLocalRecommendation('All');
    setLocalPrice('All');
    onClear && onClear();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 relative`}
        onClick={() => setOpen(!open)}
      >
        <span role="img" aria-label="filter">🔍</span> Advanced Filter
        {filterCount > 0 && filterCount <= 3 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full" title={`${filterCount} filter${filterCount > 1 ? 's' : ''} applied`}>{filterCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
          {isFilterActive && (
            <div className="mb-2 text-xs text-primary-700 font-semibold">Advanced filter applied</div>
          )}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={localCategory}
              onChange={e => setLocalCategory(e.target.value)}
              className="select"
            >
              <option value={defaultCategory}>{categoryOptions.find(opt => opt.value === defaultCategory)?.label || 'Nifty 50'}</option>
              <option value="All">All Categories</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Recommendation</label>
            <select
              value={localRecommendation}
              onChange={e => setLocalRecommendation(e.target.value)}
              className="select"
            >
              <option value="All">All Recommendations</option>
              <option value="Buy">Buy</option>
              <option value="Hold">Hold</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
            <select
              value={localPrice}
              onChange={e => setLocalPrice(e.target.value)}
              className="select"
            >
              <option value="All">All Price Ranges</option>
              <option value="lt100">Below ₹100</option>
              <option value="100-500">₹100 - ₹500</option>
              <option value="gt500">Above ₹500</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            <button className="btn btn-primary" onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
} 