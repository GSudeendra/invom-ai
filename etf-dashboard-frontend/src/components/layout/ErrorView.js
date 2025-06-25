import React from 'react';

const ErrorView = ({ error, onRetry, title = 'Error Loading Data' }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{typeof error === 'string' ? error : error?.message || String(error)}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorView; 