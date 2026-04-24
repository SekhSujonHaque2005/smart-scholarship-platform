/**
 * SCHOLARHUB CACHING UTILITY
 * Simple TTL-based in-memory cache for API responses (like AI Matching).
 * Designed to be swapped with Redis in the future.
 */

const cache = new Map();

/**
 * Get item from cache
 * @param {string} key 
 */
const get = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Set item in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Time to live in seconds (default 1 hour)
 */
const set = (key, value, ttl = 3600) => {
  cache.set(key, {
    value,
    expiry: Date.now() + (ttl * 1000)
  });
};

/**
 * Clear specific key or whole cache
 * @param {string} key 
 */
const clear = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

module.exports = { get, set, clear };
