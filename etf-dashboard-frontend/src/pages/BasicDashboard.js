import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress, Divider, Paper } from '@mui/material';
import { fetchCategories, fetchEtfsByCategory } from '../api/etfApi';
import { useDataSource } from '../contexts/DataSourceContext';
import DataSourceToggle from '../components/DataSourceToggle';

const BasicDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [etfsInCategory, setEtfsInCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dataSource } = useDataSource();

  // Fetch categories when component mounts or data source changes
  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCategories(dataSource);
        setCategories(data);
        // Select first category by default if available
        if (data && data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].key);
        }
      } catch (err) {
        console.error('Failed to load ETF categories:', err);
        setError('Failed to load ETF categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [dataSource]);

  // Fetch ETFs when selected category changes
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadEtfsForCategory() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchEtfsByCategory(selectedCategory, dataSource);
        setEtfsInCategory(data);
      } catch (err) {
        console.error('Failed to load ETFs for selected category:', err);
        setError('Failed to load ETFs for this category. Please try again later.');
        setEtfsInCategory([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadEtfsForCategory();
  }, [selectedCategory, dataSource]);

  // Handle category selection
  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          ETF Dashboard
        </Typography>

        {/* Data source toggle */}
        <DataSourceToggle />

        {error && (
          <Paper elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            <Typography>{error}</Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Categories sidebar */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                ETF Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {isLoading && !categories.length ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box>
                  {categories.map((category) => (
                    <Box
                      key={category.key}
                      onClick={() => handleCategoryClick(category.key)}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: selectedCategory === category.key ? 'primary.light' : 'background.paper',
                        '&:hover': {
                          backgroundColor: selectedCategory === category.key ? 'primary.light' : 'action.hover',
                        },
                      }}
                    >
                      <Typography variant="subtitle1">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.count || 0} ETFs
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ETFs in selected category */}
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCategory ?
                  `ETFs in ${categories.find(c => c.key === selectedCategory)?.name || selectedCategory}` :
                  'Select a category'}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {isLoading && selectedCategory ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {etfsInCategory.length > 0 ? (
                    etfsInCategory.map((etf, index) => (
                      <Grid item xs={12} sm={6} md={4} key={etf.amfiCode || etf.symbol || index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" component="h3" noWrap title={etf.schemeName || etf.etfInfo}>
                              {etf.schemeName || etf.etfInfo || 'Unknown ETF'}
                            </Typography>

                            <Box mt={1} display="flex" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                {etf.symbol || `AMFI: ${etf.amfiCode}`}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={etf.change > 0 ? 'success.main' : etf.change < 0 ? 'error.main' : 'text.primary'}>
                                ₹{etf.latestNav || etf.ltp || '—'}
                              </Typography>
                            </Box>

                            {etf.change !== undefined && (
                              <Typography variant="body2" color={etf.change > 0 ? 'success.main' : etf.change < 0 ? 'error.main' : 'text.primary'}>
                                {etf.change > 0 ? '+' : ''}{etf.change}%
                              </Typography>
                            )}

                            {etf.navDate && (
                              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                As of: {etf.navDate}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box p={3} textAlign="center">
                        <Typography color="text.secondary">
                          {selectedCategory ? 'No ETFs found in this category' : 'Please select a category to view ETFs'}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BasicDashboard;
