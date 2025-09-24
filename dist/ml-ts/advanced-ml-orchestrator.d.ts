/**
 * Comprehensive ML Service Orchestrator
 * Integrates all specialized ML systems for complete farm intelligence
 */
import { WeatherData } from './types/index';
export interface ComprehensiveAnalysisRequest {
    location: {
        name: string;
        latitude: number;
        longitude: number;
    };
    currentWeather: WeatherData;
    farmProfile: {
        size: number;
        soilType: string;
        currentCrops: string[];
        equipment: any[];
    };
    analysisType: 'full' | 'weather' | 'crops' | 'irrigation' | 'energy' | 'soil' | 'alerts';
    timeHorizon: number;
}
export interface ComprehensiveAnalysisResult {
    timestamp: string;
    location: string;
    overallScore: number;
    confidence: number;
    weather?: any;
    crops?: any;
    irrigation?: any;
    energy?: any;
    soil?: any;
    alerts?: any;
    actionPriorities: ActionPriority[];
    riskAssessment: RiskAssessment;
    sustainabilityMetrics: SustainabilityMetrics;
    economicForecast: EconomicForecast;
    recommendations: IntegratedRecommendation[];
    systemMetrics: {
        totalProcessingTime: number;
        modelsUsed: string[];
        dataQuality: number;
    };
}
export interface ActionPriority {
    category: string;
    action: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeframe: string;
    estimatedImpact: number;
    cost: number;
    feasibility: number;
}
export interface RiskAssessment {
    overallRiskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
    riskFactors: {
        category: string;
        level: number;
        description: string;
        mitigation: string[];
    }[];
    timeToNextCriticalEvent: number;
}
export interface SustainabilityMetrics {
    waterEfficiency: number;
    energyEfficiency: number;
    carbonFootprint: number;
    soilHealth: number;
    biodiversityIndex: number;
    sustainabilityScore: number;
}
export interface EconomicForecast {
    expectedRevenue: number;
    operationalCosts: number;
    profitMargin: number;
    roi: number;
    riskAdjustedReturn: number;
    marketOutlook: 'positive' | 'neutral' | 'negative';
}
export interface IntegratedRecommendation {
    id: string;
    category: string;
    title: string;
    description: string;
    priority: number;
    impact: {
        yield: number;
        cost: number;
        sustainability: number;
        risk: number;
    };
    implementationSteps: string[];
    dependencies: string[];
    timeframe: string;
    confidence: number;
}
export declare class ComprehensiveMLService {
    private weatherModel;
    private cropModel;
    private alertModel;
    private soilModel;
    private irrigationModel;
    private energyModel;
    private performanceMonitor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    private initializeModel;
    runComprehensiveAnalysis(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResult>;
    private runModelAnalysis;
    private generateIntegratedInsights;
    private generateActionPriorities;
    private generateRiskAssessment;
    private calculateSustainabilityMetrics;
    private generateEconomicForecast;
    private generateIntegratedRecommendations;
    private calculateOverallScore;
    private calculateOverallConfidence;
    private assessDataQuality;
    private generateEnergyPrices;
    getSystemHealth(): {
        status: 'healthy' | 'degraded' | 'critical';
        models: Record<string, any>;
    };
}
//# sourceMappingURL=advanced-ml-orchestrator.d.ts.map