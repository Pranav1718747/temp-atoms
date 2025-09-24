const https = require('https');
const http = require('http');

/**
 * CropAPIService - Integrates multiple external crop APIs to provide
 * comprehensive crop data including production statistics, market prices,
 * and farming recommendations from various government and agricultural sources
 */
class CropAPIService {
  constructor() {
    // Configuration for multiple crop data APIs
    this.apis = {
      // Government of India Agriculture API
      agriIndia: {
        baseUrl: 'https://api.data.gov.in/resource',
        apiKey: process.env.AGRI_INDIA_API_KEY || '',
        endpoints: {
          crops: '/crops.json',
          production: '/crop-production.json',
          prices: '/crop-prices.json'
        }
      },
      // FAO (Food and Agriculture Organization) API
      fao: {
        baseUrl: 'http://www.fao.org/faostat/api/v1',
        endpoints: {
          production: '/data/QC',
          prices: '/data/PP'
        }
      },
      // Agricultural Market Intelligence API
      agriMarket: {
        baseUrl: 'https://api.agmarknet.gov.in',
        apiKey: process.env.AGRI_MARKET_API_KEY || '',
        endpoints: {
          prices: '/getPriceData',
          markets: '/getMarkets'
        }
      }
    };

    // Timeout for API requests (10 seconds)
    this.timeout = 10000;
    
    // Cache for API responses (simple in-memory cache)
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Main method to get comprehensive crop data from multiple sources
   */
  async getComprehensiveCropData(cropName, location = {}) {
    try {
      console.log(`Fetching comprehensive crop data for: ${cropName}`);
      
      // Check cache first
      const cacheKey = `${cropName}-${JSON.stringify(location)}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('Returning cached crop data');
          return cached.data;
        }
      }

      // Fetch data from multiple sources in parallel
      const [cropData, productionData, priceData] = await Promise.allSettled([
        this.getIndiaCropData(location.state, location.district),
        this.getCropProduction(cropName),
        this.getCropPrices(cropName, location.market)
      ]);

      // Combine all data sources
      const combinedData = {
        cropName,
        location,
        timestamp: new Date().toISOString(),
        basicInfo: this.extractCropInfo(cropData, cropName),
        production: this.extractProductionData(productionData, cropName),
        marketPrices: this.extractPriceData(priceData, cropName),
        recommendations: this.generateRecommendations(cropName, location),
        sources: ['Government of India', 'FAO', 'Agricultural Market Intelligence']
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: combinedData,
        timestamp: Date.now()
      });

      return combinedData;
    } catch (error) {
      console.error('Error fetching comprehensive crop data:', error);
      return this.getFallbackCropData(cropName, location);
    }
  }

  /**
   * Get crop data from Government of India APIs
   */
  async getIndiaCropData(state = '', district = '') {
    try {
      const url = `${this.apis.agriIndia.baseUrl}${this.apis.agriIndia.endpoints.crops}`;
      const params = new URLSearchParams({
        'api-key': this.apis.agriIndia.apiKey,
        format: 'json',
        limit: 100
      });

      if (state) params.append('filters[state]', state);
      if (district) params.append('filters[district]', district);

      const fullUrl = `${url}?${params.toString()}`;
      return await this.makeHttpRequest(fullUrl);
    } catch (error) {
      console.error('Error fetching India crop data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get crop production statistics
   */
  async getCropProduction(cropName) {
    try {
      // Try multiple sources for production data
      const sources = [
        this.getIndiaProductionData(cropName),
        this.getFAOProductionData(cropName)
      ];

      const results = await Promise.allSettled(sources);
      
      // Return the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          return result.value;
        }
      }

      return { success: false, error: 'No production data available' };
    } catch (error) {
      console.error('Error fetching crop production:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get crop market prices
   */
  async getCropPrices(cropName, market = '') {
    try {
      const url = `${this.apis.agriMarket.baseUrl}${this.apis.agriMarket.endpoints.prices}`;
      const params = new URLSearchParams({
        'api-key': this.apis.agriMarket.apiKey,
        commodity: cropName,
        format: 'json'
      });

      if (market) params.append('market', market);

      const fullUrl = `${url}?${params.toString()}`;
      return await this.makeHttpRequest(fullUrl);
    } catch (error) {
      console.error('Error fetching crop prices:', error);
      return this.getFallbackPriceData(cropName);
    }
  }

  /**
   * Get India-specific production data
   */
  async getIndiaProductionData(cropName) {
    try {
      const url = `${this.apis.agriIndia.baseUrl}${this.apis.agriIndia.endpoints.production}`;
      const params = new URLSearchParams({
        'api-key': this.apis.agriIndia.apiKey,
        format: 'json',
        'filters[crop]': cropName,
        limit: 50
      });

      const fullUrl = `${url}?${params.toString()}`;
      return await this.makeHttpRequest(fullUrl);
    } catch (error) {
      console.error('Error fetching India production data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get FAO production data
   */
  async getFAOProductionData(cropName) {
    try {
      const url = `${this.apis.fao.baseUrl}${this.apis.fao.endpoints.production}`;
      const params = new URLSearchParams({
        area: '356', // India country code
        item: this.mapCropToFAOCode(cropName),
        year: '2023',
        format: 'json'
      });

      const fullUrl = `${url}?${params.toString()}`;
      return await this.makeHttpRequest(fullUrl);
    } catch (error) {
      console.error('Error fetching FAO production data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Make HTTP request with timeout
   */
  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.timeout);

      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        clearTimeout(timeout);
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ success: true, data: parsedData });
          } catch (error) {
            resolve({ success: false, error: 'Invalid JSON response' });
          }
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      req.setTimeout(this.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Extract relevant crop information from API responses
   */
  extractCropInfo(apiResponse, cropName) {
    if (!apiResponse || !apiResponse.success || !apiResponse.data) {
      return this.getFallbackCropInfo(cropName);
    }

    try {
      const records = apiResponse.data.records || [];
      const cropRecord = records.find(record => 
        record.crop && record.crop.toLowerCase().includes(cropName.toLowerCase())
      );

      if (cropRecord) {
        return {
          name: cropRecord.crop || cropName,
          variety: cropRecord.variety || 'Common',
          season: cropRecord.season || 'Kharif/Rabi',
          duration: cropRecord.duration || '90-120 days',
          yield: cropRecord.yield || 'Variable',
          source: 'Government of India'
        };
      }
    } catch (error) {
      console.error('Error extracting crop info:', error);
    }

    return this.getFallbackCropInfo(cropName);
  }

  /**
   * Extract production statistics from API responses
   */
  extractProductionData(apiResponse, cropName) {
    if (!apiResponse || !apiResponse.success) {
      return this.getFallbackProductionData(cropName);
    }

    try {
      const data = apiResponse.data;
      return {
        totalProduction: data.total_production || 'Data not available',
        majorStates: data.major_states || ['Punjab', 'Haryana', 'Uttar Pradesh'],
        yearlyTrend: data.yearly_trend || 'Stable',
        area: data.cultivation_area || 'Variable',
        productivity: data.productivity || 'Medium',
        source: 'Agricultural Statistics'
      };
    } catch (error) {
      console.error('Error extracting production data:', error);
    }

    return this.getFallbackProductionData(cropName);
  }

  /**
   * Extract price data from API responses
   */
  extractPriceData(apiResponse, cropName) {
    if (!apiResponse || !apiResponse.success) {
      return this.getFallbackPriceData(cropName);
    }

    try {
      const data = apiResponse.data;
      return {
        currentPrice: data.current_price || 'Variable',
        priceRange: data.price_range || '₹2000-5000/quintal',
        trend: data.trend || 'Stable',
        lastUpdated: new Date().toLocaleDateString(),
        markets: data.markets || ['Delhi', 'Mumbai', 'Kolkata'],
        source: 'Agricultural Market Intelligence'
      };
    } catch (error) {
      console.error('Error extracting price data:', error);
    }

    return this.getFallbackPriceData(cropName);
  }

  /**
   * Generate farming recommendations based on crop and location
   */
  generateRecommendations(cropName, location) {
    const recommendations = {
      planting: `Best planting time for ${cropName} varies by region. Generally, plant during appropriate season.`,
      irrigation: `Maintain adequate water supply. ${cropName} requires consistent moisture during growing period.`,
      fertilizer: `Use balanced NPK fertilizer. Apply organic manure before planting.`,
      pestControl: `Monitor for common pests. Use integrated pest management practices.`,
      harvest: `Harvest when crop reaches maturity. Timing is crucial for quality and yield.`,
      market: `Check local market prices before selling. Consider value addition opportunities.`
    };

    // Add location-specific recommendations if available
    if (location.state) {
      recommendations.location = `In ${location.state}, consider local climate and soil conditions for ${cropName} cultivation.`;
    }

    return recommendations;
  }

  /**
   * Map crop names to FAO commodity codes
   */
  mapCropToFAOCode(cropName) {
    const mapping = {
      'rice': '27',
      'wheat': '15',
      'maize': '56',
      'cotton': '328',
      'sugarcane': '156',
      'soybean': '236',
      'potato': '116',
      'onion': '403',
      'tomato': '388'
    };

    return mapping[cropName.toLowerCase()] || '27'; // Default to rice
  }

  /**
   * Fallback crop data when APIs are unavailable
   */
  getFallbackCropData(cropName, location) {
    return {
      cropName,
      location,
      timestamp: new Date().toISOString(),
      basicInfo: this.getFallbackCropInfo(cropName),
      production: this.getFallbackProductionData(cropName),
      marketPrices: this.getFallbackPriceData(cropName),
      recommendations: this.generateRecommendations(cropName, location),
      sources: ['Fallback Data'],
      note: 'External APIs unavailable. Displaying cached/fallback data.'
    };
  }

  /**
   * Fallback crop information
   */
  getFallbackCropInfo(cropName) {
    const fallbackData = {
      rice: { duration: '120-150 days', season: 'Kharif', yield: '4-6 tons/hectare' },
      wheat: { duration: '110-130 days', season: 'Rabi', yield: '3-5 tons/hectare' },
      maize: { duration: '90-110 days', season: 'Kharif/Rabi', yield: '5-7 tons/hectare' },
      cotton: { duration: '160-200 days', season: 'Kharif', yield: '1-2 tons/hectare' },
      sugarcane: { duration: '300-365 days', season: 'Annual', yield: '60-80 tons/hectare' }
    };

    const info = fallbackData[cropName.toLowerCase()] || fallbackData.rice;
    return {
      name: cropName,
      variety: 'Common',
      season: info.season,
      duration: info.duration,
      yield: info.yield,
      source: 'Fallback Data'
    };
  }

  /**
   * Fallback production data
   */
  getFallbackProductionData(cropName) {
    return {
      totalProduction: 'Data temporarily unavailable',
      majorStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal'],
      yearlyTrend: 'Generally stable with seasonal variations',
      area: 'Cultivated across multiple states',
      productivity: 'Varies by region and farming practices',
      source: 'Fallback Data'
    };
  }

  /**
   * Fallback price data
   */
  getFallbackPriceData(cropName) {
    const basePrices = {
      rice: '₹2500-3500/quintal',
      wheat: '₹2000-2800/quintal',
      maize: '₹1800-2500/quintal',
      cotton: '₹5500-7000/quintal',
      sugarcane: '₹350-450/quintal'
    };

    return {
      currentPrice: basePrices[cropName.toLowerCase()] || '₹2000-4000/quintal',
      priceRange: basePrices[cropName.toLowerCase()] || '₹2000-4000/quintal',
      trend: 'Prices vary by season and market conditions',
      lastUpdated: new Date().toLocaleDateString(),
      markets: ['Local Market', 'Mandi', 'Agricultural Produce Market Committee'],
      source: 'Fallback Data'
    };
  }

  /**
   * Search crops by name or keyword
   */
  async searchCrops(query, limit = 10) {
    try {
      console.log(`Searching crops with query: ${query}`);
      
      // For now, search in local crop data since external search APIs are not readily available
      const localCrops = {
        rice: { name: 'Rice', icon: '🌾', seasons: ['Kharif', 'Rabi'] },
        wheat: { name: 'Wheat', icon: '🌾', seasons: ['Rabi'] },
        cotton: { name: 'Cotton', icon: '🌱', seasons: ['Kharif'] },
        sugarcane: { name: 'Sugarcane', icon: '🎋', seasons: ['Kharif', 'Rabi'] },
        tomato: { name: 'Tomato', icon: '🍅', seasons: ['Kharif', 'Rabi'] },
        onion: { name: 'Onion', icon: '🧅', seasons: ['Rabi'] },
        potato: { name: 'Potato', icon: '🥔', seasons: ['Rabi'] },
        maize: { name: 'Maize', icon: '🌽', seasons: ['Kharif', 'Rabi'] },
        soybean: { name: 'Soybean', icon: '🫘', seasons: ['Kharif'] },
        barley: { name: 'Barley', icon: '🌾', seasons: ['Rabi'] }
      };
      
      const searchResults = Object.entries(localCrops)
        .filter(([key, crop]) => 
          crop.name.toLowerCase().includes(query.toLowerCase()) ||
          key.includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map(([key, crop]) => ({
          name: crop.name,
          key: key,
          icon: crop.icon,
          seasons: crop.seasons,
          source: 'Local Database'
        }));
      
      return searchResults;
    } catch (error) {
      console.error('Error searching crops:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or periodic cleanup)
   */
  clearCache() {
    this.cache.clear();
    console.log('Crop API cache cleared');
  }
}

module.exports = CropAPIService;