
const iconApiUrl = 'https://api.open-meteo.com/v1/dwd-icon';
const openMeteoApiUrl = 'https://api.open-meteo.com/v1/forecast';


  // Add these global variables to keep track of the thresholds in JavaScript.
let blueThresholdValue = parseInt(localStorage.getItem('blueThreshold') || 4);
let greenThresholdValue = parseInt(localStorage.getItem('greenThreshold') || 12);
let redThresholdValue = parseInt(localStorage.getItem('redThreshold') || 20);

// Function to save the thresholds to cookies and update global variables
function saveThresholds() {
    const blueThreshold = document.getElementById('blueThreshold').value;
    const greenThreshold = document.getElementById('greenThreshold').value;
    const redThreshold = document.getElementById('redThreshold').value;

    // Validate and ensure the thresholds are numbers
    if (isNaN(blueThreshold) || isNaN(greenThreshold) || isNaN(redThreshold)) {
        alert('Please enter valid numbers for all thresholds.');
        return;
    }

    // Save to localStorage
    localStorage.setItem('blueThreshold', blueThreshold);
    localStorage.setItem('greenThreshold', greenThreshold);
    localStorage.setItem('redThreshold', redThreshold);

    // Update global variables
    blueThresholdValue = parseInt(blueThreshold);
    greenThresholdValue = parseInt(greenThreshold);
    redThresholdValue = parseInt(redThreshold);

    hideConfigPopup();

    // Refresh the table with the new thresholds if wind data already exists
    if (window.currentWindData) {
        displayWindDataWithNewThresholds();
    }
}


document.addEventListener('DOMContentLoaded', function () {
    var queryApiButton = document.getElementById('queryApiButton');

    queryApiButton.addEventListener('click', async function handleButtonClick() {
        console.log("The 'Get Winds' button was clicked!");

        try {
            // Replace these with the actual latitude and longitude values you need
            const latitude = 0; 
            const longitude = 0;

            // Call the first function and log the result
            const iconData = await getIconData(latitude, longitude);
            console.log('Icon Data:', iconData);

            // Call the second function and log the result
            const openMeteoModelData = await getOpenMeteoModelData(latitude, longitude);
            console.log('Open Meteo Model Data:', openMeteoModelData);

            // Call the third function and log the result
            const windSpeeds = await getWindSpeeds(latitude, longitude);
            console.log('Wind Speeds:', windSpeeds);

        } catch (error) {
            console.error('Error during API calls:', error);
        }
    });
});
/**
 * Fetches wind speed data from the Open-Meteo API for the given latitude and longitude.
 * 
 * @param {number} latitude - The latitude to fetch data for.
 * @param {number} longitude - The longitude to fetch data for.  
 * @returns {Promise} Promise that resolves to the API response JSON.
 */
        
async function getIconData(latitude, longitude) {
    const url = `${iconApiUrl}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,precipitation_probability,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_gusts_10m,` +
    `wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,temperature_80m,temperature_1000hPa,temperature_975hPa,` +
    `temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,` +
    `windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,` +
    `windspeed_800hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,` +
    `winddirection_900hPa,winddirection_850hPa,winddirection_800hPa` +
    `&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=16`;
    const response = await fetch(url);
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}

async function getOpenMeteoModelData(latitude, longitude) {
    const url = `${openMeteoApiUrl}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,precipitation_probability,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_gusts_10m,` +
    `wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,temperature_80m,temperature_1000hPa,temperature_975hPa,` +
    `temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,` +
    `windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,` +
    `windspeed_800hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,` +
    `winddirection_900hPa,winddirection_850hPa,winddirection_800hPa` +
    `&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=16`;
    const response = await fetch(url);
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}
async function getWindSpeeds(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}` +
                `&hourly=temperature_2m,precipitation_probability,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_gusts_10m,` +
                `wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,temperature_80m,temperature_1000hPa,temperature_975hPa,` +
                `temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,` +
                `windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,` +
                `windspeed_800hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,` +
                `winddirection_900hPa,winddirection_850hPa,winddirection_800hPa` +
                `&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=16`;
    const response = await fetch(url);
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}
        
function getArrowUnicodeFromDirection(direction) {
    if (direction >= 337.5 || direction < 22.5) {
        return '&#x2191;&#xFE0E;'; // North as text
    } else if (direction >= 22.5 && direction < 67.5) {
        return '&#x2197;&#xFE0E;'; // North-East as text
    } else if (direction >= 67.5 && direction < 112.5) {
        return '&#x2192;&#xFE0E;'; // East as text
    } else if (direction >= 112.5 && direction < 157.5) {
        return '&#x2198;&#xFE0E;'; // South-East as text
    } else if (direction >= 157.5 && direction < 202.5) {
        return '&#x2193;&#xFE0E;'; // South as text
    } else if (direction >= 202.5 && direction < 247.5) {
        return '&#x2199;&#xFE0E;'; // South-West as text
    } else if (direction >= 247.5 && direction < 292.5) {
        return '&#x2190;&#xFE0E;'; // West as text
    } else {
        return '&#x2196;&#xFE0E;'; // North-West as text
    }
}
function showConfigPopup() {
    document.getElementById('configPopup').style.display = 'block';
    document.getElementById('configOverlay').style.display = 'block';

    // Retrieve values from localStorage instead of cookies
    let blueVal = localStorage.getItem('blueThreshold') || 4;
    let greenVal = localStorage.getItem('greenThreshold') || 12;
    let redVal = localStorage.getItem('redThreshold') || 20;

    // Update inputs and labels with retrieved values
    document.getElementById('blueThreshold').value = blueVal;
    document.getElementById('greenThreshold').value = greenVal;
    document.getElementById('redThreshold').value = redVal;


}

// Function to hide the configuration modal
function hideConfigPopup() {
    document.getElementById('configPopup').style.display = 'none';
    document.getElementById('configOverlay').style.display = 'none';
}

// Function to save the thresholds to cookies


function displayPopup(windSpeed, windGusts) {
        // Change the popup content to display the wind speed
        document.getElementById('popupContent').innerHTML = `Wind Speed: ${windSpeed} mph<br>Wind Gusts (10m): ${windGusts} mph`;

        // Make the popup and overlay visible
        document.getElementById('popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    // Function to close the popup
    function closePopup() {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }
