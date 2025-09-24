"use strict";
/**
 * Comprehensive ML Service Orchestrator
 * Integrates all specialized ML systems for complete farm intelligence
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprehensiveMLService = void 0;
const weather_predictor_1 = require("./models/weather-predictor");
const crop_recommender_1 = require("./models/crop-recommender");
const alert_predictor_1 = require("./models/alert-predictor");
const soil_monitor_1 = require("./models/soil-monitor");
const irrigation_optimizer_1 = require("./models/irrigation-optimizer");
const energy_optimizer_1 = require("./models/energy-optimizer");
class ModelPerformanceMonitor {
    constructor() {
        this.performanceMetrics = new Map();
    }
    recordModelPerformance(modelName, metrics) {
        const existing = this.performanceMetrics.get(modelName) || {
            totalCalls: 0,
            successfulCalls: 0,
            averageResponseTime: 0,
            averageConfidence: 0,
            lastUpdated: new Date().toISOString()
        };
        existing.totalCalls++;
        if (metrics.success)
            existing.successfulCalls++;
        existing.averageResponseTime = (existing.averageResponseTime * (existing.totalCalls - 1) + metrics.responseTime) / existing.totalCalls;
        existing.averageConfidence = (existing.averageConfidence * (existing.totalCalls - 1) + metrics.confidence) / existing.totalCalls;
        existing.lastUpdated = new Date().toISOString();
        this.performanceMetrics.set(modelName, existing);
    }
    getAllMetrics() {
        const result = {};
        for (const [modelName, metrics] of this.performanceMetrics.entries()) {
            result[modelName] = metrics;
        }
        return result;
    }
}
class ComprehensiveMLService {
    constructor() {
        this.isInitialized = false;
        this.weatherModel = new weather_predictor_1.AdvancedWeatherPredictor();
        this.cropModel = new crop_recommender_1.AdvancedCropRecommender();
        this.alertModel = new alert_predictor_1.EnsembleAlertPredictor();
        this.soilModel = new soil_monitor_1.SoilMonitoringModel();
        this.irrigationModel = new irrigation_optimizer_1.IrrigationOptimizationModel();
        this.energyModel = new energy_optimizer_1.EnergyOptimizationModel();
        this.performanceMonitor = new ModelPerformanceMonitor();
    }
    async initialize() {
        try {
            console.log('🚀 Initializing Comprehensive ML Service...');
            const startTime = Date.now();
            await Promise.all([
                this.initializeModel('weather', this.weatherModel),
                this.initializeModel('crop', this.cropModel),
                this.initializeModel('alert', this.alertModel),
                this.initializeModel('soil', this.soilModel),
                this.initializeModel('irrigation', this.irrigationModel),
                this.initializeModel('energy', this.energyModel)
            ]);
            const initTime = Date.now() - startTime;
            console.log(`✅ All ML models initialized in ${initTime}ms`);
            this.isInitialized = true;
            console.log('🎯 Comprehensive ML Service ready for predictions!');
        }
        catch (error) {
            console.error('❌ Error initializing Comprehensive ML Service:', error);
            throw error;
        }
    }
    async initializeModel(name, model) {
        const startTime = Date.now();
        try {
            await model.initialize();
            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordModelPerformance(name, { responseTime, confidence: 1.0, success: true });
            console.log(`✅ ${name} model initialized (${responseTime}ms)`);
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordModelPerformance(name, { responseTime, confidence: 0, success: false });
            console.error(`❌ Failed to initialize ${name} model:`, error);
            throw error;
        }
    }
    async runComprehensiveAnalysis(request) {
        if (!this.isInitialized) {
            throw new Error('Comprehensive ML Service not initialized');
        }
        const startTime = Date.now();
        console.log(`🔍 Running comprehensive analysis for ${request.location.name}`);
        try {
            const results = {};
            const modelsUsed = [];
            if (request.analysisType === 'full' || request.analysisType === 'weather') {
                results.weather = await this.runModelAnalysis('weather', () => this.weatherModel.predict({ currentWeather: request.currentWeather, days: request.timeHorizon, location: request.location }));
                modelsUsed.push('weather');
            }
            if (request.analysisType === 'full' || request.analysisType === 'crops') {
                results.crops = await this.runModelAnalysis('crop', () => this.cropModel.predict({ weatherData: request.currentWeather, location: request.location, farmProfile: request.farmProfile }));
                modelsUsed.push('crop');
            }
            if (request.analysisType === 'full' || request.analysisType === 'soil') {
                results.soil = await this.runModelAnalysis('soil', () => this.soilModel.predict({
                    temperature: request.currentWeather.temperature,
                    humidity: request.currentWeather.humidity,
                    rainfall: request.currentWeather.rainfall,
                    pressure: request.currentWeather.pressure,
                    location: request.location.name
                }));
                modelsUsed.push('soil');
            }
            if (request.analysisType === 'full' || request.analysisType === 'irrigation') {
                results.irrigation = await this.runModelAnalysis('irrigation', () => this.irrigationModel.predict({
                    currentMoisture: results.soil?.moistureLevel || 50,
                    weatherForecast: results.weather?.predictions || [],
                    cropType: request.farmProfile.currentCrops[0] || 'rice',
                    growthStage: 'vegetative',
                    soilType: request.farmProfile.soilType,
                    fieldSize: request.farmProfile.size
                }));
                modelsUsed.push('irrigation');
            }
            if (request.analysisType === 'full' || request.analysisType === 'energy') {
                results.energy = await this.runModelAnalysis('energy', () => this.energyModel.predict({
                    currentUsage: 50,
                    weatherConditions: request.currentWeather,
                    equipmentSchedule: request.farmProfile.equipment || [],
                    energyPrices: this.generateEnergyPrices(),
                    farmSize: request.farmProfile.size
                }));
                modelsUsed.push('energy');
            }
            if (request.analysisType === 'full' || request.analysisType === 'alerts') {
                results.alerts = await this.runModelAnalysis('alert', () => this.alertModel.predict({ currentWeather: request.currentWeather, forecastData: results.weather?.predictions || [], location: request.location }));
                modelsUsed.push('alert');
            }
            const integratedInsights = this.generateIntegratedInsights(results, request);
            const totalTime = Date.now() - startTime;
            console.log(`✅ Analysis completed in ${totalTime}ms`);
            return {
                timestamp: new Date().toISOString(),
                location: request.location.name,
                overallScore: this.calculateOverallScore(results),
                confidence: this.calculateOverallConfidence(results),
                ...results,
                ...integratedInsights,
                systemMetrics: { totalProcessingTime: totalTime, modelsUsed, dataQuality: this.assessDataQuality(request) }
            };
        }
        catch (error) {
            console.error('❌ Error in comprehensive analysis:', error);
            throw error;
        }
    }
    async runModelAnalysis(modelName, analysisFunction) {
        const startTime = Date.now();
        try {
            const result = await analysisFunction();
            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordModelPerformance(modelName, { responseTime, confidence: result.confidence || 0.8, success: true });
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordModelPerformance(modelName, { responseTime, confidence: 0, success: false });
            throw error;
        }
    }
    generateIntegratedInsights(results, request) {
        return {
            actionPriorities: this.generateActionPriorities(results),
            riskAssessment: this.generateRiskAssessment(results),
            sustainabilityMetrics: this.calculateSustainabilityMetrics(results),
            economicForecast: this.generateEconomicForecast(results, request),
            recommendations: this.generateIntegratedRecommendations(results)
        };
    }
    generateActionPriorities(results) {
        const priorities = [];
        if (results.soil?.healthScore < 60) {
            priorities.push({
                category: 'soil_management',
                action: 'Improve soil health through organic amendments',
                priority: 'high',
                timeframe: '1-2 weeks',
                estimatedImpact: 85,
                cost: 500,
                feasibility: 90
            });
        }
        if (results.irrigation?.shouldIrrigate) {
            priorities.push({
                category: 'water_management',
                action: `Apply ${results.irrigation.recommendedAmount}mm irrigation`,
                priority: results.irrigation.recommendedAmount > 40 ? 'critical' : 'high',
                timeframe: '24 hours',
                estimatedImpact: 75,
                cost: results.irrigation.costOptimization?.estimatedCost || 100,
                feasibility: 95
            });
        }
        if (results.energy?.currentEfficiency < 70) {
            priorities.push({
                category: 'energy_management',
                action: 'Optimize equipment scheduling for energy efficiency',
                priority: 'medium',
                timeframe: '1 week',
                estimatedImpact: 60,
                cost: 200,
                feasibility: 80
            });
        }
        return priorities.sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    generateRiskAssessment(results) {
        const riskFactors = [];
        let maxRiskLevel = 0;
        if (results.soil?.healthScore < 50) {
            riskFactors.push({
                category: 'soil_degradation',
                level: 80,
                description: 'Poor soil health detected',
                mitigation: ['Apply organic matter', 'Improve drainage', 'Regular soil testing']
            });
            maxRiskLevel = Math.max(maxRiskLevel, 80);
        }
        if (results.alerts?.overallRisk?.level === 'high' || results.alerts?.overallRisk?.level === 'critical') {
            riskFactors.push({
                category: 'weather_extreme',
                level: 75,
                description: 'Severe weather conditions expected',
                mitigation: ['Secure equipment', 'Protect crops', 'Monitor conditions closely']
            });
            maxRiskLevel = Math.max(maxRiskLevel, 75);
        }
        let overallRiskLevel = 'very_low';
        if (maxRiskLevel > 80)
            overallRiskLevel = 'critical';
        else if (maxRiskLevel > 65)
            overallRiskLevel = 'high';
        else if (maxRiskLevel > 45)
            overallRiskLevel = 'medium';
        else if (maxRiskLevel > 25)
            overallRiskLevel = 'low';
        return { overallRiskLevel, riskFactors, timeToNextCriticalEvent: 168 };
    }
    calculateSustainabilityMetrics(results) {
        const waterEfficiency = results.irrigation?.efficiency || 75;
        const energyEfficiency = results.energy?.currentEfficiency || 70;
        const soilHealth = results.soil?.healthScore || 60;
        const carbonFootprint = Math.max(0, 100 - energyEfficiency);
        const biodiversityIndex = 60;
        const sustainabilityScore = (waterEfficiency * 0.25 + energyEfficiency * 0.25 + soilHealth * 0.3 +
            (100 - carbonFootprint) * 0.15 + biodiversityIndex * 0.05);
        return { waterEfficiency, energyEfficiency, carbonFootprint, soilHealth, biodiversityIndex, sustainabilityScore: Math.round(sustainabilityScore) };
    }
    generateEconomicForecast(results, request) {
        const farmSize = request.farmProfile.size;
        const baseRevenuePerAcre = 2000;
        const baseCostPerAcre = 1200;
        let revenueMultiplier = 1.0;
        let costMultiplier = 1.0;
        if (results.crops?.recommendations?.length > 0) {
            const avgSuitability = results.crops.recommendations.reduce((sum, crop) => sum + crop.suitabilityScore, 0) / results.crops.recommendations.length;
            revenueMultiplier *= (avgSuitability / 100);
        }
        if (results.energy?.estimatedSavings) {
            costMultiplier *= (1 - results.energy.estimatedSavings.cost / (baseCostPerAcre * farmSize));
        }
        const expectedRevenue = farmSize * baseRevenuePerAcre * revenueMultiplier;
        const operationalCosts = farmSize * baseCostPerAcre * costMultiplier;
        const profitMargin = ((expectedRevenue - operationalCosts) / expectedRevenue) * 100;
        const roi = ((expectedRevenue - operationalCosts) / operationalCosts) * 100;
        const riskAdjustment = results.riskAssessment?.overallRiskLevel === 'high' ? 0.9 :
            results.riskAssessment?.overallRiskLevel === 'medium' ? 0.95 : 1.0;
        const riskAdjustedReturn = roi * riskAdjustment;
        let marketOutlook = 'neutral';
        if (profitMargin > 25)
            marketOutlook = 'positive';
        else if (profitMargin < 15)
            marketOutlook = 'negative';
        return {
            expectedRevenue: Math.round(expectedRevenue),
            operationalCosts: Math.round(operationalCosts),
            profitMargin: Math.round(profitMargin * 100) / 100,
            roi: Math.round(roi * 100) / 100,
            riskAdjustedReturn: Math.round(riskAdjustedReturn * 100) / 100,
            marketOutlook
        };
    }
    generateIntegratedRecommendations(results) {
        const recommendations = [];
        let id = 1;
        if (results.soil?.healthScore < 70) {
            recommendations.push({
                id: `rec_${id++}`,
                category: 'soil_management',
                title: 'Improve Soil Health',
                description: 'Implement comprehensive soil improvement program',
                priority: 90,
                impact: { yield: 15, cost: -500, sustainability: 20, risk: -25 },
                implementationSteps: ['Conduct soil testing', 'Apply organic matter', 'Implement cover cropping', 'Optimize pH levels'],
                dependencies: ['soil_testing', 'organic_matter_sourcing'],
                timeframe: '2-4 weeks',
                confidence: 0.85
            });
        }
        if (results.irrigation?.shouldIrrigate) {
            recommendations.push({
                id: `rec_${id++}`,
                category: 'water_management',
                title: 'Optimize Irrigation Schedule',
                description: 'Implement smart irrigation based on ML recommendations',
                priority: 85,
                impact: { yield: 10, cost: -200, sustainability: 15, risk: -15 },
                implementationSteps: ['Install soil sensors', 'Set up automation', 'Schedule as recommended', 'Monitor feedback'],
                dependencies: ['irrigation_equipment'],
                timeframe: '1-2 weeks',
                confidence: 0.90
            });
        }
        return recommendations.sort((a, b) => b.priority - a.priority);
    }
    calculateOverallScore(results) {
        let totalScore = 0;
        let count = 0;
        if (results.soil?.healthScore) {
            totalScore += results.soil.healthScore;
            count++;
        }
        if (results.irrigation?.efficiency) {
            totalScore += results.irrigation.efficiency * 100;
            count++;
        }
        if (results.energy?.currentEfficiency) {
            totalScore += results.energy.currentEfficiency;
            count++;
        }
        if (results.crops?.recommendations?.length > 0) {
            const avgSuitability = results.crops.recommendations.reduce((sum, crop) => sum + crop.suitabilityScore, 0) / results.crops.recommendations.length;
            totalScore += avgSuitability;
            count++;
        }
        return count > 0 ? Math.round(totalScore / count) : 70;
    }
    calculateOverallConfidence(results) {
        let totalConfidence = 0;
        let count = 0;
        Object.values(results).forEach((result) => {
            if (result && typeof result.confidence === 'number') {
                totalConfidence += result.confidence;
                count++;
            }
        });
        return count > 0 ? Math.round((totalConfidence / count) * 100) / 100 : 0.75;
    }
    assessDataQuality(request) {
        let quality = 100;
        if (!request.currentWeather?.temperature)
            quality -= 20;
        if (!request.location?.latitude || !request.location?.longitude)
            quality -= 15;
        if (!request.farmProfile?.size || request.farmProfile.size <= 0)
            quality -= 15;
        if (!request.farmProfile?.soilType)
            quality -= 10;
        if (!request.farmProfile?.currentCrops?.length)
            quality -= 10;
        return Math.max(0, quality);
    }
    generateEnergyPrices() {
        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            price: 0.10 + (hour >= 10 && hour <= 18 ? 0.05 : 0),
            demandLevel: hour >= 10 && hour <= 18 ? 'high' : hour <= 6 || hour >= 22 ? 'low' : 'medium'
        }));
    }
    getSystemHealth() {
        const modelMetrics = this.performanceMonitor.getAllMetrics();
        return { status: 'healthy', models: modelMetrics };
    }
}
exports.ComprehensiveMLService = ComprehensiveMLService;
//# sourceMappingURL=advanced-ml-orchestrator.js.map