/**
 * Core TypeScript interfaces and types for ML system
 */
export interface PredictionResult {
    predictions: any[];
    confidence: number;
    metadata?: Record<string, any>;
}
export interface BaseMLModel {
    initialize(): Promise<void>;
    predict(input: any): Promise<any>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
}
export interface SoilData {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
    pressure?: number;
    windSpeed?: number;
    solarRadiation?: number;
    timestamp?: string;
    location?: string;
}
export interface SoilNutrientAnalysis {
    level: 'low' | 'adequate' | 'good' | 'high';
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    recommendations: string[];
}
export interface SoilHealthPrediction {
    timestamp: string;
    healthScore: number;
    moistureLevel: number;
    moistureUncertainty: number;
    nutrients: SoilNutrientAnalysis;
    phLevel: number;
    soilTemperature: number;
    recommendations: string[];
    riskAssessment: {
        level: string;
        factors: string[];
    };
    forecast: any[];
    confidence: number;
}
export interface IrrigationData {
    currentMoisture: number;
    weatherForecast: WeatherForecast[];
    cropType: string;
    growthStage: string;
    soilType: string;
    fieldSize: number;
    lastIrrigation?: string;
}
export interface WeatherForecast {
    temperature: number;
    humidity: number;
    rainfall: number;
    date: string;
}
export interface IrrigationRecommendation {
    timestamp: string;
    shouldIrrigate: boolean;
    recommendedAmount: number;
    scheduledTime: string;
    duration: number;
    method: 'drip' | 'sprinkler' | 'flood' | 'smart';
    efficiency: number;
    waterSavings: number;
    costOptimization: {
        estimatedCost: number;
        savings: number;
    };
    nextIrrigation: string;
    confidence: number;
}
export interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    pressure: number;
    windSpeed?: number;
    windDirection?: number;
    visibility?: number;
    uvIndex?: number;
    cloudCover?: number;
    dewPoint?: number;
    recordedAt: string;
    cityId?: number;
    cityName?: string;
}
export interface HistoricalWeatherData extends WeatherData {
    date: Date;
    source: 'IMD' | 'OpenWeather' | 'Open-Meteo' | 'Mock';
}
export interface WeatherPrediction {
    day: number;
    date: string;
    temperature: number;
    tempMin?: number;
    tempMax?: number;
    humidity: number;
    rainfall: number;
    confidence: number;
    source: 'ML' | 'Open-Meteo' | 'Hybrid';
    metadata?: Record<string, any>;
}
export interface ModelPredictionResult<T> {
    predictions: T[];
    confidence: number;
    modelType: string;
    generatedAt: string;
    validUntil?: string;
    metadata?: Record<string, any>;
}
export interface CropConditions {
    temperature: {
        min: number;
        max: number;
        optimal: number;
    };
    humidity: {
        min: number;
        max: number;
        optimal: number;
    };
    rainfall: {
        min: number;
        max: number;
        optimal: number;
    };
    soilMoisture: {
        min: number;
        max: number;
        optimal: number;
    };
    soilPH?: {
        min: number;
        max: number;
        optimal: number;
    };
}
export interface CropData {
    name: string;
    localName: string;
    optimalConditions: CropConditions;
    seasons: Season[];
    growthDays: number;
    waterRequirement: WaterRequirement;
    category: CropCategory;
    yieldPotential: {
        min: number;
        max: number;
        unit: string;
    };
    marketValue?: number;
    nutritionalValue?: Record<string, number>;
}
export interface CropRecommendation {
    cropId: string;
    name: string;
    localName: string;
    suitabilityScore: number;
    riskLevel: RiskLevel;
    riskFactors: string[];
    predictedYield: number;
    yieldUnit: string;
    recommendation: string;
    confidence: number;
    category: CropCategory;
    waterRequirement: WaterRequirement;
    growthDays: number;
    economicViability: number;
    marketTrends?: MarketTrend;
}
export interface AlertCondition {
    type: AlertType;
    threshold: number;
    severity: AlertSeverity;
    description: string;
}
export interface AlertPrediction {
    type: AlertType;
    severity: AlertSeverity;
    probability: number;
    expectedTime: string;
    duration: number;
    affectedAreas: string[];
    recommendedActions: string[];
    confidence: number;
}
export interface AlertRiskAssessment {
    overallRisk: RiskLevel;
    activeAlerts: number;
    riskFactors: string[];
    timeToNextAlert: number;
    recommendations: string[];
}
export interface MLModel<TInput, TOutput> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy?: number;
    initialize(): Promise<void>;
    train?(data: TInput[]): Promise<void>;
    predict(input: TInput): Promise<TOutput>;
    evaluate?(testData: TInput[], expectedOutput: TOutput[]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
}
export interface ModelEvaluation {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mse?: number;
    mae?: number;
    confusionMatrix?: number[][];
}
export interface ModelMetrics {
    trainedSamples: number;
    lastTrained: string;
    averageAccuracy: number;
    predictionsCount: number;
    lastPrediction: string;
}
export interface FeatureVector {
    features: number[];
    labels: string[];
    metadata?: Record<string, any>;
}
export interface FeatureScaler {
    fit(data: number[][]): void;
    transform(data: number[][]): number[][];
    inverseTransform(data: number[][]): number[][];
    getParams(): Record<string, number>;
}
export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
}
export interface TimeSeriesData {
    series: TimeSeriesPoint[];
    frequency: TimeFrequency;
    seasonality?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
}
export interface TimeSeriesForecast {
    forecast: TimeSeriesPoint[];
    confidence: number[];
    upperBound: number[];
    lowerBound: number[];
    seasonalComponent?: number[];
    trendComponent?: number[];
}
export interface EnsembleModel<TInput, TOutput> extends MLModel<TInput, TOutput> {
    models: MLModel<TInput, TOutput>[];
    weights: number[];
    votingStrategy: 'majority' | 'weighted' | 'average';
    addModel(model: MLModel<TInput, TOutput>, weight?: number): void;
    removeModel(modelName: string): void;
    updateWeights(weights: number[]): void;
}
export interface MLConfig {
    weather: WeatherModelConfig;
    crop: CropModelConfig;
    alert: AlertModelConfig;
    general: GeneralMLConfig;
}
export interface WeatherModelConfig {
    predictionHorizon: number;
    updateFrequency: number;
    minHistoricalData: number;
    models: {
        temperature: ModelTypeConfig;
        humidity: ModelTypeConfig;
        rainfall: ModelTypeConfig;
    };
}
export interface CropModelConfig {
    maxRecommendations: number;
    minSuitabilityScore: number;
    includeMarketData: boolean;
    seasonalWeights: Record<Season, number>;
}
export interface AlertModelConfig {
    alertTypes: AlertType[];
    severityLevels: AlertSeverity[];
    predictionHorizon: number;
    minConfidence: number;
}
export interface GeneralMLConfig {
    enableGPU: boolean;
    parallelProcessing: boolean;
    cachePredictions: boolean;
    cacheExpiryHours: number;
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        logPredictions: boolean;
        logMetrics: boolean;
    };
}
export interface ModelTypeConfig {
    algorithm: MLAlgorithm;
    hyperparameters: Record<string, any>;
    ensembleModels?: string[];
}
export type Season = 'Kharif' | 'Rabi' | 'Zaid';
export type WaterRequirement = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type CropCategory = 'cereal' | 'legume' | 'vegetable' | 'fruit' | 'cash_crop' | 'fiber' | 'oilseed' | 'spice';
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'FLOOD' | 'DROUGHT' | 'HEAT' | 'COLD' | 'STORM' | 'FROST' | 'HAIL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TimeFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type MLAlgorithm = 'linear_regression' | 'polynomial_regression' | 'decision_tree' | 'random_forest' | 'neural_network' | 'svm' | 'k_means' | 'arima' | 'lstm' | 'ensemble';
export interface MarketTrend {
    currentPrice: number;
    priceHistory: Array<{
        date: string;
        price: number;
    }>;
    demandLevel: 'low' | 'medium' | 'high';
    seasonalDemand: Record<Season, number>;
    volatility: number;
}
export interface MLPredictionRecord {
    id?: number;
    cityId: number;
    cityName: string;
    predictionType: 'weather' | 'crop' | 'alert';
    predictionData: string;
    confidence: number;
    generatedAt: string;
    validUntil: string;
    modelVersion: string;
    metadata?: string;
}
export interface WeatherPredictionService {
    predictWeather(cityName: string, days: number, currentWeather?: WeatherData): Promise<ModelPredictionResult<WeatherPrediction>>;
    getWeatherTrends(cityName: string, days: number): Promise<TimeSeriesForecast>;
    validatePrediction(prediction: WeatherPrediction, actual: WeatherData): number;
}
export interface CropRecommendationService {
    recommendCrops(weatherData: WeatherData, season?: Season): Promise<ModelPredictionResult<CropRecommendation>>;
    analyzeCropViability(cropId: string, location: string): Promise<CropRecommendation>;
    getCropOptimalConditions(cropId: string): CropData;
}
export interface AlertPredictionService {
    predictAlerts(weatherData: WeatherData, forecastData?: WeatherPrediction[]): Promise<ModelPredictionResult<AlertPrediction>>;
    assessRisk(cityName: string): Promise<AlertRiskAssessment>;
    getAlertHistory(cityName: string, days: number): Promise<AlertPrediction[]>;
}
export type PredictionInput = WeatherData | HistoricalWeatherData[];
export type PredictionOutput = WeatherPrediction | CropRecommendation | AlertPrediction;
export interface DataPreprocessor<TInput, TOutput> {
    preprocess(data: TInput): TOutput;
    postprocess(data: TOutput): TInput;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface PestRiskPrediction {
    overallRisk: number;
    pestTypes: Array<{
        type: string;
        probability: number;
    }>;
    riskFactors: Record<string, number>;
    recommendations: string[];
    confidence: number;
}
export interface DiseaseRiskPrediction {
    overallRisk: number;
    diseaseTypes: Array<{
        type: string;
        probability: number;
    }>;
    riskFactors: Record<string, number>;
    recommendations: string[];
    confidence: number;
}
export interface MLModelInfo {
    name: string;
    version: string;
    description: string;
    accuracy: number;
    lastTrained: Date;
    features: string[];
}
export declare class MLError extends Error {
    code: string;
    context?: Record<string, any> | undefined;
    constructor(message: string, code: string, context?: Record<string, any> | undefined);
}
export declare class ModelNotInitializedError extends MLError {
    constructor(modelName: string);
}
export declare class InsufficientDataError extends MLError {
    constructor(requiredSamples: number, actualSamples: number);
}
//# sourceMappingURL=index.d.ts.map