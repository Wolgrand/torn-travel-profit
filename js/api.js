/**
 * API module for fetching data from Torn City APIs
 */
const API = {
    /**
     * Fetch events from Torn API
     * @param {string} apiKey - The user's Torn API key
     * @returns {Promise<Object>} Events data from the API
     */
    async fetchEvents(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        try {
            const url = `${CONFIG.TORN_API_BASE}${CONFIG.EVENTS_ENDPOINT}&key=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    throw new Error(`API Error: ${errorData.error.error}`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    /**
     * Fetch market prices for specific items
     * @param {Array<number>} itemIds - Array of item IDs to fetch prices for
     * @returns {Promise<Object>} Market price data
     */
    async fetchMarketPrices(itemIds) {
        if (!itemIds || itemIds.length === 0) {
            return {};
        }

        try {
            const url = `${CONFIG.TORN_API_BASE}${CONFIG.MARKET_API_ENDPOINT}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Filter to only requested items
            const filtered = {};
            itemIds.forEach(id => {
                if (data[id]) {
                    filtered[id] = data[id];
                }
            });

            return filtered;
        } catch (error) {
            console.error('Error fetching market prices:', error);
            throw error;
        }
    },
};
