/**
 * Advanced Weather Prediction Model using Multiple ML Algorithms
 * Implements ARIMA, Linear Regression, Neural Networks, and Ensemble Methods
 */
import { WeatherData, WeatherPrediction, ModelPredictionResult, MLModel, ModelEvaluation, ModelMetrics } from '../types';
/**
 * ARIMA Model Implementation for Time Series Forecasting
 */
export declare class ARIMAModel implements MLModel<number[], number[]> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy: number;
    private p;
    private d;
    private q;
    private arCoefficients;
    private maCoefficients;
    private residuals;
    private metrics;
    constructor(p?: number, d?: number, q?: number);
    initialize(): Promise<void>;
    train(data: number[][]): Promise<void>;
    predict(input: number[]): Promise<number[]>;
    evaluate(testData: number[][], expectedOutput: number[][]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
    private difference;
    private estimateParameters;
    private leastSquares;
}
/**
 * Neural Network Model for Weather Prediction
 */
export declare class NeuralNetworkModel implements MLModel<number[], number[]> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy: number;
    private inputSize;
    private hiddenSize;
    private outputSize;
    private weightsInputHidden;
    private weightsHiddenOutput;
    private biasHidden;
    private biasOutput;
    private learningRate;
    private epochs;
    private scaler;
    private metrics;
    constructor(hiddenSize?: number, learningRate?: number);
    initialize(): Promise<void>;
    train(data: number[][]): Promise<void>;
    predict(input: number[]): Promise<number[]>;
    evaluate(testData: number[][], expectedOutput: number[][]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
    private initializeWeights;
    private forward;
    private backward;
    private prepareTrainingData;
    private createFeatures;
}
/**
 * Advanced Weather Prediction Service using Ensemble Methods
 */
export declare class AdvancedWeatherPredictor implements MLModel<WeatherData[], WeatherPrediction[]> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy: number;
    private models;
    weights: number[];
    votingStrategy: 'majority' | 'weighted' | 'average';
    private arimaModel;
    private neuralNetModel;
    private tempScaler;
    private humidityScaler;
    private rainfallScaler;
    constructor();
    initialize(): Promise<void>;
    train(data: WeatherData[][]): Promise<void>;
    predict(input: WeatherData[]): Promise<WeatherPrediction[]>;
    evaluate(testData: WeatherData[][], expectedOutput: WeatherPrediction[][]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
    addModel(model: MLModel<number[], number[]>, weight?: number): void;
    removeModel(modelName: string): void;
    updateWeights(weights: number[]): void;
    private ensemblePrediction;
    private predictSecondaryParameter;
    private calculatePredictionConfidence;
    private fallbackPrediction;
    private getDateOffset;
    private normalizeWeights;
}
/**
 * Weather Prediction Service with enhanced forecasting capabilities
 */
export declare class WeatherPredictionService {
    private predictor;
    private performanceMonitor;
    constructor();
    initialize(): Promise<void>;
    predictWeather(cityName: string, days?: number, currentWeather?: WeatherData): Promise<ModelPredictionResult<WeatherPrediction>>;
    trainModel(historicalData: WeatherData[][]): Promise<void>;
    getModelMetrics(): ModelMetrics;
    private generateMockHistoricalData;
}
//# sourceMappingURL=weather-predictor.d.ts.map