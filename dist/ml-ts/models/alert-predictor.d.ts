/**
 * Advanced Alert Prediction System using Ensemble Methods
 */
import { WeatherData, WeatherPrediction, AlertPrediction, AlertRiskAssessment, ModelPredictionResult, MLModel, ModelEvaluation, ModelMetrics } from '../types';
/**
 * Ensemble Alert Prediction Model
 */
export declare class EnsembleAlertPredictor implements MLModel<WeatherData, AlertPrediction[]> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy: number;
    private thresholds;
    private weights;
    private metrics;
    constructor();
    initialize(): Promise<void>;
    train(data: WeatherData[]): Promise<void>;
    predict(input: WeatherData): Promise<AlertPrediction[]>;
    evaluate(testData: WeatherData[], expectedOutput: AlertPrediction[][]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
    private initializeThresholds;
    private predictAlertType;
    private calculateDroughtScore;
    private calculateDuration;
    private getRecommendedActions;
}
/**
 * Alert Prediction Service
 */
export declare class AlertPredictionService {
    private predictor;
    constructor();
    initialize(): Promise<void>;
    predictAlerts(weatherData: WeatherData, forecastData?: WeatherPrediction[]): Promise<ModelPredictionResult<AlertPrediction>>;
    assessRisk(cityName: string): Promise<AlertRiskAssessment>;
    private predictFromForecast;
}
//# sourceMappingURL=alert-predictor.d.ts.map