// Utility functions for formatting

export function formatPrice(value) {
  if (!value || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value) {
  // Convert to number and handle various input types
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (value === null || value === undefined || isNaN(numValue)) return 'N/A';
  
  return `${numValue.toFixed(2)}%`;
}

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
}

export function formatVolume(value) {
  if (!value || isNaN(value)) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) return 'N/A';
  
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  }
  return numValue.toString();
}

export function formatCurrency(value) {
  if (!value || isNaN(value)) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) return 'N/A';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
} 