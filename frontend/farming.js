// Farming Dashboard JavaScript
const socket = io('http://localhost:4001');

// Global variables
let currentCity = 'Delhi';
let currentCrop = 'rice';
let currentStage = 'vegetative';
let availableCities = [];

// DOM elements
const citySelect = document.getElementById('citySelect');
const cropSelect = document.getElementById('cropSelect');
const stageSelect = document.getElementById('stageSelect');

// Setup event listeners
function setupEventListeners() {
  citySelect.addEventListener('change', () => {
    currentCity = citySelect.value;
    console.log(`City changed to: ${currentCity}`);
    loadFarmingDashboard();
  });
  
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
      populateCitySelect();
    }
  } catch (error) {
    console.error('Error loading cities:', error);
  }
}

// Populate city dropdown
function populateCitySelect() {
  // Clear existing options except defaults
  while (citySelect.children.length > 3) {
    citySelect.removeChild(citySelect.lastChild);
  }
  
  availableCities.forEach(city => {
    const exists = Array.from(citySelect.options).some(option => option.value === city.name);
    if (!exists) {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = `${city.name}, ${city.state}`;
      citySelect.appendChild(option);
    }
  });
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
    showLoading();
    
    // Load dashboard data
    const response = await fetch(`http://localhost:4001/api/farming/dashboard/${currentCity}?crop=${currentCrop}&stage=${currentStage}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    if (result.success && result.data) {
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

// Update comprehensive weather display with all new parameters
function updateComprehensiveWeatherDisplay(weather) {
  console.log('Updating comprehensive weather display:', weather);
  
  // Update pressure gauge
  updatePressureGauge(weather.pressure, weather.pressure_trend);
  
  // Update wind compass
  updateWindCompass(weather.wind_speed, weather.wind_direction);
  
  // Update UV index meter
  updateUVMeter(weather.uv_index);
  
  // Update air quality indicator
  updateAirQualityIndicator(weather.air_quality);
  
  // Update soil conditions
  updateSoilConditions(weather.soil_temperature, weather.soil_moisture);
  
  // Update growing degree days
  updateGrowingDegreeDays(weather.growing_degree_days);
  
  // Update heat index
  updateHeatIndex(weather.heat_index);
  
  // Update moon phase
  updateMoonPhase(weather.moon_phase, weather.moon_illumination);
}

// Update pressure gauge display
function updatePressureGauge(pressure, trend) {
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
  }
  
  // Update pressure trend
  if (pressureTrend && trend) {
    pressureTrend.className = `pressure-trend ${trend}`;
    
    const trendInfo = {
      'rising': { icon: '📈', text: 'Rising' },
      'falling': { icon: '📉', text: 'Falling' },
      'stable': { icon: '➡️', text: 'Stable' }
    };
    
    const info = trendInfo[trend] || { icon: '➡️', text: 'Stable' };
    if (trendIcon) trendIcon.textContent = info.icon;
    if (trendText) trendText.textContent = info.text;
  }
}

// Update wind compass
function updateWindCompass(windSpeed, windDirection) {
  const windArrow = document.getElementById('windArrow');
  const windSpeedElement = document.getElementById('windSpeed');
  const windDirectionText = document.getElementById('windDirectionText');
  
  if (windSpeedElement && windSpeed !== null && windSpeed !== undefined) {
    windSpeedElement.textContent = `${Math.round(windSpeed)} km/h`;
  }
  
  if (windArrow && windDirection !== null && windDirection !== undefined) {
    // Rotate the arrow based on wind direction
    windArrow.style.transform = `translate(-50%, -100%) rotate(${windDirection}deg)`;
  }
  
  if (windDirectionText && windDirection !== null && windDirection !== undefined) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const directionIndex = Math.round((windDirection % 360) / 22.5) % 16;
    windDirectionText.textContent = `${directions[directionIndex]} (${Math.round(windDirection)}°)`;
  }
}

// Update UV index meter
function updateUVMeter(uvIndex) {
  const uvValue = document.getElementById('uvValue');
  const uvIndicator = document.getElementById('uvIndicator');
  const uvLevel = document.getElementById('uvLevel');
  
  if (uvValue && uvIndex !== null && uvIndex !== undefined) {
    uvValue.textContent = Math.round(uvIndex * 10) / 10;
    
    // Position indicator on UV scale (0-11+ scale)
    const position = Math.max(0, Math.min(100, (uvIndex / 11) * 100));
    if (uvIndicator) {
      uvIndicator.style.left = `${position}%`;
    }
    
    // Update UV level display
    if (uvLevel) {
      let level, className;
      if (uvIndex < 3) {
        level = 'Low'; className = 'low';
      } else if (uvIndex < 6) {
        level = 'Moderate'; className = 'moderate';
      } else if (uvIndex < 8) {
        level = 'High'; className = 'high';
      } else if (uvIndex < 11) {
        level = 'Very High'; className = 'very-high';
      } else {
        level = 'Extreme'; className = 'extreme';
      }
      
      uvLevel.textContent = level;
      uvLevel.className = `uv-level ${className}`;
    }
  }
}

// Update air quality indicator
function updateAirQualityIndicator(airQuality) {
  const aqiValue = document.getElementById('aqiValue');
  const aqiCircle = document.getElementById('aqiCircle');
  const aqiStatus = document.getElementById('aqiStatus');
  
  if (airQuality && aqiValue) {
    const aqi = airQuality.aqi || airQuality;
    aqiValue.textContent = Math.round(aqi);
    
    // Calculate circle fill (0-500 scale)
    const normalizedAQI = Math.max(0, Math.min(100, (aqi / 300) * 100));
    const circumference = 2 * Math.PI * 35; // radius = 35
    const offset = circumference - (normalizedAQI / 100) * circumference;
    
    if (aqiCircle) {
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
  }
}

// Update soil conditions
function updateSoilConditions(soilTemp, soilMoisture) {
  const soilTempElement = document.getElementById('soilTemp');
  const soilTempBar = document.getElementById('soilTempBar');
  const soilMoistureElement = document.getElementById('soilMoisture');
  const soilMoistureCircle = document.getElementById('soilMoistureCircle');
  
  // Update soil temperature
  if (soilTempElement && soilTemp !== null && soilTemp !== undefined) {
    soilTempElement.textContent = Math.round(soilTemp * 10) / 10;
    
    // Update temperature bar (0-50°C range)
    if (soilTempBar) {
      const tempPercentage = Math.max(0, Math.min(100, (soilTemp / 50) * 100));
      soilTempBar.style.width = `${tempPercentage}%`;
    }
  }
  
  // Update soil moisture
  if (soilMoistureElement && soilMoisture !== null && soilMoisture !== undefined) {
    soilMoistureElement.textContent = Math.round(soilMoisture);
    
    // Update moisture circle
    if (soilMoistureCircle) {
      const circumference = 2 * Math.PI * 25; // radius = 25
      const offset = circumference - (soilMoisture / 100) * circumference;
      soilMoistureCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      soilMoistureCircle.style.strokeDashoffset = offset;
    }
  }
}

// Update growing degree days
function updateGrowingDegreeDays(gdd) {
  const gddValue = document.getElementById('gddValue');
  const gddProgress = document.getElementById('gddProgress');
  
  if (gddValue && gdd !== null && gdd !== undefined) {
    gddValue.textContent = Math.round(gdd * 10) / 10;
    
    // Update progress bar (0-30 GDD range for daily)
    if (gddProgress) {
      const gddPercentage = Math.max(0, Math.min(100, (gdd / 30) * 100));
      gddProgress.style.width = `${gddPercentage}%`;
    }
  }
}

// Update heat index
function updateHeatIndex(heatIndex) {
  const heatIndexValue = document.getElementById('heatIndexValue');
  const heatIndexLevel = document.getElementById('heatIndexLevel');
  
  if (heatIndexValue && heatIndex !== null && heatIndex !== undefined) {
    heatIndexValue.textContent = `${Math.round(heatIndex * 10) / 10}°C`;
    
    // Determine heat index level
    let level, className;
    if (heatIndex < 27) {
      level = 'Normal'; className = 'normal';
    } else if (heatIndex < 32) {
      level = 'Caution'; className = 'caution';
    } else if (heatIndex < 40) {
      level = 'Extreme Caution'; className = 'extreme-caution';
    } else if (heatIndex < 54) {
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
  }
}

// Update moon phase display
function updateMoonPhase(moonPhase, moonIllumination) {
  const moonIcon = document.getElementById('moonIcon');
  const moonPhaseName = document.getElementById('moonPhaseName');
  const moonIlluminationElement = document.getElementById('moonIllumination');
  
  if (moonPhase) {
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
    
    const phaseData = moonData[moonPhase] || { icon: '🌙', name: 'Unknown' };
    
    if (moonIcon) moonIcon.textContent = phaseData.icon;
    if (moonPhaseName) moonPhaseName.textContent = phaseData.name;
  }
  
  if (moonIlluminationElement && moonIllumination !== null && moonIllumination !== undefined) {
    moonIlluminationElement.textContent = `${Math.round(moonIllumination)}% visible`;
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
  const city = citySelect.value;
  if (!city) {
    alert('Please select a city');
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
    const response = await fetch(`http://localhost:4001/api/ml/crops/${city}`);
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