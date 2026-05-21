/**
 * UI Module - Handles all user interface interactions
 */
const UI = {
    /**
     * Get API key from input field
     */
    getApiKey() {
        return document.getElementById('apiKey').value.trim();
    },

    /**
     * Set API key in input field
     */
    setApiKey(key) {
        document.getElementById('apiKey').value = key;
    },

    /**
     * Show error message
     */
    showError(message) {
        const alert = document.getElementById('errorAlert');
        document.getElementById('errorMessage').textContent = message;
        alert.classList.remove('hidden');
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        const alert = document.getElementById('successAlert');
        document.getElementById('successMessage').textContent = message;
        alert.classList.remove('hidden');
    },

    /**
     * Show loading state
     */
    showLoading(message) {
        const indicator = document.getElementById('loadingIndicator');
        document.getElementById('loadingText').textContent = message;
        indicator.classList.remove('hidden');
    },

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    },

    /**
     * Disable load button
     */
    disableLoadButton() {
        document.getElementById('loadBtn').disabled = true;
    },

    /**
     * Enable load button
     */
    enableLoadButton() {
        document.getElementById('loadBtn').disabled = false;
    },

    /**
     * Render purchase data in table
     */
    renderTable(purchases) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        purchases.forEach(purchase => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50 fade-in';
            
            // Calculate profit based on market price vs cost each
            const marketPrice = purchase.marketPrice || purchase.costEach;
            const profit = (marketPrice - purchase.costEach) * purchase.quantity;
            const profitPercent = purchase.costEach > 0 ? (((marketPrice - purchase.costEach) / purchase.costEach) * 100).toFixed(2) : 0;
            const profitClass = profit >= 0 ? 'text-green-600' : 'text-red-600';

            const purchaseDate = new Date(purchase.date);
            const dateStr = purchaseDate.toLocaleTimeString();

            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-900">${purchase.itemName || `Item #${purchase.itemId}`}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${purchase.location || 'Unknown'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-900">$${purchase.totalCost.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-900">$${purchase.costEach.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-right font-semibold ${profitClass}">$${profit.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-right ${profitClass}">${profitPercent}%</td>
                <td class="px-6 py-4 text-sm text-gray-600">${dateStr}</td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('tableSection').classList.remove('hidden');
        document.getElementById('emptyState').classList.add('hidden');
    },

    /**
     * Update summary statistics
     */
    updateSummary(purchases) {
        const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);
        const totalProfit = purchases.reduce((sum, p) => {
            const marketPrice = p.marketPrice || p.costEach;
            return sum + ((marketPrice - p.costEach) * p.quantity);
        }, 0);
        const avgProfit = purchases.length > 0 ? totalProfit / purchases.length : 0;

        document.getElementById('totalProfit').textContent = `$${totalProfit.toLocaleString()}`;
        document.getElementById('avgProfit').textContent = `$${Math.round(avgProfit).toLocaleString()}`;
        document.getElementById('itemCount').textContent = purchases.length;

        document.getElementById('summarySection').classList.remove('hidden');
    },

    /**
     * Clear all UI elements
     */
    clearAll() {
        document.getElementById('tableBody').innerHTML = '';
        document.getElementById('tableSection').classList.add('hidden');
        document.getElementById('summarySection').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('apiKey').value = '';
    }
};
