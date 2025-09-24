const axios = require('axios');

class ClimateAPIService {
  constructor() {
    this.imdBaseURL = 'https://mausam.imd.gov.in/api';
    this.openWeatherKey = process.env.OPENWEATHER_API_KEY;
    this.openWeatherURL = 'https://api.openweathermap.org/data/2.5';
    
    // Open-Meteo API (free, no API key required)
    this.openMeteoURL = 'https://api.open-meteo.com/v1';
    this.geocodingURL = 'https://geocoding-api.open-meteo.com/v1';
    
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

  /**
   * Get weather data for any location (city/village) using Open-Meteo
   * @param {string} location - Any location name (city, village, area)
   * @param {string} country - Optional country to improve search accuracy
   * @returns {Object|null} Weather data or null if location not found
   */
  async getWeatherForAnyLocation(location, country = null) {
    try {
      console.log(`Fetching weather for any location: ${location}${country ? `, ${country}` : ''}`);
      
      // Enhanced geocoding search with multiple results
      const geocodingParams = {
        name: location,
        count: 5, // Get multiple results to find best match
        language: 'en',
        format: 'json'
      };
      
      if (country) {
        geocodingParams.country = country;
      }
      
      const geocodingResponse = await axios.get(`${this.geocodingURL}/search`, {
        params: geocodingParams
      });
      
      if (!geocodingResponse.data || !geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
        console.log(`No coordinates found for location: ${location}`);
        return {
          success: false,
          error: `Location '${location}' not found. Please check spelling or try a different name.`,
          suggestions: await this.getSimilarLocations(location)
        };
      }
      
      // Get the best match (first result is usually most relevant)
      const bestMatch = geocodingResponse.data.results[0];
      const allResults = geocodingResponse.data.results;
      
      console.log(`Found ${allResults.length} location(s) for '${location}':`);
      allResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.name}, ${result.admin1 || ''}, ${result.country} (${result.latitude}, ${result.longitude})`);
      });
      
      // Get comprehensive weather data
      const weatherData = await this.getDetailedWeatherByCoordinates(
        bestMatch.latitude, 
        bestMatch.longitude,
        bestMatch
      );
      
      return {
        success: true,
        location: {
          searched: location,
          found: bestMatch.name,
          country: bestMatch.country,
          admin1: bestMatch.admin1, // State/Province
          admin2: bestMatch.admin2, // District/County
          latitude: bestMatch.latitude,
          longitude: bestMatch.longitude,
          elevation: bestMatch.elevation,
          timezone: bestMatch.timezone,
          population: bestMatch.population
        },
        alternativeLocations: allResults.slice(1), // Other possible matches
        weather: weatherData,
        source: 'Open-Meteo',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error fetching weather for location '${location}':`, error.message);
      return {
        success: false,
        error: `Failed to fetch weather data: ${error.message}`,
        location: location
      };
    }
  }

  /**
   * Get detailed weather data by coordinates
   */
  async getDetailedWeatherByCoordinates(latitude, longitude, locationInfo) {
    try {
      const weatherResponse = await axios.get(`${this.openMeteoURL}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'rain',
            'showers',
            'snowfall',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'surface_pressure',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m',
            'uv_index',
            'visibility'
          ].join(','),
          hourly: [
            'temperature_2m',
            'relative_humidity_2m',
            'dew_point_2m',
            'apparent_temperature',
            'precipitation_probability',
            'precipitation',
            'rain',
            'showers',
            'snowfall',
            'weather_code',
            'pressure_msl',
            'cloud_cover',
            'visibility',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m',
            'uv_index',
            'soil_temperature_0cm',
            'soil_temperature_6cm',
            'soil_moisture_0_1cm',
            'soil_moisture_1_3cm'
          ].join(','),
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'apparent_temperature_max',
            'apparent_temperature_min',
            'sunrise',
            'sunset',
            'daylight_duration',
            'sunshine_duration',
            'uv_index_max',
            'precipitation_sum',
            'rain_sum',
            'showers_sum',
            'snowfall_sum',
            'precipitation_hours',
            'precipitation_probability_max',
            'wind_speed_10m_max',
            'wind_gusts_10m_max',
            'wind_direction_10m_dominant'
          ].join(','),
          timezone: 'auto',
          forecast_days: 14, // Extended forecast
          past_days: 1 // Include yesterday for comparison
        }
      });
      
      const data = weatherResponse.data;
      
      // Transform to comprehensive format
      return this.transformToComprehensiveWeatherData(data, locationInfo);
      
    } catch (error) {
      console.error('Error fetching detailed weather:', error.message);
      throw error;
    }
  }

  /**
   * Transform to comprehensive weather data format
   */
  transformToComprehensiveWeatherData(data, locationInfo) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    
    return {
      current: {
        time: current.time,
        temperature: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: current.pressure_msl || current.surface_pressure,
        precipitation: current.precipitation,
        rain: current.rain,
        showers: current.showers,
        snowfall: current.snowfall,
        weather_code: current.weather_code,
        weather_description: this.getWeatherDescription(current.weather_code).description,
        weather_category: this.getWeatherDescription(current.weather_code).main,
        cloud_cover: current.cloud_cover,
        wind_speed: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        wind_gusts: current.wind_gusts_10m,
        uv_index: current.uv_index,
        visibility: current.visibility,
        is_day: current.is_day === 1
      },
      hourly_forecast: this.extractEnhancedHourlyForecast(hourly, 48), // 48 hours
      daily_forecast: this.extractEnhancedDailyForecast(daily, 14), // 14 days
      location: locationInfo,
      timezone: data.timezone,
      timezone_abbreviation: data.timezone_abbreviation,
      elevation: data.elevation,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract enhanced hourly forecast
   */
  extractEnhancedHourlyForecast(hourly, hours = 48) {
    const forecast = [];
    
    for (let i = 0; i < Math.min(hours, hourly.time.length); i++) {
      forecast.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m[i],
        feels_like: hourly.apparent_temperature[i],
        humidity: hourly.relative_humidity_2m[i],
        dew_point: hourly.dew_point_2m[i],
        precipitation: hourly.precipitation[i],
        precipitation_probability: hourly.precipitation_probability[i],
        rain: hourly.rain[i],
        showers: hourly.showers[i],
        snowfall: hourly.snowfall[i],
        weather_code: hourly.weather_code[i],
        weather_description: this.getWeatherDescription(hourly.weather_code[i]).description,
        pressure: hourly.pressure_msl[i],
        cloud_cover: hourly.cloud_cover[i],
        visibility: hourly.visibility[i],
        wind_speed: hourly.wind_speed_10m[i],
        wind_direction: hourly.wind_direction_10m[i],
        wind_gusts: hourly.wind_gusts_10m[i],
        uv_index: hourly.uv_index[i],
        soil_temperature_surface: hourly.soil_temperature_0cm[i],
        soil_temperature_6cm: hourly.soil_temperature_6cm[i],
        soil_moisture_surface: hourly.soil_moisture_0_1cm[i],
        soil_moisture_root: hourly.soil_moisture_1_3cm[i]
      });
    }
    
    return forecast;
  }

  /**
   * Extract enhanced daily forecast
   */
  extractEnhancedDailyForecast(daily, days = 14) {
    const forecast = [];
    
    for (let i = 0; i < Math.min(days, daily.time.length); i++) {
      forecast.push({
        date: daily.time[i],
        weather_code: daily.weather_code[i],
        weather_description: this.getWeatherDescription(daily.weather_code[i]).description,
        temperature_max: daily.temperature_2m_max[i],
        temperature_min: daily.temperature_2m_min[i],
        feels_like_max: daily.apparent_temperature_max[i],
        feels_like_min: daily.apparent_temperature_min[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        daylight_duration: daily.daylight_duration[i],
        sunshine_duration: daily.sunshine_duration[i],
        uv_index_max: daily.uv_index_max[i],
        precipitation_sum: daily.precipitation_sum[i],
        rain_sum: daily.rain_sum[i],
        showers_sum: daily.showers_sum[i],
        snowfall_sum: daily.snowfall_sum[i],
        precipitation_hours: daily.precipitation_hours[i],
        precipitation_probability_max: daily.precipitation_probability_max[i],
        wind_speed_max: daily.wind_speed_10m_max[i],
        wind_gusts_max: daily.wind_gusts_10m_max[i],
        wind_direction_dominant: daily.wind_direction_10m_dominant[i]
      });
    }
    
    return forecast;
  }

  /**
   * Get similar locations for suggestions when location not found
   */
  async getSimilarLocations(location) {
    try {
      // Try with partial matches or common variations
      const variations = [
        location.substring(0, Math.max(3, location.length - 2)), // Remove last 2 chars
        location.toLowerCase(),
        location.charAt(0).toUpperCase() + location.slice(1).toLowerCase(), // Proper case
      ];
      
      const suggestions = [];
      
      for (const variation of variations) {
        try {
          const response = await axios.get(`${this.geocodingURL}/search`, {
            params: {
              name: variation,
              count: 3,
              language: 'en',
              format: 'json'
            }
          });
          
          if (response.data && response.data.results) {
            suggestions.push(...response.data.results.map(r => ({
              name: r.name,
              country: r.country,
              admin1: r.admin1
            })));
          }
        } catch (err) {
          // Continue to next variation
        }
      }
      
      // Remove duplicates and limit to 5 suggestions
      const uniqueSuggestions = suggestions
        .filter((item, index, self) => 
          index === self.findIndex(t => t.name === item.name && t.country === item.country)
        )
        .slice(0, 5);
        
      return uniqueSuggestions;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get current weather data from Open-Meteo API
   * @param {string} city - City name
   * @returns {Object|null} Weather data or null if failed
   */
  async getOpenMeteoWeather(city) {
    try {
      console.log(`Fetching Open-Meteo weather data for ${city}...`);
      
      // First get coordinates using the new geocoding method
      const geocodingResponse = await axios.get(`${this.geocodingURL}/search`, {
        params: {
          name: city,
          count: 1,
          language: 'en',
          format: 'json'
        }
      });
      
      if (!geocodingResponse.data || !geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
        console.error(`Could not find coordinates for ${city}`);
        return null;
      }
      
      const coords = geocodingResponse.data.results[0];
      console.log(`Coordinates found for ${city}: ${coords.latitude}, ${coords.longitude}`);
      
      // Get current weather
      const weatherResponse = await axios.get(`${this.openMeteoURL}/forecast`, {
        params: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'precipitation',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'surface_pressure',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m',
            'uv_index',
            'is_day',
            'sunshine_duration'
          ].join(','),
          hourly: [
            'temperature_2m',
            'relative_humidity_2m',
            'precipitation_probability',
            'precipitation',
            'weather_code'
          ].join(','),
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'weather_code',
            'wind_speed_10m_max',
            'wind_gusts_10m_max',
            'uv_index_max',
            'sunshine_duration'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        }
      });
      
      const data = weatherResponse.data;
      console.log('Open-Meteo API Response received successfully');
      
      // Transform Open-Meteo data to match your existing structure
      const transformedData = this.transformOpenMeteoData(data, coords);
      
      return { source: 'Open-Meteo', data: transformedData, coords };
    } catch (error) {
      console.error('Error fetching Open-Meteo weather:', error.message);
      if (error.response) {
        console.error('Open-Meteo API Error:', error.response.status, error.response.data);
      }
      return null;
    }
  }

  /**
   * Transform Open-Meteo data to match existing data structure
   * @param {Object} data - Raw Open-Meteo data
   * @param {Object} coords - City coordinates
   * @returns {Object} Transformed weather data
   */
  transformOpenMeteoData(data, coords) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    
    // Get weather description from weather code
    const weatherDescription = this.getWeatherDescription(current.weather_code);
    
    // Calculate additional parameters
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const now = new Date();
    const month = now.getMonth() + 1;
    
    return {
      // Main weather parameters (OpenWeather format compatibility)
      main: {
        temp: temp,
        feels_like: current.apparent_temperature,
        temp_min: daily.temperature_2m_min[0],
        temp_max: daily.temperature_2m_max[0],
        humidity: humidity,
        pressure: current.pressure_msl || current.surface_pressure
      },
      weather: [{
        description: weatherDescription.description,
        main: weatherDescription.main,
        id: current.weather_code
      }],
      wind: {
        speed: current.wind_speed_10m,
        deg: current.wind_direction_10m,
        gust: current.wind_gusts_10m
      },
      visibility: 10000, // Default visibility
      clouds: {
        all: current.cloud_cover
      },
      rain: {
        '1h': current.precipitation || 0
      },
      sys: {
        sunrise: this.calculateSunrise(coords.latitude, coords.longitude),
        sunset: this.calculateSunset(coords.latitude, coords.longitude)
      },
      uv_index: current.uv_index,
      dew_point: this.calculateDewPoint(temp, humidity),
      
      // Enhanced agricultural data
      heat_index: this.calculateHeatIndex(temp, humidity),
      wind_chill: this.calculateWindChill(temp, current.wind_speed_10m),
      soil_temperature: this.estimateSoilTemperature(temp, month),
      soil_moisture: this.estimateSoilMoisture(
        current.precipitation || 0, humidity, temp
      ),
      evapotranspiration: this.calculateEvapotranspiration(
        temp, humidity, current.wind_speed_10m
      ),
      growing_degree_days: this.calculateGrowingDegreeDays(
        daily.temperature_2m_min[0], daily.temperature_2m_max[0]
      ),
      air_quality: this.estimateAirQuality(
        coords.name, temp, humidity, current.wind_speed_10m
      ),
      pressure_trend: this.getPressureTrend(current.pressure_msl || current.surface_pressure),
      moon_phase: this.getMoonPhase(),
      moon_illumination: this.getMoonIllumination(),
      
      // Open-Meteo specific enhancements
      is_day: current.is_day === 1,
      sunshine_duration: current.sunshine_duration,
      
      // Forecast data (next 24 hours)
      hourly_forecast: this.extractHourlyForecast(hourly),
      daily_forecast: this.extractDailyForecast(daily),
      
      // Coordinates
      coord: {
        lat: coords.latitude,
        lon: coords.longitude
      },
      
      // Metadata
      dt: Math.floor(Date.now() / 1000),
      timezone: data.timezone_abbreviation,
      name: coords.name
    };
  }

  /**
   * Extract hourly forecast for next 24 hours
   */
  extractHourlyForecast(hourly) {
    const forecast = [];
    const currentHour = new Date().getHours();
    
    for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
      forecast.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        precipitation: hourly.precipitation[i],
        precipitation_probability: hourly.precipitation_probability[i],
        weather_description: this.getWeatherDescription(hourly.weather_code[i]).description
      });
    }
    
    return forecast;
  }

  /**
   * Extract daily forecast
   */
  extractDailyForecast(daily) {
    const forecast = [];
    
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      forecast.push({
        date: daily.time[i],
        temp_min: daily.temperature_2m_min[i],
        temp_max: daily.temperature_2m_max[i],
        precipitation: daily.precipitation_sum[i],
        wind_speed_max: daily.wind_speed_10m_max[i],
        wind_gusts_max: daily.wind_gusts_10m_max[i],
        uv_index_max: daily.uv_index_max[i],
        sunshine_duration: daily.sunshine_duration[i],
        weather_description: this.getWeatherDescription(daily.weather_code[i]).description
      });
    }
    
    return forecast;
  }

  /**
   * Get weather description from WMO weather code
   * @param {number} code - WMO weather code
   * @returns {Object} Weather description
   */
  getWeatherDescription(code) {
    const weatherCodes = {
      0: { main: 'Clear', description: 'clear sky' },
      1: { main: 'Clear', description: 'mainly clear' },
      2: { main: 'Clouds', description: 'partly cloudy' },
      3: { main: 'Clouds', description: 'overcast' },
      45: { main: 'Fog', description: 'fog' },
      48: { main: 'Fog', description: 'depositing rime fog' },
      51: { main: 'Drizzle', description: 'light drizzle' },
      53: { main: 'Drizzle', description: 'moderate drizzle' },
      55: { main: 'Drizzle', description: 'dense drizzle' },
      56: { main: 'Drizzle', description: 'light freezing drizzle' },
      57: { main: 'Drizzle', description: 'dense freezing drizzle' },
      61: { main: 'Rain', description: 'slight rain' },
      63: { main: 'Rain', description: 'moderate rain' },
      65: { main: 'Rain', description: 'heavy rain' },
      66: { main: 'Rain', description: 'light freezing rain' },
      67: { main: 'Rain', description: 'heavy freezing rain' },
      71: { main: 'Snow', description: 'slight snow fall' },
      73: { main: 'Snow', description: 'moderate snow fall' },
      75: { main: 'Snow', description: 'heavy snow fall' },
      77: { main: 'Snow', description: 'snow grains' },
      80: { main: 'Rain', description: 'slight rain showers' },
      81: { main: 'Rain', description: 'moderate rain showers' },
      82: { main: 'Rain', description: 'violent rain showers' },
      85: { main: 'Snow', description: 'slight snow showers' },
      86: { main: 'Snow', description: 'heavy snow showers' },
      95: { main: 'Thunderstorm', description: 'thunderstorm' },
      96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail' },
      99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
    };
    
    return weatherCodes[code] || { main: 'Unknown', description: 'unknown weather condition' };
  }

  /**
   * Calculate dew point
   */
  calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  /**
   * Calculate sunrise time (simplified)
   */
  calculateSunrise(lat, lon) {
    // This is a simplified calculation - for production use a proper solar calculation library
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 0, 0, 0); // Approximate sunrise
    return sunrise.toTimeString().slice(0, 5);
  }

  /**
   * Calculate sunset time (simplified)
   */
  calculateSunset(lat, lon) {
    // This is a simplified calculation - for production use a proper solar calculation library
    const now = new Date();
    const sunset = new Date(now);
    sunset.setHours(18, 30, 0, 0); // Approximate sunset
    return sunset.toTimeString().slice(0, 5);
  }

  async getComprehensiveWeather(city, cityId) {
    const [imdData, openWeatherData, openMeteoData] = await Promise.all([
      this.getIMDWeather(cityId),
      this.getOpenWeatherData(city),
      this.getOpenMeteoWeather(city)
    ]);
    
    // If all APIs fail, return enhanced static mock data
    if (!imdData && !openWeatherData && !openMeteoData && 
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
      
      return { city, cityId, imdData: null, openWeatherData: mockData, openMeteoData: null };
    }
    
    // Return all available data sources
    const result = { city, cityId, imdData, openWeatherData, openMeteoData };
    
    // Log which data sources were successful
    const successfulSources = [];
    if (imdData) successfulSources.push('IMD');
    if (openWeatherData) successfulSources.push('OpenWeather');
    if (openMeteoData) successfulSources.push('Open-Meteo');
    
    console.log(`Weather data retrieved for ${city} from: ${successfulSources.join(', ') || 'Mock data'}`);
    
    return result;
  }
}

module.exports = ClimateAPIService;
