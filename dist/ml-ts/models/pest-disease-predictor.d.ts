import { BaseMLModel, PestRiskPrediction, DiseaseRiskPrediction, MLModelInfo } from '../types';
/**
 * Main Pest and Disease Prediction Model
 */
export declare class PestDiseasePredictor implements BaseMLModel {
    private pestAnalyzer;
    private diseaseAnalyzer;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<any>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    predictPestRisk(environmentalData: any): Promise<PestRiskPrediction>;
    predictDiseaseRisk(environmentalData: any): Promise<DiseaseRiskPrediction>;
    getModelInfo(): MLModelInfo;
    private extractPestFeatures;
    private extractDiseaseFeatures;
    private encodeCropType;
    private encodeSeason;
    private identifyLikelyPests;
    private identifyLikelyDiseases;
    private generatePestRecommendations;
    private generateDiseaseRecommendations;
    private convertMapToObject;
    private generateTrainingData;
}
export { PestDiseasePredictor as default };
//# sourceMappingURL=pest-disease-predictor.d.ts.map