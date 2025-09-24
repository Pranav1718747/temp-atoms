"use strict";
/**
 * Utility functions for ML operations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = exports.ValidationUtils = exports.MathUtils = exports.TimeSeriesUtils = exports.FeatureEngineering = exports.MinMaxScaler = exports.StandardScaler = void 0;
const ml_matrix_1 = require("ml-matrix");
const _ = __importStar(require("lodash"));
/**
 * Standard scaler for feature normalization
 */
class StandardScaler {
    constructor() {
        this.means = [];
        this.stds = [];
        this.fitted = false;
    }
    fit(data) {
        if (data.length === 0) {
            throw new Error('Cannot fit scaler on empty data');
        }
        const matrix = new ml_matrix_1.Matrix(data);
        this.means = [];
        this.stds = [];
        for (let col = 0; col < matrix.columns; col++) {
            const column = matrix.getColumn(col);
            const mean = _.mean(column);
            const std = this.calculateStd(column, mean);
            this.means.push(mean);
            this.stds.push(std || 1); // Avoid division by zero
        }
        this.fitted = true;
    }
    transform(data) {
        if (!this.fitted) {
            throw new Error('Scaler must be fitted before transform');
        }
        return data.map(row => row.map((value, index) => (value - this.means[index]) / this.stds[index]));
    }
    inverseTransform(data) {
        if (!this.fitted) {
            throw new Error('Scaler must be fitted before inverse transform');
        }
        return data.map(row => row.map((value, index) => (value * this.stds[index]) + this.means[index]));
    }
    getParams() {
        return {
            numFeatures: this.means.length,
            fitted: this.fitted ? 1 : 0
        };
    }
    calculateStd(values, mean) {
        const variance = _.mean(values.map(val => Math.pow(val - mean, 2)));
        return Math.sqrt(variance);
    }
}
exports.StandardScaler = StandardScaler;
/**
 * Min-Max scaler for feature normalization
 */
class MinMaxScaler {
    constructor() {
        this.mins = [];
        this.maxs = [];
        this.ranges = [];
        this.fitted = false;
    }
    fit(data) {
        if (data.length === 0) {
            throw new Error('Cannot fit scaler on empty data');
        }
        const matrix = new ml_matrix_1.Matrix(data);
        this.mins = [];
        this.maxs = [];
        this.ranges = [];
        for (let col = 0; col < matrix.columns; col++) {
            const column = matrix.getColumn(col);
            const min = Math.min(...column);
            const max = Math.max(...column);
            const range = max - min || 1; // Avoid division by zero
            this.mins.push(min);
            this.maxs.push(max);
            this.ranges.push(range);
        }
        this.fitted = true;
    }
    transform(data) {
        if (!this.fitted) {
            throw new Error('Scaler must be fitted before transform');
        }
        return data.map(row => row.map((value, index) => (value - this.mins[index]) / this.ranges[index]));
    }
    inverseTransform(data) {
        if (!this.fitted) {
            throw new Error('Scaler must be fitted before inverse transform');
        }
        return data.map(row => row.map((value, index) => (value * this.ranges[index]) + this.mins[index]));
    }
    getParams() {
        return {
            numFeatures: this.mins.length,
            fitted: this.fitted ? 1 : 0
        };
    }
}
exports.MinMaxScaler = MinMaxScaler;
/**
 * Feature engineering utilities
 */
class FeatureEngineering {
    /**
     * Extract features from weather data
     */
    static extractWeatherFeatures(weatherData) {
        const features = [];
        const labels = [];
        weatherData.forEach((data, index) => {
            // Basic features
            features.push(data.temperature, data.humidity, data.rainfall, data.pressure, data.windSpeed || 0, data.uvIndex || 0, data.cloudCover || 0);
            if (index === 0) {
                labels.push('temperature', 'humidity', 'rainfall', 'pressure', 'windSpeed', 'uvIndex', 'cloudCover');
            }
            // Derived features
            if (index < weatherData.length - 1) {
                const tempDiff = weatherData[index + 1].temperature - data.temperature;
                const humidityDiff = weatherData[index + 1].humidity - data.humidity;
                const pressureDiff = weatherData[index + 1].pressure - data.pressure;
                features.push(tempDiff, humidityDiff, pressureDiff);
                if (index === 0) {
                    labels.push('tempDiff', 'humidityDiff', 'pressureDiff');
                }
            }
            // Seasonal features
            const date = new Date(data.recordedAt);
            const dayOfYear = this.getDayOfYear(date);
            const seasonalTemp = Math.sin(2 * Math.PI * dayOfYear / 365.25);
            const seasonalHumidity = Math.cos(2 * Math.PI * dayOfYear / 365.25);
            features.push(seasonalTemp, seasonalHumidity);
            if (index === 0) {
                labels.push('seasonalTemp', 'seasonalHumidity');
            }
        });
        return { features, labels };
    }
    /**
     * Create polynomial features
     */
    static createPolynomialFeatures(features, degree = 2) {
        const polyFeatures = [...features];
        if (degree >= 2) {
            // Add quadratic terms
            for (let i = 0; i < features.length; i++) {
                polyFeatures.push(features[i] * features[i]);
            }
            // Add interaction terms
            for (let i = 0; i < features.length; i++) {
                for (let j = i + 1; j < features.length; j++) {
                    polyFeatures.push(features[i] * features[j]);
                }
            }
        }
        if (degree >= 3) {
            // Add cubic terms
            for (let i = 0; i < features.length; i++) {
                polyFeatures.push(features[i] * features[i] * features[i]);
            }
        }
        return polyFeatures;
    }
    /**
     * Create lag features for time series
     */
    static createLagFeatures(data, lags) {
        const lagFeatures = [];
        for (let i = Math.max(...lags); i < data.length; i++) {
            const features = [data[i]]; // Current value
            for (const lag of lags) {
                if (i - lag >= 0) {
                    features.push(data[i - lag]);
                }
                else {
                    features.push(0); // Pad with zeros for missing lags
                }
            }
            lagFeatures.push(features);
        }
        return lagFeatures;
    }
    /**
     * Create moving average features
     */
    static createMovingAverageFeatures(data, windows) {
        const maFeatures = [];
        for (let i = Math.max(...windows) - 1; i < data.length; i++) {
            const features = [data[i]]; // Current value
            for (const window of windows) {
                const start = Math.max(0, i - window + 1);
                const windowData = data.slice(start, i + 1);
                const ma = _.mean(windowData);
                features.push(ma);
            }
            maFeatures.push(features);
        }
        return maFeatures;
    }
    static getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
}
exports.FeatureEngineering = FeatureEngineering;
/**
 * Time series analysis utilities
 */
class TimeSeriesUtils {
    /**
     * Decompose time series into trend, seasonal, and residual components
     */
    static decompose(data) {
        const values = data.series.map(point => point.value);
        const seasonLength = data.seasonality || 12;
        // Calculate trend using moving average
        const trend = this.movingAverage(values, seasonLength);
        // Calculate seasonal component
        const seasonal = this.calculateSeasonal(values, trend, seasonLength);
        // Calculate residual
        const residual = values.map((value, index) => value - (trend[index] || 0) - (seasonal[index] || 0));
        return { trend, seasonal, residual };
    }
    /**
     * Detect anomalies in time series data
     */
    static detectAnomalies(data, threshold = 2) {
        const mean = _.mean(data);
        const std = Math.sqrt(_.mean(data.map(val => Math.pow(val - mean, 2))));
        const anomalies = [];
        data.forEach((value, index) => {
            const zScore = Math.abs((value - mean) / std);
            if (zScore > threshold) {
                anomalies.push(index);
            }
        });
        return anomalies;
    }
    /**
     * Calculate autocorrelation
     */
    static autocorrelation(data, maxLag = 10) {
        const n = data.length;
        const mean = _.mean(data);
        const correlations = [];
        for (let lag = 0; lag <= maxLag; lag++) {
            let numerator = 0;
            let denominator = 0;
            for (let i = 0; i < n - lag; i++) {
                numerator += (data[i] - mean) * (data[i + lag] - mean);
            }
            for (let i = 0; i < n; i++) {
                denominator += Math.pow(data[i] - mean, 2);
            }
            correlations.push(denominator === 0 ? 0 : numerator / denominator);
        }
        return correlations;
    }
    static movingAverage(data, window) {
        const result = [];
        const halfWindow = Math.floor(window / 2);
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - halfWindow);
            const end = Math.min(data.length, i + halfWindow + 1);
            const subset = data.slice(start, end);
            result.push(_.mean(subset));
        }
        return result;
    }
    static calculateSeasonal(values, trend, seasonLength) {
        const seasonal = new Array(values.length).fill(0);
        const seasonalAverages = new Array(seasonLength).fill(0);
        const seasonalCounts = new Array(seasonLength).fill(0);
        // Calculate average for each seasonal position
        for (let i = 0; i < values.length; i++) {
            const seasonIndex = i % seasonLength;
            const detrended = values[i] - (trend[i] || 0);
            seasonalAverages[seasonIndex] += detrended;
            seasonalCounts[seasonIndex]++;
        }
        // Normalize averages
        for (let i = 0; i < seasonLength; i++) {
            if (seasonalCounts[i] > 0) {
                seasonalAverages[i] /= seasonalCounts[i];
            }
        }
        // Apply seasonal pattern
        for (let i = 0; i < values.length; i++) {
            seasonal[i] = seasonalAverages[i % seasonLength];
        }
        return seasonal;
    }
}
exports.TimeSeriesUtils = TimeSeriesUtils;
/**
 * Mathematical utilities
 */
class MathUtils {
    /**
     * Calculate mean squared error
     */
    static mse(predicted, actual) {
        if (predicted.length !== actual.length) {
            throw new Error('Arrays must have the same length');
        }
        const squaredErrors = predicted.map((pred, index) => Math.pow(pred - actual[index], 2));
        return _.mean(squaredErrors);
    }
    /**
     * Calculate mean absolute error
     */
    static mae(predicted, actual) {
        if (predicted.length !== actual.length) {
            throw new Error('Arrays must have the same length');
        }
        const absoluteErrors = predicted.map((pred, index) => Math.abs(pred - actual[index]));
        return _.mean(absoluteErrors);
    }
    /**
     * Calculate R-squared
     */
    static rSquared(predicted, actual) {
        if (predicted.length !== actual.length) {
            throw new Error('Arrays must have the same length');
        }
        const actualMean = _.mean(actual);
        const totalSumSquares = _.sum(actual.map(val => Math.pow(val - actualMean, 2)));
        const residualSumSquares = _.sum(predicted.map((pred, index) => Math.pow(actual[index] - pred, 2)));
        if (totalSumSquares === 0)
            return 1;
        return 1 - (residualSumSquares / totalSumSquares);
    }
    /**
     * Calculate correlation coefficient
     */
    static correlation(x, y) {
        if (x.length !== y.length) {
            throw new Error('Arrays must have the same length');
        }
        const n = x.length;
        const meanX = _.mean(x);
        const meanY = _.mean(y);
        const numerator = _.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
        const denominatorX = Math.sqrt(_.sum(x.map(xi => Math.pow(xi - meanX, 2))));
        const denominatorY = Math.sqrt(_.sum(y.map(yi => Math.pow(yi - meanY, 2))));
        if (denominatorX === 0 || denominatorY === 0)
            return 0;
        return numerator / (denominatorX * denominatorY);
    }
    /**
     * Sigmoid activation function
     */
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    /**
     * ReLU activation function
     */
    static relu(x) {
        return Math.max(0, x);
    }
    /**
     * Softmax function
     */
    static softmax(values) {
        const maxVal = Math.max(...values);
        const exps = values.map(val => Math.exp(val - maxVal));
        const sumExps = _.sum(exps);
        return exps.map(exp => exp / sumExps);
    }
}
exports.MathUtils = MathUtils;
/**
 * Data validation utilities
 */
class ValidationUtils {
    /**
     * Validate weather data
     */
    static validateWeatherData(data) {
        const errors = [];
        const warnings = [];
        // Temperature validation
        if (data.temperature < -50 || data.temperature > 60) {
            errors.push(`Temperature ${data.temperature}°C is outside valid range (-50 to 60)`);
        }
        // Humidity validation
        if (data.humidity < 0 || data.humidity > 100) {
            errors.push(`Humidity ${data.humidity}% is outside valid range (0 to 100)`);
        }
        // Rainfall validation
        if (data.rainfall < 0) {
            errors.push(`Rainfall ${data.rainfall}mm cannot be negative`);
        }
        if (data.rainfall > 500) {
            warnings.push(`Rainfall ${data.rainfall}mm is unusually high`);
        }
        // Pressure validation
        if (data.pressure < 800 || data.pressure > 1200) {
            errors.push(`Pressure ${data.pressure}hPa is outside valid range (800 to 1200)`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate feature vector
     */
    static validateFeatureVector(features) {
        const errors = [];
        const warnings = [];
        if (!features.features || features.features.length === 0) {
            errors.push('Feature vector cannot be empty');
        }
        if (features.labels && features.labels.length !== features.features.length) {
            warnings.push('Feature and label arrays have different lengths');
        }
        // Check for NaN or Infinity values
        const invalidIndices = features.features
            .map((val, index) => ({ val, index }))
            .filter(({ val }) => !isFinite(val))
            .map(({ index }) => index);
        if (invalidIndices.length > 0) {
            errors.push(`Invalid values found at indices: ${invalidIndices.join(', ')}`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.ValidationUtils = ValidationUtils;
/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
    static startMeasurement(name) {
        this.measurements.set(name, Date.now());
    }
    static endMeasurement(name) {
        const startTime = this.measurements.get(name);
        if (!startTime) {
            throw new Error(`No measurement started for ${name}`);
        }
        const duration = Date.now() - startTime;
        this.measurements.delete(name);
        return duration;
    }
    static async measureAsync(name, fn) {
        this.startMeasurement(name);
        const result = await fn();
        const duration = this.endMeasurement(name);
        return { result, duration };
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
PerformanceMonitor.measurements = new Map();
// All classes are already exported above
//# sourceMappingURL=index.js.map