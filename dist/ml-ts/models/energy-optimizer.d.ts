/**
 * Energy Optimization ML System
 * Smart energy management using reinforcement learning
 */
import { BaseMLModel } from '../types/index';
export interface EnergyData {
    currentUsage: number;
    solarGeneration?: number;
    weatherConditions: any;
    equipmentSchedule: EquipmentUsage[];
    energyPrices: EnergyPricing[];
    farmSize: number;
}
export interface EquipmentUsage {
    equipmentId: string;
    name: string;
    powerRating: number;
    currentStatus: 'on' | 'off' | 'scheduled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    flexibleTiming: boolean;
}
export interface EnergyPricing {
    hour: number;
    price: number;
    demandLevel: 'low' | 'medium' | 'high';
}
export interface EnergyOptimization {
    timestamp: string;
    currentEfficiency: number;
    optimizedSchedule: EquipmentSchedule[];
    estimatedSavings: {
        energyKwh: number;
        cost: number;
        carbonFootprint: number;
    };
    solarRecommendations: {
        optimalPanelSize: number;
        estimatedGeneration: number;
        paybackPeriod: number;
    };
    peakShiftingOpportunities: string[];
    recommendations: string[];
    confidence: number;
}
export interface EquipmentSchedule {
    equipmentId: string;
    startTime: string;
    duration: number;
    energyConsumption: number;
    priority: number;
}
export declare class EnergyOptimizationModel implements BaseMLModel {
    private qLearning;
    private solarPredictor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<EnergyOptimization>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    private trainWithSyntheticData;
    private createState;
    private predictSolarGeneration;
    private optimizeEquipmentSchedule;
    private getOptimalStartTime;
    private calculateOptimalDuration;
    private getPriorityValue;
    private calculateCurrentEfficiency;
    private calculatePotentialSavings;
    private generateSolarRecommendations;
    private identifyPeakShiftingOpportunities;
    private generateRecommendations;
}
//# sourceMappingURL=energy-optimizer.d.ts.map