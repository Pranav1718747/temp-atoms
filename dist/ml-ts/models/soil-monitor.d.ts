/**
 * Advanced Soil Monitoring and Health Assessment ML System
 * Implements comprehensive soil health prediction using multiple ML algorithms
 */
import { BaseMLModel, SoilHealthPrediction } from '../types/index';
/**
 * Advanced Soil Monitoring ML Model
 */
export declare class SoilMonitoringModel implements BaseMLModel {
    private moisturePredictor;
    private nutrientPredictor;
    private phPredictor;
    private temperaturePredictor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<SoilHealthPrediction>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    private trainMoistureModel;
    private trainNutrientModel;
    private trainPhModel;
    private trainTemperatureModel;
    private generateTrainingData;
    private extractFeatures;
    private calculateSoilHealthScore;
    private scoreMoisture;
    private scoreNutrients;
    private scorePh;
    private scoreTemperature;
    private interpretNutrientLevels;
    private getNutrientRecommendations;
    private generateSoilRecommendations;
    private assessSoilRisks;
    private generateSoilForecast;
    private calculateConfidence;
}
//# sourceMappingURL=soil-monitor.d.ts.map