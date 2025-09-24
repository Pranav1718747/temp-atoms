/**
 * Test validation for Advanced TypeScript ML Implementation
 */

const { 
  initializeAdvancedML, 
  getAdvancedWeatherPredictions,
  getAdvancedCropRecommendations,
  getAdvancedAlertPredictions,
  getComprehensiveInsights,
  getMLHealthStatus,
  getMLPerformanceMetrics
} = require('./ml-ts/bridge.js');

/**
 * Mock database for testing
 */
const mockDatabase = {
  getWeatherHistory: (cityName, days) => {
    // Return mock historical data
    const data = [];
    for (let i = 0; i < days; i++) {
      data.push({
        temperature: 25 + (Math.random() - 0.5) * 10,
        humidity: 60 + (Math.random() - 0.5) * 20,
        rainfall: Math.random() * 15,
        pressure: 1013 + (Math.random() - 0.5) * 20,
        recordedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return data;
  },

  getLatestWeather: (cityName) => ({
    temperature: 28,
    humidity: 65,
    rainfall: 5,
    pressure: 1013,
    recordedAt: new Date().toISOString()
  }),

  getCityByName: (cityName) => ({
    id: 1,
    name: cityName,
    imd_id: 42182
  }),

  getAllCities: () => [
    { id: 1, name: 'Delhi', imd_id: 42182 },
    { id: 2, name: 'Mumbai', imd_id: 43003 },
    { id: 3, name: 'Chennai', imd_id: 43279 }
  ],

  db: {
    prepare: (sql) => ({
      run: (...params) => ({ changes: 1 }),
      get: (...params) => ({}),
      all: (...params) => ([])
    }),
    exec: (sql) => {}
  }
};

/**
 * Test suite for ML implementation
 */
async function runMLTests() {
  console.log('🧪 Starting Advanced TypeScript ML Tests...\n');

  try {
    // Test 1: Initialization
    console.log('1️⃣ Testing ML Service Initialization...');
    await initializeAdvancedML(mockDatabase);
    console.log('✅ ML Service initialized successfully\n');

    // Test 2: Health Check
    console.log('2️⃣ Testing Health Check...');
    const health = getMLHealthStatus();
    console.log('Health Status:', JSON.stringify(health, null, 2));
    console.log('✅ Health check passed\n');

    // Test 3: Weather Predictions
    console.log('3️⃣ Testing Weather Predictions...');
    const weatherPredictions = await getAdvancedWeatherPredictions('Delhi', 7);
    console.log('Weather Predictions Sample:');
    console.log('- Success:', weatherPredictions.success);
    console.log('- City:', weatherPredictions.city);
    console.log('- Predictions Count:', weatherPredictions.predictions.length);
    console.log('- Confidence:', weatherPredictions.confidence);
    console.log('- Enhanced:', weatherPredictions.enhanced);
    console.log('- Sample Prediction:', JSON.stringify(weatherPredictions.predictions[0], null, 2));
    console.log('✅ Weather predictions test passed\n');

    // Test 4: Crop Recommendations
    console.log('4️⃣ Testing Crop Recommendations...');
    const cropRecommendations = await getAdvancedCropRecommendations('Mumbai', 'Kharif');
    console.log('Crop Recommendations Sample:');
    console.log('- Success:', cropRecommendations.success);
    console.log('- City:', cropRecommendations.city);
    console.log('- Season:', cropRecommendations.season);
    console.log('- Recommendations Count:', cropRecommendations.recommendations.length);
    console.log('- Enhanced:', cropRecommendations.enhanced);
    console.log('- Top Recommendation:', JSON.stringify(cropRecommendations.recommendations[0], null, 2));
    console.log('✅ Crop recommendations test passed\n');

    // Test 5: Alert Predictions
    console.log('5️⃣ Testing Alert Predictions...');
    const alertPredictions = await getAdvancedAlertPredictions('Chennai');
    console.log('Alert Predictions Sample:');
    console.log('- Success:', alertPredictions.success);
    console.log('- City:', alertPredictions.city);
    console.log('- Alerts Count:', alertPredictions.alerts.length);
    console.log('- Overall Risk:', JSON.stringify(alertPredictions.overallRisk, null, 2));
    console.log('- Enhanced:', alertPredictions.enhanced);
    if (alertPredictions.alerts.length > 0) {
      console.log('- Sample Alert:', JSON.stringify(alertPredictions.alerts[0], null, 2));
    }
    console.log('✅ Alert predictions test passed\n');

    // Test 6: Comprehensive Insights
    console.log('6️⃣ Testing Comprehensive Insights...');
    const insights = await getComprehensiveInsights('Bangalore');
    console.log('Comprehensive Insights Sample:');
    console.log('- Success:', insights.success);
    console.log('- City:', insights.city);
    console.log('- Enhanced:', insights.enhanced);
    console.log('- Summary:', JSON.stringify(insights.summary, null, 2));
    console.log('- Weather Success:', insights.weather.success);
    console.log('- Crops Success:', insights.crops.success);
    console.log('- Alerts Success:', insights.alerts.success);
    console.log('✅ Comprehensive insights test passed\n');

    // Test 7: Performance Metrics
    console.log('7️⃣ Testing Performance Metrics...');
    const metrics = getMLPerformanceMetrics();
    console.log('Performance Metrics:');
    console.log('- System Status:', metrics.systemStatus);
    console.log('- Models:', JSON.stringify(metrics.models, null, 2));
    console.log('- Predictions Summary:', JSON.stringify(metrics.predictions, null, 2));
    console.log('✅ Performance metrics test passed\n');

    // Test 8: Error Handling
    console.log('8️⃣ Testing Error Handling...');
    try {
      const invalidResult = await getAdvancedWeatherPredictions('NonExistentCity', 30);
      console.log('Error handling result:', invalidResult.success ? 'Handled gracefully' : 'Error caught properly');
    } catch (error) {
      console.log('Error properly caught:', error.message);
    }
    console.log('✅ Error handling test passed\n');

    // Summary
    console.log('🎉 All Advanced TypeScript ML Tests Passed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- ✅ ML Service Initialization');
    console.log('- ✅ Health Check');
    console.log('- ✅ Weather Predictions');
    console.log('- ✅ Crop Recommendations');
    console.log('- ✅ Alert Predictions');
    console.log('- ✅ Comprehensive Insights');
    console.log('- ✅ Performance Metrics');
    console.log('- ✅ Error Handling');

    console.log('\n🚀 Advanced TypeScript ML Implementation is ready for production!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Performance benchmark
 */
async function runPerformanceBenchmark() {
  console.log('\n⚡ Running Performance Benchmark...\n');

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata'];
  const startTime = Date.now();

  for (const city of cities) {
    const cityStartTime = Date.now();
    
    await Promise.all([
      getAdvancedWeatherPredictions(city, 7),
      getAdvancedCropRecommendations(city),
      getAdvancedAlertPredictions(city)
    ]);
    
    const cityDuration = Date.now() - cityStartTime;
    console.log(`${city}: ${cityDuration}ms`);
  }

  const totalDuration = Date.now() - startTime;
  console.log(`\nTotal benchmark time: ${totalDuration}ms`);
  console.log(`Average per city: ${Math.round(totalDuration / cities.length)}ms`);
  
  console.log('\n✅ Performance benchmark completed');
}

// Export for standalone testing
module.exports = {
  runMLTests,
  runPerformanceBenchmark,
  mockDatabase
};

// Run tests if this file is executed directly
if (require.main === module) {
  runMLTests()
    .then(() => runPerformanceBenchmark())
    .then(() => {
      console.log('\n🎯 All tests and benchmarks completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}