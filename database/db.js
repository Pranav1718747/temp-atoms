const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class ClimateDatabase {
  constructor() {
    const dbPath = path.join(__dirname, '../data/climatesync.db');
    this.db = new Database(dbPath);
    this.createTables();
    this.loadCityData();
  }

  createTables() {
    // Cities table for metadata
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        state TEXT NOT NULL,
        imd_id INTEGER,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT DEFAULT 'Asia/Kolkata',
        population INTEGER,
        region TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Enhanced weather data table with comprehensive agricultural parameters
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_id INTEGER NOT NULL,
        city_name TEXT NOT NULL,
        temperature REAL,
        feels_like REAL,
        temp_min REAL,
        temp_max REAL,
        humidity INTEGER,
        pressure REAL,
        rainfall REAL,
        rainfall_24h REAL DEFAULT 0,
        wind_speed REAL,
        wind_direction INTEGER,
        wind_gust REAL,
        visibility REAL,
        uv_index REAL,
        cloud_cover INTEGER,
        dew_point REAL,
        heat_index REAL,
        wind_chill REAL,
        soil_temperature REAL,
        soil_moisture REAL,
        evapotranspiration REAL,
        growing_degree_days REAL,
        air_quality_pm25 REAL,
        air_quality_pm10 REAL,
        air_quality_index INTEGER,
        pressure_trend TEXT,
        moon_phase TEXT,
        moon_illumination REAL,
        weather_description TEXT,
        weather_condition TEXT,
        data_source TEXT,
        sunrise TIME,
        sunset TIME,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id)
      );
    `);

    // Add latitude and longitude columns if they don't exist
    const addColumnsIfNotExist = [
      { name: 'latitude', type: 'REAL' },
      { name: 'longitude', type: 'REAL' },
      { name: 'feels_like', type: 'REAL' },
      { name: 'temp_min', type: 'REAL' },
      { name: 'temp_max', type: 'REAL' },
      { name: 'rainfall_24h', type: 'REAL DEFAULT 0' },
      { name: 'wind_speed', type: 'REAL' },
      { name: 'wind_direction', type: 'INTEGER' },
      { name: 'wind_gust', type: 'REAL' },
      { name: 'visibility', type: 'REAL' },
      { name: 'uv_index', type: 'REAL' },
      { name: 'cloud_cover', type: 'INTEGER' },
      { name: 'dew_point', type: 'REAL' },
      { name: 'heat_index', type: 'REAL' },
      { name: 'wind_chill', type: 'REAL' },
      { name: 'soil_temperature', type: 'REAL' },
      { name: 'soil_moisture', type: 'REAL' },
      { name: 'evapotranspiration', type: 'REAL' },
      { name: 'growing_degree_days', type: 'REAL' },
      { name: 'air_quality_pm25', type: 'REAL' },
      { name: 'air_quality_pm10', type: 'REAL' },
      { name: 'air_quality_index', type: 'INTEGER' },
      { name: 'pressure_trend', type: 'TEXT' },
      { name: 'moon_phase', type: 'TEXT' },
      { name: 'moon_illumination', type: 'REAL' },
      { name: 'weather_condition', type: 'TEXT' },
      { name: 'sunrise', type: 'TIME' },
      { name: 'sunset', type: 'TIME' }
    ];
    
    addColumnsIfNotExist.forEach(column => {
      try {
        this.db.exec(`ALTER TABLE weather_data ADD COLUMN ${column.name} ${column.type};`);
        console.log(`Added column ${column.name} to weather_data table`);
      } catch (error) {
        // Column already exists, ignore
        if (!error.message.includes('duplicate column name')) {
          console.error(`Error adding column ${column.name}:`, error.message);
        }
      }
    });

    // Index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_weather_city_time ON weather_data (city_id, recorded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_weather_city_name_time ON weather_data (city_name, recorded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_cities_name ON cities (name);
      CREATE INDEX IF NOT EXISTS idx_cities_active ON cities (is_active);
    `);

    // Create alert tables
    this.createAlertTables();

    console.log('Database tables and indexes created/verified.');
  }

  createAlertTables() {
    // Flood alerts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS flood_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_id INTEGER NOT NULL,
        city_name TEXT NOT NULL,
        alert_level TEXT NOT NULL CHECK (alert_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        rainfall_1h REAL NOT NULL,
        rainfall_24h REAL DEFAULT 0,
        threshold_exceeded REAL NOT NULL,
        alert_message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id)
      );
    `);

    // Heat alerts table  
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS heat_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_id INTEGER NOT NULL,
        city_name TEXT NOT NULL,
        alert_level TEXT NOT NULL CHECK (alert_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        temperature REAL NOT NULL,
        heat_index REAL,
        threshold_exceeded REAL NOT NULL,
        alert_message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id)
      );
    `);

    // Alert thresholds configuration table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alert_thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert_type TEXT NOT NULL CHECK (alert_type IN ('FLOOD', 'HEAT')),
        level TEXT NOT NULL CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        threshold_value REAL NOT NULL,
        threshold_unit TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Alert subscriptions table (for managing user subscriptions)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alert_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        socket_id TEXT NOT NULL,
        city_id INTEGER,
        city_name TEXT,
        alert_types TEXT NOT NULL, -- JSON array of alert types
        subscription_level TEXT DEFAULT 'MEDIUM', -- minimum level to receive
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for alert tables
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_flood_alerts_city_active ON flood_alerts (city_id, is_active, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_heat_alerts_city_active ON heat_alerts (city_id, is_active, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_alert_thresholds_type_level ON alert_thresholds (alert_type, level);
      CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_socket ON alert_subscriptions (socket_id);
      CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_city ON alert_subscriptions (city_id);
    `);

    // Insert default thresholds
    this.insertDefaultThresholds();

    console.log('Alert tables and indexes created/verified.');
  }

  insertDefaultThresholds() {
    // Check if thresholds already exist
    const existingThresholds = this.db.prepare('SELECT COUNT(*) as count FROM alert_thresholds').get();
    
    if (existingThresholds.count === 0) {
      const insertThreshold = this.db.prepare(`
        INSERT INTO alert_thresholds (alert_type, level, threshold_value, threshold_unit, description)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Flood thresholds (rainfall in mm/hour)
      const floodThresholds = [
        ['FLOOD', 'LOW', 5, 'mm/h', 'Light rainfall - monitor conditions'],
        ['FLOOD', 'MEDIUM', 10, 'mm/h', 'Moderate rainfall - potential flooding in low-lying areas'],
        ['FLOOD', 'HIGH', 20, 'mm/h', 'Heavy rainfall - flooding likely in vulnerable areas'],
        ['FLOOD', 'CRITICAL', 50, 'mm/h', 'Extreme rainfall - severe flooding expected']
      ];

      // Heat thresholds (temperature in Celsius)
      const heatThresholds = [
        ['HEAT', 'LOW', 35, '°C', 'High temperature - stay hydrated'],
        ['HEAT', 'MEDIUM', 40, '°C', 'Very high temperature - avoid prolonged outdoor exposure'],
        ['HEAT', 'HIGH', 45, '°C', 'Dangerous heat - heat stroke risk'],
        ['HEAT', 'CRITICAL', 50, '°C', 'Extreme heat - emergency conditions']
      ];

      const insertMany = this.db.transaction((thresholds) => {
        for (const threshold of thresholds) {
          insertThreshold.run(...threshold);
        }
      });

      insertMany([...floodThresholds, ...heatThresholds]);
      console.log('Default alert thresholds inserted.');
    }
  }

  loadCityData() {
    try {
      const citiesPath = path.join(__dirname, '../data/cities.json');
      const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
      
      const insertCity = this.db.prepare(`
        INSERT OR REPLACE INTO cities 
        (id, name, state, imd_id, latitude, longitude, timezone, population, region, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);

      const insertMany = this.db.transaction((cities) => {
        for (const city of cities) {
          insertCity.run(
            city.id, city.name, city.state, city.imd_id,
            city.latitude, city.longitude, city.timezone,
            city.population, city.region
          );
        }
      });

      insertMany(citiesData.cities);
      console.log(`Loaded ${citiesData.cities.length} cities into database.`);
    } catch (error) {
      console.error('Error loading city data:', error.message);
    }
  }

  insertWeatherData(data) {
    const stmt = this.db.prepare(`
      INSERT INTO weather_data 
      (city_id, city_name, temperature, feels_like, temp_min, temp_max, humidity, pressure, 
       rainfall, rainfall_24h, wind_speed, wind_direction, wind_gust, visibility, uv_index, 
       cloud_cover, dew_point, heat_index, wind_chill, soil_temperature, soil_moisture,
       evapotranspiration, growing_degree_days, air_quality_pm25, air_quality_pm10, 
       air_quality_index, pressure_trend, moon_phase, moon_illumination,
       weather_description, weather_condition, data_source, sunrise, sunset, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Get city coordinates
    const city = this.getCityByName(data.city_name);
    const latitude = city ? city.latitude : null;
    const longitude = city ? city.longitude : null;
    
    stmt.run(
      data.city_id, data.city_name, 
      data.temperature, data.feels_like || data.temperature, 
      data.temp_min || data.temperature, data.temp_max || data.temperature,
      data.humidity, data.pressure || null,
      data.rainfall, data.rainfall_24h || 0,
      data.wind_speed || null, data.wind_direction || null, data.wind_gust || null,
      data.visibility || null, data.uv_index || null, data.cloud_cover || null,
      data.dew_point || null, data.heat_index || null, data.wind_chill || null,
      data.soil_temperature || null, data.soil_moisture || null,
      data.evapotranspiration || null, data.growing_degree_days || null,
      data.air_quality_pm25 || null, data.air_quality_pm10 || null, data.air_quality_index || null,
      data.pressure_trend || null, data.moon_phase || null, data.moon_illumination || null,
      data.weather_description, data.weather_condition || null,
      data.data_source, data.sunrise || null, data.sunset || null,
      latitude, longitude
    );
  }

  getLatestWeather(cityName) {
    const stmt = this.db.prepare(`
      SELECT * FROM weather_data 
      WHERE city_name = ? 
      ORDER BY recorded_at DESC 
      LIMIT 1
    `);
    return stmt.get(cityName);
  }

  // New methods for expanded functionality
  getAllCities() {
    const stmt = this.db.prepare(`
      SELECT * FROM cities 
      WHERE is_active = 1 
      ORDER BY population DESC
    `);
    return stmt.all();
  }

  getCityByName(name) {
    const stmt = this.db.prepare(`
      SELECT * FROM cities 
      WHERE name = ? AND is_active = 1
    `);
    return stmt.get(name);
  }

  getCityById(id) {
    const stmt = this.db.prepare(`
      SELECT * FROM cities 
      WHERE id = ? AND is_active = 1
    `);
    return stmt.get(id);
  }

  getCitiesByRegion(region) {
    const stmt = this.db.prepare(`
      SELECT * FROM cities 
      WHERE region = ? AND is_active = 1 
      ORDER BY population DESC
    `);
    return stmt.all(region);
  }

  getCitiesByState(state) {
    const stmt = this.db.prepare(`
      SELECT * FROM cities 
      WHERE state = ? AND is_active = 1 
      ORDER BY population DESC
    `);
    return stmt.all(state);
  }

  getWeatherHistory(cityName, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM weather_data 
      WHERE city_name = ? 
      ORDER BY recorded_at DESC 
      LIMIT ?
    `);
    return stmt.all(cityName, limit);
  }

  getLatestWeatherForAllCities() {
    const stmt = this.db.prepare(`
      SELECT DISTINCT 
        w1.city_name,
        w1.temperature,
        w1.humidity,
        w1.rainfall,
        w1.weather_description,
        w1.data_source,
        w1.recorded_at,
        c.state,
        c.region,
        c.latitude,
        c.longitude
      FROM weather_data w1
      INNER JOIN cities c ON w1.city_name = c.name
      INNER JOIN (
        SELECT city_name, MAX(recorded_at) as max_time
        FROM weather_data
        GROUP BY city_name
      ) w2 ON w1.city_name = w2.city_name AND w1.recorded_at = w2.max_time
      WHERE c.is_active = 1
      ORDER BY c.population DESC
    `);
    return stmt.all();
  }

  cleanOldWeatherData(daysToKeep = 30) {
    const stmt = this.db.prepare(`
      DELETE FROM weather_data 
      WHERE recorded_at < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysToKeep);
    console.log(`Cleaned ${result.changes} old weather records.`);
    return result.changes;
  }

  // =============== ALERT MANAGEMENT METHODS ===============

  // Insert flood alert
  insertFloodAlert(alertData) {
    const stmt = this.db.prepare(`
      INSERT INTO flood_alerts 
      (city_id, city_name, alert_level, rainfall_1h, rainfall_24h, threshold_exceeded, alert_message, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      alertData.city_id, alertData.city_name, alertData.alert_level,
      alertData.rainfall_1h, alertData.rainfall_24h || 0, alertData.threshold_exceeded,
      alertData.alert_message, alertData.expires_at
    );
  }

  // Insert heat alert
  insertHeatAlert(alertData) {
    const stmt = this.db.prepare(`
      INSERT INTO heat_alerts 
      (city_id, city_name, alert_level, temperature, heat_index, threshold_exceeded, alert_message, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      alertData.city_id, alertData.city_name, alertData.alert_level,
      alertData.temperature, alertData.heat_index || null, alertData.threshold_exceeded,
      alertData.alert_message, alertData.expires_at
    );
  }

  // Get active alerts for a city
  getActiveAlertsForCity(cityId) {
    const floodStmt = this.db.prepare(`
      SELECT 'FLOOD' as alert_type, * FROM flood_alerts 
      WHERE city_id = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `);
    
    const heatStmt = this.db.prepare(`
      SELECT 'HEAT' as alert_type, * FROM heat_alerts 
      WHERE city_id = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `);
    
    const floodAlerts = floodStmt.all(cityId);
    const heatAlerts = heatStmt.all(cityId);
    
    return {
      flood: floodAlerts,
      heat: heatAlerts,
      total: floodAlerts.length + heatAlerts.length
    };
  }

  // Get all active alerts
  getAllActiveAlerts() {
    const stmt = this.db.prepare(`
      SELECT 
        'FLOOD' as alert_type,
        fa.*,
        c.name as city_name,
        c.state,
        c.region
      FROM flood_alerts fa
      INNER JOIN cities c ON fa.city_id = c.id
      WHERE fa.is_active = 1 AND (fa.expires_at IS NULL OR fa.expires_at > datetime('now'))
      
      UNION ALL
      
      SELECT 
        'HEAT' as alert_type,
        ha.*,
        c.name as city_name,
        c.state,
        c.region
      FROM heat_alerts ha
      INNER JOIN cities c ON ha.city_id = c.id
      WHERE ha.is_active = 1 AND (ha.expires_at IS NULL OR ha.expires_at > datetime('now'))
      
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  // Get alert thresholds
  getAlertThresholds(alertType = null) {
    let query = 'SELECT * FROM alert_thresholds WHERE is_active = 1';
    const params = [];
    
    if (alertType) {
      query += ' AND alert_type = ?';
      params.push(alertType);
    }
    
    query += ' ORDER BY alert_type, threshold_value ASC';
    
    const stmt = this.db.prepare(query);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
  }

  // Deactivate old alerts for a city and alert type
  deactivateOldAlerts(cityId, alertType) {
    const table = alertType === 'FLOOD' ? 'flood_alerts' : 'heat_alerts';
    const stmt = this.db.prepare(`
      UPDATE ${table} 
      SET is_active = 0, updated_at = datetime('now')
      WHERE city_id = ? AND is_active = 1
    `);
    return stmt.run(cityId);
  }

  // Subscribe to alerts
  subscribeToAlerts(socketId, cityId, cityName, alertTypes, subscriptionLevel = 'MEDIUM') {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO alert_subscriptions 
      (socket_id, city_id, city_name, alert_types, subscription_level, last_active)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    return stmt.run(socketId, cityId, cityName, JSON.stringify(alertTypes), subscriptionLevel);
  }

  // Get alert subscriptions
  getAlertSubscriptions(socketId = null) {
    let query = 'SELECT * FROM alert_subscriptions';
    const params = [];
    
    if (socketId) {
      query += ' WHERE socket_id = ?';
      params.push(socketId);
    }
    
    const stmt = this.db.prepare(query);
    const subscriptions = params.length > 0 ? stmt.all(...params) : stmt.all();
    
    // Parse alert_types JSON
    return subscriptions.map(sub => ({
      ...sub,
      alert_types: JSON.parse(sub.alert_types)
    }));
  }

  // Clean expired alerts
  cleanExpiredAlerts() {
    const floodStmt = this.db.prepare(`
      UPDATE flood_alerts 
      SET is_active = 0, updated_at = datetime('now')
      WHERE expires_at IS NOT NULL AND expires_at <= datetime('now') AND is_active = 1
    `);
    
    const heatStmt = this.db.prepare(`
      UPDATE heat_alerts 
      SET is_active = 0, updated_at = datetime('now')
      WHERE expires_at IS NOT NULL AND expires_at <= datetime('now') AND is_active = 1
    `);
    
    const floodResult = floodStmt.run();
    const heatResult = heatStmt.run();
    
    const totalCleaned = floodResult.changes + heatResult.changes;
    if (totalCleaned > 0) {
      console.log(`Cleaned ${totalCleaned} expired alerts.`);
    }
    
    return totalCleaned;
  }
}

module.exports = ClimateDatabase;
