const socket = io('http://localhost:5000');

const citySelect = document.getElementById('citySelect');
let currentCity = citySelect.value;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 10000; // 10 seconds cooldown between fetches
let isInitialized = false; // Prevent multiple initialization calls
let currentWeatherData = {}; // Store current data to prevent unnecessary updates
let availableCities = []; // Store available cities from API
let alertsContainer; // Store alerts container element
let activeAlerts = new Map(); // Store active alerts to prevent duplicates

// Load available cities from API
async function loadCities() {
  try {
    console.log('Loading available cities...');
    const response = await fetch('http://localhost:5000/api/weather/cities?limit=15');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      availableCities = result.data;
      populateCitySelect();
      console.log(`Loaded ${availableCities.length} cities`);
    } else {
      console.error('Failed to load cities:', result.error);
      // Keep default cities if API fails
    }
  } catch (error) {
    console.error('Error loading cities:', error);
    // Keep default cities if API fails
  }
}

// Populate city dropdown with loaded cities
function populateCitySelect() {
  const currentValue = citySelect.value;
  
  // Clear existing options except the first default ones
  while (citySelect.children.length > 3) {
    citySelect.removeChild(citySelect.lastChild);
  }
  
  // Add new cities
  availableCities.forEach(city => {
    // Skip if city already exists
    const exists = Array.from(citySelect.options).some(option => option.value === city.name);
    if (!exists) {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = `${city.name}, ${city.state}`;
      citySelect.appendChild(option);
    }
  });
  
  // Restore previous selection if it still exists
  if (currentValue && Array.from(citySelect.options).some(option => option.value === currentValue)) {
    citySelect.value = currentValue;
  }
  
  console.log(`City dropdown populated with ${citySelect.options.length} cities`);
}

// Fetch current weather data immediately
async function fetchCurrentWeather(city) {
  // Prevent rapid successive calls
  const now = Date.now();
  if (now - lastFetchTime < FETCH_COOLDOWN) {
    console.log(`Skipping fetch for ${city} - too soon after last request`);
    return;
  }
  lastFetchTime = now;
  
  try {
    // Show loading state
    showLoading();
    
    console.log(`Fetching current weather for ${city}...`);
    const response = await fetch(`http://localhost:5000/api/weather/current/${city}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success && result.data) {
      const weather = result.data;
      
      // Check if we have OpenWeather data (real or mock)
      if (weather.openWeatherData && weather.openWeatherData.data) {
        const data = weather.openWeatherData.data;
        const weatherDisplay = {
          city_name: city,
          temperature: parseFloat(data.main.temp).toFixed(1),
          humidity: Math.round(data.main.humidity),
          rainfall: parseFloat(data.rain?.['1h'] || 0).toFixed(1),
          weather_description: data.weather[0]?.description || 'Unknown'
        };
        
        updateWeatherDisplay(weatherDisplay);
        console.log('Successfully displayed weather data for', city);
      } else {
        console.warn('No weather data in response for', city);
        // Try to get data from database as fallback
        await fetchFromDatabase(city);
      }
    } else {
      console.error('API returned error:', result.error);
      showError('Failed to load weather data: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError('Unable to connect to server. Please check if the server is running.');
  }
}

// Fallback: try to get latest data from database
async function fetchFromDatabase(city) {
  try {
    console.log(`Trying to fetch cached data for ${city}...`);
    const response = await fetch(`http://localhost:5000/api/weather/latest/${city}`);
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        updateWeatherDisplay(result.data);
        console.log('Using cached data for', city);
        return;
      }
    }
    
    showError(`No current data for ${city}. Server may be starting up...`);
  } catch (error) {
    console.error('Database fallback failed:', error);
    showError('No data available');
  }
}

// Show loading overlay
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('show');
  
  // Update loading text animations
  const loadingText = document.querySelector('.loading-text');
  const messages = [
    'Fetching Weather Data...',
    'Connecting to Weather Station...',
    'Processing Climate Information...',
    'Almost Ready...'
  ];
  
  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    loadingText.textContent = messages[messageIndex];
  }, 1000);
  
  // Store interval ID for cleanup
  overlay.dataset.messageInterval = messageInterval;
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  const messageInterval = overlay.dataset.messageInterval;
  
  if (messageInterval) {
    clearInterval(parseInt(messageInterval));
  }
  
  setTimeout(() => {
    overlay.classList.remove('show');
  }, 500);
}

// Update the weather display with animations
function updateWeatherDisplay(data) {
  // Handle both live API data and cached database data
  const temp = data.temperature || data.temp;
  const humidity = data.humidity;
  const rainfall = data.rainfall || data.rain;
  const description = data.weather_description || data.desc;
  
  // Create a key to check if data actually changed
  const dataKey = `${temp}-${humidity}-${rainfall}-${description}`;
  const cityKey = data.city_name || currentCity;
  
  // Only update if data actually changed
  if (currentWeatherData[cityKey] === dataKey) {
    console.log(`Skipping update for ${cityKey} - data unchanged`);
    hideLoading();
    return;
  }
  
  currentWeatherData[cityKey] = dataKey;
  
  // Load existing alerts for this city
  loadAlertsForCity(cityKey);
  
  // Animate value changes
  animateValueChange('temp', `${parseFloat(temp).toFixed(1)}°C`);
  animateValueChange('humidity', `${Math.round(humidity)}%`);
  animateValueChange('rain', `${parseFloat(rainfall || 0).toFixed(1)} mm`);
  animateValueChange('desc', description || 'Unknown');
  
  // Update humidity progress ring
  updateHumidityProgress(Math.round(humidity));
  
  // Update weather icon based on description
  updateWeatherIcon(description);
  
  // Update data source and timestamp with animations
  const dataSource = data.data_source || 'Unknown';
  const timestamp = data.recorded_at ? new Date(data.recorded_at).toLocaleString() : 'Just now';
  
  setTimeout(() => {
    document.getElementById('dataSource').innerText = `Data source: ${dataSource}`;
    document.getElementById('lastUpdated').innerText = `Last updated: ${timestamp}`;
  }, 500);
  
  // Update city info if available
  if (data.cityInfo) {
    updateCityInfo(data.cityInfo);
  } else {
    // Try to find city info from available cities
    const cityInfo = availableCities.find(city => city.name === cityKey);
    if (cityInfo) {
      updateCityInfo(cityInfo);
    }
  }
  
  // Hide loading overlay
  hideLoading();
  
  console.log('Updated weather display for', cityKey, 'with new data');
}

// Animate value changes
function animateValueChange(elementId, newValue) {
  const element = document.getElementById(elementId);
  
  // Add animation class
  element.style.transform = 'scale(0.8)';
  element.style.opacity = '0.5';
  
  setTimeout(() => {
    element.innerText = newValue;
    element.style.transform = 'scale(1.1)';
    element.style.opacity = '1';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  }, 150);
}

// Update humidity progress ring
function updateHumidityProgress(humidity) {
  const progressCircle = document.getElementById('humidityProgress');
  if (progressCircle) {
    const circumference = 2 * Math.PI * 35; // radius is 35
    const offset = circumference - (humidity / 100) * circumference;
    
    setTimeout(() => {
      progressCircle.style.strokeDashoffset = offset;
    }, 500);
  }
}

// Update weather icon based on description
function updateWeatherIcon(description) {
  const iconElement = document.getElementById('weatherIcon');
  if (!iconElement) return;
  
  let iconClass = 'fas fa-sun'; // default
  
  if (description) {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      iconClass = 'fas fa-cloud-rain';
    } else if (desc.includes('cloud')) {
      iconClass = 'fas fa-cloud';
    } else if (desc.includes('clear') || desc.includes('sunny')) {
      iconClass = 'fas fa-sun';
    } else if (desc.includes('storm') || desc.includes('thunder')) {
      iconClass = 'fas fa-bolt';
    } else if (desc.includes('snow')) {
      iconClass = 'fas fa-snowflake';
    } else if (desc.includes('mist') || desc.includes('fog')) {
      iconClass = 'fas fa-smog';
    }
  }
  
  iconElement.className = `${iconClass} weather-display-icon`;
}

// Update city information display with animation
function updateCityInfo(cityInfo) {
  const cityInfoDiv = document.getElementById('cityInfo');
  const cityName = document.getElementById('cityName');
  const cityDetails = document.getElementById('cityDetails');
  
  if (cityInfo) {
    // Animate the appearance
    if (cityInfoDiv.style.display === 'none') {
      cityInfoDiv.style.display = 'block';
      cityInfoDiv.style.opacity = '0';
      cityInfoDiv.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        cityInfoDiv.style.transition = 'all 0.5s ease';
        cityInfoDiv.style.opacity = '1';
        cityInfoDiv.style.transform = 'translateY(0)';
      }, 50);
    }
    
    cityName.innerText = cityInfo.name;
    const population = cityInfo.population ? (cityInfo.population / 1000000).toFixed(1) + 'M people' : 'Population unknown';
    cityDetails.innerText = `${cityInfo.state} • ${cityInfo.region} • ${population}`;
  } else {
    cityInfoDiv.style.display = 'none';
  }
}

// Enhanced manual refresh function
function refreshWeather() {
  console.log('Manual refresh requested for', currentCity);
  
  // Add visual feedback to refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  const icon = refreshBtn.querySelector('i');
  
  // Disable button temporarily
  refreshBtn.disabled = true;
  refreshBtn.style.opacity = '0.7';
  icon.style.animation = 'spin 1s linear infinite';
  
  // Reset cooldown and fetch
  lastFetchTime = 0;
  fetchCurrentWeather(currentCity);
  
  // Re-enable button after 3 seconds
  setTimeout(() => {
    refreshBtn.disabled = false;
    refreshBtn.style.opacity = '1';
    icon.style.animation = 'none';
  }, 3000);
}

// Add CSS transitions for smooth animations
function initializeAnimations() {
  const elements = ['temp', 'humidity', 'rain', 'desc'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.transition = 'all 0.3s ease';
    }
  });
}

// Show error messages
function showError(message) {
  document.getElementById('temp').innerText = 'Error';
  document.getElementById('humidity').innerText = 'Error';
  document.getElementById('rain').innerText = 'Error';
  document.getElementById('desc').innerText = message;
}

function subscribeCity(city) {
  console.log(`Subscribing to weather updates for ${city}`);
  socket.emit('subscribe_weather', city);
  // Subscribe to alerts for this city
  socket.emit('subscribe_alerts', {
    city: city,
    alertTypes: ['FLOOD', 'HEAT']
  });
  // Fetch current data immediately, but only once
  fetchCurrentWeather(city);
}

// Retry mechanism for failed requests
async function retryFetchWeather(city, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fetchCurrentWeather(city);
      return; // Success, exit retry loop
    } catch (error) {
      console.log(`Attempt ${attempt} failed for ${city}:`, error.message);
      if (attempt === maxRetries) {
        showError(`Failed to load data after ${maxRetries} attempts`);
      } else {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

citySelect.addEventListener('change', () => {
  const newCity = citySelect.value;
  if (newCity !== currentCity) {
    currentCity = newCity;
    console.log(`City changed to: ${currentCity}`);
    subscribeCity(currentCity);
  }
});

socket.on('connect', () => {
  console.log('Connected to backend via WebSocket');
  if (!isInitialized) {
    isInitialized = true;
    // Initialize animations
    initializeAnimations();
    
    // Load cities first, then subscribe to current city
    loadCities().then(() => {
      subscribeCity(currentCity);
    });
  }
});

socket.on('reconnect', () => {
  console.log('Reconnected to backend');
  // Don't fetch new data on reconnect, just resubscribe
  socket.emit('subscribe_weather', currentCity);
  // Resubscribe to alerts
  socket.emit('subscribe_alerts', {
    city: currentCity,
    alertTypes: ['FLOOD', 'HEAT']
  });
});

// Handle real-time updates from WebSocket
socket.on('weather_update', (data) => {
  if (data.city_name === currentCity) {
    console.log('Received real-time update:', data);
    updateWeatherDisplay(data);
  }
});

// Handle alert updates
socket.on('alert_update', (alert) => {
  console.log('Received alert update:', alert);
  if (alert.city === currentCity) {
    displayAlert(alert);
  }
});

// Handle new alerts (global)
socket.on('new_alert', (alert) => {
  console.log('New alert:', alert);
  if (alert.city === currentCity) {
    displayAlert(alert);
  }
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
  showError('Connection lost - trying to reconnect...');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  showError('Connection lost. Attempting to reconnect...');
});

// Removed auto-refresh to prevent blinking
// Data will only update via WebSocket or manual city changes

// Add page visibility change handler for better performance
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentCity) {
    // Refresh data when page becomes visible again
    console.log('Page became visible, refreshing data...');
    setTimeout(() => {
      fetchCurrentWeather(currentCity);
    }, 1000);
  }
});

// Add error handling for network issues
window.addEventListener('online', () => {
  console.log('Network connection restored');
  if (currentCity) {
    fetchCurrentWeather(currentCity);
  }
});

window.addEventListener('offline', () => {
  console.log('Network connection lost');
  showError('No internet connection. Please check your network.');
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('ClimateSync Weather Dashboard initialized');
  
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'r':
          e.preventDefault();
          refreshWeather();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          selectPreviousCity();
          break;
        case 'ArrowRight':
          e.preventDefault();
          selectNextCity();
          break;
      }
    }
  });
});

// Helper functions for keyboard navigation
function selectPreviousCity() {
  const select = document.getElementById('citySelect');
  const currentIndex = select.selectedIndex;
  if (currentIndex > 0) {
    select.selectedIndex = currentIndex - 1;
    select.dispatchEvent(new Event('change'));
  }
}

function selectNextCity() {
  const select = document.getElementById('citySelect');
  const currentIndex = select.selectedIndex;
  if (currentIndex < select.options.length - 1) {
    select.selectedIndex = currentIndex + 1;
    select.dispatchEvent(new Event('change'));
  }
}

// =============== ALERT SYSTEM FUNCTIONS ===============

// Load alerts for a specific city
async function loadAlertsForCity(cityName) {
  try {
    // Find city ID
    const city = availableCities.find(c => c.name === cityName);
    if (!city) {
      console.warn(`City ${cityName} not found in available cities`);
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/alerts/city/${city.id}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No alerts found for ${cityName}`);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      const alerts = result.data;
      
      // Clear existing alerts
      clearAlerts();
      
      // Display flood alerts
      if (alerts.flood && alerts.flood.length > 0) {
        alerts.flood.forEach(alert => displayAlertFromDB(alert, 'FLOOD'));
      }
      
      // Display heat alerts
      if (alerts.heat && alerts.heat.length > 0) {
        alerts.heat.forEach(alert => displayAlertFromDB(alert, 'HEAT'));
      }
      
      console.log(`Loaded ${alerts.total || 0} alerts for ${cityName}`);
    }
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

// Display alert from database format
function displayAlertFromDB(alertData, type) {
  const alert = {
    type: type,
    level: alertData.alert_level,
    city: alertData.city_name,
    message: alertData.alert_message,
    timestamp: alertData.created_at,
    data: {
      rainfall: alertData.rainfall_1h,
      temperature: alertData.temperature,
      heat_index: alertData.heat_index
    }
  };
  
  displayAlert(alert);
}

// Display alert notification
function displayAlert(alert) {
  // Create alert key to prevent duplicates
  const alertKey = `${alert.type}-${alert.level}-${alert.city}`;
  
  // Check if this alert is already displayed
  if (activeAlerts.has(alertKey)) {
    console.log('Alert already displayed:', alertKey);
    return;
  }
  
  activeAlerts.set(alertKey, alert);
  
  // Get or create alerts container
  if (!alertsContainer) {
    alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) {
      // Create alerts container if it doesn't exist
      alertsContainer = document.createElement('div');
      alertsContainer.id = 'alertsContainer';
      alertsContainer.className = 'alerts-container';
      document.body.appendChild(alertsContainer);
    }
  }
  
  // Create alert element
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${alert.type.toLowerCase()} alert-${alert.level.toLowerCase()}`;
  alertElement.dataset.alertKey = alertKey;
  
  // Get alert icon
  const icon = getAlertIcon(alert.type, alert.level);
  
  // Format timestamp
  const time = new Date(alert.timestamp).toLocaleTimeString();
  
  alertElement.innerHTML = `
    <div class="alert-header">
      <span class="alert-icon">${icon}</span>
      <span class="alert-type">${alert.type} ALERT</span>
      <span class="alert-level level-${alert.level.toLowerCase()}">${alert.level}</span>
      <button class="alert-close" onclick="closeAlert('${alertKey}')">&times;</button>
    </div>
    <div class="alert-content">
      <div class="alert-message">${alert.message}</div>
      <div class="alert-time">⏰ ${time}</div>
    </div>
  `;
  
  // Add to container
  alertsContainer.appendChild(alertElement);
  
  // Animate in
  setTimeout(() => {
    alertElement.classList.add('show');
  }, 100);
  
  // Auto-hide after 10 seconds for low level alerts
  if (alert.level === 'LOW') {
    setTimeout(() => {
      closeAlert(alertKey);
    }, 10000);
  }
  
  console.log('Alert displayed:', alert);
}

// Get appropriate icon for alert type and level
function getAlertIcon(type, level) {
  const icons = {
    FLOOD: {
      LOW: '🌧️',
      MEDIUM: '🌧️',
      HIGH: '⛈️',
      CRITICAL: '🌊'
    },
    HEAT: {
      LOW: '🌡️',
      MEDIUM: '☀️',
      HIGH: '🔥',
      CRITICAL: '🚨'
    }
  };
  
  return icons[type]?.[level] || '⚠️';
}

// Close specific alert
function closeAlert(alertKey) {
  const alertElement = document.querySelector(`[data-alert-key="${alertKey}"]`);
  if (alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => {
      alertElement.remove();
      activeAlerts.delete(alertKey);
    }, 300);
  }
}

// Clear all alerts
function clearAlerts() {
  if (alertsContainer) {
    alertsContainer.innerHTML = '';
  }
  activeAlerts.clear();
}
