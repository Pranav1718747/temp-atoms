/**
 * Advanced TypeScript ML Routes
 * Enhanced ML endpoints using the new TypeScript implementation
 */

const express = require('express');
const router = express.Router();

const { 
  getAdvancedWeatherPredictions,
  getAdvancedCropRecommendations,
  getAdvancedAlertPredictions,
  getComprehensiveInsights,
  getMLHealthStatus,
  getMLPerformanceMetrics
} = require('../ml-ts/bridge.js');

/**
 * Advanced Weather Predictions using TypeScript ML
 * GET /api/ml-advanced/weather/:city?days=7
 */
router.get('/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const days = parseInt(req.query.days) || 7;

        console.log(`🌤️ Getting advanced weather predictions for ${city} (${days} days)`);
        
        const predictions = await getAdvancedWeatherPredictions(city, days);
        
        res.json({
            ...predictions,
            source: 'TypeScript ML v2.0',
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error in advanced weather predictions route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Advanced Crop Recommendations using TypeScript ML
 * GET /api/ml-advanced/crops/:city?season=current
 */
router.get('/crops/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const { season } = req.query;

        console.log(`🌾 Getting advanced crop recommendations for ${city} (season: ${season || 'auto'})`);
        
        const recommendations = await getAdvancedCropRecommendations(city, season);
        
        res.json({
            ...recommendations,
            source: 'TypeScript ML v2.0',
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error in advanced crop recommendations route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Advanced Alert Predictions using TypeScript ML
 * GET /api/ml-advanced/alerts/:city
 */
router.get('/alerts/:city', async (req, res) => {
    try {
        const { city } = req.params;

        console.log(`🚨 Getting advanced alert predictions for ${city}`);
        
        const alerts = await getAdvancedAlertPredictions(city);
        
        res.json({
            ...alerts,
            source: 'TypeScript ML v2.0',
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error in advanced alert predictions route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Comprehensive ML Insights using TypeScript ML
 * GET /api/ml-advanced/insights/:city
 */
router.get('/insights/:city', async (req, res) => {
    try {
        const { city } = req.params;

        console.log(`📊 Getting comprehensive insights for ${city}`);
        
        const insights = await getComprehensiveInsights(city);
        
        res.json({
            ...insights,
            source: 'TypeScript ML v2.0',
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error in comprehensive insights route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Advanced ML Performance Metrics
 * GET /api/ml-advanced/metrics
 */
router.get('/metrics', (req, res) => {
    try {
        const metrics = getMLPerformanceMetrics();
        
        res.json({
            success: true,
            data: metrics,
            source: 'TypeScript ML v2.0',
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error in advanced ML metrics route:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Advanced ML Health Check
 * GET /api/ml-advanced/health
 */
router.get('/health', (req, res) => {
    try {
        const health = getMLHealthStatus();
        
        const isHealthy = health.status === 'healthy';
        
        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            ...health,
            source: 'TypeScript ML v2.0'
        });
        
    } catch (error) {
        console.error('Error in advanced ML health check:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            source: 'TypeScript ML v2.0'
        });
    }
});

/**
 * Compare ML Models (Old vs New)
 * GET /api/ml-advanced/compare/:city/:type
 */
router.get('/compare/:city/:type', async (req, res) => {
    try {
        const { city, type } = req.params;
        
        console.log(`🔄 Comparing ML models for ${city} (${type})`);
        
        // This would compare old JS ML vs new TypeScript ML
        // For now, just return the new TypeScript results
        let result;
        
        switch (type) {
            case 'weather':
                result = await getAdvancedWeatherPredictions(city, 7);
                break;
            case 'crops':
                result = await getAdvancedCropRecommendations(city);
                break;
            case 'alerts':
                result = await getAdvancedAlertPredictions(city);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comparison type. Use: weather, crops, or alerts'
                });
        }
        
        res.json({
            success: true,
            city,
            type,
            comparison: {
                typescript_ml: result,
                javascript_ml: { note: 'Available via /api/ml/' + type + '/' + city }
            },
            recommendation: 'TypeScript ML provides enhanced accuracy and features'
        });
        
    } catch (error) {
        console.error('Error in ML comparison route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;