const express = require('express');
const router = express.Router();

let farmingService;
let climateDB;

function initializeFarmingRouter(farmingServiceInstance, climateDBInstance) {
  farmingService = farmingServiceInstance;
  climateDB = climateDBInstance;
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
    
    // Get weather data
    const weatherData = climateDB.getLatestWeather(cityName);
    
    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `No weather data found for ${cityName}`
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
    
    // Get city information
    const cityInfo = climateDB.getCityByName(cityName);
    
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
        generated_at: new Date().toISOString()
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

module.exports = { router, initializeFarmingRouter };