/**
 * Parser module for processing Torn events and extracting purchase information
 */
const Parser = {
    /**
     * Extract travel purchases from events
     * Looks for events containing 'bought' and 'abroad'
     * @param {Object} events - Events object from Torn API
     * @returns {Array} Array of purchase objects
     */
    extractPurchases(events) {
        const purchases = [];

        if (!events || typeof events !== 'object') {
            return purchases;
        }

        Object.values(events).forEach(event => {
            const log = event.log || '';
            const timestamp = event.timestamp || Date.now() / 1000;

            // Check if event contains purchase keywords
            if (this._isBoughtEvent(log) && this._isAbroadEvent(log)) {
                const purchase = this._parsePurchaseEvent(log, timestamp);
                if (purchase) {
                    purchases.push(purchase);
                }
            }
        });

        return purchases;
    },

    /**
     * Check if event is a purchase event (contains 'bought')
     * @param {string} log - Event log text
     * @returns {boolean}
     */
    _isBoughtEvent(log) {
        return log.toLowerCase().includes('bought');
    },

    /**
     * Check if event is from abroad (contains 'abroad')
     * @param {string} log - Event log text
     * @returns {boolean}
     */
    _isAbroadEvent(log) {
        return log.toLowerCase().includes('abroad');
    },

    /**
     * Parse a purchase event to extract item name and cost
     * Expected format: "Bought X items at price Y abroad in Country Z"
     * @param {string} log - Event log text
     * @param {number} timestamp - Event timestamp
     * @returns {Object|null} Purchase object or null if parsing fails
     */
    _parsePurchaseEvent(log, timestamp) {
        try {
            // Extract item name (text between "Bought" and first number or "for")
            const itemMatch = log.match(/bought\s+(.+?)\s+(?:for|at)/i);
            if (!itemMatch) {
                return null;
            }

            const itemName = itemMatch[1].trim();

            // Extract cost (look for currency values like $1,234 or just numbers)
            const costMatch = log.match(/[$.]\s*([0-9,]+)/);
            if (!costMatch) {
                return null;
            }

            const cost = parseInt(costMatch[1].replace(/,/g, ''));

            // Extract location (text after "abroad in" or similar)
            const locationMatch = log.match(/abroad\s+in\s+(.+?)(?:\s+for|\.|$)/i);
            const location = locationMatch ? locationMatch[1].trim() : 'Unknown';

            // Extract item ID if available (for market price lookup)
            const itemId = this._extractItemId(log);

            return {
                itemName,
                cost,
                location,
                timestamp,
                date: new Date(timestamp * 1000),
                itemId,
                rawLog: log,
            };
        } catch (error) {
            console.error('Error parsing purchase event:', error, log);
            return null;
        }
    },

    /**
     * Extract item ID from event log if available
     * @param {string} log - Event log text
     * @returns {number|null} Item ID or null
     */
    _extractItemId(log) {
        // Try to find item ID in brackets or from item name lookup
        const idMatch = log.match(/\[(\d+)\]/);
        return idMatch ? parseInt(idMatch[1]) : null;
    },

    /**
     * Get today's purchases only
     * @param {Array} purchases - All purchases
     * @returns {Array} Today's purchases
     */
    getTodayPurchases(purchases) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            purchaseDate.setHours(0, 0, 0, 0);
            return purchaseDate.getTime() === today.getTime();
        });
    },
};
