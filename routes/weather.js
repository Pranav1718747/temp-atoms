// routes/weather.js
const express = require('express');
const axios = require('axios');
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
      hasIMD: !!weather.imdData,
      hasOpenMeteo: !!weather.openMeteoData
    });

    // Prioritize data sources: Open-Meteo (free, reliable) > OpenWeather > Mock
    let primaryWeatherData;
    let dataSource;
    
    if (weather?.openMeteoData?.data) {
      primaryWeatherData = weather.openMeteoData.data;
      dataSource = weather.openMeteoData.source;
    } else if (weather?.openWeatherData?.data) {
      primaryWeatherData = weather.openWeatherData.data;
      dataSource = weather.openWeatherData.source;
    } else {
      console.log(`No weather data available for ${city}`);
      return res.status(503).json({ 
        success: false, 
        error: 'Weather data temporarily unavailable' 
      });
    }

    // Save data to database
    if (primaryWeatherData) {
      const dataToSave = {
        city_id: cityInfo.id,
        city_name: city,
        temperature: primaryWeatherData.main.temp ?? 0,
        humidity: primaryWeatherData.main.humidity ?? 0,
        rainfall: primaryWeatherData.rain?.['1h'] ?? 0,
        weather_description: primaryWeatherData.weather?.[0]?.description ?? 'Unknown',
        data_source: dataSource || 'Unknown',
      };

      try {
        climateDB.insertWeatherData(dataToSave);
        console.log(`Weather data saved for ${city} from ${dataSource}`);
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
        // Continue anyway - don't fail the request
      }
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
    
    // Test all APIs individually
    console.log('\n--- Testing Open-Meteo API (Free) ---');
    const openMeteoResult = await climateAPI.getOpenMeteoWeather(city);
    
    console.log('\n--- Testing OpenWeather API ---');
    const openWeatherResult = await climateAPI.getOpenWeatherData(city);
    
    console.log('\n--- Testing IMD API ---');
    const imdResult = await climateAPI.getIMDWeather(cityId);
    
    const debugInfo = {
      city,
      cityId,
      apiKeyConfigured: !!process.env.OPENWEATHER_API_KEY,
      apiKeyLength: process.env.OPENWEATHER_API_KEY?.length || 0,
      testResults: {
        openMeteo: openMeteoResult ? 'SUCCESS' : 'FAILED',
        openWeather: openWeatherResult ? 'SUCCESS' : 'FAILED',
        imd: imdResult ? 'SUCCESS' : 'FAILED'
      },
      detailedData: {
        openMeteoData: openMeteoResult,
        openWeatherData: openWeatherResult,
        imdData: imdResult
      }
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

// Get detailed Open-Meteo weather data with forecasts
router.get('/meteo/:city', async (req, res) => {
  try {
    const city = req.params.city;
    
    console.log(`Fetching detailed Open-Meteo data for ${city}...`);
    const meteoData = await climateAPI.getOpenMeteoWeather(city);
    
    if (!meteoData) {
      return res.status(404).json({
        success: false,
        error: `Could not fetch weather data for ${city} from Open-Meteo`
      });
    }
    
    return res.json({
      success: true,
      source: 'Open-Meteo',
      city: city,
      coordinates: meteoData.coords,
      current: {
        temperature: meteoData.data.main.temp,
        feels_like: meteoData.data.main.feels_like,
        humidity: meteoData.data.main.humidity,
        pressure: meteoData.data.main.pressure,
        wind_speed: meteoData.data.wind.speed,
        wind_direction: meteoData.data.wind.deg,
        precipitation: meteoData.data.rain['1h'],
        uv_index: meteoData.data.uv_index,
        weather_description: meteoData.data.weather[0].description,
        is_day: meteoData.data.is_day,
        cloud_cover: meteoData.data.clouds.all,
        visibility: meteoData.data.visibility
      },
      agricultural: {
        heat_index: meteoData.data.heat_index,
        soil_temperature: meteoData.data.soil_temperature,
        soil_moisture: meteoData.data.soil_moisture,
        evapotranspiration: meteoData.data.evapotranspiration,
        growing_degree_days: meteoData.data.growing_degree_days,
        dew_point: meteoData.data.dew_point
      },
      forecasts: {
        hourly: meteoData.data.hourly_forecast,
        daily: meteoData.data.daily_forecast
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /meteo/:city route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get weather for ANY location (city, village, area) - NEW ENHANCED ENDPOINT
router.get('/location/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const country = req.query.country; // Optional country parameter
    
    console.log(`Fetching weather for any location: ${location}${country ? `, ${country}` : ''}`);
    
    const weatherData = await climateAPI.getWeatherForAnyLocation(location, country);
    
    if (!weatherData.success) {
      return res.status(404).json(weatherData);
    }
    
    return res.json(weatherData);
    
  } catch (error) {
    console.error('Error in /location/:location route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      location: req.params.location
    });
  }
});

// Search for locations (cities, villages, areas) - LOCATION SEARCH ENDPOINT
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const country = req.query.country;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`Searching for locations matching: ${query}`);
    
    const searchParams = {
      name: query,
      count: limit,
      language: 'en',
      format: 'json'
    };
    
    if (country) {
      searchParams.country = country;
    }
    
    const response = await axios.get(`${climateAPI.geocodingURL}/search`, {
      params: searchParams
    });
    
    if (!response.data || !response.data.results) {
      return res.json({
        success: false,
        message: 'No locations found',
        query: query,
        results: []
      });
    }
    
    const locations = response.data.results.map(result => ({
      name: result.name,
      country: result.country,
      admin1: result.admin1, // State/Province
      admin2: result.admin2, // District/County  
      admin3: result.admin3, // City/Town
      admin4: result.admin4, // Village/Neighborhood
      latitude: result.latitude,
      longitude: result.longitude,
      elevation: result.elevation,
      timezone: result.timezone,
      population: result.population,
      postcodes: result.postcodes,
      feature_code: result.feature_code // PPL = populated place, PPLC = capital, etc.
    }));
    
    return res.json({
      success: true,
      query: query,
      count: locations.length,
      results: locations
    });
    
  } catch (error) {
    console.error('Error in location search route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      query: req.params.query
    });
  }
});

// Get weather by exact coordinates - COORDINATES ENDPOINT
router.get('/coordinates/:lat/:lon', async (req, res) => {
  try {
    const latitude = parseFloat(req.params.lat);
    const longitude = parseFloat(req.params.lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Please provide valid latitude and longitude.'
      });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180.'
      });
    }
    
    console.log(`Fetching weather for coordinates: ${latitude}, ${longitude}`);
    
    const locationInfo = {
      latitude: latitude,
      longitude: longitude,
      name: `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      country: 'Unknown',
      admin1: 'Unknown'
    };
    
    const weatherData = await climateAPI.getDetailedWeatherByCoordinates(
      latitude, 
      longitude, 
      locationInfo
    );
    
    return res.json({
      success: true,
      coordinates: { latitude, longitude },
      weather: weatherData,
      source: 'Open-Meteo',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in coordinates route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      coordinates: {
        latitude: req.params.lat,
        longitude: req.params.lon
      }
    });
  }
});

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
