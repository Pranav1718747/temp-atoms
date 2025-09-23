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
 * Get weather predictions for a city
 * GET /api/ml/weather/:city?days=7
 */
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