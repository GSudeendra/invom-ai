// Network utilities for handling API calls and errors

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class NetworkError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.url = url;
  }
}

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          fullUrl
        );
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

export const handleApiError = (error, context = 'API call') => {
  if (process.env.NODE_ENV === 'development') {
    // console.error(`${context} failed:`, error);
  }
  
  if (error instanceof NetworkError) {
    switch (error.status) {
      case 404:
        return 'Resource not found. Please check the URL and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Network error (${error.status}). Please check your connection and try again.`;
    }
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

export const isOnline = () => {
  return navigator.onLine;
};

export const addNetworkStatusListener = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export function fetchWithTimeout(resource, options = {}, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), timeout);
    fetch(resource, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
} 