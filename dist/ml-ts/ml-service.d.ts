/**
 * Advanced Machine Learning Service Orchestrator
 * Main service that coordinates all ML models with dependency injection
 */
import { WeatherData, WeatherPrediction, CropRecommendation, AlertPrediction, ModelPredictionResult, Season, AlertRiskAssessment } from './types';
/**
 * Database interface for ML service
 */
interface MLDatabase {
    insertWeatherData(data: any): void;
    getWeatherHistory(cityName: string, days: number): WeatherData[];
    getLatestWeather(cityName: string): WeatherData | null;
    getCityByName(cityName: string): {
        id: number;
        name: string;
        imd_id?: number;
    } | null;
    getAllCities(): Array<{
        id: number;
        name: string;
        imd_id?: number;
    }>;
    db: {
        prepare(sql: string): {
            run(...params: any[]): any;
            get(...params: any[]): any;
            all(...params: any[]): any[];
        };
        exec(sql: string): void;
    };
}
/**
 * External API interface
 */
interface ExternalAPI {
    getComprehensiveWeather(cityName: string, cityId?: number): Promise<any>;
}
/**
 * Advanced ML Service with dependency injection and orchestration
 */
export declare class AdvancedMLService {
    private weatherPredictor;
    private cropRecommender;
    private alertPredictor;
    private database;
    private externalAPI;
    private isInitialized;
    private predictionUpdateInterval;
    private modelRetrainingInterval;
    constructor(database: MLDatabase, externalAPI?: ExternalAPI);
    /**
     * Initialize all ML models and services
     */
    initialize(): Promise<void>;
    /**
     * Get comprehensive weather predictions with enhanced ML algorithms
     */
    getWeatherPredictions(cityName: string, days?: number, currentWeather?: WeatherData): Promise<ModelPredictionResult<WeatherPrediction>>;
    /**
     * Get advanced crop recommendations using ML algorithms
     */
    getCropRecommendations(cityName: string, season?: Season): Promise<ModelPredictionResult<CropRecommendation>>;
    /**
     * Get alert predictions using ensemble methods
     */
    getAlertPredictions(cityName: string): Promise<ModelPredictionResult<AlertPrediction>>;
    /**
     * Get comprehensive ML insights for a city
     */
    getComprehensiveInsights(cityName: string): Promise<{
        weather: ModelPredictionResult<WeatherPrediction>;
        crops: ModelPredictionResult<CropRecommendation>;
        alerts: ModelPredictionResult<AlertPrediction>;
        summary: {
            overallConditions: string;
            keyInsights: string[];
            recommendations: string[];
            riskLevel: string;
        };
        generatedAt: string;
    }>;
    /**
     * Assess overall risk for a city
     */
    assessRisk(cityName: string): Promise<AlertRiskAssessment>;
    /**
     * Get ML performance metrics
     */
    getPerformanceMetrics(): {
        models: {
            weather: any;
            crop: any;
            alert: any;
        };
        predictions: any[];
        systemStatus: string;
    };
    /**
     * Train models with new data
     */
    trainModels(historicalData: WeatherData[][]): Promise<void>;
    /**
     * Clean up resources
     */
    shutdown(): Promise<void>;
    /**
     * Private helper methods
     */
    private generateInsightsSummary;
    private storePrediction;
    private convertToWeatherData;
    private createMLTables;
    private startBackgroundTasks;
    private updatePredictionsForAllCities;
    private retrainModelsWithLatestData;
}
export {};
//# sourceMappingURL=ml-service.d.ts.map