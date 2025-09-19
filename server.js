const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const ClimateAPIService = require('./utils/climateAPIs');
const ClimateDB = require('./database/db');
const AlertService = require('./services/alertService');
const FarmingService = require('./services/farmingService');
const { router: weatherRouter, initializeRouter } = require('./routes/weather');
const { router: alertRouter, initializeAlertRouter } = require('./routes/alerts');
const { router: farmingRouter, initializeFarmingRouter } = require('./routes/farming');

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
app.use(express.static('frontend'));

app.use('/api/weather', weatherRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/farming', farmingRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'ClimateSync backend is running!' });
});

const climateAPI = new ClimateAPIService();
const climateDB = new ClimateDB();
const alertService = new AlertService(climateDB, io);
const farmingService = new FarmingService(climateDB);

// Initialize the weather router with shared instances
initializeRouter(climateAPI, climateDB);
initializeAlertRouter(alertService);
initializeFarmingRouter(farmingService, climateDB);

// Get active cities from database
let cities = [];
let cityIds = {};

// Load cities from database
function loadCitiesFromDB() {
  try {
    const allCities = climateDB.getAllCities();
    cities = allCities.slice(0, 10).map(city => city.name); // Start with top 10 cities
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
  });

  socket.on('subscribe_alerts', (data) => {
    console.log(`User subscribed to alerts for ${data.city}`);
    socket.join(`alerts_${data.city}`);
    
    // Save subscription to database
    try {
      const cityInfo = climateDB.getCityByName(data.city);
      if (cityInfo) {
        alertService.subscribeToAlerts(
          socket.id, 
          cityInfo.id, 
          data.city, 
          data.alertTypes || ['FLOOD', 'HEAT']
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

// Fetch weather every 15 minutes and broadcast
setInterval(async () => {
  console.log('Fetching latest weather...');
  for (const city of cities) {
    try {
      const weather = await climateAPI.getComprehensiveWeather(city, cityIds[city]);
      
      if (weather.openWeatherData && weather.openWeatherData.data) {
        const dataToSave = {
          city_name: city,
          city_id: cityIds[city],
          temperature: weather.openWeatherData.data.main.temp,
          feels_like: weather.openWeatherData.data.main.feels_like,
          temp_min: weather.openWeatherData.data.main.temp_min,
          temp_max: weather.openWeatherData.data.main.temp_max,
          humidity: weather.openWeatherData.data.main.humidity,
          pressure: weather.openWeatherData.data.main.pressure,
          rainfall: weather.openWeatherData.data.rain?.['1h'] || 0,
          wind_speed: weather.openWeatherData.data.wind?.speed,
          wind_direction: weather.openWeatherData.data.wind?.deg,
          wind_gust: weather.openWeatherData.data.wind?.gust,
          visibility: weather.openWeatherData.data.visibility,
          uv_index: weather.openWeatherData.data.uv_index,
          cloud_cover: weather.openWeatherData.data.clouds?.all,
          dew_point: weather.openWeatherData.data.dew_point,
          // Enhanced agricultural parameters
          heat_index: weather.openWeatherData.data.heat_index,
          wind_chill: weather.openWeatherData.data.wind_chill,
          soil_temperature: weather.openWeatherData.data.soil_temperature,
          soil_moisture: weather.openWeatherData.data.soil_moisture,
          evapotranspiration: weather.openWeatherData.data.evapotranspiration,
          growing_degree_days: weather.openWeatherData.data.growing_degree_days,
          air_quality_pm25: weather.openWeatherData.data.air_quality?.pm25,
          air_quality_pm10: weather.openWeatherData.data.air_quality?.pm10,
          air_quality_index: weather.openWeatherData.data.air_quality?.aqi,
          pressure_trend: weather.openWeatherData.data.pressure_trend,
          moon_phase: weather.openWeatherData.data.moon_phase,
          moon_illumination: weather.openWeatherData.data.moon_illumination,
          weather_description: weather.openWeatherData.data.weather[0].description,
          weather_condition: weather.openWeatherData.data.weather[0].main,
          data_source: weather.openWeatherData.source || 'OpenWeather',
          sunrise: weather.openWeatherData.data.sys?.sunrise,
          sunset: weather.openWeatherData.data.sys?.sunset,
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
        console.log(`Successfully fetched and saved weather for ${city}`);
      } else {
        console.error(`No weather data received for ${city}. Check your API key.`);
        // Try to get data from IMD as fallback
        if (weather.imdData && weather.imdData.data) {
          console.log(`Using IMD data as fallback for ${city}`);
          // Handle IMD data format here if needed
        }
      }
    } catch (err) {
      console.error(`Error fetching weather for ${city}:`, err.message);
    }
  }
}, 30 * 60 * 1000); // every 30 minutes (was 15)

// Fetch initial weather data on startup
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
      
      if (weather.openWeatherData && weather.openWeatherData.data) {
        const dataToSave = {
          city_id: cityInfo.id,
          city_name: cityName,
          temperature: weather.openWeatherData.data.main.temp,
          feels_like: weather.openWeatherData.data.main.feels_like,
          temp_min: weather.openWeatherData.data.main.temp_min,
          temp_max: weather.openWeatherData.data.main.temp_max,
          humidity: weather.openWeatherData.data.main.humidity,
          pressure: weather.openWeatherData.data.main.pressure,
          rainfall: weather.openWeatherData.data.rain?.['1h'] || 0,
          wind_speed: weather.openWeatherData.data.wind?.speed,
          wind_direction: weather.openWeatherData.data.wind?.deg,
          wind_gust: weather.openWeatherData.data.wind?.gust,
          visibility: weather.openWeatherData.data.visibility,
          uv_index: weather.openWeatherData.data.uv_index,
          cloud_cover: weather.openWeatherData.data.clouds?.all,
          dew_point: weather.openWeatherData.data.dew_point,
          // Enhanced agricultural parameters
          heat_index: weather.openWeatherData.data.heat_index,
          wind_chill: weather.openWeatherData.data.wind_chill,
          soil_temperature: weather.openWeatherData.data.soil_temperature,
          soil_moisture: weather.openWeatherData.data.soil_moisture,
          evapotranspiration: weather.openWeatherData.data.evapotranspiration,
          growing_degree_days: weather.openWeatherData.data.growing_degree_days,
          air_quality_pm25: weather.openWeatherData.data.air_quality?.pm25,
          air_quality_pm10: weather.openWeatherData.data.air_quality?.pm10,
          air_quality_index: weather.openWeatherData.data.air_quality?.aqi,
          pressure_trend: weather.openWeatherData.data.pressure_trend,
          moon_phase: weather.openWeatherData.data.moon_phase,
          moon_illumination: weather.openWeatherData.data.moon_illumination,
          weather_description: weather.openWeatherData.data.weather[0].description,
          weather_condition: weather.openWeatherData.data.weather[0].main,
          data_source: weather.openWeatherData.source || 'OpenWeather',
          sunrise: weather.openWeatherData.data.sys?.sunrise,
          sunset: weather.openWeatherData.data.sys?.sunset,
        };
        climateDB.insertWeatherData(dataToSave);
        console.log(`Initial weather data saved for ${cityName}`);
        
        // Analyze initial weather data for alerts
        try {
          alertService.analyzeWeatherData(dataToSave);
        } catch (alertError) {
          console.error(`Error analyzing initial weather data for alerts in ${cityName}:`, alertError.message);
        }
        
        // Broadcast to any connected clients
        io.to(`weather_${cityName}`).emit('weather_update', dataToSave);
      } else {
        console.log(`No initial weather data available for ${cityName}`);
      }
    } catch (err) {
      console.error(`Error fetching initial weather for ${cityName}:`, err.message);
    }
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('OpenWeather API Key:', process.env.OPENWEATHER_API_KEY ? 'Loaded' : 'Missing');
  console.log(`Frontend available at: http://localhost:${PORT}`);
  
  // Load cities from database
  loadCitiesFromDB();
  
  // Fetch initial data
  setTimeout(fetchInitialWeather, 1000); // Wait 1 second for everything to initialize
  
  // Clean old weather data on startup (keep last 30 days)
  setTimeout(() => {
    try {
      const cleaned = climateDB.cleanOldWeatherData(30);
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} old weather records on startup`);
      }
    } catch (error) {
      console.error('Error cleaning old data:', error.message);
    }
  }, 2000);
});
