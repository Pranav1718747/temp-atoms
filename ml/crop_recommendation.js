/**
 * Crop Recommendation ML Model
 * Implements crop suitability prediction based on weather and soil conditions
 */

class CropRecommendationModel {
    constructor() {
        this.cropDatabase = {};
        this.weightsMatrix = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the crop recommendation model
     */
    async initialize() {
        try {
            this.loadCropDatabase();
            this.initializeWeights();
            this.isInitialized = true;
            console.log('Crop recommendation model initialized successfully');
        } catch (error) {
            console.error('Error initializing crop model:', error);
            throw error;
        }
    }

    /**
     * Load comprehensive crop database with optimal conditions
     */
    loadCropDatabase() {
        this.cropDatabase = {
            rice: {
                name: 'Rice (धान)',
                optimalConditions: {
                    temperature: { min: 20, max: 35, optimal: 27 },
                    humidity: { min: 70, max: 95, optimal: 85 },
                    rainfall: { min: 100, max: 300, optimal: 200 },
                    soilMoisture: { min: 80, max: 100, optimal: 90 }
                },
                seasons: ['Kharif'],
                growthDays: 120,
                waterRequirement: 'high',
                category: 'cereal'
            },
            wheat: {
                name: 'Wheat (गेहूं)',
                optimalConditions: {
                    temperature: { min: 10, max: 25, optimal: 18 },
                    humidity: { min: 50, max: 70, optimal: 60 },
                    rainfall: { min: 30, max: 100, optimal: 60 },
                    soilMoisture: { min: 40, max: 70, optimal: 55 }
                },
                seasons: ['Rabi'],
                growthDays: 110,
                waterRequirement: 'medium',
                category: 'cereal'
            },
            cotton: {
                name: 'Cotton (कपास)',
                optimalConditions: {
                    temperature: { min: 21, max: 30, optimal: 25 },
                    humidity: { min: 55, max: 80, optimal: 70 },
                    rainfall: { min: 50, max: 150, optimal: 100 },
                    soilMoisture: { min: 50, max: 80, optimal: 65 }
                },
                seasons: ['Kharif'],
                growthDays: 180,
                waterRequirement: 'medium',
                category: 'fiber'
            },
            sugarcane: {
                name: 'Sugarcane (गन्ना)',
                optimalConditions: {
                    temperature: { min: 20, max: 35, optimal: 28 },
                    humidity: { min: 75, max: 95, optimal: 85 },
                    rainfall: { min: 150, max: 400, optimal: 250 },
                    soilMoisture: { min: 70, max: 100, optimal: 85 }
                },
                seasons: ['Kharif', 'Rabi'],
                growthDays: 365,
                waterRequirement: 'very_high',
                category: 'cash_crop'
            },
            tomato: {
                name: 'Tomato (टमाटर)',
                optimalConditions: {
                    temperature: { min: 18, max: 27, optimal: 22 },
                    humidity: { min: 60, max: 85, optimal: 70 },
                    rainfall: { min: 40, max: 120, optimal: 80 },
                    soilMoisture: { min: 60, max: 80, optimal: 70 }
                },
                seasons: ['Kharif', 'Rabi'],
                growthDays: 90,
                waterRequirement: 'medium',
                category: 'vegetable'
            },
            onion: {
                name: 'Onion (प्याज)',
                optimalConditions: {
                    temperature: { min: 15, max: 25, optimal: 20 },
                    humidity: { min: 55, max: 75, optimal: 65 },
                    rainfall: { min: 25, max: 80, optimal: 50 },
                    soilMoisture: { min: 45, max: 70, optimal: 60 }
                },
                seasons: ['Rabi'],
                growthDays: 120,
                waterRequirement: 'low',
                category: 'vegetable'
            },
            maize: {
                name: 'Maize (मक्का)',
                optimalConditions: {
                    temperature: { min: 21, max: 30, optimal: 25 },
                    humidity: { min: 60, max: 80, optimal: 70 },
                    rainfall: { min: 60, max: 150, optimal: 100 },
                    soilMoisture: { min: 55, max: 75, optimal: 65 }
                },
                seasons: ['Kharif'],
                growthDays: 100,
                waterRequirement: 'medium',
                category: 'cereal'
            },
            soybean: {
                name: 'Soybean (सोयाबीन)',
                optimalConditions: {
                    temperature: { min: 20, max: 30, optimal: 25 },
                    humidity: { min: 65, max: 85, optimal: 75 },
                    rainfall: { min: 80, max: 200, optimal: 140 },
                    soilMoisture: { min: 60, max: 85, optimal: 75 }
                },
                seasons: ['Kharif'],
                growthDays: 95,
                waterRequirement: 'medium',
                category: 'legume'
            }
        };
    }

    /**
     * Initialize ML weights for different factors
     */
    initializeWeights() {
        this.weightsMatrix = {
            temperature: 0.3,
            humidity: 0.25,
            rainfall: 0.25,
            soilMoisture: 0.15,
            seasonal: 0.05
        };
    }

    /**
     * Recommend crops based on current weather conditions
     * @param {Object} weatherData - Current weather conditions
     * @param {string} season - Current season
     * @returns {Array} Ranked crop recommendations
     */
    async recommendCrops(weatherData, season = null) {
        if (!this.isInitialized) {
            throw new Error('Crop recommendation model not initialized');
        }

        try {
            const currentSeason = season || this.getCurrentSeason();
            const recommendations = [];

            for (const [cropId, cropData] of Object.entries(this.cropDatabase)) {
                const suitabilityScore = this.calculateSuitabilityScore(weatherData, cropData, currentSeason);
                const riskAssessment = this.assessRisk(weatherData, cropData);
                const yieldPrediction = this.predictYield(weatherData, cropData, suitabilityScore);

                recommendations.push({
                    cropId,
                    name: cropData.name,
                    suitabilityScore,
                    riskLevel: riskAssessment.level,
                    riskFactors: riskAssessment.factors,
                    predictedYield: yieldPrediction,
                    recommendation: this.generateRecommendation(suitabilityScore, riskAssessment),
                    confidence: this.calculateConfidence(suitabilityScore, riskAssessment),
                    category: cropData.category,
                    waterRequirement: cropData.waterRequirement,
                    growthDays: cropData.growthDays
                });
            }

            // Sort by suitability score
            recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

            return {
                recommendations: recommendations.slice(0, 6), // Top 6 recommendations
                season: currentSeason,
                weatherConditions: weatherData,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error in crop recommendation:', error);
            throw error;
        }
    }

    /**
     * Calculate suitability score for a crop based on current conditions
     */
    calculateSuitabilityScore(weatherData, cropData, season) {
        const conditions = cropData.optimalConditions;
        let totalScore = 0;

        // Temperature score
        const tempScore = this.calculateParameterScore(
            weatherData.temperature,
            conditions.temperature
        );
        totalScore += tempScore * this.weightsMatrix.temperature;

        // Humidity score
        const humidityScore = this.calculateParameterScore(
            weatherData.humidity,
            conditions.humidity
        );
        totalScore += humidityScore * this.weightsMatrix.humidity;

        // Rainfall score
        const rainfallScore = this.calculateParameterScore(
            weatherData.rainfall || 0,
            conditions.rainfall
        );
        totalScore += rainfallScore * this.weightsMatrix.rainfall;

        // Soil moisture score (estimated from humidity and rainfall)
        const estimatedSoilMoisture = this.estimateSoilMoisture(weatherData);
        const soilMoistureScore = this.calculateParameterScore(
            estimatedSoilMoisture,
            conditions.soilMoisture
        );
        totalScore += soilMoistureScore * this.weightsMatrix.soilMoisture;

        // Seasonal appropriateness
        const seasonalScore = cropData.seasons.includes(season) ? 1 : 0.3;
        totalScore += seasonalScore * this.weightsMatrix.seasonal;

        return Math.round(totalScore * 100); // Convert to percentage
    }

    /**
     * Calculate score for individual parameter
     */
    calculateParameterScore(currentValue, optimalRange) {
        const { min, max, optimal } = optimalRange;

        if (currentValue < min || currentValue > max) {
            // Outside viable range
            const distanceFromRange = Math.min(
                Math.abs(currentValue - min),
                Math.abs(currentValue - max)
            );
            return Math.max(0, 1 - (distanceFromRange / optimal));
        }

        // Within viable range
        const distanceFromOptimal = Math.abs(currentValue - optimal);
        const rangeSize = (max - min) / 2;
        return Math.max(0.7, 1 - (distanceFromOptimal / rangeSize));
    }

    /**
     * Estimate soil moisture from weather data
     */
    estimateSoilMoisture(weatherData) {
        const baseLevel = 30;
        const humidityEffect = (weatherData.humidity - 50) * 0.8;
        const rainfallEffect = (weatherData.rainfall || 0) * 2;
        
        return Math.min(100, Math.max(0, baseLevel + humidityEffect + rainfallEffect));
    }

    /**
     * Assess risk factors for crop cultivation
     */
    assessRisk(weatherData, cropData) {
        const risks = [];
        let riskLevel = 'low';

        const conditions = cropData.optimalConditions;

        // Temperature risk
        if (weatherData.temperature < conditions.temperature.min - 5) {
            risks.push('Low temperature may affect growth');
            riskLevel = 'high';
        } else if (weatherData.temperature > conditions.temperature.max + 5) {
            risks.push('High temperature stress possible');
            riskLevel = 'medium';
        }

        // Humidity risk
        if (weatherData.humidity < conditions.humidity.min - 10) {
            risks.push('Low humidity may cause water stress');
            if (riskLevel === 'low') riskLevel = 'medium';
        } else if (weatherData.humidity > conditions.humidity.max + 10) {
            risks.push('High humidity may increase disease risk');
            if (riskLevel === 'low') riskLevel = 'medium';
        }

        // Rainfall risk
        const rainfall = weatherData.rainfall || 0;
        if (rainfall < conditions.rainfall.min - 20) {
            risks.push('Insufficient rainfall - irrigation required');
            riskLevel = 'high';
        } else if (rainfall > conditions.rainfall.max + 50) {
            risks.push('Excess rainfall may cause waterlogging');
            if (riskLevel !== 'high') riskLevel = 'medium';
        }

        return {
            level: riskLevel,
            factors: risks
        };
    }

    /**
     * Predict potential yield based on conditions
     */
    predictYield(weatherData, cropData, suitabilityScore) {
        const baseYield = {
            rice: 4000, wheat: 3500, cotton: 500, sugarcane: 80000,
            tomato: 25000, onion: 20000, maize: 6000, soybean: 2500
        };

        const cropId = Object.keys(this.cropDatabase).find(
            key => this.cropDatabase[key] === cropData
        );

        const base = baseYield[cropId] || 3000;
        const yieldFactor = suitabilityScore / 100;
        const randomVariation = 0.9 + (Math.random() * 0.2); // ±10% variation

        return Math.round(base * yieldFactor * randomVariation);
    }

    /**
     * Generate recommendation text
     */
    generateRecommendation(suitabilityScore, riskAssessment) {
        if (suitabilityScore >= 80) {
            return 'Highly recommended - excellent conditions';
        } else if (suitabilityScore >= 60) {
            return 'Recommended with proper care';
        } else if (suitabilityScore >= 40) {
            return 'Possible with additional inputs';
        } else {
            return 'Not recommended under current conditions';
        }
    }

    /**
     * Calculate confidence in recommendation
     */
    calculateConfidence(suitabilityScore, riskAssessment) {
        let confidence = suitabilityScore / 100;

        // Reduce confidence based on risk level
        switch (riskAssessment.level) {
            case 'high':
                confidence *= 0.7;
                break;
            case 'medium':
                confidence *= 0.85;
                break;
            default:
                confidence *= 0.95;
        }

        return Math.round(confidence * 100);
    }

    /**
     * Get current season based on month
     */
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        
        if (month >= 6 && month <= 11) {
            return 'Kharif'; // Monsoon season
        } else {
            return 'Rabi'; // Winter season
        }
    }

    /**
     * Get detailed crop information
     */
    getCropDetails(cropId) {
        return this.cropDatabase[cropId] || null;
    }

    /**
     * Analyze crop performance trends
     */
    async analyzeCropTrends(historicalData, cropId) {
        const cropData = this.cropDatabase[cropId];
        if (!cropData) {
            throw new Error('Crop not found');
        }

        const trends = {
            suitabilityTrend: [],
            riskTrend: [],
            yieldTrend: []
        };

        historicalData.forEach((data, index) => {
            const suitability = this.calculateSuitabilityScore(data, cropData, this.getCurrentSeason());
            const risk = this.assessRisk(data, cropData);
            const yieldValue = this.predictYield(data, cropData, suitability);

            trends.suitabilityTrend.push({ day: index + 1, value: suitability });
            trends.riskTrend.push({ day: index + 1, value: risk.level });
            trends.yieldTrend.push({ day: index + 1, value: yieldValue });
        });

        return trends;
    }
}

module.exports = CropRecommendationModel;