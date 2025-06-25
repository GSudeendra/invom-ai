import React from 'react';
import { useDataSource, DATA_SOURCES } from '../contexts/DataSourceContext';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const DataSourceToggle = () => {
  const { dataSource, isLiveData, isLoading, toggleDataSource } = useDataSource();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
      <Button
        variant={isLiveData ? "contained" : "outlined"}
        color={isLiveData ? "primary" : "secondary"}
        onClick={toggleDataSource}
        startIcon={isLoading ? <CircularProgress size={20} /> : (isLiveData ? <SignalCellularAltIcon /> : <RefreshIcon />)}
        disabled={isLoading}
        sx={{ minWidth: 180 }}
      >
        {isLiveData ? "Live NSE Data" : "Default MF-India Data"}
      </Button>

      <Typography variant="body2" color="text.secondary">
        {isLiveData
          ? "Using real-time data from National Stock Exchange (NSE)"
          : "Using end-of-day data from AMFI / MF-India"}
      </Typography>
    </Box>
  );
};

export default DataSourceToggle;
