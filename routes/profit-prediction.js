/**
 * Farmer Profit Prediction API Routes
 * Handles yield prediction, market analysis, and profit calculations
 */

const express = require('express');
const router = express.Router();

class ProfitPredictionService {
    constructor() {
        this.cropDatabase = this.initializeCropDatabase();
        this.marketPrices = this.initializeMarketPrices();
        this.inputCosts = this.initializeInputCosts();
        this.yieldModels = this.initializeYieldModels();
    }

    initializeCropDatabase() {
        return {
            rice: {
                name: 'Rice (धान)',
                baseYield: 4000, // kg per hectare
                optimalConditions: {
                    temperature: { min: 20, max: 35, optimal: 27 },
                    humidity: { min: 70, max: 95, optimal: 85 },
                    rainfall: { min: 100, max: 300, optimal: 200 }
                },
                growthDays: 120,
                category: 'cereal',
                icon: '🌾'
            },
            wheat: {
                name: 'Wheat (गेहूं)',
                baseYield: 3500,
                optimalConditions: {
                    temperature: { min: 10, max: 25, optimal: 18 },
                    humidity: { min: 50, max: 70, optimal: 60 },
                    rainfall: { min: 30, max: 100, optimal: 60 }
                },
                growthDays: 110,
                category: 'cereal',
                icon: '🌾'
            },
            cotton: {
                name: 'Cotton (कपास)',
                baseYield: 500,
                optimalConditions: {
                    temperature: { min: 21, max: 30, optimal: 25 },
                    humidity: { min: 55, max: 80, optimal: 70 },
                    rainfall: { min: 50, max: 150, optimal: 100 }
                },
                growthDays: 180,
                category: 'fiber',
                icon: '🌿'
            },
            sugarcane: {
                name: 'Sugarcane (गन्ना)',
                baseYield: 80000,
                optimalConditions: {
                    temperature: { min: 20, max: 35, optimal: 28 },
                    humidity: { min: 75, max: 95, optimal: 85 },
                    rainfall: { min: 150, max: 400, optimal: 250 }
                },
                growthDays: 365,
                category: 'cash_crop',
                icon: '🎋'
            },
            tomato: {
                name: 'Tomato (टमाटर)',
                baseYield: 25000,
                optimalConditions: {
                    temperature: { min: 18, max: 27, optimal: 22 },
                    humidity: { min: 60, max: 85, optimal: 70 },
                    rainfall: { min: 40, max: 120, optimal: 80 }
                },
                growthDays: 90,
                category: 'vegetable',
                icon: '🍅'
            },
            onion: {
                name: 'Onion (प्याज)',
                baseYield: 20000,
                optimalConditions: {
                    temperature: { min: 15, max: 25, optimal: 20 },
                    humidity: { min: 55, max: 75, optimal: 65 },
                    rainfall: { min: 25, max: 80, optimal: 50 }
                },
                growthDays: 120,
                category: 'vegetable',
                icon: '🧅'
            },
            maize: {
                name: 'Maize (मक्का)',
                baseYield: 6000,
                optimalConditions: {
                    temperature: { min: 21, max: 30, optimal: 25 },
                    humidity: { min: 60, max: 80, optimal: 70 },
                    rainfall: { min: 60, max: 150, optimal: 100 }
                },
                growthDays: 100,
                category: 'cereal',
                icon: '🌽'
            },
            soybean: {
                name: 'Soybean (सोयाबीन)',
                baseYield: 2500,
                optimalConditions: {
                    temperature: { min: 20, max: 30, optimal: 25 },
                    humidity: { min: 65, max: 85, optimal: 75 },
                    rainfall: { min: 80, max: 200, optimal: 140 }
                },
                growthDays: 95,
                category: 'legume',
                icon: '🫘'
            }
        };
    }

    initializeMarketPrices() {
        // Prices per kg in INR
        return {
            rice: { current: 25, trend: 0.05, volatility: 0.15 },
            wheat: { current: 22, trend: 0.03, volatility: 0.12 },
            cotton: { current: 65, trend: 0.08, volatility: 0.25 },
            sugarcane: { current: 3.5, trend: 0.02, volatility: 0.08 },
            tomato: { current: 35, trend: 0.12, volatility: 0.40 },
            onion: { current: 28, trend: 0.10, volatility: 0.35 },
            maize: { current: 20, trend: 0.04, volatility: 0.18 },
            soybean: { current: 45, trend: 0.06, volatility: 0.20 }
        };
    }

    initializeInputCosts() {
        // Costs per hectare in INR
        return {
            seeds: {
                rice: 3000, wheat: 2500, cotton: 4000, sugarcane: 8000,
                tomato: 15000, onion: 12000, maize: 3500, soybean: 4500
            },
            fertilizers: {
                base: 8000, // Base fertilizer cost per hectare
                organic: 5000, // Additional organic fertilizer
                micronutrients: 2000
            },
            pesticides: {
                base: 4000, // Base pesticide cost
                advanced: 6000, // Advanced pest management
                biological: 3000
            },
            irrigation: {
                drip: 15000, // Drip irrigation setup cost (amortized)
                sprinkler: 8000,
                flood: 3000
            },
            labor: {
                preparation: 5000,
                sowing: 3000,
                maintenance: 8000,
                harvesting: 6000
            },
            machinery: {
                rent: 8000, // Machinery rental per hectare
                fuel: 4000
            },
            other: {
                transport: 2000,
                storage: 1500,
                certification: 1000
            }
        };
    }

    initializeYieldModels() {
        return {
            // Yield prediction models based on weather conditions
            temperature: {
                weight: 0.35,
                calculateFactor: (current, optimal) => {
                    const deviation = Math.abs(current - optimal.optimal);
                    const tolerance = (optimal.max - optimal.min) / 2;
                    return Math.max(0.4, 1 - (deviation / tolerance));
                }
            },
            humidity: {
                weight: 0.25,
                calculateFactor: (current, optimal) => {
                    const deviation = Math.abs(current - optimal.optimal);
                    const tolerance = (optimal.max - optimal.min) / 2;
                    return Math.max(0.5, 1 - (deviation / tolerance));
                }
            },
            rainfall: {
                weight: 0.30,
                calculateFactor: (current, optimal) => {
                    const deviation = Math.abs(current - optimal.optimal);
                    const tolerance = (optimal.max - optimal.min) / 2;
                    return Math.max(0.3, 1 - (deviation / tolerance));
                }
            },
            management: {
                weight: 0.10,
                calculateFactor: (managementLevel) => {
                    // Management level: basic (0.8), good (1.0), advanced (1.2)
                    return managementLevel || 1.0;
                }
            }
        };
    }

    /**
     * Predict crop yield based on location and conditions
     */
    predictYield(cropId, weatherData, farmSize = 1, managementLevel = 1.0) {
        const crop = this.cropDatabase[cropId];
        if (!crop) {
            throw new Error(`Crop ${cropId} not found`);
        }

        const models = this.yieldModels;
        let yieldFactor = 1.0;

        // Calculate weather impact
        if (weatherData.temperature !== undefined) {
            const tempFactor = models.temperature.calculateFactor(
                weatherData.temperature, 
                crop.optimalConditions.temperature
            );
            yieldFactor *= (tempFactor * models.temperature.weight + (1 - models.temperature.weight));
        }

        if (weatherData.humidity !== undefined) {
            const humidityFactor = models.humidity.calculateFactor(
                weatherData.humidity, 
                crop.optimalConditions.humidity
            );
            yieldFactor *= (humidityFactor * models.humidity.weight + (1 - models.humidity.weight));
        }

        if (weatherData.rainfall !== undefined) {
            const rainfallFactor = models.rainfall.calculateFactor(
                weatherData.rainfall, 
                crop.optimalConditions.rainfall
            );
            yieldFactor *= (rainfallFactor * models.rainfall.weight + (1 - models.rainfall.weight));
        }

        // Management factor
        const managementFactor = models.management.calculateFactor(managementLevel);
        yieldFactor *= managementFactor;

        // Calculate predicted yield
        const predictedYieldPerHectare = crop.baseYield * yieldFactor;
        const totalYield = predictedYieldPerHectare * farmSize;

        return {
            cropId,
            cropName: crop.name,
            farmSize,
            yieldPerHectare: Math.round(predictedYieldPerHectare),
            totalYield: Math.round(totalYield),
            yieldFactor: Math.round(yieldFactor * 100) / 100,
            unit: crop.category === 'fiber' ? 'kg' : 'kg',
            confidence: this.calculateConfidence(yieldFactor)
        };
    }

    /**
     * Calculate total investment costs
     */
    calculateInvestmentCosts(cropId, farmSize, inputSelections = {}) {
        const crop = this.cropDatabase[cropId];
        if (!crop) {
            throw new Error(`Crop ${cropId} not found`);
        }

        const costs = this.inputCosts;
        let totalCost = 0;
        const breakdown = {};

        // Seed cost
        const seedCost = (costs.seeds[cropId] || 3000) * farmSize;
        breakdown.seeds = seedCost;
        totalCost += seedCost;

        // Fertilizer cost
        let fertilizerCost = costs.fertilizers.base * farmSize;
        if (inputSelections.organicFertilizer) {
            fertilizerCost += costs.fertilizers.organic * farmSize;
        }
        if (inputSelections.micronutrients) {
            fertilizerCost += costs.fertilizers.micronutrients * farmSize;
        }
        breakdown.fertilizers = fertilizerCost;
        totalCost += fertilizerCost;

        // Pesticide cost
        let pesticideCost = costs.pesticides.base * farmSize;
        if (inputSelections.advancedPestControl) {
            pesticideCost = costs.pesticides.advanced * farmSize;
        } else if (inputSelections.biologicalPestControl) {
            pesticideCost = costs.pesticides.biological * farmSize;
        }
        breakdown.pesticides = pesticideCost;
        totalCost += pesticideCost;

        // Irrigation cost
        let irrigationCost = costs.irrigation.flood * farmSize; // Default
        if (inputSelections.irrigationType === 'drip') {
            irrigationCost = costs.irrigation.drip * farmSize * 0.2; // Amortized over 5 years
        } else if (inputSelections.irrigationType === 'sprinkler') {
            irrigationCost = costs.irrigation.sprinkler * farmSize * 0.3;
        }
        breakdown.irrigation = irrigationCost;
        totalCost += irrigationCost;

        // Labor cost
        const laborCost = (
            costs.labor.preparation + 
            costs.labor.sowing + 
            costs.labor.maintenance + 
            costs.labor.harvesting
        ) * farmSize;
        breakdown.labor = laborCost;
        totalCost += laborCost;

        // Machinery cost
        const machineryCost = (costs.machinery.rent + costs.machinery.fuel) * farmSize;
        breakdown.machinery = machineryCost;
        totalCost += machineryCost;

        // Other costs
        const otherCost = (
            costs.other.transport + 
            costs.other.storage + 
            costs.other.certification
        ) * farmSize;
        breakdown.other = otherCost;
        totalCost += otherCost;

        return {
            totalCost: Math.round(totalCost),
            breakdown,
            costPerHectare: Math.round(totalCost / farmSize)
        };
    }

    /**
     * Calculate revenue and profit
     */
    calculateProfitAnalysis(yieldPrediction, investmentCosts, marketPriceAdjustment = 0) {
        const cropId = yieldPrediction.cropId;
        const marketPrice = this.marketPrices[cropId];
        
        if (!marketPrice) {
            throw new Error(`Market price for ${cropId} not found`);
        }

        // Adjust market price
        const adjustedPrice = marketPrice.current * (1 + marketPriceAdjustment);
        
        // Calculate revenue
        const grossRevenue = yieldPrediction.totalYield * adjustedPrice;
        
        // Calculate profit
        const netProfit = grossRevenue - investmentCosts.totalCost;
        const profitMargin = (netProfit / grossRevenue) * 100;
        const returnOnInvestment = (netProfit / investmentCosts.totalCost) * 100;

        // Risk assessment
        const riskLevel = this.assessRiskLevel(profitMargin, marketPrice.volatility);

        return {
            grossRevenue: Math.round(grossRevenue),
            totalCosts: investmentCosts.totalCost,
            netProfit: Math.round(netProfit),
            profitMargin: Math.round(profitMargin * 100) / 100,
            returnOnInvestment: Math.round(returnOnInvestment * 100) / 100,
            pricePerUnit: Math.round(adjustedPrice * 100) / 100,
            breakEvenYield: Math.round(investmentCosts.totalCost / adjustedPrice),
            riskLevel,
            marketVolatility: marketPrice.volatility
        };
    }

    /**
     * Generate scenario comparisons
     */
    generateScenarios(cropId, baseData) {
        const scenarios = [];

        // Optimistic scenario (20% better conditions)
        const optimisticYield = this.predictYield(
            cropId, 
            this.adjustWeatherData(baseData.weatherData, 0.2),
            baseData.farmSize,
            1.2 // Better management
        );
        const optimisticCosts = this.calculateInvestmentCosts(
            cropId, 
            baseData.farmSize, 
            { ...baseData.inputSelections, advancedPestControl: true, organicFertilizer: true }
        );
        const optimisticProfit = this.calculateProfitAnalysis(
            optimisticYield, 
            optimisticCosts, 
            0.1 // 10% higher market price
        );

        scenarios.push({
            name: 'Optimistic',
            description: 'Good weather + Advanced farming + Higher prices',
            yield: optimisticYield,
            costs: optimisticCosts,
            profit: optimisticProfit,
            probability: 20
        });

        // Realistic scenario (current conditions)
        const realisticYield = this.predictYield(
            cropId, 
            baseData.weatherData,
            baseData.farmSize,
            1.0
        );
        const realisticCosts = this.calculateInvestmentCosts(
            cropId, 
            baseData.farmSize, 
            baseData.inputSelections
        );
        const realisticProfit = this.calculateProfitAnalysis(
            realisticYield, 
            realisticCosts, 
            0
        );

        scenarios.push({
            name: 'Realistic',
            description: 'Current conditions + Standard farming',
            yield: realisticYield,
            costs: realisticCosts,
            profit: realisticProfit,
            probability: 60
        });

        // Pessimistic scenario (20% worse conditions)
        const pessimisticYield = this.predictYield(
            cropId, 
            this.adjustWeatherData(baseData.weatherData, -0.2),
            baseData.farmSize,
            0.8 // Basic management
        );
        const pessimisticCosts = this.calculateInvestmentCosts(
            cropId, 
            baseData.farmSize, 
            {} // Basic inputs only
        );
        const pessimisticProfit = this.calculateProfitAnalysis(
            pessimisticYield, 
            pessimisticCosts, 
            -0.1 // 10% lower market price
        );

        scenarios.push({
            name: 'Pessimistic',
            description: 'Poor weather + Basic farming + Lower prices',
            yield: pessimisticYield,
            costs: pessimisticCosts,
            profit: pessimisticProfit,
            probability: 20
        });

        return scenarios;
    }

    /**
     * Helper methods
     */
    calculateConfidence(yieldFactor) {
        if (yieldFactor >= 0.9) return 'High';
        if (yieldFactor >= 0.7) return 'Medium';
        return 'Low';
    }

    assessRiskLevel(profitMargin, volatility) {
        if (profitMargin > 30 && volatility < 0.2) return 'Low';
        if (profitMargin > 15 && volatility < 0.3) return 'Medium';
        return 'High';
    }

    adjustWeatherData(weatherData, factor) {
        return {
            temperature: weatherData.temperature * (1 + factor * 0.1),
            humidity: Math.max(0, Math.min(100, weatherData.humidity * (1 + factor * 0.1))),
            rainfall: Math.max(0, weatherData.rainfall * (1 + factor))
        };
    }
}

// Initialize service
const profitService = new ProfitPredictionService();

/**
 * POST /api/profit/predict
 * Main profit prediction endpoint
 */
router.post('/predict', async (req, res) => {
    try {
        const {
            cropId,
            location,
            farmSize = 1,
            inputSelections = {},
            marketPriceAdjustment = 0,
            weatherData
        } = req.body;

        if (!cropId) {
            return res.status(400).json({
                success: false,
                error: 'Crop ID is required'
            });
        }

        // Default weather data if not provided
        const defaultWeatherData = weatherData || {
            temperature: 25,
            humidity: 65,
            rainfall: 100
        };

        // Generate yield prediction
        const yieldPrediction = profitService.predictYield(
            cropId,
            defaultWeatherData,
            farmSize,
            inputSelections.managementLevel || 1.0
        );

        // Calculate investment costs
        const investmentCosts = profitService.calculateInvestmentCosts(
            cropId,
            farmSize,
            inputSelections
        );

        // Calculate profit analysis
        const profitAnalysis = profitService.calculateProfitAnalysis(
            yieldPrediction,
            investmentCosts,
            marketPriceAdjustment
        );

        // Generate scenarios
        const scenarios = profitService.generateScenarios(cropId, {
            weatherData: defaultWeatherData,
            farmSize,
            inputSelections
        });

        // Prepare response
        const response = {
            success: true,
            data: {
                crop: profitService.cropDatabase[cropId],
                location: location || 'Default Location',
                farmSize,
                prediction: {
                    yield: yieldPrediction,
                    costs: investmentCosts,
                    profit: profitAnalysis,
                    scenarios
                },
                recommendations: generateRecommendations(profitAnalysis, yieldPrediction),
                generatedAt: new Date().toISOString()
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Profit prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * GET /api/profit/crops
 * Get available crops for prediction
 */
router.get('/crops', (req, res) => {
    const crops = Object.entries(profitService.cropDatabase).map(([id, data]) => ({
        id,
        name: data.name,
        category: data.category,
        icon: data.icon,
        baseYield: data.baseYield,
        growthDays: data.growthDays
    }));

    res.json({
        success: true,
        data: crops
    });
});

/**
 * GET /api/profit/market-prices
 * Get current market prices
 */
router.get('/market-prices', (req, res) => {
    res.json({
        success: true,
        data: profitService.marketPrices
    });
});

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(profitAnalysis, yieldPrediction) {
    const recommendations = [];

    if (profitAnalysis.returnOnInvestment > 50) {
        recommendations.push({
            type: 'success',
            title: 'Excellent Investment Opportunity',
            message: `This crop shows high profitability with ${profitAnalysis.returnOnInvestment.toFixed(1)}% ROI. Consider expanding cultivation area.`
        });
    } else if (profitAnalysis.returnOnInvestment > 20) {
        recommendations.push({
            type: 'info',
            title: 'Good Investment Potential',
            message: `Decent returns expected. Consider optimizing input costs to improve margins.`
        });
    } else if (profitAnalysis.returnOnInvestment > 0) {
        recommendations.push({
            type: 'warning',
            title: 'Moderate Returns',
            message: `Low but positive returns. Focus on cost reduction and yield improvement techniques.`
        });
    } else {
        recommendations.push({
            type: 'error',
            title: 'High Risk Investment',
            message: `Current projections show potential losses. Consider alternative crops or wait for better market conditions.`
        });
    }

    if (profitAnalysis.riskLevel === 'High') {
        recommendations.push({
            type: 'warning',
            title: 'High Market Risk',
            message: `This crop has high price volatility. Consider market diversification or contract farming.`
        });
    }

    if (yieldPrediction.confidence === 'Low') {
        recommendations.push({
            type: 'info',
            title: 'Yield Uncertainty',
            message: `Weather conditions may not be optimal. Consider improving irrigation and crop protection measures.`
        });
    }

    return recommendations;
}

module.exports = router;