import { fetchWeatherApi } from 'openmeteo';
	
const params = {
	"latitude": 52.52,
	"longitude": 13.41,
	"hourly": ["temperature_2m", "precipitation", "cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "temperature_1000hPa", "temperature_925hPa", "temperature_850hPa", "windspeed_1000hPa", "windspeed_925hPa", "windspeed_850hPa", "winddirection_1000hPa", "winddirection_925hPa", "winddirection_850hPa"],
	"temperature_unit": "fahrenheit",
	"wind_speed_unit": "mph",
	"precipitation_unit": "inch"
};
const url = "https://api.open-meteo.com/v1/ecmwf";
const responses = await fetchWeatherApi(url, params);

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];

// Attributes for timezone and location
const utcOffsetSeconds = response.utcOffsetSeconds();
const timezone = response.timezone();
const timezoneAbbreviation = response.timezoneAbbreviation();
const latitude = response.latitude();
const longitude = response.longitude();

const hourly = response.hourly()!;

// Note: The order of weather variables in the URL query and the indices below need to match!
const weatherData = {

	hourly: {
		time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
			(t) => new Date((t + utcOffsetSeconds) * 1000)
		),
		temperature2m: hourly.variables(0)!.valuesArray()!,
		precipitation: hourly.variables(1)!.valuesArray()!,
		cloudCover: hourly.variables(2)!.valuesArray()!,
		cloudCoverLow: hourly.variables(3)!.valuesArray()!,
		cloudCoverMid: hourly.variables(4)!.valuesArray()!,
		cloudCoverHigh: hourly.variables(5)!.valuesArray()!,
		windSpeed10m: hourly.variables(6)!.valuesArray()!,
		windDirection10m: hourly.variables(7)!.valuesArray()!,
		windGusts10m: hourly.variables(8)!.valuesArray()!,
		temperature1000hPa: hourly.variables(9)!.valuesArray()!,
		temperature925hPa: hourly.variables(10)!.valuesArray()!,
		temperature850hPa: hourly.variables(11)!.valuesArray()!,
		windspeed1000hPa: hourly.variables(12)!.valuesArray()!,
		windspeed925hPa: hourly.variables(13)!.valuesArray()!,
		windspeed850hPa: hourly.variables(14)!.valuesArray()!,
		winddirection1000hPa: hourly.variables(15)!.valuesArray()!,
		winddirection925hPa: hourly.variables(16)!.valuesArray()!,
		winddirection850hPa: hourly.variables(17)!.valuesArray()!,
	},

};

// `weatherData` now contains a simple structure with arrays for datetime and weather data
for (let i = 0; i < weatherData.hourly.time.length; i++) {
	console.log(
		weatherData.hourly.time[i].toISOString(),
		weatherData.hourly.temperature2m[i],
		weatherData.hourly.precipitation[i],
		weatherData.hourly.cloudCover[i],
		weatherData.hourly.cloudCoverLow[i],
		weatherData.hourly.cloudCoverMid[i],
		weatherData.hourly.cloudCoverHigh[i],
		weatherData.hourly.windSpeed10m[i],
		weatherData.hourly.windDirection10m[i],
		weatherData.hourly.windGusts10m[i],
		weatherData.hourly.temperature1000hPa[i],
		weatherData.hourly.temperature925hPa[i],
		weatherData.hourly.temperature850hPa[i],
		weatherData.hourly.windspeed1000hPa[i],
		weatherData.hourly.windspeed925hPa[i],
		weatherData.hourly.windspeed850hPa[i],
		weatherData.hourly.winddirection1000hPa[i],
		weatherData.hourly.winddirection925hPa[i],
		weatherData.hourly.winddirection850hPa[i]
	);
}