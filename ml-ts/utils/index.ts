/**
 * Utility functions for ML operations
 */

import { Matrix } from 'ml-matrix';
import * as _ from 'lodash';
import { 
  WeatherData, 
  FeatureVector, 
  FeatureScaler, 
  TimeSeriesData, 
  TimeSeriesPoint,
  ValidationResult 
} from '../types';

/**
 * Standard scaler for feature normalization
 */
export class StandardScaler implements FeatureScaler {
  private means: number[] = [];
  private stds: number[] = [];
  private fitted = false;

  fit(data: number[][]): void {
    if (data.length === 0) {
      throw new Error('Cannot fit scaler on empty data');
    }

    const matrix = new Matrix(data);
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

  transform(data: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before transform');
    }

    return data.map(row => 
      row.map((value, index) => (value - this.means[index]) / this.stds[index])
    );
  }

  inverseTransform(data: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before inverse transform');
    }

    return data.map(row => 
      row.map((value, index) => (value * this.stds[index]) + this.means[index])
    );
  }

  getParams(): Record<string, number> {
    return {
      numFeatures: this.means.length,
      fitted: this.fitted ? 1 : 0
    };
  }

  private calculateStd(values: number[], mean: number): number {
    const variance = _.mean(values.map(val => Math.pow(val - mean, 2)));
    return Math.sqrt(variance);
  }
}

/**
 * Min-Max scaler for feature normalization
 */
export class MinMaxScaler implements FeatureScaler {
  private mins: number[] = [];
  private maxs: number[] = [];
  private ranges: number[] = [];
  private fitted = false;

  fit(data: number[][]): void {
    if (data.length === 0) {
      throw new Error('Cannot fit scaler on empty data');
    }

    const matrix = new Matrix(data);
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

  transform(data: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before transform');
    }

    return data.map(row => 
      row.map((value, index) => (value - this.mins[index]) / this.ranges[index])
    );
  }

  inverseTransform(data: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before inverse transform');
    }

    return data.map(row => 
      row.map((value, index) => (value * this.ranges[index]) + this.mins[index])
    );
  }

  getParams(): Record<string, number> {
    return {
      numFeatures: this.mins.length,
      fitted: this.fitted ? 1 : 0
    };
  }
}

/**
 * Feature engineering utilities
 */
export class FeatureEngineering {
  /**
   * Extract features from weather data
   */
  static extractWeatherFeatures(weatherData: WeatherData[]): FeatureVector {
    const features: number[] = [];
    const labels: string[] = [];

    weatherData.forEach((data, index) => {
      // Basic features
      features.push(
        data.temperature,
        data.humidity,
        data.rainfall,
        data.pressure,
        data.windSpeed || 0,
        data.uvIndex || 0,
        data.cloudCover || 0
      );

      if (index === 0) {
        labels.push(
          'temperature',
          'humidity', 
          'rainfall',
          'pressure',
          'windSpeed',
          'uvIndex',
          'cloudCover'
        );
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
  static createPolynomialFeatures(features: number[], degree: number = 2): number[] {
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
  static createLagFeatures(data: number[], lags: number[]): number[][] {
    const lagFeatures: number[][] = [];

    for (let i = Math.max(...lags); i < data.length; i++) {
      const features: number[] = [data[i]]; // Current value

      for (const lag of lags) {
        if (i - lag >= 0) {
          features.push(data[i - lag]);
        } else {
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
  static createMovingAverageFeatures(data: number[], windows: number[]): number[][] {
    const maFeatures: number[][] = [];

    for (let i = Math.max(...windows) - 1; i < data.length; i++) {
      const features: number[] = [data[i]]; // Current value

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

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

/**
 * Time series analysis utilities
 */
export class TimeSeriesUtils {
  /**
   * Decompose time series into trend, seasonal, and residual components
   */
  static decompose(data: TimeSeriesData): {
    trend: number[];
    seasonal: number[];
    residual: number[];
  } {
    const values = data.series.map(point => point.value);
    const seasonLength = data.seasonality || 12;

    // Calculate trend using moving average
    const trend = this.movingAverage(values, seasonLength);

    // Calculate seasonal component
    const seasonal = this.calculateSeasonal(values, trend, seasonLength);

    // Calculate residual
    const residual = values.map((value, index) => 
      value - (trend[index] || 0) - (seasonal[index] || 0)
    );

    return { trend, seasonal, residual };
  }

  /**
   * Detect anomalies in time series data
   */
  static detectAnomalies(data: number[], threshold: number = 2): number[] {
    const mean = _.mean(data);
    const std = Math.sqrt(_.mean(data.map(val => Math.pow(val - mean, 2))));
    const anomalies: number[] = [];

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
  static autocorrelation(data: number[], maxLag: number = 10): number[] {
    const n = data.length;
    const mean = _.mean(data);
    const correlations: number[] = [];

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

  private static movingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    const halfWindow = Math.floor(window / 2);

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);
      const subset = data.slice(start, end);
      result.push(_.mean(subset));
    }

    return result;
  }

  private static calculateSeasonal(values: number[], trend: number[], seasonLength: number): number[] {
    const seasonal: number[] = new Array(values.length).fill(0);
    const seasonalAverages: number[] = new Array(seasonLength).fill(0);
    const seasonalCounts: number[] = new Array(seasonLength).fill(0);

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

/**
 * Mathematical utilities
 */
export class MathUtils {
  /**
   * Calculate mean squared error
   */
  static mse(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length) {
      throw new Error('Arrays must have the same length');
    }

    const squaredErrors = predicted.map((pred, index) => 
      Math.pow(pred - actual[index], 2)
    );

    return _.mean(squaredErrors);
  }

  /**
   * Calculate mean absolute error
   */
  static mae(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length) {
      throw new Error('Arrays must have the same length');
    }

    const absoluteErrors = predicted.map((pred, index) => 
      Math.abs(pred - actual[index])
    );

    return _.mean(absoluteErrors);
  }

  /**
   * Calculate R-squared
   */
  static rSquared(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length) {
      throw new Error('Arrays must have the same length');
    }

    const actualMean = _.mean(actual);
    const totalSumSquares = _.sum(actual.map(val => Math.pow(val - actualMean, 2)));
    const residualSumSquares = _.sum(predicted.map((pred, index) => 
      Math.pow(actual[index] - pred, 2)
    ));

    if (totalSumSquares === 0) return 1;
    return 1 - (residualSumSquares / totalSumSquares);
  }

  /**
   * Calculate correlation coefficient
   */
  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }

    const n = x.length;
    const meanX = _.mean(x);
    const meanY = _.mean(y);

    const numerator = _.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    const denominatorX = Math.sqrt(_.sum(x.map(xi => Math.pow(xi - meanX, 2))));
    const denominatorY = Math.sqrt(_.sum(y.map(yi => Math.pow(yi - meanY, 2))));

    if (denominatorX === 0 || denominatorY === 0) return 0;
    return numerator / (denominatorX * denominatorY);
  }

  /**
   * Sigmoid activation function
   */
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * ReLU activation function
   */
  static relu(x: number): number {
    return Math.max(0, x);
  }

  /**
   * Softmax function
   */
  static softmax(values: number[]): number[] {
    const maxVal = Math.max(...values);
    const exps = values.map(val => Math.exp(val - maxVal));
    const sumExps = _.sum(exps);
    return exps.map(exp => exp / sumExps);
  }
}

/**
 * Data validation utilities
 */
export class ValidationUtils {
  /**
   * Validate weather data
   */
  static validateWeatherData(data: WeatherData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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
  static validateFeatureVector(features: FeatureVector): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static startMeasurement(name: string): void {
    this.measurements.set(name, Date.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      throw new Error(`No measurement started for ${name}`);
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(name);
    return duration;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.startMeasurement(name);
    const result = await fn();
    const duration = this.endMeasurement(name);
    return { result, duration };
  }
}

// All classes are already exported above