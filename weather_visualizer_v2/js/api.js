import { API_CONFIG } from './config.js';

class WeatherAPI {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.forecastUrl = API_CONFIG.FORECAST_URL;
        this.geocodingUrl = API_CONFIG.GEOCODING_URL;
        this.units = API_CONFIG.UNITS;
        this.lang = API_CONFIG.LANG;
        this.searchTimeout = null;
        this.weatherCache = new Map(); // Store weather data for each location
        this.locationCache = new Map(); // Store location search results
        this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        // Load cached data from localStorage
        this.loadCacheFromStorage();
    }

    loadCacheFromStorage() {
        try {
            // Load weather cache
            const weatherData = localStorage.getItem('weatherCache');
            if (weatherData) {
                const parsed = JSON.parse(weatherData);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.weatherCache.set(key, value);
                });
                console.log('%c[Cache] Loaded weather cache from storage', 'color: purple');
            }

            // Load location cache
            const locationData = localStorage.getItem('locationCache');
            if (locationData) {
                const parsed = JSON.parse(locationData);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.locationCache.set(key, value);
                });
                console.log('%c[Cache] Loaded location cache from storage', 'color: purple');
            }
        } catch (error) {
            console.error('Error loading cache from storage:', error);
            this.clearCache(); // Clear both memory and storage on error
        }
    }

    saveCacheToStorage() {
        try {
            // Save weather cache
            const weatherObj = Object.fromEntries(this.weatherCache);
            localStorage.setItem('weatherCache', JSON.stringify(weatherObj));

            // Save location cache
            const locationObj = Object.fromEntries(this.locationCache);
            localStorage.setItem('locationCache', JSON.stringify(locationObj));

            console.log('%c[Cache] Saved to storage at ' + new Date().toLocaleTimeString(), 'color: purple');
        } catch (error) {
            console.error('Error saving cache to storage:', error);
        }
    }

    isCacheValid(cachedData) {
        return cachedData && (Date.now() - cachedData.timestamp < this.CACHE_DURATION);
    }

    async searchLocations(query) {
        try {
            // Check cache first
            const cacheKey = query.toLowerCase().trim();
            const cachedLocations = this.locationCache.get(cacheKey);
            
            if (this.isCacheValid(cachedLocations)) {
                console.log('%c[Cache Hit] Using cached location data for:', 'color: green', query);
                return cachedLocations.data;
            }

            console.log('%c[API Query] Fetching locations at ' + new Date().toLocaleTimeString(), 'color: blue; font-weight: bold');
            console.log('Query:', query);
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${this.lang}`,
                {
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                console.error('API response not OK:', response.status, response.statusText);
                throw new Error('Failed to fetch locations');
            }

            const data = await response.json();
            const locations = (data.results || []).map(item => {
                // Get state information for US locations
                let state = '';
                if (item.country === 'United States') {
                    // Extract state from admin1 field if available
                    state = item.admin1 || '';
                    // Convert full state name to abbreviation
                    state = this.getStateAbbreviation(state);
                }

                return {
                    name: item.name,
                    country: item.country,
                    state: state,
                    lat: item.latitude,
                    lon: item.longitude,
                    admin1: item.admin1 // Include full state name
                };
            });

            // Cache the results
            this.locationCache.set(cacheKey, {
                timestamp: Date.now(),
                data: locations
            });
            this.saveCacheToStorage(); // Save after updating cache

            console.log('Found locations:', locations.length);
            return locations;
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    async searchLocationsByCoords(lat, lon) {
        try {
            // Use radius-based search for more accurate results
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=loxahatchee&latitude=${lat}&longitude=${lon}&count=10&language=${this.lang}&radius=50`,
                {
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            
            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                // If no results found with Loxahatchee, try a broader search
                const fallbackResponse = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=10&language=${this.lang}&radius=10`,
                    {
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (!fallbackResponse.ok) {
                    throw new Error('Failed to fetch location data');
                }
                
                const fallbackData = await fallbackResponse.json();
                if (!fallbackData.results || fallbackData.results.length === 0) {
                    throw new Error('No location found for these coordinates');
                }
                
                data.results = fallbackData.results;
            }

            // Find the closest location that matches our criteria
            const location = data.results[0];
            let state = '';
            if (location.country === 'United States') {
                state = location.admin1 || '';
                state = this.getStateAbbreviation(state);
            }

            return [{
                name: location.name,
                country: location.country,
                state: state,
                lat: location.latitude,
                lon: location.longitude,
                admin1: location.admin1
            }];
        } catch (error) {
            console.error('Error searching locations by coordinates:', error);
            throw error;
        }
    }

    getStateAbbreviation(stateName) {
        const stateMap = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
            'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
            'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
            'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
            'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
            'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
            'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };
        return stateMap[stateName] || '';
    }

    async getWeatherForecast(lat, lon) {
        try {
            const cacheKey = `${lat},${lon}`;
            const cachedData = this.weatherCache.get(cacheKey);
            
            if (this.isCacheValid(cachedData)) {
                console.log('%c[Cache Hit] Using cached weather data for:', 'color: green', `${lat},${lon}`);
                return cachedData.data;
            }

            console.log('%c[API Query] Fetching weather at ' + new Date().toLocaleTimeString(), 'color: blue; font-weight: bold');
            console.log('Location:', `${lat},${lon}`);
            const response = await fetch(
                `${this.forecastUrl}?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_speed_850hPa,wind_speed_900hPa,wind_speed_925hPa,wind_speed_950hPa,wind_speed_975hPa,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_direction_850hPa,wind_direction_900hPa,wind_direction_925hPa,wind_direction_950hPa,wind_direction_975hPa&wind_speed_unit=mph&timezone=auto`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();
            const processedData = this.processWeatherData(data);

            // Cache the processed data
            this.weatherCache.set(cacheKey, {
                timestamp: Date.now(),
                data: processedData
            });
            this.saveCacheToStorage(); // Save after updating cache

            return processedData;
        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            throw error;
        }
    }

    processWeatherData(data) {
        if (!data.hourly || !data.hourly.time) {
            throw new Error('Invalid API response format');
        }

        const hourly = data.hourly;
        return hourly.time.map((time, index) => ({
            timestamp: new Date(time).getTime() / 1000,
            // Height-based wind speeds
            windSpeed10m: hourly.wind_speed_10m?.[index] || 0,
            windSpeed80m: hourly.wind_speed_80m?.[index] || 0,
            windSpeed120m: hourly.wind_speed_120m?.[index] || 0,
            windSpeed180m: hourly.wind_speed_180m?.[index] || 0,
            // Height-based wind directions
            windDirection10m: hourly.wind_direction_10m?.[index] || 0,
            windDirection80m: hourly.wind_direction_80m?.[index] || 0,
            windDirection120m: hourly.wind_direction_120m?.[index] || 0,
            windDirection180m: hourly.wind_direction_180m?.[index] || 0,
            // Pressure level data
            pressureLevels: {
                975: {
                    windSpeed: hourly.wind_speed_975hPa?.[index] || 0,
                    windDirection: hourly.wind_direction_975hPa?.[index] || 0
                },
                950: {
                    windSpeed: hourly.wind_speed_950hPa?.[index] || 0,
                    windDirection: hourly.wind_direction_950hPa?.[index] || 0
                },
                925: {
                    windSpeed: hourly.wind_speed_925hPa?.[index] || 0,
                    windDirection: hourly.wind_direction_925hPa?.[index] || 0
                },
                900: {
                    windSpeed: hourly.wind_speed_900hPa?.[index] || 0,
                    windDirection: hourly.wind_direction_900hPa?.[index] || 0
                },
                850: {
                    windSpeed: hourly.wind_speed_850hPa?.[index] || 0,
                    windDirection: hourly.wind_direction_850hPa?.[index] || 0
                }
            }
        }));
    }

    getWeatherDescription(clouds, visibility) {
        if (visibility < 1000) return 'Fog';
        if (clouds < 20) return 'Clear';
        if (clouds < 40) return 'Partly Cloudy';
        if (clouds < 80) return 'Cloudy';
        return 'Overcast';
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                }),
                error => reject(error)
            );
        });
    }

    clearCache() {
        this.weatherCache.clear();
        this.locationCache.clear();
        localStorage.removeItem('weatherCache');
        localStorage.removeItem('locationCache');
        console.log('%c[Cache] All caches cleared from memory and storage', 'color: orange');
    }

    getCacheStats() {
        return {
            weatherLocations: this.weatherCache.size,
            searchQueries: this.locationCache.size,
            oldestWeatherCache: this.getOldestCacheTime(this.weatherCache),
            oldestLocationCache: this.getOldestCacheTime(this.locationCache)
        };
    }

    getOldestCacheTime(cache) {
        let oldest = Date.now();
        for (const [_, value] of cache) {
            if (value.timestamp < oldest) {
                oldest = value.timestamp;
            }
        }
        return oldest === Date.now() ? null : oldest;
    }
}

// Create and export a singleton instance
const weatherAPI = new WeatherAPI();
export default weatherAPI; 