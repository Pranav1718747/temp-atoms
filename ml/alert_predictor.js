/**
 * Environmental Alert Prediction ML Model
 * Implements early warning system for environmental hazards
 */

class AlertPredictor {
    constructor() {
        this.alertThresholds = {};
        this.alertModels = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the alert prediction system
     */
    async initialize() {
        try {
            this.loadAlertThresholds();
            this.initializeAlertModels();
            this.isInitialized = true;
            console.log('Alert prediction models initialized successfully');
        } catch (error) {
            console.error('Error initializing alert models:', error);
            throw error;
        }
    }

    /**
     * Load alert thresholds for different environmental hazards
     */
    loadAlertThresholds() {
        this.alertThresholds = {
            heatwave: {
                temperature: { warning: 35, alert: 40, critical: 45 },
                duration: { warning: 2, alert: 3, critical: 5 }, // days
                humidity: { max: 60 } // Low humidity increases heat stress
            },
            flood: {
                rainfall: { 
                    warning: 50, // mm in 24h
                    alert: 100, 
                    critical: 200 
                },
                intensity: { warning: 10, alert: 20, critical: 40 }, // mm/hour
                soilSaturation: { warning: 80, alert: 90, critical: 95 }
            },
            drought: {
                rainfall: { 
                    warning: 20, // mm per week
                    alert: 10, 
                    critical: 5 
                },
                duration: { warning: 14, alert: 21, critical: 30 }, // days
                soilMoisture: { warning: 30, alert: 20, critical: 10 }
            },
            coastal: {
                windSpeed: { warning: 30, alert: 50, critical: 80 }, // km/h
                pressure: { warning: 1000, alert: 990, critical: 980 }, // hPa
                waveHeight: { warning: 2, alert: 4, critical: 6 } // meters
            }
        };
    }

    /**
     * Initialize individual alert prediction models
     */
    initializeAlertModels() {
        this.alertModels = {
            heatwave: new HeatwavePredictor(this.alertThresholds.heatwave),
            flood: new FloodPredictor(this.alertThresholds.flood),
            drought: new DroughtPredictor(this.alertThresholds.drought),
            coastal: new CoastalHazardPredictor(this.alertThresholds.coastal)
        };
    }

    /**
     * Predict environmental alerts based on current and forecast data
     * @param {Object} currentWeather - Current weather conditions
     * @param {Array} forecastData - Weather forecast for next days (can be Open-Meteo format)
     * @returns {Object} Alert predictions
     */
    async predictAlerts(currentWeather, forecastData = []) {
        if (!this.isInitialized) {
            throw new Error('Alert predictor not initialized');
        }

        try {
            // Normalize forecast data to common format
            const normalizedForecast = this.normalizeForecastData(forecastData);
            
            const alerts = {};

            // Predict each type of alert
            alerts.heatwave = await this.alertModels.heatwave.predict(currentWeather, normalizedForecast);
            alerts.flood = await this.alertModels.flood.predict(currentWeather, normalizedForecast);
            alerts.drought = await this.alertModels.drought.predict(currentWeather, normalizedForecast);
            alerts.coastal = await this.alertModels.coastal.predict(currentWeather, normalizedForecast);

            // Calculate overall risk assessment
            const overallRisk = this.calculateOverallRisk(alerts);

            return {
                alerts,
                overallRisk,
                recommendations: this.generateRecommendations(alerts),
                generatedAt: new Date().toISOString(),
                validFor: '24 hours',
                dataSource: this.detectDataSource(currentWeather)
            };
        } catch (error) {
            console.error('Error in alert prediction:', error);
            throw error;
        }
    }
    
    /**
     * Normalize forecast data from different APIs to common format
     */
    normalizeForecastData(forecastData) {
        if (!forecastData || forecastData.length === 0) {
            return [];
        }
        
        // Check if this is Open-Meteo daily forecast format
        if (forecastData[0] && forecastData[0].temp_min !== undefined) {
            return forecastData.map(day => ({
                temperature: (day.temp_min + day.temp_max) / 2,
                temp_min: day.temp_min,
                temp_max: day.temp_max,
                rainfall: day.precipitation || 0,
                humidity: day.humidity || 60, // Default if not available
                pressure: day.pressure || 1013, // Default if not available
                wind_speed: day.wind_speed_max || day.wind_speed || 0,
                date: day.date
            }));
        }
        
        // Return as-is if already in correct format
        return forecastData;
    }
    
    /**
     * Detect data source from weather object structure
     */
    detectDataSource(currentWeather) {
        if (currentWeather.is_day !== undefined) {
            return 'Open-Meteo Enhanced';
        } else if (currentWeather.weather && currentWeather.main) {
            return 'OpenWeather Compatible';
        } else {
            return 'Custom Format';
        }
    }

    /**
     * Calculate overall environmental risk
     */
    calculateOverallRisk(alerts) {
        const riskLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        let maxRisk = 0;
        let activeAlerts = 0;

        Object.values(alerts).forEach(alert => {
            if (alert.level !== 'low') {
                activeAlerts++;
                maxRisk = Math.max(maxRisk, riskLevels[alert.level]);
            }
        });

        const overallLevel = Object.keys(riskLevels).find(
            key => riskLevels[key] === maxRisk
        ) || 'low';

        return {
            level: overallLevel,
            activeAlerts,
            score: maxRisk,
            description: this.getRiskDescription(overallLevel, activeAlerts)
        };
    }

    /**
     * Generate recommendations based on alerts
     */
    generateRecommendations(alerts) {
        const recommendations = [];

        Object.entries(alerts).forEach(([alertType, alert]) => {
            if (alert.level !== 'low') {
                recommendations.push(...alert.recommendations);
            }
        });

        return recommendations;
    }

    /**
     * Get risk description
     */
    getRiskDescription(level, activeAlerts) {
        const descriptions = {
            low: 'Environmental conditions are normal',
            medium: `Moderate risk detected. ${activeAlerts} alert(s) active`,
            high: `High risk conditions. ${activeAlerts} alert(s) require attention`,
            critical: `Critical environmental threat. Immediate action required`
        };
        return descriptions[level];
    }
}

/**
 * Heatwave Prediction Model
 */
class HeatwavePredictor {
    constructor(thresholds) {
        this.thresholds = thresholds;
    }

    async predict(currentWeather, forecastData) {
        const temperature = currentWeather.temperature;
        const humidity = currentWeather.humidity;
        
        // Calculate heat index
        const heatIndex = this.calculateHeatIndex(temperature, humidity);
        
        // Determine current risk level
        let level = 'low';
        let probability = 0;

        if (heatIndex >= this.thresholds.temperature.critical) {
            level = 'critical';
            probability = 0.9;
        } else if (heatIndex >= this.thresholds.temperature.alert) {
            level = 'high';
            probability = 0.75;
        } else if (heatIndex >= this.thresholds.temperature.warning) {
            level = 'medium';
            probability = 0.6;
        } else {
            probability = 0.1;
        }

        // Check forecast for extended heatwave
        const extendedHeat = this.checkExtendedHeat(forecastData);
        if (extendedHeat.duration >= this.thresholds.duration.alert) {
            level = this.escalateLevel(level);
            probability = Math.min(probability + 0.2, 1.0);
        }

        return {
            type: 'heatwave',
            level,
            probability,
            currentHeatIndex: heatIndex,
            extendedForecast: extendedHeat,
            recommendations: this.getHeatwaveRecommendations(level),
            details: {
                temperature,
                humidity,
                riskFactors: this.identifyHeatRiskFactors(temperature, humidity)
            }
        };
    }

    calculateHeatIndex(temp, humidity) {
        // Simplified heat index calculation
        const hi = -8.78469475556 +
                   1.61139411 * temp +
                   2.33854883889 * humidity +
                   -0.14611605 * temp * humidity +
                   -0.012308094 * temp * temp +
                   -0.0164248277778 * humidity * humidity +
                   0.002211732 * temp * temp * humidity +
                   0.00072546 * temp * humidity * humidity +
                   -0.000003582 * temp * temp * humidity * humidity;
        
        return Math.round(hi * 10) / 10;
    }

    checkExtendedHeat(forecastData) {
        let consecutiveDays = 0;
        let maxConsecutive = 0;

        forecastData.forEach(day => {
            if (day.temperature >= this.thresholds.temperature.warning) {
                consecutiveDays++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
            } else {
                consecutiveDays = 0;
            }
        });

        return {
            duration: maxConsecutive,
            isExtended: maxConsecutive >= this.thresholds.duration.warning
        };
    }

    identifyHeatRiskFactors(temp, humidity) {
        const factors = [];
        
        if (temp > 40) factors.push('Extreme temperature');
        if (humidity < 30) factors.push('Very low humidity increases heat stress');
        if (humidity > 80) factors.push('High humidity prevents cooling');
        
        return factors;
    }

    getHeatwaveRecommendations(level) {
        const recommendations = {
            low: ['Stay hydrated', 'Avoid prolonged sun exposure'],
            medium: [
                'Increase fluid intake',
                'Wear light-colored clothing',
                'Limit outdoor activities during peak hours'
            ],
            high: [
                'Stay indoors during peak hours (10 AM - 4 PM)',
                'Use cooling systems',
                'Check on vulnerable individuals',
                'Avoid strenuous outdoor work'
            ],
            critical: [
                'Emergency heat protocols activated',
                'Mandatory indoor shelter during peak hours',
                'Frequent health monitoring',
                'Suspend all non-essential outdoor activities'
            ]
        };
        return recommendations[level] || recommendations.low;
    }

    escalateLevel(currentLevel) {
        const levels = ['low', 'medium', 'high', 'critical'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    }
}

/**
 * Flood Prediction Model
 */
class FloodPredictor {
    constructor(thresholds) {
        this.thresholds = thresholds;
    }

    async predict(currentWeather, forecastData) {
        const currentRainfall = currentWeather.rainfall || 0;
        
        // Calculate 24-hour rainfall accumulation
        const rainfall24h = this.calculateRainfallAccumulation(currentRainfall, forecastData, 24);
        
        // Calculate rainfall intensity
        const intensity = this.calculateRainfallIntensity(forecastData);
        
        // Estimate soil saturation
        const soilSaturation = this.estimateSoilSaturation(currentWeather, forecastData);
        
        // Determine risk level
        let level = 'low';
        let probability = 0;

        if (rainfall24h >= this.thresholds.rainfall.critical || 
            intensity >= this.thresholds.intensity.critical ||
            soilSaturation >= this.thresholds.soilSaturation.critical) {
            level = 'critical';
            probability = 0.85;
        } else if (rainfall24h >= this.thresholds.rainfall.alert ||
                   intensity >= this.thresholds.intensity.alert ||
                   soilSaturation >= this.thresholds.soilSaturation.alert) {
            level = 'high';
            probability = 0.7;
        } else if (rainfall24h >= this.thresholds.rainfall.warning ||
                   intensity >= this.thresholds.intensity.warning ||
                   soilSaturation >= this.thresholds.soilSaturation.warning) {
            level = 'medium';
            probability = 0.5;
        } else {
            probability = 0.05;
        }

        return {
            type: 'flood',
            level,
            probability,
            rainfall24h,
            intensity,
            soilSaturation,
            recommendations: this.getFloodRecommendations(level),
            details: {
                riskFactors: this.identifyFloodRiskFactors(rainfall24h, intensity, soilSaturation)
            }
        };
    }

    calculateRainfallAccumulation(current, forecast, hours) {
        let total = current;
        const hoursToCheck = Math.min(hours, forecast.length * 24);
        
        forecast.slice(0, Math.ceil(hoursToCheck / 24)).forEach(day => {
            total += day.rainfall || 0;
        });
        
        return total;
    }

    calculateRainfallIntensity(forecastData) {
        if (forecastData.length === 0) return 0;
        
        // Find maximum rainfall in any 6-hour period
        let maxIntensity = 0;
        forecastData.slice(0, 2).forEach(day => {
            const dailyIntensity = (day.rainfall || 0) / 4; // Assume peak 6-hour period
            maxIntensity = Math.max(maxIntensity, dailyIntensity);
        });
        
        return maxIntensity;
    }

    estimateSoilSaturation(currentWeather, forecastData) {
        let saturation = 20; // Base level
        
        // Add current conditions
        saturation += (currentWeather.humidity - 50) * 0.5;
        saturation += (currentWeather.rainfall || 0) * 2;
        
        // Add forecast rainfall
        forecastData.slice(0, 3).forEach(day => {
            saturation += (day.rainfall || 0) * 1.5;
        });
        
        return Math.min(100, Math.max(0, saturation));
    }

    identifyFloodRiskFactors(rainfall, intensity, saturation) {
        const factors = [];
        
        if (rainfall > 100) factors.push('Heavy rainfall accumulation');
        if (intensity > 20) factors.push('High rainfall intensity');
        if (saturation > 80) factors.push('Soil saturation critical');
        
        return factors;
    }

    getFloodRecommendations(level) {
        const recommendations = {
            low: ['Monitor weather updates', 'Clear drainage systems'],
            medium: [
                'Avoid low-lying areas',
                'Prepare emergency supplies',
                'Monitor local water levels'
            ],
            high: [
                'Evacuate flood-prone areas',
                'Avoid traveling through water',
                'Move to higher ground',
                'Keep emergency contacts ready'
            ],
            critical: [
                'Immediate evacuation required',
                'Emergency services activated',
                'Avoid all water bodies',
                'Follow official evacuation orders'
            ]
        };
        return recommendations[level] || recommendations.low;
    }
}

/**
 * Drought Prediction Model
 */
class DroughtPredictor {
    constructor(thresholds) {
        this.thresholds = thresholds;
    }

    async predict(currentWeather, forecastData) {
        const currentRainfall = currentWeather.rainfall || 0;
        
        // Calculate rainfall deficit
        const weeklyRainfall = this.calculateWeeklyRainfall(currentRainfall, forecastData);
        const expectedRainfall = this.getExpectedRainfall();
        const rainfallDeficit = Math.max(0, expectedRainfall - weeklyRainfall);
        
        // Estimate soil moisture
        const soilMoisture = this.estimateSoilMoisture(currentWeather, forecastData);
        
        // Check for extended dry period
        const dryPeriod = this.calculateDryPeriod(forecastData);
        
        // Determine risk level
        let level = 'low';
        let probability = 0;

        if (weeklyRainfall <= this.thresholds.rainfall.critical ||
            soilMoisture <= this.thresholds.soilMoisture.critical ||
            dryPeriod >= this.thresholds.duration.critical) {
            level = 'critical';
            probability = 0.8;
        } else if (weeklyRainfall <= this.thresholds.rainfall.alert ||
                   soilMoisture <= this.thresholds.soilMoisture.alert ||
                   dryPeriod >= this.thresholds.duration.alert) {
            level = 'high';
            probability = 0.65;
        } else if (weeklyRainfall <= this.thresholds.rainfall.warning ||
                   soilMoisture <= this.thresholds.soilMoisture.warning ||
                   dryPeriod >= this.thresholds.duration.warning) {
            level = 'medium';
            probability = 0.4;
        } else {
            probability = 0.1;
        }

        return {
            type: 'drought',
            level,
            probability,
            weeklyRainfall,
            rainfallDeficit,
            soilMoisture,
            dryPeriod,
            recommendations: this.getDroughtRecommendations(level),
            details: {
                riskFactors: this.identifyDroughtRiskFactors(weeklyRainfall, soilMoisture, dryPeriod)
            }
        };
    }

    calculateWeeklyRainfall(current, forecast) {
        let total = current;
        forecast.slice(0, 7).forEach(day => {
            total += day.rainfall || 0;
        });
        return total;
    }

    getExpectedRainfall() {
        const month = new Date().getMonth() + 1;
        // Monsoon months expect higher rainfall
        if (month >= 6 && month <= 9) {
            return 100; // mm per week
        }
        return 25; // mm per week for other months
    }

    estimateSoilMoisture(currentWeather, forecastData) {
        let moisture = 40; // Base level
        
        // Reduce based on temperature
        moisture -= (Math.max(0, currentWeather.temperature - 25)) * 1.5;
        
        // Reduce based on low humidity
        moisture -= Math.max(0, 50 - currentWeather.humidity) * 0.5;
        
        // Add based on recent rainfall
        moisture += (currentWeather.rainfall || 0) * 2;
        
        // Consider forecast
        forecastData.slice(0, 7).forEach(day => {
            moisture += (day.rainfall || 0) * 1;
            moisture -= Math.max(0, day.temperature - 30) * 0.5;
        });
        
        return Math.min(100, Math.max(0, moisture));
    }

    calculateDryPeriod(forecastData) {
        let dryDays = 0;
        let maxDryPeriod = 0;
        
        forecastData.forEach(day => {
            if ((day.rainfall || 0) < 1) {
                dryDays++;
                maxDryPeriod = Math.max(maxDryPeriod, dryDays);
            } else {
                dryDays = 0;
            }
        });
        
        return maxDryPeriod;
    }

    identifyDroughtRiskFactors(rainfall, soilMoisture, dryPeriod) {
        const factors = [];
        
        if (rainfall < 10) factors.push('Severe rainfall deficit');
        if (soilMoisture < 25) factors.push('Critical soil moisture levels');
        if (dryPeriod > 14) factors.push('Extended dry period');
        
        return factors;
    }

    getDroughtRecommendations(level) {
        const recommendations = {
            low: ['Monitor soil moisture', 'Efficient water use'],
            medium: [
                'Implement water conservation',
                'Mulch crops to retain moisture',
                'Adjust irrigation schedules'
            ],
            high: [
                'Strict water rationing',
                'Emergency irrigation if available',
                'Consider drought-resistant crops',
                'Livestock water management'
            ],
            critical: [
                'Emergency water supplies needed',
                'Crop failure mitigation',
                'Alternative water sources',
                'Agricultural emergency protocols'
            ]
        };
        return recommendations[level] || recommendations.low;
    }
}

/**
 * Coastal Hazard Prediction Model
 */
class CoastalHazardPredictor {
    constructor(thresholds) {
        this.thresholds = thresholds;
    }

    async predict(currentWeather, forecastData) {
        const windSpeed = currentWeather.wind_speed || 0;
        const pressure = currentWeather.pressure || 1013;
        
        // Estimate wave height based on wind and pressure
        const waveHeight = this.estimateWaveHeight(windSpeed, pressure);
        
        // Check for storm development
        const stormRisk = this.assessStormRisk(pressure, windSpeed, forecastData);
        
        // Determine risk level
        let level = 'low';
        let probability = 0;

        if (windSpeed >= this.thresholds.windSpeed.critical ||
            pressure <= this.thresholds.pressure.critical ||
            waveHeight >= this.thresholds.waveHeight.critical) {
            level = 'critical';
            probability = 0.9;
        } else if (windSpeed >= this.thresholds.windSpeed.alert ||
                   pressure <= this.thresholds.pressure.alert ||
                   waveHeight >= this.thresholds.waveHeight.alert) {
            level = 'high';
            probability = 0.75;
        } else if (windSpeed >= this.thresholds.windSpeed.warning ||
                   pressure <= this.thresholds.pressure.warning ||
                   waveHeight >= this.thresholds.waveHeight.warning) {
            level = 'medium';
            probability = 0.5;
        } else {
            probability = 0.05;
        }

        return {
            type: 'coastal',
            level,
            probability,
            windSpeed,
            pressure,
            waveHeight,
            stormRisk,
            recommendations: this.getCoastalRecommendations(level),
            details: {
                riskFactors: this.identifyCoastalRiskFactors(windSpeed, pressure, waveHeight)
            }
        };
    }

    estimateWaveHeight(windSpeed, pressure) {
        // Simplified wave height estimation
        const windFactor = Math.pow(windSpeed / 10, 1.5);
        const pressureFactor = Math.max(0, (1013 - pressure) / 20);
        return Math.round((windFactor + pressureFactor) * 10) / 10;
    }

    assessStormRisk(pressure, windSpeed, forecastData) {
        let riskScore = 0;
        
        // Current conditions
        if (pressure < 1000) riskScore += 3;
        else if (pressure < 1010) riskScore += 1;
        
        if (windSpeed > 50) riskScore += 3;
        else if (windSpeed > 30) riskScore += 1;
        
        // Forecast trends
        forecastData.slice(0, 3).forEach(day => {
            if ((day.pressure || 1013) < pressure) riskScore += 1;
            if ((day.wind_speed || 0) > windSpeed) riskScore += 1;
        });
        
        if (riskScore >= 6) return 'high';
        else if (riskScore >= 3) return 'medium';
        else return 'low';
    }

    identifyCoastalRiskFactors(windSpeed, pressure, waveHeight) {
        const factors = [];
        
        if (windSpeed > 60) factors.push('Severe wind conditions');
        if (pressure < 995) factors.push('Low pressure system');
        if (waveHeight > 3) factors.push('Dangerous wave heights');
        
        return factors;
    }

    getCoastalRecommendations(level) {
        const recommendations = {
            low: ['Monitor weather conditions', 'Normal coastal activities'],
            medium: [
                'Avoid small boat operations',
                'Secure loose coastal items',
                'Monitor weather updates closely'
            ],
            high: [
                'Evacuate low-lying coastal areas',
                'Suspend all marine activities',
                'Secure coastal infrastructure',
                'Prepare for storm surge'
            ],
            critical: [
                'Immediate coastal evacuation',
                'Emergency services activated',
                'All marine operations suspended',
                'Storm surge emergency protocols'
            ]
        };
        return recommendations[level] || recommendations.low;
    }
}

module.exports = AlertPredictor;