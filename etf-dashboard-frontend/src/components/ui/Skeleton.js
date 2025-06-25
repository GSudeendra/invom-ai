import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';

export default function Skeleton({ variant = 'rectangular', width = '100%', height = 120, ...props }) {
  return (
    <MuiSkeleton
      variant={variant}
      width={width}
      height={height}
      animation="wave"
      sx={{ borderRadius: 3, mb: 2, ...props.sx }}
      {...props}
    />
  );
}

// ETF Card Skeleton
export const ETFCardSkeleton = () => (
  <div className="enhanced-etf-card grid-view animate-pulse">
    <div className="etf-header">
      <div className="etf-title-section">
        <Skeleton type="title" className="w-3/4 mb-2" />
        <Skeleton type="text" className="w-1/2" />
      </div>
      <Skeleton type="circle" />
    </div>
    
    <div className="price-chart-section">
      <div className="price-section">
        <Skeleton type="title" className="w-1/2 mb-2" />
        <div className="price-details">
          <Skeleton type="text" className="w-16" />
          <Skeleton type="text" className="w-16" />
        </div>
      </div>
      <div className="chart-section">
        <Skeleton type="card" className="w-16 h-12" />
        <Skeleton type="text" className="w-20" />
      </div>
    </div>
    
    <div className="technical-indicators">
      <div className="rsi-indicator">
        <div className="rsi-header">
          <Skeleton type="text" className="w-8" />
          <Skeleton type="text" className="w-12" />
        </div>
        <Skeleton type="text" className="w-full h-1" />
        <Skeleton type="text" className="w-20" />
      </div>
      <div className="indicators-row">
        <Skeleton type="text" className="w-24" />
        <Skeleton type="text" className="w-20" />
      </div>
    </div>
    
    <div className="card-actions">
      <Skeleton type="button" className="flex-1" />
      <Skeleton type="button" className="flex-1" />
    </div>
  </div>
);

// Grid Skeleton
export const ETFGridSkeleton = ({ count = 6 }) => (
  <div className="etf-grid-container">
    <Skeleton type="text" className="w-32 mb-4" />
    <div className="etf-grid grid-view">
      {Array.from({ length: count }).map((_, index) => (
        <ETFCardSkeleton key={index} />
      ))}
    </div>
  </div>
); 