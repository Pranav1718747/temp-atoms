/**
 * Advanced Crop Recommendation System using Machine Learning
 * Implements Random Forest and Multi-Criteria Decision Analysis
 */
import { WeatherData, CropRecommendation, ModelPredictionResult, MLModel, ModelEvaluation, ModelMetrics, Season } from '../types';
/**
 * Random Forest Model for crop suitability prediction
 */
export declare class RandomForestModel implements MLModel<number[], number> {
    name: string;
    version: string;
    isInitialized: boolean;
    accuracy: number;
    private trees;
    private numTrees;
    private scaler;
    private metrics;
    constructor(numTrees?: number);
    initialize(): Promise<void>;
    train(data: number[][]): Promise<void>;
    predict(input: number[]): Promise<number>;
    evaluate(testData: number[][], expectedOutput: number[]): Promise<ModelEvaluation>;
    getMetrics(): ModelMetrics;
    private buildSimpleTree;
    private predictWithTree;
}
/**
 * Advanced Crop Recommendation Service
 */
export declare class AdvancedCropRecommender {
    private randomForest;
    private cropDatabase;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    recommendCrops(weatherData: WeatherData, season?: Season): Promise<ModelPredictionResult<CropRecommendation>>;
    private calculateSuitabilityScore;
    private createFeatureVector;
    private calculateRuleBasedScore;
    private calculateParameterScore;
    private assessRisk;
    private predictYield;
    private generateRecommendation;
    private calculateConfidence;
    private generateTrainingData;
    private getCurrentSeason;
    private getSeasonalFactor;
    private loadCropDatabase;
}
//# sourceMappingURL=crop-recommender.d.ts.map