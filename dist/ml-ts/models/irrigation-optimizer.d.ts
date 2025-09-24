/**
 * Advanced Irrigation Optimization ML System
 * Implements smart irrigation scheduling using reinforcement learning and optimization algorithms
 */
import { BaseMLModel, IrrigationRecommendation } from '../types/index';
/**
 * Main Irrigation Optimization ML Model
 */
export declare class IrrigationOptimizationModel implements BaseMLModel {
    private qLearningAgent;
    private waterDemandPredictor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<IrrigationRecommendation>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    private trainWithSyntheticData;
    private generateSyntheticTrainingData;
    private extractFeatures;
    private createState;
    private generateRecommendation;
    private getGrowthStageMultiplier;
    private getSoilTypeFactor;
    private calculateEfficiency;
}
//# sourceMappingURL=irrigation-optimizer.d.ts.map