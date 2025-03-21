import { WEATHER_CONFIG } from './config.js';
import weatherAPI from './api.js';
import weatherAnalyzer from './weather.js';
import ui from './ui.js';

class SoarForecaster {
    constructor() {
        this.currentLocation = null;
        this.weatherData = null;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Set up UI callbacks
            ui.weatherFetchCallback = (location) => this.handleFetchWeather(location);
            ui.onToggle = (toggleType) => this.handleToggle(toggleType);
            ui.onLocationSearch = (query) => this.handleLocationSearch(query);
            ui.onLocationSelect = (location) => this.handleLocationSelect(location);
            ui.onDeleteLocation = this.deleteLocation.bind(this);
            ui.onAddCurrentLocation = () => this.handleAddCurrentLocation();
            ui.onSaveLocation = () => this.handleSaveLocation();

            // Set up event handlers
            this.setupEventHandlers();

            // Load and display saved locations
            const savedLocations = this.loadSavedLocations();
            ui.updateSavedLocationsList(savedLocations);

            // Try to load the last queried location first
            const lastQueriedLocation = localStorage.getItem('lastQueriedLocation');
            
            if (lastQueriedLocation) {
                try {
                    await this.fetchWeatherData(lastQueriedLocation.split(',')[0]); // Use only the city name
                    return;
                } catch (error) {
                    console.log('Failed to load last queried location:', error);
                    // Continue to try other initialization methods
                }
            }

            // If no last queried location or it failed, try saved locations
            if (savedLocations.length > 0) {
                try {
                    await this.fetchWeatherData(savedLocations[0].split(',')[0]); // Use only the city name
                    return;
                } catch (error) {
                    console.log('Failed to load from saved locations:', error);
                    // Continue to try geolocation
                }
            }

            // If no saved locations or they failed, try geolocation
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    
                    const locations = await weatherAPI.searchLocationsByCoords(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    
                    if (locations.length > 0) {
                        await this.fetchWeatherData(locations[0].name);
                        return;
                    }
                } catch (error) {
                    console.log('Geolocation failed:', error);
                }
            }

            // If all initialization methods fail, use a default location
            try {
                await this.fetchWeatherData('Loxahatchee');
            } catch (error) {
                console.error('Failed to load default location:', error);
                ui.showError('Please enter a location to get started');
            }
            
        } catch (error) {
            console.error('Error initializing app:', error);
            ui.showError('Failed to initialize the application');
        }
    }

    setupEventHandlers() {
        // Handle fetch weather button
        ui.fetchButton.addEventListener('click', () => this.handleFetchWeather());
        
        // Handle GPS location button
        if (ui.gpsLocationButton) {
            ui.gpsLocationButton.addEventListener('click', () => this.handleAddCurrentLocation());
        }
        
        // Handle reset all button
        if (ui.toggleButtons.resetAll) {
            ui.toggleButtons.resetAll.addEventListener('click', () => this.handleResetAll());
        }
    }

    async handleFetchWeather(location) {
        if (!location) {
            ui.showError('Please enter a location');
            return;
        }

        try {
            ui.showLoading();
            await this.fetchWeatherData(location);
        } catch (error) {
            console.error('Error fetching weather:', error);
            ui.showError(error.message || 'Failed to fetch weather data');
        } finally {
            ui.hideLoading();
        }
    }

    async fetchWeatherData(location = this.currentLocation) {
        try {
            // Get coordinates for the location
            const locations = await weatherAPI.searchLocations(location);
            if (locations.length === 0) {
                throw new Error('Location not found');
            }
            
            const coords = locations[0];
            this.currentLocation = `${coords.name}, ${coords.country}`;

            // Fetch weather data
            const rawWeatherData = await weatherAPI.getWeatherForecast(coords.lat, coords.lon);
            
            // Process and analyze the data
            this.weatherData = this.processWeatherData(rawWeatherData);
            
            // Update the UI
            ui.updateWeatherDisplay(this.weatherData, location);
        } catch (error) {
            throw error;
        }
    }

    processWeatherData(data) {
        let processedData = [...data];
        
        // Apply all analyses
        processedData = weatherAnalyzer.analyzeWindShear(processedData);
        processedData = weatherAnalyzer.analyzeFog(processedData);
        processedData = weatherAnalyzer.analyzeClouds(processedData);
        processedData = weatherAnalyzer.findBestHours(processedData);
        
        // Format the data for display
        return weatherAnalyzer.formatWeatherData(processedData);
    }

    handleToggle(toggleType) {
        if (!this.weatherData) return;

        switch (toggleType) {
            case 'clouds':
                this.toggleClouds();
                break;
            case 'temperature':
                this.toggleTemperature();
                break;
            case 'wind':
                this.toggleWind();
                break;
            case 'windShear':
                this.toggleWindShear();
                break;
            case 'fog':
                this.toggleFog();
                break;
            case 'bestHours':
                this.toggleBestHours();
                break;
            case 'daylight':
                this.toggleDaylight();
                break;
            case 'altitude':
                this.toggleAltitude();
                break;
        }
    }

    toggleClouds() {
        if (!this.weatherData) return;

        const table = ui.weatherTables.querySelector('.weather-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const data = this.weatherData[index];
            row.classList.remove('optimal-clouds', 'low-clouds');
            
            if (data.cloudAnalysis.isOptimal) {
                row.classList.add('optimal-clouds');
            } else if (data.cloudAnalysis.isLowCloud) {
                row.classList.add('low-clouds');
            }
        });
    }

    toggleTemperature() {
        if (!this.weatherData) return;

        const table = ui.weatherTables.querySelector('.weather-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const data = this.weatherData[index];
            row.classList.remove('optimal-temp', 'cold-temp', 'hot-temp');
            
            if (data.temperature >= 15 && data.temperature <= 25) {
                row.classList.add('optimal-temp');
            } else if (data.temperature < 15) {
                row.classList.add('cold-temp');
            } else {
                row.classList.add('hot-temp');
            }
        });
    }

    toggleWind() {
        if (!this.weatherData) return;

        const table = ui.weatherTables.querySelector('.weather-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const data = this.weatherData[index];
            row.classList.remove('optimal-wind', 'strong-wind', 'light-wind');
            
            if (data.windSpeed >= 5 && data.windSpeed <= 15) {
                row.classList.add('optimal-wind');
            } else if (data.windSpeed > 15) {
                row.classList.add('strong-wind');
            } else {
                row.classList.add('light-wind');
            }
        });
    }

    toggleWindShear() {
        // Implementation for toggling wind shear display
    }

    toggleFog() {
        // Implementation for toggling fog display
    }

    toggleBestHours() {
        if (!this.weatherData) return;

        const table = ui.weatherTables.querySelector('.weather-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const data = this.weatherData[index];
            row.classList.remove('best-hour', 'good-hour', 'poor-hour');
            
            if (data.bestHour.score >= 7) {
                row.classList.add('best-hour');
            } else if (data.bestHour.score >= 4) {
                row.classList.add('good-hour');
            } else {
                row.classList.add('poor-hour');
            }
        });
    }

    toggleDaylight() {
        // Implementation for toggling daylight hours display
    }

    toggleAltitude() {
        // Implementation for toggling altitude display
    }

    handleResetAll() {
        // Reset all toggles and display
        ui.disableControls();
        this.weatherData = null;
        ui.weatherTables.innerHTML = '';
        ui.locationInput.value = '';
    }

    async handleAddCurrentLocation() {
        try {
            ui.showLoading();
            const position = await weatherAPI.getCurrentLocation();
            console.log('Got current position:', position);
            
            // First try to get location name from coordinates
            const locations = await weatherAPI.searchLocationsByCoords(position.lat, position.lon);
            if (locations.length === 0) {
                throw new Error('Could not find location for current coordinates');
            }
            
            const location = locations[0];
            console.log('Found location:', location);
            
            // Set the current location and fetch weather
            this.currentLocation = `${location.name}, ${location.country}`;
            await this.fetchWeatherData();
        } catch (error) {
            console.error('Error getting current location:', error);
            ui.showError(error.message || 'Failed to get current location');
        } finally {
            ui.hideLoading();
        }
    }

    async handleLocationSearch(query) {
        try {
            const locations = await weatherAPI.searchLocations(query);
            return locations;
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    async handleLocationSelect(location) {
        try {
            this.currentLocation = `${location.name}, ${location.country}`;
            await this.fetchWeatherData();
        } catch (error) {
            console.error('Error selecting location:', error);
            ui.showError('Failed to fetch weather for selected location');
        }
    }

    loadSavedLocations() {
        const saved = localStorage.getItem(WEATHER_CONFIG.SAVED_LOCATIONS_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    saveLocation(location) {
        let savedLocations = this.loadSavedLocations();
        if (!savedLocations.includes(location)) {
            savedLocations.push(location);
            if (savedLocations.length > WEATHER_CONFIG.MAX_SAVED_LOCATIONS) {
                savedLocations.shift();
            }
            localStorage.setItem(
                WEATHER_CONFIG.SAVED_LOCATIONS_KEY,
                JSON.stringify(savedLocations)
            );
            ui.updateSavedLocationsList(savedLocations);
        }
    }

    deleteLocation(location) {
        let savedLocations = this.loadSavedLocations();
        savedLocations = savedLocations.filter(loc => loc !== location);
        localStorage.setItem(
            WEATHER_CONFIG.SAVED_LOCATIONS_KEY,
            JSON.stringify(savedLocations)
        );
        ui.updateSavedLocationsList(savedLocations);
        
        // If the deleted location was the current location, clear it
        if (this.currentLocation === location) {
            this.currentLocation = null;
            ui.locationInput.value = '';
        }
    }

    handleSaveLocation() {
        if (!this.currentLocation) {
            ui.showError('No location is currently loaded');
            return;
        }
        this.saveLocation(this.currentLocation);
    }
}

// Initialize the application
const app = new SoarForecaster();

// Expose app to window object for testing
window.app = app; 