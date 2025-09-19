// routes/weather.js
const express = require('express');
const router = express.Router();
const ClimateDB = require('../database/db');

// We'll receive the shared API instance as a parameter
let climateAPI;
let climateDB;

const cityIds = {
  Delhi: 42182,
  Mumbai: 43003,
  Chennai: 43279,
};

// Initialize with shared instances
function initializeRouter(sharedAPI, sharedDB) {
  climateAPI = sharedAPI;
  climateDB = sharedDB;
}

router.get('/current/:city', async (req, res) => {
  try {
    const city = req.params.city;

    if (!climateDB) {
      return res.status(500).json({ success: false, error: 'Database not initialized' });
    }

    // Check if city exists in our database
    const cityInfo = climateDB.getCityByName(city);
    if (!cityInfo) {
      return res.status(404).json({ 
        success: false, 
        error: `City '${city}' not found. Use /api/weather/cities to see available cities.` 
      });
    }

    if (!climateAPI) {
      return res.status(500).json({ success: false, error: 'API service not initialized' });
    }

    console.log(`Fetching weather data for ${city} (ID: ${cityInfo.id})...`);
    const weather = await climateAPI.getComprehensiveWeather(city, cityInfo.imd_id);
    
    console.log('Weather data received:', {
      city: weather.city,
      hasOpenWeather: !!weather.openWeatherData,
      hasIMD: !!weather.imdData
    });

    // Always save data if we have OpenWeather data (real or mock)
    if (weather?.openWeatherData?.data) {
      const dataToSave = {
        city_id: cityInfo.id,
        city_name: city,
        temperature: weather.openWeatherData.data.main.temp ?? 0,
        humidity: weather.openWeatherData.data.main.humidity ?? 0,
        rainfall: weather.openWeatherData.data.rain?.['1h'] ?? 0,
        weather_description: weather.openWeatherData.data.weather?.[0]?.description ?? 'Unknown',
        data_source: weather.openWeatherData.source || 'OpenWeather',
      };

      try {
        climateDB.insertWeatherData(dataToSave);
        console.log(`Weather data saved for ${city}`);
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
        // Continue anyway - don't fail the request
      }
    } else {
      console.log(`No weather data available for ${city}`);
    }

    // Include city metadata in response
    const response = {
      ...weather,
      cityInfo: cityInfo
    };

    return res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error in /current/:city route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Debug route to test API keys and endpoints
router.get('/debug/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const cityId = cityIds[city] || 42182; // Default to Delhi
    
    console.log('=== DEBUG ROUTE CALLED ===');
    console.log('City:', city);
    console.log('City ID:', cityId);
    console.log('OpenWeather API Key configured:', !!process.env.OPENWEATHER_API_KEY);
    console.log('OpenWeather API Key value:', process.env.OPENWEATHER_API_KEY?.substring(0, 8) + '...');
    
    // Test OpenWeather individually
    console.log('\n--- Testing OpenWeather API ---');
    const openWeatherResult = await climateAPI.getOpenWeatherData(city);
    
    // Test IMD individually  
    console.log('\n--- Testing IMD API ---');
    const imdResult = await climateAPI.getIMDWeather(cityId);
    
    const debugInfo = {
      city,
      cityId,
      apiKeyConfigured: !!process.env.OPENWEATHER_API_KEY,
      apiKeyLength: process.env.OPENWEATHER_API_KEY?.length || 0,
      openWeatherResult: openWeatherResult ? 'SUCCESS' : 'FAILED',
      imdResult: imdResult ? 'SUCCESS' : 'FAILED',
      openWeatherData: openWeatherResult,
      imdData: imdResult
    };
    
    return res.json({ success: true, debug: debugInfo });
  } catch (error) {
    console.error('Error in debug route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest cached data from database
router.get('/latest/:city', async (req, res) => {
  try {
    const city = req.params.city;

    if (!climateDB) {
      return res.status(500).json({ success: false, error: 'Database not initialized' });
    }

    // Check if city exists in our database
    const cityInfo = climateDB.getCityByName(city);
    if (!cityInfo) {
      return res.status(404).json({ 
        success: false, 
        error: `City '${city}' not found. Use /api/weather/cities to see available cities.` 
      });
    }

    console.log(`Getting latest cached data for ${city}...`);
    const latestData = climateDB.getLatestWeather(city);
    
    if (latestData) {
      // Convert database format to frontend format
      const weatherDisplay = {
        city_name: city,
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        rainfall: latestData.rainfall,
        weather_description: latestData.weather_description,
        data_source: latestData.data_source,
        recorded_at: latestData.recorded_at,
        cityInfo: cityInfo
      };
      
      return res.json({ success: true, data: weatherDisplay, cached: true });
    } else {
      return res.json({ success: false, error: 'No cached data available' });
    }
  } catch (error) {
    console.error('Error getting latest data:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CITY MANAGEMENT ENDPOINTS ====================

// Get all available cities
router.get('/cities', async (req, res) => {
  try {
    const { region, state, limit } = req.query;
    let cities;

    if (region) {
      cities = climateDB.getCitiesByRegion(region);
    } else if (state) {
      cities = climateDB.getCitiesByState(state);
    } else {
      cities = climateDB.getAllCities();
    }

    // Apply limit if specified
    if (limit && !isNaN(limit)) {
      cities = cities.slice(0, parseInt(limit));
    }

    return res.json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get city details by name or ID
router.get('/cities/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let city;

    // Check if identifier is numeric (ID) or string (name)
    if (!isNaN(identifier)) {
      city = climateDB.getCityById(parseInt(identifier));
    } else {
      city = climateDB.getCityByName(identifier);
    }

    if (!city) {
      return res.status(404).json({
        success: false,
        error: `City '${identifier}' not found`
      });
    }

    return res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city details:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all regions
router.get('/regions', async (req, res) => {
  try {
    const cities = climateDB.getAllCities();
    const regions = [...new Set(cities.map(city => city.region))].sort();
    
    return res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all states
router.get('/states', async (req, res) => {
  try {
    const cities = climateDB.getAllCities();
    const states = [...new Set(cities.map(city => city.state))].sort();
    
    return res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENHANCED WEATHER ENDPOINTS ====================

// Get latest weather for all cities
router.get('/all', async (req, res) => {
  try {
    const weatherData = climateDB.getLatestWeatherForAllCities();
    
    return res.json({
      success: true,
      count: weatherData.length,
      data: weatherData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching all weather data:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get weather history for a city
router.get('/history/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 24 } = req.query; // Default 24 records

    const cityInfo = climateDB.getCityByName(city);
    if (!cityInfo) {
      return res.status(404).json({
        success: false,
        error: `City '${city}' not found`
      });
    }

    const history = climateDB.getWeatherHistory(city, parseInt(limit));
    
    return res.json({
      success: true,
      city: cityInfo,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching weather history:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = { router, initializeRouter };
