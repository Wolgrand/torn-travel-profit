/**
 * Cache module for managing price cache with expiration
 */
const PriceCache = {
    /**
     * Get cached price data
     * @returns {Object} Cached price data
     */
    getCache() {
        try {
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PRICE_CACHE);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.error('Error retrieving price cache:', error);
            return {};
        }
    },

    /**
     * Save prices to cache with timestamp
     * @param {Object} prices - Price data to cache
     */
    saveCache(prices) {
        try {
            const cacheData = {
                prices,
                timestamp: Date.now(),
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.PRICE_CACHE, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving price cache:', error);
        }
    },

    /**
     * Check if cache is still valid
     * @returns {boolean} True if cache is valid and not expired
     */
    isCacheValid() {
        try {
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PRICE_CACHE);
            if (!cached) {
                return false;
            }

            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;

            return age < CONFIG.PRICE_CACHE_DURATION;
        } catch (error) {
            console.error('Error checking cache validity:', error);
            return false;
        }
    },

    /**
     * Get prices for specific items, using cache if valid
     * @param {Array<number>} itemIds - Item IDs to fetch prices for
     * @returns {Promise<Object>} Price data
     */
    async getPrices(itemIds) {
        // Check cache first
        if (this.isCacheValid()) {
            const cacheData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PRICE_CACHE));
            const cachedPrices = cacheData.prices;

            // Check if all requested items are in cache
            const allCached = itemIds.every(id => cachedPrices[id]);
            if (allCached) {
                console.log('Using cached prices');
                return cachedPrices;
            }
        }

        // Fetch fresh prices if cache invalid or missing items
        try {
            console.log('Fetching fresh prices from API');
            const prices = await API.fetchMarketPrices(itemIds);
            this.saveCache(prices);
            return prices;
        } catch (error) {
            console.error('Error fetching prices:', error);
            // Return cached prices even if expired, as fallback
            const cacheData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PRICE_CACHE) || '{}');
            return cacheData.prices || {};
        }
    },

    /**
     * Clear the price cache
     */
    clearCache() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PRICE_CACHE);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },
};
