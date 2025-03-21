// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.open-meteo.com/v1',
    FORECAST_URL: 'https://api.open-meteo.com/v1/gfs',
    GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1',
    UNITS: 'metric',
    LANG: 'en'
};

// Weather Data Configuration
const WEATHER_CONFIG = {
    FORECAST_HOURS: 24,
    UPDATE_INTERVAL: 1800000, // 30 minutes in milliseconds
    DEFAULT_LOCATION: 'London, UK',
    SAVED_LOCATIONS_KEY: 'savedLocations'
};

// UI Configuration
const UI_CONFIG = {
    LOADING_TIMEOUT: 5000,
    ANIMATION_DURATION: 300,
    MAX_SAVED_LOCATIONS: 10
};

// Weather Analysis Thresholds
const WEATHER_THRESHOLDS = {
    WIND_SHEAR: {
        MIN_DIFFERENCE: 10, // m/s
        HEIGHT_DIFFERENCE: 1000 // meters
    },
    FOG: {
        VISIBILITY_THRESHOLD: 1000, // meters
        HUMIDITY_THRESHOLD: 90 // percentage
    },
    CLOUDS: {
        LOW_CLOUD_BASE: 1000, // meters
        OPTIMAL_CLOUD_COVER: 30 // percentage
    }
};

// Export configurations
export {
    API_CONFIG,
    WEATHER_CONFIG,
    UI_CONFIG,
    WEATHER_THRESHOLDS
}; 