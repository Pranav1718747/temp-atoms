import { BaseMLModel, MLModelInfo } from '../types';
interface ResourceOptimization {
    fertilizer: FertilizerPlan;
    water: WaterOptimization;
    waste: WasteReduction;
    efficiency: ResourceEfficiency;
    savings: CostSavings;
    confidence: number;
}
interface FertilizerPlan {
    recommendations: FertilizerRecommendation[];
    optimalTiming: string[];
    costReduction: number;
    yieldImprovement: number;
}
interface FertilizerRecommendation {
    type: 'nitrogen' | 'phosphorus' | 'potassium' | 'organic';
    amount: number;
    timing: string;
    method: string;
    efficiency: number;
}
/**
 * Resource Management ML Model
 */
export declare class ResourceManagementModel implements BaseMLModel {
    private fertilizerOptimizer;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<ResourceOptimization>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    getModelInfo(): MLModelInfo;
    private optimizeWater;
    private calculateWasteReduction;
    private calculateEfficiency;
    private calculateSavings;
    private generateTrainingData;
}
interface WaterOptimization {
    currentUsage: number;
    optimizedUsage: number;
    savings: number;
    efficiency: number;
    recommendations: string[];
}
interface WasteReduction {
    currentWaste: number;
    reducedWaste: number;
    recyclingOpportunities: string[];
    environmentalImpact: number;
}
interface ResourceEfficiency {
    fertilizer: number;
    water: number;
    energy: number;
    overall: number;
}
interface CostSavings {
    fertilizerSavings: number;
    waterSavings: number;
    energySavings: number;
    totalSavings: number;
    paybackPeriod: number;
}
export { ResourceManagementModel as default };
//# sourceMappingURL=resource-management.d.ts.map