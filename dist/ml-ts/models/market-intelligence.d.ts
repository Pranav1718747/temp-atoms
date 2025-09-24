/**
 * Market Intelligence ML System
 * Advanced price forecasting and market analysis using time series ML
 */
import { BaseMLModel } from '../types/index';
export interface MarketData {
    crop: string;
    currentPrice: number;
    historicalPrices: PricePoint[];
    supplyData: SupplyInfo;
    demandData: DemandInfo;
    seasonalTrends: SeasonalTrend[];
    location: string;
}
export interface PricePoint {
    date: string;
    price: number;
    volume: number;
    market: string;
}
export interface SupplyInfo {
    totalProduction: number;
    regionalProduction: RegionalProduction[];
    qualityDistribution: QualityDistribution;
}
export interface DemandInfo {
    domesticDemand: number;
    exportDemand: number;
    industrialDemand: number;
    seasonalVariation: number;
}
export interface RegionalProduction {
    region: string;
    production: number;
    quality: 'premium' | 'standard' | 'low';
}
export interface QualityDistribution {
    premium: number;
    standard: number;
    low: number;
}
export interface SeasonalTrend {
    month: number;
    priceMultiplier: number;
    demandLevel: number;
}
export interface MarketForecast {
    timestamp: string;
    crop: string;
    priceForecast: PriceForecast[];
    optimalSellingTime: {
        date: string;
        expectedPrice: number;
        confidence: number;
    };
    marketTrends: {
        shortTerm: string;
        mediumTerm: string;
        longTerm: string;
    };
    riskFactors: string[];
    profitOptimization: {
        estimatedProfit: number;
        recommendedActions: string[];
    };
    confidence: number;
}
export interface PriceForecast {
    date: string;
    predictedPrice: number;
    confidence: number;
    volatility: number;
}
/**
 * Main Market Intelligence ML Model
 */
export declare class MarketIntelligenceModel implements BaseMLModel {
    private lstmPredictor;
    private svrPredictor;
    private technicalAnalyzer;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<MarketForecast>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    private trainWithSyntheticData;
    private generateSyntheticMarketData;
    private generatePriceForecast;
    private fallbackPricePrediction;
    private findOptimalSellingTime;
    private analyzeMarketTrends;
    private assessLongTermTrend;
    private assessRiskFactors;
    private calculateProfitOptimization;
}
//# sourceMappingURL=market-intelligence.d.ts.map