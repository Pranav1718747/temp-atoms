// Farming Dashboard JavaScript
const socket = io('http://localhost:4001');

// Global variables
let currentCity = 'Delhi';
let currentCrop = 'rice';
let currentStage = 'vegetative';
let availableCities = [];
let searchTimeout = null;
let currentSearchData = null;
let currentLocationData = null;

// DOM elements
const cropSelect = document.getElementById('cropSelect');
const stageSelect = document.getElementById('stageSelect');

// ===== LOCATION SEARCH FUNCTIONALITY =====

// Global location search function
async function searchLocation() {
  const searchInput = document.getElementById('locationSearch');
  const query = searchInput.value.trim();
  
  if (!query) {
    showNotification('Please enter a location to search', 'warning');
    return;
  }
  
  await performLocationSearch(query);
}

// Perform location search with API
async function performLocationSearch(query) {
  try {
    showLoading();
    console.log('Searching for location:', query);
    
    const response = await fetch(`http://localhost:4001/api/weather/search/${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.results && result.results.length > 0) {
      displaySearchResults(result.results);
      hideLoading();
    } else if (result.success && result.data && result.data.length > 0) {
      displaySearchResults(result.data);
      hideLoading();
    } else {
      hideLoading();
      showSearchError('No locations found for your search. Try searching for a different city or village.');
    }
  } catch (error) {
    console.error('Error searching location:', error);
    hideLoading();
    showSearchError('Failed to search location. Please check your connection and try again.');
  }
}

// Quiet search for auto-complete
async function performLocationSearchQuiet(query) {
  try {
    console.log('Auto-searching for location:', query);
    
    const response = await fetch(`http://localhost:4001/api/weather/search/${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.results && result.results.length > 0) {
      displaySearchResults(result.results);
    } else if (result.success && result.data && result.data.length > 0) {
      displaySearchResults(result.data);
    } else {
      showSearchError('No locations found for your search.');
    }
  } catch (error) {
    console.error('Error searching location:', error);
    showSearchError('Failed to search location.');
  }
}

// Display search results
function displaySearchResults(locations) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (!locations || locations.length === 0) {
    showSearchError('No locations found.');
    return;
  }
  
  let html = '<div class="search-results-header">Found Locations:</div>';
  
  locations.forEach((location, index) => {
    const country = location.country || 'Unknown';
    const state = location.admin1 || location.state || '';
    const region = location.admin2 || location.admin3 || '';
    const population = location.population ? `${(location.population / 1000).toFixed(0)}K people` : '';
    
    let locationDescription = '';
    if (state && region) {
      locationDescription = `${state} • ${region}`;
    } else if (state) {
      locationDescription = state;
    } else if (region) {
      locationDescription = region;
    }
    
    html += `
      <div class="search-result-item" onclick="selectSearchLocation(${index})">
        <div class="result-main">
          <strong>${location.name}</strong>
          <span class="result-country">${country}</span>
        </div>
        <div class="result-details">
          ${locationDescription ? `${locationDescription} • ` : ''}${population}
          <span class="result-coords">📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</span>
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  resultsContainer.style.display = 'block';
  
  currentSearchData = locations;
  console.log('Displayed', locations.length, 'search results');
}

// Select a location from search results
async function selectSearchLocation(index) {
  if (!currentSearchData || !currentSearchData[index]) {
    return;
  }
  
  const location = currentSearchData[index];
  
  // Hide search results
  document.getElementById('searchResults').style.display = 'none';
  
  // Update current location
  currentCity = location.name;
  currentLocationData = location;
  
  // Show notification
  showNotification(`Selected: ${location.name}, ${location.country}`, 'success');
  
  // For global locations, fetch weather data directly using coordinates
  await loadGlobalLocationWeather(location);
}

// Show search error
function showSearchError(message) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = `<div class="search-error">${message}</div>`;
  resultsContainer.style.display = 'block';
  console.log('Search error:', message);
}

// Auto-complete search as user types
document.getElementById('locationSearch').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (query.length < 2) {
    document.getElementById('searchResults').style.display = 'none';
    return;
  }
  
  searchTimeout = setTimeout(() => {
    performLocationSearchQuiet(query);
  }, 800);
});

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
  const searchContainer = document.querySelector('.location-search-container');
  if (!searchContainer.contains(e.target)) {
    document.getElementById('searchResults').style.display = 'none';
  }
});

// Allow Enter key to search
document.getElementById('locationSearch').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchLocation();
  }
});

// ===== END LOCATION SEARCH FUNCTIONALITY =====

// Load weather data for global locations using coordinates
async function loadGlobalLocationWeather(location) {
  try {
    console.log('Loading global weather for:', location.name, 'at', location.latitude, location.longitude);
    showLoading();
    
    // Fetch weather data using coordinates
    const response = await fetch(`http://localhost:4001/api/weather/coordinates/${location.latitude}/${location.longitude}`);
    console.log('Global weather API response status:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    console.log('=== FULL API RESPONSE FOR', location.name, '===');
    console.log('Raw API result:', result);
    
    if (result.success && result.weather) {
      console.log('=== WEATHER DATA STRUCTURE ===');
      console.log('result.weather:', result.weather);
      console.log('result.weather.current:', result.weather.current);
      
      if (result.weather.current) {
        console.log('=== INDIVIDUAL WEATHER VALUES ===');
        console.log('Temperature:', result.weather.current.temperature, typeof result.weather.current.temperature);
        console.log('Humidity:', result.weather.current.humidity, typeof result.weather.current.humidity);
        console.log('Pressure:', result.weather.current.pressure, typeof result.weather.current.pressure);
        console.log('Wind Speed:', result.weather.current.wind_speed, typeof result.weather.current.wind_speed);
        console.log('Wind Direction:', result.weather.current.wind_direction, typeof result.weather.current.wind_direction);
        console.log('UV Index:', result.weather.current.uv_index, typeof result.weather.current.uv_index);
        console.log('Precipitation:', result.weather.current.precipitation, typeof result.weather.current.precipitation);
      }
      
      // Transform the data to match farming dashboard format
      const farmingData = transformGlobalWeatherForFarming(result.weather, location);
      console.log('Transformed farming data for', location.name, ':', farmingData);
      
      // Update the farming dashboard with the transformed data
      updateFarmingDashboardWithGlobalData(farmingData, location);
    } else {
      console.error('API response missing weather data:', result);
      throw new Error(result.error || 'Failed to load weather data');
    }
    
  } catch (error) {
    console.error('Error loading global weather:', error);
    showError(`Failed to load weather data for ${location.name}. Please try again.`);
  } finally {
    hideLoading();
  }
}

// Transform global weather data to farming dashboard format
function transformGlobalWeatherForFarming(weatherData, location) {
  console.log('=== TRANSFORMATION START FOR', location.name, '===');
  console.log('Input weatherData:', weatherData);
  
  const current = weatherData.current;
  console.log('Current weather object:', current);
  
  if (!current) {
    console.error('No current weather data found!');
    // Return with all fallback values if no current data
    return createFallbackWeatherData(location);
  }
  
  // Extract actual values, only use fallbacks if undefined/null
  const temperature = (current.temperature !== undefined && current.temperature !== null) ? current.temperature : 25;
  const humidity = (current.humidity !== undefined && current.humidity !== null) ? current.humidity : 60;
  const precipitation = (current.precipitation !== undefined && current.precipitation !== null) ? current.precipitation : 0;
  const pressure = (current.pressure !== undefined && current.pressure !== null) ? current.pressure : 1013;
  const windSpeed = (current.wind_speed !== undefined && current.wind_speed !== null) ? current.wind_speed : 5;
  const windDirection = (current.wind_direction !== undefined && current.wind_direction !== null) ? current.wind_direction : 0;
  const uvIndex = (current.uv_index !== undefined && current.uv_index !== null) ? current.uv_index : 3;
  
  console.log('=== EXTRACTED VALUES FOR', location.name, '===');
  console.log('Temperature:', temperature, '(original:', current.temperature, ')');
  console.log('Humidity:', humidity, '(original:', current.humidity, ')');
  console.log('Precipitation:', precipitation, '(original:', current.precipitation, ')');
  console.log('Pressure:', pressure, '(original:', current.pressure, ')');
  console.log('Wind Speed:', windSpeed, '(original:', current.wind_speed, ')');
  console.log('Wind Direction:', windDirection, '(original:', current.wind_direction, ')');
  console.log('UV Index:', uvIndex, '(original:', current.uv_index, ')');
  
  // Check if we're getting any real data vs all fallbacks
  const usingFallbacks = {
    temperature: current.temperature === undefined || current.temperature === null,
    humidity: current.humidity === undefined || current.humidity === null,
    pressure: current.pressure === undefined || current.pressure === null,
    wind: current.wind_speed === undefined || current.wind_speed === null
  };
  console.log('Using fallbacks for:', usingFallbacks);
  
  // Calculate overall condition based on temperature, humidity, and rainfall
  const tempGood = temperature >= 15 && temperature <= 35;
  const humidityGood = humidity >= 40 && humidity <= 80;
  const rainfallGood = precipitation >= 1 && precipitation <= 10;
  
  let overallCondition = 'good';
  if (!tempGood || !humidityGood || !rainfallGood) {
    const badConditions = [!tempGood, !humidityGood, !rainfallGood].filter(Boolean).length;
    overallCondition = badConditions >= 2 ? 'poor' : 'fair';
  }
  
  // Calculate additional weather metrics for comprehensive display using actual data
  const heatIndex = calculateHeatIndex(temperature, humidity);
  const soilTemperature = temperature - 5; // Approximate soil temp from air temp
  const soilMoisture = Math.min(100, Math.max(20, humidity + (precipitation * 5))); // More realistic soil moisture
  const growingDegreeDays = Math.max(0, (temperature - 10)); // Base temp 10°C
  
  // Calculate pressure trend based on pressure (simplified)
  let pressureTrend = 'stable';
  if (pressure > 1020) pressureTrend = 'rising';
  else if (pressure < 1000) pressureTrend = 'falling';
  
  // Calculate air quality estimate based on weather conditions
  let estimatedAQI = 50; // Default moderate
  if (precipitation > 2) estimatedAQI = 30; // Rain improves air quality
  else if (windSpeed > 10) estimatedAQI = 40; // Wind disperses pollution
  else if (humidity > 80) estimatedAQI = 60; // High humidity can trap pollutants
  
  const transformedData = {
    weather: {
      temperature: temperature,
      humidity: humidity,
      rainfall: precipitation,
      pressure: pressure,
      wind_speed: windSpeed,
      wind_direction: windDirection,
      uv_index: uvIndex,
      weather_description: current.weather_code ? getWeatherDescription(current.weather_code) : 'Current weather conditions',
      // Additional comprehensive weather data using real calculations
      pressure_trend: pressureTrend,
      air_quality: { aqi: estimatedAQI },
      soil_temperature: soilTemperature,
      soil_moisture: soilMoisture,
      growing_degree_days: growingDegreeDays,
      heat_index: heatIndex,
      moon_phase: getCurrentMoonPhase(),
      moon_illumination: getMoonIllumination()
    },
    location: {
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    },
    selected_crop: {
      recommendations: {
        conditions: {
          overall: overallCondition,
          temperature: {
            status: temperature > 30 ? 'hot' : temperature < 15 ? 'cold' : 'good',
            message: temperature > 30 ? `High temperature (${temperature}°C) may stress crops` : temperature < 15 ? `Low temperature (${temperature}°C) may slow growth` : `Temperature (${temperature}°C) is suitable for farming`
          },
          humidity: {
            status: humidity > 80 ? 'humid' : humidity < 40 ? 'dry' : 'good',
            message: humidity > 80 ? `High humidity (${humidity}%) - watch for fungal diseases` : humidity < 40 ? `Low humidity (${humidity}%) - ensure adequate irrigation` : `Humidity (${humidity}%) levels are good`
          },
          water: {
            status: precipitation > 5 ? 'wet' : precipitation > 1 ? 'moderate' : 'dry',
            message: precipitation > 5 ? `Good rainfall (${precipitation}mm) for crops` : precipitation > 1 ? `Moderate rainfall (${precipitation}mm)` : `Low rainfall (${precipitation}mm) - irrigation may be needed`
          }
        },
        irrigation: {
          icon: precipitation < 2 ? '🚿' : '💧',
          advice: precipitation < 2 ? 'Irrigation recommended due to low rainfall' : 'Monitor soil moisture levels',
          frequency: precipitation < 2 ? 'daily' : 'moderate',
          message: precipitation < 2 ? `Low rainfall (${precipitation}mm) detected. Regular irrigation needed.` : `Adequate moisture (${precipitation}mm). Monitor soil conditions.`,
          amount: '25-30mm per week',
          urgency: precipitation < 1 ? 'high' : 'medium'
        }
      },
      // Add crop key for visual functions
      key: 'rice'
    },
    suitable_crops: [],
    farming_alerts: []
  };
  
  console.log('=== FINAL TRANSFORMED DATA FOR', location.name, '===');
  console.log('Weather section:', transformedData.weather);
  return transformedData;
}

// Helper function to create fallback weather data
function createFallbackWeatherData(location) {
  console.warn('Creating fallback weather data for', location.name);
  return {
    weather: {
      temperature: 25,
      humidity: 60,
      rainfall: 0,
      pressure: 1013,
      wind_speed: 5,
      wind_direction: 0,
      uv_index: 3,
      weather_description: 'No data available',
      pressure_trend: 'stable',
      air_quality: { aqi: 50 },
      soil_temperature: 20,
      soil_moisture: 60,
      growing_degree_days: 15,
      heat_index: 25,
      moon_phase: getCurrentMoonPhase(),
      moon_illumination: getMoonIllumination()
    },
    location: { name: location.name, country: location.country, latitude: location.latitude, longitude: location.longitude },
    selected_crop: { recommendations: { conditions: { overall: 'fair' }, irrigation: { icon: '💧', frequency: 'moderate' } }, key: 'rice' },
    suitable_crops: [], farming_alerts: []
  };
}

// Helper function to calculate heat index
function calculateHeatIndex(temp, humidity) {
  // Simplified heat index calculation
  if (temp < 27) return temp;
  
  const T = temp;
  const RH = humidity;
  
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  
  if (HI >= 80) {
    HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH;
  }
  
  return Math.round(HI);
}

// Helper function to get weather description from weather code
function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return descriptions[code] || 'Current weather conditions';
}

// Helper function to get current moon phase
function getCurrentMoonPhase() {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const phaseIndex = Math.floor((dayOfYear % 29.5) / 29.5 * 8);
  return phases[phaseIndex];
}

// Helper function to get moon illumination percentage
function getMoonIllumination() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const lunarCycle = (dayOfYear % 29.5) / 29.5;
  
  // Calculate illumination percentage based on lunar cycle
  let illumination;
  if (lunarCycle <= 0.5) {
    // Waxing phase (new moon to full moon)
    illumination = lunarCycle * 2 * 100;
  } else {
    // Waning phase (full moon to new moon)
    illumination = (1 - (lunarCycle - 0.5) * 2) * 100;
  }
  
  return Math.round(illumination);
}

// Clear comprehensive weather display to force refresh
function clearComprehensiveWeatherDisplay() {
  console.log('Clearing comprehensive weather display...');
  
  // Reset all display elements to loading state
  const elements = {
    'pressureValue': '--',
    'windSpeed': '-- km/h',
    'windDirectionText': '--',
    'uvValue': '--',
    'uvLevel': 'Loading...',
    'aqiValue': '--',
    'aqiStatus': 'Loading...',
    'soilTemp': '--',
    'soilMoisture': '--',
    'gddValue': '--',
    'heatIndexValue': '--°C',
    'heatIndexLevel': 'Loading...',
    'moonIcon': '🌙',
    'moonPhaseName': '--',
    'moonIllumination': '-- % visible'
  };
  
  Object.keys(elements).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = elements[id];
      // Reset any classes
      element.className = element.className.split(' ')[0]; // Keep only the base class
    }
  });
  
  // Reset gauge and progress elements
  const gauges = ['pressureGauge', 'aqiCircle', 'soilTempBar', 'soilMoistureCircle', 'gddProgress'];
  gauges.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (element.style.strokeDashoffset !== undefined) {
        element.style.strokeDashoffset = '0';
      }
      if (element.style.width !== undefined) {
        element.style.width = '0%';
      }
    }
  });
}

// Update farming dashboard with global weather data
function updateFarmingDashboardWithGlobalData(data, location) {
  console.log('=== UPDATING DASHBOARD FOR', location.name, '===');
  console.log('Input data:', data);
  console.log('Weather data being passed:', data.weather);
  
  // Update weather summary cards (this works!)
  updateWeatherSummary(data.weather, data.selected_crop.recommendations);
  
  // Use the SAME weather data that works for temp/humidity for comprehensive display
  console.log('=== UPDATING COMPREHENSIVE WEATHER WITH SAME DATA ===');
  updateComprehensiveWeatherFromBasicData(data.weather);
  
  // Update comprehensive weather scene
  updateComprehensiveWeatherScene(data.weather);
  
  // Update enhanced weather display with available data
  updateGlobalWeatherDisplay(data.weather);
  
  // Update overall condition
  updateOverallCondition(data.selected_crop.recommendations.conditions);
  
  // Update basic recommendations
  updateBasicRecommendations(data.selected_crop.recommendations);
  
  // Update irrigation advice
  updateIrrigation(data.selected_crop.recommendations.irrigation);
  
  // Clear crops and alerts sections for global locations
  clearCropsAndAlerts();
  
  console.log('=== DASHBOARD UPDATE COMPLETED FOR', location.name, '===');
}

// Update enhanced weather display for global locations
function updateGlobalWeatherDisplay(weather) {
  // Update pressure
  if (weather.pressure) {
    document.getElementById('pressureValue').textContent = `${weather.pressure.toFixed(0)}`;
  }
  
  // Update wind
  if (weather.wind_speed && weather.wind_direction) {
    document.getElementById('windSpeed').textContent = `${weather.wind_speed.toFixed(1)} km/h`;
    document.getElementById('windDirectionText').textContent = getWindDirection(weather.wind_direction);
    
    // Update wind arrow
    const windArrow = document.getElementById('windArrow');
    if (windArrow) {
      windArrow.style.transform = `rotate(${weather.wind_direction}deg)`;
    }
  }
  
  // Update UV index
  if (weather.uv_index) {
    document.getElementById('uvValue').textContent = weather.uv_index.toFixed(1);
    document.getElementById('uvLevel').textContent = getUVLevel(weather.uv_index);
  }
}

// Helper function to get wind direction
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Helper function to get UV level
function getUVLevel(uvIndex) {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

// Update basic recommendations for global locations
function updateBasicRecommendations(recommendations) {
  const container = document.getElementById('recommendationGrid');
  if (!container) return;
  
  const html = `
    <div class="recommendation-card">
      <div class="recommendation-icon">🌡️</div>
      <div class="recommendation-content">
        <h3>Temperature</h3>
        <p>${recommendations.conditions.temperature.message}</p>
      </div>
    </div>
    <div class="recommendation-card">
      <div class="recommendation-icon">💧</div>
      <div class="recommendation-content">
        <h3>Humidity</h3>
        <p>${recommendations.conditions.humidity.message}</p>
      </div>
    </div>
    <div class="recommendation-card">
      <div class="recommendation-icon">🌧️</div>
      <div class="recommendation-content">
        <h3>Water</h3>
        <p>${recommendations.conditions.water.message}</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// Clear crops and alerts for global locations
function clearCropsAndAlerts() {
  const cropsGrid = document.getElementById('cropsGrid');
  if (cropsGrid) {
    cropsGrid.innerHTML = '<div class="global-message"><i class="fas fa-globe"></i><p>Crop recommendations not available for global locations. Using predefined cities for detailed farming insights.</p></div>';
  }
  
  const alertsContainer = document.getElementById('farmingAlerts');
  if (alertsContainer) {
    alertsContainer.innerHTML = '<div class="global-message"><i class="fas fa-info-circle"></i><p>Farming alerts not available for this location.</p></div>';
  }
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icons = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${icons[type] || icons.info}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 400);
  }, 5000);
}

// Setup event listeners
function setupEventListeners() {
  cropSelect.addEventListener('change', () => {
    currentCrop = cropSelect.value;
    console.log(`Crop changed to: ${currentCrop}`);
    loadFarmingDashboard();
  });
  
  stageSelect.addEventListener('change', () => {
    currentStage = stageSelect.value;
    console.log(`Growth stage changed to: ${currentStage}`);
    loadFarmingDashboard();
  });
}

// Load available cities
async function loadCities() {
  try {
    const response = await fetch('http://localhost:4001/api/weather/cities?limit=15');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    if (result.success && result.data) {
      availableCities = result.data;
      console.log('Available cities loaded for farming dashboard');
    }
  } catch (error) {
    console.error('Error loading cities:', error);
  }
}

// Load crops data and populate dropdown
async function loadCropsData() {
  try {
    const response = await fetch('http://localhost:4001/api/farming/crops');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    if (result.success && result.data) {
      updateSeasonDisplay(result.data.current_season);
      // Crops dropdown is pre-populated in HTML with Hindi names
    }
  } catch (error) {
    console.error('Error loading crops data:', error);
  }
}

// Update season display
function updateSeasonDisplay(season) {
  const seasonElement = document.getElementById('currentSeason');
  const seasonInfo = {
    'Kharif': { text: 'Kharif Season (खरीफ)', icon: '🌧️' },
    'Rabi': { text: 'Rabi Season (रबी)', icon: '☀️' }
  };
  
  const info = seasonInfo[season] || { text: 'Loading...', icon: '🌱' };
  seasonElement.textContent = info.text;
  
  // Update season indicator icon
  const seasonIcon = document.querySelector('.season-icon');
  if (seasonIcon) {
    seasonIcon.textContent = info.icon;
  }
}

// Load complete farming dashboard
async function loadFarmingDashboard() {
  try {
    console.log('Loading farming dashboard for:', currentCity, 'crop:', currentCrop, 'stage:', currentStage);
    showLoading();
    
    // Load dashboard data
    const response = await fetch(`http://localhost:4001/api/farming/dashboard/${currentCity}?crop=${currentCrop}&stage=${currentStage}`);
    console.log('API response status:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    console.log('API result:', result);
    
    if (result.success && result.data) {
      console.log('Updating dashboard with data:', result.data);
      updateDashboard(result.data);
    } else {
      throw new Error(result.error || 'Failed to load farming data');
    }
    
  } catch (error) {
    console.error('Error loading farming dashboard:', error);
    showError('Failed to load farming data. Please try again.');
  } finally {
    hideLoading();
  }
}

// Update the complete dashboard
function updateDashboard(data) {
  // Update weather summary
  updateWeatherSummary(data.weather, data.selected_crop.recommendations);
  
  // Update comprehensive weather display
  updateComprehensiveWeatherDisplay(data.weather);
  
  // Update comprehensive weather scene
  updateComprehensiveWeatherScene(data.weather);
  
  // Update overall condition
  updateOverallCondition(data.selected_crop.recommendations.conditions);
  
  // Update recommendations
  updateRecommendations(data.selected_crop.recommendations);
  
  // Update irrigation advice
  updateIrrigation(data.selected_crop.recommendations.irrigation);
  
  // Update suitable crops
  updateSuitableCrops(data.suitable_crops);
  
  // Update farming alerts
  updateFarmingAlerts(data.farming_alerts);
  
  console.log('Dashboard updated successfully');
}

// Update weather summary for farmers
function updateWeatherSummary(weather, recommendations) {
  // Temperature
  document.getElementById('temperature').textContent = `${weather.temperature}°C`;
  updateStatusDisplay('tempStatus', recommendations.conditions.temperature);
  updateTemperatureVisual(weather.temperature, recommendations.crop);
  
  // Humidity
  document.getElementById('humidity').textContent = `${weather.humidity}%`;
  updateStatusDisplay('humidityStatus', recommendations.conditions.humidity);
  updateHumidityVisual(weather.humidity);
  
  // Rainfall
  document.getElementById('rainfall').textContent = `${weather.rainfall} mm/h`;
  updateStatusDisplay('rainfallStatus', recommendations.conditions.water);
  updateRainfallVisual(weather.rainfall);
  
  // Update weather scene
  updateWeatherScene(weather);
  
  // Update weather chart
  updateWeatherChart(weather);
}

// Update status display with farmer-friendly messages
function updateStatusDisplay(elementId, condition) {
  const element = document.getElementById(elementId);
  element.textContent = condition.message;
  
  // Remove existing status classes
  element.classList.remove('status-good', 'status-fair', 'status-poor');
  
  // Add appropriate status class
  if (condition.status === 'good') {
    element.classList.add('status-good');
  } else if (condition.status === 'fair' || condition.status === 'dry' || condition.status === 'humid') {
    element.classList.add('status-fair');
  } else {
    element.classList.add('status-poor');
  }
}

// Update overall condition display
function updateOverallCondition(conditions) {
  const container = document.getElementById('overallCondition');
  const iconElement = container.querySelector('.condition-icon');
  const textElement = container.querySelector('.condition-text');
  
  const conditionInfo = {
    good: {
      icon: '🌟',
      title: 'Excellent Farming Conditions!',
      message: 'Weather is perfect for your crops. Great time for farming activities.',
      class: 'condition-excellent'
    },
    fair: {
      icon: '⚖️',
      title: 'Fair Farming Conditions',
      message: 'Weather is okay. Some adjustments may be needed for optimal growth.',
      class: 'condition-fair'
    },
    poor: {
      icon: '⚠️',
      title: 'Challenging Conditions',
      message: 'Weather needs attention. Follow recommendations carefully.',
      class: 'condition-poor'
    }
  };
  
  const info = conditionInfo[conditions.overall] || conditionInfo.fair;
  
  iconElement.textContent = info.icon;
  textElement.innerHTML = `<h3>${info.title}</h3><p>${info.message}</p>`;
  
  // Update container class
  container.classList.remove('condition-excellent', 'condition-good', 'condition-fair', 'condition-poor');
  container.classList.add(info.class);
}

// Update recommendations grid
function updateRecommendations(recommendations) {
  const grid = document.getElementById('recommendationGrid');
  grid.innerHTML = '';
  
  // Temperature recommendation
  if (recommendations.conditions.temperature.action) {
    addRecommendationCard(grid, '🌡️', 'Temperature Management', 
      recommendations.conditions.temperature.message, 
      recommendations.conditions.temperature.action);
  }
  
  // Humidity recommendation
  if (recommendations.conditions.humidity.action) {
    addRecommendationCard(grid, '💧', 'Humidity Control', 
      recommendations.conditions.humidity.message, 
      recommendations.conditions.humidity.action);
  }
  
  // Protection advice
  if (recommendations.protection && recommendations.protection.length > 0) {
    recommendations.protection.forEach(protection => {
      addRecommendationCard(grid, protection.icon, protection.action, 
        protection.message, `Priority: ${protection.urgency}`);
    });
  }
  
  // Timing advice
  if (recommendations.timing && recommendations.timing.length > 0) {
    recommendations.timing.forEach(timing => {
      addRecommendationCard(grid, timing.icon, timing.activity, 
        timing.message, `Priority: ${timing.priority}`);
    });
  }
}

// Add recommendation card
function addRecommendationCard(container, icon, title, message, action) {
  const card = document.createElement('div');
  card.className = 'recommendation-card';
  card.innerHTML = `
    <h3>${icon} ${title}</h3>
    <p>${message}</p>
    <div class="recommendation-action">${action}</div>
  `;
  container.appendChild(card);
}

// Update irrigation section
function updateIrrigation(irrigation) {
  const card = document.getElementById('irrigationCard');
  const icon = card.querySelector('.irrigation-icon');
  const content = card.querySelector('.irrigation-content');
  
  icon.textContent = irrigation.icon;
  
  let urgencyClass = '';
  if (irrigation.urgency === 'high') {
    urgencyClass = 'irrigation-urgent';
  }
  
  card.classList.remove('irrigation-urgent');
  if (urgencyClass) {
    card.classList.add(urgencyClass);
  }
  
  content.innerHTML = `
    <h3>${irrigation.frequency.charAt(0).toUpperCase() + irrigation.frequency.slice(1)} Irrigation Needed</h3>
    <p>${irrigation.message}</p>
  `;
}

// Update suitable crops section
function updateSuitableCrops(crops) {
  const grid = document.getElementById('cropsGrid');
  grid.innerHTML = '';
  
  crops.forEach(crop => {
    const card = document.createElement('div');
    card.className = 'crop-card';
    card.onclick = () => selectCrop(crop.key);
    
    const suitabilityClass = `suitability-${crop.suitabilityText.toLowerCase()}`;
    
    card.innerHTML = `
      <div class="crop-icon">${crop.icon}</div>
      <div class="crop-name">${crop.name}</div>
      <div class="crop-suitability ${suitabilityClass}">${crop.suitabilityText}</div>
    `;
    
    grid.appendChild(card);
  });
}

// Select a crop
function selectCrop(cropKey) {
  cropSelect.value = cropKey;
  currentCrop = cropKey;
  loadFarmingDashboard();
}

// Update farming alerts
function updateFarmingAlerts(alerts) {
  const container = document.getElementById('farmingAlerts');
  container.innerHTML = '';
  
  if (!alerts || alerts.length === 0) {
    // Show notification for normal conditions (3-second popup)
    showNotification('All farming conditions are within normal range', 'success', 3000);
    return;
  }
  
  alerts.forEach(alert => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `farming-alert ${alert.level}`;
    alertDiv.innerHTML = `
      <div class="alert-icon">${alert.icon}</div>
      <div class="alert-content">
        <h4>${alert.message}</h4>
        <p>${alert.action}</p>
      </div>
    `;
    container.appendChild(alertDiv);
  });
}

// Initialize WebSocket connection
function initializeWebSocket() {
  socket.on('connect', () => {
    console.log('Connected to server via WebSocket');
    socket.emit('subscribe_weather', currentCity);
  });
  
  socket.on('weather_update', (data) => {
    if (data.city_name === currentCity) {
      console.log('Received weather update, refreshing farming data');
      loadFarmingDashboard();
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

// Utility functions
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

function showError(message) {
  console.error('Error:', message);
  // Could show a toast notification here
}

// Action button functions
function refreshFarmingData() {
  console.log('Manual refresh requested');
  loadFarmingDashboard();
}

function showWeatherForecast() {
  document.getElementById('forecastModal').style.display = 'block';
  // TODO: Load 7-day forecast data
}

function showCropCalendar() {
  const modal = document.getElementById('calendarModal');
  modal.style.display = 'block';
  loadCropCalendar();
}

function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;
  
  // Add notification to page
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Auto-hide after specified duration
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, duration);
}

function getNotificationIcon(type) {
  const icons = {
    'info': 'ℹ️',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌'
  };
  return icons[type] || 'ℹ️';
}

function showExpertTips() {
  showNotification('Expert tips feature coming soon! 🌾', 'info', 3000);
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Load crop calendar
async function loadCropCalendar() {
  try {
    const response = await fetch('http://localhost:4001/api/farming/calendar');
    const result = await response.json();
    
    if (result.success) {
      const content = document.getElementById('calendarContent');
      const data = result.data;
      
      content.innerHTML = `
        <div class="calendar-section">
          <h3>Current Season: ${data.current_season}</h3>
          <h4>Kharif Crops (June - November):</h4>
          <div class="crop-list">
            ${data.kharif_crops.map(crop => `<span class="crop-tag">${crop.icon} ${crop.name}</span>`).join('')}
          </div>
          <h4>Rabi Crops (December - May):</h4>
          <div class="crop-list">
            ${data.rabi_crops.map(crop => `<span class="crop-tag">${crop.icon} ${crop.name}</span>`).join('')}
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading crop calendar:', error);
  }
}

// Close modals when clicking outside
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};

// =============== WEATHER VISUAL FUNCTIONS ===============

// Update temperature visual indicator
function updateTemperatureVisual(temperature, crop) {
  const tempFill = document.getElementById('tempFill');
  const tempIdeal = document.getElementById('tempIdeal');
  
  if (!tempFill || !tempIdeal) return;
  
  // Calculate percentage based on range 0-50°C
  const percentage = Math.min(Math.max(temperature / 50 * 100, 0), 100);
  tempFill.style.width = `${percentage}%`;
  
  // Position ideal marker based on crop
  const cropRanges = {
    rice: { min: 20, max: 35 },
    wheat: { min: 15, max: 25 },
    cotton: { min: 25, max: 35 },
    sugarcane: { min: 25, max: 35 },
    tomato: { min: 20, max: 30 },
    onion: { min: 15, max: 25 }
  };
  
  const range = cropRanges[crop.key] || cropRanges.rice;
  const idealTemp = (range.min + range.max) / 2;
  const idealPosition = idealTemp / 50 * 100;
  tempIdeal.style.left = `${idealPosition}%`;
  
  // Color based on temperature
  if (temperature < 15) {
    tempFill.style.background = '#2196f3'; // Cold blue
  } else if (temperature > 40) {
    tempFill.style.background = '#f44336'; // Hot red
  } else {
    tempFill.style.background = '#4caf50'; // Good green
  }
}

// Update humidity circular progress
function updateHumidityVisual(humidity) {
  const humidityProgress = document.getElementById('humidityProgress');
  const humidityText = document.getElementById('humidityText');
  
  if (!humidityProgress || !humidityText) return;
  
  const circumference = 2 * Math.PI * 35; // radius is 35
  const offset = circumference - (humidity / 100) * circumference;
  
  setTimeout(() => {
    humidityProgress.style.strokeDashoffset = offset;
    humidityText.textContent = `${humidity}%`;
  }, 500);
}

// Update rainfall visual animation
function updateRainfallVisual(rainfall) {
  const raindrops = document.querySelectorAll('.raindrop');
  const waterFill = document.getElementById('waterFill');
  
  if (!waterFill) return;
  
  // Update water level based on rainfall (0-25mm scale)
  const waterLevel = Math.min(Math.max(rainfall / 25 * 100, 0), 100);
  waterFill.style.width = `${waterLevel}%`;
  
  // Animate raindrops based on rainfall intensity
  raindrops.forEach((drop, index) => {
    if (rainfall > 0) {
      drop.style.opacity = '1';
      drop.style.animationDuration = `${Math.max(0.5, 2 - rainfall / 10)}s`;
    } else {
      drop.style.opacity = '0';
    }
  });
}

// Update weather scene animation
function updateWeatherScene(weather) {
  const sunElement = document.getElementById('sunElement');
  const cloudsElement = document.getElementById('cloudsElement');
  const precipitationElement = document.getElementById('precipitationElement');
  const sceneText = document.getElementById('sceneText');
  
  if (!sunElement || !cloudsElement || !precipitationElement || !sceneText) return;
  
  const temp = weather.temperature;
  const rainfall = weather.rainfall;
  const description = weather.weather_description.toLowerCase();
  
  // Clear previous weather effects
  precipitationElement.innerHTML = '';
  
  // Sun visibility based on weather
  if (description.includes('clear') || description.includes('sunny')) {
    sunElement.style.opacity = '1';
    cloudsElement.style.opacity = '0.3';
    sceneText.textContent = `☀️ Sunny and clear! Perfect weather for outdoor farming activities.`;
  } else if (description.includes('cloud')) {
    sunElement.style.opacity = '0.4';
    cloudsElement.style.opacity = '1';
    sceneText.textContent = `☁️ Cloudy skies. Good conditions for most farming work.`;
  } else if (description.includes('rain') || rainfall > 0) {
    sunElement.style.opacity = '0.2';
    cloudsElement.style.opacity = '1';
    addRainEffect(precipitationElement, rainfall);
    
    if (rainfall > 10) {
      sceneText.textContent = `🌧️ Heavy rain! Take shelter and ensure proper drainage.`;
    } else {
      sceneText.textContent = `🌦️ Light rain. Good for crops but monitor field conditions.`;
    }
  } else if (description.includes('storm')) {
    sunElement.style.opacity = '0.1';
    cloudsElement.style.opacity = '1';
    addStormEffect(precipitationElement);
    sceneText.textContent = `⛈️ Storm warning! Secure equipment and seek shelter.`;
  } else {
    sunElement.style.opacity = '0.6';
    cloudsElement.style.opacity = '0.6';
    sceneText.textContent = `🌤️ ${description}. Monitor conditions for farming activities.`;
  }
  
  // Temperature-based scene adjustments
  if (temp > 40) {
    sunElement.style.filter = 'brightness(1.3) drop-shadow(0 0 15px rgba(255, 69, 0, 0.8))';
    sceneText.textContent += ` Very hot conditions - provide shade for crops.`;
  } else if (temp < 10) {
    sunElement.style.filter = 'brightness(0.6) drop-shadow(0 0 10px rgba(135, 206, 250, 0.5))';
    sceneText.textContent += ` Cold conditions - protect sensitive plants.`;
  }
}

// Add rain effect to scene
function addRainEffect(container, intensity) {
  const rainEffect = document.createElement('div');
  rainEffect.className = 'rain-effect';
  rainEffect.style.opacity = Math.min(intensity / 20, 1);
  container.appendChild(rainEffect);
  
  // Add individual raindrops for heavy rain
  if (intensity > 5) {
    for (let i = 0; i < Math.min(intensity, 20); i++) {
      const drop = document.createElement('div');
      drop.textContent = '💧';
      drop.style.position = 'absolute';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.fontSize = '0.8rem';
      drop.style.animation = `rainfall ${1 + Math.random()}s linear infinite`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(drop);
    }
  }
}

// Add storm effect to scene
function addStormEffect(container) {
  const stormEffect = document.createElement('div');
  stormEffect.className = 'rain-effect';
  stormEffect.style.opacity = '0.8';
  stormEffect.style.background = 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255, 255, 0, 0.3) 1px, rgba(255, 255, 0, 0.3) 2px)';
  container.appendChild(stormEffect);
  
  // Add lightning effect
  setTimeout(() => {
    const lightning = document.createElement('div');
    lightning.textContent = '⚡';
    lightning.style.position = 'absolute';
    lightning.style.top = '20%';
    lightning.style.left = '30%';
    lightning.style.fontSize = '2rem';
    lightning.style.animation = 'lightning 0.2s ease-in-out';
    container.appendChild(lightning);
    
    setTimeout(() => {
      lightning.remove();
    }, 200);
  }, Math.random() * 3000);
}

// Update weather chart
function updateWeatherChart(weather) {
  const canvas = document.getElementById('weatherCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Create simple bar chart
  const data = [
    { label: 'Temp', value: weather.temperature, max: 50, color: '#ff6b6b', unit: '°C' },
    { label: 'Humidity', value: weather.humidity, max: 100, color: '#4ecdc4', unit: '%' },
    { label: 'Rainfall', value: weather.rainfall, max: 25, color: '#45b7d1', unit: 'mm' }
  ];
  
  const barWidth = 80;
  const barSpacing = 120;
  const maxBarHeight = 120;
  const startX = 40;
  const startY = height - 40;
  
  data.forEach((item, index) => {
    const x = startX + index * barSpacing;
    const barHeight = (item.value / item.max) * maxBarHeight;
    const y = startY - barHeight;
    
    // Draw bar
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw value text
    ctx.fillStyle = '#333';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.value}${item.unit}`, x + barWidth/2, y - 10);
    
    // Draw label
    ctx.fillText(item.label, x + barWidth/2, startY + 20);
  });
  
  // Draw title
  ctx.fillStyle = '#2d5016';
  ctx.font = 'bold 16px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText('Current Weather Data', width/2, 30);
}

// Add CSS animation for lightning
function addLightningAnimation() {
  if (!document.getElementById('lightningStyle')) {
    const style = document.createElement('style');
    style.id = 'lightningStyle';
    style.textContent = `
      @keyframes lightning {
        0%, 100% { opacity: 0; filter: brightness(1); }
        10%, 30%, 50% { opacity: 1; filter: brightness(3) drop-shadow(0 0 10px yellow); }
        20%, 40% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize weather visuals
function initializeWeatherVisuals() {
  addLightningAnimation();
  
  // Set initial states
  const tempFill = document.getElementById('tempFill');
  const humidityProgress = document.getElementById('humidityProgress');
  const waterFill = document.getElementById('waterFill');
  
  if (tempFill) tempFill.style.width = '0%';
  if (humidityProgress) humidityProgress.style.strokeDashoffset = '220';
  if (waterFill) waterFill.style.width = '0%';
}

// ==========================================================================
// COMPREHENSIVE WEATHER DISPLAY FUNCTIONS
// ==========================================================================

// Update comprehensive weather using the same working data as basic weather
function updateComprehensiveWeatherFromBasicData(weather) {
  console.log('=== COMPREHENSIVE UPDATE WITH WORKING DATA ===');
  console.log('Weather received:', weather);
  
  // First, test if elements exist
  testComprehensiveWeatherElements();
  
  try {
    // 1. Pressure - use exact same data
    const pressureEl = document.getElementById('pressureValue');
    if (pressureEl) {
      const pressure = weather.pressure || 1013;
      pressureEl.textContent = Math.round(pressure);
      pressureEl.style.color = 'red'; // Make it obvious it changed
      console.log('✅ Pressure set to:', pressure);
    } else {
      console.error('❌ pressureValue element not found!');
    }
    
    // 2. Wind - use exact same data
    const windSpeedEl = document.getElementById('windSpeed');
    const windDirEl = document.getElementById('windDirectionText');
    if (windSpeedEl) {
      const windSpeed = weather.wind_speed || 5;
      windSpeedEl.textContent = `${Math.round(windSpeed)} km/h`;
      windSpeedEl.style.color = 'blue'; // Make it obvious it changed
      console.log('✅ Wind speed set to:', windSpeed);
    } else {
      console.error('❌ windSpeed element not found!');
    }
    if (windDirEl) {
      const windDir = weather.wind_direction || 0;
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const dirIndex = Math.round((windDir % 360) / 22.5) % 16;
      windDirEl.textContent = `${directions[dirIndex]} (${Math.round(windDir)}°)`;
      windDirEl.style.color = 'green'; // Make it obvious it changed
      console.log('✅ Wind direction set to:', windDir);
    } else {
      console.error('❌ windDirectionText element not found!');
    }
    
    // 3. UV Index - use exact same data
    const uvEl = document.getElementById('uvValue');
    const uvLevelEl = document.getElementById('uvLevel');
    if (uvEl) {
      const uv = weather.uv_index || 3;
      uvEl.textContent = uv.toFixed(1);
      uvEl.style.color = 'orange'; // Make it obvious it changed
      console.log('✅ UV index set to:', uv);
    } else {
      console.error('❌ uvValue element not found!');
    }
    if (uvLevelEl) {
      const uv = weather.uv_index || 3;
      let level = 'Moderate';
      if (uv < 3) level = 'Low';
      else if (uv > 7) level = 'High';
      uvLevelEl.textContent = level;
      uvLevelEl.style.color = 'purple'; // Make it obvious it changed
    } else {
      console.error('❌ uvLevel element not found!');
    }
    
    // 4. Air Quality - calculate from weather
    const aqiEl = document.getElementById('aqiValue');
    const aqiStatusEl = document.getElementById('aqiStatus');
    if (aqiEl) {
      const rainfall = weather.rainfall || 0;
      const windSpeed = weather.wind_speed || 5;
      let aqi = 50; // default
      if (rainfall > 2) aqi = 30; // rain improves air
      else if (windSpeed > 10) aqi = 40; // wind disperses pollution
      aqiEl.textContent = Math.round(aqi);
      aqiEl.style.color = 'darkgreen'; // Make it obvious it changed
      console.log('✅ AQI set to:', aqi);
    } else {
      console.error('❌ aqiValue element not found!');
    }
    if (aqiStatusEl) {
      aqiStatusEl.textContent = 'Good';
      aqiStatusEl.style.color = 'darkblue'; // Make it obvious it changed
    } else {
      console.error('❌ aqiStatus element not found!');
    }
    
    // 5. Soil Conditions - calculate from temperature and humidity
    const soilTempEl = document.getElementById('soilTemp');
    const soilMoistureEl = document.getElementById('soilMoisture');
    if (soilTempEl) {
      const soilTemp = (weather.temperature || 25) - 5;
      soilTempEl.textContent = soilTemp.toFixed(1);
      soilTempEl.style.color = 'brown'; // Make it obvious it changed
      console.log('✅ Soil temp set to:', soilTemp);
    } else {
      console.error('❌ soilTemp element not found!');
    }
    if (soilMoistureEl) {
      const humidity = weather.humidity || 60;
      const rainfall = weather.rainfall || 0;
      const soilMoisture = Math.min(100, humidity + (rainfall * 5));
      soilMoistureEl.textContent = Math.round(soilMoisture);
      soilMoistureEl.style.color = 'darkturquoise'; // Make it obvious it changed
      console.log('✅ Soil moisture set to:', soilMoisture);
    } else {
      console.error('❌ soilMoisture element not found!');
    }
    
    // 6. Growing Degree Days - calculate from temperature
    const gddEl = document.getElementById('gddValue');
    if (gddEl) {
      const temp = weather.temperature || 25;
      const gdd = Math.max(0, temp - 10);
      gddEl.textContent = gdd.toFixed(1);
      gddEl.style.color = 'darkred'; // Make it obvious it changed
      console.log('✅ GDD set to:', gdd);
    } else {
      console.error('❌ gddValue element not found!');
    }
    
    // 7. Heat Index - use temperature or calculate
    const heatIndexEl = document.getElementById('heatIndexValue');
    const heatLevelEl = document.getElementById('heatIndexLevel');
    if (heatIndexEl) {
      const temp = weather.temperature || 25;
      const humidity = weather.humidity || 60;
      let heatIndex = temp;
      if (temp > 27) {
        heatIndex = temp + (humidity - 60) * 0.1; // simple calculation
      }
      heatIndexEl.textContent = `${heatIndex.toFixed(1)}°C`;
      heatIndexEl.style.color = 'darkorange'; // Make it obvious it changed
      console.log('✅ Heat index set to:', heatIndex);
    } else {
      console.error('❌ heatIndexValue element not found!');
    }
    if (heatLevelEl) {
      const temp = weather.temperature || 25;
      let level = 'Normal';
      if (temp > 35) level = 'Caution';
      else if (temp > 40) level = 'Danger';
      heatLevelEl.textContent = level;
      heatLevelEl.style.color = 'darkmagenta'; // Make it obvious it changed
    } else {
      console.error('❌ heatIndexLevel element not found!');
    }
    
    // 8. Moon Phase - always works
    const moonIconEl = document.getElementById('moonIcon');
    const moonNameEl = document.getElementById('moonPhaseName');
    const moonIllumEl = document.getElementById('moonIllumination');
    if (moonIconEl) {
      moonIconEl.textContent = '🌕'; // Full moon to make it obvious
      console.log('✅ Moon icon updated');
    } else {
      console.error('❌ moonIcon element not found!');
    }
    if (moonNameEl) {
      moonNameEl.textContent = 'Current Phase';
      moonNameEl.style.color = 'darkviolet'; // Make it obvious it changed
    } else {
      console.error('❌ moonPhaseName element not found!');
    }
    if (moonIllumEl) {
      moonIllumEl.textContent = '75% visible';
      moonIllumEl.style.color = 'darkcyan'; // Make it obvious it changed
    } else {
      console.error('❌ moonIllumination element not found!');
    }
    
    console.log('✅ ALL COMPREHENSIVE WEATHER UPDATED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Error updating comprehensive weather:', error);
  }
}

// Test function to check if all elements exist
function testComprehensiveWeatherElements() {
  console.log('=== TESTING ELEMENT EXISTENCE ===');
  
  const elementIds = [
    'pressureValue', 'windSpeed', 'windDirectionText', 'uvValue', 'uvLevel',
    'aqiValue', 'aqiStatus', 'soilTemp', 'soilMoisture', 'gddValue',
    'heatIndexValue', 'heatIndexLevel', 'moonIcon', 'moonPhaseName', 'moonIllumination'
  ];
  
  elementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ Element '${id}' found:`, element);
    } else {
      console.error(`❌ Element '${id}' NOT FOUND!`);
    }
  });
  
  console.log('=== ELEMENT TEST COMPLETE ===');
}

// Force direct update of weather display elements
function forceUpdateWeatherDisplayDirect(weather) {
  console.log('=== FORCE DIRECT UPDATE ===');
  console.log('Direct update with weather:', weather);
  
  try {
    // Direct pressure update
    const pressureEl = document.getElementById('pressureValue');
    if (pressureEl && weather.pressure) {
      pressureEl.textContent = Math.round(weather.pressure);
      console.log('Pressure updated to:', weather.pressure);
    }
    
    // Direct wind update
    const windSpeedEl = document.getElementById('windSpeed');
    if (windSpeedEl && weather.wind_speed !== undefined) {
      windSpeedEl.textContent = `${Math.round(weather.wind_speed)} km/h`;
      console.log('Wind speed updated to:', weather.wind_speed);
    }
    
    // Direct UV update
    const uvEl = document.getElementById('uvValue');
    if (uvEl && weather.uv_index !== undefined) {
      uvEl.textContent = weather.uv_index.toFixed(1);
      console.log('UV index updated to:', weather.uv_index);
    }
    
    // Direct AQI update
    const aqiEl = document.getElementById('aqiValue');
    if (aqiEl && weather.air_quality && weather.air_quality.aqi) {
      aqiEl.textContent = Math.round(weather.air_quality.aqi);
      console.log('AQI updated to:', weather.air_quality.aqi);
    }
    
    // Direct soil temperature update
    const soilTempEl = document.getElementById('soilTemp');
    if (soilTempEl && weather.soil_temperature !== undefined) {
      soilTempEl.textContent = weather.soil_temperature.toFixed(1);
      console.log('Soil temp updated to:', weather.soil_temperature);
    }
    
    // Direct soil moisture update
    const soilMoistureEl = document.getElementById('soilMoisture');
    if (soilMoistureEl && weather.soil_moisture !== undefined) {
      soilMoistureEl.textContent = Math.round(weather.soil_moisture);
      console.log('Soil moisture updated to:', weather.soil_moisture);
    }
    
    // Direct GDD update
    const gddEl = document.getElementById('gddValue');
    if (gddEl && weather.growing_degree_days !== undefined) {
      gddEl.textContent = weather.growing_degree_days.toFixed(1);
      console.log('GDD updated to:', weather.growing_degree_days);
    }
    
    // Direct heat index update
    const heatIndexEl = document.getElementById('heatIndexValue');
    if (heatIndexEl && weather.heat_index !== undefined) {
      heatIndexEl.textContent = `${weather.heat_index.toFixed(1)}°C`;
      console.log('Heat index updated to:', weather.heat_index);
    }
    
    console.log('=== DIRECT UPDATE COMPLETED ===');
    
  } catch (error) {
    console.error('Error in direct update:', error);
  }
}

// Update pressure gauge display
function updatePressureGauge(pressure, trend) {
  try {
    const pressureValue = document.getElementById('pressureValue');
    const pressureGauge = document.getElementById('pressureGauge');
    const pressureTrend = document.getElementById('pressureTrend');
    const trendIcon = document.getElementById('pressureTrendIcon');
    const trendText = document.getElementById('pressureTrendText');
    
    if (pressureValue && pressure) {
      pressureValue.textContent = Math.round(pressure);
      
      // Calculate gauge fill (normal range: 980-1040 hPa)
      const normalizedPressure = Math.max(0, Math.min(100, ((pressure - 980) / 60) * 100));
      const circumference = 2 * Math.PI * 40; // radius = 40
      const offset = circumference - (normalizedPressure / 100) * circumference;
      
      if (pressureGauge) {
        pressureGauge.style.strokeDasharray = `${circumference} ${circumference}`;
        pressureGauge.style.strokeDashoffset = offset;
      }
    } else if (pressureValue) {
      pressureValue.textContent = '1013'; // Default pressure
    }
    
    // Update pressure trend
    if (trendIcon && trendText) {
      const trendInfo = {
        'rising': { icon: '📈', text: 'Rising' },
        'falling': { icon: '📉', text: 'Falling' },
        'stable': { icon: '➡️', text: 'Stable' }
      };
      
      const info = trendInfo[trend] || { icon: '➡️', text: 'Stable' };
      trendIcon.textContent = info.icon;
      trendText.textContent = info.text;
      
      if (pressureTrend) {
        pressureTrend.className = `pressure-trend ${trend || 'stable'}`;
      }
    }
  } catch (error) {
    console.error('Error updating pressure gauge:', error);
  }
}

// Update wind compass
function updateWindCompass(windSpeed, windDirection) {
  try {
    const windArrow = document.getElementById('windArrow');
    const windSpeedElement = document.getElementById('windSpeed');
    const windDirectionText = document.getElementById('windDirectionText');
    
    if (windSpeedElement) {
      const speed = windSpeed !== null && windSpeed !== undefined ? windSpeed : 5;
      windSpeedElement.textContent = `${Math.round(speed)} km/h`;
    }
    
    if (windArrow) {
      const direction = windDirection !== null && windDirection !== undefined ? windDirection : 0;
      // Rotate the arrow based on wind direction
      windArrow.style.transform = `translate(-50%, -100%) rotate(${direction}deg)`;
    }
    
    if (windDirectionText) {
      const direction = windDirection !== null && windDirection !== undefined ? windDirection : 0;
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                         'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const directionIndex = Math.round((direction % 360) / 22.5) % 16;
      windDirectionText.textContent = `${directions[directionIndex]} (${Math.round(direction)}°)`;
    }
  } catch (error) {
    console.error('Error updating wind compass:', error);
  }
}

// Update UV index meter
function updateUVMeter(uvIndex) {
  try {
    const uvValue = document.getElementById('uvValue');
    const uvIndicator = document.getElementById('uvIndicator');
    const uvLevel = document.getElementById('uvLevel');
    
    const index = uvIndex !== null && uvIndex !== undefined ? uvIndex : 3;
    
    if (uvValue) {
      uvValue.textContent = Math.round(index * 10) / 10;
    }
    
    // Position indicator on UV scale (0-11+ scale)
    if (uvIndicator) {
      const position = Math.max(0, Math.min(100, (index / 11) * 100));
      uvIndicator.style.left = `${position}%`;
    }
    
    // Update UV level display
    if (uvLevel) {
      let level, className;
      if (index < 3) {
        level = 'Low'; className = 'low';
      } else if (index < 6) {
        level = 'Moderate'; className = 'moderate';
      } else if (index < 8) {
        level = 'High'; className = 'high';
      } else if (index < 11) {
        level = 'Very High'; className = 'very-high';
      } else {
        level = 'Extreme'; className = 'extreme';
      }
      
      uvLevel.textContent = level;
      uvLevel.className = `uv-level ${className}`;
    }
  } catch (error) {
    console.error('Error updating UV meter:', error);
  }
}

// Update air quality indicator
// Update air quality indicator
function updateAirQualityIndicator(airQuality) {
  try {
    const aqiValue = document.getElementById('aqiValue');
    const aqiCircle = document.getElementById('aqiCircle');
    const aqiStatus = document.getElementById('aqiStatus');
    
    // Get AQI value with fallback
    let aqi = 50; // Default moderate AQI
    if (airQuality) {
      if (typeof airQuality === 'object' && airQuality.aqi) {
        aqi = airQuality.aqi;
      } else if (typeof airQuality === 'number') {
        aqi = airQuality;
      }
    }
    
    if (aqiValue) {
      aqiValue.textContent = Math.round(aqi);
    }
    
    // Calculate circle fill (0-500 scale)
    if (aqiCircle) {
      const normalizedAQI = Math.max(0, Math.min(100, (aqi / 300) * 100));
      const circumference = 2 * Math.PI * 35; // radius = 35
      const offset = circumference - (normalizedAQI / 100) * circumference;
      
      aqiCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      aqiCircle.style.strokeDashoffset = offset;
      
      // Update color based on AQI level
      let className;
      if (aqi <= 50) className = 'good';
      else if (aqi <= 100) className = 'moderate';
      else if (aqi <= 150) className = 'unhealthy';
      else if (aqi <= 200) className = 'very-unhealthy';
      else className = 'hazardous';
      
      aqiCircle.className = `aqi-fill ${className}`;
    }
    
    // Update status text
    if (aqiStatus) {
      let status, className;
      if (aqi <= 50) {
        status = 'Good'; className = 'good';
      } else if (aqi <= 100) {
        status = 'Moderate'; className = 'moderate';
      } else if (aqi <= 150) {
        status = 'Unhealthy for Sensitive'; className = 'unhealthy';
      } else if (aqi <= 200) {
        status = 'Unhealthy'; className = 'very-unhealthy';
      } else {
        status = 'Hazardous'; className = 'hazardous';
      }
      
      aqiStatus.textContent = status;
      aqiStatus.className = `aqi-status ${className}`;
    }
  } catch (error) {
    console.error('Error updating air quality indicator:', error);
  }
}

// Update soil conditions
function updateSoilConditions(soilTemp, soilMoisture) {
  try {
    const soilTempElement = document.getElementById('soilTemp');
    const soilTempBar = document.getElementById('soilTempBar');
    const soilMoistureElement = document.getElementById('soilMoisture');
    const soilMoistureCircle = document.getElementById('soilMoistureCircle');
    
    // Update soil temperature with fallback
    const temp = soilTemp !== null && soilTemp !== undefined ? soilTemp : 20;
    if (soilTempElement) {
      soilTempElement.textContent = Math.round(temp * 10) / 10;
    }
    
    // Update temperature bar (0-50°C range)
    if (soilTempBar) {
      const tempPercentage = Math.max(0, Math.min(100, (temp / 50) * 100));
      soilTempBar.style.width = `${tempPercentage}%`;
    }
    
    // Update soil moisture with fallback
    const moisture = soilMoisture !== null && soilMoisture !== undefined ? soilMoisture : 60;
    if (soilMoistureElement) {
      soilMoistureElement.textContent = Math.round(moisture);
    }
    
    // Update moisture circle
    if (soilMoistureCircle) {
      const circumference = 2 * Math.PI * 25; // radius = 25
      const offset = circumference - (moisture / 100) * circumference;
      soilMoistureCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      soilMoistureCircle.style.strokeDashoffset = offset;
    }
  } catch (error) {
    console.error('Error updating soil conditions:', error);
  }
}

// Update growing degree days
function updateGrowingDegreeDays(gdd) {
  try {
    const gddValue = document.getElementById('gddValue');
    const gddProgress = document.getElementById('gddProgress');
    
    const degreedays = gdd !== null && gdd !== undefined ? gdd : 10;
    
    if (gddValue) {
      gddValue.textContent = Math.round(degreedays * 10) / 10;
    }
    
    // Update progress bar (0-30 GDD range for daily)
    if (gddProgress) {
      const gddPercentage = Math.max(0, Math.min(100, (degreedays / 30) * 100));
      gddProgress.style.width = `${gddPercentage}%`;
    }
  } catch (error) {
    console.error('Error updating growing degree days:', error);
  }
}

// Update heat index
function updateHeatIndex(heatIndex) {
  try {
    const heatIndexValue = document.getElementById('heatIndexValue');
    const heatIndexLevel = document.getElementById('heatIndexLevel');
    
    const index = heatIndex !== null && heatIndex !== undefined ? heatIndex : 25;
    
    if (heatIndexValue) {
      heatIndexValue.textContent = `${Math.round(index * 10) / 10}°C`;
    }
    
    // Determine heat index level
    let level, className;
    if (index < 27) {
      level = 'Normal'; className = 'normal';
    } else if (index < 32) {
      level = 'Caution'; className = 'caution';
    } else if (index < 40) {
      level = 'Extreme Caution'; className = 'extreme-caution';
    } else if (index < 54) {
      level = 'Danger'; className = 'danger';
    } else {
      level = 'Extreme Danger'; className = 'extreme-danger';
    }
    
    if (heatIndexValue) {
      heatIndexValue.className = `heat-index-value ${className}`;
    }
    
    if (heatIndexLevel) {
      heatIndexLevel.textContent = level;
      heatIndexLevel.className = `heat-index-level ${className}`;
    }
  } catch (error) {
    console.error('Error updating heat index:', error);
  }
}

// Update moon phase display
function updateMoonPhase(moonPhase, moonIllumination) {
  try {
    const moonIcon = document.getElementById('moonIcon');
    const moonPhaseName = document.getElementById('moonPhaseName');
    const moonIlluminationElement = document.getElementById('moonIllumination');
    
    // Use the provided moon phase or fallback to default
    const phase = moonPhase || '🌙';
    
    // If it's just an emoji, use it directly
    if (phase.length <= 2) {
      if (moonIcon) moonIcon.textContent = phase;
      if (moonPhaseName) moonPhaseName.textContent = 'Current Phase';
    } else {
      // If it's a phase name, convert to icon and name
      const moonData = {
        'new_moon': { icon: '🌑', name: 'New Moon' },
        'waxing_crescent': { icon: '🌒', name: 'Waxing Crescent' },
        'first_quarter': { icon: '🌓', name: 'First Quarter' },
        'waxing_gibbous': { icon: '🌔', name: 'Waxing Gibbous' },
        'full_moon': { icon: '🌕', name: 'Full Moon' },
        'waning_gibbous': { icon: '🌖', name: 'Waning Gibbous' },
        'last_quarter': { icon: '🌗', name: 'Last Quarter' },
        'waning_crescent': { icon: '🌘', name: 'Waning Crescent' }
      };
      
      const phaseData = moonData[phase] || { icon: '🌙', name: 'Current Phase' };
      
      if (moonIcon) moonIcon.textContent = phaseData.icon;
      if (moonPhaseName) moonPhaseName.textContent = phaseData.name;
    }
    
    // Update illumination
    const illumination = moonIllumination !== null && moonIllumination !== undefined ? moonIllumination : 50;
    if (moonIlluminationElement) {
      moonIlluminationElement.textContent = `${Math.round(illumination)}% visible`;
    }
  } catch (error) {
    console.error('Error updating moon phase:', error);
  }
}

// ==========================================================================
// END COMPREHENSIVE WEATHER DISPLAY FUNCTIONS
// ==========================================================================

// Update comprehensive weather scene with animations only
function updateComprehensiveWeatherScene(weather) {
  console.log('Updating comprehensive weather scene with animations:', weather);
  
  // Update main scene overlay
  updateSceneOverlay(weather);
  
  // Update scene animations based on weather
  updateEnhancedSceneAnimations(weather);
}

// Update scene overlay information
function updateSceneOverlay(weather) {
  const sceneTemp = document.getElementById('sceneTemp');
  const sceneCondition = document.getElementById('sceneCondition');
  
  if (sceneTemp && weather.temperature) {
    sceneTemp.textContent = `${Math.round(weather.temperature)}°C`;
  }
  
  if (sceneCondition && weather.weather_description) {
    sceneCondition.textContent = weather.weather_description;
  }
}

// Enhanced scene animations based on comprehensive weather data
function updateEnhancedSceneAnimations(weather) {
  const sunElement = document.getElementById('sunElement');
  const cloudsElement = document.getElementById('cloudsElement');
  const precipitationElement = document.getElementById('precipitationElement');
  const sceneContainer = document.getElementById('weatherScene');
  
  if (!sunElement || !cloudsElement || !precipitationElement || !sceneContainer) return;
  
  // Clear any existing effects
  clearWeatherEffects(sceneContainer);
  
  // Update sun based on UV index and cloud cover
  updateSunAnimation(sunElement, weather);
  
  // Update clouds based on cloud cover
  updateCloudAnimation(cloudsElement, weather);
  
  // Add precipitation effects
  updatePrecipitationAnimation(precipitationElement, weather);
  
  // Add temperature-based effects
  updateTemperatureEffects(sceneContainer, weather);
  
  // Add wind effects
  updateWindEffects(sceneContainer, weather);
  
  // Add atmospheric pressure effects
  updateAtmosphericEffects(sceneContainer, weather);
  
  // Update crop field based on selected crop
  updateCropFieldAnimation(sceneContainer, weather);
  
  // Update background based on conditions
  updateSceneBackground(sceneContainer, weather);
}

// Clear existing weather effects
function clearWeatherEffects(container) {
  const existingEffects = container.querySelectorAll('.weather-effect');
  existingEffects.forEach(effect => effect.remove());
  
  // Also clear existing crop fields
  const existingCropFields = container.querySelectorAll('.crop-field');
  existingCropFields.forEach(field => field.remove());
}

// Update sun animation based on UV index and visibility
function updateSunAnimation(sunElement, weather) {
  let sunOpacity = 1;
  let sunIntensity = 1;
  
  // Adjust sun based on cloud cover
  if (weather.cloud_cover) {
    sunOpacity = weather.cloud_cover > 80 ? 0.2 : weather.cloud_cover > 50 ? 0.5 : 0.8;
  }
  
  // Adjust sun intensity based on UV index
  if (weather.uv_index) {
    sunIntensity = Math.min(weather.uv_index / 5, 2); // Scale UV index to intensity
  }
  
  sunElement.style.opacity = sunOpacity;
  sunElement.style.filter = `brightness(${sunIntensity}) drop-shadow(0 0 20px rgba(255, 215, 0, ${sunIntensity * 0.5}))`;
}

// Update cloud animation based on cloud cover and humidity
function updateCloudAnimation(cloudsElement, weather) {
  let cloudOpacity = 0.3;
  
  if (weather.cloud_cover) {
    cloudOpacity = Math.max(0.1, weather.cloud_cover / 100);
  }
  
  if (weather.humidity && weather.humidity > 80) {
    cloudOpacity = Math.min(cloudOpacity + 0.3, 1);
  }
  
  cloudsElement.style.opacity = cloudOpacity;
  
  // Add more clouds if very cloudy
  if (weather.cloud_cover && weather.cloud_cover > 70) {
    addExtraClouds(cloudsElement.parentElement);
  }
}

// Add extra clouds for very cloudy conditions
function addExtraClouds(container) {
  for (let i = 0; i < 2; i++) {
    const extraCloud = document.createElement('div');
    extraCloud.className = 'cloud weather-effect';
    extraCloud.style.position = 'absolute';
    extraCloud.style.fontSize = '2rem';
    extraCloud.style.top = `${60 + Math.random() * 40}px`;
    extraCloud.style.left = `${10 + Math.random() * 70}%`;
    extraCloud.style.animation = `cloudFloat ${6 + Math.random() * 4}s ease-in-out infinite`;
    extraCloud.style.animationDelay = `${Math.random() * 2}s`;
    extraCloud.textContent = '☁️';
    container.appendChild(extraCloud);
  }
}

// Update precipitation based on rainfall and weather conditions
function updatePrecipitationAnimation(precipitationElement, weather) {
  precipitationElement.innerHTML = '';
  
  if (weather.rainfall && weather.rainfall > 0) {
    // Add realistic rain
    const rainIntensity = Math.min(weather.rainfall, 25);
    precipitationElement.innerHTML = generateRainAnimation(rainIntensity);
  } else if (weather.weather_condition && weather.weather_condition.toLowerCase().includes('snow')) {
    // Add realistic snow
    precipitationElement.innerHTML = generateSnowAnimation();
  } else if (weather.weather_condition && weather.weather_condition.toLowerCase().includes('thunder')) {
    // Add realistic lightning
    addLightningEffect(precipitationElement.parentElement);
  }
  
  // Add fog if visibility is low
  if (weather.visibility && weather.visibility < 5000) {
    addFogEffect(precipitationElement.parentElement, weather.visibility);
  }
}

// Update temperature-based effects with professional visuals
function updateTemperatureEffects(container, weather) {
  if (weather.temperature) {
    if (weather.temperature > 35 || (weather.heat_index && weather.heat_index > 40)) {
      // Add realistic heat shimmer for very hot weather
      const heatShimmer = document.createElement('div');
      heatShimmer.className = 'heat-shimmer weather-effect';
      container.appendChild(heatShimmer);
    }
    
    // Adjust background temperature tint with smooth transitions
    if (weather.temperature > 35) {
      container.style.filter = 'sepia(0.15) saturate(1.3) hue-rotate(15deg)';
    } else if (weather.temperature > 25) {
      container.style.filter = 'saturate(1.1) brightness(1.05)';
    } else if (weather.temperature < 5) {
      container.style.filter = 'hue-rotate(180deg) brightness(0.8) saturate(1.2)';
    } else if (weather.temperature < 15) {
      container.style.filter = 'hue-rotate(30deg) brightness(0.95)';
    } else {
      container.style.filter = 'none';
    }
  }
}

// Update wind effects with realistic visualizations
function updateWindEffects(container, weather) {
  if (weather.wind_speed && weather.wind_speed > 8) {
    // Add multiple wind layers for depth
    const windLayers = Math.min(Math.floor(weather.wind_speed / 8), 5);
    
    for (let i = 0; i < windLayers; i++) {
      const windLine = document.createElement('div');
      windLine.className = 'wind-lines weather-effect';
      windLine.style.top = `${25 + i * 15}%`;
      windLine.style.animationDelay = `${i * 0.4}s`;
      windLine.style.animationDuration = `${Math.max(1.5 - weather.wind_speed / 30, 0.8)}s`;
      windLine.style.opacity = Math.max(0.3, 1 - i * 0.2);
      container.appendChild(windLine);
    }
    
    // Enhance cloud movement in windy conditions
    const clouds = container.querySelectorAll('.cloud');
    clouds.forEach((cloud, index) => {
      const baseSpeed = 15; // base animation duration
      const windEffect = Math.max(baseSpeed - weather.wind_speed / 2, 8);
      cloud.style.animationDuration = `${windEffect}s`;
      
      // Add slight rotation for strong winds
      if (weather.wind_speed > 20) {
        cloud.style.transform = `rotate(${Math.sin(Date.now() / 1000 + index) * 2}deg)`;
      }
    });
  }
}

// Update atmospheric effects with professional polish
function updateAtmosphericEffects(container, weather) {
  // Add humidity-based atmospheric particles
  if (weather.humidity && weather.humidity > 70) {
    addAtmosphericParticles(container, weather.humidity);
  }
  
  // Pressure-based atmosphere adjustments
  if (weather.pressure) {
    if (weather.pressure < 995) {
      // Very low pressure - stormy, oppressive atmosphere
      container.style.filter = (container.style.filter || '') + ' brightness(0.75) contrast(1.3) saturate(0.8)';
    } else if (weather.pressure < 1005) {
      // Low pressure - unsettled weather
      container.style.filter = (container.style.filter || '') + ' brightness(0.85) contrast(1.15)';
    } else if (weather.pressure > 1025) {
      // High pressure - clear, crisp atmosphere
      container.style.filter = (container.style.filter || '') + ' brightness(1.1) contrast(1.1) saturate(1.15)';
    }
  }
  
  // UV index effects
  if (weather.uv_index && weather.uv_index > 8) {
    // Add intense sunlight effect
    const sunElement = container.querySelector('.sun');
    if (sunElement) {
      sunElement.style.boxShadow = `
        0 0 30px rgba(255, 193, 7, 1),
        0 0 60px rgba(255, 193, 7, 0.8),
        0 0 90px rgba(255, 193, 7, 0.4),
        0 0 120px rgba(255, 193, 7, 0.2)
      `;
    }
  }
}

// Update scene background based on overall conditions
function updateSceneBackground(container, weather) {
  let timeOfDay = 'day'; // Default to day
  
  // Simple time detection (you could enhance this with actual sunrise/sunset times)
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 6 || hour > 20) {
    timeOfDay = 'night';
  } else if (hour < 8 || hour > 18) {
    timeOfDay = 'twilight';
  }
  
  // Update background gradient based on time and weather
  let gradient;
  if (timeOfDay === 'night') {
    gradient = 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  } else if (timeOfDay === 'twilight') {
    gradient = 'linear-gradient(to bottom, #ff6b6b 0%, #ffa726 50%, #42a5f5 100%)';
  } else {
    // Day time - adjust based on weather
    if (weather.cloud_cover && weather.cloud_cover > 70) {
      gradient = 'linear-gradient(to bottom, #78909c 0%, #90a4ae 50%, #a5d6a7 100%)';
    } else {
      gradient = 'linear-gradient(to bottom, #87ceeb 0%, #98d8f0 50%, #90c695 100%)';
    }
  }
  
  container.style.background = gradient;
}

// Update crop field animation based on selected crop and weather
function updateCropFieldAnimation(container, weather) {
  // Create crop field container if it doesn't exist
  let cropFieldContainer = container.querySelector('.crop-field-container');
  if (!cropFieldContainer) {
    cropFieldContainer = document.createElement('div');
    cropFieldContainer.className = 'crop-field-container';
    cropFieldContainer.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 20px;
      right: 20px;
      height: 120px;
      z-index: 1;
      overflow: hidden;
    `;
    container.appendChild(cropFieldContainer);
  }
  
  // Clear existing crop field
  cropFieldContainer.innerHTML = '';
  
  // Get selected crop from global variable
  const selectedCrop = currentCrop || 'rice';
  
  // Create crop field based on selected crop
  const cropField = document.createElement('div');
  cropField.className = `crop-field ${selectedCrop}-field`;
  
  // Generate crop elements based on crop type
  generateCropElements(cropField, selectedCrop, weather);
  
  // Apply weather effects to crops
  applyCropWeatherEffects(cropField, weather);
  
  cropFieldContainer.appendChild(cropField);
}

// Generate crop elements based on crop type
function generateCropElements(container, cropType, weather) {
  const numCrops = 8; // Number of crop plants/stalks to show
  
  for (let i = 0; i < numCrops; i++) {
    const cropElement = document.createElement('div');
    cropElement.className = `crop-element ${cropType}-element`;
    
    // Position crops across the field
    const leftPosition = (i / (numCrops - 1)) * 100;
    cropElement.style.left = `${leftPosition}%`;
    
    // Add variation in positioning
    const verticalOffset = Math.random() * 20 - 10; // -10px to +10px
    cropElement.style.bottom = `${verticalOffset}px`;
    
    // Add animation delay for wave effect
    cropElement.style.animationDelay = `${i * 0.3}s`;
    
    // Create crop-specific visual structure
    createCropStructure(cropElement, cropType, i);
    
    container.appendChild(cropElement);
  }
}

// Create crop-specific visual structure
function createCropStructure(element, cropType, index) {
  switch (cropType) {
    case 'rice':
      element.innerHTML = `
        <div class="rice-stalk">
          <div class="rice-stem"></div>
          <div class="rice-grains"></div>
          <div class="rice-leaves"></div>
        </div>
      `;
      break;
      
    case 'wheat':
      element.innerHTML = `
        <div class="wheat-stalk">
          <div class="wheat-stem"></div>
          <div class="wheat-head"></div>
          <div class="wheat-awns"></div>
        </div>
      `;
      break;
      
    case 'cotton':
      element.innerHTML = `
        <div class="cotton-plant">
          <div class="cotton-stem"></div>
          <div class="cotton-leaves"></div>
          <div class="cotton-bolls">
            <div class="cotton-boll"></div>
            <div class="cotton-boll"></div>
          </div>
        </div>
      `;
      break;
      
    case 'sugarcane':
      element.innerHTML = `
        <div class="sugarcane-stalk">
          <div class="sugarcane-segments">
            <div class="sugarcane-segment"></div>
            <div class="sugarcane-segment"></div>
            <div class="sugarcane-segment"></div>
          </div>
          <div class="sugarcane-leaves"></div>
        </div>
      `;
      break;
      
    case 'tomato':
      element.innerHTML = `
        <div class="tomato-plant">
          <div class="tomato-stem"></div>
          <div class="tomato-leaves"></div>
          <div class="tomato-fruits">
            <div class="tomato-fruit ripe"></div>
            <div class="tomato-fruit unripe"></div>
          </div>
        </div>
      `;
      break;
      
    case 'onion':
      element.innerHTML = `
        <div class="onion-plant">
          <div class="onion-bulb"></div>
          <div class="onion-shoots">
            <div class="onion-shoot"></div>
            <div class="onion-shoot"></div>
            <div class="onion-shoot"></div>
          </div>
        </div>
      `;
      break;
      
    default:
      // Default to rice
      element.innerHTML = `
        <div class="rice-stalk">
          <div class="rice-stem"></div>
          <div class="rice-grains"></div>
          <div class="rice-leaves"></div>
        </div>
      `;
  }
}

// Apply weather effects to crops
function applyCropWeatherEffects(container, weather) {
  const cropElements = container.querySelectorAll('.crop-element');
  
  cropElements.forEach((element, index) => {
    // Wind effects - increase sway intensity
    if (weather.wind_speed && weather.wind_speed > 10) {
      const swayIntensity = Math.min(weather.wind_speed / 20, 2);
      element.style.transform = `scale(1) rotate(${Math.sin(Date.now() / 1000 + index) * swayIntensity * 3}deg)`;
      
      // Update animation speed based on wind
      const animationSpeed = Math.max(2 - weather.wind_speed / 15, 0.8);
      element.style.animationDuration = `${animationSpeed}s`;
    }
    
    // Rain effects - crops look more vibrant
    if (weather.rainfall && weather.rainfall > 0) {
      element.style.filter = 'brightness(1.1) saturate(1.3) drop-shadow(0 1px 3px rgba(0,0,0,0.1))';
      
      // Add water droplets on crops during rain
      if (weather.rainfall > 5) {
        addWaterDroplets(element);
      }
    }
    
    // Temperature effects
    if (weather.temperature) {
      if (weather.temperature > 35) {
        // Heat stress - crops look wilted
        element.style.filter = (element.style.filter || '') + ' brightness(0.9) saturate(0.8)';
        element.style.transform = (element.style.transform || '') + ' scaleY(0.95)';
      } else if (weather.temperature < 10) {
        // Cold stress - crops look dormant
        element.style.filter = (element.style.filter || '') + ' brightness(0.8) saturate(0.6) hue-rotate(10deg)';
      }
    }
    
    // Drought effects - low soil moisture
    if (weather.soil_moisture && weather.soil_moisture < 30) {
      element.style.filter = (element.style.filter || '') + ' brightness(0.7) saturate(0.5) sepia(0.2)';
      element.style.transform = (element.style.transform || '') + ' scaleY(0.9)';
    }
    
    // UV effects - high UV makes crops more yellow/golden
    if (weather.uv_index && weather.uv_index > 7) {
      element.style.filter = (element.style.filter || '') + ' sepia(0.1) saturate(1.2)';
    }
  });
}

// Add water droplets to crops during rain
function addWaterDroplets(cropElement) {
  for (let i = 0; i < 3; i++) {
    const droplet = document.createElement('div');
    droplet.className = 'water-droplet';
    droplet.style.cssText = `
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(135, 206, 250, 0.8);
      border-radius: 50%;
      top: ${Math.random() * 70}%;
      left: ${Math.random() * 80}%;
      animation: dropletShine 2s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    cropElement.appendChild(droplet);
    
    // Remove droplet after animation
    setTimeout(() => {
      if (droplet.parentElement) {
        droplet.remove();
      }
    }, 4000);
  }
}

// Generate rain animation HTML
function generateRainAnimation(intensity) {
  let rainHTML = '';
  const numDrops = Math.min(intensity * 2, 30);
  
  for (let i = 0; i < numDrops; i++) {
    const delay = Math.random() * 2;
    const duration = 0.5 + Math.random() * 0.5;
    const left = Math.random() * 100;
    
    rainHTML += `
      <div class="rain-drop weather-effect" style="
        position: absolute;
        left: ${left}%;
        top: -5px;
        width: 2px;
        height: 15px;
        background: linear-gradient(to bottom, transparent, rgba(135, 206, 250, 0.8), transparent);
        animation: rainFall ${duration}s linear infinite;
        animation-delay: ${delay}s;
      "></div>
    `;
  }
  
  return rainHTML;
}

// Generate snow animation HTML
function generateSnowAnimation() {
  let snowHTML = '';
  const numFlakes = 15;
  
  for (let i = 0; i < numFlakes; i++) {
    const delay = Math.random() * 3;
    const duration = 3 + Math.random() * 2;
    const left = Math.random() * 100;
    const size = 3 + Math.random() * 4;
    
    snowHTML += `
      <div class="snow-flake weather-effect" style="
        position: absolute;
        left: ${left}%;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        animation: snowFall ${duration}s linear infinite;
        animation-delay: ${delay}s;
        opacity: 0.8;
      "></div>
    `;
  }
  
  return snowHTML;
}

// Add lightning effect
function addLightningEffect(container) {
  const lightning = document.createElement('div');
  lightning.className = 'lightning-effect weather-effect';
  lightning.innerHTML = `
    <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      <path d="M50 10 L45 40 L55 40 L40 80 L60 50 L50 50 Z" 
            fill="#ffff00" 
            filter="url(#glow)" 
            opacity="0">
        <animate attributeName="opacity" 
                 values="0;1;0;1;0" 
                 dur="0.3s" 
                 repeatCount="1"/>
      </path>
    </svg>
  `;
  
  lightning.style.cssText = `
    position: absolute;
    top: 10%;
    left: ${30 + Math.random() * 40}%;
    width: 60px;
    height: 100px;
    z-index: 10;
  `;
  
  container.appendChild(lightning);
  
  setTimeout(() => {
    lightning.remove();
  }, 500);
}

// Add fog effect
function addFogEffect(container, visibility) {
  const fog = document.createElement('div');
  fog.className = 'fog-effect weather-effect';
  
  const opacity = Math.max(0.1, 1 - visibility / 5000);
  
  fog.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, 
      rgba(200, 200, 200, ${opacity * 0.3}) 0%, 
      rgba(200, 200, 200, ${opacity * 0.8}) 40%, 
      rgba(200, 200, 200, ${opacity * 0.5}) 100%);
    animation: fogDrift 8s ease-in-out infinite alternate;
    z-index: 5;
  `;
  
  container.appendChild(fog);
}

// Add atmospheric particles for humidity
function addAtmosphericParticles(container, humidity) {
  const numParticles = Math.floor(humidity / 20);
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'atmospheric-particle weather-effect';
    
    particle.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      animation: particleFloat ${5 + Math.random() * 5}s ease-in-out infinite;
      animation-delay: ${Math.random() * 3}s;
    `;
    
    container.appendChild(particle);
  }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Farming Dashboard initialized');
  
  // Initialize weather visuals
  initializeWeatherVisuals();
  
  // Load initial data
  loadCities();
  loadCropsData();
  
  // Start with Delhi as default
  console.log('Loading farming dashboard for default city:', currentCity);
  loadFarmingDashboard();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize WebSocket
  initializeWebSocket();
  
  // Auto-refresh every 5 minutes
  setInterval(loadFarmingDashboard, 5 * 60 * 1000);
});

// =============== ML CROP RECOMMENDATIONS ===============

// Load ML crop recommendations for current city
async function loadCropRecommendations() {
  if (!currentCity) {
    showNotification('Please select a location first', 'warning');
    return;
  }

  const cropsGrid = document.getElementById('cropsGrid');
  const generateBtn = document.getElementById('generateCropRecommendations');
  
  // Show loading state
  cropsGrid.innerHTML = '<div class="ml-loading"><i class="fas fa-spinner fa-spin"></i><p>Analyzing climate data for crop recommendations...</p></div>';
  
  // Disable button
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
  
  try {
    const response = await fetch(`http://localhost:4001/api/ml/crops/${currentCity}`);
    const data = await response.json();

    if (data.success) {
      displayCropRecommendations(data.recommendations);
    } else {
      throw new Error(data.error || 'Failed to load crop recommendations');
    }
  } catch (error) {
    console.error('Error loading crop recommendations:', error);
    cropsGrid.innerHTML = `<div class="ml-error">Error loading crop recommendations: ${error.message}</div>`;
  } finally {
    // Re-enable button
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-brain"></i> Get AI Recommendations';
  }
}

// Display crop recommendations in the grid
function displayCropRecommendations(recommendations) {
  const container = document.getElementById('cropsGrid');
  let html = '';
  
  recommendations.slice(0, 8).forEach(crop => {
    const suitabilityClass = getSuitabilityClass(crop.suitabilityScore);
    const riskClass = getRiskClass(crop.riskLevel);
    
    html += `
      <div class="crop-recommendation-card ${suitabilityClass}">
        <div class="crop-icon">${getCropIcon(crop.name)}</div>
        <div class="crop-info">
          <h3 class="crop-name">${crop.name}</h3>
          <div class="suitability-score">
            <div class="score-value">${crop.suitabilityScore}%</div>
            <div class="score-label">Suitability</div>
          </div>
          <div class="crop-details">
            <div class="risk-level ${riskClass}">
              <i class="fas fa-shield-alt"></i>
              Risk: ${crop.riskLevel}
            </div>
            <div class="confidence-level">
              <i class="fas fa-chart-line"></i>
              Confidence: ${crop.confidence}%
            </div>
          </div>
          <div class="growing-conditions">
            <div class="condition-item">
              <i class="fas fa-thermometer-half"></i>
              ${crop.optimalConditions?.temperature || 'N/A'}
            </div>
            <div class="condition-item">
              <i class="fas fa-tint"></i>
              ${crop.optimalConditions?.rainfall || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Helper functions for crop recommendations
function getSuitabilityClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getRiskClass(risk) {
  return risk.toLowerCase();
}

function getCropIcon(cropName) {
  const icons = {
    'Rice': '🌾',
    'Wheat': '🌾',
    'Cotton': '🌱',
    'Sugarcane': '🎋',
    'Tomato': '🍅',
    'Onion': '🧅',
    'Potato': '🥔',
    'Corn': '🌽',
    'Soybean': '🫘',
    'Barley': '🌾'
  };
  return icons[cropName] || '🌱';
}

// Manual test function for comprehensive weather
function testComprehensiveWeatherManual() {
  console.log('=== MANUAL TEST TRIGGERED ===');
  
  const testWeather = {
    temperature: 32.1,
    humidity: 75,
    pressure: 995.8,
    wind_speed: 15.2,
    wind_direction: 225,
    uv_index: 8.3,
    rainfall: 0.5
  };
  
  console.log('Manual test with weather:', testWeather);
  updateComprehensiveWeatherFromBasicData(testWeather);
  
  // Also test element finding
  testComprehensiveWeatherElements();
}

// Initialize farming dashboard when page loads
function initializeFarmingDashboard() {
  console.log('=== FARMING DASHBOARD INITIALIZING ===');
  
  // Test comprehensive weather immediately
  setTimeout(() => {
    console.log('=== TESTING COMPREHENSIVE WEATHER ON PAGE LOAD ===');
    
    const testWeather = {
      temperature: 29.5,
      humidity: 68,
      pressure: 1012.3,
      wind_speed: 8.7,
      wind_direction: 145,
      uv_index: 5.8,
      rainfall: 1.2
    };
    
    console.log('Forcing update with test weather:', testWeather);
    updateComprehensiveWeatherFromBasicData(testWeather);
  }, 3000);
  
  // Setup event listeners
  setupEventListeners();
  
  // Load initial data
  loadCities();
  loadCropsData();
  
  // Initialize WebSocket
  initializeWebSocket();
  
  // Initialize weather visuals
  initializeWeatherVisuals();
  
  // Load default dashboard
  console.log('Loading default farming dashboard...');
  loadFarmingDashboard();
  
  console.log('=== FARMING DASHBOARD INITIALIZED ===');
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFarmingDashboard);
} else {
  initializeFarmingDashboard();
}