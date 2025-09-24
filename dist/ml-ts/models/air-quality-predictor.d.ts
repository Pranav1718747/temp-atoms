import { BaseMLModel, MLModelInfo } from '../types';
interface AirQualityPrediction {
    timestamp: string;
    aqi: number;
    pollutants: PollutantLevels;
    healthRisk: HealthRisk;
    forecast: AirQualityForecast[];
    confidence: number;
}
interface PollutantLevels {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    o3: number;
    co: number;
}
interface HealthRisk {
    level: 'low' | 'moderate' | 'unhealthy' | 'hazardous';
    sensitiveGroups: string[];
    recommendations: string[];
}
interface AirQualityForecast {
    date: string;
    aqi: number;
    dominant_pollutant: string;
    confidence: number;
}
/**
 * Main Air Quality Prediction Model
 */
export declare class AirQualityPredictor implements BaseMLModel {
    private lstmModel;
    private healthAssessor;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    predict(input: any): Promise<AirQualityPrediction>;
    evaluate(testData: any[]): Promise<{
        accuracy: number;
        mse: number;
        r2: number;
    }>;
    getModelInfo(): MLModelInfo;
    private extractPollutants;
    private createSequence;
    private calculateCurrentAQI;
    private identifyDominantPollutant;
    private addDays;
    private generateTrainingData;
}
export { AirQualityPredictor as default };
//# sourceMappingURL=air-quality-predictor.d.ts.map