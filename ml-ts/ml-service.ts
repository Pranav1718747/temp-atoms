/**
 * Advanced Machine Learning Service Orchestrator
 * Main service that coordinates all ML models with dependency injection
 */

import * as _ from 'lodash';
import {
  WeatherData,
  WeatherPrediction,
  CropRecommendation,
  AlertPrediction,
  ModelPredictionResult,
  MLPredictionRecord,
  Season,
  AlertRiskAssessment,
  InsufficientDataError,
  ModelNotInitializedError
} from './types';
import { PerformanceMonitor } from './utils';
import { WeatherPredictionService } from './models/weather-predictor';
import { AdvancedCropRecommender } from './models/crop-recommender';
import { AlertPredictionService } from './models/alert-predictor';

/**
 * Database interface for ML service
 */
interface MLDatabase {
  insertWeatherData(data: any): void;
  getWeatherHistory(cityName: string, days: number): WeatherData[];
  getLatestWeather(cityName: string): WeatherData | null;
  getCityByName(cityName: string): { id: number; name: string; imd_id?: number } | null;
  getAllCities(): Array<{ id: number; name: string; imd_id?: number }>;
  db: {
    prepare(sql: string): {
      run(...params: any[]): any;
      get(...params: any[]): any;
      all(...params: any[]): any[];
    };
    exec(sql: string): void;
  };
}

/**
 * External API interface
 */
interface ExternalAPI {
  getComprehensiveWeather(cityName: string, cityId?: number): Promise<any>;
}

/**
 * Advanced ML Service with dependency injection and orchestration
 */
export class AdvancedMLService {
  private weatherPredictor: WeatherPredictionService;
  private cropRecommender: AdvancedCropRecommender;
  private alertPredictor: AlertPredictionService;
  
  private database: MLDatabase;
  private externalAPI: ExternalAPI | null;
  private isInitialized = false;
  
  // Background task intervals
  private predictionUpdateInterval: NodeJS.Timeout | null = null;
  private modelRetrainingInterval: NodeJS.Timeout | null = null;

  constructor(database: MLDatabase, externalAPI?: ExternalAPI) {
    this.database = database;
    this.externalAPI = externalAPI || null;
    
    // Initialize ML services
    this.weatherPredictor = new WeatherPredictionService();
    this.cropRecommender = new AdvancedCropRecommender();
    this.alertPredictor = new AlertPredictionService();
  }

  /**
   * Initialize all ML models and services
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Advanced ML Service...');
      
      // Create ML database tables
      this.createMLTables();
      
      // Initialize all ML models in parallel
      await Promise.all([
        this.weatherPredictor.initialize(),
        this.cropRecommender.initialize(),
        this.alertPredictor.initialize()
      ]);

      this.isInitialized = true;
      console.log('✅ Advanced ML Service initialized successfully');
      
      // Start background tasks
      this.startBackgroundTasks();
      
    } catch (error) {
      console.error('❌ Error initializing Advanced ML Service:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive weather predictions with enhanced ML algorithms
   */
  async getWeatherPredictions(
    cityName: string, 
    days: number = 7, 
    currentWeather?: WeatherData
  ): Promise<ModelPredictionResult<WeatherPrediction>> {
    if (!this.isInitialized) {
      throw new ModelNotInitializedError('AdvancedMLService');
    }

    try {
      console.log(`🌤️ Generating weather predictions for ${cityName}...`);
      
      // Use external API data if available
      let enhancedWeatherData = currentWeather;
      if (!enhancedWeatherData && this.externalAPI) {
        try {
          const apiResponse = await this.externalAPI.getComprehensiveWeather(cityName);
          if (apiResponse?.openMeteoData?.data) {
            enhancedWeatherData = this.convertToWeatherData(apiResponse.openMeteoData.data);
          }
        } catch (error) {
          console.warn('External API unavailable, using historical data');
        }
      }

      // Get predictions from weather service
      const predictions = await this.weatherPredictor.predictWeather(
        cityName, 
        days, 
        enhancedWeatherData
      );

      // Store predictions in database
      this.storePrediction(cityName, predictions, 'weather');

      return {
        ...predictions,
        metadata: {
          ...predictions.metadata,
          enhancedWithExternalAPI: !!enhancedWeatherData,
          mlServiceVersion: '2.0.0'
        }
      };

    } catch (error) {
      console.error(`Error getting weather predictions for ${cityName}:`, error);
      throw error;
    }
  }

  /**
   * Get advanced crop recommendations using ML algorithms
   */
  async getCropRecommendations(
    cityName: string, 
    season?: Season
  ): Promise<ModelPredictionResult<CropRecommendation>> {
    if (!this.isInitialized) {
      throw new ModelNotInitializedError('AdvancedMLService');
    }

    try {
      console.log(`🌾 Generating crop recommendations for ${cityName}...`);

      // Get latest weather data
      const latestWeather = this.database.getLatestWeather(cityName);
      if (!latestWeather) {
        throw new InsufficientDataError(1, 0);
      }

      // Get crop recommendations
      const recommendations = await this.cropRecommender.recommendCrops(
        latestWeather, 
        season
      );

      // Store recommendations in database
      this.storePrediction(cityName, recommendations, 'crop');

      return recommendations;

    } catch (error) {
      console.error(`Error getting crop recommendations for ${cityName}:`, error);
      throw error;
    }
  }

  /**
   * Get alert predictions using ensemble methods
   */
  async getAlertPredictions(
    cityName: string
  ): Promise<ModelPredictionResult<AlertPrediction>> {
    if (!this.isInitialized) {
      throw new ModelNotInitializedError('AdvancedMLService');
    }

    try {
      console.log(`🚨 Generating alert predictions for ${cityName}...`);

      // Get current weather data
      const currentWeather = this.database.getLatestWeather(cityName);
      if (!currentWeather) {
        throw new InsufficientDataError(1, 0);
      }

      // Get weather forecast for enhanced alert prediction
      let forecastData: WeatherPrediction[] = [];
      try {
        const weatherPredictions = await this.getWeatherPredictions(cityName, 3);
        forecastData = weatherPredictions.predictions;
      } catch (error) {
        console.warn('Could not get weather forecast for alerts');
      }

      // Get alert predictions
      const alerts = await this.alertPredictor.predictAlerts(
        currentWeather, 
        forecastData
      );

      // Store alerts in database
      this.storePrediction(cityName, alerts, 'alert');

      return alerts;

    } catch (error) {
      console.error(`Error getting alert predictions for ${cityName}:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive ML insights for a city
   */
  async getComprehensiveInsights(cityName: string): Promise<{
    weather: ModelPredictionResult<WeatherPrediction>;
    crops: ModelPredictionResult<CropRecommendation>;
    alerts: ModelPredictionResult<AlertPrediction>;
    summary: {
      overallConditions: string;
      keyInsights: string[];
      recommendations: string[];
      riskLevel: string;
    };
    generatedAt: string;
  }> {
    if (!this.isInitialized) {
      throw new ModelNotInitializedError('AdvancedMLService');
    }

    try {
      console.log(`📊 Generating comprehensive insights for ${cityName}...`);

      const { result, duration } = await PerformanceMonitor.measureAsync(
        `comprehensive-insights-${cityName}`,
        async () => {
          // Get all predictions in parallel
          const [weather, crops, alerts] = await Promise.allSettled([
            this.getWeatherPredictions(cityName, 7),
            this.getCropRecommendations(cityName),
            this.getAlertPredictions(cityName)
          ]);

          const weatherResult = weather.status === 'fulfilled' ? weather.value : null;
          const cropsResult = crops.status === 'fulfilled' ? crops.value : null;
          const alertsResult = alerts.status === 'fulfilled' ? alerts.value : null;

          return {
            weather: weatherResult || { predictions: [], confidence: 0, modelType: 'Error', generatedAt: new Date().toISOString() },
            crops: cropsResult || { predictions: [], confidence: 0, modelType: 'Error', generatedAt: new Date().toISOString() },
            alerts: alertsResult || { predictions: [], confidence: 0, modelType: 'Error', generatedAt: new Date().toISOString() },
            summary: this.generateInsightsSummary(weatherResult, cropsResult, alertsResult)
          };
        }
      );

      console.log(`Comprehensive insights generated in ${duration}ms`);

      return {
        ...result,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error getting comprehensive insights for ${cityName}:`, error);
      throw error;
    }
  }

  /**
   * Assess overall risk for a city
   */
  async assessRisk(cityName: string): Promise<AlertRiskAssessment> {
    return await this.alertPredictor.assessRisk(cityName);
  }

  /**
   * Get ML performance metrics
   */
  getPerformanceMetrics(): {
    models: {
      weather: any;
      crop: any;
      alert: any;
    };
    predictions: any[];
    systemStatus: string;
  } {
    try {
      const stmt = this.database.db.prepare(`
        SELECT 
          prediction_type,
          COUNT(*) as total_predictions,
          AVG(confidence) as avg_confidence,
          MAX(generated_at) as last_updated
        FROM ml_predictions 
        WHERE valid_until > datetime('now')
        GROUP BY prediction_type
      `);
      
      const predictions = stmt.all();
      
      return {
        models: {
          weather: this.weatherPredictor.getModelMetrics(),
          crop: { isInitialized: this.isInitialized },
          alert: { isInitialized: this.isInitialized }
        },
        predictions,
        systemStatus: this.isInitialized ? 'operational' : 'initializing'
      };
      
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        models: { weather: {}, crop: {}, alert: {} },
        predictions: [],
        systemStatus: 'error'
      };
    }
  }

  /**
   * Train models with new data
   */
  async trainModels(historicalData: WeatherData[][]): Promise<void> {
    if (historicalData.length === 0) {
      throw new InsufficientDataError(1, 0);
    }

    console.log('🎓 Training ML models with new data...');
    
    try {
      await Promise.allSettled([
        this.weatherPredictor.trainModel(historicalData),
        // Crop and alert models training would be implemented based on specific requirements
      ]);
      
      console.log('✅ ML models training completed');
    } catch (error) {
      console.error('❌ Error training models:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Advanced ML Service...');
    
    if (this.predictionUpdateInterval) {
      clearInterval(this.predictionUpdateInterval);
    }
    
    if (this.modelRetrainingInterval) {
      clearInterval(this.modelRetrainingInterval);
    }
    
    console.log('✅ Advanced ML Service shut down successfully');
  }

  /**
   * Private helper methods
   */

  private generateInsightsSummary(
    weather: any, 
    crops: any, 
    alerts: any
  ): {
    overallConditions: string;
    keyInsights: string[];
    recommendations: string[];
    riskLevel: string;
  } {
    const summary = {
      overallConditions: 'normal',
      keyInsights: [] as string[],
      recommendations: [] as string[],
      riskLevel: 'low'
    };

    // Weather insights
    if (weather?.predictions?.length > 0) {
      const avgTemp = _.mean(weather.predictions.map((p: any) => p.temperature));
      if (avgTemp > 35) {
        summary.keyInsights.push('High temperatures expected this week');
        summary.overallConditions = 'concerning';
      }
    }

    // Crop insights
    if (crops?.predictions?.length > 0) {
      const topCrop = crops.predictions[0];
      summary.keyInsights.push(`${topCrop.name} shows highest suitability (${topCrop.suitabilityScore}%)`);
      summary.recommendations.push(`Consider cultivating ${topCrop.name}`);
    }

    // Alert insights
    if (alerts?.predictions?.length > 0) {
      summary.riskLevel = 'medium';
      summary.keyInsights.push(`${alerts.predictions.length} weather alert(s) detected`);
      summary.overallConditions = 'alert';
    }

    return summary;
  }

  private storePrediction(
    cityName: string, 
    predictions: any, 
    type: 'weather' | 'crop' | 'alert'
  ): void {
    try {
      const cityInfo = this.database.getCityByName(cityName);
      if (!cityInfo) return;

      const predictionData: MLPredictionRecord = {
        cityId: cityInfo.id,
        cityName: cityName,
        predictionType: type,
        predictionData: JSON.stringify(predictions),
        confidence: predictions.confidence || 0,
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        modelVersion: '2.0.0',
        metadata: JSON.stringify(predictions.metadata || {})
      };

      const stmt = this.database.db.prepare(`
        INSERT OR REPLACE INTO ml_predictions 
        (city_id, city_name, prediction_type, prediction_data, confidence, generated_at, valid_until, model_version, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        predictionData.cityId,
        predictionData.cityName,
        predictionData.predictionType,
        predictionData.predictionData,
        predictionData.confidence,
        predictionData.generatedAt,
        predictionData.validUntil,
        predictionData.modelVersion,
        predictionData.metadata
      );

    } catch (error) {
      console.error('Error storing prediction:', error);
    }
  }

  private convertToWeatherData(apiData: any): WeatherData {
    return {
      temperature: apiData.main?.temp || 25,
      humidity: apiData.main?.humidity || 60,
      rainfall: apiData.rain?.['1h'] || 0,
      pressure: apiData.main?.pressure || 1013,
      windSpeed: apiData.wind?.speed,
      windDirection: apiData.wind?.deg,
      visibility: apiData.visibility,
      uvIndex: apiData.uv_index,
      cloudCover: apiData.clouds?.all,
      recordedAt: new Date().toISOString()
    };
  }

  private createMLTables(): void {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ml_predictions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          city_id INTEGER,
          city_name TEXT NOT NULL,
          prediction_type TEXT NOT NULL,
          prediction_data TEXT NOT NULL,
          confidence REAL DEFAULT 0,
          generated_at TEXT NOT NULL,
          valid_until TEXT NOT NULL,
          model_version TEXT DEFAULT '2.0.0',
          metadata TEXT,
          UNIQUE(city_name, prediction_type)
        )
      `;
      
      this.database.db.exec(createTableSQL);
      
      // Create indexes
      this.database.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_ml_city_type 
        ON ml_predictions(city_name, prediction_type)
      `);
      
      console.log('✅ ML database tables created/verified');
      
    } catch (error) {
      console.error('❌ Error creating ML tables:', error);
      throw error;
    }
  }

  private startBackgroundTasks(): void {
    console.log('🔄 Starting ML background tasks...');
    
    // Update predictions every 6 hours
    this.predictionUpdateInterval = setInterval(async () => {
      await this.updatePredictionsForAllCities();
    }, 6 * 60 * 60 * 1000);

    // Retrain models daily
    this.modelRetrainingInterval = setInterval(async () => {
      await this.retrainModelsWithLatestData();
    }, 24 * 60 * 60 * 1000);

    // Initial update after 30 seconds
    setTimeout(() => {
      this.updatePredictionsForAllCities();
    }, 30000);
  }

  private async updatePredictionsForAllCities(): Promise<void> {
    try {
      console.log('🔄 Updating ML predictions for all cities...');
      
      const cities = this.database.getAllCities().slice(0, 10);
      
      for (const city of cities) {
        try {
          await Promise.allSettled([
            this.getCropRecommendations(city.name),
            this.getAlertPredictions(city.name)
          ]);
          
          // Add delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error updating predictions for ${city.name}:`, error);
        }
      }
      
      console.log('✅ ML predictions updated for all cities');
      
    } catch (error) {
      console.error('❌ Error in background prediction update:', error);
    }
  }

  private async retrainModelsWithLatestData(): Promise<void> {
    try {
      console.log('🎓 Retraining models with latest data...');
      
      // Get latest weather data from all cities
      const cities = this.database.getAllCities();
      const historicalData: WeatherData[][] = [];
      
      for (const city of cities) {
        const cityData = this.database.getWeatherHistory(city.name, 30);
        if (cityData.length > 10) {
          historicalData.push(cityData);
        }
      }
      
      if (historicalData.length > 0) {
        await this.trainModels(historicalData);
      }
      
      console.log('✅ Model retraining completed');
      
    } catch (error) {
      console.error('❌ Error in model retraining:', error);
    }
  }
}