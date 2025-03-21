import { WEATHER_THRESHOLDS } from './config.js';

class WeatherAnalyzer {
    constructor() {
        this.thresholds = WEATHER_THRESHOLDS;
    }

    analyzeWindShear(weatherData) {
        return weatherData.map((data, index) => {
            if (index === 0) return { ...data, windShear: null };
            
            const prevData = weatherData[index - 1];
            const windSpeedDiff = Math.abs(data.windSpeed - prevData.windSpeed);
            
            return {
                ...data,
                windShear: windSpeedDiff >= this.thresholds.WIND_SHEAR.MIN_DIFFERENCE
            };
        });
    }

    analyzeFog(weatherData) {
        return weatherData.map(data => ({
            ...data,
            fog: data.visibility <= this.thresholds.FOG.VISIBILITY_THRESHOLD &&
                 data.humidity >= this.thresholds.FOG.HUMIDITY_THRESHOLD
        }));
    }

    analyzeClouds(weatherData) {
        return weatherData.map(data => ({
            ...data,
            cloudAnalysis: {
                isLowCloud: data.clouds <= this.thresholds.CLOUDS.LOW_CLOUD_BASE,
                isOptimal: data.clouds <= this.thresholds.CLOUDS.OPTIMAL_CLOUD_COVER
            }
        }));
    }

    findBestHours(weatherData) {
        return weatherData.map(data => {
            const hour = new Date(data.timestamp * 1000).getHours();
            const isDaylight = hour >= 6 && hour <= 20;
            
            const score = this.calculateHourScore(data, isDaylight);
            
            return {
                ...data,
                bestHour: {
                    score,
                    isDaylight
                }
            };
        });
    }

    calculateHourScore(data, isDaylight) {
        let score = 0;
        
        // Base score for daylight hours
        if (isDaylight) score += 3;
        
        // Wind conditions
        if (data.windSpeed >= 5 && data.windSpeed <= 15) score += 2;
        
        // Cloud conditions
        if (data.clouds <= this.thresholds.CLOUDS.OPTIMAL_CLOUD_COVER) score += 2;
        
        // Visibility
        if (data.visibility > this.thresholds.FOG.VISIBILITY_THRESHOLD) score += 1;
        
        // Temperature (assuming optimal range between 15-25°C)
        if (data.temperature >= 15 && data.temperature <= 25) score += 1;
        
        return score;
    }

    formatWeatherData(weatherData) {
        return weatherData.map(data => ({
            ...data,
            formattedTime: new Date(data.timestamp * 1000).toLocaleTimeString(),
            formattedDate: new Date(data.timestamp * 1000).toLocaleDateString(),
            windDirectionText: this.getWindDirectionText(data.windDirection),
            temperatureFormatted: `${Math.round(data.temperature)}°C`,
            windSpeedFormatted: `${Math.round(data.windSpeed)} m/s`,
            cloudsFormatted: `${data.clouds}%`
        }));
    }

    getWindDirectionText(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }
}

// Create and export a singleton instance
const weatherAnalyzer = new WeatherAnalyzer();
export default weatherAnalyzer; 