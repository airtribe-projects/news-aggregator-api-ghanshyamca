const NodeCache = require('node-cache');

// Cache configuration
const CACHE_TTL = 1800; // 30 minutes in seconds
const CACHE_CHECK_PERIOD = 600; // 10 minutes in seconds

class NewsCacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: CACHE_TTL,
            checkperiod: CACHE_CHECK_PERIOD,
            useClones: false
        });
        
        // Start periodic cache cleanup
        this.startPeriodicCleanup();
    }

    // Generate cache key for news preferences
    generateCacheKey(preferences) {
        const sortedPrefs = preferences.sort().join(',');
        return `news:${sortedPrefs}`;
    }

    // Generate cache key for search
    generateSearchCacheKey(keyword) {
        return `search:${keyword.toLowerCase()}`;
    }

    // Get cached news
    async getCachedNews(preferences) {
        const cacheKey = this.generateCacheKey(preferences);
        const cachedData = this.cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for preferences: ${preferences.join(', ')}`);
            return {
                ...cachedData,
                fromCache: true,
                cachedAt: cachedData.cachedAt
            };
        }
        
        console.log(`Cache miss for preferences: ${preferences.join(', ')}`);
        return null;
    }

    // Set cached news
    async setCachedNews(preferences, newsData) {
        const cacheKey = this.generateCacheKey(preferences);
        const dataToCache = {
            ...newsData,
            cachedAt: new Date().toISOString(),
            preferences: preferences
        };
        
        this.cache.set(cacheKey, dataToCache);
        console.log(`News cached for preferences: ${preferences.join(', ')}`);
        return dataToCache;
    }

    // Get cached search results
    async getCachedSearch(keyword) {
        const cacheKey = this.generateSearchCacheKey(keyword);
        return this.cache.get(cacheKey);
    }

    // Set cached search results
    async setCachedSearch(keyword, searchData) {
        const cacheKey = this.generateSearchCacheKey(keyword);
        const dataToCache = {
            ...searchData,
            cachedAt: new Date().toISOString(),
            keyword: keyword
        };
        
        this.cache.set(cacheKey, dataToCache, 900); // 15 minutes TTL for search
        return dataToCache;
    }

    // Invalidate cache for specific preferences
    async invalidateCache(preferences) {
        const cacheKey = this.generateCacheKey(preferences);
        this.cache.del(cacheKey);
        console.log(`Cache invalidated for preferences: ${preferences.join(', ')}`);
    }

    // Get cache statistics
    getCacheStats() {
        return {
            keys: this.cache.keys().length,
            hits: this.cache.getStats().hits,
            misses: this.cache.getStats().misses,
            keyspace: this.cache.keys()
        };
    }

    // Clear all cache
    async clearAllCache() {
        this.cache.flushAll();
        console.log('All cache cleared');
    }

    // Start periodic cache cleanup
    startPeriodicCleanup() {
        setInterval(() => {
            const stats = this.getCacheStats();
            console.log(`Cache cleanup - Active keys: ${stats.keys}`);
            
            // Optional: Implement more sophisticated cleanup logic here
            // For example, remove old entries or refresh popular ones
        }, CACHE_CHECK_PERIOD * 1000);
    }

    // Stop cache service
    stop() {
        this.cache.close();
        console.log('Cache service stopped');
    }
}

module.exports = NewsCacheService; 