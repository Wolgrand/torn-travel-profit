/**
 * Configuration constants for the application
 */
const CONFIG = {
    TORN_API_BASE: 'https://api.torn.com',
    MARKET_API_ENDPOINT: '/market/bazaar?selections=itemids',
    EVENTS_ENDPOINT: '/user/?selections=events',
    PRICE_CACHE_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds
    STORAGE_KEYS: {
        API_KEY: 'torn_api_key',
        PURCHASE_HISTORY: 'purchase_history',
        PRICE_CACHE: 'price_cache',
    },
};

Object.freeze(CONFIG);
