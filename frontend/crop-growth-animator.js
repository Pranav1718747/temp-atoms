// Crop Growth Animation Controller
// Handles weather-to-crop impact animations and real-time updates

class CropGrowthAnimator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStage = 'seed';
    this.currentCrop = 'rice';
    this.weatherConditions = {
      temperature: 25,
      humidity: 60,
      rainfall: 0,
      windSpeed: 5,
      uvIndex: 3,
      soilMoisture: 50,
      pressure: 1013,
      airQuality: 50,
      soilTemperature: 23,
      heatIndex: 25
    };
    
    this.growthStages = ['seed', 'germination', 'seedling', 'vegetative', 'flowering', 'fruiting'];
    this.stageProgress = 0;
    this.isAnimating = false;
    this.animationSpeed = 3; // 3x normal speed (faster)
    
    // Drag functionality properties
    this.isDragging = false;
    this.isManualControl = false;
    this.dragStartX = 0;
    this.dragStartProgress = 0;
    
    this.cropConfigs = {
      rice: {
        name: 'Rice',
        icon: '🌾',
        optimalTemp: { min: 20, max: 35 },
        optimalHumidity: { min: 70, max: 90 },
        optimalRainfall: { min: 2, max: 8 },
        stageDurations: [3, 7, 10, 22, 15, 18] // days for each stage (faster)
      },
      wheat: {
        name: 'Wheat',
        icon: '🌾',
        optimalTemp: { min: 15, max: 25 },
        optimalHumidity: { min: 50, max: 70 },
        optimalRainfall: { min: 1, max: 5 },
        stageDurations: [2, 6, 9, 30, 12, 15]
      },
      cotton: {
        name: 'Cotton',
        icon: '🌱',
        optimalTemp: { min: 25, max: 35 },
        optimalHumidity: { min: 60, max: 80 },
        optimalRainfall: { min: 3, max: 7 },
        stageDurations: [4, 7, 12, 25, 17, 20]
      },
      tomato: {
        name: 'Tomato',
        icon: '🍅',
        optimalTemp: { min: 20, max: 30 },
        optimalHumidity: { min: 65, max: 85 },
        optimalRainfall: { min: 2, max: 6 },
        stageDurations: [3, 5, 7, 17, 10, 12]
      }
    };
    
    this.init();
  }
  
  init() {
    this.createAnimationContainer();
    this.createControls();
    this.setupEventListeners();
    this.startGrowthCycle();
  }
  
  createAnimationContainer() {
    if (!this.container) {
      console.error('Animation container not found');
      return;
    }
    
    this.container.innerHTML = `
      <div class="crop-growth-container">
        <!-- Weather Environment -->
        <div class="weather-environment">
          <div class="sun"></div>
          <div class="rain-drops">
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
            <div class="rain-drop"></div>
          </div>
          <div class="wind-effects">
            <div class="wind-line"></div>
            <div class="wind-line"></div>
            <div class="wind-line"></div>
          </div>
        </div>
        
        <!-- Crop Plant -->
        <div class="crop-plant seed" id="cropPlant">
          <svg class="plant-svg" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Roots -->
            <g class="plant-roots">
              <path d="M45,180 Q40,190 35,200 M50,185 Q45,195 40,205 M55,180 Q60,190 65,200" 
                    stroke="#8B4513" stroke-width="2" fill="none" opacity="0.7"/>
            </g>
            
            <!-- Main Stem -->
            <rect class="plant-stem" x="48" y="60" width="4" height="120" rx="2"/>
            
            <!-- Leaves -->
            <g class="plant-leaves">
              <!-- Lower leaves -->
              <ellipse cx="35" cy="140" rx="15" ry="8" transform="rotate(-20 35 140)"/>
              <ellipse cx="65" cy="135" rx="15" ry="8" transform="rotate(20 65 135)"/>
              
              <!-- Middle leaves -->
              <ellipse cx="30" cy="110" rx="18" ry="10" transform="rotate(-25 30 110)"/>
              <ellipse cx="70" cy="105" rx="18" ry="10" transform="rotate(25 70 105)"/>
              
              <!-- Upper leaves -->
              <ellipse cx="35" cy="80" rx="20" ry="12" transform="rotate(-15 35 80)"/>
              <ellipse cx="65" cy="75" rx="20" ry="12" transform="rotate(15 65 75)"/>
            </g>
            
            <!-- Flowers -->
            <g class="plant-flowers">
              <circle cx="45" cy="65" r="4"/>
              <circle cx="55" cy="62" r="4"/>
              <circle cx="50" cy="58" r="5"/>
            </g>
            
            <!-- Fruits -->
            <g class="plant-fruits">
              <ellipse cx="44" cy="70" rx="6" ry="8"/>
              <ellipse cx="56" cy="67" rx="6" ry="8"/>
              <ellipse cx="50" cy="63" rx="7" ry="9"/>
            </g>
          </svg>
        </div>
        
        <!-- Soil Layer -->
        <div class="soil-layer">
          <div class="soil-moisture-indicator" id="soilMoisture"></div>
        </div>
        
        <!-- Growth Progress -->
        <div class="growth-progress" id="growthProgress">
          <div class="growth-progress-bar" id="growthProgressBar">
            <div class="growth-progress-handle" id="growthProgressHandle"></div>
          </div>
          <div class="growth-progress-labels">
            <span class="growth-progress-label">Seed</span>
            <span class="growth-progress-label">Sprout</span>
            <span class="growth-progress-label">Seedling</span>
            <span class="growth-progress-label">Growth</span>
            <span class="growth-progress-label">Flower</span>
            <span class="growth-progress-label">Fruit</span>
          </div>
        </div>
        
        <!-- Weather Indicators -->
        <div class="weather-indicators">
          <div class="weather-indicator temperature">
            <span class="icon">🌡️</span>
            <span id="tempDisplay">25°C</span>
          </div>
          <div class="weather-indicator humidity">
            <span class="icon">💧</span>
            <span id="humidityDisplay">60%</span>
          </div>
          <div class="weather-indicator rainfall">
            <span class="icon">🌧️</span>
            <span id="rainfallDisplay">0mm</span>
          </div>
        </div>
        
        <!-- Stage Labels -->
        <div class="stage-labels">
          <div class="stage-label" data-stage="seed">Seed</div>
          <div class="stage-label" data-stage="germination">Germination</div>
          <div class="stage-label" data-stage="seedling">Seedling</div>
          <div class="stage-label" data-stage="vegetative">Vegetative</div>
          <div class="stage-label" data-stage="flowering">Flowering</div>
          <div class="stage-label" data-stage="fruiting">Fruiting</div>
        </div>
      </div>
    `;
  }
  
  createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'animation-controls';
    controlsContainer.innerHTML = `
      <select id="cropSelector" class="control-button">
        <option value="rice">🌾 Rice</option>
        <option value="wheat">🌾 Wheat</option>
        <option value="cotton">🌱 Cotton</option>
        <option value="tomato">🍅 Tomato</option>
      </select>
      
      <button class="control-button" onclick="cropAnimator.simulateWeather('optimal')">
        ☀️ Optimal Weather
      </button>
      
      <button class="control-button weather-rain" onclick="cropAnimator.simulateWeather('rain')">
        🌧️ Heavy Rain
      </button>
      
      <button class="control-button weather-sun" onclick="cropAnimator.simulateWeather('drought')">
        🔥 Drought Stress
      </button>
      
      <button class="control-button weather-wind" onclick="cropAnimator.simulateWeather('cold')">
        ❄️ Cold Stress
      </button>
      
      <button class="control-button" onclick="cropAnimator.resetGrowth()">
        🔄 Reset Growth
      </button>
      
      <button class="control-button" onclick="cropAnimator.toggleAnimation()">
        ⏯️ <span id="animationToggle">Pause</span>
      </button>
      
      <button class="control-button" onclick="cropAnimator.resumeAutomaticGrowth()">
        🔄 Resume Auto Growth
      </button>
    `;
    
    this.container.appendChild(controlsContainer);
  }
  
  setupEventListeners() {
    const cropSelector = document.getElementById('cropSelector');
    if (cropSelector) {
      cropSelector.addEventListener('change', (e) => {
        this.changeCrop(e.target.value);
      });
    }
    
    // Setup drag functionality for growth progress bar
    this.setupProgressBarDrag();
  }
  
  setupProgressBarDrag() {
    const progressBar = document.getElementById('growthProgress');
    const handle = document.getElementById('growthProgressHandle');
    
    if (!progressBar || !handle) return;
    
    // Mouse events
    handle.addEventListener('mousedown', (e) => this.startDrag(e));
    progressBar.addEventListener('mousedown', (e) => this.jumpToPosition(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Touch events for mobile
    handle.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
    progressBar.addEventListener('touchstart', (e) => this.jumpToPosition(e.touches[0]), { passive: false });
    document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), { passive: false });
    document.addEventListener('touchend', () => this.endDrag());
  }
  
  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.isManualControl = true;
    this.dragStartX = e.clientX;
    
    const progressBar = document.getElementById('growthProgressBar');
    if (progressBar) {
      const currentWidth = parseFloat(progressBar.style.width) || 0;
      this.dragStartProgress = currentWidth;
    }
    
    const handle = document.getElementById('growthProgressHandle');
    if (handle) {
      handle.classList.add('dragging');
    }
    
    // Pause automatic animation when manually controlling
    this.pauseAutomaticGrowth();
  }
  
  onDrag(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    const progressContainer = document.getElementById('growthProgress');
    if (!progressContainer) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const deltaX = e.clientX - this.dragStartX;
    const deltaPercent = (deltaX / rect.width) * 100;
    
    let newProgress = this.dragStartProgress + deltaPercent;
    newProgress = Math.max(0, Math.min(100, newProgress));
    
    this.setGrowthProgress(newProgress);
  }
  
  endDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    const handle = document.getElementById('growthProgressHandle');
    if (handle) {
      handle.classList.remove('dragging');
    }
  }
  
  jumpToPosition(e) {
    if (this.isDragging) return;
    
    const progressContainer = document.getElementById('growthProgress');
    if (!progressContainer) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    
    this.isManualControl = true;
    this.setGrowthProgress(Math.max(0, Math.min(100, newProgress)));
    this.pauseAutomaticGrowth();
  }
  
  setGrowthProgress(progressPercent) {
    // Update visual progress bar
    const progressBar = document.getElementById('growthProgressBar');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }
    
    // Calculate which growth stage this represents
    const stageIndex = Math.floor((progressPercent / 100) * this.growthStages.length);
    const clampedStageIndex = Math.max(0, Math.min(this.growthStages.length - 1, stageIndex));
    
    // Calculate progress within the current stage
    const stageSize = 100 / this.growthStages.length;
    const stageStartPercent = clampedStageIndex * stageSize;
    const progressInStage = ((progressPercent - stageStartPercent) / stageSize) * 100;
    
    // Update crop state
    this.currentStage = this.growthStages[clampedStageIndex];
    this.stageProgress = Math.max(0, Math.min(100, progressInStage));
    
    // Update visual appearance
    this.updatePlantStageVisual();
    this.updateStageLabels();
    
    // Show feedback about manual control
    this.showManualControlFeedback(progressPercent);
  }
  
  updatePlantStageVisual() {
    const plant = document.getElementById('cropPlant');
    if (!plant) return;
    
    // Remove all stage classes
    this.growthStages.forEach(stage => plant.classList.remove(stage));
    
    // Add current stage class
    plant.classList.add(this.currentStage);
    
    // Update weather stress effects
    this.updatePlantVisual();
  }
  
  showManualControlFeedback(progressPercent) {
    const stageIndex = Math.floor((progressPercent / 100) * this.growthStages.length);
    const stageName = this.growthStages[Math.max(0, Math.min(this.growthStages.length - 1, stageIndex))];
    
    // Create or update feedback tooltip
    let tooltip = document.getElementById('growthTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'growthTooltip';
      tooltip.style.cssText = `
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      const progressContainer = document.getElementById('growthProgress');
      if (progressContainer) {
        progressContainer.appendChild(tooltip);
      }
    }
    
    tooltip.textContent = `${stageName} (${progressPercent.toFixed(1)}%)`;
    tooltip.style.opacity = '1';
    
    // Hide tooltip after 2 seconds
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => {
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    }, 2000);
  }
  
  pauseAutomaticGrowth() {
    // Stop automatic growth updates
    if (this.growthInterval) {
      clearInterval(this.growthInterval);
      this.growthInterval = null;
    }
  }
  
  resumeAutomaticGrowth() {
    this.isManualControl = false;
    this.startGrowthCycle();
  }
  
  startGrowthCycle() {
    this.isAnimating = true;
    this.growthInterval = setInterval(() => {
      if (this.isAnimating) {
        this.updateGrowth();
      }
    }, 500 / this.animationSpeed); // Update every 0.5 seconds (faster)
  }
  
  updateGrowth() {
    // Skip automatic updates if user is manually controlling
    if (this.isManualControl) return;
    
    const currentStageIndex = this.growthStages.indexOf(this.currentStage);
    const cropConfig = this.cropConfigs[this.currentCrop];
    
    // Calculate growth rate based on weather conditions
    const growthRate = this.calculateGrowthRate();
    
    // Update stage progress
    this.stageProgress += growthRate;
    const progressPercent = (currentStageIndex * 100 + this.stageProgress) / (this.growthStages.length * 100) * 100;
    
    // Update progress bar
    const progressBar = document.getElementById('growthProgressBar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    }
    
    // Check if ready for next stage
    if (this.stageProgress >= 100 && currentStageIndex < this.growthStages.length - 1) {
      this.advanceStage();
    }
    
    // Update visual state
    this.updatePlantVisual();
    this.updateStageLabels();
  }
  
  calculateGrowthRate() {
    const cropConfig = this.cropConfigs[this.currentCrop];
    let rate = 1; // Base growth rate
    
    // Temperature impact
    const tempOptimal = (cropConfig.optimalTemp.min + cropConfig.optimalTemp.max) / 2;
    const tempDiff = Math.abs(this.weatherConditions.temperature - tempOptimal);
    if (tempDiff > 10) {
      rate *= 0.3; // Severe temperature stress
    } else if (tempDiff > 5) {
      rate *= 0.7; // Moderate stress
    }
    
    // Humidity impact
    const humidityOptimal = (cropConfig.optimalHumidity.min + cropConfig.optimalHumidity.max) / 2;
    const humidityDiff = Math.abs(this.weatherConditions.humidity - humidityOptimal);
    if (humidityDiff > 20) {
      rate *= 0.5;
    } else if (humidityDiff > 10) {
      rate *= 0.8;
    }
    
    // Rainfall impact
    if (this.weatherConditions.rainfall < cropConfig.optimalRainfall.min) {
      rate *= 0.6; // Drought stress
    } else if (this.weatherConditions.rainfall > cropConfig.optimalRainfall.max) {
      rate *= 0.7; // Waterlogging stress
    }
    
    // NEW: Atmospheric pressure impact
    const pressure = this.weatherConditions.pressure || 1013;
    if (pressure < 1000) {
      rate *= 0.85; // Low pressure reduces growth efficiency
    } else if (pressure > 1030) {
      rate *= 0.9; // High pressure slightly reduces growth
    }
    
    // NEW: Wind speed impact
    const windSpeed = this.weatherConditions.windSpeed || 5;
    if (windSpeed < 3) {
      rate *= 0.9; // Too calm - reduced gas exchange
    } else if (windSpeed > 20) {
      rate *= 0.4; // Strong winds cause mechanical stress
    } else if (windSpeed >= 8 && windSpeed <= 15) {
      rate *= 1.1; // Optimal wind for gas exchange
    }
    
    // NEW: Air quality impact
    const aqi = this.weatherConditions.airQuality || 50;
    if (aqi > 150) {
      rate *= 0.3; // Poor air quality severely impacts photosynthesis
    } else if (aqi > 100) {
      rate *= 0.7; // Moderate air quality reduces efficiency
    } else if (aqi < 50) {
      rate *= 1.05; // Clean air enhances photosynthesis
    }
    
    // NEW: Soil conditions impact
    const soilMoisture = this.weatherConditions.soilMoisture || 50;
    if (soilMoisture < 30) {
      rate *= 0.4; // Dry soil severely limits growth
    } else if (soilMoisture > 80) {
      rate *= 0.5; // Waterlogged soil causes root problems
    } else if (soilMoisture >= 50 && soilMoisture <= 70) {
      rate *= 1.1; // Optimal soil moisture
    }
    
    // NEW: Heat index impact (combines temperature and humidity)
    const heatIndex = this.weatherConditions.heatIndex || this.calculateHeatIndex(
      this.weatherConditions.temperature, this.weatherConditions.humidity
    );
    if (heatIndex > 40) {
      rate *= 0.2; // Extreme heat index causes severe stress
    } else if (heatIndex > 35) {
      rate *= 0.6; // High heat index reduces growth
    } else if (heatIndex < 20) {
      rate *= 0.8; // Low heat index slows metabolism
    }
    
    return Math.max(rate, 0.05); // Minimum growth rate (plants don't die completely)
  }
  
  calculateHeatIndex(temp, humidity) {
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
  
  advanceStage() {
    const currentIndex = this.growthStages.indexOf(this.currentStage);
    if (currentIndex < this.growthStages.length - 1) {
      this.currentStage = this.growthStages[currentIndex + 1];
      this.stageProgress = 0;
      
      // Trigger stage transition animation
      this.animateStageTransition();
    }
  }
  
  animateStageTransition() {
    const plant = document.getElementById('cropPlant');
    if (plant) {
      // Remove old stage classes
      this.growthStages.forEach(stage => plant.classList.remove(stage));
      
      // Add new stage class
      plant.classList.add(this.currentStage);
      
      // Add transition effect
      plant.style.transform = 'scale(1.1)';
      setTimeout(() => {
        plant.style.transform = 'scale(1)';
      }, 150);
    }
  }
  
  updatePlantVisual() {
    const plant = document.getElementById('cropPlant');
    if (!plant) return;
    
    // Remove stress classes
    plant.classList.remove('temperature-stress', 'drought-stress', 'waterlogged', 'cold-stress', 
                           'optimal-growth', 'pressure-stress', 'wind-stress', 'air-quality-stress', 
                           'heat-index-stress', 'soil-stress');
    
    const cropConfig = this.cropConfigs[this.currentCrop];
    
    // Heat index stress (combines temperature and humidity effects)
    const heatIndex = this.weatherConditions.heatIndex || this.calculateHeatIndex(
      this.weatherConditions.temperature, this.weatherConditions.humidity
    );
    
    if (heatIndex > 40) {
      plant.classList.add('heat-index-stress');
    } else if (this.weatherConditions.temperature > cropConfig.optimalTemp.max + 5) {
      plant.classList.add('temperature-stress');
    } else if (this.weatherConditions.temperature < cropConfig.optimalTemp.min - 5) {
      plant.classList.add('cold-stress');
    }
    
    // Soil moisture stress
    else if (this.weatherConditions.soilMoisture < 30) {
      plant.classList.add('drought-stress');
    } else if (this.weatherConditions.soilMoisture > 80) {
      plant.classList.add('waterlogged');
    }
    
    // Air quality stress
    else if (this.weatherConditions.airQuality > 150) {
      plant.classList.add('air-quality-stress');
    }
    
    // Wind stress
    else if (this.weatherConditions.windSpeed > 25) {
      plant.classList.add('wind-stress');
    }
    
    // Atmospheric pressure stress
    else if (this.weatherConditions.pressure < 990) {
      plant.classList.add('pressure-stress');
    }
    
    // Check for optimal conditions
    else if (this.isOptimalConditions()) {
      plant.classList.add('optimal-growth');
    }
    
    // Update weather effects
    this.updateWeatherEffects();
  }
  
  updateWeatherEffects() {
    // Rain effect
    const rainDrops = document.querySelector('.rain-drops');
    if (rainDrops) {
      rainDrops.classList.toggle('active', this.weatherConditions.rainfall > 2);
    }
    
    // Wind effect
    const windEffects = document.querySelector('.wind-effects');
    if (windEffects) {
      windEffects.classList.toggle('active', this.weatherConditions.windSpeed > 8);
    }
    
    // Soil moisture
    const soilMoisture = document.getElementById('soilMoisture');
    if (soilMoisture) {
      soilMoisture.classList.remove('wet', 'optimal');
      if (this.weatherConditions.soilMoisture > 70) {
        soilMoisture.classList.add('wet');
      } else if (this.weatherConditions.soilMoisture > 40) {
        soilMoisture.classList.add('optimal');
      }
    }
  }
  
  updateStageLabels() {
    const labels = document.querySelectorAll('.stage-label');
    labels.forEach(label => {
      label.classList.toggle('active', label.dataset.stage === this.currentStage);
    });
  }
  
  isOptimalConditions() {
    const config = this.cropConfigs[this.currentCrop];
    return (
      this.weatherConditions.temperature >= config.optimalTemp.min &&
      this.weatherConditions.temperature <= config.optimalTemp.max &&
      this.weatherConditions.humidity >= config.optimalHumidity.min &&
      this.weatherConditions.humidity <= config.optimalHumidity.max &&
      this.weatherConditions.rainfall >= config.optimalRainfall.min &&
      this.weatherConditions.rainfall <= config.optimalRainfall.max
    );
  }
  
  // Control Methods
  simulateWeather(type) {
    switch (type) {
      case 'optimal':
        const config = this.cropConfigs[this.currentCrop];
        this.updateWeatherConditions({
          temperature: (config.optimalTemp.min + config.optimalTemp.max) / 2,
          humidity: (config.optimalHumidity.min + config.optimalHumidity.max) / 2,
          rainfall: (config.optimalRainfall.min + config.optimalRainfall.max) / 2,
          windSpeed: 3,
          soilMoisture: 65
        });
        break;
      case 'rain':
        this.updateWeatherConditions({
          temperature: this.weatherConditions.temperature - 3,
          humidity: 85,
          rainfall: 8,
          windSpeed: 12,
          soilMoisture: 85
        });
        break;
      case 'drought':
        this.updateWeatherConditions({
          temperature: this.weatherConditions.temperature + 8,
          humidity: 30,
          rainfall: 0,
          windSpeed: 15,
          soilMoisture: 20
        });
        break;
      case 'cold':
        this.updateWeatherConditions({
          temperature: this.weatherConditions.temperature - 10,
          humidity: 70,
          rainfall: 1,
          windSpeed: 8,
          soilMoisture: 50
        });
        break;
    }
  }
  
  updateWeatherConditions(conditions) {
    Object.assign(this.weatherConditions, conditions);
    this.updateWeatherDisplay();
    this.updatePlantVisual();
  }
  
  updateWeatherDisplay() {
    const tempDisplay = document.getElementById('tempDisplay');
    const humidityDisplay = document.getElementById('humidityDisplay');
    const rainfallDisplay = document.getElementById('rainfallDisplay');
    
    if (tempDisplay) tempDisplay.textContent = `${this.weatherConditions.temperature.toFixed(1)}°C`;
    if (humidityDisplay) humidityDisplay.textContent = `${this.weatherConditions.humidity.toFixed(0)}%`;
    if (rainfallDisplay) rainfallDisplay.textContent = `${this.weatherConditions.rainfall.toFixed(1)}mm`;
  }
  
  changeCrop(cropType) {
    if (this.cropConfigs[cropType]) {
      this.currentCrop = cropType;
      this.resetGrowth();
    }
  }
  
  resetGrowth() {
    this.currentStage = 'seed';
    this.stageProgress = 0;
    this.isManualControl = false;
    
    const plant = document.getElementById('cropPlant');
    if (plant) {
      this.growthStages.forEach(stage => plant.classList.remove(stage));
      plant.classList.add('seed');
    }
    
    const progressBar = document.getElementById('growthProgressBar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    // Clear any tooltip
    const tooltip = document.getElementById('growthTooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
    
    this.updateStageLabels();
    
    // Resume automatic growth
    this.resumeAutomaticGrowth();
  }
  
  toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    const toggleText = document.getElementById('animationToggle');
    if (toggleText) {
      toggleText.textContent = this.isAnimating ? 'Pause' : 'Play';
    }
  }
  
  // Integration method for real weather data
  updateFromWeatherData(weatherData) {
    if (!weatherData) return;
    
    const conditions = {
      temperature: weatherData.temperature || 25,
      humidity: weatherData.humidity || 60,
      rainfall: weatherData.rainfall || weatherData.precipitation || 0,
      windSpeed: weatherData.wind_speed || 5,
      uvIndex: weatherData.uv_index || 3,
      soilMoisture: weatherData.soil_moisture || 50
    };
    
    this.updateWeatherConditions(conditions);
  }
  
  // Get current animation state for saving/loading
  getState() {
    return {
      currentStage: this.currentStage,
      currentCrop: this.currentCrop,
      stageProgress: this.stageProgress,
      weatherConditions: { ...this.weatherConditions }
    };
  }
  
  // Load animation state
  setState(state) {
    if (state) {
      this.currentStage = state.currentStage || 'seed';
      this.currentCrop = state.currentCrop || 'rice';
      this.stageProgress = state.stageProgress || 0;
      this.weatherConditions = { ...this.weatherConditions, ...state.weatherConditions };
      
      this.updatePlantVisual();
      this.updateWeatherDisplay();
      this.updateStageLabels();
    }
  }
}

// Global instance - will be initialized when page loads
let cropAnimator = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if animation container exists
  const animationContainer = document.getElementById('cropGrowthAnimation');
  if (animationContainer) {
    cropAnimator = new CropGrowthAnimator('cropGrowthAnimation');
    console.log('🌱 Crop Growth Animator initialized');
  }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CropGrowthAnimator;
}