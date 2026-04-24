/**
 * SCHOLARHUB PRODUCTION CACHING ENGINE
 * Supports Redis for distributed caching with an in-memory fallback.
 */

const Redis = require('ioredis');

let redis = null;
const memoryCache = new Map();

// Initialize Redis if URL is provided
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 100, 2000);
    }
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis connection failed. Falling back to in-memory cache.', err.message);
  });
}

/**
 * Get item from cache
 * @param {string} key 
 */
const get = async (key) => {
  // Try Redis first
  if (redis && redis.status === 'ready') {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis Get Error:', err);
    }
  }

  // Fallback to Memory
  const item = memoryCache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
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
const set = async (key, value, ttl = 3600) => {
  // Set in Redis
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      console.error('Redis Set Error:', err);
    }
  }

  // Set in Memory (Sync)
  memoryCache.set(key, {
    value,
    expiry: Date.now() + (ttl * 1000)
  });
};

/**
 * Clear specific key or whole cache
 * @param {string} key 
 */
const clear = async (key) => {
  if (redis && redis.status === 'ready') {
    try {
      if (key) await redis.del(key);
      else await redis.flushall();
    } catch (err) {
      console.error('Redis Clear Error:', err);
    }
  }

  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
};

module.exports = { get, set, clear };
