// BasicSearch.js - Simple search component stub
import React from 'react';

export default function BasicSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="basic-search">
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search ETFs by name or symbol..."
        className="basic-search-input"
      />
    </div>
  );
} 