const socket = io('http://localhost:4001');

// Global variables - no longer using citySelect since it's removed
let currentCity = 'Delhi'; // Default city
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
    const response = await fetch('http://localhost:4001/api/weather/cities?limit=15');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      availableCities = result.data;
      console.log(`Loaded ${availableCities.length} cities`);
    } else {
      console.error('Failed to load cities:', result.error);
    }
  } catch (error) {
    console.error('Error loading cities:', error);
  }
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
    const response = await fetch(`http://localhost:4001/api/weather/current/${city}`);
    
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
    const response = await fetch(`http://localhost:4001/api/weather/latest/${city}`);
    
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
  console.error('Showing error:', message);
  document.getElementById('temp').innerText = 'Error';
  document.getElementById('humidity').innerText = 'Error';
  document.getElementById('rain').innerText = 'Error';
  document.getElementById('desc').innerText = message;
  
  // Also update data source to show error
  document.getElementById('dataSource').innerText = 'Error loading data';
  document.getElementById('lastUpdated').innerText = 'Failed to update';
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

socket.on('connect', () => {
  console.log('Connected to backend via WebSocket');
  if (!isInitialized) {
    isInitialized = true;
    // Initialize animations
    initializeAnimations();
    
    // Load cities first, then subscribe to current city
    loadCities().then(() => {
      subscribeCity(currentCity);
      // Also fetch initial weather data for Delhi
      fetchCurrentWeather(currentCity);
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
    updateAlertPage(alert);
  }
});

// Update alerts page with new alert
function updateAlertPage(alert) {
  // Check if we're on the alerts page
  if (window.location.pathname.endsWith('alerts.html')) {
    const alertType = alert.type.toLowerCase();
    const alertInfo = document.getElementById(`${alertType}-info`);
    
    if (alertInfo) {
      const message = `${alert.message} (Level: ${alert.level})`;
      alertInfo.textContent = message;
      
      // Add visual indicator
      const alertCard = alertInfo.closest('.alert-card');
      if (alertCard) {
        alertCard.classList.add('active');
        setTimeout(() => {
          alertCard.classList.remove('active');
        }, 3000);
      }
    }
  }
}

// Function to manually check alerts
function checkAlerts() {
  if (currentCity) {
    // Get alerts from API
    fetch(`http://localhost:4001/api/alerts/city/${currentCity}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data) {
          // Display alerts
          if (data.data.flood && data.data.flood.length > 0) {
            data.data.flood.forEach(alert => {
              displayAlertFromDB(alert, 'FLOOD');
              updateAlertPage({
                type: 'FLOOD',
                level: alert.alert_level,
                city: currentCity,
                message: alert.alert_message
              });
            });
          }
          
          if (data.data.heat && data.data.heat.length > 0) {
            data.data.heat.forEach(alert => {
              displayAlertFromDB(alert, 'HEAT');
              updateAlertPage({
                type: 'HEAT',
                level: alert.alert_level,
                city: currentCity,
                message: alert.alert_message
              });
            });
          }
        }
      })
      .catch(error => {
        console.error('Error fetching alerts:', error);
      });
  }
}

// Add event listener for alert buttons
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the alerts page
  if (window.location.pathname.endsWith('alerts.html')) {
    // Add click handlers for alert buttons
    const alertButtons = document.querySelectorAll('.alert-card button');
    alertButtons.forEach(button => {
      button.addEventListener('click', () => {
        checkAlerts();
      });
    });
    
    // Initialize alerts on page load
    if (currentCity) {
      checkAlerts();
    }
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
  
  // Show forecast and agricultural sections by default
  document.getElementById('forecastSection').style.display = 'block';
  document.getElementById('agriculturalSection').style.display = 'block';
  
  // Log current city for debugging
  console.log('Current city on load:', currentCity);
  
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
      }
    }
  });
});

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
    
    const response = await fetch(`http://localhost:4001/api/alerts/city/${city.id}`);
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
  
  // Auto-hide after 3 seconds for all alerts
  setTimeout(() => {
    closeAlert(alertKey);
  }, 3000);
  
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

// =============== GLOBAL LOCATION SEARCH FUNCTIONS ===============

let searchTimeout = null;
let currentSearchData = null;

// Global location search function
async function searchLocation() {
  const searchInput = document.getElementById('locationSearch');
  const query = searchInput.value.trim();
  
  if (!query) {
    alert('Please enter a location to search');
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
      displaySearchResults(result.results); // Use result.results for search API
      hideLoading();
    } else if (result.success && result.data && result.data.length > 0) {
      displaySearchResults(result.data); // Fallback to result.data
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

// Quiet search for auto-complete (no loading overlay to prevent blinking)
async function performLocationSearchQuiet(query) {
  try {
    console.log('Auto-searching for location:', query);
    
    const response = await fetch(`http://localhost:4001/api/weather/search/${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Search result:', result);
    
    if (result.success && result.results && result.results.length > 0) {
      displaySearchResults(result.results); // Use result.results instead of result.data
    } else if (result.success && result.data && result.data.length > 0) {
      displaySearchResults(result.data);
    } else {
      showSearchError('No locations found for your search. Try searching for a different city or village.');
    }
  } catch (error) {
    console.error('Error searching location:', error);
    showSearchError('Failed to search location. Please check your connection and try again.');
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
    
    // Create a more comprehensive location description
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
  
  // Store search data for selection
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
  
  // Update the city info and fetch weather
  await fetchLocationWeather(location);
}

// Fetch weather for any location by coordinates
async function fetchLocationWeather(location) {
  try {
    showLoading();
    
    console.log('Fetching weather for location:', location);
    
    const response = await fetch(`http://localhost:4001/api/weather/coordinates/${location.latitude}/${location.longitude}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Weather API response:', result);
    
    if (result.success && result.weather) {
      // Store current location
      currentCity = location.name;
      
      // Update city info
      updateCityInfoFromLocation(location);
      
      // Update weather display with Open-Meteo data
      updateGlobalWeatherDisplay(result.weather, location);
      
      // Show forecast and agricultural sections
      document.getElementById('forecastSection').style.display = 'block';
      document.getElementById('agriculturalSection').style.display = 'block';
      
      console.log('Successfully loaded weather for global location:', location.name);
    } else {
      throw new Error(result.error || 'Failed to load weather data');
    }
  } catch (error) {
    console.error('Error fetching location weather:', error);
    hideLoading();
    showError('Failed to load weather data for this location: ' + error.message);
  }
}

// Update city info from location data
function updateCityInfoFromLocation(location) {
  const cityInfoDiv = document.getElementById('cityInfo');
  const cityName = document.getElementById('cityName');
  const cityDetails = document.getElementById('cityDetails');
  const coordinatesInfo = document.getElementById('coordinatesInfo');
  const coordinates = document.getElementById('coordinates');
  const locationBadges = document.getElementById('locationBadges');
  
  // Show city info section
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
  
  // Update city name
  cityName.innerText = location.name;
  
  // Update details
  const state = location.admin1 || location.state || '';
  const country = location.country || 'Unknown';
  const population = location.population ? `${(location.population / 1000).toFixed(0)}K people` : 'Population unknown';
  
  cityDetails.innerText = `${state ? state + ' • ' : ''}${country} • ${population}`;
  
  // Show and update coordinates
  coordinates.innerText = `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`;
  coordinatesInfo.style.display = 'flex';
  
  // Add location type badges
  let badgesHtml = '';
  if (location.feature_code) {
    const locationTypes = {
      'PPL': 'City',
      'PPLA': 'State Capital',
      'PPLC': 'National Capital',
      'PPLS': 'Village',
      'ADM1': 'Administrative Division'
    };
    
    const type = locationTypes[location.feature_code] || 'Location';
    badgesHtml += `<span class="location-badge">${type}</span>`;
  }
  
  if (location.timezone) {
    badgesHtml += `<span class="location-badge">🕐 ${location.timezone}</span>`;
  }
  
  if (badgesHtml) {
    locationBadges.innerHTML = badgesHtml;
    locationBadges.style.display = 'flex';
  }
}

// Update weather display with Open-Meteo global data
function updateGlobalWeatherDisplay(weatherData, location) {
  console.log('Updating global weather display with:', weatherData);
  
  if (!weatherData || !weatherData.current) {
    console.error('Invalid weather data structure:', weatherData);
    hideLoading();
    showError('Invalid weather data received');
    return;
  }
  
  const current = weatherData.current;
  const hourly = weatherData.hourly_forecast || weatherData.hourly;
  const daily = weatherData.daily_forecast || weatherData.daily;
  
  // Update main weather cards
  animateValueChange('temp', `${current.temperature.toFixed(1)}°C`);
  animateValueChange('humidity', `${Math.round(current.humidity)}%`);
  animateValueChange('rain', `${(current.precipitation || 0).toFixed(1)} mm`);
  
  // Determine weather description from weather code or use provided description
  const weatherDesc = current.weather_description || getWeatherDescription(current.weather_code || 0);
  animateValueChange('desc', weatherDesc);
  
  // Update enhanced weather cards
  if (current.wind_speed !== undefined) {
    animateValueChange('windSpeed', `${current.wind_speed.toFixed(1)} km/h`);
    document.getElementById('windDirection').innerText = `Direction: ${getWindDirection(current.wind_direction || 0)}`;
  }
  
  if (current.pressure !== undefined) {
    animateValueChange('pressure', `${current.pressure.toFixed(0)} hPa`);
    document.getElementById('pressureTrend').innerText = 'Trend: Stable';
  }
  
  if (current.uv_index !== undefined) {
    animateValueChange('uvIndex', current.uv_index.toFixed(1));
    document.getElementById('uvLevel').innerText = `Level: ${getUVLevel(current.uv_index)}`;
    updateUVIndicator(current.uv_index);
  }
  
  if (current.feels_like !== undefined) {
    animateValueChange('feelsLike', `${current.feels_like.toFixed(1)}°C`);
  }
  
  // Update agricultural data if available
  if (current.soil_temperature_surface !== undefined) {
    animateValueChange('soilTemp', `${current.soil_temperature_surface.toFixed(1)}°C`);
  }
  if (current.soil_moisture_surface !== undefined) {
    animateValueChange('soilMoisture', `${(current.soil_moisture_surface * 100).toFixed(1)}%`);
  }
  
  // Update forecast data
  if (hourly && hourly.length > 0) {
    updateHourlyForecast({ time: hourly.map(h => h.time), temperature_2m: hourly.map(h => h.temperature), precipitation: hourly.map(h => h.precipitation), relative_humidity_2m: hourly.map(h => h.humidity), weather_code: hourly.map(h => h.weather_code) });
  }
  if (daily && daily.length > 0) {
    updateDailyForecast({ time: daily.map(d => d.date), temperature_2m_max: daily.map(d => d.temperature_max), temperature_2m_min: daily.map(d => d.temperature_min), precipitation_sum: daily.map(d => d.precipitation_sum), weather_code: daily.map(d => d.weather_code) });
  }
  
  // Update humidity progress
  updateHumidityProgress(Math.round(current.humidity));
  
  // Update weather icon
  if (current.weather_code !== undefined) {
    updateWeatherIconFromCode(current.weather_code);
  }
  
  // Update data source info
  document.getElementById('dataSource').innerText = 'Data source: Open-Meteo (Global)';
  document.getElementById('lastUpdated').innerText = `Last updated: ${new Date().toLocaleString()}`;
  document.getElementById('locationInfo').innerText = `Location: ${location.name}, ${location.country || 'Unknown'}`;
  
  hideLoading();
  console.log('Weather display updated successfully for', location.name);
}

// Convert weather code to description
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
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return descriptions[code] || 'Unknown';
}

// Get wind direction from degrees
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Get UV level description
function getUVLevel(uvIndex) {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

// Update UV indicator
function updateUVIndicator(uvIndex) {
  const uvBar = document.getElementById('uvBar');
  if (uvBar) {
    const percentage = Math.min((uvIndex / 12) * 100, 100);
    uvBar.style.width = `${percentage}%`;
    
    // Change color based on UV level
    if (uvIndex <= 2) uvBar.style.background = '#4CAF50';
    else if (uvIndex <= 5) uvBar.style.background = '#FFC107';
    else if (uvIndex <= 7) uvBar.style.background = '#FF9800';
    else if (uvIndex <= 10) uvBar.style.background = '#F44336';
    else uvBar.style.background = '#9C27B0';
  }
}

// Update weather icon from weather code
function updateWeatherIconFromCode(code) {
  const iconElement = document.getElementById('weatherIcon');
  if (!iconElement) return;
  
  let iconClass = 'fas fa-sun'; // default
  
  if (code === 0 || code === 1) iconClass = 'fas fa-sun';
  else if (code === 2 || code === 3) iconClass = 'fas fa-cloud-sun';
  else if (code === 45 || code === 48) iconClass = 'fas fa-smog';
  else if (code >= 51 && code <= 65) iconClass = 'fas fa-cloud-rain';
  else if (code >= 71 && code <= 75) iconClass = 'fas fa-snowflake';
  else if (code >= 95) iconClass = 'fas fa-bolt';
  
  iconElement.className = `${iconClass} weather-display-icon`;
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
  
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Hide results if query is too short
  if (query.length < 2) {
    document.getElementById('searchResults').style.display = 'none';
    return;
  }
  
  // Set timeout for auto-search (increased to reduce blinking)
  searchTimeout = setTimeout(() => {
    performLocationSearchQuiet(query); // Use quiet version to prevent blinking
  }, 800); // Increased from 500ms to 800ms
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

// =============== FORECAST DISPLAY FUNCTIONS ===============

// Update hourly forecast
function updateHourlyForecast(hourlyData) {
  const container = document.getElementById('hourlyForecastData');
  let html = '';
  
  // Show next 24 hours
  for (let i = 0; i < 24 && i < hourlyData.time.length; i++) {
    const time = new Date(hourlyData.time[i]);
    const temp = hourlyData.temperature_2m[i]?.toFixed(1) || 'N/A';
    const precipitation = hourlyData.precipitation[i]?.toFixed(1) || '0.0';
    const humidity = hourlyData.relative_humidity_2m[i] || 'N/A';
    const weatherCode = hourlyData.weather_code[i] || 0;
    
    html += `
      <div class="hourly-card">
        <div class="hour-time">${time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="hour-icon">${getWeatherIcon(weatherCode)}</div>
        <div class="hour-temp">${temp}°C</div>
        <div class="hour-rain">${precipitation}mm</div>
        <div class="hour-humidity">${humidity}%</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Update daily forecast
function updateDailyForecast(dailyData) {
  const container = document.getElementById('dailyForecastData');
  let html = '';
  
  // Show next 7 days
  for (let i = 0; i < 7 && i < dailyData.time.length; i++) {
    const date = new Date(dailyData.time[i]);
    const maxTemp = dailyData.temperature_2m_max[i]?.toFixed(1) || 'N/A';
    const minTemp = dailyData.temperature_2m_min[i]?.toFixed(1) || 'N/A';
    const precipitation = dailyData.precipitation_sum[i]?.toFixed(1) || '0.0';
    const weatherCode = dailyData.weather_code[i] || 0;
    
    const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });
    
    html += `
      <div class="daily-card">
        <div class="daily-header">
          <div class="daily-day">${dayName}</div>
          <div class="daily-date">${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
        </div>
        <div class="daily-weather">
          <div class="daily-icon">${getWeatherIcon(weatherCode)}</div>
          <div class="daily-temps">
            <span class="daily-max">${maxTemp}°</span>
            <span class="daily-min">${minTemp}°</span>
          </div>
        </div>
        <div class="daily-details">
          <div class="daily-rain">
            <i class="fas fa-tint"></i>
            <span>${precipitation}mm</span>
          </div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Get weather icon from code
function getWeatherIcon(code) {
  const icons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '⛈️',
    71: '🌨️', 73: '❄️', 75: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  
  return icons[code] || '🌤️';
}

// Forecast tab switching
function showHourlyForecast() {
  document.getElementById('hourlyForecast').style.display = 'block';
  document.getElementById('dailyForecast').style.display = 'none';
  
  // Update tab active state
  document.querySelectorAll('.forecast-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
}

function showDailyForecast() {
  document.getElementById('hourlyForecast').style.display = 'none';
  document.getElementById('dailyForecast').style.display = 'block';
  
  // Update tab active state
  document.querySelectorAll('.forecast-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
}

// =============== GLOBAL LOCATION SEARCH FUNCTIONS END ===============



// Load ML weather predictions for current city
async function loadWeatherPredictions() {
  const city = citySelect.value;
  if (!city) {
    alert('Please select a city');
    return;
  }

  const predictionsSection = document.getElementById('weatherPredictions');
  const generateBtn = document.getElementById('generatePredictionsBtn');
  
  // Show loading state
  predictionsSection.style.display = 'grid';
  predictionsSection.innerHTML = '<div class="ml-loading"><i class="fas fa-spinner"></i><p>Generating AI weather predictions...</p></div>';
  
  // Disable button
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  
  try {
    const response = await fetch(`http://localhost:4001/api/ml/weather/${city}?days=7`);
    const data = await response.json();

    if (data.success) {
      displayWeatherPredictions(data.predictions);
    } else {
      throw new Error(data.error || 'Failed to load predictions');
    }
  } catch (error) {
    console.error('Error loading weather predictions:', error);
    predictionsSection.innerHTML = `<div class="ml-error">Error loading weather predictions: ${error.message}</div>`;
  } finally {
    // Re-enable button
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Predictions';
  }
}

// Display weather predictions in the grid
function displayWeatherPredictions(predictions) {
  const container = document.getElementById('weatherPredictions');
  let html = '';
  
  if (predictions.temperature && predictions.temperature.predictions && predictions.temperature.predictions.length > 0) {
    const validTemps = predictions.temperature.predictions.filter(p => p.temperature != null && !isNaN(p.temperature));
    if (validTemps.length > 0) {
      const avgTemp = validTemps.reduce((sum, p) => sum + p.temperature, 0) / validTemps.length;
      const confidence = predictions.temperature.confidence || 0;
      html += `
        <div class="prediction-card">
          <div class="card-title">🌡️ Average Temperature (7 days)</div>
          <div class="card-value">${avgTemp.toFixed(1)}°C</div>
          <div class="card-description">Confidence: ${(confidence * 100).toFixed(0)}%</div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
          </div>
        </div>
      `;
    }
  }

  if (predictions.rainfall && predictions.rainfall.predictions && predictions.rainfall.predictions.length > 0) {
    const validRainfall = predictions.rainfall.predictions.filter(p => p.rainfall != null && !isNaN(p.rainfall));
    if (validRainfall.length > 0) {
      const totalRain = validRainfall.reduce((sum, p) => sum + p.rainfall, 0);
      const confidence = predictions.rainfall.confidence || 0;
      html += `
        <div class="prediction-card">
          <div class="card-title">🌧️ Total Rainfall (7 days)</div>
          <div class="card-value">${totalRain.toFixed(1)} mm</div>
          <div class="card-description">Confidence: ${(confidence * 100).toFixed(0)}%</div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
          </div>
        </div>
      `;
    }
  }

  if (predictions.humidity && predictions.humidity.predictions && predictions.humidity.predictions.length > 0) {
    const validHumidity = predictions.humidity.predictions.filter(p => p.humidity != null && !isNaN(p.humidity));
    if (validHumidity.length > 0) {
      const avgHumidity = validHumidity.reduce((sum, p) => sum + p.humidity, 0) / validHumidity.length;
      const confidence = predictions.humidity.confidence || 0;
      html += `
        <div class="prediction-card">
          <div class="card-title">💧 Average Humidity (7 days)</div>
          <div class="card-value">${avgHumidity.toFixed(0)}%</div>
          <div class="card-description">Confidence: ${(confidence * 100).toFixed(0)}%</div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
          </div>
        </div>
      `;
    }
  }

  // Add daily breakdown if available
  if (predictions.temperature && predictions.temperature.predictions && predictions.temperature.predictions.length > 0) {
    const validDays = predictions.temperature.predictions.filter(p => p.temperature != null && !isNaN(p.temperature));
    if (validDays.length > 0) {
      html += `
        <div class="prediction-card" style="grid-column: 1 / -1;">
          <div class="card-title">📊 7-Day Temperature Trend</div>
          <div class="temperature-trend">
      `;
      
      validDays.forEach((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        html += `
          <div class="trend-day">
            <div class="trend-day-name">${dayName}</div>
            <div class="trend-temp">${day.temperature.toFixed(1)}°C</div>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
  }
  
  // If no valid predictions were found, show a message
  if (html === '') {
    html = `
      <div class="prediction-card" style="grid-column: 1 / -1;">
        <div class="card-title">⚠️ No Predictions Available</div>
        <div class="card-description">Unable to generate weather predictions. Please try again later or ensure there is sufficient historical data.</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}
