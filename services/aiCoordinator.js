const {
  CropAdvisoryAgent,
  WeatherPredictionAgent,
  MarketIntelligenceAgent,
  ResourceOptimizationAgent,
  RiskAssessmentAgent
} = require('./aiAgents');

class AICoordinator {
  constructor() {
    this.agents = {
      cropAdvisor: new CropAdvisoryAgent(),
      weatherPredictor: new WeatherPredictionAgent(),
      marketIntelligence: new MarketIntelligenceAgent(),
      resourceOptimizer: new ResourceOptimizationAgent(),
      riskAssessment: new RiskAssessmentAgent()
    };
    
    this.analysisHistory = [];
    this.isProcessing = false;
  }

  /**
   * Get comprehensive AI analysis for farming
   */
  async getComprehensiveAnalysis(weatherData, cropData, farmingContext = {}) {
    if (this.isProcessing) {
      return { error: "Analysis already in progress", status: "busy" };
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log("🤖 AI Coordinator: Starting comprehensive analysis...");

      // Run all agents in parallel for efficiency
      const analysisPromises = [
        this.agents.cropAdvisor.analyzeAndAdvise(weatherData, cropData, farmingContext.history),
        this.agents.weatherPredictor.analyzeWeatherTrends(weatherData, farmingContext.location),
        this.agents.marketIntelligence.analyzeMarketTrends(cropData, farmingContext.market),
        this.agents.resourceOptimizer.optimizeResources(weatherData, cropData, farmingContext.farmSize),
        this.agents.riskAssessment.assessRisks(weatherData, cropData, farmingContext.location)
      ];

      const results = await Promise.allSettled(analysisPromises);
      
      // Process results and handle any failures
      const processedResults = this.processAgentResults(results);
      
      // Generate comprehensive report
      const comprehensiveReport = this.generateComprehensiveReport(
        processedResults, 
        weatherData, 
        cropData, 
        farmingContext
      );

      // Store in history
      this.analysisHistory.push({
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
        report: comprehensiveReport
      });

      // Keep only last 10 analyses
      if (this.analysisHistory.length > 10) {
        this.analysisHistory = this.analysisHistory.slice(-10);
      }

      console.log(`✅ AI Analysis completed in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        report: comprehensiveReport,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error("❌ AI Coordinator Error:", error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackReport(weatherData, cropData)
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get specific agent analysis
   */
  async getAgentAnalysis(agentName, weatherData, cropData, context = {}) {
    const agent = this.agents[agentName];
    if (!agent) {
      return { error: `Agent '${agentName}' not found`, availableAgents: Object.keys(this.agents) };
    }

    try {
      let result;
      switch (agentName) {
        case 'cropAdvisor':
          result = await agent.analyzeAndAdvise(weatherData, cropData, context.history);
          break;
        case 'weatherPredictor':
          result = await agent.analyzeWeatherTrends(weatherData, context.location);
          break;
        case 'marketIntelligence':
          result = await agent.analyzeMarketTrends(cropData, context.market);
          break;
        case 'resourceOptimizer':
          result = await agent.optimizeResources(weatherData, cropData, context.farmSize);
          break;
        case 'riskAssessment':
          result = await agent.assessRisks(weatherData, cropData, context.location);
          break;
        default:
          return { error: "Unknown agent method" };
      }

      return {
        success: true,
        agent: agentName,
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        agent: agentName,
        error: error.message
      };
    }
  }

  /**
   * Process results from all agents
   */
  processAgentResults(results) {
    const processed = {
      successful: [],
      failed: [],
      agentSummary: {}
    };

    results.forEach((result, index) => {
      const agentNames = ['cropAdvisor', 'weatherPredictor', 'marketIntelligence', 'resourceOptimizer', 'riskAssessment'];
      const agentName = agentNames[index];

      if (result.status === 'fulfilled') {
        processed.successful.push({
          agent: agentName,
          data: result.value
        });
        processed.agentSummary[agentName] = { status: 'success', data: result.value };
      } else {
        processed.failed.push({
          agent: agentName,
          error: result.reason?.message || 'Unknown error'
        });
        processed.agentSummary[agentName] = { status: 'failed', error: result.reason?.message };
      }
    });

    return processed;
  }

  /**
   * Generate comprehensive report from all agent results
   */
  generateComprehensiveReport(processedResults, weatherData, cropData, farmingContext) {
    const report = {
      executiveSummary: this.generateExecutiveSummary(processedResults, weatherData),
      agentAnalyses: processedResults.agentSummary,
      priorityActions: this.extractPriorityActions(processedResults),
      riskAssessment: this.generateOverallRiskAssessment(processedResults),
      recommendations: this.generateConsolidatedRecommendations(processedResults),
      metadata: {
        analysisDate: new Date().toISOString(),
        weatherConditions: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          rainfall: weatherData.rainfall || 0
        },
        successfulAgents: processedResults.successful.length,
        failedAgents: processedResults.failed.length,
        overallConfidence: this.calculateOverallConfidence(processedResults)
      }
    };

    return report;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(processedResults, weatherData) {
    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const successCount = processedResults.successful.length;
    
    let summary = {
      overall_assessment: "favorable",
      key_insights: [],
      immediate_actions: [],
      confidence_level: this.calculateOverallConfidence(processedResults)
    };

    // Weather-based assessment
    if (temp >= 20 && temp <= 30 && humidity >= 60 && humidity <= 80) {
      summary.overall_assessment = "excellent";
      summary.key_insights.push("Optimal weather conditions for farming operations");
    } else if (temp > 35 || temp < 10) {
      summary.overall_assessment = "challenging";
      summary.key_insights.push("Extreme temperature conditions require careful monitoring");
    }

    // Agent success rate assessment
    if (successCount >= 4) {
      summary.key_insights.push("Comprehensive AI analysis completed successfully");
    } else if (successCount >= 2) {
      summary.key_insights.push("Partial AI analysis available - core recommendations generated");
    } else {
      summary.overall_assessment = "limited";
      summary.key_insights.push("Limited AI analysis due to system constraints");
    }

    return summary;
  }

  /**
   * Extract high-priority actions from all agents
   */
  extractPriorityActions(processedResults) {
    const priorityActions = [];

    processedResults.successful.forEach(agentResult => {
      const data = agentResult.data;
      
      // Extract high-priority items from each agent
      if (data.recommendations) {
        data.recommendations.forEach(rec => {
          if (rec.priority === 'high') {
            priorityActions.push({
              source: agentResult.agent,
              action: rec.title,
              description: rec.message,
              urgency: rec.priority
            });
          }
        });
      }

      if (data.predictions) {
        data.predictions.forEach(pred => {
          if (pred.severity === 'high') {
            priorityActions.push({
              source: agentResult.agent,
              action: pred.title,
              description: pred.message,
              urgency: 'high'
            });
          }
        });
      }

      if (data.risks) {
        data.risks.forEach(risk => {
          if (risk.level === 'high' || risk.severity === 'high') {
            priorityActions.push({
              source: agentResult.agent,
              action: risk.title,
              description: risk.message,
              urgency: 'critical'
            });
          }
        });
      }
    });

    return priorityActions.slice(0, 5); // Top 5 priority actions
  }

  /**
   * Generate overall risk assessment
   */
  generateOverallRiskAssessment(processedResults) {
    const riskAgent = processedResults.successful.find(agent => agent.agent === 'riskAssessment');
    
    if (riskAgent && riskAgent.data.risks) {
      const risks = riskAgent.data.risks;
      const highRisks = risks.filter(risk => risk.level === 'high' || risk.severity === 'high');
      
      return {
        overall_risk_level: highRisks.length > 0 ? 'high' : 'moderate',
        critical_risks: highRisks.length,
        total_risks_identified: risks.length,
        risk_categories: risks.map(risk => risk.type),
        recommendation: highRisks.length > 0 ? 'Immediate attention required' : 'Monitor conditions regularly'
      };
    }

    return {
      overall_risk_level: 'unknown',
      critical_risks: 0,
      total_risks_identified: 0,
      risk_categories: [],
      recommendation: 'Risk assessment data unavailable'
    };
  }

  /**
   * Generate consolidated recommendations
   */
  generateConsolidatedRecommendations(processedResults) {
    const consolidated = {
      immediate: [],
      short_term: [],
      long_term: []
    };

    processedResults.successful.forEach(agentResult => {
      const data = agentResult.data;
      
      // Crop Advisory recommendations
      if (agentResult.agent === 'cropAdvisor' && data.recommendations) {
        data.recommendations.forEach(rec => {
          consolidated.immediate.push(`${rec.title}: ${rec.message}`);
        });
      }

      // Resource optimization
      if (agentResult.agent === 'resourceOptimizer' && data.optimizations) {
        data.optimizations.forEach(opt => {
          consolidated.short_term.push(`${opt.title}: ${opt.message}`);
        });
      }

      // Market intelligence
      if (agentResult.agent === 'marketIntelligence' && data.insights) {
        data.insights.forEach(insight => {
          if (insight.type === 'profit_optimization') {
            consolidated.long_term.push(`${insight.title}: ${insight.message}`);
          }
        });
      }
    });

    return consolidated;
  }

  /**
   * Calculate overall confidence based on agent success and individual confidences
   */
  calculateOverallConfidence(processedResults) {
    if (processedResults.successful.length === 0) return 0;

    const confidences = processedResults.successful
      .map(agent => agent.data.confidence || 0.5)
      .filter(conf => conf > 0);

    if (confidences.length === 0) return 0.5;

    const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const successRate = processedResults.successful.length / (processedResults.successful.length + processedResults.failed.length);
    
    return Math.round((averageConfidence * successRate) * 100) / 100;
  }

  /**
   * Generate fallback report when AI analysis fails
   */
  generateFallbackReport(weatherData, cropData) {
    return {
      executiveSummary: {
        overall_assessment: "basic",
        key_insights: ["Basic weather data analysis available"],
        immediate_actions: ["Monitor weather conditions", "Continue regular farming activities"],
        confidence_level: 0.6
      },
      agentAnalyses: {},
      priorityActions: [
        {
          source: "fallback",
          action: "Weather Monitoring",
          description: "Continue monitoring weather conditions",
          urgency: "medium"
        }
      ],
      riskAssessment: {
        overall_risk_level: 'moderate',
        recommendation: 'Standard precautions recommended'
      },
      recommendations: {
        immediate: ["Monitor current weather conditions"],
        short_term: ["Plan irrigation based on weather forecast"],
        long_term: ["Consider crop diversification"]
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        weatherConditions: weatherData,
        successfulAgents: 0,
        failedAgents: 5,
        overallConfidence: 0.6,
        fallback: true
      }
    };
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(limit = 5) {
    return this.analysisHistory.slice(-limit).reverse();
  }

  /**
   * Get agent status
   */
  getAgentStatus() {
    return {
      available_agents: Object.keys(this.agents),
      total_agents: Object.keys(this.agents).length,
      is_processing: this.isProcessing,
      last_analysis: this.analysisHistory.length > 0 ? this.analysisHistory[this.analysisHistory.length - 1].timestamp : null,
      analysis_count: this.analysisHistory.length
    };
  }

  /**
   * Clear analysis history
   */
  clearHistory() {
    this.analysisHistory = [];
    return { success: true, message: "Analysis history cleared" };
  }
}

module.exports = AICoordinator;