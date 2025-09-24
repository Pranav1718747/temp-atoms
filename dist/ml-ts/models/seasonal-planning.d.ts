import { BaseMLModel, MLModelInfo } from '../types';
interface SeasonalPlan {
    season: string;
    cropCalendar: CropCalendarEntry[];
    yieldForecast: YieldPrediction[];
    resourceRequirements: ResourcePlan;
    riskAssessment: SeasonalRisk;
    confidence: number;
}
interface CropCalendarEntry {
    cropType: string;
    plantingDate: string;
    harvestDate: string;
    keyMilestones: Milestone[];
    expectedYield: number;
    profitability: number;
}
interface YieldPrediction {
    cropType: string;
    expectedYield: number;
    yieldRange: {
        min: number;
        max: number;
    };
    factors: Record<string, number>;
    confidence: number;
}
interface ResourcePlan {
    water: {
        total: number;
        schedule: WaterSchedule[];
    };
    fertilizer: {
        type: string;
        quantity: number;
        timing: string;
    }[];
    labor: {
        activity: string;
        duration: number;
        timing: string;
    }[];
    equipment: {
        type: string;
        usage: number;
        maintenance: string;
    }[];
}
interface SeasonalRisk {
    overallRisk: number;
    weatherRisks: string[];
    marketRisks: string[];
    pestRisks: string[];
    mitigation: string[];
}
interface Milestone {
    phase: string;
    date: string;
    description: string;
}
interface WaterSchedule {
    date: string;
    amount: number;
    method: string;
}
/**
 * Main Seasonal Planning ML Model
 */
export declare class SeasonalPlanningModel implements BaseMLModel {
    private yieldPredictor;
    private calendarOptimizer;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<SeasonalPlan>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    getModelInfo(): MLModelInfo;
    private generateYieldForecast;
    private extractYieldFeatures;
    private encodeCropType;
    private encodeSeasonality;
    private calculateResourceRequirements;
    private assessSeasonalRisks;
    private determineSeason;
    private generateTrainingData;
}
export { SeasonalPlanningModel as default };
//# sourceMappingURL=seasonal-planning.d.ts.map