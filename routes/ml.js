/**
 * ML Routes - Machine Learning API endpoints
 */

const express = require('express');
const router = express.Router();

let mlService;

/**
 * Initialize ML router with service
 */
function initializeMLRouter(mlServiceInstance) {
    mlService = mlServiceInstance;
}

/**
 * Get weather predictions enhanced with Open-Meteo data
 * GET /api/ml/weather-enhanced/:city?days=7
 */
router.get('/weather-enhanced/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const days = parseInt(req.query.days) || 7;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        // Get current weather with Open-Meteo data
        const currentWeather = await mlService.climateAPI.getOpenMeteoWeather(city);
        
        let predictions;
        if (currentWeather && currentWeather.data) {
            // Use enhanced prediction with Open-Meteo forecasts
            predictions = await mlService.getWeatherPredictionsEnhanced(city, days, currentWeather.data);
        } else {
            // Fallback to regular predictions
            predictions = await mlService.getWeatherPredictions(city, days);
        }
        
        res.json({
            ...predictions,
            enhanced: !!currentWeather,
            dataSource: currentWeather ? 'Open-Meteo + ML' : 'ML Only',
            currentWeather: currentWeather ? {
                temperature: currentWeather.data.main.temp,
                humidity: currentWeather.data.main.humidity,
                pressure: currentWeather.data.main.pressure,
                wind_speed: currentWeather.data.wind.speed,
                weather_description: currentWeather.data.weather[0].description,
                coordinates: currentWeather.coords
            } : null
        });
        
    } catch (error) {
        console.error('Error in enhanced weather predictions route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get environmental alerts enhanced with Open-Meteo data
 * GET /api/ml/alerts-enhanced/:city
 */
router.get('/alerts-enhanced/:city', async (req, res) => {
    try {
        const { city } = req.params;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        // Get current weather and forecast from Open-Meteo
        const openMeteoData = await mlService.climateAPI.getOpenMeteoWeather(city);
        
        let alerts;
        if (openMeteoData && openMeteoData.data) {
            // Enhanced alerts with Open-Meteo forecasts
            const currentWeather = {
                temperature: openMeteoData.data.main.temp,
                humidity: openMeteoData.data.main.humidity,
                pressure: openMeteoData.data.main.pressure,
                rainfall: openMeteoData.data.rain['1h'],
                wind_speed: openMeteoData.data.wind.speed,
                is_day: openMeteoData.data.is_day
            };
            
            alerts = await mlService.getAlertPredictionsEnhanced(
                city, 
                currentWeather, 
                openMeteoData.data.daily_forecast
            );
        } else {
            // Fallback to regular alerts
            alerts = await mlService.getAlertPredictions(city);
        }
        
        res.json({
            ...alerts,
            enhanced: !!openMeteoData,
            dataSource: openMeteoData ? 'Open-Meteo + ML' : 'ML Only'
        });
        
    } catch (error) {
        console.error('Error in enhanced alerts route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get ML predictions for ANY location (not just predefined cities)
 * GET /api/ml/location/:location?country=optional&days=7
 */
router.get('/location/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const country = req.query.country;
        const days = parseInt(req.query.days) || 7;
        
        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }
        
        console.log(`Getting ML predictions for location: ${location}${country ? `, ${country}` : ''}`);
        
        // Get comprehensive weather data for the location
        const locationWeather = await mlService.climateAPI.getWeatherForAnyLocation(location, country);
        
        if (!locationWeather.success) {
            return res.status(404).json(locationWeather);
        }
        
        // Extract current weather for ML processing
        const currentWeather = {
            temperature: locationWeather.weather.current.temperature,
            humidity: locationWeather.weather.current.humidity,
            pressure: locationWeather.weather.current.pressure,
            rainfall: locationWeather.weather.current.precipitation,
            wind_speed: locationWeather.weather.current.wind_speed,
            weather_description: locationWeather.weather.current.weather_description
        };
        
        // Generate predictions
        const [weatherPredictions, alertPredictions] = await Promise.allSettled([
            // Weather predictions using the enhanced forecast data
            mlService.weatherPredictor.predictWeather(
                [], // No historical data for new locations
                days,
                {
                    main: {
                        temp: currentWeather.temperature,
                        humidity: currentWeather.humidity,
                        pressure: currentWeather.pressure
                    },
                    rain: { '1h': currentWeather.rainfall },
                    wind: { speed: currentWeather.wind_speed },
                    daily_forecast: locationWeather.weather.daily_forecast,
                    hourly_forecast: locationWeather.weather.hourly_forecast
                }
            ),
            // Alert predictions
            mlService.alertPredictor.predictAlerts(
                currentWeather,
                locationWeather.weather.daily_forecast
            )
        ]);
        
        const response = {
            success: true,
            location: locationWeather.location,
            currentWeather: currentWeather,
            predictions: {
                weather: weatherPredictions.status === 'fulfilled' ? 
                    weatherPredictions.value : { error: weatherPredictions.reason?.message },
                alerts: alertPredictions.status === 'fulfilled' ? 
                    alertPredictions.value : { error: alertPredictions.reason?.message }
            },
            dataSource: 'Open-Meteo + ML Global',
            coverage: 'Global - Any Location',
            generatedAt: new Date().toISOString()
        };
        
        return res.json(response);
        
    } catch (error) {
        console.error('Error in ML location route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            location: req.params.location
        });
    }
});

/**
 * Get ML predictions by coordinates
 * GET /api/ml/coordinates/:lat/:lon?days=7
 */
router.get('/coordinates/:lat/:lon', async (req, res) => {
    try {
        const latitude = parseFloat(req.params.lat);
        const longitude = parseFloat(req.params.lon);
        const days = parseInt(req.query.days) || 7;
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates. Please provide valid latitude and longitude.'
            });
        }
        
        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }
        
        console.log(`Getting ML predictions for coordinates: ${latitude}, ${longitude}`);
        
        const locationInfo = {
            latitude: latitude,
            longitude: longitude,
            name: `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: 'Unknown',
            admin1: 'Unknown'
        };
        
        // Get weather data by coordinates
        const weatherData = await mlService.climateAPI.getDetailedWeatherByCoordinates(
            latitude, longitude, locationInfo
        );
        
        // Extract current weather for ML processing
        const currentWeather = {
            temperature: weatherData.current.temperature,
            humidity: weatherData.current.humidity,
            pressure: weatherData.current.pressure,
            rainfall: weatherData.current.precipitation,
            wind_speed: weatherData.current.wind_speed,
            weather_description: weatherData.current.weather_description
        };
        
        // Generate predictions
        const [weatherPredictions, alertPredictions] = await Promise.allSettled([
            mlService.weatherPredictor.predictWeather(
                [], // No historical data for coordinate-based requests
                days,
                {
                    main: {
                        temp: currentWeather.temperature,
                        humidity: currentWeather.humidity,
                        pressure: currentWeather.pressure
                    },
                    rain: { '1h': currentWeather.rainfall },
                    wind: { speed: currentWeather.wind_speed },
                    daily_forecast: weatherData.daily_forecast,
                    hourly_forecast: weatherData.hourly_forecast
                }
            ),
            mlService.alertPredictor.predictAlerts(
                currentWeather,
                weatherData.daily_forecast
            )
        ]);
        
        const response = {
            success: true,
            coordinates: { latitude, longitude },
            location: locationInfo,
            currentWeather: currentWeather,
            predictions: {
                weather: weatherPredictions.status === 'fulfilled' ? 
                    weatherPredictions.value : { error: weatherPredictions.reason?.message },
                alerts: alertPredictions.status === 'fulfilled' ? 
                    alertPredictions.value : { error: alertPredictions.reason?.message }
            },
            dataSource: 'Open-Meteo + ML Coordinates',
            coverage: 'Global - Any Coordinates',
            generatedAt: new Date().toISOString()
        };
        
        return res.json(response);
        
    } catch (error) {
        console.error('Error in ML coordinates route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            coordinates: {
                latitude: req.params.lat,
                longitude: req.params.lon
            }
        });
    }
});
router.get('/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const days = parseInt(req.query.days) || 7;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const predictions = await mlService.getWeatherPredictions(city, days);
        
        res.json(predictions);
        
    } catch (error) {
        console.error('Error in weather predictions route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get crop recommendations for a city
 * GET /api/ml/crops/:city?season=current
 */
router.get('/crops/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const { season } = req.query;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const recommendations = await mlService.getCropRecommendations(city, season);
        
        res.json(recommendations);
        
    } catch (error) {
        console.error('Error in crop recommendations route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get environmental alert predictions
 * GET /api/ml/alerts/:city
 */
router.get('/alerts/:city', async (req, res) => {
    try {
        const { city } = req.params;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const alerts = await mlService.getAlertPredictions(city);
        
        res.json(alerts);
        
    } catch (error) {
        console.error('Error in alert predictions route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get comprehensive ML insights for a city
 * GET /api/ml/insights/:city
 */
router.get('/insights/:city', async (req, res) => {
    try {
        const { city } = req.params;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const insights = await mlService.getComprehensiveInsights(city);
        
        res.json(insights);
        
    } catch (error) {
        console.error('Error in comprehensive insights route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get ML performance metrics
 * GET /api/ml/metrics
 */
router.get('/metrics', (req, res) => {
    try {
        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const metrics = mlService.getPerformanceMetrics();
        
        res.json({
            success: true,
            data: metrics
        });
        
    } catch (error) {
        console.error('Error in ML metrics route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get crop details by ID
 * GET /api/ml/crop-details/:cropId
 */
router.get('/crop-details/:cropId', (req, res) => {
    try {
        const { cropId } = req.params;

        if (!mlService || !mlService.cropRecommendation) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const cropDetails = mlService.cropRecommendation.getCropDetails(cropId);
        
        if (!cropDetails) {
            return res.status(404).json({
                success: false,
                error: 'Crop not found'
            });
        }

        res.json({
            success: true,
            data: cropDetails
        });
        
    } catch (error) {
        console.error('Error in crop details route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Analyze crop performance trends
 * POST /api/ml/crop-trends/:cropId
 */
router.post('/crop-trends/:cropId', async (req, res) => {
    try {
        const { cropId } = req.params;
        const { historicalData } = req.body;

        if (!mlService || !mlService.cropRecommendation) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        if (!historicalData || !Array.isArray(historicalData)) {
            return res.status(400).json({
                success: false,
                error: 'Historical data array is required'
            });
        }

        const trends = await mlService.cropRecommendation.analyzeCropTrends(historicalData, cropId);
        
        res.json({
            success: true,
            cropId,
            data: trends
        });
        
    } catch (error) {
        console.error('Error in crop trends route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Trigger manual prediction update for a city
 * POST /api/ml/update/:city
 */
router.post('/update/:city', async (req, res) => {
    try {
        const { city } = req.params;

        if (!mlService) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        // Trigger updates for all prediction types
        const [weather, crops, alerts] = await Promise.allSettled([
            mlService.getWeatherPredictions(city, 7),
            mlService.getCropRecommendations(city),
            mlService.getAlertPredictions(city)
        ]);

        const results = {
            weather: weather.status === 'fulfilled' ? weather.value : { error: weather.reason.message },
            crops: crops.status === 'fulfilled' ? crops.value : { error: crops.reason.message },
            alerts: alerts.status === 'fulfilled' ? alerts.value : { error: alerts.reason.message }
        };

        res.json({
            success: true,
            city,
            message: 'Predictions updated',
            results,
            updatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in manual update route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get all available cities with ML predictions
 * GET /api/ml/cities
 */
router.get('/cities', (req, res) => {
    try {
        if (!mlService || !mlService.climateDB) {
            return res.status(500).json({
                success: false,
                error: 'ML service not initialized'
            });
        }

        const cities = mlService.climateDB.getAllCities();
        
        // Get prediction counts for each city
        const citiesWithPredictions = cities.map(city => {
            try {
                const stmt = mlService.climateDB.db.prepare(`
                    SELECT prediction_type, COUNT(*) as count
                    FROM ml_predictions 
                    WHERE city_name = ? AND valid_until > datetime('now')
                    GROUP BY prediction_type
                `);
                
                const predictions = stmt.all(city.name);
                const predictionCounts = {};
                predictions.forEach(p => {
                    predictionCounts[p.prediction_type] = p.count;
                });

                return {
                    ...city,
                    predictions: predictionCounts,
                    hasPredictions: predictions.length > 0
                };
            } catch (error) {
                return {
                    ...city,
                    predictions: {},
                    hasPredictions: false
                };
            }
        });

        res.json({
            success: true,
            data: citiesWithPredictions,
            total: citiesWithPredictions.length
        });
        
    } catch (error) {
        console.error('Error in ML cities route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Health check for ML service
 * GET /api/ml/health
 */
router.get('/health', (req, res) => {
    try {
        const status = {
            service: mlService ? 'available' : 'unavailable',
            initialized: mlService ? mlService.isInitialized : false,
            models: {
                weather: mlService ? mlService.weatherPredictor.isInitialized : false,
                crop: mlService ? mlService.cropRecommendation.isInitialized : false,
                alert: mlService ? mlService.alertPredictor.isInitialized : false
            },
            timestamp: new Date().toISOString()
        };

        const isHealthy = status.service === 'available' && status.initialized;

        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            status: isHealthy ? 'healthy' : 'unhealthy',
            data: status
        });
        
    } catch (error) {
        console.error('Error in ML health check:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = { router, initializeMLRouter };