// CategoryTabs.js - Category tab navigation stub
import React from 'react';

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="category-tabs">
      {categories.map(cat => (
        <button
          key={cat.key}
          className={`category-tab${cat.key === selectedCategory ? ' selected' : ''}`}
          onClick={() => onCategoryChange(cat.key)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
} 