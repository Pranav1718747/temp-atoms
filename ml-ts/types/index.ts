/**
 * Core TypeScript interfaces and types for ML system
 */

export interface PredictionResult {
  predictions: any[];
  confidence: number;
  metadata?: Record<string, any>;
}

// Base ML Model Interface
export interface BaseMLModel {
  initialize(): Promise<void>;
  predict(input: any): Promise<any>;
  evaluate(testData: any[]): Promise<{ accuracy: number; mse: number; r2: number }>;
}

// Soil Monitoring Types
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

// Irrigation Optimization Types
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
  recommendedAmount: number; // in mm
  scheduledTime: string;
  duration: number; // in minutes
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

// Weather Data Interface
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

// Prediction interfaces
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

// Crop recommendation interfaces
export interface CropConditions {
  temperature: { min: number; max: number; optimal: number };
  humidity: { min: number; max: number; optimal: number };
  rainfall: { min: number; max: number; optimal: number };
  soilMoisture: { min: number; max: number; optimal: number };
  soilPH?: { min: number; max: number; optimal: number };
}

export interface CropData {
  name: string;
  localName: string;
  optimalConditions: CropConditions;
  seasons: Season[];
  growthDays: number;
  waterRequirement: WaterRequirement;
  category: CropCategory;
  yieldPotential: { min: number; max: number; unit: string };
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

// Alert prediction interfaces
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
  duration: number; // hours
  affectedAreas: string[];
  recommendedActions: string[];
  confidence: number;
}

export interface AlertRiskAssessment {
  overallRisk: RiskLevel;
  activeAlerts: number;
  riskFactors: string[];
  timeToNextAlert: number; // hours
  recommendations: string[];
}

// ML Model interfaces
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
  mse?: number; // for regression models
  mae?: number; // for regression models
  confusionMatrix?: number[][];
}

export interface ModelMetrics {
  trainedSamples: number;
  lastTrained: string;
  averageAccuracy: number;
  predictionsCount: number;
  lastPrediction: string;
}

// Feature engineering interfaces
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

// Time series interfaces
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

// Ensemble model interfaces
export interface EnsembleModel<TInput, TOutput> extends MLModel<TInput, TOutput> {
  models: MLModel<TInput, TOutput>[];
  weights: number[];
  votingStrategy: 'majority' | 'weighted' | 'average';
  
  addModel(model: MLModel<TInput, TOutput>, weight?: number): void;
  removeModel(modelName: string): void;
  updateWeights(weights: number[]): void;
}

// Configuration interfaces
export interface MLConfig {
  weather: WeatherModelConfig;
  crop: CropModelConfig;
  alert: AlertModelConfig;
  general: GeneralMLConfig;
}

export interface WeatherModelConfig {
  predictionHorizon: number; // days
  updateFrequency: number; // hours
  minHistoricalData: number; // days
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
  predictionHorizon: number; // hours
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

// Enums and constants
export type Season = 'Kharif' | 'Rabi' | 'Zaid';
export type WaterRequirement = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type CropCategory = 'cereal' | 'legume' | 'vegetable' | 'fruit' | 'cash_crop' | 'fiber' | 'oilseed' | 'spice';
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'FLOOD' | 'DROUGHT' | 'HEAT' | 'COLD' | 'STORM' | 'FROST' | 'HAIL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TimeFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type MLAlgorithm = 
  | 'linear_regression' 
  | 'polynomial_regression' 
  | 'decision_tree' 
  | 'random_forest' 
  | 'neural_network' 
  | 'svm' 
  | 'k_means' 
  | 'arima' 
  | 'lstm' 
  | 'ensemble';

export interface MarketTrend {
  currentPrice: number;
  priceHistory: Array<{ date: string; price: number }>;
  demandLevel: 'low' | 'medium' | 'high';
  seasonalDemand: Record<Season, number>;
  volatility: number;
}

// Database interfaces
export interface MLPredictionRecord {
  id?: number;
  cityId: number;
  cityName: string;
  predictionType: 'weather' | 'crop' | 'alert';
  predictionData: string; // JSON serialized
  confidence: number;
  generatedAt: string;
  validUntil: string;
  modelVersion: string;
  metadata?: string; // JSON serialized
}

// Service interfaces
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

// Utility types
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

// Pest and Disease Prediction Types
export interface PestRiskPrediction {
  overallRisk: number;
  pestTypes: Array<{ type: string; probability: number }>;
  riskFactors: Record<string, number>;
  recommendations: string[];
  confidence: number;
}

export interface DiseaseRiskPrediction {
  overallRisk: number;
  diseaseTypes: Array<{ type: string; probability: number }>;
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

// Error handling
export class MLError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MLError';
  }
}

export class ModelNotInitializedError extends MLError {
  constructor(modelName: string) {
    super(`Model ${modelName} is not initialized`, 'MODEL_NOT_INITIALIZED', { modelName });
  }
}

export class InsufficientDataError extends MLError {
  constructor(requiredSamples: number, actualSamples: number) {
    super(
      `Insufficient data: required ${requiredSamples}, got ${actualSamples}`,
      'INSUFFICIENT_DATA',
      { requiredSamples, actualSamples }
    );
  }
}