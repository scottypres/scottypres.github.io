// Function to fetch weather data
        function fetchWeatherData(model, callback) {
            // Fort Myers coordinates
            var latitude = '26.6406';
            var longitude = '-81.8723';
            var url = 'https://api.open-meteo.com/v1/' + model +
            '?latitude=' + latitude +
            '&longitude=' + longitude +
            '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,windspeed_1000hPa,windspeed_975hPa,windspeed_950hPa,windspeed_925hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,winddirection_1000hPa,winddirection_975hPa,winddirection_950hPa,winddirection_925hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa';
            
            // Create a new request
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Call the callback with the data
                    callback(JSON.parse(this.responseText));
                }
            };
            httpRequest.open("GET", url, true);
            httpRequest.send();
        }

        // Fetch the data and store in variables
        let gfs, icon, openmeteo;

        // Fetch GFS data
        fetchWeatherData('gfs', function(data) {
            gfs = data;
            
        });

        // Fetch ICON data
        fetchWeatherData('dwd-icon', function(data) {
            icon = data;
            
        });

        // Fetch OpenMeteo data
        fetchWeatherData('forecast', function(data) {
            openmeteo = data;
            
        });