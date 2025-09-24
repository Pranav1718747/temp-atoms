# Global Weather API - Every City & Village

This API provides comprehensive weather data for **any location worldwide** including cities, villages, towns, and rural areas using the Open-Meteo API integration.

## 🌍 **Global Coverage**

- **195+ Countries** worldwide
- **Cities & Villages** of all sizes
- **Rural Areas** and remote locations
- **Coordinates-based** weather data
- **Real-time** and **14-day forecasts**

## 🚀 **New API Endpoints**

### 1. **Get Weather for Any Location**
```
GET /api/weather/location/:location?country=optional
```

**Examples:**
```bash
# Major cities
curl "http://localhost:4001/api/weather/location/Paris"
curl "http://localhost:4001/api/weather/location/Tokyo"

# Small villages
curl "http://localhost:4001/api/weather/location/Gokarna?country=India"
curl "http://localhost:4001/api/weather/location/Hallstatt?country=Austria"

# Rural areas
curl "http://localhost:4001/api/weather/location/Manali?country=India"
curl "http://localhost:4001/api/weather/location/Interlaken?country=Switzerland"

# Neighborhoods
curl "http://localhost:4001/api/weather/location/Brooklyn?country=USA"
```

**Response includes:**
- Current weather conditions
- 48-hour hourly forecast
- 14-day daily forecast
- Agricultural data (soil conditions)
- Location details with coordinates
- Alternative location matches

### 2. **Search for Locations**
```
GET /api/weather/search/:query?country=optional&limit=10
```

**Examples:**
```bash
# Find all places named "Salem"
curl "http://localhost:4001/api/weather/search/Salem"

# Find villages in India
curl "http://localhost:4001/api/weather/search/village?country=India&limit=20"

# Search with partial names
curl "http://localhost:4001/api/weather/search/Kath"
```

**Response includes:**
- Multiple matching locations
- Administrative divisions (state, district, etc.)
- Population data
- Coordinates and elevation
- Timezone information

### 3. **Weather by Exact Coordinates**
```
GET /api/weather/coordinates/:latitude/:longitude
```

**Examples:**
```bash
# Specific coordinates
curl "http://localhost:4001/api/weather/coordinates/28.6139/77.2090"  # Delhi
curl "http://localhost:4001/api/weather/coordinates/27.9881/86.9250"  # Mount Everest
curl "http://localhost:4001/api/weather/coordinates/0.0000/0.0000"    # Null Island
```

Perfect for:
- GPS-based weather requests
- Remote locations without names
- Precise coordinate weather data

## 📊 **Enhanced Weather Data**

### Current Conditions
- Temperature, humidity, pressure
- Precipitation (rain, showers, snow)
- Wind speed, direction, and gusts
- UV index and visibility
- Weather conditions and codes
- Day/night indicator

### Extended Forecasts
- **48-hour hourly forecast** with detailed parameters
- **14-day daily forecast** with min/max temperatures
- Precipitation probability and amounts
- Sunrise/sunset times
- Daylight and sunshine duration

### Agricultural Data
- Soil temperature (surface and 6cm depth)
- Soil moisture (surface and root zone)
- Dew point calculations
- Agricultural weather codes

### Location Intelligence
- Multiple administrative levels (country, state, district, village)
- Population data when available
- Elevation and timezone
- Postal codes for some locations

## 🎯 **Use Cases**

### 1. **Rural & Agricultural Applications**
```bash
# Weather for farming villages
curl "http://localhost:4001/api/weather/location/Baramati?country=India"
curl "http://localhost:4001/api/weather/location/Champaran?country=India"
```

### 2. **Tourism & Travel**
```bash
# Small tourist destinations
curl "http://localhost:4001/api/weather/location/Zermatt?country=Switzerland"
curl "http://localhost:4001/api/weather/location/Banff?country=Canada"
```

### 3. **Remote Areas**
```bash
# Weather stations and remote locations
curl "http://localhost:4001/api/weather/coordinates/78.9629/11.9304"  # Ny-Ålesund, Svalbard
```

### 4. **Global Business Operations**
```bash
# Any business location worldwide
curl "http://localhost:4001/api/weather/location/Singapore"
curl "http://localhost:4001/api/weather/location/Lagos?country=Nigeria"
```

## 🔍 **Smart Location Search**

The API includes intelligent location matching:

1. **Exact matches** are prioritized
2. **Multiple results** for ambiguous names
3. **Suggestions** when location not found
4. **Country filtering** for better accuracy
5. **Administrative hierarchy** (state, district, village)

## 📈 **Response Format Examples**

### Location Weather Response
```json
{
  "success": true,
  "location": {
    "searched": "Gokarna",
    "found": "Gokarna",
    "country": "India",
    "admin1": "Karnataka",
    "admin2": "Uttara Kannada",
    "latitude": 14.5492,
    "longitude": 74.3188,
    "elevation": 10,
    "population": 25000
  },
  "weather": {
    "current": {
      "temperature": 28.5,
      "humidity": 78,
      "precipitation": 0,
      "weather_description": "partly cloudy",
      "wind_speed": 12.4,
      "uv_index": 6.2
    },
    "hourly_forecast": [...],
    "daily_forecast": [...]
  },
  "alternativeLocations": [...]
}
```

### Location Search Response
```json
{
  "success": true,
  "query": "Salem",
  "count": 5,
  "results": [
    {
      "name": "Salem",
      "country": "India",
      "admin1": "Tamil Nadu",
      "admin2": "Salem",
      "latitude": 11.664,
      "longitude": 78.146,
      "population": 1041134
    },
    {
      "name": "Salem",
      "country": "United States",
      "admin1": "Oregon",
      "admin2": "Marion County",
      "latitude": 44.9429,
      "longitude": -123.0351,
      "population": 175535
    }
  ]
}
```

## 🌟 **Key Features**

### ✅ **Global Coverage**
- **Worldwide** location support
- **No geographical restrictions**
- **Villages and rural areas** included

### ✅ **Smart Search**
- **Fuzzy matching** for misspellings
- **Multiple language** support
- **Administrative filtering**

### ✅ **Comprehensive Data**
- **14-day forecasts**
- **Agricultural parameters**
- **Hourly predictions**

### ✅ **High Performance**
- **Fast API responses**
- **No rate limits** (Open-Meteo)
- **Reliable service**

### ✅ **Easy Integration**
- **RESTful API**
- **JSON responses**
- **Clear error handling**

## 🔧 **Error Handling**

### Location Not Found
```json
{
  "success": false,
  "error": "Location 'Atlantis' not found. Please check spelling or try a different name.",
  "suggestions": [
    {"name": "Atlanta", "country": "United States"},
    {"name": "Atlantic City", "country": "United States"}
  ]
}
```

### Invalid Coordinates
```json
{
  "success": false,
  "error": "Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180."
}
```

## 🎨 **Integration Examples**

### JavaScript/Node.js
```javascript
// Get weather for any location
const getWeatherForLocation = async (location, country = null) => {
  const url = `http://localhost:4001/api/weather/location/${location}${country ? `?country=${country}` : ''}`;
  const response = await fetch(url);
  return await response.json();
};

// Search for locations
const searchLocations = async (query, country = null, limit = 10) => {
  const url = `http://localhost:4001/api/weather/search/${query}?country=${country}&limit=${limit}`;
  const response = await fetch(url);
  return await response.json();
};
```

### Python
```python
import requests

def get_weather_for_location(location, country=None):
    url = f"http://localhost:4001/api/weather/location/{location}"
    params = {"country": country} if country else {}
    response = requests.get(url, params=params)
    return response.json()

def search_locations(query, country=None, limit=10):
    url = f"http://localhost:4001/api/weather/search/{query}"
    params = {"country": country, "limit": limit}
    response = requests.get(url, params=params)
    return response.json()
```

## 🚀 **Live Testing**

Your enhanced API is now running at **http://localhost:4001**

**Test with any location:**
```bash
# Test with your local village/town
curl "http://localhost:4001/api/weather/location/YourVillageName?country=YourCountry"

# Search for places near you
curl "http://localhost:4001/api/weather/search/YourAreaName"

# Get weather by coordinates
curl "http://localhost:4001/api/weather/coordinates/YourLat/YourLon"
```

Now you can get weather data for **every city, village, and location** worldwide! 🌍🌤️