import React, { createContext, useState, useContext } from 'react';

// Data source options
export const DATA_SOURCES = {
  DEFAULT: 'mf-india', // AMFI/MF-India data (default)
  LIVE: 'nse-live'     // Live NSE data
};

const DataSourceContext = createContext();

export function DataSourceProvider({ children }) {
  const [dataSource, setDataSource] = useState(DATA_SOURCES.DEFAULT);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle between data sources
  const toggleDataSource = () => {
    setIsLoading(true);
    setDataSource(prev =>
      prev === DATA_SOURCES.DEFAULT ? DATA_SOURCES.LIVE : DATA_SOURCES.DEFAULT
    );
    // Simulate network delay (you can remove this in production)
    setTimeout(() => setIsLoading(false), 500);
  };

  // Switch to specific data source
  const switchToDataSource = (source) => {
    if (Object.values(DATA_SOURCES).includes(source)) {
      setIsLoading(true);
      setDataSource(source);
      // Simulate network delay (you can remove this in production)
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        isLiveData: dataSource === DATA_SOURCES.LIVE,
        isLoading,
        toggleDataSource,
        switchToDataSource
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

// Custom hook to use the data source context
export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};
