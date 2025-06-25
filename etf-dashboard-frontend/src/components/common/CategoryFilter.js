import React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const categories = [
  'All',
  'Nifty 50',
  'Banking',
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'Information Technology',
  'Sensex',
  'Precious Metals',
  'Gold',
  'Silver',
  'Next 50',
  'Liquid',
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
      {categories.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          color={selected === cat ? 'primary' : 'default'}
          variant={selected === cat ? 'filled' : 'outlined'}
          onClick={() => onSelect(cat)}
          sx={{ fontWeight: selected === cat ? 600 : 400 }}
        />
      ))}
    </Stack>
  );
} 