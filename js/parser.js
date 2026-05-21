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
            const description = log.description || '';
            const timestamp = log.timestamp || Date.now() / 1000;

            // Check if this is a travel purchase event
            if (this._isTravelPurchase(description)) {
                const purchase = this._parsePurchaseLog(description, timestamp);
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
     * Looks for patterns like "You bought X for $Y abroad" or "You bought X in [Country]"
     * @param {string} description - Log description text
     * @returns {boolean}
     */
    _isTravelPurchase(description) {
        const lower = description.toLowerCase();
        
        // Patterns for travel purchases
        return (lower.includes('bought') && lower.includes('abroad')) ||
               (lower.includes('bought') && lower.includes('in') && this._hasCountry(description)) ||
               (lower.includes('purchased') && lower.includes('abroad'));
    },

    /**
     * Check if description contains a country name
     * @param {string} description - Log description
     * @returns {boolean}
     */
    _hasCountry(description) {
        const countries = [
            'mexico', 'japan', 'canada', 'china', 'united kingdom', 
            'switzerland', 'australia', 'argentina', 'south africa', 
            'brazil', 'dubai', 'uk', 'us', 'usa'
        ];
        const lower = description.toLowerCase();
        return countries.some(country => lower.includes(country));
    },

    /**
     * Parse a purchase log to extract item name and cost
     * Handles Torn log format: "You bought X for $Y abroad" or similar
     * @param {string} description - Log description text
     * @param {number} timestamp - Log timestamp
     * @returns {Object|null} Purchase object or null if parsing fails
     */
    _parsePurchaseLog(description, timestamp) {
        try {
            // Extract item name and quantity
            // Patterns: "bought 10 x Item Name" or "bought Item Name"
            let itemMatch = description.match(/bought\s+(?:(\d+)\s+x\s+)?(.+?)\s+(?:for|in|abroad)/i);
            if (!itemMatch) {
                return null;
            }

            const quantity = itemMatch[1] ? parseInt(itemMatch[1]) : 1;
            const itemName = itemMatch[2].trim();

            // Extract cost
            // Patterns: "for $1,234" or "for 1234"
            const costMatch = description.match(/for\s+\$?([\d,]+)/i);
            if (!costMatch) {
                return null;
            }

            const totalCost = parseInt(costMatch[1].replace(/,/g, ''));
            const costPerItem = Math.round(totalCost / quantity);

            if (isNaN(totalCost)) {
                return null;
            }

            // Extract location
            let location = 'Unknown';
            const locationMatch = description.match(/(?:abroad\s+in|in)\s+([A-Za-z\s]+?)(?:\s+for|\.|\s*$)/i);
            if (locationMatch) {
                location = locationMatch[1].trim();
            }

            return {
                itemName,
                quantity,
                cost: costPerItem,
                totalCost,
                location,
                timestamp,
                date: new Date(timestamp * 1000),
                itemId: null, // Would need additional API call to get item ID
                rawLog: description,
            };
        } catch (error) {
            console.error('Error parsing purchase log:', error, description);
            return null;
        }
    },

    /**
     * Get today's purchases only
     * @param {Array} purchases - All purchases
     * @returns {Array} Today's purchases
     */
    getTodayPurchases(purchases) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayPurchases = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            purchaseDate.setHours(0, 0, 0, 0);
            return purchaseDate.getTime() === today.getTime();
        });

        console.log(`Found ${todayPurchases.length} purchases for today`);
        return todayPurchases;
    },
};
