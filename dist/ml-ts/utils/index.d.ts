/**
 * Utility functions for ML operations
 */
import { WeatherData, FeatureVector, FeatureScaler, TimeSeriesData, ValidationResult } from '../types';
/**
 * Standard scaler for feature normalization
 */
export declare class StandardScaler implements FeatureScaler {
    private means;
    private stds;
    private fitted;
    fit(data: number[][]): void;
    transform(data: number[][]): number[][];
    inverseTransform(data: number[][]): number[][];
    getParams(): Record<string, number>;
    private calculateStd;
}
/**
 * Min-Max scaler for feature normalization
 */
export declare class MinMaxScaler implements FeatureScaler {
    private mins;
    private maxs;
    private ranges;
    private fitted;
    fit(data: number[][]): void;
    transform(data: number[][]): number[][];
    inverseTransform(data: number[][]): number[][];
    getParams(): Record<string, number>;
}
/**
 * Feature engineering utilities
 */
export declare class FeatureEngineering {
    /**
     * Extract features from weather data
     */
    static extractWeatherFeatures(weatherData: WeatherData[]): FeatureVector;
    /**
     * Create polynomial features
     */
    static createPolynomialFeatures(features: number[], degree?: number): number[];
    /**
     * Create lag features for time series
     */
    static createLagFeatures(data: number[], lags: number[]): number[][];
    /**
     * Create moving average features
     */
    static createMovingAverageFeatures(data: number[], windows: number[]): number[][];
    private static getDayOfYear;
}
/**
 * Time series analysis utilities
 */
export declare class TimeSeriesUtils {
    /**
     * Decompose time series into trend, seasonal, and residual components
     */
    static decompose(data: TimeSeriesData): {
        trend: number[];
        seasonal: number[];
        residual: number[];
    };
    /**
     * Detect anomalies in time series data
     */
    static detectAnomalies(data: number[], threshold?: number): number[];
    /**
     * Calculate autocorrelation
     */
    static autocorrelation(data: number[], maxLag?: number): number[];
    private static movingAverage;
    private static calculateSeasonal;
}
/**
 * Mathematical utilities
 */
export declare class MathUtils {
    /**
     * Calculate mean squared error
     */
    static mse(predicted: number[], actual: number[]): number;
    /**
     * Calculate mean absolute error
     */
    static mae(predicted: number[], actual: number[]): number;
    /**
     * Calculate R-squared
     */
    static rSquared(predicted: number[], actual: number[]): number;
    /**
     * Calculate correlation coefficient
     */
    static correlation(x: number[], y: number[]): number;
    /**
     * Sigmoid activation function
     */
    static sigmoid(x: number): number;
    /**
     * ReLU activation function
     */
    static relu(x: number): number;
    /**
     * Softmax function
     */
    static softmax(values: number[]): number[];
}
/**
 * Data validation utilities
 */
export declare class ValidationUtils {
    /**
     * Validate weather data
     */
    static validateWeatherData(data: WeatherData): ValidationResult;
    /**
     * Validate feature vector
     */
    static validateFeatureVector(features: FeatureVector): ValidationResult;
}
/**
 * Performance monitoring utilities
 */
export declare class PerformanceMonitor {
    private static measurements;
    static startMeasurement(name: string): void;
    static endMeasurement(name: string): number;
    static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<{
        result: T;
        duration: number;
    }>;
}
//# sourceMappingURL=index.d.ts.map