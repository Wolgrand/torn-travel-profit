/**
 * Storage module for managing localStorage operations
 */
const Storage = {
    /**
     * Save API key to localStorage
     * @param {string} apiKey - The Torn API key
     */
    saveApiKey(apiKey) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            return false;
        }
    },

    /**
     * Retrieve API key from localStorage
     * @returns {string|null} The stored API key or null
     */
    getApiKey() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        } catch (error) {
            console.error('Error retrieving API key:', error);
            return null;
        }
    },

    /**
     * Save purchase history to localStorage
     * @param {Array} purchases - Array of purchase objects
     */
    savePurchaseHistory(purchases) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(purchases));
            return true;
        } catch (error) {
            console.error('Error saving purchase history:', error);
            return false;
        }
    },

    /**
     * Retrieve purchase history from localStorage
     * @returns {Array} Array of purchase objects
     */
    getPurchaseHistory() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEYS.PURCHASE_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error retrieving purchase history:', error);
            return [];
        }
    },

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PURCHASE_HISTORY);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PRICE_CACHE);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },
};
