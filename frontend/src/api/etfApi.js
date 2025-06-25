// API utility for ETF Dashboard

const BASE_URL = 'http://localhost:3001';

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/etfs/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}

export async function fetchEtfsByCategory(categoryKey) {
  const res = await fetch(`${BASE_URL}/api/etfs/category/${categoryKey}`);
  if (!res.ok) throw new Error('Failed to fetch ETFs for category');
  return await res.json();
}

// Optionally, keep this for NAV by schemeId
export async function fetchNavBySchemeId(schemeId) {
  const res = await fetch(`${BASE_URL}/api/nav?schemeId=${schemeId}`);
  if (!res.ok) throw new Error('Failed to fetch NAV details');
  return await res.json();
}

// Fetch live ETF data from backend
export async function fetchLiveEtfs() {
  const res = await fetch(`${BASE_URL}/api/etfs/live`);
  if (!res.ok) throw new Error('Failed to fetch live ETF data');
  return await res.json();
}
