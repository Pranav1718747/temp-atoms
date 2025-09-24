"use strict";
/**
 * Core TypeScript interfaces and types for ML system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientDataError = exports.ModelNotInitializedError = exports.MLError = void 0;
// Error handling
class MLError extends Error {
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'MLError';
    }
}
exports.MLError = MLError;
class ModelNotInitializedError extends MLError {
    constructor(modelName) {
        super(`Model ${modelName} is not initialized`, 'MODEL_NOT_INITIALIZED', { modelName });
    }
}
exports.ModelNotInitializedError = ModelNotInitializedError;
class InsufficientDataError extends MLError {
    constructor(requiredSamples, actualSamples) {
        super(`Insufficient data: required ${requiredSamples}, got ${actualSamples}`, 'INSUFFICIENT_DATA', { requiredSamples, actualSamples });
    }
}
exports.InsufficientDataError = InsufficientDataError;
//# sourceMappingURL=index.js.map