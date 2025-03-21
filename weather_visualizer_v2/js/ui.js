import { UI_CONFIG } from './config.js';

// Utility function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

class UI {
    constructor() {
        this.loadingTimeout = null;
        this.weatherFetchCallback = null; // Renamed from onFetchWeather
        this.onToggle = null; // Callback for toggle events
        this.onLocationSearch = null;  // Changed from onLocationSelect
        this.onLocationSelect = null;
        this.onDeleteLocation = null; // Add callback for delete location
        this.onAddCurrentLocation = null; // Add callback for GPS location
        this.onSaveLocation = null; // Add callback for saving location
        this.searchTimeout = null;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Input elements
        this.locationInput = document.getElementById('location-input');
        this.fetchButton = document.getElementById('fetch-weather');
        this.saveLocationButton = document.getElementById('save-location');
        this.savedLocationsButton = document.getElementById('saved-locations');
        
        // Control buttons
        this.toggleButtons = {
            clouds: document.getElementById('toggle-clouds'),
            temperature: document.getElementById('toggle-temperature'),
            wind: document.getElementById('toggle-wind'),
            windShear: document.getElementById('toggle-wind-shear'),
            fog: document.getElementById('toggle-fog'),
            bestHours: document.getElementById('best-hours'),
            daylight: document.getElementById('toggle-daylight'),
            altitude: document.getElementById('toggle-altitude'),
            resetAll: document.getElementById('reset-all')
        };

        // Modal elements
        this.modal = document.getElementById('saved-locations-modal');
        this.closeButton = document.querySelector('.close');
        this.savedLocationsList = document.getElementById('saved-locations-list');
        this.currentLocationDisplay = document.getElementById('current-location-display');
        this.gpsLocationButton = document.getElementById('gps-location');
        this.saveCurrentLocationButton = document.getElementById('save-current-location');

        // Content containers
        this.weatherTables = document.getElementById('weather-tables');
        this.loading = document.getElementById('loading');

        // Add location suggestions container
        this.locationSuggestions = document.createElement('div');
        this.locationSuggestions.className = 'location-suggestions';
        this.locationSuggestions.style.display = 'none';
        this.locationInput.parentNode.insertBefore(this.locationSuggestions, this.locationInput.nextSibling);
    }

    initializeEventListeners() {
        // Get current location weather
        this.fetchButton.addEventListener('click', () => {
            if (this.weatherFetchCallback) {
                this.weatherFetchCallback();
            }
        });

        // Handle GPS location button
        if (this.gpsLocationButton) {
            this.gpsLocationButton.addEventListener('click', () => {
                if (this.onAddCurrentLocation) {
                    this.onAddCurrentLocation();
                }
            });
        }

        // Handle location input
        this.locationInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 3) {
                this.handleLocationSearch(query);
            } else {
                this.hideSuggestions();
            }
        }, 300));

        // Handle saved locations button
        this.savedLocationsButton.addEventListener('click', () => {
            this.showModal();
        });

        // Handle modal close button
        this.closeButton.addEventListener('click', () => {
            this.hideModal();
        });

        // Handle clicks outside modal
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Handle save current location button
        if (this.saveCurrentLocationButton) {
            this.saveCurrentLocationButton.addEventListener('click', () => {
                if (this.onSaveLocation) {
                    this.onSaveLocation();
                }
            });
        }

        // Control buttons
        Object.entries(this.toggleButtons).forEach(([key, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    if (this.onToggle) {
                        this.onToggle(key);
                    }
                });
            }
        });

        // Add location input event listener
        this.locationInput.addEventListener('input', () => this.handleLocationInput());
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.locationInput.contains(e.target) && !this.locationSuggestions.contains(e.target)) {
                this.hideLocationSuggestions();
            }
        });
    }

    async handleLocationInput() {
        const query = this.locationInput.value.trim();
        
        if (query.length < 2) {
            this.hideLocationSuggestions();
            return;
        }

        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout to prevent too many API calls
        this.searchTimeout = setTimeout(async () => {
            if (this.onLocationSearch) {  // Changed from onLocationSelect
                const locations = await this.onLocationSearch(query);
                this.showLocationSuggestions(locations);
            }
        }, 300);
    }

    handleLocationSearch(query) {
        if (this.onLocationSearch) {
            this.onLocationSearch(query).then(locations => {
                if (locations && locations.length > 0) {
                    this.showLocationSuggestions(locations);
                } else {
                    this.hideLocationSuggestions();
                }
            });
        }
    }

    showLocationSuggestions(locations) {
        this.locationSuggestions.innerHTML = '';
        
        locations.forEach(location => {
            const div = document.createElement('div');
            div.className = 'location-suggestion';
            
            // Format the display name
            const displayName = location.country === 'United States' && location.state
                ? `${location.name}, ${location.state}`
                : `${location.name}, ${location.country}`;
            
            div.textContent = displayName;
            
            div.addEventListener('click', () => {
                if (this.onLocationSelect) {
                    this.onLocationSelect({
                        ...location,
                        formattedName: displayName
                    });
                }
                this.locationInput.value = displayName;
                this.hideLocationSuggestions();
            });
            
            this.locationSuggestions.appendChild(div);
        });
        
        this.locationSuggestions.style.display = 'block';
    }

    hideLocationSuggestions() {
        this.locationSuggestions.style.display = 'none';
    }

    showLoading() {
        this.loading.style.display = 'flex';
        this.loadingTimeout = setTimeout(() => {
            this.hideLoading();
        }, UI_CONFIG.LOADING_TIMEOUT);
    }

    hideLoading() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        this.loading.style.display = 'none';
    }

    showModal() {
        this.modal.style.display = 'block';
        // Update current location display if available
        if (this.currentLocationDisplay) {
            const currentLocation = localStorage.getItem('lastQueriedLocation');
            if (currentLocation) {
                this.currentLocationDisplay.textContent = `Current Location: ${currentLocation}`;
                this.saveLocationButton.disabled = false;
            } else {
                this.currentLocationDisplay.textContent = 'No location selected';
                this.saveLocationButton.disabled = true;
            }
        }
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    updateSavedLocationsList(locations) {
        this.savedLocationsList.innerHTML = '';
        locations.forEach(location => {
            const li = document.createElement('li');
            li.className = 'saved-location-item';
            
            const locationText = document.createElement('span');
            locationText.className = 'location-text';
            locationText.textContent = location;
            locationText.addEventListener('click', async () => {
                if (this.onLocationSelect) {
                    // Pass the full location string to maintain the original format
                    this.onLocationSelect({ 
                        name: location.split(',')[0].trim(),
                        country: location.split(',')[1]?.trim() || 'United States'
                    });
                }
                this.hideModal();
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-location';
            deleteButton.innerHTML = '&times;';
            deleteButton.style.cssText = 'background: none; border: none; color: red; font-size: 20px; cursor: pointer; padding: 0 5px;';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onDeleteLocation) {
                    this.onDeleteLocation(location);
                }
            });
            
            li.appendChild(locationText);
            li.appendChild(deleteButton);
            this.savedLocationsList.appendChild(li);
        });
    }

    async onFetchWeather(location) {
        try {
            this.showLoading();
            if (this.weatherFetchCallback) {
                await this.weatherFetchCallback(location);
            }
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data');
        } finally {
            this.hideLoading();
        }
    }

    updateWeatherDisplay(weatherData, location) {
        if (!weatherData || weatherData.length === 0) {
            this.showError('No weather data available');
            return;
        }

        // Clear existing tables
        this.weatherTables.innerHTML = '';

        // Format location name
        let formattedLocation = location;
        if (typeof location === 'object') {
            formattedLocation = location.formattedName || 
                (location.country === 'United States' && location.state 
                    ? `${location.name}, ${location.state}` 
                    : `${location.name}, ${location.country}`);
        } else if (typeof location === 'string') {
            formattedLocation = location.replace(/, United States$/, '');
        }

        // Add location header
        const locationHeader = document.createElement('h2');
        locationHeader.className = 'location-header';
        locationHeader.textContent = formattedLocation;
        locationHeader.style.marginBottom = '16px';
        this.weatherTables.appendChild(locationHeader);

        // Update current location in modal if it's open
        if (this.currentLocationDisplay) {
            this.currentLocationDisplay.textContent = `Current Location: ${formattedLocation}`;
        }

        // Enable save location button
        this.enableSaveLocation();

        // Create the main table
        const table = document.createElement('table');
        table.className = 'weather-table';
        
        // Create header row with times
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Empty cell for altitude column
        
        // Add time headers
        weatherData.forEach(data => {
            const th = document.createElement('th');
            const date = new Date(data.timestamp * 1000);
            const hour = date.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            
            // Create a div for the hour
            const hourDiv = document.createElement('div');
            hourDiv.textContent = hour12;
            hourDiv.style.fontSize = '14px';
            
            // Create a div for AM/PM
            const ampmDiv = document.createElement('div');
            ampmDiv.textContent = ampm;
            ampmDiv.style.fontSize = '10px';
            
            // Add both divs to the header cell
            th.appendChild(hourDiv);
            th.appendChild(ampmDiv);
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body with altitude levels
        const tbody = document.createElement('tbody');
        
        // Define altitude levels in meters and feet (including pressure levels)
        const altitudeLevels = [
            { meters: 850, feet: 4921, type: 'pressure', pressure: 850 }, // 850 hPa
            { meters: 900, feet: 3281, type: 'pressure', pressure: 900 }, // 900 hPa
            { meters: 925, feet: 2625, type: 'pressure', pressure: 925 }, // 925 hPa
            { meters: 950, feet: 1640, type: 'pressure', pressure: 950 }, // 950 hPa
            { meters: 975, feet: 1050, type: 'pressure', pressure: 975 }, // 975 hPa
            { meters: 180, feet: 591, type: 'height' },
            { meters: 120, feet: 394, type: 'height' },
            { meters: 80, feet: 262, type: 'height' },
            { meters: 10, feet: 33, type: 'height' }
        ];

        // Create rows for each altitude level
        altitudeLevels.forEach(level => {
            const row = document.createElement('tr');
            
            // Add altitude cell - only show feet
            const altitudeCell = document.createElement('td');
            altitudeCell.textContent = `${level.feet} ft`;
            row.appendChild(altitudeCell);

            // Add wind speed cells for each time
            weatherData.forEach(data => {
                const cell = document.createElement('td');
                let windSpeed, windDirection;
                
                // Get wind data based on type and level
                if (level.type === 'height') {
                    switch(level.meters) {
                        case 180:
                            windSpeed = data.windSpeed180m;
                            windDirection = data.windDirection180m;
                            break;
                        case 120:
                            windSpeed = data.windSpeed120m;
                            windDirection = data.windDirection120m;
                            break;
                        case 80:
                            windSpeed = data.windSpeed80m;
                            windDirection = data.windDirection80m;
                            break;
                        case 10:
                            windSpeed = data.windSpeed10m;
                            windDirection = data.windDirection10m;
                            break;
                    }
                } else {
                    // Pressure level data
                    windSpeed = data.pressureLevels[level.pressure].windSpeed;
                    windDirection = data.pressureLevels[level.pressure].windDirection;
                }
                
                // Create a container div with flex column layout
                const container = document.createElement('div');
                container.className = 'wind-cell-container';

                // Add wind speed
                const speedDiv = document.createElement('div');
                speedDiv.className = 'wind-speed';
                speedDiv.textContent = Math.round(windSpeed);
                container.appendChild(speedDiv);

                // Add wind direction arrow
                const directionDiv = document.createElement('div');
                directionDiv.className = 'wind-direction';
                directionDiv.textContent = '↑';
                directionDiv.style.transform = `rotate(${windDirection}deg)`;
                container.appendChild(directionDiv);

                // Add container to cell
                cell.appendChild(container);
                
                // Color coding based on wind speed in mph
                if (windSpeed < 10) {
                    cell.style.backgroundColor = '#e3f2fd'; // Light blue
                } else if (windSpeed < 20) {
                    cell.style.backgroundColor = '#e8f5e9'; // Light green
                } else {
                    cell.style.backgroundColor = '#ffebee'; // Light red
                }
                
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        this.weatherTables.appendChild(table);

        // Enable controls
        this.enableControls();
    }

    enableControls() {
        Object.values(this.toggleButtons).forEach(button => {
            if (button && button.id !== 'reset-all') {
                button.disabled = false;
            }
        });
    }

    disableControls() {
        Object.values(this.toggleButtons).forEach(button => {
            if (button && button.id !== 'reset-all') {
                button.disabled = true;
            }
        });
        this.disableSaveLocation();
    }

    getWindDirectionSymbol(direction) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(direction / 22.5) % 16;
        return directions[index];
    }

    getWindSpeedClass(speed) {
        if (speed < 4.47) { // Less than 10 mph
            return 'light-wind';
        } else if (speed < 8.94) { // Between 10-20 mph
            return 'moderate-wind';
        } else { // More than 20 mph
            return 'strong-wind';
        }
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message
        });
    }

    enableSaveLocation() {
        if (this.saveLocationButton) {
            this.saveLocationButton.disabled = false;
        }
    }

    disableSaveLocation() {
        if (this.saveLocationButton) {
            this.saveLocationButton.disabled = true;
        }
    }
}

// Create and export a singleton instance
const ui = new UI();
export default ui; 