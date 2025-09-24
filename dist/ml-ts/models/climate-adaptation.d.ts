import { BaseMLModel, MLModelInfo } from '../types';
interface ClimateAdaptationPlan {
    trendAnalysis: ClimateTrends;
    adaptationStrategies: AdaptationStrategy[];
    riskAssessment: ClimateRisk;
    timeline: AdaptationTimeline;
    confidence: number;
}
interface ClimateTrends {
    temperature: TrendData;
    precipitation: TrendData;
    extremeEvents: ExtremeEventTrends;
    seasonalShifts: SeasonalChanges;
}
interface TrendData {
    currentValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    projectedChange: number;
    timeframe: string;
}
interface AdaptationStrategy {
    category: string;
    actions: string[];
    priority: 'high' | 'medium' | 'low';
    costEstimate: number;
    effectiveness: number;
    timeline: string;
}
/**
 * Main Climate Adaptation ML Model
 */
export declare class ClimateAdaptationModel implements BaseMLModel {
    private trendAnalyzer;
    private strategyGenerator;
    private riskAssessor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<ClimateAdaptationPlan>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    getModelInfo(): MLModelInfo;
    private generateMockData;
    private generateTimeline;
}
interface ExtremeEventTrends {
    droughts: {
        frequency: number;
        intensity: string;
        trend: string;
    };
    floods: {
        frequency: number;
        intensity: string;
        trend: string;
    };
    heatwaves: {
        frequency: number;
        intensity: string;
        trend: string;
    };
}
interface SeasonalChanges {
    plantingSeason: string;
    harvestSeason: string;
    rainySeasonChanges: string;
}
interface ClimateRisk {
    overallRisk: number;
    riskLevel: 'low' | 'medium' | 'high';
    keyRisks: string[];
    impacts: RiskImpact[];
    vulnerability: number;
    adaptiveCapacity: number;
}
interface RiskImpact {
    factor: string;
    impact: string;
    description: string;
    probability: number;
}
interface AdaptationTimeline {
    immediate: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
}
export { ClimateAdaptationModel as default };
//# sourceMappingURL=climate-adaptation.d.ts.map