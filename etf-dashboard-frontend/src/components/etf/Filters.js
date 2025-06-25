import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({
  searchTerm = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  categoryOptions = [],
  recommendation = '',
  onRecommendationChange,
  price = '',
  onPriceChange,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search ETFs..."
            value={searchTerm}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>
        <select
          value={category}
          onChange={e => onCategoryChange && onCategoryChange(e.target.value)}
          className="select"
        >
          <option value="All">All Categories</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={recommendation}
          onChange={e => onRecommendationChange && onRecommendationChange(e.target.value)}
          className="select"
        >
          <option value="All">All Recommendations</option>
          <option value="Buy">Buy</option>
          <option value="Hold">Hold</option>
          <option value="Sell">Sell</option>
        </select>
        <select
          value={price}
          onChange={e => onPriceChange && onPriceChange(e.target.value)}
          className="select"
        >
          <option value="All">All Price Ranges</option>
          <option value="lt100">Below ₹100</option>
          <option value="100-500">₹100 - ₹500</option>
          <option value="gt500">Above ₹500</option>
        </select>
      </div>
    </div>
  );
}
