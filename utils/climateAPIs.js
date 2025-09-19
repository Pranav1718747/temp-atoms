const axios = require('axios');

class ClimateAPIService {
  constructor() {
    this.imdBaseURL = 'https://mausam.imd.gov.in/api';
    this.openWeatherKey = process.env.OPENWEATHER_API_KEY;
    this.openWeatherURL = 'https://api.openweathermap.org/data/2.5';
    
    // Fixed static mock data with comprehensive weather parameters
    this.staticMockData = {
      Delhi: {
        source: 'Mock',
        data: {
          main: { 
            temp: 28.5, 
            feels_like: 31.2, 
            temp_min: 26.1, 
            temp_max: 32.8, 
            humidity: 72, 
            pressure: 1013.2 
          },
          weather: [{ 
            description: 'partly cloudy', 
            main: 'Clouds' 
          }],
          wind: { speed: 3.2, deg: 220, gust: 4.8 },
          visibility: 8000,
          clouds: { all: 35 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:15', sunset: '18:30' },
          uv_index: 6.5,
          dew_point: 22.3,
          // Enhanced agricultural data
          heat_index: 33.8,
          wind_chill: null,
          soil_temperature: 26.2,
          soil_moisture: 45.8,
          evapotranspiration: 4.2,
          growing_degree_days: 12.5,
          air_quality: { pm25: 85, pm10: 120, aqi: 112 },
          pressure_trend: 'stable',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Mumbai: {
        source: 'Mock', 
        data: {
          main: { 
            temp: 32.1, 
            feels_like: 36.8, 
            temp_min: 29.5, 
            temp_max: 34.2, 
            humidity: 85, 
            pressure: 1008.7 
          },
          weather: [{ 
            description: 'clear sky', 
            main: 'Clear' 
          }],
          wind: { speed: 5.1, deg: 270, gust: 7.2 },
          visibility: 10000,
          clouds: { all: 10 },
          rain: { '1h': 0.2 },
          sys: { sunrise: '06:20', sunset: '18:45' },
          uv_index: 8.2,
          dew_point: 28.9,
          // Enhanced agricultural data
          heat_index: 42.1,
          wind_chill: null,
          soil_temperature: 30.5,
          soil_moisture: 38.2,
          evapotranspiration: 5.8,
          growing_degree_days: 16.1,
          air_quality: { pm25: 72, pm10: 98, aqi: 95 },
          pressure_trend: 'falling',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Chennai: {
        source: 'Mock',
        data: {
          main: { 
            temp: 30.8, 
            feels_like: 34.5, 
            temp_min: 28.2, 
            temp_max: 33.1, 
            humidity: 78, 
            pressure: 1010.1 
          },
          weather: [{ 
            description: 'scattered clouds', 
            main: 'Clouds' 
          }],
          wind: { speed: 4.3, deg: 180, gust: 6.1 },
          visibility: 9000,
          clouds: { all: 45 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:10', sunset: '18:25' },
          uv_index: 7.8,
          dew_point: 26.1,
          // Enhanced agricultural data
          heat_index: 36.2,
          wind_chill: null,
          soil_temperature: 29.1,
          soil_moisture: 42.5,
          evapotranspiration: 5.2,
          growing_degree_days: 14.8,
          air_quality: { pm25: 68, pm10: 89, aqi: 88 },
          pressure_trend: 'stable',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Bangalore: {
        source: 'Mock',
        data: {
          main: { 
            temp: 24.5, 
            feels_like: 26.1, 
            temp_min: 22.8, 
            temp_max: 27.2, 
            humidity: 65, 
            pressure: 1015.8 
          },
          weather: [{ 
            description: 'pleasant weather', 
            main: 'Clear' 
          }],
          wind: { speed: 2.8, deg: 150, gust: 3.9 },
          visibility: 12000,
          clouds: { all: 20 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:25', sunset: '18:35' },
          uv_index: 5.2,
          dew_point: 17.8,
          // Enhanced agricultural data
          heat_index: 25.8,
          wind_chill: null,
          soil_temperature: 23.2,
          soil_moisture: 52.1,
          evapotranspiration: 3.1,
          growing_degree_days: 8.5,
          air_quality: { pm25: 45, pm10: 65, aqi: 65 },
          pressure_trend: 'rising',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Hyderabad: {
        source: 'Mock',
        data: {
          main: { 
            temp: 29.2, 
            feels_like: 32.6, 
            temp_min: 27.1, 
            temp_max: 31.8, 
            humidity: 70, 
            pressure: 1012.5 
          },
          weather: [{ 
            description: 'partly cloudy', 
            main: 'Clouds' 
          }],
          wind: { speed: 3.7, deg: 200, gust: 5.2 },
          visibility: 9500,
          clouds: { all: 40 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:18', sunset: '18:28' },
          uv_index: 6.8,
          dew_point: 23.4,
          // Enhanced agricultural data
          heat_index: 33.1,
          wind_chill: null,
          soil_temperature: 27.8,
          soil_moisture: 48.2,
          evapotranspiration: 4.5,
          growing_degree_days: 13.2,
          air_quality: { pm25: 78, pm10: 102, aqi: 98 },
          pressure_trend: 'stable',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Kolkata: {
        source: 'Mock',
        data: {
          main: { 
            temp: 31.0, 
            feels_like: 35.2, 
            temp_min: 28.8, 
            temp_max: 33.5, 
            humidity: 82, 
            pressure: 1009.3 
          },
          weather: [{ 
            description: 'humid and warm', 
            main: 'Haze' 
          }],
          wind: { speed: 2.1, deg: 90, gust: 3.4 },
          visibility: 6000,
          clouds: { all: 60 },
          rain: { '1h': 0.1 },
          sys: { sunrise: '05:55', sunset: '18:15' },
          uv_index: 7.1,
          dew_point: 27.2,
          // Enhanced agricultural data
          heat_index: 37.8,
          wind_chill: null,
          soil_temperature: 29.5,
          soil_moisture: 35.8,
          evapotranspiration: 5.5,
          growing_degree_days: 15.0,
          air_quality: { pm25: 92, pm10: 135, aqi: 125 },
          pressure_trend: 'falling',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Pune: {
        source: 'Mock',
        data: {
          main: { 
            temp: 26.8, 
            feels_like: 28.9, 
            temp_min: 24.2, 
            temp_max: 29.1, 
            humidity: 68, 
            pressure: 1014.2 
          },
          weather: [{ 
            description: 'clear sky', 
            main: 'Clear' 
          }],
          wind: { speed: 3.5, deg: 240, gust: 4.8 },
          visibility: 11000,
          clouds: { all: 15 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:22', sunset: '18:38' },
          uv_index: 6.2,
          dew_point: 20.1,
          // Enhanced agricultural data
          heat_index: 29.2,
          wind_chill: null,
          soil_temperature: 25.1,
          soil_moisture: 55.3,
          evapotranspiration: 3.8,
          growing_degree_days: 10.8,
          air_quality: { pm25: 52, pm10: 71, aqi: 72 },
          pressure_trend: 'stable',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Ahmedabad: {
        source: 'Mock',
        data: {
          main: { 
            temp: 42.5, 
            feels_like: 46.8, 
            temp_min: 39.2, 
            temp_max: 44.1, 
            humidity: 55, 
            pressure: 1006.8 
          },
          weather: [{ 
            description: 'extreme heat warning', 
            main: 'Clear' 
          }],
          wind: { speed: 4.2, deg: 280, gust: 6.5 },
          visibility: 7000,
          clouds: { all: 5 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:28', sunset: '18:42' },
          uv_index: 11.2,
          dew_point: 28.9,
          // Enhanced agricultural data
          heat_index: 52.1,
          wind_chill: null,
          soil_temperature: 45.2,
          soil_moisture: 18.5,
          evapotranspiration: 8.5,
          growing_degree_days: 26.5,
          air_quality: { pm25: 105, pm10: 145, aqi: 142 },
          pressure_trend: 'falling',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Jaipur: {
        source: 'Mock',
        data: {
          main: { 
            temp: 41.1, 
            feels_like: 44.8, 
            temp_min: 38.5, 
            temp_max: 42.8, 
            humidity: 60, 
            pressure: 1007.5 
          },
          weather: [{ 
            description: 'very hot', 
            main: 'Clear' 
          }],
          wind: { speed: 3.8, deg: 300, gust: 5.9 },
          visibility: 8500,
          clouds: { all: 10 },
          rain: { '1h': 0 },
          sys: { sunrise: '06:30', sunset: '18:40' },
          uv_index: 10.5,
          dew_point: 27.6,
          // Enhanced agricultural data
          heat_index: 49.2,
          wind_chill: null,
          soil_temperature: 43.8,
          soil_moisture: 22.1,
          evapotranspiration: 7.8,
          growing_degree_days: 25.1,
          air_quality: { pm25: 98, pm10: 132, aqi: 135 },
          pressure_trend: 'falling',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      },
      Lucknow: {
        source: 'Mock',
        data: {
          main: { 
            temp: 27.3, 
            feels_like: 30.8, 
            temp_min: 25.1, 
            temp_max: 29.2, 
            humidity: 75, 
            pressure: 1011.2 
          },
          weather: [{ 
            description: 'heavy rainfall expected', 
            main: 'Rain' 
          }],
          wind: { speed: 6.2, deg: 120, gust: 8.9 },
          visibility: 4000,
          clouds: { all: 85 },
          rain: { '1h': 12.5 },
          sys: { sunrise: '06:05', sunset: '18:20' },
          uv_index: 3.2,
          dew_point: 22.8,
          // Enhanced agricultural data
          heat_index: 31.5,
          wind_chill: null,
          soil_temperature: 25.8,
          soil_moisture: 68.5,
          evapotranspiration: 2.8,
          growing_degree_days: 11.3,
          air_quality: { pm25: 65, pm10: 85, aqi: 82 },
          pressure_trend: 'falling',
          moon_phase: 'waning_crescent',
          moon_illumination: 25.3
        }
      }
    };
  }

  // Weather calculation methods
  calculateHeatIndex(temp, humidity) {
    // Heat index formula (Rothfusz equation)
    if (temp < 80) return temp; // Only calculate for temp >= 80°F (26.7°C)
    
    const tempF = temp * 9/5 + 32; // Convert to Fahrenheit
    const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity
               - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF
               - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity
               + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity;
    
    return (hi - 32) * 5/9; // Convert back to Celsius
  }

  calculateWindChill(temp, windSpeed) {
    // Wind chill only applies to temperatures below 10°C and wind speeds above 4.8 km/h
    if (temp > 10 || windSpeed < 4.8) return null;
    
    const windChillC = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
    return Math.round(windChillC * 10) / 10;
  }

  calculateGrowingDegreeDays(tempMin, tempMax, baseTemp = 10) {
    // Growing Degree Days calculation
    const avgTemp = (tempMin + tempMax) / 2;
    return Math.max(0, avgTemp - baseTemp);
  }

  calculateEvapotranspiration(temp, humidity, windSpeed, radiation = null) {
    // Simplified Penman-Monteith equation estimation
    // This is a basic approximation - real calculation requires more parameters
    const tempK = temp + 273.15;
    const satVaporPressure = 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
    const actualVaporPressure = satVaporPressure * humidity / 100;
    const vaporPressureDeficit = satVaporPressure - actualVaporPressure;
    
    // Simplified ET calculation (mm/day)
    const et = 0.0023 * (temp + 17.8) * Math.sqrt(Math.abs(tempK - 273.15)) * vaporPressureDeficit;
    return Math.round(et * 10) / 10;
  }

  estimateSoilTemperature(airTemp, month) {
    // Soil temperature is generally 2-5°C lower than air temperature
    // and has seasonal lag
    const seasonalOffset = Math.sin((month - 3) * Math.PI / 6) * 2; // Seasonal variation
    const soilTemp = airTemp - 2.5 + seasonalOffset;
    return Math.round(soilTemp * 10) / 10;
  }

  estimateSoilMoisture(rainfall, humidity, temp, lastRainfall = 0) {
    // Basic soil moisture estimation based on recent rainfall and weather
    let soilMoisture = 50; // Base level
    
    // Recent rainfall impact
    soilMoisture += rainfall * 3;
    soilMoisture += lastRainfall * 1.5;
    
    // Humidity impact
    soilMoisture += (humidity - 60) * 0.3;
    
    // Temperature impact (higher temp reduces soil moisture)
    soilMoisture -= (temp - 25) * 0.8;
    
    return Math.max(10, Math.min(90, Math.round(soilMoisture * 10) / 10));
  }

  getMoonPhase() {
    // Simplified moon phase calculation
    const moonPhases = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                       'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
    const now = new Date();
    const dayOfMonth = now.getDate();
    const phaseIndex = Math.floor((dayOfMonth / 29.5) * 8) % 8;
    return moonPhases[phaseIndex];
  }

  getMoonIllumination() {
    // Simplified moon illumination percentage
    const now = new Date();
    const dayOfMonth = now.getDate();
    const cycle = (dayOfMonth % 29.5) / 29.5;
    const illumination = Math.abs(Math.cos(cycle * Math.PI * 2)) * 100;
    return Math.round(illumination * 10) / 10;
  }

  getPressureTrend(currentPressure) {
    // Simplified pressure trend based on typical ranges
    if (currentPressure < 1010) return 'falling';
    if (currentPressure > 1020) return 'rising';
    return 'stable';
  }

  estimateAirQuality(city, temp, humidity, windSpeed) {
    // Basic air quality estimation based on city and weather conditions
    const baseAQI = {
      'Delhi': { pm25: 85, pm10: 120, aqi: 112 },
      'Mumbai': { pm25: 72, pm10: 98, aqi: 95 },
      'Chennai': { pm25: 68, pm10: 89, aqi: 88 },
      'Bangalore': { pm25: 45, pm10: 65, aqi: 65 },
      'Hyderabad': { pm25: 78, pm10: 102, aqi: 98 },
      'Kolkata': { pm25: 92, pm10: 135, aqi: 125 },
      'Pune': { pm25: 52, pm10: 71, aqi: 72 },
      'Ahmedabad': { pm25: 105, pm10: 145, aqi: 142 },
      'Jaipur': { pm25: 98, pm10: 132, aqi: 135 },
      'Lucknow': { pm25: 65, pm10: 85, aqi: 82 }
    };
    
    const base = baseAQI[city] || baseAQI['Delhi'];
    
    // Weather factors affect air quality
    const windFactor = Math.max(0.7, 1 - (windSpeed - 5) * 0.05); // Wind helps disperse pollution
    const rainFactor = humidity > 80 ? 0.8 : 1; // Rain/high humidity clears air
    
    return {
      pm25: Math.round(base.pm25 * windFactor * rainFactor),
      pm10: Math.round(base.pm10 * windFactor * rainFactor),
      aqi: Math.round(base.aqi * windFactor * rainFactor)
    };
  }

  async getIMDWeather(cityId) {
    try {
      console.log(`Attempting to fetch IMD data for city ID: ${cityId}`);
      const response = await axios.get(`${this.imdBaseURL}/current_wx_api.php?id=${cityId}`);
      console.log('IMD API Response status:', response.status);
      console.log('IMD API Response data:', response.data);
      return { source: 'IMD', data: response.data };
    } catch (error) {
      console.error('Error fetching IMD weather:', error.message);
      console.error('IMD API URL:', `${this.imdBaseURL}/current_wx_api.php?id=${cityId}`);
      if (error.response) {
        console.error('IMD API Error status:', error.response.status);
        console.error('IMD API Error data:', error.response.data);
      }
      return null;
    }
  }

  async getOpenWeatherData(city) {
    try {
      if (!this.openWeatherKey || this.openWeatherKey === 'your_openweather_api_key_here' || this.openWeatherKey === 'your_actual_api_key_here') {
        console.error('OpenWeather API key is not configured properly. Current key:', this.openWeatherKey);
        throw new Error('OpenWeather API key is not configured. Please set OPENWEATHER_API_KEY in .env file');
      }
      
      console.log(`Attempting to fetch OpenWeather data for city: ${city}`);
      const url = `${this.openWeatherURL}/weather`;
      const params = { q: city, appid: this.openWeatherKey, units: 'metric' };
      console.log('OpenWeather API URL:', url);
      console.log('OpenWeather API Params:', { ...params, appid: '[HIDDEN]' });
      
      const response = await axios.get(url, { params });
      console.log('OpenWeather API Response status:', response.status);
      console.log('OpenWeather API Response data keys:', Object.keys(response.data));
      return { source: 'OpenWeather', data: response.data };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Invalid OpenWeather API key. Please check your .env file.');
        console.error('API Response:', error.response.data);
      } else if (error.response) {
        console.error('OpenWeather API Error status:', error.response.status);
        console.error('OpenWeather API Error data:', error.response.data);
      } else {
        console.error('Error fetching OpenWeather:', error.message);
      }
      return null;
    }
  }

  async getComprehensiveWeather(city, cityId) {
    const [imdData, openWeatherData] = await Promise.all([
      this.getIMDWeather(cityId),
      this.getOpenWeatherData(city),
    ]);
    
    // If both APIs fail and we have no real API key, return enhanced static mock data
    if (!imdData && !openWeatherData && 
        (!this.openWeatherKey || 
         this.openWeatherKey === 'your_openweather_api_key_here' || 
         this.openWeatherKey === 'your_actual_api_key_here')) {
      
      console.log(`Using enhanced static mock data for ${city}`);
      let mockData = this.staticMockData[city] || this.staticMockData['Delhi'];
      
      // Enhance mock data with real-time calculations
      const data = mockData.data;
      const now = new Date();
      const month = now.getMonth() + 1;
      
      // Calculate additional weather parameters if not already present
      if (!data.heat_index) {
        data.heat_index = this.calculateHeatIndex(data.main.temp, data.main.humidity);
      }
      
      if (!data.wind_chill) {
        data.wind_chill = this.calculateWindChill(data.main.temp, data.wind.speed);
      }
      
      if (!data.growing_degree_days) {
        data.growing_degree_days = this.calculateGrowingDegreeDays(
          data.main.temp_min, data.main.temp_max
        );
      }
      
      if (!data.evapotranspiration) {
        data.evapotranspiration = this.calculateEvapotranspiration(
          data.main.temp, data.main.humidity, data.wind.speed
        );
      }
      
      if (!data.soil_temperature) {
        data.soil_temperature = this.estimateSoilTemperature(data.main.temp, month);
      }
      
      if (!data.soil_moisture) {
        data.soil_moisture = this.estimateSoilMoisture(
          data.rain ? data.rain['1h'] : 0, data.main.humidity, data.main.temp
        );
      }
      
      if (!data.pressure_trend) {
        data.pressure_trend = this.getPressureTrend(data.main.pressure);
      }
      
      if (!data.moon_phase) {
        data.moon_phase = this.getMoonPhase();
        data.moon_illumination = this.getMoonIllumination();
      }
      
      if (!data.air_quality) {
        data.air_quality = this.estimateAirQuality(
          city, data.main.temp, data.main.humidity, data.wind.speed
        );
      }
      
      return { city, cityId, imdData: null, openWeatherData: mockData };
    }
    
    return { city, cityId, imdData, openWeatherData };
  }
}

module.exports = ClimateAPIService;
