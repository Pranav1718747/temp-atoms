class FarmingService {
  constructor(climateDB) {
    this.db = climateDB;
    
    // Crop-specific thresholds and recommendations
    this.cropData = {
      rice: {
        name: "Rice",
        icon: "🌾",
        waterNeeds: { min: 100, max: 200 }, // mm per week
        tempRange: { min: 20, max: 35 },
        humidity: { min: 70, max: 90 },
        seasons: ["Kharif", "Rabi"]
      },
      wheat: {
        name: "Wheat",
        icon: "🌾",
        waterNeeds: { min: 50, max: 120 },
        tempRange: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        seasons: ["Rabi"]
      },
      cotton: {
        name: "Cotton",
        icon: "🌱",
        waterNeeds: { min: 80, max: 150 },
        tempRange: { min: 25, max: 35 },
        humidity: { min: 60, max: 80 },
        seasons: ["Kharif"]
      },
      sugarcane: {
        name: "Sugarcane",
        icon: "🎋",
        waterNeeds: { min: 150, max: 250 },
        tempRange: { min: 25, max: 35 },
        humidity: { min: 75, max: 95 },
        seasons: ["Kharif", "Rabi"]
      },
      tomato: {
        name: "Tomato",
        icon: "🍅",
        waterNeeds: { min: 60, max: 100 },
        tempRange: { min: 20, max: 30 },
        humidity: { min: 65, max: 85 },
        seasons: ["Kharif", "Rabi"]
      },
      onion: {
        name: "Onion",
        icon: "🧅",
        waterNeeds: { min: 40, max: 80 },
        tempRange: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        seasons: ["Rabi"]
      }
    };

    // Growth stages and their requirements
    this.growthStages = {
      seedling: { name: "Seedling", icon: "🌱", waterMultiplier: 0.6, criticalTemp: true },
      vegetative: { name: "Growing", icon: "🌿", waterMultiplier: 1.0, criticalTemp: false },
      flowering: { name: "Flowering", icon: "🌸", waterMultiplier: 1.3, criticalTemp: true },
      fruiting: { name: "Fruiting", icon: "🍇", waterMultiplier: 1.2, criticalTemp: true },
      harvest: { name: "Harvest", icon: "⚡", waterMultiplier: 0.4, criticalTemp: false }
    };
  }

  // Generate farming recommendations based on weather data
  generateFarmingRecommendations(weatherData, cropType = 'rice', growthStage = 'vegetative') {
    const crop = this.cropData[cropType];
    const stage = this.growthStages[growthStage];
    
    if (!crop || !stage) {
      return { error: "Invalid crop type or growth stage" };
    }

    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const rainfall = weatherData.rainfall || 0;
    
    const recommendations = {
      crop: crop,
      stage: stage,
      conditions: this.assessConditions(weatherData, crop, stage),
      irrigation: this.getIrrigationAdvice(rainfall, crop, stage),
      protection: this.getProtectionAdvice(weatherData, crop, stage),
      timing: this.getTimingAdvice(weatherData, crop),
      alerts: this.getFarmingAlerts(weatherData, crop, stage)
    };

    return recommendations;
  }

  // Assess current weather conditions for farming
  assessConditions(weatherData, crop, stage) {
    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const rainfall = weatherData.rainfall || 0;

    const conditions = {
      temperature: this.assessTemperature(temp, crop),
      humidity: this.assessHumidity(humidity, crop),
      water: this.assessWaterConditions(rainfall, crop, stage),
      overall: 'good' // will be calculated
    };

    // Calculate overall condition
    const scores = [conditions.temperature, conditions.humidity, conditions.water];
    const goodCount = scores.filter(score => score.status === 'good').length;
    
    if (goodCount >= 2) {
      conditions.overall = 'good';
    } else if (goodCount >= 1) {
      conditions.overall = 'fair';
    } else {
      conditions.overall = 'poor';
    }

    return conditions;
  }

  assessTemperature(temp, crop) {
    const { min, max } = crop.tempRange;
    
    if (temp >= min && temp <= max) {
      return {
        status: 'good',
        message: `Temperature is ideal for ${crop.name} (${temp}°C)`,
        icon: '🌡️✅',
        action: 'Continue normal farming activities'
      };
    } else if (temp < min) {
      return {
        status: 'cold',
        message: `Too cold for ${crop.name} (${temp}°C, needs ${min}°C+)`,
        icon: '🌡️❄️',
        action: 'Consider protective covering or delay planting'
      };
    } else {
      return {
        status: 'hot',
        message: `Too hot for ${crop.name} (${temp}°C, max ${max}°C)`,
        icon: '🌡️🔥',
        action: 'Increase irrigation and provide shade if possible'
      };
    }
  }

  assessHumidity(humidity, crop) {
    const { min, max } = crop.humidity;
    
    if (humidity >= min && humidity <= max) {
      return {
        status: 'good',
        message: `Humidity is perfect for ${crop.name} (${humidity}%)`,
        icon: '💧✅',
        action: 'Good conditions for growth'
      };
    } else if (humidity < min) {
      return {
        status: 'dry',
        message: `Air is too dry (${humidity}%, needs ${min}%+)`,
        icon: '💧🔻',
        action: 'Increase irrigation frequency'
      };
    } else {
      return {
        status: 'humid',
        message: `Very humid (${humidity}%, max ${max}%)`,
        icon: '💧🔺',
        action: 'Watch for fungal diseases, improve air circulation'
      };
    }
  }

  assessWaterConditions(rainfall, crop, stage) {
    const weeklyNeed = crop.waterNeeds.min * stage.waterMultiplier;
    const weeklyRainfall = rainfall * 24 * 7; // Convert hourly to weekly estimate
    
    if (weeklyRainfall >= weeklyNeed * 0.7) {
      return {
        status: 'good',
        message: `Adequate natural water (${weeklyRainfall.toFixed(1)}mm/week)`,
        icon: '🌧️✅',
        action: 'Reduce or stop irrigation'
      };
    } else if (weeklyRainfall >= weeklyNeed * 0.3) {
      return {
        status: 'fair',
        message: `Some natural water (${weeklyRainfall.toFixed(1)}mm/week)`,
        icon: '🌧️⚖️',
        action: 'Supplement with irrigation'
      };
    } else {
      return {
        status: 'dry',
        message: `Low rainfall (${weeklyRainfall.toFixed(1)}mm/week, need ${weeklyNeed.toFixed(1)}mm)`,
        icon: '🌧️❌',
        action: 'Full irrigation required'
      };
    }
  }

  getIrrigationAdvice(rainfall, crop, stage) {
    const requiredWater = crop.waterNeeds.min * stage.waterMultiplier;
    const naturalWater = rainfall * 24 * 7;
    const irrigationNeeded = Math.max(0, requiredWater - naturalWater);
    
    if (irrigationNeeded === 0) {
      return {
        needed: false,
        amount: 0,
        frequency: 'none',
        message: 'No irrigation needed - sufficient rainfall',
        icon: '🌧️',
        urgency: 'low'
      };
    } else if (irrigationNeeded <= crop.waterNeeds.min * 0.3) {
      return {
        needed: true,
        amount: irrigationNeeded,
        frequency: 'light',
        message: `Light irrigation: ${irrigationNeeded.toFixed(1)}mm per week`,
        icon: '💧',
        urgency: 'low'
      };
    } else if (irrigationNeeded <= crop.waterNeeds.min * 0.7) {
      return {
        needed: true,
        amount: irrigationNeeded,
        frequency: 'moderate',
        message: `Regular irrigation: ${irrigationNeeded.toFixed(1)}mm per week`,
        icon: '💦',
        urgency: 'medium'
      };
    } else {
      return {
        needed: true,
        amount: irrigationNeeded,
        frequency: 'heavy',
        message: `Heavy irrigation: ${irrigationNeeded.toFixed(1)}mm per week`,
        icon: '🚿',
        urgency: 'high'
      };
    }
  }

  getProtectionAdvice(weatherData, crop, stage) {
    const temp = weatherData.temperature;
    const rainfall = weatherData.rainfall || 0;
    const protections = [];

    // Heat protection
    if (temp > crop.tempRange.max) {
      protections.push({
        type: 'heat',
        action: 'Heat Protection',
        message: 'Use shade nets or mulching to protect crops',
        icon: '☂️',
        urgency: 'high'
      });
    }

    // Cold protection
    if (temp < crop.tempRange.min) {
      protections.push({
        type: 'cold',
        action: 'Cold Protection',
        message: 'Cover plants or use tunnels to retain warmth',
        icon: '🛡️',
        urgency: 'high'
      });
    }

    // Heavy rain protection
    if (rainfall > 15) {
      protections.push({
        type: 'rain',
        action: 'Rain Protection',
        message: 'Ensure proper drainage to prevent waterlogging',
        icon: '🌊',
        urgency: 'medium'
      });
    }

    // Disease prevention during flowering
    if (stage.name === 'Flowering' && weatherData.humidity > 85) {
      protections.push({
        type: 'disease',
        action: 'Disease Prevention',
        message: 'High humidity - monitor for fungal infections',
        icon: '🦠',
        urgency: 'medium'
      });
    }

    return protections;
  }

  getTimingAdvice(weatherData, crop) {
    const currentSeason = this.getCurrentSeason();
    const advice = [];

    // Check if it's the right season for this crop
    if (crop.seasons.includes(currentSeason)) {
      advice.push({
        activity: 'Planting Season',
        message: `Good time for ${crop.name} - ${currentSeason} season`,
        icon: '📅✅',
        priority: 'high'
      });
    }

    // Weather-based timing advice
    if (weatherData.temperature >= crop.tempRange.min && weatherData.temperature <= crop.tempRange.max) {
      advice.push({
        activity: 'Field Work',
        message: 'Ideal temperature for outdoor activities',
        icon: '🚜',
        priority: 'medium'
      });
    }

    if (weatherData.rainfall < 2) {
      advice.push({
        activity: 'Spraying',
        message: 'Good weather for pesticide/fertilizer application',
        icon: '🚁',
        priority: 'medium'
      });
    }

    return advice;
  }

  getFarmingAlerts(weatherData, crop, stage) {
    const alerts = [];
    const temp = weatherData.temperature;
    const rainfall = weatherData.rainfall || 0;

    // Critical temperature alerts
    if (stage.criticalTemp) {
      if (temp > crop.tempRange.max + 5) {
        alerts.push({
          level: 'critical',
          type: 'heat_stress',
          message: `Extreme heat may damage ${crop.name} during ${stage.name}`,
          action: 'Immediate cooling measures required',
          icon: '🔥'
        });
      } else if (temp < crop.tempRange.min - 3) {
        alerts.push({
          level: 'critical',
          type: 'cold_damage',
          message: `Freezing risk for ${crop.name} during ${stage.name}`,
          action: 'Protect crops immediately',
          icon: '❄️'
        });
      }
    }

    // Water stress alerts
    if (rainfall === 0 && stage.waterMultiplier > 1.0) {
      alerts.push({
        level: 'warning',
        type: 'water_stress',
        message: `${crop.name} needs extra water during ${stage.name}`,
        action: 'Increase irrigation frequency',
        icon: '💧'
      });
    }

    // Excessive rain alerts
    if (rainfall > 25) {
      alerts.push({
        level: 'warning',
        type: 'waterlogging',
        message: 'Heavy rainfall may cause waterlogging',
        action: 'Ensure proper field drainage',
        icon: '🌊'
      });
    }

    return alerts;
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 6 && month <= 11) {
      return 'Kharif'; // Monsoon season crops
    } else {
      return 'Rabi'; // Winter season crops
    }
  }

  // Get suitable crops for current weather
  getSuitableCrops(weatherData) {
    const suitable = [];
    const currentSeason = this.getCurrentSeason();
    
    Object.entries(this.cropData).forEach(([key, crop]) => {
      if (crop.seasons.includes(currentSeason)) {
        const tempScore = this.getTemperatureScore(weatherData.temperature, crop);
        const humidityScore = this.getHumidityScore(weatherData.humidity, crop);
        const overallScore = (tempScore + humidityScore) / 2;
        
        suitable.push({
          ...crop,
          key,
          suitability: overallScore,
          suitabilityText: this.getSuitabilityText(overallScore)
        });
      }
    });
    
    return suitable.sort((a, b) => b.suitability - a.suitability);
  }

  getTemperatureScore(temp, crop) {
    const { min, max } = crop.tempRange;
    if (temp >= min && temp <= max) return 100;
    if (temp < min) return Math.max(0, 100 - (min - temp) * 10);
    return Math.max(0, 100 - (temp - max) * 10);
  }

  getHumidityScore(humidity, crop) {
    const { min, max } = crop.humidity;
    if (humidity >= min && humidity <= max) return 100;
    if (humidity < min) return Math.max(0, 100 - (min - humidity) * 2);
    return Math.max(0, 100 - (humidity - max) * 2);
  }

  getSuitabilityText(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }
}

module.exports = FarmingService;