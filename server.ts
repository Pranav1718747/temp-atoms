import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import existing JavaScript modules (to be migrated gradually)
const ClimateAPIService = require('./utils/climateAPIs');
const ClimateDB = require('./database/db');
const AlertService = require('./services/alertService');
const FarmingService = require('./services/farmingService');
const MLService = require('./ml/ml_service');

// Import TypeScript ML bridge
const { 
  initializeAdvancedML, 
  getAdvancedWeatherPredictions,
  getAdvancedCropRecommendations,
  getAdvancedAlertPredictions,
  getComprehensiveInsights,
  getMLHealthStatus
} = require('./ml-ts/bridge.js');

// Import route modules
const { router: weatherRouter, initializeRouter } = require('./routes/weather');
const { router: alertRouter, initializeAlertRouter } = require('./routes/alerts');
const { router: farmingRouter, initializeFarmingRouter } = require('./routes/farming');
const { router: mlRouter, initializeMLRouter } = require('./routes/ml');
const mlAdvancedRouter = require('./routes/ml-advanced');

// Load environment variables
dotenv.config();

// Type definitions for server configuration
interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
  staticPath: string;
}

interface WeatherData {
  city_name: string;
  city_id: number;
  temperature: number;
  feels_like?: number;
  temp_min?: number;
  temp_max?: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  wind_speed?: number;
  wind_direction?: number;
  wind_gust?: number;
  visibility?: number;
  uv_index?: number;
  cloud_cover?: number;
  dew_point?: number;
  heat_index?: number;
  wind_chill?: number;
  soil_temperature?: number;
  soil_moisture?: number;
  evapotranspiration?: number;
  growing_degree_days?: number;
  air_quality_pm25?: number;
  air_quality_pm10?: number;
  air_quality_index?: number;
  pressure_trend?: string;
  moon_phase?: number;
  moon_illumination?: number;
  weather_description: string;
  weather_condition: string;
  data_source: string;
  sunrise?: number;
  sunset?: number;
  is_day?: boolean;
  sunshine_duration?: number;
}

interface CityInfo {
  id: number;
  name: string;
  imd_id: number;
}

interface SocketSubscription {
  socket_id: string;
  city_id: number;
  city_name: string;
  alert_types: string[];
}

/**
 * Enhanced TypeScript Climate Sync Server
 * Provides type-safe APIs for weather monitoring, farming assistance, and ML-powered insights
 */
class ClimateServer {
  private app: Application;
  private server: HTTPServer;
  private io: SocketIOServer;
  private config: ServerConfig;
  
  // Service instances
  private climateAPI: any;
  private climateDB: any;
  private alertService: any;
  private farmingService: any;
  private mlService: any;
  
  // Server state
  private cities: string[] = [];
  private cityIds: Record<string, number> = {};
  private advancedMLInitialized: boolean = false;
  private weatherUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.config = {
      port: parseInt(process.env.PORT || '4002', 10),
      host: process.env.HOST || 'localhost',
      corsOrigin: process.env.CORS_ORIGIN || '*',
      staticPath: path.join(__dirname, 'frontend')
    };

    this.initializeMiddleware();
    this.initializeServices();
    this.initializeRoutes();
    this.initializeSocketHandlers();
  }

  /**
   * Initialize Express middleware with type safety
   */
  private initializeMiddleware(): void {
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Serve static frontend files
    this.app.use(express.static(this.config.staticPath));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  /**
   * Initialize all backend services
   */
  private async initializeServices(): Promise<void> {
    try {
      console.log('🔧 Initializing backend services...');
      
      // Initialize core services
      this.climateAPI = new ClimateAPIService();
      this.climateDB = new ClimateDB();
      this.alertService = new AlertService(this.climateDB, this.io);
      this.farmingService = new FarmingService(this.climateDB);
      this.mlService = new MLService(this.climateDB, this.climateAPI);

      // Initialize Advanced TypeScript ML Service
      try {
        await initializeAdvancedML(this.climateDB, this.climateAPI);
        this.advancedMLInitialized = true;
        console.log('🚀 Advanced TypeScript ML Service initialized successfully!');
      } catch (error) {
        console.error('❌ Failed to initialize Advanced TypeScript ML Service:', error);
      }

      // Load cities from database
      this.loadCitiesFromDB();
      
      console.log('✅ All backend services initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing services:', error);
      throw error;
    }
  }

  /**
   * Initialize API routes with type safety
   */
  private initializeRoutes(): void {
    // Initialize route handlers with shared instances
    initializeRouter(this.climateAPI, this.climateDB);
    initializeAlertRouter(this.alertService);
    initializeFarmingRouter(this.farmingService, this.climateDB, this.climateAPI);
    initializeMLRouter(this.mlService);

    // Mount API routes
    this.app.use('/api/weather', weatherRouter);
    this.app.use('/api/alerts', alertRouter);
    this.app.use('/api/farming', farmingRouter);
    this.app.use('/api/ml', mlRouter);
    this.app.use('/api/ml-advanced', mlAdvancedRouter);

    // Health check endpoint with enhanced information
    this.app.get('/api/health', (req: Request, res: Response) => {
      const healthStatus = {
        status: 'healthy',
        message: 'ClimateSync backend is running!',
        timestamp: new Date().toISOString(),
        version: '2.0.0-ts',
        services: {
          database: this.climateDB ? 'connected' : 'disconnected',
          weatherAPI: this.climateAPI ? 'available' : 'unavailable',
          advancedML: this.advancedMLInitialized ? 'initialized' : 'pending',
          monitoredCities: this.cities.length,
          activeConnections: this.io.engine.clientsCount || 0
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      };
      
      res.json(healthStatus);
    });

    // API documentation endpoint
    this.app.get('/api/docs', (req: Request, res: Response) => {
      res.json({
        title: 'ClimateSync API Documentation',
        version: '2.0.0-ts',
        description: 'TypeScript-enhanced APIs for climate monitoring and smart farming',
        endpoints: {
          '/api/health': 'GET - Server health status',
          '/api/weather': 'Weather data and forecasting',
          '/api/alerts': 'Climate alert management',
          '/api/farming': 'Smart farming recommendations',
          '/api/ml': 'Legacy machine learning services',
          '/api/ml-advanced': 'Advanced TypeScript ML services'
        },
        websocket: {
          events: ['subscribe_weather', 'weather_update', 'alert_notification'],
          description: 'Real-time weather updates and alerts'
        }
      });
    });

    // Frontend routes
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(this.config.staticPath, 'index.html'));
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ['/api/health', '/api/docs', '/api/weather', '/api/alerts', '/api/farming', '/api/ml', '/api/ml-advanced']
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      console.error('Global error handler:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize WebSocket handlers with type safety
   */
  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected via WebSocket: ${socket.id}`);

      socket.on('subscribe_weather', (city: string) => {
        if (!city || typeof city !== 'string') {
          socket.emit('error', { message: 'Invalid city name' });
          return;
        }

        console.log(`User ${socket.id} subscribed to ${city} weather`);
        socket.join(`weather_${city}`);
        
        // Save subscription to database with error handling
        try {
          const cityInfo: CityInfo | null = this.climateDB.getCityByName(city);
          if (cityInfo) {
            this.alertService.subscribeToAlerts(
              socket.id, 
              cityInfo.id, 
              city, 
              ['FLOOD', 'HEAT', 'DROUGHT', 'STORM']
            );
            
            // Send immediate weather update
            this.sendCurrentWeatherToSocket(socket, city);
          } else {
            socket.emit('error', { message: `City ${city} not found` });
          }
        } catch (error) {
          console.error('Error subscribing to alerts:', error);
          socket.emit('error', { message: 'Failed to subscribe to weather updates' });
        }
      });

      socket.on('unsubscribe_weather', (city: string) => {
        if (city && typeof city === 'string') {
          console.log(`User ${socket.id} unsubscribed from ${city} weather`);
          socket.leave(`weather_${city}`);
        }
      });

      socket.on('get_ml_status', () => {
        socket.emit('ml_status', {
          advancedML: this.advancedMLInitialized,
          legacyML: this.mlService ? true : false,
          availableModels: this.advancedMLInitialized ? [
            'weather_prediction', 'crop_recommendation', 'alert_prediction',
            'soil_monitoring', 'irrigation_optimization', 'energy_management',
            'market_intelligence', 'pest_disease_prediction', 'seasonal_planning',
            'air_quality_prediction', 'resource_management', 'climate_adaptation'
          ] : ['legacy_models']
        });
      });

      socket.on('disconnect', (reason: string) => {
        console.log(`User ${socket.id} disconnected: ${reason}`);
        // Clean up alert subscriptions for this socket
        try {
          this.climateDB.db.prepare('DELETE FROM alert_subscriptions WHERE socket_id = ?').run(socket.id);
        } catch (error) {
          console.error('Error cleaning up subscriptions:', error);
        }
      });

      socket.on('error', (error: Error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Load cities from database with error handling
   */
  private loadCitiesFromDB(): void {
    try {
      const allCities: CityInfo[] = this.climateDB.getAllCities();
      this.cities = allCities.slice(0, 10).map(city => city.name);
      this.cityIds = {};
      
      allCities.forEach(city => {
        this.cityIds[city.name] = city.imd_id;
      });
      
      console.log(`Loaded ${this.cities.length} cities for weather monitoring:`, this.cities);
      console.log(`Total cities available: ${allCities.length}`);
    } catch (error) {
      console.error('Error loading cities from database:', error);
      // Fallback to default cities
      this.cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata'];
      this.cityIds = { 
        Delhi: 42182, 
        Mumbai: 43003, 
        Chennai: 43279, 
        Bangalore: 43295, 
        Kolkata: 42809 
      };
      console.log('Using fallback cities:', this.cities);
    }
  }

  /**
   * Send current weather data to a specific socket
   */
  private async sendCurrentWeatherToSocket(socket: any, city: string): Promise<void> {
    try {
      const cityId = this.cityIds[city];
      if (!cityId) return;

      const weather = await this.climateAPI.getComprehensiveWeather(city, cityId);
      if (weather) {
        socket.emit('weather_update', {
          city,
          data: weather,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error sending weather data for ${city}:`, error);
    }
  }

  /**
   * Start periodic weather updates
   */
  private startWeatherUpdates(): void {
    // Fetch weather every 30 minutes
    this.weatherUpdateInterval = setInterval(async () => {
      console.log('Fetching latest weather updates...');
      
      for (const city of this.cities) {
        try {
          await this.fetchAndBroadcastWeather(city);
        } catch (error) {
          console.error(`Error updating weather for ${city}:`, error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Fetch weather data and broadcast to subscribers
   */
  private async fetchAndBroadcastWeather(city: string): Promise<void> {
    try {
      const weather = await this.climateAPI.getComprehensiveWeather(city, this.cityIds[city]);
      
      // Process and validate weather data
      let primaryWeatherData: any;
      let dataSource: string = 'Unknown';
      
      if (weather.openMeteoData?.data) {
        primaryWeatherData = weather.openMeteoData.data;
        dataSource = weather.openMeteoData.source || 'Open-Meteo';
      } else if (weather.openWeatherData?.data) {
        primaryWeatherData = weather.openWeatherData.data;
        dataSource = weather.openWeatherData.source || 'OpenWeather';
      }
      
      if (primaryWeatherData) {
        const weatherData: WeatherData = {
          city_name: city,
          city_id: this.cityIds[city],
          temperature: primaryWeatherData.main.temp,
          feels_like: primaryWeatherData.main.feels_like,
          temp_min: primaryWeatherData.main.temp_min,
          temp_max: primaryWeatherData.main.temp_max,
          humidity: primaryWeatherData.main.humidity,
          pressure: primaryWeatherData.main.pressure,
          rainfall: primaryWeatherData.rain?.['1h'] || 0,
          wind_speed: primaryWeatherData.wind?.speed,
          wind_direction: primaryWeatherData.wind?.deg,
          wind_gust: primaryWeatherData.wind?.gust,
          visibility: primaryWeatherData.visibility,
          uv_index: primaryWeatherData.uv_index,
          cloud_cover: primaryWeatherData.clouds?.all,
          dew_point: primaryWeatherData.dew_point,
          heat_index: primaryWeatherData.heat_index,
          wind_chill: primaryWeatherData.wind_chill,
          soil_temperature: primaryWeatherData.soil_temperature,
          soil_moisture: primaryWeatherData.soil_moisture,
          evapotranspiration: primaryWeatherData.evapotranspiration,
          growing_degree_days: primaryWeatherData.growing_degree_days,
          air_quality_pm25: primaryWeatherData.air_quality?.pm25,
          air_quality_pm10: primaryWeatherData.air_quality?.pm10,
          air_quality_index: primaryWeatherData.air_quality?.aqi,
          pressure_trend: primaryWeatherData.pressure_trend,
          moon_phase: primaryWeatherData.moon_phase,
          moon_illumination: primaryWeatherData.moon_illumination,
          weather_description: primaryWeatherData.weather[0].description,
          weather_condition: primaryWeatherData.weather[0].main,
          data_source: dataSource,
          sunrise: primaryWeatherData.sys?.sunrise,
          sunset: primaryWeatherData.sys?.sunset,
          is_day: primaryWeatherData.is_day,
          sunshine_duration: primaryWeatherData.sunshine_duration,
        };

        // Save to database
        this.climateDB.insertWeatherData(weatherData);
        
        // Analyze for alerts
        this.alertService.analyzeWeatherData(weatherData);
        
        // Broadcast to WebSocket subscribers
        this.io.to(`weather_${city}`).emit('weather_update', {
          city,
          data: weatherData,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Weather updated for ${city}: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity`);
      }
    } catch (error) {
      console.error(`Failed to fetch weather for ${city}:`, error);
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`🚀 ClimateSync TypeScript Server running on ${this.config.host}:${this.config.port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 CORS Origin: ${this.config.corsOrigin}`);
        console.log(`📁 Static Files: ${this.config.staticPath}`);
        console.log(`🔧 Advanced ML: ${this.advancedMLInitialized ? 'Enabled' : 'Pending'}`);
        console.log(`🏙️  Monitoring Cities: ${this.cities.join(', ')}`);
      });

      // Start weather updates
      this.startWeatherUpdates();
      
      // Graceful shutdown handling
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      // Stop weather updates
      if (this.weatherUpdateInterval) {
        clearInterval(this.weatherUpdateInterval);
      }
      
      // Close server
      this.server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connections
        try {
          this.climateDB.close();
          console.log('✅ Database connections closed');
        } catch (error) {
          console.error('Error closing database:', error);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force exit after 30 seconds
      setTimeout(() => {
        console.error('❌ Force shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}

// Create and start server
const server = new ClimateServer();
server.start().catch((error) => {
  console.error('❌ Failed to start ClimateSync server:', error);
  process.exit(1);
});

export default ClimateServer;