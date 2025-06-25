// ETFCard.js - Individual ETF display component stub
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function ETFCard({ etf, onAddWatchlist, onDetails }) {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        mb: 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        boxShadow: 3,
        borderTop: '4px solid',
        borderImage: 'linear-gradient(90deg, #1976d2, #ff5722) 1',
      }}
    >
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <Typography variant="h6">{etf.name}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{etf.symbol}</Typography>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Typography variant="h5">₹{etf.price}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: etf.change > 0 ? '#4caf50' : '#f44336', fontWeight: 500 }}>
              {etf.change > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              {etf.change > 0 ? '+' : ''}{etf.change}%
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ textAlign: 'center', padding: 8, background: 'rgba(25,118,210,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>NAV</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{etf.nav}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, background: 'rgba(25,118,210,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Volume</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{etf.volume}</div>
          </div>
        </div>
      </CardContent>
      <CardActions sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" color="primary" fullWidth onClick={onAddWatchlist}>Add to Watchlist</Button>
        <Button variant="outlined" fullWidth onClick={onDetails}>Details</Button>
      </CardActions>
    </Card>
  );
} 