const express = require('express');
const router = express.Router();

let alertService;

function initializeAlertRouter(alertServiceInstance) {
  alertService = alertServiceInstance;
}

// Get all active alerts
router.get('/active', (req, res) => {
  try {
    const alerts = alertService.getActiveAlerts();
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching active alerts:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active alerts'
    });
  }
});

// Get active alerts for a specific city
router.get('/city/:cityId', (req, res) => {
  try {
    const cityId = parseInt(req.params.cityId);
    const alerts = alertService.getActiveAlerts(cityId);
    res.json({
      success: true,
      data: alerts,
      city_id: cityId
    });
  } catch (error) {
    console.error('Error fetching city alerts:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city alerts'
    });
  }
});

// Get alert thresholds
router.get('/thresholds', (req, res) => {
  try {
    const alertType = req.query.type; // 'FLOOD' or 'HEAT'
    const thresholds = alertService.db.getAlertThresholds(alertType);
    res.json({
      success: true,
      data: thresholds
    });
  } catch (error) {
    console.error('Error fetching alert thresholds:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert thresholds'
    });
  }
});

// Subscribe to alerts (via HTTP, also handled via WebSocket)
router.post('/subscribe', (req, res) => {
  try {
    const { socket_id, city_id, city_name, alert_types } = req.body;
    
    if (!socket_id || !city_id || !city_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: socket_id, city_id, city_name'
      });
    }
    
    const result = alertService.subscribeToAlerts(
      socket_id, 
      city_id, 
      city_name, 
      alert_types || ['FLOOD', 'HEAT']
    );
    
    res.json({
      success: true,
      message: 'Successfully subscribed to alerts',
      data: result
    });
  } catch (error) {
    console.error('Error subscribing to alerts:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to alerts'
    });
  }
});

// Get alert history for a city
router.get('/history/:cityId', (req, res) => {
  try {
    const cityId = parseInt(req.params.cityId);
    const limit = parseInt(req.query.limit) || 20;
    
    // Get recent flood and heat alerts for the city
    const floodAlerts = alertService.db.db.prepare(`
      SELECT 'FLOOD' as alert_type, * FROM flood_alerts 
      WHERE city_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(cityId, limit);
    
    const heatAlerts = alertService.db.db.prepare(`
      SELECT 'HEAT' as alert_type, * FROM heat_alerts 
      WHERE city_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(cityId, limit);
    
    // Combine and sort by timestamp
    const allAlerts = [...floodAlerts, ...heatAlerts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    
    res.json({
      success: true,
      data: allAlerts,
      city_id: cityId,
      count: allAlerts.length
    });
  } catch (error) {
    console.error('Error fetching alert history:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert history'
    });
  }
});

// Get alert statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      active_flood_alerts: alertService.db.db.prepare(`
        SELECT COUNT(*) as count FROM flood_alerts 
        WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
      `).get().count,
      
      active_heat_alerts: alertService.db.db.prepare(`
        SELECT COUNT(*) as count FROM heat_alerts 
        WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
      `).get().count,
      
      total_subscriptions: alertService.db.db.prepare(`
        SELECT COUNT(*) as count FROM alert_subscriptions
      `).get().count,
      
      cities_with_active_alerts: alertService.db.db.prepare(`
        SELECT COUNT(DISTINCT city_id) as count FROM (
          SELECT city_id FROM flood_alerts 
          WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
          UNION
          SELECT city_id FROM heat_alerts 
          WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
        )
      `).get().count
    };
    
    stats.total_active_alerts = stats.active_flood_alerts + stats.active_heat_alerts;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert statistics'
    });
  }
});

module.exports = { router, initializeAlertRouter };