// Language translations for ClimateSync application
const translations = {
  en: {
    // Header
    climate: "Climate",
    sync: "Sync",
    subtitle: "Live Weather Dashboard",
    live: "LIVE",
    
    // Controls
    searchPlaceholder: "Search any city, village, or location worldwide...",
    search: "Search",
    refresh: "Refresh",
    environmentalAlerts: "Environmental Alerts",
    farmingDashboard: "Farming Dashboard",
    farmerProfitCalculator: "Farmer Profit Calculator",
    
    // Weather Cards
    temperature: "Temperature",
    currentTemperature: "Current Temperature",
    humidity: "Humidity",
    moistureLevel: "Moisture Level",
    rainfall: "Rainfall",
    lastHour: "Last Hour",
    conditions: "Conditions",
    weatherDescription: "Weather Description",
    wind: "Wind",
    direction: "Direction",
    pressure: "Pressure",
    trend: "Trend",
    uvIndex: "UV Index",
    level: "Level",
    feelsLike: "Feels Like",
    apparentTemperature: "Apparent Temperature",
    
    // Agricultural Data
    agriculturalWeatherData: "Agricultural Weather Data",
    soilTemperature: "Soil Temperature",
    soilMoisture: "Soil Moisture",
    cmDepth: "0-7cm depth",
    evapotranspiration: "Evapotranspiration",
    referenceETO: "Reference ET₀",
    rainProbability: "Rain Probability",
    next24Hours: "Next 24 hours",
    
    // Data Info
    loading: "Loading...",
    lastUpdated: "Last updated",
    location: "Location",
    global: "Global",
    
    // Loading Messages
    connecting: "Connecting to Weather Station...",
    processing: "Processing Climate Information...",
    almostReady: "Almost Ready...",
    fetching: "Fetching Weather Data...",
    
    // Weather Conditions
    clearSky: "Clear Sky",
    fewClouds: "Few Clouds",
    scatteredClouds: "Scattered Clouds",
    brokenClouds: "Broken Clouds",
    showerRain: "Shower Rain",
    rain: "Rain",
    thunderstorm: "Thunderstorm",
    snow: "Snow",
    mist: "Mist",
    
    // Alerts
    floodAlert: "Flood Alert",
    heatAlert: "Heat Alert",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Farming Dashboard Specific Translations
    smartFarmingDashboard: "Smart Farming Dashboard",
    weatherInsights: "Weather insights simplified for farmers",
    searchYourLocation: "Search Your Location",
    selectYourCrop: "Select Your Crop",
    growthStage: "Growth Stage",
    seedling: "Seedling",
    growing: "Growing",
    flowering: "Flowering",
    fruiting: "Fruiting",
    harvest: "Harvest",
    comprehensiveWeather: "Comprehensive Weather Information",
    atmosphericPressure: "Atmospheric Pressure",
    windConditions: "Wind Conditions",
    airQuality: "Air Quality",
    soilConditions: "Soil Conditions",
    growingDegreeDays: "Growing Degree Days",
    heatIndex: "Heat Index",
    moonPhase: "Moon Phase",
    todaysGDD: "Today's GDD",
    checking: "Checking...",
    ideal: "Ideal",
    temperatureManagement: "Temperature Management",
    humidityControl: "Humidity Control",
    waterManagement: "Water Management",
    irrigationAdvice: "Irrigation Advice",
    protectionAdvice: "Protection Advice",
    timingAdvice: "Timing Advice",
    generalAdvice: "General Advice",
    irrigationStatus: "Irrigation Status",
    excellentFarmingConditions: "Excellent Farming Conditions!",
    fairFarmingConditions: "Fair Farming Conditions",
    challengingConditions: "Challenging Conditions",
    weatherPerfectForCrops: "Weather is perfect for your crops. Great time for farming activities.",
    weatherOkayWithAdjustments: "Weather is okay. Some adjustments may be needed for optimal growth.",
    weatherNeedsAttention: "Weather needs attention. Follow recommendations carefully.",
    temperatureConditionsDetected: "Temperature conditions detected",
    humidityConditionsDetected: "Humidity conditions detected",
    waterConditionsDetected: "Water conditions detected",
    irrigationRecommendationsAvailable: "Irrigation recommendations available",
    protectionRecommendationsBasedOnWeather: "Protection recommendations based on current weather.",
    timingRecommendationsForFarming: "Timing recommendations for farming activities.",
    weatherConditionsSuitable: "Weather conditions are suitable for farming activities.",
    continueWithRegularFarming: "Continue with regular farming practices.",
    unableToLoadRecommendations: "Unable to load recommendations. Please refresh the page.",
    unableToLoadIrrigationRecommendations: "Unable to load irrigation recommendations. Please check weather data.",
    irrigationRecommendationsBasedOnWeather: "Irrigation recommendations based on current weather conditions.",
    allFarmingConditionsNormal: "All farming conditions are within normal range",
    regularIrrigationNeeded: "Regular Irrigation Needed",
    basedOnWeatherConditions: "Based on current weather conditions, regular irrigation is recommended for optimal crop growth.",
    weatherConditionsSuitableWithAdjustments: "Weather conditions are suitable for farming with some adjustments needed.",
    frequency: "Frequency",
    urgency: "Urgency",
    priority: "Priority",
    asNeeded: "as needed",
    regular: "Regular",
    needed: "Needed",
    notRequired: "Not Required",
    medium: "Medium",
    monitorTemperatureLevels: "Monitor temperature levels",
    monitorHumidityLevels: "Monitor humidity levels",
    monitorWaterLevels: "Monitor water levels",
    
    // Additional missing translations
    climateSyncFarming: "ClimateSync Farming",
    profitCalculator: "Profit Calculator",
    cropAnimations: "Crop Animations",
    moisture: "Moisture",
    farmersDashboard: "Farmer's Dashboard",
    aiPoweredMonitoring: "AI-Powered Climate Risk Monitoring",
    realTimeMonitoring: "Real-time Monitoring",
    selectLocation: "Select a location",
    currentEnvironmentalConditions: "Current Environmental Conditions",
    aiEnvironmentalPredictions: "AI Environmental Predictions",
    selectSmallTown: "Select a small town/village",
    predictAlerts: "Predict Alerts",
    currentAlertStatus: "Current Alert Status",
    monitorConditions: "Monitor real-time environmental conditions and risks",
    heatwaveAlert: "Heatwave Alert",
    highRisk: "High Risk",
    current: "Current",
    duration: "Duration",
    analyzeRisk: "Analyze Risk",
    setAlert: "Set Alert",
    floodPrediction: "Flood Prediction",
    moderateRisk: "Moderate Risk",
    riverLevel: "River Level",
    peakTime: "Peak Time",
    checkStatus: "Check Status",
    viewMap: "View Map",
    droughtWarning: "Drought Warning",
    lowRisk: "Low Risk",
    soilMoisture: "Soil Moisture",
    assessRisk: "Assess Risk",
    viewTrends: "View Trends",
    coastalMonitoring: "Coastal Monitoring",
    mediumRisk: "Medium Risk",
    stormSurge: "Storm Surge",
    waveHeight: "Wave Height",
    monitorCoast: "Monitor Coast",
    satelliteView: "Satellite View",
    min: "Min",
    max: "Max",
    
    // Dynamic content translations
    loadingFarmingConditions: "Loading your farming conditions...",
    pleaseWaitAnalyzeWeather: "Please wait while we analyze the weather",
    loadingIrrigationAdvice: "Loading irrigation advice...",
    calculatingWaterRequirements: "Calculating water requirements...",
    farmSizeHectares: "Farm Size (hectares)",
    aiAnalysisReady: "AI Analysis Ready",
    cropAdvisoryAgent: "Crop Advisory Agent",
    personalizedCropRecommendations: "Personalized crop recommendations",
    weatherPredictionAgent: "Weather Prediction Agent",
    advancedWeatherAnalysis: "Advanced weather analysis",
    marketIntelligenceAgent: "Market Intelligence Agent",
    priceTrendsMarketInsights: "Price trends and market insights",
    resourceOptimizationAgent: "Resource Optimization Agent",
    waterFertilizerOptimization: "Water and fertilizer optimization",
    riskAssessmentAgent: "Risk Assessment Agent",
    pestDiseaseClimateRiskAnalysis: "Pest, disease, and climate risk analysis",
    startAnimation: "Start Animation",
    pauseAnimation: "Pause Animation",
    resumeAnimation: "Resume Animation",
    profitCalculator: "Profit Calculator",
    refreshData: "Refresh Data",
    cropCalendar: "Crop Calendar",
    expertTips: "Expert Tips",
    testWeather: "TEST Weather",
    testDashboard: "TEST Dashboard",
    forceUpdate: "FORCE Update",
    loadingFarmingInsights: "Loading farming insights...",
    comingSoon: "Coming soon...",
    seasonalCropCalendar: "Seasonal Crop Calendar",
    loadingCalendar: "Loading calendar...",
    
    // Error and status messages
    pleaseEnterLocationToSearch: "Please enter a location to search",
    noLocationsFound: "No locations found for your search. Try searching for a different city or village.",
    failedToSearchLocation: "Failed to search location. Please check your connection and try again.",
    noLocationsFoundSimple: "No locations found for your search.",
    failedToSearchLocationSimple: "Failed to search location.",
    noLocationsFoundBasic: "No locations found.",
    unknown: "Unknown",
    spring: "Spring",
    summer: "Summer",
    autumn: "Autumn",
    winter: "Winter",
    wetSeason: "Wet Season",
    drySeason: "Dry Season",
    aiAnalysisInProgress: "AI analysis already in progress...",
    failedToLoadAIAnalysis: "Failed to load AI analysis. Please try again.",
    aiAnalysisFailed: "AI analysis failed",
    noCurrentWeatherData: "No current weather data found!",
    failedToLoadWeatherData: "Failed to load weather data",
    errorGettingCurrentWeatherData: "Error getting current weather data",
    
    // Additional UI elements
    foundLocations: "Found Locations:",
    loadingComprehensiveHeatwaveAnalysis: "Loading comprehensive heatwave analysis...",
    loadingFloodPredictionModels: "Loading flood prediction models...",
    loadingDroughtAssessmentData: "Loading drought assessment data...",
    loadingCoastalMonitoringSystems: "Loading coastal monitoring systems...",
    climateSyncLoading: "Climate-Sync Loading...",
    initializingDashboard: "Initializing dashboard...",
    runningInSampleDataMode: "Running in sample data mode - Real data unavailable",
    retry: "Retry",
    probability: "Probability",
    heatwaveAlertDetails: "Heatwave Alert:",
    floodPredictionDetails: "Flood Prediction:",
    droughtWarningDetails: "Drought Warning:",
    coastalMonitoringDetails: "Coastal Monitoring:",
    
    // Weather forecast translations
    weatherForecast: "Weather Forecast",
    hourly: "Hourly",
    daily: "Daily",
    
    // Additional farming terms
    rice: "Rice",
    wheat: "Wheat", 
    cotton: "Cotton",
    sugarcane: "Sugarcane",
    tomato: "Tomato",
    onion: "Onion"
  },
  
  hi: {
    // Header
    climate: "जलवायु",
    sync: "सिंक",
    subtitle: "लाइव मौसम डैशबोर्ड",
    live: "लाइव",
    
    // Controls
    searchPlaceholder: "किसी भी शहर, गांव या स्थान की दुनिया भर में खोजें...",
    search: "खोज",
    refresh: "ताज़ा करें",
    environmentalAlerts: "पर्यावरणीय चेतावनियाँ",
    farmingDashboard: "कृषि डैशबोर्ड",
    farmerProfitCalculator: "किसान लाभ गणक",
    
    // Weather Cards
    temperature: "तापमान",
    currentTemperature: "वर्तमान तापमान",
    humidity: "आर्द्रता",
    moistureLevel: "नमी का स्तर",
    rainfall: "वर्षा",
    lastHour: "पिछले घंटे",
    conditions: "शर्तें",
    weatherDescription: "मौसम विवरण",
    wind: "हवा",
    direction: "दिशा",
    pressure: "दबाव",
    trend: "प्रवृत्ति",
    uvIndex: "यूवी सूचकांक",
    level: "स्तर",
    feelsLike: "महसूस होता है",
    apparentTemperature: "आभासी तापमान",
    
    // Agricultural Data
    agriculturalWeatherData: "कृषि मौसम डेटा",
    soilTemperature: "मिट्टी का तापमान",
    soilMoisture: "मिट्टी की नमी",
    cmDepth: "0-7 सेमी गहराई",
    evapotranspiration: "वाष्पोत्सर्जन",
    referenceETO: "संदर्भ ET₀",
    rainProbability: "वर्षा की संभावना",
    next24Hours: "अगले 24 घंटे",
    
    // Data Info
    loading: "लोड हो रहा है...",
    lastUpdated: "अंतिम अपडेट",
    location: "स्थान",
    global: "वैश्विक",
    
    // Loading Messages
    connecting: "मौसम स्टेशन से कनेक्ट कर रहा है...",
    processing: "जलवायु जानकारी संसाधित कर रहा है...",
    almostReady: "लगभग तैयार...",
    fetching: "मौसम डेटा प्राप्त कर रहा है...",
    
    // Weather Conditions
    clearSky: "साफ आसमान",
    fewClouds: "कुछ बादल",
    scatteredClouds: "छितरे हुए बादल",
    brokenClouds: "टूटे हुए बादल",
    showerRain: "झमाझम बरसात",
    rain: "बरसात",
    thunderstorm: "तूफान",
    snow: "बर्फ",
    mist: "कोहरा",
    
    // Alerts
    floodAlert: "बाढ़ चेतावनी",
    heatAlert: "ऊष्मा चेतावनी",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
    
    // Farming Dashboard Specific Translations
    smartFarmingDashboard: "स्मार्ट खेती डैशबोर्ड",
    weatherInsights: "किसानों के लिए सरलीकृत मौसम अंतर्दृष्टि",
    searchYourLocation: "अपना स्थान खोजें",
    selectYourCrop: "अपनी फसल चुनें",
    growthStage: "वृद्धि अवस्था",
    seedling: "अंकुरण",
    growing: "बढ़ना",
    flowering: "फूलना",
    fruiting: "फलना",
    harvest: "कटाई",
    comprehensiveWeather: "व्यापक मौसम जानकारी",
    atmosphericPressure: "वायुमंडलीय दबाव",
    windConditions: "हवा की स्थिति",
    airQuality: "वायु गुणवत्ता",
    soilConditions: "मिट्टी की स्थिति",
    growingDegreeDays: "बढ़ते हुए डिग्री दिन",
    heatIndex: "ऊष्मा सूचकांक",
    moonPhase: "चंद्रमा की अवस्था",
    todaysGDD: "आज का जी.डी.डी.",
    checking: "जाँच हो रही है...",
    ideal: "आदर्श",
    temperatureManagement: "तापमान प्रबंधन",
    humidityControl: "आर्द्रता नियंत्रण",
    waterManagement: "जल प्रबंधन",
    irrigationAdvice: "सिंचाई सलाह",
    protectionAdvice: "सुरक्षा सलाह",
    timingAdvice: "समय सलाह",
    generalAdvice: "सामान्य सलाह",
    irrigationStatus: "सिंचाई स्थिति",
    excellentFarmingConditions: "उत्कृष्ट खेती की स्थिति!",
    fairFarmingConditions: "उचित खेती की स्थिति",
    challengingConditions: "चुनौतीपूर्ण स्थिति",
    weatherPerfectForCrops: "मौसम आपकी फसलों के लिए उपयुक्त है। खेती के लिए शानदार समय।",
    weatherOkayWithAdjustments: "मौसम ठीक है। इष्टतम विकास के लिए कुछ समायोजनों की आवश्यकता हो सकती है।",
    weatherNeedsAttention: "मौसम को ध्यान देने की आवश्यकता है। सिफारिशों का पालन करें।",
    temperatureConditionsDetected: "तापमान की स्थिति का पता चला",
    humidityConditionsDetected: "आर्द्रता की स्थिति का पता चला",
    waterConditionsDetected: "जल की स्थिति का पता चला",
    irrigationRecommendationsAvailable: "सिंचाई की सिफारिशें उपलब्ध हैं",
    protectionRecommendationsBasedOnWeather: "वर्तमान मौसम के आधार पर सुरक्षा की सिफारिशें।",
    timingRecommendationsForFarming: "खेती के लिए समय सिफारिशें।",
    weatherConditionsSuitable: "मौसम की स्थिति खेती के लिए उपयुक्त है।",
    continueWithRegularFarming: "नियमित खेती प्रथाओं के साथ जारी रखें।",
    unableToLoadRecommendations: "सिफारिशें लोड करने में असमर्थ। कृपया पृष्ठ को रीफ्रेश करें।",
    unableToLoadIrrigationRecommendations: "सिंचाई की सिफारिशें लोड करने में असमर्थ। कृपया मौसम डेटा की जाँच करें।",
    irrigationRecommendationsBasedOnWeather: "वर्तमान मौसम की स्थिति के आधार पर सिंचाई की सिफारिशें।",
    allFarmingConditionsNormal: "सभी खेती की स्थितियाँ सामान्य सीमा में हैं",
    regularIrrigationNeeded: "नियमित सिंचाई की आवश्यकता है",
    basedOnWeatherConditions: "वर्तमान मौसम की स्थिति के आधार पर, इष्टतम फसल विकास के लिए नियमित सिंचाई की सिफारिश की जाती है।",
    weatherConditionsSuitableWithAdjustments: "मौसम की स्थिति खेती के लिए उपयुक्त है, कुछ समायोजनों की आवश्यकता हो सकती है।",
    frequency: "आवृत्ति",
    urgency: "तत्परता",
    priority: "प्राथमिकता",
    asNeeded: "आवश्यकतानुसार",
    regular: "नियमित",
    needed: "आवश्यक",
    notRequired: "आवश्यक नहीं",
    medium: "मध्यम",
    monitorTemperatureLevels: "तापमान स्तर की निगरानी करें",
    monitorHumidityLevels: "आर्द्रता स्तर की निगरानी करें",
    monitorWaterLevels: "जल स्तर की निगरानी करें",
    
    // Additional missing translations
    climateSyncFarming: "क्लाइमेटसिंक फार्मिंग",
    profitCalculator: "लाभ कैलकुलेटर",
    cropAnimations: "फसल एनिमेशन",
    moisture: "नमी",
    farmersDashboard: "किसान डैशबोर्ड",
    aiPoweredMonitoring: "एआई-संचालित जलवायु जोखिम निगरानी",
    realTimeMonitoring: "रियल-टाइम निगरानी",
    selectLocation: "एक स्थान चुनें",
    currentEnvironmentalConditions: "वर्तमान पर्यावरणीय स्थितियां",
    aiEnvironmentalPredictions: "एआई पर्यावरणीय भविष्यवाणियां",
    selectSmallTown: "एक छोटे शहर/गांव का चयन करें",
    predictAlerts: "अलर्ट भविष्यवाणी करें",
    currentAlertStatus: "वर्तमान अलर्ट स्थिति",
    monitorConditions: "रियल-टाइम पर्यावरणीय स्थितियों और जोखिमों की निगरानी करें",
    heatwaveAlert: "लू अलर्ट",
    highRisk: "उच्च जोखिम",
    current: "वर्तमान",
    duration: "अवधि",
    analyzeRisk: "जोखिम का विश्लेषण करें",
    setAlert: "अलर्ट सेट करें",
    floodPrediction: "बाढ़ भविष्यवाणी",
    moderateRisk: "मध्यम जोखिम",
    riverLevel: "नदी स्तर",
    peakTime: "चरम समय",
    checkStatus: "स्थिति जांचें",
    viewMap: "मानचित्र देखें",
    droughtWarning: "सूखा चेतावनी",
    lowRisk: "कम जोखिम",
    soilMoisture: "मिट्टी की नमी",
    assessRisk: "जोखिम का आकलन करें",
    viewTrends: "रुझान देखें",
    coastalMonitoring: "तटीय निगरानी",
    mediumRisk: "मध्यम जोखिम",
    stormSurge: "तूफानी लहर",
    waveHeight: "लहर की ऊंचाई",
    monitorCoast: "तट की निगरानी करें",
    satelliteView: "उपग्रह दृश्य",
    min: "न्यूनतम",
    max: "अधिकतम",
    
    // Dynamic content translations
    loadingFarmingConditions: "आपकी खेती की स्थितियां लोड हो रही हैं...",
    pleaseWaitAnalyzeWeather: "कृपया प्रतीक्षा करें जब हम मौसम का विश्लेषण करते हैं",
    loadingIrrigationAdvice: "सिंचाई सलाह लोड हो रही है...",
    calculatingWaterRequirements: "जल आवश्यकताओं की गणना कर रहे हैं...",
    farmSizeHectares: "खेत का आकार (हेक्टेयर)",
    aiAnalysisReady: "एआई विश्लेषण तैयार",
    cropAdvisoryAgent: "फसल सलाहकार एजेंट",
    personalizedCropRecommendations: "व्यक्तिगत फसल सिफारिशें",
    weatherPredictionAgent: "मौसम भविष्यवाणी एजेंट",
    advancedWeatherAnalysis: "उन्नत मौसम विश्लेषण",
    marketIntelligenceAgent: "बाजार बुद्धिमत्ता एजेंट",
    priceTrendsMarketInsights: "मूल्य रुझान और बाजार अंतर्दृष्टि",
    resourceOptimizationAgent: "संसाधन अनुकूलन एजेंट",
    waterFertilizerOptimization: "जल और उर्वरक अनुकूलन",
    riskAssessmentAgent: "जोखिम मूल्यांकन एजेंट",
    pestDiseaseClimateRiskAnalysis: "कीट, रोग और जलवायु जोखिम विश्लेषण",
    startAnimation: "एनिमेशन शुरू करें",
    pauseAnimation: "एनिमेशन रोकें",
    resumeAnimation: "एनिमेशन फिर से शुरू करें",
    refreshData: "डेटा ताज़ा करें",
    cropCalendar: "फसल कैलेंडर",
    expertTips: "विशेषज्ञ सुझाव",
    testWeather: "मौसम टेस्ट करें",
    testDashboard: "डैशबोर्ड टेस्ट करें",
    forceUpdate: "जबरदस्ती अपडेट करें",
    loadingFarmingInsights: "खेती अंतर्दृष्टि लोड हो रही है...",
    comingSoon: "जल्द आ रहा है...",
    seasonalCropCalendar: "मौसमी फसल कैलेंडर",
    loadingCalendar: "कैलेंडर लोड हो रहा है...",
    
    // Error and status messages
    pleaseEnterLocationToSearch: "खोजने के लिए कृपया एक स्थान दर्ज करें",
    noLocationsFound: "आपकी खोज के लिए कोई स्थान नहीं मिला। कृपया एक अलग शहर या गांव खोजने का प्रयास करें।",
    failedToSearchLocation: "स्थान खोजने में विफल। कृपया अपना कनेक्शन जांचें और फिर से कोशिश करें।",
    noLocationsFoundSimple: "आपकी खोज के लिए कोई स्थान नहीं मिला।",
    failedToSearchLocationSimple: "स्थान खोजने में विफल।",
    noLocationsFoundBasic: "कोई स्थान नहीं मिला।",
    unknown: "अज्ञात",
    spring: "वसंत",
    summer: "गर्मी",
    autumn: "शरद",
    winter: "सर्दी",
    wetSeason: "गीला मौसम",
    drySeason: "सूखा मौसम",
    aiAnalysisInProgress: "एआई विश्लेषण पहले से चल रहा है...",
    failedToLoadAIAnalysis: "एआई विश्लेषण लोड करने में विफल। कृपया फिर से कोशिश करें।",
    aiAnalysisFailed: "एआई विश्लेषण विफल",
    noCurrentWeatherData: "कोई वर्तमान मौसम डेटा नहीं मिला!",
    failedToLoadWeatherData: "मौसम डेटा लोड करने में विफल",
    errorGettingCurrentWeatherData: "वर्तमान मौसम डेटा प्राप्त करने में त्रुटि",
    
    // Additional UI elements
    foundLocations: "मिले स्थान:",
    loadingComprehensiveHeatwaveAnalysis: "व्यापक लू विश्लेषण लोड हो रहा है...",
    loadingFloodPredictionModels: "बाढ़ भविष्यवाणी मॉडल लोड हो रहे हैं...",
    loadingDroughtAssessmentData: "सूखा मूल्यांकन डेटा लोड हो रहा है...",
    loadingCoastalMonitoringSystems: "तटीय निगरानी प्रणाली लोड हो रही है...",
    climateSyncLoading: "क्लाइमेट-सिंक लोड हो रहा है...",
    initializingDashboard: "डैशबोर्ड प्रारंभ कर रहा है...",
    runningInSampleDataMode: "नमूना डेटा मोड में चल रहा है - वास्तविक डेटा अनुपलब्ध",
    retry: "पुनः प्रयास करें",
    probability: "संभावना",
    heatwaveAlertDetails: "लू अलर्ट:",
    floodPredictionDetails: "बाढ़ भविष्यवाणी:",
    droughtWarningDetails: "सूखा चेतावनी:",
    coastalMonitoringDetails: "तटीय निगरानी:",
    
    // Weather forecast translations
    weatherForecast: "मौसम पूर्वानुमान",
    hourly: "घंटेवार",
    daily: "दैनिक",
    
    // Additional farming terms
    rice: "चावल",
    wheat: "गेहूं",
    cotton: "कपास",
    sugarcane: "गन्ना",
    tomato: "टमाटर",
    onion: "प्याज"
  },
  
  ta: {
    // Header
    climate: "காலநிலை",
    sync: "ஒத்திசைவு",
    subtitle: "நேரலை வானிலை டாஷ்போர்டு",
    live: "நேரலை",
    
    // Controls
    searchPlaceholder: "உலகம் முழுவதும் எந்த நகரம், கிராமம் அல்லது இடத்தையும் தேடவும்...",
    search: "தேடு",
    refresh: "புதுப்பி",
    environmentalAlerts: "சுற்றுச்சூழல் எச்சரிக்கைகள்",
    farmingDashboard: "விவசாய டாஷ்போர்டு",
    farmerProfitCalculator: "விவசாயி லாப கணக்கீட்டாளர்",
    
    // Weather Cards
    temperature: "வெப்பநிலை",
    currentTemperature: "தற்போதைய வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    moistureLevel: "ஈரப்பத அளவு",
    rainfall: "மழைப்பொழிவு",
    lastHour: "கடந்த மணி",
    conditions: "நிபந்தனைகள்",
    weatherDescription: "வானிலை விளக்கம்",
    wind: "காற்று",
    direction: "திசை",
    pressure: "அழுத்தம்",
    trend: "போக்கு",
    uvIndex: "யுவி குறியீட்டு",
    level: "நிலை",
    feelsLike: "உணர்வு",
    apparentTemperature: "தெளிவான வெப்பநிலை",
    
    // Agricultural Data
    agriculturalWeatherData: "விவசாய வானிலை தரவு",
    soilTemperature: "மண் வெப்பநிலை",
    soilMoisture: "மண் ஈரப்பதம்",
    cmDepth: "0-7 செ.மீ ஆழம்",
    evapotranspiration: "வாஷ்போத்ஸர்ஜன்",
    referenceETO: "குறிப்பு ET₀",
    rainProbability: "மழை நிகழ்தகுதி",
    next24Hours: "அடுத்த 24 மணி நேரம்",
    
    // Data Info
    loading: "ஏற்றுகிறது...",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது",
    location: "இடம்",
    global: "உலகளாவிய",
    
    // Loading Messages
    connecting: "வானிலை நிலையத்துடன் இணைக்கிறது...",
    processing: "காலநிலை தகவல்களை செயலாக்குகிறது...",
    almostReady: "கிட்டத்தட்ட தயார்...",
    fetching: "வானிலை தரவை எடுக்கிறது...",
    
    // Weather Conditions
    clearSky: "தெளிந்த வானம்",
    fewClouds: "சில மேகங்கள்",
    scatteredClouds: "சிதறிய மேகங்கள்",
    brokenClouds: "உடைந்த மேகங்கள்",
    showerRain: "ஷவர் மழை",
    rain: "மழை",
    thunderstorm: "இடி மின்னல்",
    snow: "பனி",
    mist: "மூடுபனி",
    
    // Alerts
    floodAlert: "வெள்ளம் எச்சரிக்கை",
    heatAlert: "வெப்ப எச்சரிக்கை",
    low: "குறைவான",
    medium: "நடுத்தரம்",
    high: "உயர்",
    critical: "முக்கியமான",
    
    // Farming Dashboard Specific Translations
    smartFarmingDashboard: "ஸ்மார்ட் விவசாய டாஷ்போர்டு",
    weatherInsights: "விவசாயிகளுக்கான எளிமையான வானிலை நுண்ணறிவு",
    searchYourLocation: "உங்கள் இடத்தைத் தேடுங்கள்",
    selectYourCrop: "உங்கள் பயிரைத் தேர்ந்தெடுக்கவும்",
    growthStage: "வளர்ச்சி நிலை",
    seedling: "முளைப்பு",
    growing: "வளர்கிறது",
    flowering: "மலர்தல்",
    fruiting: "பழம் காய்தல்",
    harvest: "அறுவடை",
    comprehensiveWeather: "விரிவான வானிலை தகவல்",
    atmosphericPressure: "வளிமண்டல அழுத்தம்",
    windConditions: "காற்று நிலைமைகள்",
    airQuality: "காற்று தரம்",
    soilConditions: "மண் நிலைமைகள்",
    growingDegreeDays: "வளர்ச்சி டிகிரி நாட்கள்",
    heatIndex: "வெப்ப குறியீட்டு",
    moonPhase: "சந்திரன் கட்டம்",
    todaysGDD: "இன்றைய ஜி.டி.டி.",
    checking: "சரிபார்க்கிறது...",
    ideal: "இலக்கு",
    temperatureManagement: "வெப்பநிலை மேலாண்மை",
    humidityControl: "ஈரப்பதம் கட்டுப்பாடு",
    waterManagement: "நீர் மேலாண்மை",
    irrigationAdvice: "நீர்ப்பாசன ஆலோசனை",
    protectionAdvice: "பாதுகாப்பு ஆலோசனை",
    timingAdvice: "நேர ஆலோசனை",
    generalAdvice: "பொது ஆலோசனை",
    irrigationStatus: "நீர்ப்பாசன நிலை",
    excellentFarmingConditions: "சிறந்த விவசாய நிலைமைகள்!",
    fairFarmingConditions: "நல்ல விவசாய நிலைமைகள்",
    challengingConditions: "சவாலான நிலைமைகள்",
    weatherPerfectForCrops: "வானிலை உங்கள் பயிர்களுக்கு சிறந்தது. விவசாய நட activitiesக்களுக்கு சிறந்த நேரம்.",
    weatherOkayWithAdjustments: "வானிலை சரி. சிறந்த வளர்ச்சிக்கு சில சரிசெய்தல்கள் தேவைப்படலாம்.",
    weatherNeedsAttention: "வானிலைக்கு கவனம் தேவை. பரிந்துரைகளைப் பின்பற்றவும்.",
    temperatureConditionsDetected: "வெப்பநிலை நிலைமைகள் கண்டறியப்பட்டது",
    humidityConditionsDetected: "ஈரப்பதம் நிலைமைகள் கண்டறியப்பட்டது",
    waterConditionsDetected: "நீர் நிலைமைகள் கண்டறியப்பட்டது",
    irrigationRecommendationsAvailable: "நீர்ப்பாசன பரிந்துரைகள் கிடைக்கின்றன",
    protectionRecommendationsBasedOnWeather: "தற்போதைய வானிலையை அடிப்படையாகக் கொண்ட பாதுகாப்பு பரிந்துரைகள்.",
    timingRecommendationsForFarming: "விவசாயத்திற்கான நேர பரிந்துரைகள்.",
    weatherConditionsSuitable: "வானிலை நிலைமைகள் விவசாயத்திற்கு ஏற்றது.",
    continueWithRegularFarming: "வழக்கமான விவசாய நடைமுறைகளைத் தொடரவும்.",
    unableToLoadRecommendations: "பரிந்துரைகளை ஏற்ற முடியவில்லை. தயவுசெய்து பக்கத்தை புதுப்பிக்கவும்.",
    unableToLoadIrrigationRecommendations: "நீர்ப்பாசன பரிந்துரைகளை ஏற்ற முடியவில்லை. வானிலை தரவைச் சரிபார்க்கவும்.",
    irrigationRecommendationsBasedOnWeather: "தற்போதைய வானிலை நிலைமைகளை அடிப்படையாகக் கொண்ட நீர்ப்பாசன பரிந்துரைகள்.",
    allFarmingConditionsNormal: "அனைத்து விவசாய நிலைமைகளும் சாதாரண வரம்பில் உள்ளன",
    regularIrrigationNeeded: "வழக்கமான நீர்ப்பாசனம் தேவை",
    basedOnWeatherConditions: "தற்போதைய வானிலை நிலைமைகளை அடிப்படையாகக் கொண்டு, சிறந்த பயிர் வளர்ச்சிக்கு வழக்கமான நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.",
    weatherConditionsSuitableWithAdjustments: "வானிலை நிலைமைகள் விவசாயத்திற்கு ஏற்றது, சில சரிசெய்தல்கள் தேவைப்படலாம்.",
    frequency: "இடைவெளி",
    urgency: "அவசரம்",
    priority: "முன்னுரிமை",
    asNeeded: "தேவைப்படும்போது",
    regular: "வழக்கமான",
    needed: "தேவை",
    notRequired: "தேவையில்லை",
    medium: "நடுத்தரம்",
    monitorTemperatureLevels: "வெப்பநிலை மட்டங்களைக் கண்காணிக்கவும்",
    monitorHumidityLevels: "ஈரப்பதம் மட்டங்களைக் கண்காணிக்கவும்",
    monitorWaterLevels: "நீர் மட்டங்களைக் கண்காணிக்கவும்",
    
    // Additional missing translations
    climateSyncFarming: "காலநிலை ஒத்திசைவு விவசாயம்",
    profitCalculator: "லாப கணக்கீட்டாளர்",
    cropAnimations: "பயிர் அனிமேஷன்கள்",
    moisture: "ஈரப்பதம்",
    farmersDashboard: "விவசாயி டாஷ்போர்டு",
    aiPoweredMonitoring: "AI-இயக்கப்பட்ட காலநிலை ஆபத்து கண்காணிப்பு",
    realTimeMonitoring: "நேரடி கண்காணிப்பு",
    selectLocation: "ஒரு இடத்தைத் தேர்ந்தெடுக்கவும்",
    currentEnvironmentalConditions: "தற்போதைய சுற்றுச்சூழல் நிலைமைகள்",
    aiEnvironmentalPredictions: "AI சுற்றுச்சூழல் கணிப்புகள்",
    selectSmallTown: "ஒரு சிறிய நகரம்/கிராமத்தைத் தேர்ந்தெடுக்கவும்",
    predictAlerts: "எச்சரிக்கைகளை கணிக்கவும்",
    currentAlertStatus: "தற்போதைய எச்சரிக்கை நிலை",
    monitorConditions: "நேரடி சுற்றுச்சூழல் நிலைமைகள் மற்றும் ஆபத்துகளை கண்காணிக்கவும்",
    heatwaveAlert: "வெப்ப அலை எச்சரிக்கை",
    highRisk: "உயர் ஆபத்து",
    current: "தற்போதைய",
    duration: "கால அளவு",
    analyzeRisk: "ஆபத்தை பகுப்பாய்வு செய்யவும்",
    setAlert: "எச்சரிக்கையை அமைக்கவும்",
    floodPrediction: "வெள்ளம் கணிப்பு",
    moderateRisk: "மிதமான ஆபத்து",
    riverLevel: "ஆற்று மட்டம்",
    peakTime: "உச்ச நேரம்",
    checkStatus: "நிலையை சரிபார்க்கவும்",
    viewMap: "வரைபடத்தை பார்க்கவும்",
    droughtWarning: "வறட்சி எச்சரிக்கை",
    lowRisk: "குறைந்த ஆபத்து",
    soilMoisture: "மண் ஈரப்பதம்",
    assessRisk: "ஆபத்தை மதிப்பிடவும்",
    viewTrends: "போக்குகளை பார்க்கவும்",
    coastalMonitoring: "கடற்கரை கண்காணிப்பு",
    mediumRisk: "நடுத்தர ஆபத்து",
    stormSurge: "புயல் அலை",
    waveHeight: "அலை உயரம்",
    monitorCoast: "கடற்கரையை கண்காணிக்கவும்",
    satelliteView: "செயற்கைக்கோள் பார்வை",
    min: "குறைந்தது",
    max: "அதிகபட்சம்",
    
    // Dynamic content translations
    loadingFarmingConditions: "உங்கள் விவசாய நிலைமைகள் ஏற்றப்படுகின்றன...",
    pleaseWaitAnalyzeWeather: "வானிலையை பகுப்பாய்வு செய்யும்போது காத்திருக்கவும்",
    loadingIrrigationAdvice: "நீர்ப்பாசன ஆலோசனை ஏற்றப்படுகிறது...",
    calculatingWaterRequirements: "நீர் தேவைகளை கணக்கிடுகிறது...",
    farmSizeHectares: "விவசாய நில அளவு (ஹெக்டேர்)",
    aiAnalysisReady: "AI பகுப்பாய்வு தயார்",
    cropAdvisoryAgent: "பயிர் ஆலோசனை முகவர்",
    personalizedCropRecommendations: "தனிப்பட்ட பயிர் பரிந்துரைகள்",
    weatherPredictionAgent: "வானிலை கணிப்பு முகவர்",
    advancedWeatherAnalysis: "மேம்பட்ட வானிலை பகுப்பாய்வு",
    marketIntelligenceAgent: "சந்தை நுண்ணறிவு முகவர்",
    priceTrendsMarketInsights: "விலை போக்குகள் மற்றும் சந்தை நுண்ணறிவு",
    resourceOptimizationAgent: "வள ஆப்டிமைசேஷன் முகவர்",
    waterFertilizerOptimization: "நீர் மற்றும் உரம் ஆப்டிமைசேஷன்",
    riskAssessmentAgent: "ஆபத்து மதிப்பீடு முகவர்",
    pestDiseaseClimateRiskAnalysis: "பூச்சி, நோய் மற்றும் காலநிலை ஆபத்து பகுப்பாய்வு",
    startAnimation: "அனிமேஷனை தொடங்கவும்",
    pauseAnimation: "அனிமேஷனை இடைநிறுத்தவும்",
    resumeAnimation: "அனிமேஷனை மீண்டும் தொடங்கவும்",
    refreshData: "தரவை புதுப்பிக்கவும்",
    cropCalendar: "பயிர் காலண்டர்",
    expertTips: "நிபுணர் குறிப்புகள்",
    testWeather: "வானிலையை சோதிக்கவும்",
    testDashboard: "டாஷ்போர்டை சோதிக்கவும்",
    forceUpdate: "பலவந்தமாக புதுப்பிக்கவும்",
    loadingFarmingInsights: "விவசாய நுண்ணறிவு ஏற்றப்படுகிறது...",
    comingSoon: "விரைவில் வருகிறது...",
    seasonalCropCalendar: "பருவ பயிர் காலண்டர்",
    loadingCalendar: "காலண்டர் ஏற்றப்படுகிறது...",
    
    // Error and status messages
    pleaseEnterLocationToSearch: "தேடுவதற்கு ஒரு இடத்தை உள்ளிடவும்",
    noLocationsFound: "உங்கள் தேடலுக்கு எந்த இடங்களும் கிடைக்கவில்லை. வேறு நகரம் அல்லது கிராமத்தை தேட முயற்சிக்கவும்.",
    failedToSearchLocation: "இடத்தை தேடுவதில் தோல்வி. உங்கள் இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    noLocationsFoundSimple: "உங்கள் தேடலுக்கு எந்த இடங்களும் கிடைக்கவில்லை.",
    failedToSearchLocationSimple: "இடத்தை தேடுவதில் தோல்வி.",
    noLocationsFoundBasic: "எந்த இடங்களும் கிடைக்கவில்லை.",
    unknown: "அறியப்படாத",
    spring: "வசந்தம்",
    summer: "கோடை",
    autumn: "இலையுதிர்",
    winter: "குளிர்காலம்",
    wetSeason: "ஈரமான பருவம்",
    drySeason: "வறண்ட பருவம்",
    aiAnalysisInProgress: "AI பகுப்பாய்வு ஏற்கனவே நடந்து கொண்டிருக்கிறது...",
    failedToLoadAIAnalysis: "AI பகுப்பாய்வை ஏற்றுவதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.",
    aiAnalysisFailed: "AI பகுப்பாய்வு தோல்வி",
    noCurrentWeatherData: "தற்போதைய வானிலை தரவு கிடைக்கவில்லை!",
    failedToLoadWeatherData: "வானிலை தரவை ஏற்றுவதில் தோல்வி",
    errorGettingCurrentWeatherData: "தற்போதைய வானிலை தரவை பெறுவதில் பிழை",
    
    // Additional UI elements
    foundLocations: "கிடைத்த இடங்கள்:",
    loadingComprehensiveHeatwaveAnalysis: "விரிவான வெப்ப அலை பகுப்பாய்வு ஏற்றப்படுகிறது...",
    loadingFloodPredictionModels: "வெள்ளம் கணிப்பு மாதிரிகள் ஏற்றப்படுகின்றன...",
    loadingDroughtAssessmentData: "வறட்சி மதிப்பீடு தரவு ஏற்றப்படுகிறது...",
    loadingCoastalMonitoringSystems: "கடற்கரை கண்காணிப்பு அமைப்புகள் ஏற்றப்படுகின்றன...",
    climateSyncLoading: "காலநிலை-ஒத்திசைவு ஏற்றப்படுகிறது...",
    initializingDashboard: "டாஷ்போர்டு துவக்கப்படுகிறது...",
    runningInSampleDataMode: "மாதிரி தரவு பயன்முறையில் இயங்குகிறது - உண்மையான தரவு கிடைக்கவில்லை",
    retry: "மீண்டும் முயற்சிக்கவும்",
    probability: "நிகழ்தகவு",
    heatwaveAlertDetails: "வெப்ப அலை எச்சரிக்கை:",
    floodPredictionDetails: "வெள்ளம் கணிப்பு:",
    droughtWarningDetails: "வறட்சி எச்சரிக்கை:",
    coastalMonitoringDetails: "கடற்கரை கண்காணிப்பு:",
    
    // Weather forecast translations
    weatherForecast: "வானிலை முன்னறிவிப்பு",
    hourly: "மணிநேரம்",
    daily: "தினசரி",
    
    // Additional farming terms
    rice: "அரிசி",
    wheat: "கோதுமை",
    cotton: "பருத்தி",
    sugarcane: "கரும்பு",
    tomato: "தக்காளி",
    onion: "வெங்காயம்"
  },
  
  te: {
    // Header
    climate: "వాతావరణం",
    sync: "సమకాలీకరణ",
    subtitle: "లైవ్ వాతావరణ డాష్బోర్డ్",
    live: "లైవ్",
    
    // Controls
    searchPlaceholder: "ప్రపంచవ్యాప్తంగా ఏదైనా నగరం, గ్రామం లేదా స్థానాన్ని శోధించండి...",
    search: "శోధన",
    refresh: "రిఫ్రెష్",
    environmentalAlerts: "పర్యావరణ హెచ్చరికలు",
    farmingDashboard: "వ్యవసాయ డాష్బోర్డ్",
    farmerProfitCalculator: "రైతు లాభ లెక్కింపుదారుడు",
    
    // Weather Cards
    temperature: "ఉష్ణోగ్రత",
    currentTemperature: "ప్రస్తుత ఉష్ణోగ్రత",
    humidity: "తేమ",
    moistureLevel: "తేమ స్థాయి",
    rainfall: "వర్షపాతం",
    lastHour: "గత గంట",
    conditions: "పరిస్థితులు",
    weatherDescription: "వాతావరణ వివరణ",
    wind: "గాలి",
    direction: "దిశ",
    pressure: "పీడనం",
    trend: "పోకడ",
    uvIndex: "యువి సూచిక",
    level: "స్థాయి",
    feelsLike: "అనుభూతి కాలం",
    apparentTemperature: "స్పష్టమైన ఉష్ణోగ్రత",
    
    // Agricultural Data
    agriculturalWeatherData: "వ్యవసాయ వాతావరణ డేటా",
    soilTemperature: "నేల ఉష్ణోగ్రత",
    soilMoisture: "నేల తేమ",
    cmDepth: "0-7 సెం.మీ లోతు",
    evapotranspiration: "ఎవపోట్రాన్స్పిరేషన్",
    referenceETO: "సందర్భ ET₀",
    rainProbability: "వర్షపాత సంభావ్యత",
    next24Hours: "తదుపరి 24 గంటలు",
    
    // Data Info
    loading: "లోడవుతోంది...",
    lastUpdated: "చివరిగా నవీకరించబడింది",
    location: "స్థానం",
    global: "ప్రపంచవ్యాప్తంగా",
    
    // Loading Messages
    connecting: "వాతావరణ స్టేషన్‌కు కనెక్ట్ అవుతోంది...",
    processing: "వాతావరణ సమాచారాన్ని ప్రాసెస్ చేస్తోంది...",
    almostReady: "దాదాపు సిద్ధం...",
    fetching: "వాతావరణ డేటాను పొందుతోంది...",
    
    // Weather Conditions
    clearSky: "స్పష్టమైన ఆకాశం",
    fewClouds: "కొన్ని మేఘాలు",
    scatteredClouds: "చెదురు మేఘాలు",
    brokenClouds: "విరిగిన మేఘాలు",
    showerRain: "షవర్ వర్షం",
    rain: "వర్షం",
    thunderstorm: "ఉరుములతో కూడిన తుఫాను",
    snow: "మంచు",
    mist: "పొగమంచు",
    
    // Alerts
    floodAlert: "వరద హెచ్చరిక",
    heatAlert: "వేడి హెచ్చరిక",
    low: "తక్కువ",
    medium: "మధ్యస్థాయి",
    high: "అధిక",
    critical: "కీలకమైన"
  },
  
  mr: {
    // Header
    climate: "हवामान",
    sync: "सिंक",
    subtitle: "थेट हवामान डॅशबोर्ड",
    live: "थेट",
    
    // Controls
    searchPlaceholder: "जगभरातील कोणत्याही शहर, गाव किंवा स्थानाचा शोध घ्या...",
    search: "शोधा",
    refresh: "रीफ्रेश करा",
    environmentalAlerts: "पर्यावरणीय सूचना",
    farmingDashboard: "शेती डॅशबोर्ड",
    farmerProfitCalculator: "शेतकरी नफा गणनाकार",
    
    // Weather Cards
    temperature: "तापमान",
    currentTemperature: "सध्याचे तापमान",
    humidity: "आर्द्रता",
    moistureLevel: "आर्द्रता स्तर",
    rainfall: "पाऊस",
    lastHour: "शेवटचा तास",
    conditions: "परिस्थिती",
    weatherDescription: "हवामान वर्णन",
    wind: "वारा",
    direction: "दिशा",
    pressure: "दबाव",
    trend: "प्रवृत्ती",
    uvIndex: "यूव्ही निर्देशांक",
    level: "स्तर",
    feelsLike: "असे वाटते",
    apparentTemperature: "प्रत्यक्ष तापमान",
    
    // Agricultural Data
    agriculturalWeatherData: "शेती हवामान डेटा",
    soilTemperature: "मातीचे तापमान",
    soilMoisture: "मातीची आर्द्रता",
    cmDepth: "0-7 सेमी खोली",
    evapotranspiration: "वाष्पोत्सर्जन",
    referenceETO: "संदर्भ ET₀",
    rainProbability: "पावसाची शक्यता",
    next24Hours: "पुढील 24 तास",
    
    // Data Info
    loading: "लोड होत आहे...",
    lastUpdated: "शेवटचे अद्यतनित",
    location: "स्थान",
    global: "जागतिक",
    
    // Loading Messages
    connecting: "हवामान स्टेशनशी कनेक्ट करत आहे...",
    processing: "हवामान माहिती प्रक्रिया करत आहे...",
    almostReady: "जवळजवळ तयार...",
    fetching: "हवामान डेटा मिळवत आहे...",
    
    // Weather Conditions
    clearSky: "स्पष्ट आकाश",
    fewClouds: "काही मेघ",
    scatteredClouds: "फैललेले मेघ",
    brokenClouds: "तुटलेले मेघ",
    showerRain: "झमझम पाऊस",
    rain: "पाऊस",
    thunderstorm: "गडगडाट",
    snow: "हिम",
    mist: "धुके",
    
    // Alerts
    floodAlert: "पूर चेतावणी",
    heatAlert: "उष्णता चेतावणी",
    low: "कमी",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर"
  },
  
  bn: {
    // Header
    climate: "জলবায়ু",
    sync: "সিঙ্ক",
    subtitle: "লাইভ আবহাওয়া ড্যাশবোর্ড",
    live: "লাইভ",
    
    // Controls
    searchPlaceholder: "বিশ্বজুড়ে যেকোনো শহর, গ্রাম বা অবস্থান খুঁজুন...",
    search: "অনুসন্ধান করুন",
    refresh: "রিফ্রেশ করুন",
    environmentalAlerts: "পরিবেশগত সতর্কতা",
    farmingDashboard: "চাষাবাদ ড্যাশবোর্ড",
    farmerProfitCalculator: "কৃষক লাভ ক্যালকুলেটর",
    
    // Weather Cards
    temperature: "তাপমাত্রা",
    currentTemperature: "বর্তমান তাপমাত্রা",
    humidity: "আর্দ্রতা",
    moistureLevel: "আর্দ্রতা স্তর",
    rainfall: "বৃষ্টিপাত",
    lastHour: "শেষ ঘন্টা",
    conditions: "শর্তাবলী",
    weatherDescription: "আবহাওয়ার বর্ণনা",
    wind: "বাতাস",
    direction: "দিক",
    pressure: "চাপ",
    trend: "প্রবণতা",
    uvIndex: "ইউভি সূচক",
    level: "স্তর",
    feelsLike: "অনুভব হয়",
    apparentTemperature: "প্রকৃত তাপমাত্রা",
    
    // Agricultural Data
    agriculturalWeatherData: "কৃষি আবহাওয়া ডেটা",
    soilTemperature: "মাটির তাপমাত্রা",
    soilMoisture: "মাটির আর্দ্রতা",
    cmDepth: "0-7 সেমি গভীরতা",
    evapotranspiration: "বাষ্পোত্সর্গ",
    referenceETO: "রেফারেন্স ET₀",
    rainProbability: "বৃষ্টির সম্ভাবনা",
    next24Hours: "পরবর্তী 24 ঘন্টা",
    
    // Data Info
    loading: "লোড হচ্ছে...",
    lastUpdated: "সর্বশেষ আপডেট",
    location: "অবস্থান",
    global: "বৈশ্বিক",
    
    // Loading Messages
    connecting: "আবহাওয়া স্টেশনের সাথে সংযোগ করা হচ্ছে...",
    processing: "জলবায়ু তথ্য প্রক্রিয়াকরণ...",
    almostReady: "প্রায় প্রস্তুত...",
    fetching: "আবহাওয়া ডেটা আনা হচ্ছে...",
    
    // Weather Conditions
    clearSky: "পরিষ্কার আকাশ",
    fewClouds: "কয়েকটি মেঘ",
    scatteredClouds: "ছড়িয়ে পড়া মেঘ",
    brokenClouds: "ভাঙা মেঘ",
    showerRain: "ঝড়ো বৃষ্টি",
    rain: "বৃষ্টি",
    thunderstorm: "বজ্রপাতসহ ঝড়",
    snow: "তুষার",
    mist: "কুয়াশা",
    
    // Alerts
    floodAlert: "বন্যা সতর্কতা",
    heatAlert: "তাপ সতর্কতা",
    low: "কম",
    medium: "মাঝারি",
    high: "উচ্চ",
    critical: "গুরুতর"
  },
  
  gu: {
    // Header
    climate: "હવામાન",
    sync: "સિંક",
    subtitle: "લાઇવ હવામાન ડૅશબોર્ડ",
    live: "લાઇવ",
    
    // Controls
    searchPlaceholder: "વિશ્વભરના કોઈપણ શહેર, ગામ અથવા સ્થાનની શોધ કરો...",
    search: "શોધો",
    refresh: "રિફ્રેશ કરો",
    environmentalAlerts: "પર્યાવરણીય ચેતવણીઓ",
    farmingDashboard: "ખેતી ડૅશબોર્ડ",
    farmerProfitCalculator: "ખેડૂત નફો ગણક",
    
    // Weather Cards
    temperature: "તાપમાન",
    currentTemperature: "વર્તમાન તાપમાન",
    humidity: "આર્દ્રતા",
    moistureLevel: "આર્દ્રતા સ્તર",
    rainfall: "વરસાદ",
    lastHour: "છેલ્લો કલાક",
    conditions: "શરતો",
    weatherDescription: "હવામાન વર્ણન",
    wind: "હવા",
    direction: "દિશા",
    pressure: "દબાણ",
    trend: "વલણ",
    uvIndex: "યુવી સૂચકાંક",
    level: "સ્તર",
    feelsLike: "લાગે છે",
    apparentTemperature: "પ્રકટ તાપમાન",
    
    // Agricultural Data
    agriculturalWeatherData: "કૃષિ હવામાન ડેટા",
    soilTemperature: "માટીનું તાપમાન",
    soilMoisture: "માટીની આર્દ્રતા",
    cmDepth: "0-7 સેમી ઊંડાઈ",
    evapotranspiration: "બાષ્પોત્સર્જન",
    referenceETO: "સંદર્ભ ET₀",
    rainProbability: "વરસાદની સંભાવના",
    next24Hours: "આગામી 24 કલાક",
    
    // Data Info
    loading: "લોડ કરી રહ્યું છે...",
    lastUpdated: "છેલ્લે અપડેટ કરાયેલ",
    location: "સ્થાન",
    global: "વૈશ્વિક",
    
    // Loading Messages
    connecting: "હવામાન સ્ટેશન સાથે કનેક્ટ કરી રહ્યું છે...",
    processing: "હવામાન માહિતી પ્રક્રિયા કરી રહ્યું છે...",
    almostReady: "લગભગ તૈયાર...",
    fetching: "હવામાન ડેટા મેળવી રહ્યું છે...",
    
    // Weather Conditions
    clearSky: "સ્પષ્ટ આકાશ",
    fewClouds: "થોડા વાદળ",
    scatteredClouds: "છિટપિટ વાદળ",
    brokenClouds: "તૂટેલા વાદળ",
    showerRain: "ઝડપી વરસાદ",
    rain: "વરસાદ",
    thunderstorm: "ગરજવું અને વરસાદ",
    snow: "બરફ",
    mist: "ધુમ્મસ",
    
    // Alerts
    floodAlert: "સુનામી ચેતવણી",
    heatAlert: "ઉષ્ણતા ચેતવણી",
    low: "નીચું",
    medium: "મધ્યમ",
    high: "ઉચ્ચ",
    critical: "ગંભીર"
  },
  
  kn: {
    // Header
    climate: "ಹವಾಮಾನ",
    sync: "ಸಿಂಕ್",
    subtitle: "ಲೈವ್ ಹವಾಮಾನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    live: "ಲೈವ್",
    
    // Controls
    searchPlaceholder: "ಪ್ರಪಂಚದಾದ್ಯಂತದ ಯಾವುದೇ ನಗರ, ಹಳ್ಳಿ ಅಥವಾ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ...",
    search: "ಹುಡುಕಾಟ",
    refresh: "ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    environmentalAlerts: "ಪರಿಸರ ಎಚ್ಚರಿಕೆಗಳು",
    farmingDashboard: "ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    farmerProfitCalculator: "ರೈತರ ಲಾಭ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    
    // Weather Cards
    temperature: "ತಾಪಮಾನ",
    currentTemperature: "ಪ್ರಸ್ತುತ ತಾಪಮಾನ",
    humidity: "ಆರ್ದ್ರತೆ",
    moistureLevel: "ಆರ್ದ್ರತೆ ಮಟ್ಟ",
    rainfall: "ಮಳೆ",
    lastHour: "ಕೊನೆಯ ಗಂಟೆ",
    conditions: "ಪರಿಸ್ಥಿತಿಗಳು",
    weatherDescription: "ಹವಾಮಾನ ವಿವರಣೆ",
    wind: "ಗಾಳಿ",
    direction: "ದಿಕ್ಕು",
    pressure: "ಒತ್ತಡ",
    trend: "ಪ್ರವೃತ್ತಿ",
    uvIndex: "ಯುವಿ ಸೂಚಿಕೆ",
    level: "ಮಟ್ಟ",
    feelsLike: "ಅನುಭವವಾಗುತ್ತದೆ",
    apparentTemperature: "ಸ್ಪಷ್ಟ ತಾಪಮಾನ",
    
    // Agricultural Data
    agriculturalWeatherData: "ಕೃಷಿ ಹವಾಮಾನ ಡೇಟಾ",
    soilTemperature: "ಮಣ್ಣಿನ ತಾಪಮಾನ",
    soilMoisture: "ಮಣ್ಣಿನ ಆರ್ದ್ರತೆ",
    cmDepth: "0-7 ಸೆಂ.ಮೀ. ಆಳ",
    evapotranspiration: "ಬಾಷ್ಪೋತ್ಸರ್ಜನೆ",
    referenceETO: "ಉಲ್ಲೇಖ ET₀",
    rainProbability: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    next24Hours: "ಮುಂದಿನ 24 ಗಂಟೆಗಳು",
    
    // Data Info
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    lastUpdated: "ಕೊನೆಯ ಬಾರಿ ನವೀಕರಿಸಲಾಗಿದೆ",
    location: "ಸ್ಥಳ",
    global: "ಜಾಗತಿಕ",
    
    // Loading Messages
    connecting: "ಹವಾಮಾನ ಕೇಂದ್ರದೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲಾಗುತ್ತಿದೆ...",
    processing: "ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಪ್ರಕ್ರಿಯಿಸಲಾಗುತ್ತಿದೆ...",
    almostReady: "ಬಹುಶಃ ಸಿದ್ಧವಾಗಿದೆ...",
    fetching: "ಹವಾಮಾನ ಡೇಟಾವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    
    // Weather Conditions
    clearSky: "ಸ್ಪಷ್ಟ ಆಕಾಶ",
    fewClouds: "ಕೆಲವು ಮೋಡಗಳು",
    scatteredClouds: "ಚಿತರಿಸಿದ ಮೋಡಗಳು",
    brokenClouds: "ಮುರಿದ ಮೋಡಗಳು",
    showerRain: "ಜಲಪ್ರವಾಹ ಮಳೆ",
    rain: "ಮಳೆ",
    thunderstorm: "ಇಡಿಮೇಘಗಳು",
    snow: "ಹಿಮ",
    mist: "ಮೂಡುಮಂಚು",
    
    // Alerts
    floodAlert: "ವರ್ಷಾಭಿವೃದ್ಧಿ ಎಚ್ಚರಿಕೆ",
    heatAlert: "ಬಿಸಿಲಿನ ಎಚ್ಚರಿಕೆ",
    low: "ಕಡಿಮೆ",
    medium: "ಮಧ್ಯಮ",
    high: "ಎತ್ತರ",
    critical: "ತೀವ್ರ"
  },
  
  ml: {
    // Header
    climate: "കാലാവസ്ഥ",
    sync: "സിങ്ക്",
    subtitle: "തത്സമയ കാലാവസ്ഥ ഡാഷ്ബോർഡ്",
    live: "തത്സമയം",
    
    // Controls
    searchPlaceholder: "ലോകമെമ്പാടുമുള്ള ഏതെങ്കിലും നഗരം, ഗ്രാമം അല്ലെങ്കിൽ സ്ഥലം തിരയുക...",
    search: "തിരയുക",
    refresh: "പുതുക്കുക",
    environmentalAlerts: "പാരിസ്ഥിതിക മുന്നറിയിപ്പുകൾ",
    farmingDashboard: "കൃഷി ഡാഷ്ബോർഡ്",
    farmerProfitCalculator: "കർഷകൻ ലാഭ കാൽക്കുലേറ്റർ",
    
    // Weather Cards
    temperature: "താപനില",
    currentTemperature: "ഇപ്പോഴത്തെ താപനില",
    humidity: "ഈര്‍പ്പം",
    moistureLevel: "ഈര്‍പ്പ നില",
    rainfall: "മഴ",
    lastHour: "അവസാന മണിക്കൂർ",
    conditions: "അവസ്ഥകൾ",
    weatherDescription: "കാലാവസ്ഥ വിവരണം",
    wind: "കാറ്റ്",
    direction: "ദിശ",
    pressure: "മർദ്ദം",
    trend: "പ്രവണത",
    uvIndex: "യുവി സൂചിക",
    level: "നില",
    feelsLike: "തോന്നുന്നു",
    apparentTemperature: "പ്രത്യക്ഷമായ താപനില",
    
    // Agricultural Data
    agriculturalWeatherData: "കൃഷി കാലാവസ്ഥ ഡാറ്റ",
    soilTemperature: "മണ്ണിന്റെ താപനില",
    soilMoisture: "മണ്ണിന്റെ ഈര്‍പ്പം",
    cmDepth: "0-7 സെന്റിമീറ്റർ ആഴം",
    evapotranspiration: "ബാഷ്പോത്സർജ്ജനം",
    referenceETO: "റഫറൻസ് ET₀",
    rainProbability: "മഴയുടെ സാധ്യത",
    next24Hours: "അടുത്ത 24 മണിക്കൂർ",
    
    // Data Info
    loading: "ലോഡ് ചെയ്യുന്നു...",
    lastUpdated: "അവസാനം അപ്ഡേറ്റ് ചെയ്തത്",
    location: "സ്ഥലം",
    global: "ആഗോള",
    
    // Loading Messages
    connecting: "കാലാവസ്ഥ സ്റ്റേഷനുമായി ബന്ധിപ്പിക്കുന്നു...",
    processing: "കാലാവസ്ഥ വിവരങ്ങൾ പ്രോസസ്സ് ചെയ്യുന്നു...",
    almostReady: "ഏതാണ്ട് തയ്യാറായി...",
    fetching: "കാലാവസ്ഥ ഡാറ്റ എടുക്കുന്നു...",
    
    // Weather Conditions
    clearSky: "വ്യക്തമായ ആകാശം",
    fewClouds: "കുറച്ച് മേഘങ്ങൾ",
    scatteredClouds: "ചിതറിയ മേഘങ്ങൾ",
    brokenClouds: "തകർന്ന മേഘങ്ങൾ",
    showerRain: "ഷവർ മഴ",
    rain: "മഴ",
    thunderstorm: "ഇടിമിന്നലുള്ള കുഴിമഴ",
    snow: "മഞ്ഞ്",
    mist: "മൂടൽ മഞ്ഞ്",
    
    // Alerts
    floodAlert: "വെള്ളപ്പൊക്ക മുന്നറിയിപ്പ്",
    heatAlert: "ചൂട് മുന്നറിയിപ്പ്",
    low: "താഴ്ന്ന",
    medium: "ഇടത്തരം",
    high: "ഉയർന്ന",
    critical: "ഗുരുതരമായ"
  },
  
  pa: {
    // Header
    climate: "ਮੌਸਮ",
    sync: "ਸਿੰਕ",
    subtitle: "ਲਾਈਵ ਮੌਸਮ ਡੈਸ਼ਬੋਰਡ",
    live: "ਲਾਈਵ",
    
    // Controls
    searchPlaceholder: "ਸੰਸਾਰ ਭਰ ਵਿੱਚ ਕਿਸੇ ਵੀ ਸ਼ਹਿਰ, ਪਿੰਡ ਜਾਂ ਥਾਂ ਦੀ ਖੋਜ ਕਰੋ...",
    search: "ਖੋਜ",
    refresh: "ਤਾਜ਼ਾ ਕਰੋ",
    environmentalAlerts: "ਪਰ੍ਯਾਵਰਣ ਸੁਚੇਤਨਾਵਾਂ",
    farmingDashboard: "ਖੇਤੀਬਾੜੀ ਡੈਸ਼ਬੋਰਡ",
    farmerProfitCalculator: "ਕਿਸਾਨ ਲਾਭ ਕੈਲਕੁਲੇਟਰ",
    
    // Weather Cards
    temperature: "ਤਾਪਮਾਨ",
    currentTemperature: "ਮੌਜੂਦਾ ਤਾਪਮਾਨ",
    humidity: "ਨਮੀ",
    moistureLevel: "ਨਮੀ ਦਾ ਪੱਧਰ",
    rainfall: "ਵਰਖਾ",
    lastHour: "ਪਿਛਲੇ ਘੰਟੇ",
    conditions: "ਸ਼ਰਤਾਂ",
    weatherDescription: "ਮੌਸਮ ਵਰਣਨ",
    wind: "ਹਵਾ",
    direction: "ਦਿਸ਼ਾ",
    pressure: "ਦਬਾਅ",
    trend: "ਰੁਝਾਨ",
    uvIndex: "ਯੂਵੀ ਸੂਚਕਾਂਕ",
    level: "ਪੱਧਰ",
    feelsLike: "ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ",
    apparentTemperature: "ਸਪਸ਼ਟ ਤਾਪਮਾਨ",
    
    // Agricultural Data
    agriculturalWeatherData: "ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਡੇਟਾ",
    soilTemperature: "ਮਿੱਟੀ ਦਾ ਤਾਪਮਾਨ",
    soilMoisture: "ਮਿੱਟੀ ਦੀ ਨਮੀ",
    cmDepth: "0-7 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘਾਈ",
    evapotranspiration: "ਬਾਸ਼ਪੋਤਸਰਜਨ",
    referenceETO: "ਸੰਦਰਭ ET₀",
    rainProbability: "ਵਰਖਾ ਦੀ ਸੰਭਾਵਨਾ",
    next24Hours: "ਅਗਲੇ 24 ਘੰਟੇ",
    
    // Data Info
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    lastUpdated: "ਆਖਰੀ ਵਾਰ ਅਪਡੇਟ ਕੀਤਾ",
    location: "ਸਥਾਨ",
    global: "ਵਿਸ਼ਵ",
    
    // Loading Messages
    connecting: "ਮੌਸਮ ਸਟੇਸ਼ਨ ਨਾਲ ਕਨੈਕਟ ਕਰ ਰਿਹਾ ਹੈ...",
    processing: "ਮੌਸਮ ਜਾਣਕਾਰੀ ਦੀ ਪ੍ਰੋਸੈਸਿੰਗ...",
    almostReady: "ਲਗਭਗ ਤਿਆਰ...",
    fetching: "ਮੌਸਮ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕਰ ਰਿਹਾ ਹੈ...",
    
    // Weather Conditions
    clearSky: "ਸਪਸ਼ਟ ਆਸਮਾਨ",
    fewClouds: "ਕੁਝ ਬੱਦਲ",
    scatteredClouds: "ਬਿਖਰੇ ਬੱਦਲ",
    brokenClouds: "ਟੁੱਟੇ ਬੱਦਲ",
    showerRain: "ਝਮਝਮਾਤੀ ਵਰਖਾ",
    rain: "ਵਰਖਾ",
    thunderstorm: "ਤਿੜਕਾਰ ਅਤੇ ਬਿਜਲੀ",
    snow: "ਬਰਫ",
    mist: "ਧੁੰਦ",
    
    // Alerts
    floodAlert: "ਬਾੜ੍ਹ ਸੁਚੇਤਨਾ",
    heatAlert: "ਗਰਮੀ ਸੁਚੇਤਨਾ",
    low: "ਘੱਟ",
    medium: "ਮੱਧਮ",
    high: "ਉੱਚ",
    critical: "ਗੰਭੀਰ"
  },
  
  ur: {
    // Header
    climate: "آب و ہوا",
    sync: "ہم آہنگ کریں",
    subtitle: "براہ راست موسم کی ڈیش بورڈ",
    live: "براہ راست",
    
    // Controls
    searchPlaceholder: "دنیا بھر میں کسی بھی شہر، گاؤں یا مقام کو تلاش کریں...",
    search: "تلاش کریں",
    refresh: "تازہ کریں",
    environmentalAlerts: "ماحولیاتی انتباہات",
    farmingDashboard: "زراعت ڈیش بورڈ",
    farmerProfitCalculator: "کسان منافع کیلکولیٹر",
    
    // Weather Cards
    temperature: "درجہ حرارت",
    currentTemperature: "موجودہ درجہ حرارت",
    humidity: "نمی",
    moistureLevel: "نمی کی سطح",
    rainfall: "بارش",
    lastHour: "گزشتہ گھنٹہ",
    conditions: "حالات",
    weatherDescription: "موسم کی وضاحت",
    wind: "ہوا",
    direction: "سمت",
    pressure: "دباؤ",
    trend: "رجحان",
    uvIndex: "یووی انڈیکس",
    level: "سطح",
    feelsLike: "محسوس ہوتا ہے",
    apparentTemperature: "واضح درجہ حرارت",
    
    // Agricultural Data
    agriculturalWeatherData: "زراعت کے موسم کا ڈیٹا",
    soilTemperature: "مٹی کا درجہ حرارت",
    soilMoisture: "مٹی کی نمی",
    cmDepth: "0-7 سینٹی میٹر گہرائی",
    evapotranspiration: "تبخیر تبخیر",
    referenceETO: "حوالہ ET₀",
    rainProbability: "بارش کی امکان",
    next24Hours: "اگلے 24 گھنٹے",
    
    // Data Info
    loading: "لوڈ ہو رہا ہے...",
    lastUpdated: "آخری بار تازہ کردہ",
    location: "مقام",
    global: "عالمی",
    
    // Loading Messages
    connecting: "موسم کی اسٹیشن سے رابطہ قائم کر رہا ہے...",
    processing: "آب و ہوا کی معلومات پروسیسنگ...",
    almostReady: "تقریباً تیار...",
    fetching: "موسم کا ڈیٹا حاصل کر رہا ہے...",
    
    // Weather Conditions
    clearSky: "صاف آسمان",
    fewClouds: "چند بادل",
    scatteredClouds: "بکھرے ہوئے بادل",
    brokenClouds: "ٹوٹے ہوئے بادل",
    showerRain: "شاور بارش",
    rain: "بارش",
    thunderstorm: "گرج تیز بارش",
    snow: "برف",
    mist: "دھند",
    
    // Alerts
    floodAlert: "سیلاب کی انتباہ",
    heatAlert: "گرمی کی انتباہ",
    low: "کم",
    medium: "درمیانہ",
    high: "زیادہ",
    critical: "تنقیدی"
  }
};

// Language selector function
function setLanguage(lang) {
  // Store selected language in localStorage
  localStorage.setItem('selectedLanguage', lang);
  
  // Update all translatable elements
  updateLanguage(lang);
}

// Update language on page
function updateLanguage(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translations[lang][key];
      } else if (element.tagName === 'SELECT' || element.tagName === 'OPTION') {
        // For select and option elements, update the text content
        element.textContent = translations[lang][key];
      } else {
        // For other elements, check if they have child elements
        if (element.children.length > 0) {
          // If element has children, update the direct text nodes
          for (let i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
              element.childNodes[i].textContent = translations[lang][key];
            }
          }
        } else {
          // If no children, update textContent directly
          element.textContent = translations[lang][key];
        }
      }
    }
  });
  
  // Update language-specific attributes
  document.documentElement.lang = lang;
  
  // Dispatch a custom event to notify other scripts
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get current language (default to English)
function getCurrentLanguage() {
  return localStorage.getItem('selectedLanguage') || 'en';
}

// Translate text function for dynamic content
function translateText(key) {
  const currentLang = getCurrentLanguage();
  return translations[currentLang] && translations[currentLang][key] ? translations[currentLang][key] : key;
}

// Enhanced translation function with fallback
function translateTextWithFallback(key, fallback = null) {
  const currentLang = getCurrentLanguage();
  const translation = translations[currentLang] && translations[currentLang][key] ? translations[currentLang][key] : null;
  
  if (translation) {
    return translation;
  }
  
  // Fallback to English if available
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  
  // Use provided fallback or the key itself
  return fallback || key;
}

// Translate and update element text
function translateElement(element, key, fallback = null) {
  if (element) {
    element.textContent = translateTextWithFallback(key, fallback);
  }
}

// Translate and update element placeholder
function translatePlaceholder(element, key, fallback = null) {
  if (element) {
    element.placeholder = translateTextWithFallback(key, fallback);
  }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
  const currentLang = getCurrentLanguage();
  updateLanguage(currentLang);
});

// Listen for language changes from other scripts
document.addEventListener('languageChanged', function(event) {
  // This can be used by other scripts to react to language changes
  console.log('Language changed to:', event.detail.language);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, setLanguage, updateLanguage, getCurrentLanguage };
}