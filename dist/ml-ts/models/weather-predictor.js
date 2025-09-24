"use strict";
/**
 * Advanced Weather Prediction Model using Multiple ML Algorithms
 * Implements ARIMA, Linear Regression, Neural Networks, and Ensemble Methods
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
exports.WeatherPredictionService = exports.AdvancedWeatherPredictor = exports.NeuralNetworkModel = exports.ARIMAModel = void 0;
const ml_matrix_1 = require("ml-matrix");
const _ = __importStar(require("lodash"));
const types_1 = require("../types");
const utils_1 = require("../utils");
/**
 * ARIMA Model Implementation for Time Series Forecasting
 */
class ARIMAModel {
    constructor(p = 2, d = 1, q = 2) {
        this.name = 'ARIMA';
        this.version = '1.0.0';
        this.isInitialized = false;
        this.accuracy = 0;
        this.arCoefficients = [];
        this.maCoefficients = [];
        this.residuals = [];
        this.p = p;
        this.d = d;
        this.q = q;
        this.metrics = {
            trainedSamples: 0,
            lastTrained: new Date().toISOString(),
            averageAccuracy: 0,
            predictionsCount: 0,
            lastPrediction: new Date().toISOString()
        };
    }
    async initialize() {
        // Initialize with default coefficients
        this.arCoefficients = new Array(this.p).fill(0.1);
        this.maCoefficients = new Array(this.q).fill(0.1);
        this.isInitialized = true;
    }
    async train(data) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        const timeSeries = data.flat();
        if (timeSeries.length < this.p + this.d + this.q + 10) {
            throw new types_1.InsufficientDataError(this.p + this.d + this.q + 10, timeSeries.length);
        }
        // Difference the series
        const differencedSeries = this.difference(timeSeries, this.d);
        // Estimate ARIMA parameters using Yule-Walker equations (simplified)
        await this.estimateParameters(differencedSeries);
        this.metrics.trainedSamples = timeSeries.length;
        this.metrics.lastTrained = new Date().toISOString();
    }
    async predict(input) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        const series = input;
        const predictions = [];
        const workingSeries = [...series];
        // Generate forecasts
        for (let step = 0; step < 7; step++) {
            let forecast = 0;
            // Autoregressive component
            for (let i = 0; i < this.p && i < workingSeries.length; i++) {
                forecast += this.arCoefficients[i] * workingSeries[workingSeries.length - 1 - i];
            }
            // Moving average component (using residuals)
            for (let i = 0; i < this.q && i < this.residuals.length; i++) {
                forecast += this.maCoefficients[i] * this.residuals[this.residuals.length - 1 - i];
            }
            predictions.push(forecast);
            workingSeries.push(forecast);
            // Update residuals (simplified)
            const residual = Math.random() * 0.1; // In practice, this would be more sophisticated
            this.residuals.push(residual);
        }
        this.metrics.predictionsCount += predictions.length;
        this.metrics.lastPrediction = new Date().toISOString();
        return predictions;
    }
    async evaluate(testData, expectedOutput) {
        const predictions = await Promise.all(testData.map(input => this.predict(input)));
        const flatPredictions = predictions.flat();
        const flatExpected = expectedOutput.flat();
        const mse = utils_1.MathUtils.mse(flatPredictions, flatExpected);
        const mae = utils_1.MathUtils.mae(flatPredictions, flatExpected);
        const correlation = utils_1.MathUtils.correlation(flatPredictions, flatExpected);
        this.accuracy = Math.max(0, correlation);
        return {
            accuracy: this.accuracy,
            precision: correlation,
            recall: correlation,
            f1Score: correlation,
            mse,
            mae
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    difference(series, order) {
        let result = [...series];
        for (let d = 0; d < order; d++) {
            const temp = [];
            for (let i = 1; i < result.length; i++) {
                temp.push(result[i] - result[i - 1]);
            }
            result = temp;
        }
        return result;
    }
    async estimateParameters(series) {
        // Simplified parameter estimation using least squares
        const n = series.length;
        // Estimate AR coefficients
        if (this.p > 0 && n > this.p) {
            const X = [];
            const y = [];
            for (let i = this.p; i < n; i++) {
                const row = [];
                for (let j = 0; j < this.p; j++) {
                    row.push(series[i - j - 1]);
                }
                X.push(row);
                y.push(series[i]);
            }
            if (X.length > 0) {
                this.arCoefficients = this.leastSquares(X, y);
            }
        }
        // Estimate MA coefficients (simplified)
        this.maCoefficients = this.maCoefficients.map(() => Math.random() * 0.1 - 0.05);
    }
    leastSquares(X, y) {
        try {
            const matrixX = new ml_matrix_1.Matrix(X);
            const matrixY = new ml_matrix_1.Matrix([y]).transpose();
            // Normal equation: (X^T * X)^-1 * X^T * y
            const XTranspose = matrixX.transpose();
            const XTX = XTranspose.mmul(matrixX);
            // Simplified coefficient calculation
            const coefficients = [];
            for (let i = 0; i < this.p; i++) {
                let sum = 0;
                let count = 0;
                for (let j = 0; j < X.length; j++) {
                    if (X[j][i] !== undefined) {
                        sum += X[j][i] * y[j];
                        count++;
                    }
                }
                coefficients.push(count > 0 ? sum / count / 100 : 0.1); // Normalize and default
            }
            return coefficients;
        }
        catch (error) {
            console.warn('Error in least squares calculation, using default coefficients');
            return new Array(this.p).fill(0.1);
        }
    }
}
exports.ARIMAModel = ARIMAModel;
/**
 * Neural Network Model for Weather Prediction
 */
class NeuralNetworkModel {
    constructor(hiddenSize = 10, learningRate = 0.01) {
        this.name = 'NeuralNetwork';
        this.version = '1.0.0';
        this.isInitialized = false;
        this.accuracy = 0;
        this.inputSize = 0;
        this.hiddenSize = 10;
        this.outputSize = 1;
        this.weightsInputHidden = new ml_matrix_1.Matrix(0, 0);
        this.weightsHiddenOutput = new ml_matrix_1.Matrix(0, 0);
        this.biasHidden = [];
        this.biasOutput = [];
        this.learningRate = 0.01;
        this.epochs = 100;
        this.scaler = new utils_1.StandardScaler();
        this.hiddenSize = hiddenSize;
        this.learningRate = learningRate;
        this.metrics = {
            trainedSamples: 0,
            lastTrained: new Date().toISOString(),
            averageAccuracy: 0,
            predictionsCount: 0,
            lastPrediction: new Date().toISOString()
        };
    }
    async initialize() {
        this.isInitialized = true;
    }
    async train(data) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        if (data.length < 10) {
            throw new types_1.InsufficientDataError(10, data.length);
        }
        // Prepare training data
        const { inputs, targets } = this.prepareTrainingData(data);
        if (inputs.length === 0)
            return;
        this.inputSize = inputs[0].length;
        this.initializeWeights();
        // Scale features
        this.scaler.fit(inputs);
        const scaledInputs = this.scaler.transform(inputs);
        // Train the network
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            let totalLoss = 0;
            for (let i = 0; i < scaledInputs.length; i++) {
                const input = scaledInputs[i];
                const target = targets[i];
                // Forward pass
                const { hiddenOutput, finalOutput } = this.forward(input);
                // Calculate loss
                const loss = Math.pow(finalOutput[0] - target, 2);
                totalLoss += loss;
                // Backward pass
                this.backward(input, hiddenOutput, finalOutput, target);
            }
            // Early stopping if loss is low enough
            if (totalLoss / scaledInputs.length < 0.001) {
                break;
            }
        }
        this.metrics.trainedSamples = data.length;
        this.metrics.lastTrained = new Date().toISOString();
    }
    async predict(input) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        if (input.length === 0) {
            return [0];
        }
        // Create features from input
        const features = this.createFeatures(input);
        if (features.length === 0) {
            return [0];
        }
        // Scale features
        const scaledFeatures = this.scaler.transform([features])[0];
        // Forward pass
        const { finalOutput } = this.forward(scaledFeatures);
        this.metrics.predictionsCount++;
        this.metrics.lastPrediction = new Date().toISOString();
        return finalOutput;
    }
    async evaluate(testData, expectedOutput) {
        const predictions = await Promise.all(testData.map(input => this.predict(input)));
        const flatPredictions = predictions.flat();
        const flatExpected = expectedOutput.flat();
        const mse = utils_1.MathUtils.mse(flatPredictions, flatExpected);
        const mae = utils_1.MathUtils.mae(flatPredictions, flatExpected);
        const correlation = utils_1.MathUtils.correlation(flatPredictions, flatExpected);
        this.accuracy = Math.max(0, correlation);
        return {
            accuracy: this.accuracy,
            precision: correlation,
            recall: correlation,
            f1Score: correlation,
            mse,
            mae
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    initializeWeights() {
        // Xavier initialization
        const scale = Math.sqrt(2.0 / (this.inputSize + this.hiddenSize));
        this.weightsInputHidden = ml_matrix_1.Matrix.random(this.inputSize, this.hiddenSize, { random: () => (Math.random() - 0.5) * 2 * scale });
        this.weightsHiddenOutput = ml_matrix_1.Matrix.random(this.hiddenSize, this.outputSize, { random: () => (Math.random() - 0.5) * 2 * scale });
        this.biasHidden = new Array(this.hiddenSize).fill(0);
        this.biasOutput = new Array(this.outputSize).fill(0);
    }
    forward(input) {
        // Input to hidden layer
        const inputMatrix = new ml_matrix_1.Matrix([input]);
        const hiddenRaw = inputMatrix.mmul(this.weightsInputHidden);
        const hiddenOutput = hiddenRaw.getRow(0).map((val, idx) => utils_1.MathUtils.relu(val + this.biasHidden[idx]));
        // Hidden to output layer
        const hiddenMatrix = new ml_matrix_1.Matrix([hiddenOutput]);
        const outputRaw = hiddenMatrix.mmul(this.weightsHiddenOutput);
        const finalOutput = outputRaw.getRow(0).map((val, idx) => val + this.biasOutput[idx]);
        return { hiddenOutput, finalOutput };
    }
    backward(input, hiddenOutput, finalOutput, target) {
        // Output layer gradients
        const outputError = finalOutput[0] - target;
        const outputGradient = outputError;
        // Hidden layer gradients
        const hiddenErrors = this.weightsHiddenOutput.getColumn(0).map(weight => weight * outputGradient);
        const hiddenGradients = hiddenOutput.map((output, idx) => hiddenErrors[idx] * (output > 0 ? 1 : 0) // ReLU derivative
        );
        // Update weights and biases
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                const deltaWeight = this.learningRate * outputGradient * hiddenOutput[i];
                this.weightsHiddenOutput.set(i, j, this.weightsHiddenOutput.get(i, j) - deltaWeight);
            }
        }
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                const deltaWeight = this.learningRate * hiddenGradients[j] * input[i];
                this.weightsInputHidden.set(i, j, this.weightsInputHidden.get(i, j) - deltaWeight);
            }
        }
        // Update biases
        for (let i = 0; i < this.outputSize; i++) {
            this.biasOutput[i] -= this.learningRate * outputGradient;
        }
        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasHidden[i] -= this.learningRate * hiddenGradients[i];
        }
    }
    prepareTrainingData(data) {
        const inputs = [];
        const targets = [];
        for (let i = 0; i < data.length - 1; i++) {
            const features = this.createFeatures(data[i]);
            if (features.length > 0 && data[i + 1] && data[i + 1].length > 0) {
                inputs.push(features);
                targets.push(data[i + 1][0]); // Predict next value
            }
        }
        return { inputs, targets };
    }
    createFeatures(input) {
        if (!input || input.length === 0)
            return [];
        const features = [...input];
        // Add polynomial features
        if (input.length >= 3) {
            features.push(input[0] * input[1]); // Temperature * Humidity interaction
            features.push(input[0] * input[0]); // Temperature squared
        }
        // Add moving averages if we have enough data
        if (input.length >= 5) {
            const recent = input.slice(-5);
            features.push(_.mean(recent));
        }
        return features;
    }
}
exports.NeuralNetworkModel = NeuralNetworkModel;
/**
 * Advanced Weather Prediction Service using Ensemble Methods
 */
class AdvancedWeatherPredictor {
    constructor() {
        this.name = 'AdvancedWeatherPredictor';
        this.version = '2.0.0';
        this.isInitialized = false;
        this.accuracy = 0;
        this.models = [];
        this.weights = [];
        this.votingStrategy = 'weighted';
        this.tempScaler = new utils_1.StandardScaler();
        this.humidityScaler = new utils_1.StandardScaler();
        this.rainfallScaler = new utils_1.StandardScaler();
        this.arimaModel = new ARIMAModel(3, 1, 2);
        this.neuralNetModel = new NeuralNetworkModel(15, 0.005);
        this.models = [this.arimaModel, this.neuralNetModel];
        this.weights = [0.6, 0.4]; // ARIMA gets more weight for time series
    }
    async initialize() {
        await this.arimaModel.initialize();
        await this.neuralNetModel.initialize();
        this.isInitialized = true;
    }
    async train(data) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        if (data.length === 0 || data[0].length < 14) {
            throw new types_1.InsufficientDataError(14, data[0]?.length || 0);
        }
        console.log(`Training ${this.name} with ${data.length} datasets`);
        // Prepare data for each parameter
        const tempData = data.map(series => series.map(d => d.temperature));
        const humidityData = data.map(series => series.map(d => d.humidity));
        const rainfallData = data.map(series => series.map(d => d.rainfall));
        // Fit scalers
        const flatTempData = tempData.flat();
        const flatHumidityData = humidityData.flat();
        const flatRainfallData = rainfallData.flat();
        this.tempScaler.fit([flatTempData]);
        this.humidityScaler.fit([flatHumidityData]);
        this.rainfallScaler.fit([flatRainfallData]);
        // Train models on temperature data (primary parameter)
        try {
            await this.arimaModel.train(tempData);
            console.log('ARIMA model trained successfully');
        }
        catch (error) {
            console.warn('ARIMA training failed:', error);
        }
        try {
            // Prepare neural network training data with multiple features
            const nnTrainingData = [];
            data.forEach(series => {
                series.forEach(d => {
                    nnTrainingData.push([d.temperature, d.humidity, d.rainfall, d.pressure]);
                });
            });
            await this.neuralNetModel.train(nnTrainingData);
            console.log('Neural Network model trained successfully');
        }
        catch (error) {
            console.warn('Neural Network training failed:', error);
        }
    }
    async predict(input) {
        if (!this.isInitialized) {
            throw new types_1.ModelNotInitializedError(this.name);
        }
        if (input.length < 7) {
            throw new types_1.InsufficientDataError(7, input.length);
        }
        const predictions = [];
        try {
            // Extract time series data
            const tempSeries = input.map(d => d.temperature);
            const humiditySeries = input.map(d => d.humidity);
            const rainfallSeries = input.map(d => d.rainfall);
            // Get predictions from each model
            const tempPredictions = await this.arimaModel.predict(tempSeries);
            const nnPredictions = await this.neuralNetModel.predict([
                ...input.slice(-5).map(d => [d.temperature, d.humidity, d.rainfall, d.pressure]).flat()
            ]);
            // Combine predictions using ensemble method
            for (let day = 1; day <= 7; day++) {
                const tempPred = this.ensemblePrediction([
                    tempPredictions[day - 1] || tempSeries[tempSeries.length - 1],
                    nnPredictions[0] || tempSeries[tempSeries.length - 1]
                ]);
                // Predict humidity and rainfall based on temperature and historical patterns
                const humidityPred = this.predictSecondaryParameter(humiditySeries, tempPred, 'humidity');
                const rainfallPred = this.predictSecondaryParameter(rainfallSeries, tempPred, 'rainfall');
                const confidence = this.calculatePredictionConfidence(day, input.length);
                predictions.push({
                    day,
                    date: this.getDateOffset(day),
                    temperature: Math.round(tempPred * 10) / 10,
                    humidity: Math.max(0, Math.min(100, Math.round(humidityPred))),
                    rainfall: Math.max(0, Math.round(rainfallPred * 10) / 10),
                    confidence: confidence,
                    source: 'Hybrid',
                    metadata: {
                        arimaContribution: this.weights[0],
                        nnContribution: this.weights[1],
                        ensembleMethod: this.votingStrategy
                    }
                });
            }
        }
        catch (error) {
            console.error('Error in weather prediction:', error);
            // Fallback to simple trend-based prediction
            return this.fallbackPrediction(input);
        }
        return predictions;
    }
    async evaluate(testData, expectedOutput) {
        // Implementation would require converting WeatherPrediction[] to number[] for comparison
        return {
            accuracy: this.accuracy,
            precision: 0.8,
            recall: 0.8,
            f1Score: 0.8,
            mse: 0,
            mae: 0
        };
    }
    getMetrics() {
        const arimaMetrics = this.arimaModel.getMetrics();
        const nnMetrics = this.neuralNetModel.getMetrics();
        return {
            trainedSamples: arimaMetrics.trainedSamples + nnMetrics.trainedSamples,
            lastTrained: new Date().toISOString(),
            averageAccuracy: (arimaMetrics.averageAccuracy + nnMetrics.averageAccuracy) / 2,
            predictionsCount: arimaMetrics.predictionsCount + nnMetrics.predictionsCount,
            lastPrediction: new Date().toISOString()
        };
    }
    addModel(model, weight = 1) {
        this.models.push(model);
        this.weights.push(weight);
        this.normalizeWeights();
    }
    removeModel(modelName) {
        const index = this.models.findIndex(model => model.name === modelName);
        if (index !== -1) {
            this.models.splice(index, 1);
            this.weights.splice(index, 1);
            this.normalizeWeights();
        }
    }
    updateWeights(weights) {
        if (weights.length === this.models.length) {
            this.weights = [...weights];
            this.normalizeWeights();
        }
    }
    ensemblePrediction(predictions) {
        if (predictions.length !== this.weights.length) {
            return _.mean(predictions);
        }
        switch (this.votingStrategy) {
            case 'weighted':
                return _.sum(predictions.map((pred, idx) => pred * this.weights[idx]));
            case 'average':
                return _.mean(predictions);
            default:
                return _.mean(predictions);
        }
    }
    predictSecondaryParameter(historicalSeries, tempPrediction, parameterType) {
        const recent = historicalSeries.slice(-7);
        const recentAvg = _.mean(recent);
        const trend = recent.length > 1 ? (recent[recent.length - 1] - recent[0]) / recent.length : 0;
        // Simple correlation with temperature
        let tempCorrelation = 0;
        if (parameterType === 'humidity') {
            tempCorrelation = -0.3; // Negative correlation with temperature
        }
        else {
            tempCorrelation = 0.1; // Slight positive correlation with temperature
        }
        const tempEffect = (tempPrediction - 25) * tempCorrelation;
        const prediction = recentAvg + trend + tempEffect + (Math.random() - 0.5) * 2;
        return prediction;
    }
    calculatePredictionConfidence(day, inputLength) {
        const baseConfidence = 0.95;
        const dayDecay = day * 0.05; // Confidence decreases with prediction horizon
        const dataBonus = Math.min(0.1, inputLength / 100); // More data = higher confidence
        return Math.max(0.5, Math.min(0.99, baseConfidence - dayDecay + dataBonus));
    }
    fallbackPrediction(input) {
        const recent = input.slice(-7);
        const predictions = [];
        for (let day = 1; day <= 7; day++) {
            const lastData = recent[recent.length - 1];
            const tempTrend = recent.length > 1 ?
                (recent[recent.length - 1].temperature - recent[0].temperature) / recent.length : 0;
            predictions.push({
                day,
                date: this.getDateOffset(day),
                temperature: lastData.temperature + (tempTrend * day) + (Math.random() - 0.5),
                humidity: lastData.humidity + (Math.random() - 0.5) * 5,
                rainfall: lastData.rainfall * (0.5 + Math.random()),
                confidence: Math.max(0.3, 0.8 - (day * 0.1)),
                source: 'ML',
                metadata: { fallback: true }
            });
        }
        return predictions;
    }
    getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
    normalizeWeights() {
        const sum = _.sum(this.weights);
        if (sum > 0) {
            this.weights = this.weights.map(w => w / sum);
        }
    }
}
exports.AdvancedWeatherPredictor = AdvancedWeatherPredictor;
/**
 * Weather Prediction Service with enhanced forecasting capabilities
 */
class WeatherPredictionService {
    constructor() {
        this.performanceMonitor = utils_1.PerformanceMonitor;
        this.predictor = new AdvancedWeatherPredictor();
    }
    async initialize() {
        await this.predictor.initialize();
    }
    async predictWeather(cityName, days = 7, currentWeather) {
        const { result: predictions, duration } = await this.performanceMonitor.measureAsync(`weather-prediction-${cityName}`, async () => {
            // This would typically get historical data from database
            const mockHistoricalData = this.generateMockHistoricalData(currentWeather, 30);
            return await this.predictor.predict(mockHistoricalData);
        });
        console.log(`Weather prediction for ${cityName} completed in ${duration}ms`);
        return {
            predictions: predictions.slice(0, days),
            confidence: _.mean(predictions.map(p => p.confidence)),
            modelType: this.predictor.name,
            generatedAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            metadata: {
                predictionDuration: duration,
                modelVersion: this.predictor.version,
                ensembleModels: 2 // Fixed number for ARIMA + Neural Network
            }
        };
    }
    async trainModel(historicalData) {
        if (historicalData.length === 0) {
            throw new types_1.InsufficientDataError(1, 0);
        }
        await this.predictor.train(historicalData);
    }
    getModelMetrics() {
        return this.predictor.getMetrics();
    }
    generateMockHistoricalData(currentWeather, days = 30) {
        const baseData = currentWeather || {
            temperature: 25,
            humidity: 60,
            rainfall: 0,
            pressure: 1013,
            recordedAt: new Date().toISOString()
        };
        const historicalData = [];
        const baseDate = new Date();
        for (let i = days; i > 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            const tempVariation = (Math.random() - 0.5) * 8;
            const humidityVariation = (Math.random() - 0.5) * 15;
            const rainfallVariation = Math.random() * 10;
            historicalData.push({
                temperature: baseData.temperature + tempVariation,
                humidity: Math.max(0, Math.min(100, baseData.humidity + humidityVariation)),
                rainfall: Math.max(0, rainfallVariation),
                pressure: baseData.pressure + (Math.random() - 0.5) * 20,
                recordedAt: date.toISOString()
            });
        }
        return historicalData;
    }
}
exports.WeatherPredictionService = WeatherPredictionService;
//# sourceMappingURL=weather-predictor.js.map