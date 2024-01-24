
function shouldFetchNewData(cookieTimestamp) {
  const lastFetchTime = new Date(cookieTimestamp);
  const currentTime = new Date();
  const timePassedInMinutes = (currentTime - lastFetchTime) / (1000 * 60);
  return timePassedInMinutes >= 15;
}
let gfsWeatherData;
let iconWeatherData;
let weatherData;
async function getWeathergfs(latitude, longitude) {
  const lastFetchTimestampGfs = getCookie("gfsLastFetchTimestamp");
  if (lastFetchTimestampGfs && !shouldFetchNewData(lastFetchTimestampGfs)) {
    getCookie("gfsWeatherData");
    return; // Data is recent enough, no need to fetch new data
  }

  const url = `https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,temperature_80m,temperature_180m,weather_code,relative_humidity_2m,dew_point_2m,visibility,lifted_index,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,cloud_cover_500hPa,cloud_cover_400hPa,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_gusts_10m,wind_direction_10m,wind_direction_80m,wind_direction_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,temperature_500hPa,temperature_400hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,windspeed_500hPa,windspeed_400hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,winddirection_500hPa,winddirection_400hPa,cape,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`;

  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    gfsWeatherData = processRenameKeys(weatherData, keyMap);
    console.log("fetched new GFS data:", gfsWeatherData);
  } catch (error) {
    console.error(error);
  }
  setCookie("gfsWeatherData", JSON.stringify(weatherData), 15); // Save data for 15 minutes
  setCookie("gfsLastFetchTimestamp", new Date().toISOString(), 15); // Save timestamp
 
}

async function getWeathericon(latitude, longitude) {
  const lastFetchTimestampIcon = getCookie("iconLastFetchTimestamp");
  if (lastFetchTimestampIcon && !shouldFetchNewData(lastFetchTimestampIcon)) {
    getCookie("iconWeatherData");
    return; // Data is recent enough, no need to fetch new data
  }
  const url = `https://api.open-meteo.com/v1/dwd-icon?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,temperature_80m,temperature_180m,precipitation,weather_code,relative_humidity_2m,dew_point_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,cloud_cover_1000hPa,cloud_cover_975hPa,cloud_cover_950hPa,cloud_cover_925hPa,cloud_cover_900hPa,cloud_cover_850hPa,cloud_cover_800hPa,cloud_cover_700hPa,cloud_cover_600hPa,cloud_cover_500hPa,cloud_cover_400hPa,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_gusts_10m,wind_direction_10m,wind_direction_80m,wind_direction_180m,temperature_1000hPa,temperature_975hPa,temperature_950hPa,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,temperature_600hPa,temperature_500hPa,temperature_400hPa,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_700hPa,windspeed_600hPa,windspeed_500hPa,windspeed_400hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_700hPa,winddirection_600hPa,winddirection_500hPa,winddirection_400hPa,cape,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`;
  let weatherData;
  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    iconWeatherData = processRenameKeys(weatherData, keyMap);
    console.log("fetched new ICON data", iconWeatherData);
    // Now that we have the weather data, we can prepare and display the tables.
    // Ensure that `prepareTables` and `displayTables` are available before calling them
    
  } catch (error) {
    console.error(error);
  }
  setCookie("iconWeatherData", JSON.stringify(iconWeatherData), 15); // Save data for 15 minutes
  setCookie("iconLastFetchTimestamp", new Date().toISOString(), 15); // Save timestamp
 }

/**
 * Rename object keys using a map of old keys to new keys.
 * @param {Object} obj - The original object.
 * @param {Object} keyMap - An object mapping old key names to new key names.
 * @return {Object} The object with renamed keys.
 */
function renameKeys(obj, keyMap) {
  return _.mapKeys(obj, (value, key) => keyMap[key] || key);
}
/**
 * Recursively processes the object to rename keys.
 * @param {Object} data - The object or array of objects to process.
 * @param {Object} keyMap - An object mapping old key names to new key names.
 * @return {Object} The processed data with renamed keys.
 */
function processRenameKeys(data, keyMap) {
  if (_.isArray(data)) {
    return data.map((item) => processRenameKeys(item, keyMap));
    
  } else if (_.isPlainObject(data)) {
    const renamedObject = renameKeys(data, keyMap);
    _.forEach(renamedObject, (value, key) => {
      renamedObject[key] = processRenameKeys(value, keyMap);
    });
    return renamedObject;
  }
  return data;
}

;