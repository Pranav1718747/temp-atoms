const express = require('express');
const router = express.Router();
const AICoordinator = require('../services/aiCoordinator');

let farmingService;
let climateDB;
let climateAPI;
let aiCoordinator;

function initializeFarmingRouter(farmingServiceInstance, climateDBInstance, climateAPIInstance) {
  farmingService = farmingServiceInstance;
  climateDB = climateDBInstance;
  climateAPI = climateAPIInstance;
  aiCoordinator = new AICoordinator();
}

// Get farming recommendations for a specific city and crop
router.get('/recommendations/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const cropType = req.query.crop || 'rice';
    const growthStage = req.query.stage || 'vegetative';
    
    // Get latest weather data for the city
    const weatherData = climateDB.getLatestWeather(cityName);
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data found for ${cityName}`
      });
    }
    
    // Generate farming recommendations
    const recommendations = farmingService.generateFarmingRecommendations(
      weatherData,
      cropType,
      growthStage
    );
    
    res.json({
      success: true,
      data: {
        city: cityName,
        weather: weatherData,
        recommendations: recommendations,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating farming recommendations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate farming recommendations'
    });
  }
});

// Get suitable crops for current weather in a city
router.get('/suitable-crops/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    
    // Get latest weather data
    const weatherData = climateDB.getLatestWeather(cityName);
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data found for ${cityName}`
      });
    }
    
    // Get suitable crops
    const suitableCrops = farmingService.getSuitableCrops(weatherData);
    
    res.json({
      success: true,
      data: {
        city: cityName,
        weather: weatherData,
        suitable_crops: suitableCrops,
        current_season: farmingService.getCurrentSeason(),
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting suitable crops:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get suitable crops'
    });
  }
});

// Get available crops and their information
router.get('/crops', (req, res) => {
  try {
    const season = req.query.season || farmingService.getCurrentSeason();
    
    const allCrops = Object.entries(farmingService.cropData).map(([key, crop]) => ({
      ...crop,
      key,
      suitable_for_season: crop.seasons.includes(season)
    }));
    
    res.json({
      success: true,
      data: {
        crops: allCrops,
        current_season: season,
        growth_stages: farmingService.growthStages
      }
    });
    
  } catch (error) {
    console.error('Error getting crops data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get crops data'
    });
  }
});

// Get farming dashboard data for a city (comprehensive farming info)
router.get('/dashboard/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const defaultCrop = req.query.crop || 'rice';
    const defaultStage = req.query.stage || 'vegetative';
    
    // First try to get weather data from local database
    let weatherData = climateDB.getLatestWeather(cityName);
    let cityInfo = climateDB.getCityByName(cityName);
    let isGlobalLocation = false;
    
    // If not found in local database, try to get from global weather API
    if (!weatherData && climateAPI) {
      console.log(`City '${cityName}' not found in local database, attempting global weather lookup...`);
      
      try {
        // Use the global weather API to get data for any location
        const globalWeatherResponse = await climateAPI.getWeatherForAnyLocation(cityName);
        
        if (globalWeatherResponse.success && globalWeatherResponse.weather) {
          console.log(`Successfully found global weather data for ${cityName}`);
          
          // Transform global weather data to local format
          const globalWeather = globalWeatherResponse.weather.current;
          weatherData = {
            id: Date.now(), // Temporary ID
            city_id: 0, // Global location
            city_name: cityName,
            temperature: globalWeather.temperature,
            feels_like: globalWeather.feels_like || globalWeather.temperature,
            temp_min: globalWeather.temperature - 2, // Approximate
            temp_max: globalWeather.temperature + 2, // Approximate
            humidity: globalWeather.humidity,
            pressure: globalWeather.pressure,
            rainfall: globalWeather.precipitation || 0,
            rainfall_24h: globalWeather.precipitation || 0,
            wind_speed: globalWeather.wind_speed,
            wind_direction: globalWeather.wind_direction,
            wind_gust: globalWeather.wind_gust,
            visibility: globalWeather.visibility,
            uv_index: globalWeather.uv_index,
            cloud_cover: globalWeather.cloud_cover,
            dew_point: globalWeather.dew_point,
            heat_index: globalWeather.heat_index,
            wind_chill: globalWeather.wind_chill,
            soil_temperature: globalWeather.soil_temperature,
            soil_moisture: globalWeather.soil_moisture,
            evapotranspiration: globalWeather.evapotranspiration,
            growing_degree_days: globalWeather.growing_degree_days,
            air_quality_pm25: globalWeather.air_quality_pm25,
            air_quality_pm10: globalWeather.air_quality_pm10,
            air_quality_index: globalWeather.air_quality_index,
            pressure_trend: globalWeather.pressure_trend,
            moon_phase: globalWeather.moon_phase,
            moon_illumination: globalWeather.moon_illumination,
            weather_description: globalWeather.weather_description || 'Current conditions',
            weather_condition: globalWeather.weather_condition || 'Clear',
            data_source: 'Global Weather API',
            sunrise: globalWeather.sunrise,
            sunset: globalWeather.sunset,
            recorded_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            latitude: globalWeatherResponse.location?.latitude,
            longitude: globalWeatherResponse.location?.longitude
          };
          
          // Create temporary city info for global location
          cityInfo = {
            id: 0,
            name: cityName,
            latitude: globalWeatherResponse.location?.latitude,
            longitude: globalWeatherResponse.location?.longitude,
            country: globalWeatherResponse.location?.country || 'Global',
            state: globalWeatherResponse.location?.admin1 || 'Unknown',
            region: globalWeatherResponse.location?.admin2 || 'Unknown'
          };
          
          isGlobalLocation = true;
          console.log(`Transformed global weather data for ${cityName}:`, weatherData);
        }
      } catch (globalError) {
        console.error(`Error fetching global weather for ${cityName}:`, globalError.message);
      }
    }
    
    // If still no weather data found, return error
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data found for ${cityName}. Please try a different location or check spelling.`
      });
    }
    
    // Get comprehensive farming data
    const recommendations = farmingService.generateFarmingRecommendations(
      weatherData,
      defaultCrop,
      defaultStage
    );
    
    const suitableCrops = farmingService.getSuitableCrops(weatherData);
    const currentSeason = farmingService.getCurrentSeason();
    
    // Set cache-busting headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        city: cityInfo || { name: cityName },
        weather: weatherData,
        season: currentSeason,
        selected_crop: {
          type: defaultCrop,
          stage: defaultStage,
          recommendations: recommendations
        },
        suitable_crops: suitableCrops.slice(0, 6), // Top 6 suitable crops
        farming_alerts: recommendations.alerts || [],
        last_updated: weatherData.recorded_at,
        generated_at: new Date().toISOString(),
        is_global_location: isGlobalLocation
      }
    });
    
  } catch (error) {
    console.error('Error generating farming dashboard:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate farming dashboard'
    });
  }
});

// Get seasonal farming calendar
router.get('/calendar', (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = farmingService.getCurrentSeason();
    
    const calendar = {
      current_month: currentMonth,
      current_season: currentSeason,
      kharif_crops: Object.entries(farmingService.cropData)
        .filter(([key, crop]) => crop.seasons.includes('Kharif'))
        .map(([key, crop]) => ({ ...crop, key })),
      rabi_crops: Object.entries(farmingService.cropData)
        .filter(([key, crop]) => crop.seasons.includes('Rabi'))
        .map(([key, crop]) => ({ ...crop, key })),
      seasonal_advice: {
        Kharif: {
          months: 'June - November',
          activities: ['Sowing', 'Monsoon management', 'Pest control', 'Harvesting'],
          focus: 'Rain-fed crops, water management'
        },
        Rabi: {
          months: 'December - May',
          activities: ['Sowing', 'Irrigation planning', 'Growth monitoring', 'Harvesting'],
          focus: 'Irrigation-dependent crops, temperature management'
        }
      }
    };
    
    res.json({
      success: true,
      data: calendar
    });
    
  } catch (error) {
    console.error('Error generating farming calendar:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate farming calendar'
    });
  }
});

// ===== NEW EXTERNAL CROP API ROUTES =====

// Get external crop data
router.get('/external-crop/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const location = {
      state: req.query.state || '',
      district: req.query.district || '',
      market: req.query.market || ''
    };
    
    const cropData = await farmingService.getExternalCropData(cropName, location);
    
    res.json({
      success: true,
      data: cropData
    });
    
  } catch (error) {
    console.error('Error fetching external crop data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch external crop data'
    });
  }
});

// Get crop production statistics
router.get('/production/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const year = req.query.year || new Date().getFullYear();
    
    const productionStats = await farmingService.getCropProductionStats(cropName, year);
    
    res.json({
      success: true,
      data: productionStats
    });
    
  } catch (error) {
    console.error('Error fetching crop production stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop production statistics'
    });
  }
});

// Get crop market prices
router.get('/prices/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const marketName = req.query.market || '';
    
    const priceData = await farmingService.getCropMarketPrices(cropName, marketName);
    
    res.json({
      success: true,
      data: priceData
    });
    
  } catch (error) {
    console.error('Error fetching crop prices:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop market prices'
    });
  }
});

// Get enhanced crop recommendations with external data
router.get('/enhanced-recommendations/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const location = {
      state: req.query.state || '',
      district: req.query.district || '',
      market: req.query.market || ''
    };
    
    // First try to get weather data from local database
    let weatherData = climateDB.getLatestWeather(cityName);
    
    // If not found in local database, try to get from global weather API
    if (!weatherData && climateAPI) {
      console.log(`City '${cityName}' not found in local database for enhanced recommendations, attempting global weather lookup...`);
      
      try {
        // Use the global weather API to get data for any location
        const globalWeatherResponse = await climateAPI.getWeatherForAnyLocation(cityName);
        
        if (globalWeatherResponse.success && globalWeatherResponse.weather) {
          console.log(`Successfully found global weather data for enhanced recommendations: ${cityName}`);
          
          // Transform global weather data to local format
          const globalWeather = globalWeatherResponse.weather.current;
          weatherData = {
            temperature: globalWeather.temperature,
            humidity: globalWeather.humidity,
            pressure: globalWeather.pressure,
            rainfall: globalWeather.precipitation || 0,
            wind_speed: globalWeather.wind_speed,
            wind_direction: globalWeather.wind_direction,
            weather_description: globalWeather.weather_description || 'Current conditions',
            data_source: 'Global Weather API',
            recorded_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
          };
        }
      } catch (globalError) {
        console.error(`Error fetching global weather for enhanced recommendations ${cityName}:`, globalError.message);
      }
    }
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data found for ${cityName}. Please try a different location.`
      });
    }
    
    const enhancedRecommendations = await farmingService.getEnhancedCropRecommendations(weatherData, location);
    
    // Set cache-busting headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      city: cityName,
      data: enhancedRecommendations
    });
    
  } catch (error) {
    console.error('Error getting enhanced recommendations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get enhanced crop recommendations'
    });
  }
});

// Search crops using external API
router.get('/search-crops', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchResults = await farmingService.searchCrops(query, limit);
    
    res.json({
      success: true,
      data: searchResults
    });
    
  } catch (error) {
    console.error('Error searching crops:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search crops'
    });
  }
});

// AI AGENTS ENDPOINTS

// Get comprehensive AI analysis
router.get('/ai-analysis/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const cropType = req.query.crop || 'rice';
    const farmSize = parseFloat(req.query.farmSize) || 1;
    
    // Set cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Get weather data (global or local)
    let weatherData = climateDB.getLatestWeather(cityName);
    let cityInfo = climateDB.getCityByName(cityName);
    let isGlobalLocation = false;
    
    if (!weatherData && climateAPI) {
      try {
        const globalWeatherResponse = await climateAPI.getWeatherForAnyLocation(cityName);
        if (globalWeatherResponse.success && globalWeatherResponse.weather) {
          const globalWeather = globalWeatherResponse.weather.current;
          weatherData = {
            temperature: globalWeather.temperature,
            humidity: globalWeather.humidity,
            rainfall: globalWeather.precipitation || 0,
            data_source: 'Global Weather API'
          };
          isGlobalLocation = true;
          cityInfo = {
            name: cityName,
            latitude: globalWeatherResponse.location?.latitude,
            longitude: globalWeatherResponse.location?.longitude
          };
        }
      } catch (globalError) {
        console.error(`Error fetching global weather for AI analysis:`, globalError.message);
      }
    }
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data available for ${cityName}`
      });
    }
    
    // Prepare farming context
    const farmingContext = {
      location: cityInfo,
      farmSize: farmSize,
      cropType: cropType,
      history: {}, // Could be enhanced with actual farming history
      market: {} // Could be enhanced with market data
    };
    
    // Get crop data
    const cropData = farmingService.cropData[cropType] || farmingService.cropData.rice;
    
    // Run AI analysis
    const aiAnalysis = await aiCoordinator.getComprehensiveAnalysis(
      weatherData, 
      cropData, 
      farmingContext
    );
    
    res.json({
      success: true,
      data: {
        city: cityInfo,
        weather: weatherData,
        ai_analysis: aiAnalysis,
        is_global_location: isGlobalLocation,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating AI analysis:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI analysis'
    });
  }
});

// Get specific AI agent analysis
router.get('/ai-agent/:agentName/:cityName', async (req, res) => {
  try {
    const { agentName, cityName } = req.params;
    const cropType = req.query.crop || 'rice';
    const farmSize = parseFloat(req.query.farmSize) || 1;
    
    // Get weather data
    let weatherData = climateDB.getLatestWeather(cityName);
    let cityInfo = climateDB.getCityByName(cityName);
    
    if (!weatherData && climateAPI) {
      try {
        const globalWeatherResponse = await climateAPI.getWeatherForAnyLocation(cityName);
        if (globalWeatherResponse.success && globalWeatherResponse.weather) {
          const globalWeather = globalWeatherResponse.weather.current;
          weatherData = {
            temperature: globalWeather.temperature,
            humidity: globalWeather.humidity,
            rainfall: globalWeather.precipitation || 0
          };
          cityInfo = {
            name: cityName,
            latitude: globalWeatherResponse.location?.latitude,
            longitude: globalWeatherResponse.location?.longitude
          };
        }
      } catch (error) {
        console.error('Error fetching global weather for agent analysis:', error.message);
      }
    }
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data available for ${cityName}`
      });
    }
    
    // Prepare context
    const context = {
      location: cityInfo,
      farmSize: farmSize,
      history: {},
      market: {}
    };
    
    // Get crop data
    const cropData = farmingService.cropData[cropType] || farmingService.cropData.rice;
    
    // Get specific agent analysis
    const agentAnalysis = await aiCoordinator.getAgentAnalysis(
      agentName, 
      weatherData, 
      cropData, 
      context
    );
    
    res.json({
      success: true,
      data: {
        city: cityInfo,
        weather: weatherData,
        agent_analysis: agentAnalysis,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting agent analysis:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent analysis'
    });
  }
});

// Get AI agent status
router.get('/ai-status', (req, res) => {
  try {
    const status = aiCoordinator.getAgentStatus();
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('Error getting AI status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI status'
    });
  }
});

// Get AI analysis history
router.get('/ai-history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const history = aiCoordinator.getAnalysisHistory(limit);
    
    res.json({
      success: true,
      data: {
        history: history,
        count: history.length
      }
    });
    
  } catch (error) {
    console.error('Error getting AI history:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI history'
    });
  }
});

// Clear AI analysis history
router.delete('/ai-history', (req, res) => {
  try {
    const result = aiCoordinator.clearHistory();
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error clearing AI history:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear AI history'
    });
  }
});

module.exports = { router, initializeFarmingRouter };