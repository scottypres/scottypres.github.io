let iconData;
let openMeteoData;
let GFSData;

const iconApiUrl = 'https://api.open-meteo.com/v1/dwd-icon';
const openMeteoApiUrl = 'https://api.open-meteo.com/v1/forecast';


const getWindsButton = document.getElementById('queryApiButton');
getWindsButton.addEventListener('click', async function () {
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;
    if (lat && lon) {
        try {
             iconData = await getIconData(lat, lon);
            console.log("ICON Data:", iconData);
            

             openMeteoData = await getOpenMeteoModelData(lat, lon);
            console.log("OpenMeteo Data:", openMeteoData);

             GFSData = await getGFSData(lat, lon);
            console.log("GFS Data:", GFSData);

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
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}

async function getOpenMeteoModelData(latitude, longitude) {
    const url = `${openMeteoApiUrl}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,cape&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=14`;
    const response = await fetch(url);
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}
async function getGFSData(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}` +
                `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,cape&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=14`;
    const response = await fetch(url);
    return response.json();
    console.log(data); // This will show you the entire structure of the response
}
        

function convertHpaToFeetLabels(dataArray) {
    // Define a mapping from hPa to feet
    const hPaToFeet = {
        "1000hPa": "361ft",
        "975hPa": "1050ft",
        "950hPa": "1640ft",
        "925hPa": "2625ft",
        "900hPa": "3281ft",
        "850hPa": "4921ft",
        "800hPa": "6234ft"
        // Add more mappings if needed
    };

    dataArray.forEach(data => {
        const keys = Object.keys(data);
        keys.forEach(key => {
            // Check if the key ends with 'hPa'
            if (key.endsWith('hPa')) {
                // Check if we have an equivalent feet value for this hPa key
                const convertedKey = hPaToFeet[key];
                if (convertedKey) {
                    // Replace the hPa data with its feet label equivalent
                    data[convertedKey] = data[key];
                    // You may choose to remove the original hPa key or keep it
                    delete data[key];
                }
            }
        });
    });
}

