let iconData;
let openMeteoData;
let GFSData;

let tableIconWind 
let tableOpenMeteoWind
let tableGFSWind 

const iconApiUrl = 'https://api.open-meteo.com/v1/dwd-icon';
const openMeteoApiUrl = 'https://api.open-meteo.com/v1/forecast';
const hPaToFt = {
    "1000hPa": "361ft",
    "975hPa": "1050ft",
    "950hPa": "1640ft",
    "925hPa": "2625ft",
    "900hPa": "3281ft",
    "850hPa": "4921ft",
    "800hPa": "6234ft","700hPa": "9842ft","600hPa": "13770ft"
  };
  
const meterToFeet = 3.28084;

const getWindsButton = document.getElementById('queryApiButton');
getWindsButton.addEventListener('click', async function () {
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;
    if (lat && lon) {
        try {
             iconData = await getIconData(lat, lon);
             convertedIconData = convertData(iconData);
            openMeteoData = await getOpenMeteoModelData(lat, lon);
             convertedOpenMeteoData = convertData(openMeteoData);
             GFSData = await getGFSData(lat, lon);
             convertedGFSData = convertData(GFSData);
            
const tableIconWind = convertToTableData(convertedIconData);
const tableOpenMeteoWind = convertToTableData(convertedOpenMeteoData);
const tableGFSWind = convertToTableData(convertedGFSData);
           


// Now you can use the converted data to update the UI or tables
console.log('Converted ICON Data:', tableIconWind);
console.log('Converted OpenMeteo Data:', tableOpenMeteoWind);
console.log('Converted GFS Data:', tableGFSWind);

            // Process the data here and update the table or display it in the UI
        } catch (error) {
            console.error('Failed to get weather data:', error);
        }
        
    } else {
        console.error('Latitude and Longitude fields are empty');
    }
       
    
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
    `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,cape&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=7`;
    const response = await fetch(url);

    // Then convert the response to JSON
    const jsonResponse = await response.json();

    // Format and return the API response data
    return formatApiResponse(jsonResponse);
}

async function getOpenMeteoModelData(latitude, longitude) {
    const url = `${openMeteoApiUrl}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,cape&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=14`;
    const response = await fetch(url);

    // Then convert the response to JSON
    const jsonResponse = await response.json();

    // Format and return the API response data
    return formatApiResponse(jsonResponse);
}
async function getGFSData(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}` +
                `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,cape&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=14`;
                const response = await fetch(url);

                // Then convert the response to JSON
                const jsonResponse = await response.json();
            
                // Format and return the API response data
                return formatApiResponse(jsonResponse);
            }
        

// New function to reformat the API response data into an array of objects
function formatApiResponse(apiResponse) {
    const hourlyData = apiResponse.hourly;
    const timeSeries = hourlyData.time;
    const formattedData = timeSeries.map((time, index) => {
        let dataEntry = { time };
        for (const property in hourlyData) {
            if (property !== "time") { // Exclude the time array
                dataEntry[property] = hourlyData[property][index]; // Match other property arrays with time
            }
        }
        return dataEntry;
    });
    return formattedData;
}
function convertData(data) {
    const convertedData = [];

    for (const entry of data) {
        const convertedEntry = {};
        
        for (const key in entry) {
            // Check if the key represents hPa data and convert to feet using provided mapping
            const hPaMatch = key.match(/(\d+)hPa/);
            if (hPaMatch && hPaToFt[`${hPaMatch[1]}hPa`]) {
                const newKey = `${hPaToFt[`${hPaMatch[1]}hPa`].replace('ft', '')}ft`;
                convertedEntry[newKey] = entry[key];
            }
            // Check if the key represents meters data and convert to feet
            else if (key.match(/(\d+)m/)) {
                const newKey = key.replace(/(\d+)m/, (match, meterValue) => {
                    const feetValue = Math.round(meterValue * meterToFeet);
                    return `${feetValue}ft`;
                });
                convertedEntry[newKey] = entry[key];
            }
            // If neither, just copy the key as it is
            else {
                convertedEntry[key] = entry[key];
            }
        }

        convertedData.push(convertedEntry);
    }

    return convertedData;
    
}

// This function converts the array of weather data entries into a table format
function convertToTableData(weatherData) {
    const tableData = {};

    // Iterate over each entry to populate the table data
    for (const entry of weatherData) {
        console.log('Processing entry:', entry);

        const timeHeader = entry.time;
        if (!tableData[timeHeader]) {
            tableData[timeHeader] = {};
        }

        for (const [key, value] of Object.entries(entry)) {
            console.log(`Processing key: ${key}, value: ${value}`);

            if (key.endsWith('ft')) {
                if (!tableData[timeHeader][key]) {
                    tableData[timeHeader][key] = { windSpeed: null, allData: {} };
                }
                if (key.includes('wind_speed')) {
                    tableData[timeHeader][key].windSpeed = value;
                }
                tableData[timeHeader][key].allData[key] = value;
            }
        }
    }

    
    return tableData;
}

