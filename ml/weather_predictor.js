/**
 * Weather Prediction ML Model
 * Implements time series forecasting for weather parameters
 */

class WeatherPredictor {
    constructor() {
        this.models = {
            temperature: new TemperatureForecastModel(),
            rainfall: new RainfallPredictionModel(),
            humidity: new HumidityForecastModel()
        };
        this.isInitialized = false;
    }

    /**
     * Initialize all weather prediction models
     */
    async initialize() {
        try {
            await Promise.all([
                this.models.temperature.initialize(),
                this.models.rainfall.initialize(),
                this.models.humidity.initialize()
            ]);
            this.isInitialized = true;
            console.log('Weather prediction models initialized successfully');
        } catch (error) {
            console.error('Error initializing weather models:', error);
            throw error;
        }
    }

    /**
     * Predict weather for the next N days
     * @param {Array} historicalData - Array of weather data points
     * @param {number} days - Number of days to predict
     * @param {Object} currentWeather - Current weather data (can include Open-Meteo forecasts)
     * @returns {Object} Weather predictions
     */
    async predictWeather(historicalData, days = 7, currentWeather = null) {
        if (!this.isInitialized) {
            throw new Error('Weather predictor not initialized');
        }

        try {
            // If we have Open-Meteo forecast data, use it to enhance predictions
            let enhancedPredictions;
            if (currentWeather?.daily_forecast && currentWeather?.hourly_forecast) {
                console.log('Using Open-Meteo forecast data to enhance predictions');
                enhancedPredictions = this.integrateOpenMeteoForecasts(
                    currentWeather, historicalData, days
                );
            } else {
                // Use traditional ML prediction methods
                const predictions = await Promise.all([
                    this.models.temperature.predict(historicalData, days),
                    this.models.rainfall.predict(historicalData, days),
                    this.models.humidity.predict(historicalData, days)
                ]);

                enhancedPredictions = {
                    temperature: predictions[0],
                    rainfall: predictions[1],
                    humidity: predictions[2],
                    confidence: this.calculateOverallConfidence(predictions)
                };
            }

            return {
                ...enhancedPredictions,
                generatedAt: new Date().toISOString(),
                dataSource: currentWeather?.daily_forecast ? 'Open-Meteo + ML' : 'ML Only'
            };
        } catch (error) {
            console.error('Error in weather prediction:', error);
            throw error;
        }
    }

    /**
     * Integrate Open-Meteo forecasts with ML predictions
     */
    integrateOpenMeteoForecasts(currentWeather, historicalData, days) {
        const dailyForecast = currentWeather.daily_forecast || [];
        const hourlyForecast = currentWeather.hourly_forecast || [];
        
        const temperaturePredictions = [];
        const rainfallPredictions = [];
        const humidityPredictions = [];
        
        for (let day = 1; day <= days; day++) {
            const forecastIndex = day - 1;
            
            if (forecastIndex < dailyForecast.length) {
                // Use Open-Meteo data
                const forecast = dailyForecast[forecastIndex];
                
                temperaturePredictions.push({
                    day: day,
                    temperature: (forecast.temp_min + forecast.temp_max) / 2,
                    temp_min: forecast.temp_min,
                    temp_max: forecast.temp_max,
                    confidence: 0.95, // Open-Meteo has high accuracy
                    date: forecast.date,
                    source: 'Open-Meteo'
                });
                
                rainfallPredictions.push({
                    day: day,
                    rainfall: forecast.precipitation,
                    probability: forecast.precipitation > 0 ? 0.8 : 0.2,
                    category: this.categorizePrecipitation(forecast.precipitation),
                    confidence: 0.9,
                    date: forecast.date,
                    source: 'Open-Meteo'
                });
                
                // Estimate humidity from hourly data or use model
                const avgHumidity = this.estimateHumidityFromForecast(
                    hourlyForecast, forecastIndex * 24, 24
                );
                
                humidityPredictions.push({
                    day: day,
                    humidity: avgHumidity,
                    confidence: 0.85,
                    date: forecast.date,
                    source: avgHumidity > 0 ? 'Open-Meteo' : 'ML Estimate'
                });
                
            } else {
                // Use ML predictions for days beyond Open-Meteo forecast
                const tempPred = this.models.temperature.predict(historicalData, 1);
                const rainPred = this.models.rainfall.predict(historicalData, 1);
                const humPred = this.models.humidity.predict(historicalData, 1);
                
                temperaturePredictions.push({
                    day: day,
                    temperature: tempPred.predictions[0]?.temperature || 25,
                    confidence: 0.7,
                    date: this.getDateOffset(day),
                    source: 'ML Prediction'
                });
                
                rainfallPredictions.push({
                    day: day,
                    rainfall: rainPred.predictions[0]?.rainfall || 0,
                    confidence: 0.6,
                    date: this.getDateOffset(day),
                    source: 'ML Prediction'
                });
                
                humidityPredictions.push({
                    day: day,
                    humidity: humPred.predictions[0]?.humidity || 60,
                    confidence: 0.65,
                    date: this.getDateOffset(day),
                    source: 'ML Prediction'
                });
            }
        }
        
        return {
            temperature: {
                predictions: temperaturePredictions,
                confidence: this.calculateAverageConfidence(temperaturePredictions),
                modelType: 'Open-Meteo + ML Hybrid'
            },
            rainfall: {
                predictions: rainfallPredictions,
                confidence: this.calculateAverageConfidence(rainfallPredictions),
                modelType: 'Open-Meteo + ML Hybrid'
            },
            humidity: {
                predictions: humidityPredictions,
                confidence: this.calculateAverageConfidence(humidityPredictions),
                modelType: 'Open-Meteo + ML Hybrid'
            }
        };
    }
    
    /**
     * Categorize precipitation amount
     */
    categorizePrecipitation(amount) {
        if (amount < 1) return 'none';
        if (amount < 5) return 'light';
        if (amount < 15) return 'moderate';
        if (amount < 30) return 'heavy';
        return 'very heavy';
    }
    
    /**
     * Estimate humidity from hourly forecast data
     */
    estimateHumidityFromForecast(hourlyData, startIndex, hours) {
        if (!hourlyData || hourlyData.length === 0) return 0;
        
        let totalHumidity = 0;
        let count = 0;
        
        for (let i = startIndex; i < Math.min(startIndex + hours, hourlyData.length); i++) {
            if (hourlyData[i] && hourlyData[i].humidity != null) {
                totalHumidity += hourlyData[i].humidity;
                count++;
            }
        }
        
        return count > 0 ? Math.round(totalHumidity / count) : 0;
    }
    
    /**
     * Calculate average confidence from predictions
     */
    calculateAverageConfidence(predictions) {
        if (!predictions || predictions.length === 0) return 0;
        
        const totalConfidence = predictions.reduce((sum, pred) => sum + (pred.confidence || 0), 0);
        return totalConfidence / predictions.length;
    }
    
    /**
     * Get date offset
     */
    getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Calculate overall confidence score
     */
    calculateOverallConfidence(predictions) {
        const confidenceScores = predictions.map(p => p.confidence || 0);
        return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    }
}

/**
 * Temperature Forecasting Model using Linear Regression with Seasonality
 */
class TemperatureForecastModel {
    constructor() {
        this.weights = null;
        this.seasonalFactors = {};
        this.isTrained = false;
    }

    async initialize() {
        // Initialize with pre-trained weights or train with default data
        this.weights = {
            trend: 0.1,
            seasonal: 0.3,
            lag1: 0.4,
            lag7: 0.2
        };
        this.seasonalFactors = this.generateSeasonalFactors();
        this.isTrained = true;
    }

    generateSeasonalFactors() {
        const factors = {};
        for (let month = 1; month <= 12; month++) {
            // Simulate seasonal temperature variations
            factors[month] = Math.sin((month - 1) * Math.PI / 6) * 10;
        }
        return factors;
    }

    async predict(historicalData, days) {
        if (!this.isTrained) {
            throw new Error('Temperature model not trained');
        }

        if (!historicalData || historicalData.length === 0) {
            throw new Error('No historical data provided for temperature prediction');
        }

        const predictions = [];
        const lastWeek = historicalData.slice(-7);
        const currentMonth = new Date().getMonth() + 1;
        
        // Get base temperature from recent data
        const baseTemp = lastWeek.length > 0 ? 
            lastWeek.reduce((sum, d) => sum + (d.temperature || 25), 0) / lastWeek.length : 25;

        for (let day = 1; day <= days; day++) {
            const lag1 = day === 1 ? 
                (lastWeek[lastWeek.length - 1]?.temperature || baseTemp) : 
                (predictions[day - 2]?.temperature || baseTemp);
            const lag7 = lastWeek[lastWeek.length - day] ? 
                (lastWeek[lastWeek.length - day].temperature || baseTemp) : lag1;
            
            const seasonalEffect = this.seasonalFactors[currentMonth] || 0;
            const trend = this.weights.trend * day;
            
            let prediction = 
                this.weights.trend * trend +
                this.weights.seasonal * seasonalEffect +
                this.weights.lag1 * lag1 +
                this.weights.lag7 * lag7 +
                this.addNoise();
                
            // Ensure prediction is within reasonable bounds
            prediction = Math.max(-10, Math.min(50, prediction));

            predictions.push({
                day: day,
                temperature: Math.round(prediction * 10) / 10,
                confidence: this.calculateConfidence(day),
                date: this.getDateOffset(day)
            });
        }

        return {
            predictions,
            confidence: 0.85,
            modelType: 'Linear Regression with Seasonality'
        };
    }

    addNoise() {
        return (Math.random() - 0.5) * 2; // Add small random variation
    }

    calculateConfidence(day) {
        return Math.max(0.95 - (day * 0.05), 0.6); // Confidence decreases with distance
    }

    getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}

/**
 * Rainfall Prediction Model using Decision Tree approach
 */
class RainfallPredictionModel {
    constructor() {
        this.decisionTree = null;
        this.isTrained = false;
    }

    async initialize() {
        this.decisionTree = {
            humidity: {
                threshold: 70,
                highBranch: { rainfall: 'high', probability: 0.8 },
                lowBranch: {
                    pressure: {
                        threshold: 1013,
                        highBranch: { rainfall: 'low', probability: 0.7 },
                        lowBranch: { rainfall: 'medium', probability: 0.6 }
                    }
                }
            }
        };
        this.isTrained = true;
    }

    async predict(historicalData, days) {
        if (!this.isTrained) {
            throw new Error('Rainfall model not trained');
        }
        
        if (!historicalData || historicalData.length === 0) {
            throw new Error('No historical data provided for rainfall prediction');
        }

        const predictions = [];
        const recentAvg = this.calculateRecentAverage(historicalData);

        for (let day = 1; day <= days; day++) {
            const prediction = this.predictSingleDay(recentAvg, day);
            predictions.push({
                day: day,
                rainfall: Math.max(0, prediction.rainfall || 0), // Ensure non-negative
                probability: prediction.probability || 0.5,
                category: prediction.category || 'low',
                confidence: this.calculateConfidence(day),
                date: this.getDateOffset(day)
            });
        }

        return {
            predictions,
            confidence: 0.78,
            modelType: 'Decision Tree Classifier'
        };
    }

    calculateRecentAverage(data) {
        const recent = data.slice(-7);
        if (recent.length === 0) {
            return {
                humidity: 60,
                pressure: 1013,
                rainfall: 0
            };
        }
        
        // Filter out null/undefined values and calculate averages
        const validHumidity = recent.filter(d => d.humidity != null).map(d => d.humidity);
        const validPressure = recent.filter(d => d.pressure != null).map(d => d.pressure);
        const validRainfall = recent.filter(d => d.rainfall != null).map(d => d.rainfall);
        
        return {
            humidity: validHumidity.length > 0 ? 
                validHumidity.reduce((sum, h) => sum + h, 0) / validHumidity.length : 60,
            pressure: validPressure.length > 0 ? 
                validPressure.reduce((sum, p) => sum + p, 0) / validPressure.length : 1013,
            rainfall: validRainfall.length > 0 ? 
                validRainfall.reduce((sum, r) => sum + r, 0) / validRainfall.length : 0
        };
    }

    predictSingleDay(avgData, day) {
        const humidity = avgData.humidity + (Math.random() - 0.5) * 10;
        const pressure = avgData.pressure + (Math.random() - 0.5) * 20;

        let category, probability, rainfall;

        if (humidity > this.decisionTree.humidity.threshold) {
            category = 'high';
            probability = this.decisionTree.humidity.highBranch.probability;
            rainfall = Math.random() * 20 + 10; // 10-30mm
        } else if (pressure > this.decisionTree.humidity.lowBranch.pressure.threshold) {
            category = 'low';
            probability = this.decisionTree.humidity.lowBranch.pressure.highBranch.probability;
            rainfall = Math.random() * 5; // 0-5mm
        } else {
            category = 'medium';
            probability = this.decisionTree.humidity.lowBranch.pressure.lowBranch.probability;
            rainfall = Math.random() * 15 + 2; // 2-17mm
        }

        return {
            rainfall: Math.round(rainfall * 10) / 10,
            probability: probability,
            category: category
        };
    }

    calculateConfidence(day) {
        return Math.max(0.9 - (day * 0.08), 0.5);
    }

    getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}

/**
 * Humidity Forecasting Model using Moving Average with trend
 */
class HumidityForecastModel {
    constructor() {
        this.windowSize = 7;
        this.trendWeight = 0.3;
        this.isTrained = false;
    }

    async initialize() {
        this.isTrained = true;
    }

    async predict(historicalData, days) {
        if (!this.isTrained) {
            throw new Error('Humidity model not trained');
        }
        
        if (!historicalData || historicalData.length === 0) {
            throw new Error('No historical data provided for humidity prediction');
        }

        const predictions = [];
        const recentData = historicalData.slice(-this.windowSize);
        const trend = this.calculateTrend(recentData);

        for (let day = 1; day <= days; day++) {
            const baseHumidity = this.calculateMovingAverage(recentData);
            const trendEffect = trend * day * this.trendWeight;
            const seasonalEffect = this.getSeasonalEffect();
            
            let prediction = baseHumidity + trendEffect + seasonalEffect + this.addNoise();
            
            // Ensure humidity stays within valid range (0-100)
            prediction = Math.min(Math.max(Math.round(prediction), 0), 100);
            
            predictions.push({
                day: day,
                humidity: prediction,
                confidence: this.calculateConfidence(day),
                date: this.getDateOffset(day)
            });
        }

        return {
            predictions,
            confidence: 0.82,
            modelType: 'Moving Average with Trend'
        };
    }

    calculateMovingAverage(data) {
        if (!data || data.length === 0) {
            return 60; // Default humidity value
        }
        
        const validData = data.filter(d => d.humidity != null && !isNaN(d.humidity));
        if (validData.length === 0) {
            return 60; // Default humidity value
        }
        
        return validData.reduce((sum, d) => sum + d.humidity, 0) / validData.length;
    }

    calculateTrend(data) {
        if (!data || data.length < 2) return 0;
        
        const validData = data.filter(d => d.humidity != null && !isNaN(d.humidity));
        if (validData.length < 2) return 0;
        
        const first = validData.slice(0, Math.floor(validData.length / 2));
        const second = validData.slice(Math.floor(validData.length / 2));
        
        if (first.length === 0 || second.length === 0) return 0;
        
        const firstAvg = first.reduce((sum, d) => sum + d.humidity, 0) / first.length;
        const secondAvg = second.reduce((sum, d) => sum + d.humidity, 0) / second.length;
        
        return secondAvg - firstAvg;
    }

    getSeasonalEffect() {
        const month = new Date().getMonth() + 1;
        // Higher humidity in monsoon months (June-September)
        if (month >= 6 && month <= 9) {
            return Math.random() * 10 + 5;
        }
        return Math.random() * 5 - 2.5;
    }

    addNoise() {
        return (Math.random() - 0.5) * 5;
    }

    calculateConfidence(day) {
        return Math.max(0.92 - (day * 0.06), 0.6);
    }

    getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}

module.exports = WeatherPredictor;