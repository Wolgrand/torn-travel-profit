/**
 * Main application logic
 */
class TravelProfitApp {
    constructor() {
        this.purchases = [];
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.attachEventListeners();
        this.loadFromStorage();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        document.getElementById('loadBtn').addEventListener('click', () => this.loadEvents());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('apiKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadEvents();
            }
        });
    }

    /**
     * Load events and process them
     */
    async loadEvents() {
        const apiKey = UI.getApiKey();

        if (!apiKey) {
            UI.showError('Please enter your Torn API key');
            return;
        }

        UI.disableLoadButton();
        UI.showLoading('Fetching events from Torn API...');

        try {
            // Save API key to storage
            Storage.saveApiKey(apiKey);

            // Fetch events from API
            const eventData = await API.fetchEvents(apiKey);

            if (!eventData.events) {
                UI.showError('No events found. Make sure your API key is correct.');
                UI.enableLoadButton();
                UI.hideLoading();
                return;
            }

            UI.showLoading('Parsing purchase events...');

            // Parse events to extract purchases
            const allPurchases = Parser.extractPurchases(eventData.events);

            if (allPurchases.length === 0) {
                UI.showError('No travel purchases found in your events.');
                UI.enableLoadButton();
                UI.hideLoading();
                return;
            }

            // Get today's purchases
            const todayPurchases = Parser.getTodayPurchases(allPurchases);

            if (todayPurchases.length === 0) {
                UI.showError('No travel purchases found for today.');
                UI.enableLoadButton();
                UI.hideLoading();
                return;
            }

            UI.showLoading('Fetching market prices...');

            // Extract unique item IDs
            const itemIds = [...new Set(todayPurchases.map(p => p.itemId).filter(Boolean))];

            // Get market prices (with caching)
            let prices = {};
            if (itemIds.length > 0) {
                prices = await PriceCache.getPrices(itemIds);
            }

            // Attach market prices to purchases
            const enrichedPurchases = todayPurchases.map(purchase => ({
                ...purchase,
                marketPrice: prices[purchase.itemId] ? prices[purchase.itemId].cost : purchase.cost,
            }));

            // Save to storage
            this.purchases = enrichedPurchases;
            Storage.savePurchaseHistory(this.purchases);

            // Update UI
            UI.renderTable(enrichedPurchases);
            UI.updateSummary(enrichedPurchases);
            UI.showSuccess(`Loaded ${enrichedPurchases.length} purchase(s) for today`);

            UI.enableLoadButton();
            UI.hideLoading();
        } catch (error) {
            UI.showError(`Error: ${error.message || 'An unexpected error occurred'}`);
            UI.enableLoadButton();
            UI.hideLoading();
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        const savedApiKey = Storage.getApiKey();
        if (savedApiKey) {
            UI.setApiKey(savedApiKey);
        }

        const savedPurchases = Storage.getPurchaseHistory();
        if (savedPurchases && savedPurchases.length > 0) {
            this.purchases = savedPurchases;
            UI.renderTable(savedPurchases);
            UI.updateSummary(savedPurchases);
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }

        Storage.clearAll();
        this.purchases = [];
        UI.clearAll();
        UI.showSuccess('All data cleared');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TravelProfitApp();
});
