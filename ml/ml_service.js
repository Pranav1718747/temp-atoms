/**
 * Machine Learning Service
 * Centralized service for all ML models and predictions
 */

const WeatherPredictor = require('./weather_predictor');
const CropRecommendationModel = require('./crop_recommendation');
const AlertPredictor = require('./alert_predictor');

class MLService {
    constructor(climateDB, climateAPI = null) {
        this.climateDB = climateDB;
        this.climateAPI = climateAPI; // Add Open-Meteo API access
        this.weatherPredictor = new WeatherPredictor();
        this.cropRecommendation = new CropRecommendationModel();
        this.alertPredictor = new AlertPredictor();
        this.isInitialized = false;
    }

    /**
     * Initialize all ML models
     */
    async initialize() {
        try {
            console.log('Initializing ML Service...');
            
            // Create ML database tables first
            this.createMLTable();
            
            await Promise.all([
                this.weatherPredictor.initialize(),
                this.cropRecommendation.initialize(),
                this.alertPredictor.initialize()
            ]);

            this.isInitialized = true;
            console.log('✅ ML Service initialized successfully');
            
            // Start background prediction tasks
            this.startBackgroundTasks();
            
        } catch (error) {
            console.error('❌ Error initializing ML Service:', error);
            throw error;
        }
    }

    /**
     * Get weather predictions enhanced with Open-Meteo data
     * @param {string} cityName - Name of the city
     * @param {number} days - Number of days to predict
     * @param {Object} currentWeather - Current weather data from Open-Meteo
     * @returns {Object} Enhanced weather predictions
     */
    async getWeatherPredictionsEnhanced(cityName, days = 7, currentWeather = null) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            // Get historical weather data
            let historicalData = this.climateDB.getWeatherHistory(cityName, 30);
            
            if (historicalData.length === 0 && currentWeather) {
                // Create mock historical data from current weather
                historicalData = this.createMockHistoricalData({
                    temperature: currentWeather.main.temp,
                    humidity: currentWeather.main.humidity,
                    rainfall: currentWeather.rain['1h'] || 0,
                    pressure: currentWeather.main.pressure
                }, 7);
            }

            // Use enhanced prediction with Open-Meteo data
            const predictions = await this.weatherPredictor.predictWeather(
                historicalData, 
                days, 
                currentWeather
            );
            
            // Store predictions in database
            this.storePredictions(cityName, predictions, 'weather');
            
            return {
                success: true,
                city: cityName,
                predictions,
                enhanced: true,
                basedOnDays: historicalData.length,
                openMeteoIntegration: !!currentWeather,
                generatedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Error getting enhanced weather predictions for ${cityName}:`, error);
            throw error;
        }
    }

    /**
     * Get environmental alert predictions enhanced with Open-Meteo data
     * @param {string} cityName - Name of the city
     * @param {Object} currentWeather - Current weather conditions
     * @param {Array} forecastData - Daily forecast data
     * @returns {Object} Enhanced alert predictions
     */
    async getAlertPredictionsEnhanced(cityName, currentWeather, forecastData = []) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            // Generate enhanced alert predictions
            const alerts = await this.alertPredictor.predictAlerts(currentWeather, forecastData);
            
            // Store alerts in database
            this.storePredictions(cityName, alerts, 'alert');
            
            return {
                success: true,
                city: cityName,
                enhanced: true,
                openMeteoIntegration: true,
                ...alerts
            };
            
        } catch (error) {
            console.error(`Error getting enhanced alert predictions for ${cityName}:`, error);
            throw error;
        }
    }
    async getWeatherPredictions(cityName, days = 7) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            // Get historical weather data
            const historicalData = this.climateDB.getWeatherHistory(cityName, 30);
            
            if (historicalData.length === 0) {
                // If no historical data, try to get recent data or create mock data
                const latestWeather = this.climateDB.getLatestWeather(cityName);
                if (latestWeather) {
                    // Create a basic historical dataset from latest weather
                    const mockHistoricalData = this.createMockHistoricalData(latestWeather, 7);
                    const predictions = await this.weatherPredictor.predictWeather(mockHistoricalData, days);
                    
                    // Store predictions in database
                    this.storePredictions(cityName, predictions, 'weather');
                    
                    return {
                        success: true,
                        city: cityName,
                        predictions,
                        basedOnDays: mockHistoricalData.length,
                        note: 'Predictions based on limited recent data',
                        generatedAt: new Date().toISOString()
                    };
                } else {
                    throw new Error(`No weather data available for ${cityName}. Please ensure the city has current weather data.`);
                }
            }

            // Generate predictions
            const predictions = await this.weatherPredictor.predictWeather(historicalData, days);
            
            // Store predictions in database
            this.storePredictions(cityName, predictions, 'weather');
            
            return {
                success: true,
                city: cityName,
                predictions,
                basedOnDays: historicalData.length,
                generatedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Error getting weather predictions for ${cityName}:`, error);
            throw error;
        }
    }

    /**
     * Get crop recommendations for a city
     * @param {string} cityName - Name of the city
     * @param {string} season - Current season
     * @returns {Object} Crop recommendations
     */
    async getCropRecommendations(cityName, season = null) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            // Get latest weather data
            const latestWeather = this.climateDB.getLatestWeather(cityName);
            
            if (!latestWeather) {
                throw new Error(`No weather data available for ${cityName}`);
            }

            // Generate crop recommendations
            const recommendations = await this.cropRecommendation.recommendCrops(latestWeather, season);
            
            // Store recommendations in database
            this.storePredictions(cityName, recommendations, 'crop');
            
            return {
                success: true,
                city: cityName,
                ...recommendations
            };
            
        } catch (error) {
            console.error(`Error getting crop recommendations for ${cityName}:`, error);
            throw error;
        }
    }

    /**
     * Get environmental alert predictions
     * @param {string} cityName - Name of the city
     * @returns {Object} Alert predictions
     */
    async getAlertPredictions(cityName) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            // Get current weather data
            const currentWeather = this.climateDB.getLatestWeather(cityName);
            
            if (!currentWeather) {
                throw new Error(`No weather data available for ${cityName}`);
            }

            // Get weather forecast
            const forecastData = await this.getStoredWeatherPredictions(cityName);
            
            // Generate alert predictions
            const alerts = await this.alertPredictor.predictAlerts(currentWeather, forecastData);
            
            // Store alerts in database
            this.storePredictions(cityName, alerts, 'alert');
            
            return {
                success: true,
                city: cityName,
                ...alerts
            };
            
        } catch (error) {
            console.error(`Error getting alert predictions for ${cityName}:`, error);
            throw error;
        }
    }

    /**
     * Get comprehensive ML insights for a city
     * @param {string} cityName - Name of the city
     * @returns {Object} Complete ML analysis
     */
    async getComprehensiveInsights(cityName) {
        if (!this.isInitialized) {
            throw new Error('ML Service not initialized');
        }

        try {
            console.log(`Generating comprehensive insights for ${cityName}...`);
            
            // Get all predictions in parallel
            const [weatherPredictions, cropRecommendations, alertPredictions] = await Promise.all([
                this.getWeatherPredictions(cityName, 7).catch(e => ({ error: e.message })),
                this.getCropRecommendations(cityName).catch(e => ({ error: e.message })),
                this.getAlertPredictions(cityName).catch(e => ({ error: e.message }))
            ]);

            return {
                success: true,
                city: cityName,
                weather: weatherPredictions,
                crops: cropRecommendations,
                alerts: alertPredictions,
                summary: this.generateInsightsSummary(weatherPredictions, cropRecommendations, alertPredictions),
                generatedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Error getting comprehensive insights for ${cityName}:`, error);
            throw error;
        }
    }

    /**
     * Generate insights summary
     */
    generateInsightsSummary(weather, crops, alerts) {
        const summary = {
            overallConditions: 'normal',
            keyInsights: [],
            recommendations: [],
            riskLevel: 'low'
        };

        // Weather insights
        if (weather.success && weather.predictions) {
            const avgTemp = weather.predictions.temperature?.predictions?.reduce((sum, p) => sum + p.temperature, 0) / 7 || 0;
            if (avgTemp > 35) {
                summary.keyInsights.push('High temperatures expected in coming week');
                summary.overallConditions = 'concerning';
            }
        }

        // Crop insights
        if (crops.success && crops.recommendations) {
            const topCrop = crops.recommendations[0];
            if (topCrop) {
                summary.keyInsights.push(`${topCrop.name} shows highest suitability (${topCrop.suitabilityScore}%)`);
                summary.recommendations.push(`Consider cultivating ${topCrop.name}`);
            }
        }

        // Alert insights
        if (alerts.success && alerts.overallRisk) {
            summary.riskLevel = alerts.overallRisk.level;
            if (alerts.overallRisk.level !== 'low') {
                summary.keyInsights.push(`${alerts.overallRisk.activeAlerts} environmental alert(s) detected`);
                summary.overallConditions = alerts.overallRisk.level;
            }
        }

        return summary;
    }

    /**
     * Store predictions in database
     */
    storePredictions(cityName, predictions, type) {
        try {
            const cityInfo = this.climateDB.getCityByName(cityName);
            if (!cityInfo) return;

            const predictionData = {
                city_id: cityInfo.id,
                city_name: cityName,
                prediction_type: type,
                prediction_data: JSON.stringify(predictions),
                confidence: predictions.confidence || 0,
                generated_at: new Date().toISOString(),
                valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            // Insert prediction into database
            const stmt = this.climateDB.db.prepare(`
                INSERT OR REPLACE INTO ml_predictions 
                (city_id, city_name, prediction_type, prediction_data, confidence, generated_at, valid_until)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                predictionData.city_id,
                predictionData.city_name,
                predictionData.prediction_type,
                predictionData.prediction_data,
                predictionData.confidence,
                predictionData.generated_at,
                predictionData.valid_until
            );

        } catch (error) {
            console.error('Error storing predictions:', error);
        }
    }

    /**
     * Get stored weather predictions
     */
    async getStoredWeatherPredictions(cityName, limit = 7) {
        try {
            const stmt = this.climateDB.db.prepare(`
                SELECT prediction_data FROM ml_predictions 
                WHERE city_name = ? AND prediction_type = 'weather' 
                AND valid_until > datetime('now')
                ORDER BY generated_at DESC LIMIT 1
            `);
            
            const result = stmt.get(cityName);
            
            if (result) {
                const predictions = JSON.parse(result.prediction_data);
                return predictions.temperature?.predictions?.slice(0, limit) || [];
            }
            
            return [];
        } catch (error) {
            console.error('Error getting stored predictions:', error);
            return [];
        }
    }

    /**
     * Start background prediction tasks
     */
    startBackgroundTasks() {
        console.log('Starting ML background tasks...');
        
        // Update predictions every 6 hours
        setInterval(async () => {
            await this.updatePredictionsForAllCities();
        }, 6 * 60 * 60 * 1000);

        // Initial prediction update
        setTimeout(() => {
            this.updatePredictionsForAllCities();
        }, 30000); // Start after 30 seconds
    }

    /**
     * Update predictions for all cities
     */
    async updatePredictionsForAllCities() {
        try {
            console.log('🔄 Updating ML predictions for all cities...');
            
            const cities = this.climateDB.getAllCities().slice(0, 10); // Limit to top 10 cities
            
            for (const city of cities) {
                try {
                    await this.getCropRecommendations(city.name);
                    await this.getAlertPredictions(city.name);
                    
                    // Add delay between cities to avoid overwhelming the system
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`Error updating predictions for ${city.name}:`, error.message);
                }
            }
            
            console.log('✅ ML predictions updated for all cities');
            
        } catch (error) {
            console.error('❌ Error in background prediction update:', error);
        }
    }

    /**
     * Get ML performance metrics
     */
    getPerformanceMetrics() {
        try {
            const stmt = this.climateDB.db.prepare(`
                SELECT 
                    prediction_type,
                    COUNT(*) as total_predictions,
                    AVG(confidence) as avg_confidence,
                    MAX(generated_at) as last_updated
                FROM ml_predictions 
                WHERE valid_until > datetime('now')
                GROUP BY prediction_type
            `);
            
            const metrics = stmt.all();
            
            return {
                models: {
                    weather: this.weatherPredictor.isInitialized,
                    crop: this.cropRecommendation.isInitialized,
                    alert: this.alertPredictor.isInitialized
                },
                predictions: metrics,
                systemStatus: this.isInitialized ? 'operational' : 'initializing'
            };
            
        } catch (error) {
            console.error('Error getting performance metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * Create ML predictions table if it doesn't exist
     */
    createMLTable() {
        try {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ml_predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    city_id INTEGER,
                    city_name TEXT NOT NULL,
                    prediction_type TEXT NOT NULL,
                    prediction_data TEXT NOT NULL,
                    confidence REAL DEFAULT 0,
                    generated_at TEXT NOT NULL,
                    valid_until TEXT NOT NULL,
                    UNIQUE(city_name, prediction_type)
                )
            `;
            
            this.climateDB.db.exec(createTableSQL);
            
            // Create indexes for better performance
            this.climateDB.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_ml_city_type 
                ON ml_predictions(city_name, prediction_type)
            `);
            
            this.climateDB.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_ml_valid_until 
                ON ml_predictions(valid_until)
            `);
            
            console.log('✅ ML predictions table created/verified');
            
        } catch (error) {
            console.error('❌ Error creating ML table:', error);
            throw error;
        }
    }
    
    /**
     * Create mock historical data from latest weather data
     * @param {Object} latestWeather - Latest weather data
     * @param {number} days - Number of days to create
     * @returns {Array} Mock historical data
     */
    createMockHistoricalData(latestWeather, days = 7) {
        const mockData = [];
        const baseDate = new Date();
        
        for (let i = days; i > 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            
            // Add some variation to the base values
            const tempVariation = (Math.random() - 0.5) * 10;
            const humidityVariation = (Math.random() - 0.5) * 20;
            const rainfallVariation = Math.random() * 5;
            
            mockData.push({
                temperature: Math.max(0, (latestWeather.temperature || 25) + tempVariation),
                humidity: Math.max(0, Math.min(100, (latestWeather.humidity || 60) + humidityVariation)),
                rainfall: Math.max(0, (latestWeather.rainfall || 0) + rainfallVariation),
                pressure: latestWeather.pressure || 1013,
                recorded_at: date.toISOString()
            });
        }
        
        return mockData;
    }
}

module.exports = MLService;