/**
 * Farmer Profit Calculator Dashboard JavaScript
 * Handles all interactions, calculations, charts, and scenario comparisons
 */

class ProfitCalculator {
    constructor() {
        this.currentLocation = null;
        this.weatherData = null;
        this.profitChart = null;
        this.costChart = null;
        this.isCalculating = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAdvancedOptions();
        this.loadDefaultData();
        this.initializeTooltips();
    }

    bindEvents() {
        // Form submission
        document.getElementById('profitCalculatorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateProfit();
        });

        // Advanced options toggle
        document.getElementById('advancedToggle').addEventListener('click', () => {
            this.toggleAdvancedOptions();
        });

        // Location search
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchLocation();
        });

        // Location search on Enter
        document.getElementById('locationSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });

        // Crop selection change
        document.getElementById('cropSelect').addEventListener('change', () => {
            this.onCropChange();
        });

        // Real-time form validation
        this.bindFormValidation();

        // Auto-calculate on significant changes
        this.bindAutoCalculate();
    }

    bindFormValidation() {
        const farmSizeInput = document.getElementById('farmSize');
        farmSizeInput.addEventListener('input', () => {
            this.validateFarmSize();
        });

        const priceAdjustment = document.getElementById('marketPriceAdjustment');
        priceAdjustment.addEventListener('input', () => {
            this.validatePriceAdjustment();
        });
    }

    bindAutoCalculate() {
        // Auto-calculate when farm size changes (with debounce)
        let farmSizeTimeout;
        document.getElementById('farmSize').addEventListener('input', () => {
            clearTimeout(farmSizeTimeout);
            farmSizeTimeout = setTimeout(() => {
                if (this.isFormValid()) {
                    this.calculateProfit();
                }
            }, 1000);
        });

        // Auto-calculate when market price adjustment changes
        let priceTimeout;
        document.getElementById('marketPriceAdjustment').addEventListener('input', () => {
            clearTimeout(priceTimeout);
            priceTimeout = setTimeout(() => {
                if (this.isFormValid()) {
                    this.calculateProfit();
                }
            }, 800);
        });
    }

    initializeAdvancedOptions() {
        // Show advanced options by default
        document.getElementById('advancedOptions').style.display = 'block';
    }

    initializeTooltips() {
        // Add helpful tooltips to form elements
        this.addTooltip('farmSize', 'Enter the total area of your farm in hectares (1 hectare = 10,000 sq meters)');
        this.addTooltip('marketPriceAdjustment', 'Adjust expected market prices up or down based on your local market knowledge');
        this.addTooltip('managementLevel', 'Your farming expertise level affects yield potential');
    }

    addTooltip(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.title = text;
        }
    }

    toggleAdvancedOptions() {
        const content = document.getElementById('advancedContent');
        const toggle = document.getElementById('advancedToggle');
        const isOpen = content.style.display === 'block';

        content.style.display = isOpen ? 'none' : 'block';
        toggle.classList.toggle('open', !isOpen);
    }

    async loadDefaultData() {
        // Load default weather data
        this.weatherData = {
            temperature: 25,
            humidity: 65,
            rainfall: 100
        };

        // Try to load current weather if available
        try {
            const response = await fetch('/api/weather/comprehensive?city=Delhi');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    this.weatherData = {
                        temperature: data.data.temperature || 25,
                        humidity: data.data.humidity || 65,
                        rainfall: data.data.rainfall || 100
                    };
                }
            }
        } catch (error) {
            console.log('Using default weather data');
        }
    }

    async searchLocation() {
        const query = document.getElementById('locationSearch').value.trim();
        if (!query) return;

        const searchBtn = document.getElementById('searchBtn');
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;

        try {
            // Use the existing location search functionality
            const response = await fetch(`/api/weather/comprehensive?city=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    this.currentLocation = query;
                    this.weatherData = {
                        temperature: data.data.temperature || 25,
                        humidity: data.data.humidity || 65,
                        rainfall: data.data.rainfall || 100
                    };
                    
                    this.showSuccess(`Location set to ${query}. Weather data updated.`);
                    
                    // Auto-calculate if form is valid
                    if (this.isFormValid()) {
                        setTimeout(() => this.calculateProfit(), 500);
                    }
                } else {
                    this.showError('Location not found. Using default weather data.');
                }
            }
        } catch (error) {
            console.error('Location search error:', error);
            this.showError('Failed to search location. Using default weather data.');
        } finally {
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;
        }
    }

    onCropChange() {
        const cropSelect = document.getElementById('cropSelect');
        const selectedCrop = cropSelect.value;
        
        if (selectedCrop && this.isFormValid()) {
            // Auto-calculate when crop changes
            setTimeout(() => this.calculateProfit(), 300);
        }
    }

    isFormValid() {
        const cropId = document.getElementById('cropSelect').value;
        const farmSize = parseFloat(document.getElementById('farmSize').value);
        
        return cropId && farmSize && farmSize > 0;
    }

    validateFarmSize() {
        const farmSizeInput = document.getElementById('farmSize');
        const value = parseFloat(farmSizeInput.value);
        
        if (value <= 0 || value > 1000) {
            farmSizeInput.style.borderColor = '#dc3545';
            return false;
        } else {
            farmSizeInput.style.borderColor = '#28a745';
            return true;
        }
    }

    validatePriceAdjustment() {
        const priceInput = document.getElementById('marketPriceAdjustment');
        const value = parseFloat(priceInput.value);
        
        if (value < -50 || value > 50) {
            priceInput.style.borderColor = '#dc3545';
            return false;
        } else {
            priceInput.style.borderColor = '#e0e0e0';
            return true;
        }
    }

    async calculateProfit() {
        if (this.isCalculating) return;
        
        const formData = this.getFormData();
        if (!this.validateForm(formData)) return;

        this.isCalculating = true;
        this.showLoading(true);

        try {
            const response = await fetch('/api/profit/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cropId: formData.cropId,
                    location: this.currentLocation || 'Default Location',
                    farmSize: formData.farmSize,
                    inputSelections: formData.inputSelections,
                    marketPriceAdjustment: formData.marketPriceAdjustment / 100,
                    weatherData: this.weatherData
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result.data);
                this.showSuccess('Profit prediction calculated successfully!');
            } else {
                this.showError(result.error || 'Calculation failed');
            }
        } catch (error) {
            console.error('Profit calculation error:', error);
            this.showError('Failed to calculate profit. Please check your connection and try again.');
        } finally {
            this.showLoading(false);
            this.isCalculating = false;
        }
    }

    getFormData() {
        return {
            cropId: document.getElementById('cropSelect').value,
            farmSize: parseFloat(document.getElementById('farmSize').value),
            inputSelections: {
                organicFertilizer: document.getElementById('organicFertilizer').checked,
                micronutrients: document.getElementById('micronutrients').checked,
                advancedPestControl: document.getElementById('advancedPestControl').checked,
                biologicalPestControl: document.getElementById('biologicalPestControl').checked,
                irrigationType: document.getElementById('irrigationType').value,
                managementLevel: parseFloat(document.getElementById('managementLevel').value)
            },
            marketPriceAdjustment: parseFloat(document.getElementById('marketPriceAdjustment').value)
        };
    }

    validateForm(formData) {
        if (!formData.cropId) {
            this.showError('Please select a crop');
            return false;
        }
        if (!formData.farmSize || formData.farmSize <= 0 || formData.farmSize > 1000) {
            this.showError('Please enter a valid farm size (0.1 - 1000 hectares)');
            return false;
        }
        return true;
    }

    displayResults(data) {
        this.updateSummaryCards(data);
        this.updateCharts(data);
        this.updateScenarios(data.prediction.scenarios);
        this.updateRecommendations(data.recommendations);
        this.scrollToResults();
    }

    updateSummaryCards(data) {
        const profit = data.prediction.profit;
        
        document.getElementById('totalRevenue').textContent = `₹${this.formatNumber(profit.grossRevenue)}`;
        document.getElementById('totalCosts').textContent = `₹${this.formatNumber(profit.totalCosts)}`;
        document.getElementById('netProfit').textContent = `₹${this.formatNumber(profit.netProfit)}`;
        document.getElementById('roi').textContent = `${profit.returnOnInvestment.toFixed(1)}%`;

        // Add color coding based on profitability
        const roiElement = document.getElementById('roi');
        const roiCard = roiElement.closest('.summary-card');
        
        if (profit.returnOnInvestment > 50) {
            roiCard.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        } else if (profit.returnOnInvestment > 20) {
            roiCard.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
        } else if (profit.returnOnInvestment > 0) {
            roiCard.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        } else {
            roiCard.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        }
    }

    updateCharts(data) {
        this.createProfitChart(data);
        this.createCostChart(data);
    }

    createProfitChart(data) {
        const ctx = document.getElementById('profitChart').getContext('2d');
        
        if (this.profitChart) {
            this.profitChart.destroy();
        }

        const scenarios = data.prediction.scenarios;
        const labels = scenarios.map(s => s.name);
        const profits = scenarios.map(s => s.profit.netProfit);
        const revenues = scenarios.map(s => s.profit.grossRevenue);
        const costs = scenarios.map(s => s.profit.totalCosts);

        this.profitChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenues,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Costs',
                        data: costs,
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Net Profit',
                        data: profits,
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Profit Analysis Across Scenarios'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createCostChart(data) {
        const ctx = document.getElementById('costChart').getContext('2d');
        
        if (this.costChart) {
            this.costChart.destroy();
        }

        const costs = data.prediction.costs.breakdown;
        const labels = Object.keys(costs).map(key => this.formatCostLabel(key));
        const values = Object.values(costs);

        this.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#C9CBCF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment Cost Breakdown'
                    },
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    formatCostLabel(key) {
        const labelMap = {
            seeds: 'Seeds',
            fertilizers: 'Fertilizers',
            pesticides: 'Pesticides',
            irrigation: 'Irrigation',
            labor: 'Labor',
            machinery: 'Machinery',
            other: 'Other Costs'
        };
        return labelMap[key] || key;
    }

    updateScenarios(scenarios) {
        const container = document.getElementById('scenarioComparison');
        container.innerHTML = '';

        scenarios.forEach(scenario => {
            const scenarioCard = this.createScenarioCard(scenario);
            container.appendChild(scenarioCard);
        });
    }

    createScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = `scenario-card ${scenario.name.toLowerCase()}`;
        
        card.innerHTML = `
            <div class="scenario-header">
                <h3 class="scenario-name">${scenario.name}</h3>
                <span class="scenario-probability">${scenario.probability}% chance</span>
            </div>
            <div class="scenario-description">${scenario.description}</div>
            <div class="scenario-metrics">
                <div class="scenario-metric">
                    <div class="metric-value">₹${this.formatNumber(scenario.profit.netProfit)}</div>
                    <div class="metric-label">Net Profit</div>
                </div>
                <div class="scenario-metric">
                    <div class="metric-value">${scenario.profit.returnOnInvestment.toFixed(1)}%</div>
                    <div class="metric-label">ROI</div>
                </div>
                <div class="scenario-metric">
                    <div class="metric-value">${(scenario.yield.totalYield / 1000).toFixed(1)}t</div>
                    <div class="metric-label">Yield</div>
                </div>
            </div>
        `;

        return card;
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        container.innerHTML = '';

        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = `
                <div class="recommendation-item info">
                    <div class="recommendation-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>No specific recommendations</h4>
                        <p>Your farming plan looks balanced. Continue monitoring market conditions.</p>
                    </div>
                </div>
            `;
            return;
        }

        recommendations.forEach(rec => {
            const recElement = this.createRecommendationElement(rec);
            container.appendChild(recElement);
        });
    }

    createRecommendationElement(recommendation) {
        const element = document.createElement('div');
        element.className = `recommendation-item ${recommendation.type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };

        element.innerHTML = `
            <div class="recommendation-icon">
                <i class="${iconMap[recommendation.type] || 'fas fa-info-circle'}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${recommendation.title}</h4>
                <p>${recommendation.message}</p>
            </div>
        `;

        return element;
    }

    scrollToResults() {
        const resultsPanel = document.querySelector('.results-panel');
        if (resultsPanel) {
            resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    formatNumber(num) {
        if (num >= 100000) {
            return (num / 100000).toFixed(1) + 'L'; // Lakhs
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'; // Thousands
        }
        return num.toLocaleString();
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        const button = document.getElementById('calculateBtn');
        
        if (show) {
            overlay.style.display = 'flex';
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        } else {
            overlay.style.display = 'none';
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-calculator"></i> Calculate Profit Prediction';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'times-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${message}
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 10px;
            border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1rem;
            margin-left: auto;
            padding: 2px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Additional utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

function formatWeight(kg) {
    if (kg >= 1000) {
        return `${(kg / 1000).toFixed(1)} tonnes`;
    }
    return `${kg.toFixed(0)} kg`;
}

// CSS for notifications
const notificationCSS = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Add notification styles to document
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = notificationCSS;
    document.head.appendChild(style);
}

// Initialize the profit calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.profitCalculator = new ProfitCalculator();
    console.log('🌾 Farmer Profit Calculator initialized successfully!');
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfitCalculator;
}