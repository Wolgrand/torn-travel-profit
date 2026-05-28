/**
 * Parser module for processing Torn logs and extracting purchase information
 */
const Parser = {
    /**
     * Extract travel purchases from logs
     * @param {Object} logs - Logs object from Torn API
     * @returns {Array} Array of purchase objects
     */
    extractPurchases(logs) {
        const purchases = [];

        if (!logs || typeof logs !== 'object') {
            console.log('No logs data available');
            return purchases;
        }

        Object.values(logs).forEach(log => {
            // Check if this is a travel purchase log
            if (this._isTravelPurchaseLog(log)) {
                const purchase = this._parseTravelLog(log);
                if (purchase) {
                    purchases.push(purchase);
                }
            }
        });

        console.log(`Extracted ${purchases.length} travel purchases from logs`);
        return purchases;
    },

    /**
     * Check if log is a travel purchase
     * @param {Object} log - Log object from Torn API
     * @returns {boolean}
     */
    _isTravelPurchaseLog(log) {
        if (!log) return false;
        
        // Check if category is 'Travel'
        const isTravel = log.category === 'Travel';
        
        // Check if title contains "abroad buy" or similar
        const title = log.title || '';
        const isBuyAbroad = title.toLowerCase().includes('abroad') && title.toLowerCase().includes('buy');
        
        return isTravel || isBuyAbroad;
    },

    /**
     * Parse a travel purchase log
     * Torn API format: {log, title, timestamp, category, data, params}
     * @param {Object} log - Log object
     * @returns {Object|null} Purchase object or null if parsing fails
     */
    _parseTravelLog(log) {
        try {
            // Extract data from the log object
            const data = log.data || {};
            const timestamp = log.timestamp || Date.now() / 1000;
            const title = log.title || 'Item purchase abroad';

            // Get item ID
            const itemId = data.item;
            if (!itemId) {
                console.warn('No item ID in log:', log);
                return null;
            }

            // Get quantity and costs
            const quantity = data.quantity || 1;
            const costEach = data.cost_each || 0;
            const costTotal = data.cost_total || (costEach * quantity);

            if (costTotal === 0) {
                return null;
            }

            // Get area (location ID)
            const areaId = data.area;
            const location = this._getLocationName(areaId) || 'Unknown Location';

            // Get item name from title or keep as item ID
            const itemName = this._extractItemNameFromTitle(title, itemId);

            return {
                itemId,
                itemName,
                quantity,
                cost: costEach,
                totalCost: costTotal,
                location,
                areaId,
                timestamp,
                date: new Date(timestamp * 1000),
                title,
                rawLog: log,
            };
        } catch (error) {
            console.error('Error parsing travel log:', error, log);
            return null;
        }
    },

    /**
     * Get location name from area ID
     * @param {number} areaId - Area ID from Torn API
     * @returns {string} Location name
     */
    _getLocationName(areaId) {
        const areas = {
            1: 'Mexico',
            2: 'Japan',
            3: 'Canada',
            4: 'China',
            5: 'United Kingdom',
            6: 'Switzerland',
            7: 'Australia',
            8: 'Argentina',
            9: 'South Africa',
            10: 'Brazil',
            11: 'Croatia',
            12: 'Dubai',
            13: 'Hawaii',
            14: 'Netherlands',
            15: 'Egypt',
        };
        return areas[areaId] || `Area ${areaId}`;
    },

    /**
     * Extract item name from title
     * @param {string} title - Log title
     * @param {number} itemId - Item ID as fallback
     * @returns {string} Item name
     */
    _extractItemNameFromTitle(title, itemId) {
        // Try to extract item name from title
        // Pattern: "Item abroad buy" or similar
        const match = title.match(/Item\s+abroad\s+buy/i);
        if (match) {
            return `Item #${itemId}`;
        }
        return `Item #${itemId}`;
    },

    /**
     * Get purchases within the last N days (inclusive of today)
     * @param {Array} purchases - All purchases
     * @param {number} days - Number of days to include (default 30)
     * @returns {Array} Purchases within the range
     */
    getPurchasesLastDays(purchases, days = 30) {
        if (!Array.isArray(purchases) || purchases.length === 0) return [];

        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - (days - 1));

        const filtered = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= start && purchaseDate <= end;
        });

        console.log(`Found ${filtered.length} purchases in the last ${days} day(s)`);
        return filtered;
    },

    /**
     * Backwards-compatible: Get today's purchases only
     * @param {Array} purchases - All purchases
     * @returns {Array} Today's purchases
     */
    getTodayPurchases(purchases) {
        return this.getPurchasesLastDays(purchases, 1);
    },
};
