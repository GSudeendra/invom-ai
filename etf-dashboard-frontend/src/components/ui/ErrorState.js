import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ error, onRetry, title = "Something went wrong" }) => (
  <div className="text-center py-16">
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {error?.message || String(error) || "We encountered an error while loading the data."}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-primary"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState = ({ message = "No ETFs found", description = "Try adjusting your filters or search terms." }) => (
  <div className="text-center py-16">
    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
    <p className="text-gray-600 max-w-md mx-auto">{description}</p>
  </div>
); 