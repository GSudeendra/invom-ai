import React from 'react';

const LoadingView = ({ message = 'Loading data...' }) => {
  return (
    <div className="loading-container" data-testid="loading-indicator">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingView; 