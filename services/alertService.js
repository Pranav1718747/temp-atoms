class AlertService {
  constructor(climateDB, io) {
    this.db = climateDB;
    this.io = io;
    this.alertLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    // Load thresholds on initialization
    this.loadThresholds();
    
    // Start background tasks
    this.startBackgroundTasks();
  }

  loadThresholds() {
    try {
      const thresholds = this.db.getAlertThresholds();
      this.floodThresholds = {};
      this.heatThresholds = {};
      
      thresholds.forEach(threshold => {
        if (threshold.alert_type === 'FLOOD') {
          this.floodThresholds[threshold.level] = threshold.threshold_value;
        } else if (threshold.alert_type === 'HEAT') {
          this.heatThresholds[threshold.level] = threshold.threshold_value;
        }
      });
      
      console.log('Alert thresholds loaded:', {
        flood: this.floodThresholds,
        heat: this.heatThresholds
      });
    } catch (error) {
      console.error('Error loading alert thresholds:', error.message);
      // Fallback to default thresholds
      this.floodThresholds = { LOW: 5, MEDIUM: 10, HIGH: 20, CRITICAL: 50 };
      this.heatThresholds = { LOW: 35, MEDIUM: 40, HIGH: 45, CRITICAL: 50 };
    }
  }

  startBackgroundTasks() {
    // Clean expired alerts every hour
    setInterval(() => {
      this.db.cleanExpiredAlerts();
    }, 60 * 60 * 1000);
    
    console.log('Alert service background tasks started');
  }

  analyzeWeatherData(weatherData) {
    const alerts = [];
    
    try {
      // Analyze for flood risk
      const floodAlert = this.checkFloodRisk(weatherData);
      if (floodAlert) {
        alerts.push(floodAlert);
      }
      
      // Analyze for heat risk
      const heatAlert = this.checkHeatRisk(weatherData);
      if (heatAlert) {
        alerts.push(heatAlert);
      }
      
      // Process and save alerts
      for (const alert of alerts) {
        this.processAlert(alert);
      }
      
    } catch (error) {
      console.error('Error analyzing weather data for alerts:', error.message);
    }
    
    return alerts;
  }

  checkFloodRisk(weatherData) {
    const rainfall = weatherData.rainfall || 0;
    
    // Skip if no significant rainfall
    if (rainfall < this.floodThresholds.LOW) {
      return null;
    }
    
    // Determine alert level
    let alertLevel = 'LOW';
    let threshold = this.floodThresholds.LOW;
    
    if (rainfall >= this.floodThresholds.CRITICAL) {
      alertLevel = 'CRITICAL';
      threshold = this.floodThresholds.CRITICAL;
    } else if (rainfall >= this.floodThresholds.HIGH) {
      alertLevel = 'HIGH';
      threshold = this.floodThresholds.HIGH;
    } else if (rainfall >= this.floodThresholds.MEDIUM) {
      alertLevel = 'MEDIUM';
      threshold = this.floodThresholds.MEDIUM;
    }
    
    // Generate alert message
    const message = this.generateFloodMessage(alertLevel, rainfall, weatherData.city_name);
    
    // Calculate expiry (2 hours from now)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    
    return {
      type: 'FLOOD',
      city_id: weatherData.city_id,
      city_name: weatherData.city_name,
      alert_level: alertLevel,
      rainfall_1h: rainfall,
      threshold_exceeded: threshold,
      alert_message: message,
      expires_at: expiresAt,
      weatherData: weatherData
    };
  }

  checkHeatRisk(weatherData) {
    const temperature = weatherData.temperature || 0;
    
    // Skip if temperature is below threshold
    if (temperature < this.heatThresholds.LOW) {
      return null;
    }
    
    // Determine alert level
    let alertLevel = 'LOW';
    let threshold = this.heatThresholds.LOW;
    
    if (temperature >= this.heatThresholds.CRITICAL) {
      alertLevel = 'CRITICAL';
      threshold = this.heatThresholds.CRITICAL;
    } else if (temperature >= this.heatThresholds.HIGH) {
      alertLevel = 'HIGH';
      threshold = this.heatThresholds.HIGH;
    } else if (temperature >= this.heatThresholds.MEDIUM) {
      alertLevel = 'MEDIUM';
      threshold = this.heatThresholds.MEDIUM;
    }
    
    // Calculate heat index (simplified)
    const humidity = weatherData.humidity || 50;
    const heatIndex = this.calculateHeatIndex(temperature, humidity);
    
    // Generate alert message
    const message = this.generateHeatMessage(alertLevel, temperature, weatherData.city_name);
    
    // Calculate expiry (4 hours from now)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    
    return {
      type: 'HEAT',
      city_id: weatherData.city_id,
      city_name: weatherData.city_name,
      alert_level: alertLevel,
      temperature: temperature,
      heat_index: heatIndex,
      threshold_exceeded: threshold,
      alert_message: message,
      expires_at: expiresAt,
      weatherData: weatherData
    };
  }

  processAlert(alert) {
    try {
      // Check if similar alert already exists (avoid duplicates)
      const existingAlerts = this.db.getActiveAlertsForCity(alert.city_id);
      const similarAlert = alert.type === 'FLOOD' 
        ? existingAlerts.flood.find(a => a.alert_level === alert.alert_level)
        : existingAlerts.heat.find(a => a.alert_level === alert.alert_level);
      
      if (similarAlert) {
        console.log(`Similar ${alert.type} alert already exists for ${alert.city_name} at ${alert.alert_level} level`);
        return;
      }
      
      // Save alert to database
      if (alert.type === 'FLOOD') {
        this.db.insertFloodAlert(alert);
      } else if (alert.type === 'HEAT') {
        this.db.insertHeatAlert(alert);
      }
      
      // Broadcast alert to subscribed clients
      this.broadcastAlert(alert);
      
      console.log(`${alert.type} alert generated for ${alert.city_name}: ${alert.alert_level} level`);
      
    } catch (error) {
      console.error('Error processing alert:', error.message);
    }
  }

  broadcastAlert(alert) {
    try {
      // Broadcast to all clients subscribed to this city
      this.io.to(`weather_${alert.city_name}`).emit('alert_update', {
        type: alert.type,
        level: alert.alert_level,
        city: alert.city_name,
        message: alert.alert_message,
        timestamp: new Date().toISOString(),
        data: {
          rainfall: alert.rainfall_1h,
          temperature: alert.temperature,
          heat_index: alert.heat_index
        }
      });
      
      // Also broadcast to general alert subscribers
      this.io.emit('new_alert', {
        type: alert.type,
        level: alert.alert_level,
        city: alert.city_name,
        message: alert.alert_message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error broadcasting alert:', error.message);
    }
  }

  generateFloodMessage(level, rainfall, cityName) {
    const messages = {
      LOW: `Light rainfall detected in ${cityName}. Current: ${rainfall.toFixed(1)}mm/h. Monitor weather conditions.`,
      MEDIUM: `Moderate rainfall in ${cityName}. Current: ${rainfall.toFixed(1)}mm/h. Potential flooding in low-lying areas.`,
      HIGH: `Heavy rainfall in ${cityName}. Current: ${rainfall.toFixed(1)}mm/h. Flooding likely in vulnerable areas. Exercise caution.`,
      CRITICAL: `Extreme rainfall in ${cityName}. Current: ${rainfall.toFixed(1)}mm/h. Severe flooding expected. Avoid travel and seek higher ground.`
    };
    return messages[level] || `Flood alert for ${cityName}`;
  }

  generateHeatMessage(level, temperature, cityName) {
    const messages = {
      LOW: `High temperature in ${cityName}. Current: ${temperature.toFixed(1)}°C. Stay hydrated and avoid prolonged sun exposure.`,
      MEDIUM: `Very high temperature in ${cityName}. Current: ${temperature.toFixed(1)}°C. Limit outdoor activities during peak hours.`,
      HIGH: `Dangerous heat in ${cityName}. Current: ${temperature.toFixed(1)}°C. High risk of heat exhaustion. Stay indoors if possible.`,
      CRITICAL: `Extreme heat in ${cityName}. Current: ${temperature.toFixed(1)}°C. Emergency heat conditions. Seek air conditioning immediately.`
    };
    return messages[level] || `Heat alert for ${cityName}`;
  }

  calculateHeatIndex(temperature, humidity) {
    // Simplified heat index calculation (approximation)
    if (temperature < 80) return temperature; // Fahrenheit, convert if needed
    
    const T = temperature * 9/5 + 32; // Convert to Fahrenheit
    const RH = humidity;
    
    let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH;
    HI -= 0.22475541 * T * RH - 0.00683783 * T * T;
    HI -= 0.05481717 * RH * RH + 0.00122874 * T * T * RH;
    HI += 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    
    return (HI - 32) * 5/9; // Convert back to Celsius
  }

  // API methods for getting alerts
  getActiveAlerts(cityId = null) {
    if (cityId) {
      return this.db.getActiveAlertsForCity(cityId);
    }
    return this.db.getAllActiveAlerts();
  }

  subscribeToAlerts(socketId, cityId, cityName, alertTypes = ['FLOOD', 'HEAT']) {
    return this.db.subscribeToAlerts(socketId, cityId, cityName, alertTypes);
  }
}

module.exports = AlertService;