import { Router, Request, Response } from 'express';

// Type definitions for better API safety
interface WeatherRequest {
  city?: string;
  cityId?: number;
  includeHourly?: boolean;
  includeDaily?: boolean;
  includeForecast?: boolean;
}

interface WeatherQueryParams {
  city?: string;
  cityId?: string;
  days?: string;
  hours?: string;
  includeAlerts?: string;
}

interface WeatherResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  source: string;
  metadata?: {
    processingTime: number;
    cacheHit: boolean;
    dataAge: number;
  };
}

interface HistoricalWeatherRequest {
  city: string;
  startDate: string;
  endDate: string;
  parameters?: string[];
}

/**
 * Enhanced TypeScript Weather Router
 * Provides type-safe weather data APIs with improved error handling
 */
class WeatherRouter {
  private router: Router;
  private climateAPI: any;
  private climateDB: any;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Initialize the router with service dependencies
   */
  public initialize(climateAPI: any, climateDB: any): void {
    this.climateAPI = climateAPI;
    this.climateDB = climateDB;
  }

  /**
   * Setup all weather-related routes with type safety
   */
  private setupRoutes(): void {
    // Current weather endpoint
    this.router.get('/current/:city', this.getCurrentWeather.bind(this));
    
    // Weather by city ID
    this.router.get('/city/:cityId', this.getWeatherByCityId.bind(this));
    
    // Comprehensive weather data
    this.router.get('/comprehensive/:city', this.getComprehensiveWeather.bind(this));
    
    // Weather forecast
    this.router.get('/forecast/:city', this.getWeatherForecast.bind(this));
    
    // Historical weather data
    this.router.get('/history/:city', this.getHistoricalWeather.bind(this));
    this.router.post('/history', this.getHistoricalWeatherPost.bind(this));
    
    // Weather alerts for city
    this.router.get('/alerts/:city', this.getWeatherAlerts.bind(this));
    
    // Bulk weather data
    this.router.post('/bulk', this.getBulkWeatherData.bind(this));
    
    // Weather statistics
    this.router.get('/stats/:city', this.getWeatherStatistics.bind(this));
    
    // Available cities
    this.router.get('/cities', this.getAvailableCities.bind(this));
    
    // Health check
    this.router.get('/health', this.getHealthStatus.bind(this));
  }

  /**
   * Get current weather for a city with enhanced error handling
   */
  private async getCurrentWeather(req: Request<{ city: string }, WeatherResponse, {}, WeatherQueryParams>, res: Response<WeatherResponse>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { city } = req.params;
      const { includeAlerts } = req.query;
      
      if (!city || typeof city !== 'string') {
        res.status(400).json({
          success: false,
          error: 'City name is required and must be a string',
          timestamp: new Date().toISOString(),
          source: 'validation'
        });
        return;
      }

      // Get city information from database
      const cityInfo = this.climateDB?.getCityByName(city);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found in database`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      // Fetch weather data
      const weatherData = await this.climateAPI?.getCurrentWeather(city, cityInfo.imd_id);
      
      if (!weatherData) {
        res.status(503).json({
          success: false,
          error: 'Weather service temporarily unavailable',
          timestamp: new Date().toISOString(),
          source: 'external_api'
        });
        return;
      }

      // Include alerts if requested
      let alerts: any[] | null = null;
      if (includeAlerts === 'true') {
        try {
          alerts = await this.getActiveAlertsForCity(cityInfo.id);
        } catch (alertError) {
          console.warn('Failed to fetch alerts:', alertError);
        }
      }

      const processingTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          weather: weatherData,
          city: cityInfo,
          alerts: alerts
        },
        timestamp: new Date().toISOString(),
        source: 'live_api',
        metadata: {
          processingTime,
          cacheHit: false,
          dataAge: 0
        }
      });

    } catch (error) {
      console.error('Error fetching current weather:', error);
      const processingTime = Date.now() - startTime;
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error',
        metadata: {
          processingTime,
          cacheHit: false,
          dataAge: 0
        }
      });
    }
  }

  /**
   * Get weather by city ID with type safety
   */
  private async getWeatherByCityId(req: Request<{ cityId: string }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId, 10);
      
      if (isNaN(cityId)) {
        res.status(400).json({
          success: false,
          error: 'City ID must be a valid number',
          timestamp: new Date().toISOString(),
          source: 'validation'
        });
        return;
      }

      const cityInfo = this.climateDB?.getCityById(cityId);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City with ID ${cityId} not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const weatherData = await this.climateAPI?.getCurrentWeather(cityInfo.name, cityInfo.imd_id);
      
      res.json({
        success: true,
        data: {
          weather: weatherData,
          city: cityInfo
        },
        timestamp: new Date().toISOString(),
        source: 'live_api'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get comprehensive weather data
   */
  private async getComprehensiveWeather(req: Request<{ city: string }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city } = req.params;
      const cityInfo = this.climateDB?.getCityByName(city);
      
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const comprehensiveData = await this.climateAPI?.getComprehensiveWeather(city, cityInfo.imd_id);
      
      res.json({
        success: true,
        data: comprehensiveData,
        timestamp: new Date().toISOString(),
        source: 'comprehensive_api'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get weather forecast with enhanced parameters
   */
  private async getWeatherForecast(req: Request<{ city: string }, WeatherResponse, {}, WeatherQueryParams>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city } = req.params;
      const { days = '7', hours } = req.query;
      
      const forecastDays = Math.min(Math.max(parseInt(days, 10) || 7, 1), 14);
      const forecastHours = hours ? Math.min(Math.max(parseInt(hours, 10) || 0, 0), 48) : undefined;

      const cityInfo = this.climateDB?.getCityByName(city);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const forecastData = await this.climateAPI?.getWeatherForecast(city, cityInfo.imd_id, {
        days: forecastDays,
        hours: forecastHours
      });
      
      res.json({
        success: true,
        data: {
          forecast: forecastData,
          city: cityInfo,
          parameters: {
            days: forecastDays,
            hours: forecastHours
          }
        },
        timestamp: new Date().toISOString(),
        source: 'forecast_api'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get historical weather data
   */
  private async getHistoricalWeather(req: Request<{ city: string }, WeatherResponse, {}, { startDate?: string; endDate?: string; limit?: string }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city } = req.params;
      const { startDate, endDate, limit = '100' } = req.query;

      const cityInfo = this.climateDB?.getCityByName(city);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const limitNum = Math.min(parseInt(limit, 10) || 100, 1000);
      
      const historicalData = this.climateDB?.getHistoricalWeather(cityInfo.id, {
        startDate,
        endDate,
        limit: limitNum
      });

      res.json({
        success: true,
        data: {
          historical: historicalData,
          city: cityInfo,
          count: historicalData?.length || 0
        },
        timestamp: new Date().toISOString(),
        source: 'database'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * POST endpoint for complex historical weather queries
   */
  private async getHistoricalWeatherPost(req: Request<{}, WeatherResponse, HistoricalWeatherRequest>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city, startDate, endDate, parameters } = req.body;

      if (!city || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'City, startDate, and endDate are required',
          timestamp: new Date().toISOString(),
          source: 'validation'
        });
        return;
      }

      const cityInfo = this.climateDB?.getCityByName(city);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const historicalData = this.climateDB?.getHistoricalWeatherAdvanced(cityInfo.id, {
        startDate,
        endDate,
        parameters: parameters || ['temperature', 'humidity', 'rainfall', 'pressure']
      });

      res.json({
        success: true,
        data: {
          historical: historicalData,
          city: cityInfo,
          query: { startDate, endDate, parameters }
        },
        timestamp: new Date().toISOString(),
        source: 'database_advanced'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get weather alerts for a city
   */
  private async getWeatherAlerts(req: Request<{ city: string }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city } = req.params;
      const cityInfo = this.climateDB?.getCityByName(city);
      
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const alerts = await this.getActiveAlertsForCity(cityInfo.id);
      
      res.json({
        success: true,
        data: {
          alerts,
          city: cityInfo,
          count: alerts.length
        },
        timestamp: new Date().toISOString(),
        source: 'alert_system'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get available cities
   */
  private async getAvailableCities(req: Request, res: Response<WeatherResponse>): Promise<void> {
    try {
      const cities = this.climateDB?.getAllCities() || [];
      
      res.json({
        success: true,
        data: {
          cities,
          count: cities.length
        },
        timestamp: new Date().toISOString(),
        source: 'database'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Weather service health check
   */
  private async getHealthStatus(req: Request, res: Response<WeatherResponse>): Promise<void> {
    try {
      const status = {
        weatherAPI: this.climateAPI ? 'available' : 'unavailable',
        database: this.climateDB ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
        source: 'health_check'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Bulk weather data endpoint
   */
  private async getBulkWeatherData(req: Request<{}, WeatherResponse, { cities: string[] }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { cities } = req.body;

      if (!Array.isArray(cities) || cities.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Cities array is required and must not be empty',
          timestamp: new Date().toISOString(),
          source: 'validation'
        });
        return;
      }

      if (cities.length > 50) {
        res.status(400).json({
          success: false,
          error: 'Maximum 50 cities allowed per request',
          timestamp: new Date().toISOString(),
          source: 'validation'
        });
        return;
      }

      const results = await Promise.allSettled(
        cities.map(async (city) => {
          const cityInfo = this.climateDB?.getCityByName(city);
          if (!cityInfo) return { city, error: 'City not found' };

          const weather = await this.climateAPI?.getCurrentWeather(city, cityInfo.imd_id);
          return { city, weather, cityInfo };
        })
      );

      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      res.json({
        success: true,
        data: {
          results: successfulResults,
          errors: errors,
          total: cities.length,
          successful: successfulResults.length,
          failed: errors.length
        },
        timestamp: new Date().toISOString(),
        source: 'bulk_api'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Get weather statistics for a city
   */
  private async getWeatherStatistics(req: Request<{ city: string }, WeatherResponse, {}, { days?: string }>, res: Response<WeatherResponse>): Promise<void> {
    try {
      const { city } = req.params;
      const { days = '30' } = req.query;

      const cityInfo = this.climateDB?.getCityByName(city);
      if (!cityInfo) {
        res.status(404).json({
          success: false,
          error: `City '${city}' not found`,
          timestamp: new Date().toISOString(),
          source: 'database'
        });
        return;
      }

      const dayCount = Math.min(parseInt(days, 10) || 30, 365);
      const statistics = this.climateDB?.getWeatherStatistics(cityInfo.id, dayCount);

      res.json({
        success: true,
        data: {
          statistics,
          city: cityInfo,
          period: `${dayCount} days`
        },
        timestamp: new Date().toISOString(),
        source: 'database_analytics'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        source: 'server_error'
      });
    }
  }

  /**
   * Helper method to get active alerts for a city
   */
  private async getActiveAlertsForCity(cityId: number): Promise<any[]> {
    try {
      return this.climateDB?.getActiveAlerts(cityId) || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  /**
   * Get the Express router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}

// Create router instance
const weatherRouterInstance = new WeatherRouter();

// Export for backward compatibility with existing JavaScript code
export const router = weatherRouterInstance.getRouter();
export const initializeRouter = (climateAPI: any, climateDB: any) => {
  weatherRouterInstance.initialize(climateAPI, climateDB);
};

// Export the class for more advanced usage
export { WeatherRouter };
export default WeatherRouter;