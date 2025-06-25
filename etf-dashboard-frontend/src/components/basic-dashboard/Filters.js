import React from 'react';

export default function Filters({
  category, onCategoryChange, categoryOptions = []
}) {
  return (
    <div className="controls">
      <div className="filter-group">
        <label>Category</label>
        <select data-testid="category-select" value={category} onChange={e => onCategoryChange(e.target.value)}>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
