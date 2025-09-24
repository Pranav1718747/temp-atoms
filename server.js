const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ClimateAPIService = require('./utils/climateAPIs');
const ClimateDB = require('./database/db');
const AlertService = require('./services/alertService');
const FarmingService = require('./services/farmingService');
const MLService = require('./ml/ml_service');
const { 
  initializeAdvancedML, 
  getAdvancedWeatherPredictions,
  getAdvancedCropRecommendations,
  getAdvancedAlertPredictions,
  getComprehensiveInsights,
  getMLHealthStatus
} = require('./ml-ts/bridge.js');
const { router: weatherRouter, initializeRouter } = require('./routes/weather');
const { router: alertRouter, initializeAlertRouter } = require('./routes/alerts');
const { router: farmingRouter, initializeFarmingRouter } = require('./routes/farming');
const { router: mlRouter, initializeMLRouter } = require('./routes/ml');
const mlAdvancedRouter = require('./routes/ml-advanced');
const profitPredictionRouter = require('./routes/profit-prediction');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/api/weather', weatherRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/farming', farmingRouter);
app.use('/api/ml', mlRouter);
app.use('/api/ml-advanced', mlAdvancedRouter);
app.use('/api/profit', profitPredictionRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'ClimateSync backend is running!' });
});

// Initialize services
const climateAPI = new ClimateAPIService();
const climateDB = new ClimateDB();
const alertService = new AlertService(climateDB, io);
const farmingService = new FarmingService(climateDB);
const mlService = new MLService(climateDB, climateAPI);

// Initialize Advanced TypeScript ML Service
let advancedMLInitialized = false;
initializeAdvancedML(climateDB, climateAPI)
  .then(() => {
    advancedMLInitialized = true;
    console.log('🚀 Advanced TypeScript ML Service initialized successfully!');
  })
  .catch((error) => {
    console.error('❌ Failed to initialize Advanced TypeScript ML Service:', error);
  });

// Initialize route handlers with shared instances
initializeRouter(climateAPI, climateDB);
initializeAlertRouter(alertService);
initializeFarmingRouter(farmingService, climateDB, climateAPI);
initializeMLRouter(mlService);

// Get active cities from database
let cities = [];
let cityIds = {};

// Load cities from database
function loadCitiesFromDB() {
  try {
    const allCities = climateDB.getAllCities();
    cities = allCities.slice(0, 10).map(city => city.name);
    cityIds = {};
    
    allCities.forEach(city => {
      cityIds[city.name] = city.imd_id;
    });
    
    console.log(`Loaded ${cities.length} cities for weather monitoring:`, cities);
    console.log(`Total cities available: ${allCities.length}`);
  } catch (error) {
    console.error('Error loading cities from database:', error.message);
    // Fallback to original cities
    cities = ['Delhi', 'Mumbai', 'Chennai'];
    cityIds = { Delhi: 42182, Mumbai: 43003, Chennai: 43279 };
  }
}

io.on('connection', (socket) => {
  console.log('User connected via WebSocket');

  socket.on('subscribe_weather', (city) => {
    console.log(`User subscribed to ${city} weather`);
    socket.join(`weather_${city}`);
    
    // Save subscription to database
    try {
      const cityInfo = climateDB.getCityByName(city);
      if (cityInfo) {
        alertService.subscribeToAlerts(
          socket.id, 
          cityInfo.id, 
          city, 
          ['FLOOD', 'HEAT']
        );
      }
    } catch (error) {
      console.error('Error subscribing to alerts:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Clean up alert subscriptions for this socket
    try {
      climateDB.db.prepare('DELETE FROM alert_subscriptions WHERE socket_id = ?').run(socket.id);
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error.message);
    }
  });
});

// Fetch weather every 30 minutes and broadcast
setInterval(async () => {
  console.log('Fetching latest weather...');
  for (const city of cities) {
    try {
      const weather = await climateAPI.getComprehensiveWeather(city, cityIds[city]);
      
      // Prioritize Open-Meteo data, then OpenWeather, then fallback to mock
      let primaryWeatherData;
      let dataSource;
      
      if (weather.openMeteoData && weather.openMeteoData.data) {
        primaryWeatherData = weather.openMeteoData.data;
        dataSource = weather.openMeteoData.source || 'Open-Meteo';
      } else if (weather.openWeatherData && weather.openWeatherData.data) {
        primaryWeatherData = weather.openWeatherData.data;
        dataSource = weather.openWeatherData.source || 'OpenWeather';
      }
      
      if (primaryWeatherData) {
        const dataToSave = {
          city_name: city,
          city_id: cityIds[city],
          temperature: primaryWeatherData.main.temp,
          feels_like: primaryWeatherData.main.feels_like,
          temp_min: primaryWeatherData.main.temp_min,
          temp_max: primaryWeatherData.main.temp_max,
          humidity: primaryWeatherData.main.humidity,
          pressure: primaryWeatherData.main.pressure,
          rainfall: primaryWeatherData.rain?.['1h'] || 0,
          wind_speed: primaryWeatherData.wind?.speed,
          wind_direction: primaryWeatherData.wind?.deg,
          wind_gust: primaryWeatherData.wind?.gust,
          visibility: primaryWeatherData.visibility,
          uv_index: primaryWeatherData.uv_index,
          cloud_cover: primaryWeatherData.clouds?.all,
          dew_point: primaryWeatherData.dew_point,
          // Enhanced agricultural parameters
          heat_index: primaryWeatherData.heat_index,
          wind_chill: primaryWeatherData.wind_chill,
          soil_temperature: primaryWeatherData.soil_temperature,
          soil_moisture: primaryWeatherData.soil_moisture,
          evapotranspiration: primaryWeatherData.evapotranspiration,
          growing_degree_days: primaryWeatherData.growing_degree_days,
          air_quality_pm25: primaryWeatherData.air_quality?.pm25,
          air_quality_pm10: primaryWeatherData.air_quality?.pm10,
          air_quality_index: primaryWeatherData.air_quality?.aqi,
          pressure_trend: primaryWeatherData.pressure_trend,
          moon_phase: primaryWeatherData.moon_phase,
          moon_illumination: primaryWeatherData.moon_illumination,
          weather_description: primaryWeatherData.weather[0].description,
          weather_condition: primaryWeatherData.weather[0].main,
          data_source: dataSource,
          sunrise: primaryWeatherData.sys?.sunrise,
          sunset: primaryWeatherData.sys?.sunset,
          // Open-Meteo specific enhancements
          is_day: primaryWeatherData.is_day,
          sunshine_duration: primaryWeatherData.sunshine_duration,
        };
        climateDB.insertWeatherData(dataToSave);
        
        // Analyze weather data for alerts
        try {
          alertService.analyzeWeatherData(dataToSave);
        } catch (alertError) {
          console.error(`Error analyzing weather data for alerts in ${city}:`, alertError.message);
        }
        
        // Broadcast update to subscribed clients
        io.to(`weather_${city}`).emit('weather_update', dataToSave);
        console.log(`Successfully fetched and saved weather for ${city} from ${dataSource}`);
      } else {
        console.error(`No weather data received for ${city} from any source.`);
      }
    } catch (err) {
      console.error(`Error fetching weather for ${city}:`, err.message);
    }
  }
}, 30 * 60 * 1000); // every 30 minutes

// Fetch initial weather data
async function fetchInitialWeather() {
  console.log('Fetching initial weather data...');
  for (const cityName of cities) {
    try {
      const cityInfo = climateDB.getCityByName(cityName);
      if (!cityInfo) {
        console.warn(`City ${cityName} not found in database`);
        continue;
      }

      const weather = await climateAPI.getComprehensiveWeather(cityName, cityInfo.imd_id);
      
      // Prioritize Open-Meteo data, then OpenWeather
      let primaryWeatherData;
      let dataSource;
      
      if (weather.openMeteoData && weather.openMeteoData.data) {
        primaryWeatherData = weather.openMeteoData.data;
        dataSource = weather.openMeteoData.source || 'Open-Meteo';
      } else if (weather.openWeatherData && weather.openWeatherData.data) {
        primaryWeatherData = weather.openWeatherData.data;
        dataSource = weather.openWeatherData.source || 'OpenWeather';
      }
      
      if (primaryWeatherData) {
        const dataToSave = {
          city_id: cityInfo.id,
          city_name: cityName,
          temperature: primaryWeatherData.main.temp,
          feels_like: primaryWeatherData.main.feels_like,
          temp_min: primaryWeatherData.main.temp_min,
          temp_max: primaryWeatherData.main.temp_max,
          humidity: primaryWeatherData.main.humidity,
          pressure: primaryWeatherData.main.pressure,
          rainfall: primaryWeatherData.rain?.['1h'] || 0,
          wind_speed: primaryWeatherData.wind?.speed,
          wind_direction: primaryWeatherData.wind?.deg,
          weather_description: primaryWeatherData.weather[0].description,
          weather_condition: primaryWeatherData.weather[0].main,
          data_source: dataSource,
        };
        
        climateDB.insertWeatherData(dataToSave);
        
        // Analyze weather data for alerts
        try {
          alertService.analyzeWeatherData(dataToSave);
        } catch (alertError) {
          console.error(`Error analyzing weather data for alerts in ${cityName}:`, alertError.message);
        }
        
        console.log(`Successfully fetched and saved initial weather for ${cityName} from ${dataSource}`);
      } else {
        console.error(`No initial weather data received for ${cityName}`);
      }
    } catch (err) {
      console.error(`Error fetching initial weather for ${cityName}:`, err.message);
    }
  }
}

// Initialize database and start server
async function startServer() {
  try {
    // Load cities from database
    loadCitiesFromDB();
    
    // Initialize ML service (includes table creation)
    await mlService.initialize();
    
    // Fetch initial weather data
    await fetchInitialWeather();
    
    // Start server
    const PORT = process.env.PORT || 4002;
    server.listen(PORT, () => {
      console.log(`🌤️  ClimateSync Server running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}`);
      console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🤖 ML API: http://localhost:${PORT}/api/ml/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();