/**
 * Enhanced TypeScript Climate Sync Server
 * Provides type-safe APIs for weather monitoring, farming assistance, and ML-powered insights
 */
declare class ClimateServer {
    private app;
    private server;
    private io;
    private config;
    private climateAPI;
    private climateDB;
    private alertService;
    private farmingService;
    private mlService;
    private cities;
    private cityIds;
    private advancedMLInitialized;
    private weatherUpdateInterval;
    constructor();
    /**
     * Initialize Express middleware with type safety
     */
    private initializeMiddleware;
    /**
     * Initialize all backend services
     */
    private initializeServices;
    /**
     * Initialize API routes with type safety
     */
    private initializeRoutes;
    /**
     * Initialize WebSocket handlers with type safety
     */
    private initializeSocketHandlers;
    /**
     * Load cities from database with error handling
     */
    private loadCitiesFromDB;
    /**
     * Send current weather data to a specific socket
     */
    private sendCurrentWeatherToSocket;
    /**
     * Start periodic weather updates
     */
    private startWeatherUpdates;
    /**
     * Fetch weather data and broadcast to subscribers
     */
    private fetchAndBroadcastWeather;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown;
}
export default ClimateServer;
//# sourceMappingURL=server.d.ts.map