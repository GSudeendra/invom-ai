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
}) {
  const [open, setOpen] = useState(false);
  const [localCategory, setLocalCategory] = useState(category);
  const [localRecommendation, setLocalRecommendation] = useState(recommendation);
  const [localPrice, setLocalPrice] = useState(price);

  const handleApply = () => {
    onCategoryChange && onCategoryChange(localCategory);
    onRecommendationChange && onRecommendationChange(localRecommendation);
    onPriceChange && onPriceChange(localPrice);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalCategory('All');
    setLocalRecommendation('All');
    setLocalPrice('All');
    onClear && onClear();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(!open)}
      >
        <span className="mr-2">🔎</span> Advanced Filter
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={localCategory}
              onChange={e => setLocalCategory(e.target.value)}
              className="select"
            >
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