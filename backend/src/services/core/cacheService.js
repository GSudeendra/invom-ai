// cacheService.js - In-memory caching logic stub

// Simple in-memory cache
const _cache = {};

function get(key) {
  const entry = _cache[key];
  if (!entry) return undefined;
  if (entry.expiry && Date.now() > entry.expiry) {
    delete _cache[key];
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlSeconds = 3600) {
  _cache[key] = {
    value,
    expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  };
}

module.exports = { get, set }; 