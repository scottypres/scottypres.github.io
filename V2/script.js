document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = 'https://api.locationiq.com/v1/autocomplete.php';
    let searchBox = document.getElementById('location-input');
    let autoCompleteResults = document.getElementById('autocomplete-list');
  
    searchBox.addEventListener('input', function() {
      let searchTerm = this.value;
  
      if (!searchTerm) {
        autoCompleteResults.innerHTML = '';
        return;
      }
  
      fetch(`${apiUrl}?key=pk.56b37a44389aea335d1c84d58086743d&q=${encodeURIComponent(searchTerm)}&limit=5`)
        .then(response => response.json())
        .then(data => {
          autoCompleteResults.innerHTML = '';
          data.forEach(function(item) {
            let div = document.createElement('div');
            div.textContent = item.display_name;
            div.addEventListener('click', function() {
              searchBox.value = item.display_name;
              autoCompleteResults.innerHTML = '';
              document.getElementById('latitude').value = item.lat;
              document.getElementById('longitude').value = item.lon;
            });
            autoCompleteResults.appendChild(div);
          });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  
    document.addEventListener('click', function(e) {
      if (e.target.id !== 'location-input') {
        autoCompleteResults.innerHTML = '';
      }
    });
  });

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
searchBox.addEventListener('input', function() {
    let searchTerm = this.value;

    if (!searchTerm) {
        autoCompleteResults.innerHTML = '';
        return;
    }

    fetch(`${apiUrl}?key=pk.56b37a44389aea335d1c84d58086743d&q=${encodeURIComponent(searchTerm)}&limit=5`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // Log the data to see the structure

            if (!Array.isArray(data)) {
                console.error('Expected an array but received:', data);
                return; // Early exit if the data is not an array
            }

            autoCompleteResults.innerHTML = '';
            data.forEach(function(item) {
                let div = document.createElement('div');
                div.textContent = item.display_name;
                div.addEventListener('click', function() {
                    searchBox.value = item.display_name;
                    autoCompleteResults.innerHTML = '';
                    document.getElementById('latitude').value = item.lat;
                    document.getElementById('longitude').value = item.lon;
                });
                autoCompleteResults.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
// Function to save the thresholds to cookies

async function getWindSpeedsFromSelectedLocation() {
    // Inputs to get the latitude and longitude values
    let latInput = document.getElementById('latitude');
    let longInput = document.getElementById('longitude');

    // Ensure the latitude and longitude fields are populated
    if (latInput.value && longInput.value) {
        let latitude = latInput.value;
        let longitude = longInput.value;

        try {
            // Call the GFS API
            const gfsData = await getWindSpeeds(latitude, longitude);
            //console.log("GFS Data:", JSON.stringify(gfsData, null, 2)); // Log GFS data

            // Call the ICON API
            const iconData = await getIconData(latitude, longitude);
            //console.log("ICON Data:", JSON.stringify(iconData, null, 2)); // Log ICON data

            // Call the OpenMeteo API
            const openMeteoData = await getOpenMeteoModelData(latitude, longitude);
           // console.log("OpenMeteo Data:", JSON.stringify(openMeteoData, null, 2)); // Log OpenMeteo data

            // Process the data (to be implemented as needed)
            onWindDataReceived(gfsData, 'GFS');
            onWindDataReceived(openMeteoData, 'OpenMeteo');
            onWindDataReceived(iconData, 'ICON');
            
        } catch (error) {
            console.error('Failed to fetch wind data:', error);
            // Actual error handling for the user goes here
        }
    } else {
        alert("Please select a location first.");
    }
}


function displayWindDataWithNewThresholds() {
    // Use the current wind data to regenerate the wind data table.
    const windData = window.currentWindData;
    const updatedTable = createTable(windData);
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Clear existing table.
    tableContainer.appendChild(updatedTable); // Insert the updated table.
}

// Cookie helper functions
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires="+d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}
function createTable(windData, modelName) {
    const altitudes = [
        { label: 'L-Cloud%', speedKey: 'cloud_cover_low', dirKey: null, tempKey: null, extraClass: 'small-font' },
        { label: 'Cloud%', speedKey: 'cloud_cover', dirKey: null, tempKey: null, extraClass: 'small-font' },
    { label: 'Gusts', speedKey: 'wind_gusts_10m', dirKey: null, tempKey: null, extraClass: 'small-font' },
    { label: '32ft', speedKey: 'wind_speed_10m', dirKey: 'wind_direction_10m', tempKey: 'temperature_10m' },
    { label: '262ft', speedKey: 'wind_speed_80m', dirKey: 'wind_direction_80m', tempKey: 'temperature_80m' },
    { label: '361ft', speedKey: 'windspeed_1000hPa', dirKey: 'winddirection_1000hPa', tempKey: 'temperature_1000hPa' },
    { label: '1050ft', speedKey: 'windspeed_975hPa', dirKey: 'winddirection_975hPa', tempKey: 'temperature_975hPa' },
    { label: '1640ft', speedKey: 'windspeed_950hPa', dirKey: 'winddirection_950hPa', tempKey: 'temperature_950hPa' },
    { label: '2625ft', speedKey: 'windspeed_925hPa', dirKey: 'winddirection_925hPa', tempKey: 'temperature_925hPa' },
    { label: '3281ft', speedKey: 'windspeed_900hPa', dirKey: 'winddirection_900hPa', tempKey: 'temperature_900hPa' },
    { label: '4921ft', speedKey: 'windspeed_850hPa', dirKey: 'winddirection_850hPa', tempKey: 'temperature_850hPa' },
    { label: '6234ft', speedKey: 'windspeed_800hPa', dirKey: 'winddirection_800hPa', tempKey: 'temperature_800hPa' }
];
console.log("windData structure:", windData);
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.insertCell().innerHTML = 'Time/<br>Alt';
    table.appendChild(headerRow);

    const dayAbbreviations = ['SU', 'M', 'T', 'W', 'TR', 'F', 'SA'];
    
    windData.hourly.time.forEach((time, columnIndex) => {
    const date = new Date(time);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Convert month to MM format
    const day = date.getDate().toString().padStart(2, '0'); // Convert day to DD format
    const hour = date.getHours();
    const isDaylight = hour >= 6 && hour <= 18; // assuming 6 AM to 6 PM are daylight hours
    const dayOfWeek = dayAbbreviations[date.getDay()];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHours = ((hour + 11) % 12 + 1);
    // Remove all references to 'minutes'
    // const minutes = date.getMinutes(); // This line is no longer needed
    // const formattedMinutes = minutes < 10 ? '0' + minutes : minutes; // Remove this line
    console.log("windData:", windData);
console.log("windData.hourly:", windData.hourly);
console.log("windData.hourly.precipitation_probability:", windData.hourly.precipitation_probability);
    const headerCell = document.createElement('th');
    headerCell.innerHTML = `<span class="small-font">${month}/${day}</span><br>` + // Add the date with smaller font size
                           `${dayOfWeek}<br>${formattedHours} <br>${ampm}`;
                           if (!windData || !windData.hourly || !Array.isArray(windData.hourly.precipitation_probability)) {
                            console.error('Error: Invalid wind data structure');
                            // Handle the error appropriately, potentially by stopping the function or setting a default value
                            return; // As an example action to take
                        }
                        
                        // Ensure the index is in bounds of the array
                        if (columnIndex < 0 || columnIndex >= windData.hourly.precipitation_probability.length) {
                            console.error('Error: columnIndex out of bounds');
                            // Handle the error appropriately
                            return; // As an example action to take
                        }
                        
                        // As we're sure the index is valid and the structure is correct,
                        // we can access the precipitation probability
                        const precipitationProbability = windData.hourly.precipitation_probability[columnIndex];
    const numberOfRowsToDraw = Math.floor(precipitationProbability / 9); // Example: 44% gives 4 rows to draw

    // Draw vertical borders around times of day when it's going to rain
    if (numberOfRowsToDraw > 0) {
        const percentageIndices = Array.from({ length: numberOfRowsToDraw }, (_, i) => i + 1);
        percentageIndices.forEach((rowIndex) => {
            // We will use an attribute to store information about which columns to border later
            headerCell.setAttribute(`data-rain-border-row-${rowIndex}`, 'true'); 
        });
    }

     if (isDaylight) {
        headerCell.classList.add('daylight'); // Add the 'daylight' class if it's within daylight hours
    }
    headerRow.appendChild(headerCell);
});

    altitudes.forEach((altitude, altitudeIndex) => {
    const row = document.createElement('tr');
    const altitudeLabelCell = row.insertCell();
    altitudeLabelCell.textContent = altitude.label;
    if (altitude.extraClass) {
        altitudeLabelCell.classList.add(altitude.extraClass);
    }

    // Check if the temperature data is available for this altitude, if it is available in modelData
    let hasTemperatureData = altitude.tempKey && altitude.tempKey in modelData.hourly;

    // Check if the wind data is available for this altitude, it should always be in modelData
    let hasWindData = altitude.speedKey in modelData.hourly;

    // Check if we have precipitation probability in the current model data
    let hasPrecipitationProbability = 'precipitation_probability' in modelData.hourly;

    // If it's a cloud cover altitude and has cloud coverage data, special processing may be needed
    if ((altitude.speedKey === 'cloud_cover_low' || altitude.speedKey === 'cloud_cover') && hasWindData) {
        modelData.hourly[altitude.speedKey].forEach((cloudPercentage, columnIndex) => {
            const cloudCell = row.insertCell();
            cloudCell.textContent = `${cloudPercentage}%`; // Display percentage
            styleCloudCell(cloudCell, cloudPercentage); // Style cell based on cloud percentage
        });
    } else if (hasWindData) {
        // Otherwise, handle the typical wind speed/direction/temperature cells
        modelData.hourly[altitude.speedKey].forEach((speed, columnIndex) => {
            const windSpeedCell = row.insertCell();
            speed = Math.round(speed);
            windSpeedCell.textContent = speed; // Set the text to the speed value

            // If direction is provided, append the direction arrow
            if (altitude.dirKey && (altitude.dirKey in modelData.hourly)) {
                const direction = modelData.hourly[altitude.dirKey][columnIndex];
                const arrowUnicode = getArrowUnicodeFromDirection(direction);
                windSpeedCell.innerHTML = `${speed}<br>${arrowUnicode}`; // Combine speed and direction
            } else {
            windSpeedCell.textContent = `${speed}`; // Fallback if direction key is missing
}
        const { backgroundColor, textColor } = getWindSpeedColor(speed);
    
windSpeedCell.style.backgroundColor = backgroundColor;
windSpeedCell.style.color = textColor;

    windSpeedCell.classList.add('clickable-cell');
    windSpeedCell.addEventListener('click', () => displayPopup(speed, windGusts));
        
        // Class assignment based on wind speed
       // if (speed < 8) {
        //    windSpeedCell.classList.add('blue');
       //} else if (speed >= 8 && speed < 15) {
       //     windSpeedCell.classList.add('green');
       // } else {
       //     windSpeedCell.classList.add('red');
       // }
              if (headerRow.cells[columnIndex + 1].hasAttribute(`data-rain-border-row-${altitudeIndex + 1}`)) {
            windSpeedCell.style.borderLeft = '2px solid blue';
            windSpeedCell.style.borderRight = '2px solid blue';
        }
    });}

        table.appendChild(row);
    });
    // Flip the table rows before returning
flipTableRows(table);// Add new row for Total Cloud Cover
    
    

    // ... (rest of the existing code for creating the wind speed rows)
    // ... (existing code for flipping table and other finalizations)

    return table;
}

// Helper function to style the cloud cover percentage cells
function styleCloudCell(cell, cloudPercentage) {
    // Define the maximum gray intensity for 100% cloud cover (0 would be black)
    const maxGrayIntensity = 75; // You can change this value to get lighter shades

    // Calculate the gray intensity based on the cloud cover percentage
    // When cloudPercentage is 100, it will use maxGrayIntensity instead of 0
    const grayIntensity = Math.round(maxGrayIntensity + ((100 - cloudPercentage) / 100) * (255 - maxGrayIntensity));
    
    // Set the cell background color and text color based on gray intensity
    cell.style.backgroundColor = `rgb(${grayIntensity}, ${grayIntensity}, ${grayIntensity})`;
    cell.style.color = cloudPercentage > 50 ? 'white' : 'black';
}
function getWindSpeedColor(speed) {
    let thresholds = [
        { speed: blueThresholdValue, color: { r: 0, g: 0, b: 255 } },
        { speed: greenThresholdValue, color: { r: 0, g: 255, b: 0 } },
        { speed: redThresholdValue, color: { r: 255, g: 0, b: 0 } }
    ];

    // Find the pair of thresholds between which the speed falls
    let lowerThreshold, upperThreshold;
    for (let i = 0; i < thresholds.length - 1; i++) {
        if (speed >= thresholds[i].speed && speed < thresholds[i + 1].speed) {
            lowerThreshold = thresholds[i];
            upperThreshold = thresholds[i + 1];
            break;
        }
    }

    // If the speed is below the minimum threshold
    if (!lowerThreshold) {
        lowerThreshold = thresholds[0];
        upperThreshold = thresholds[0];
    }
    
    // If the speed is above the maximum threshold
    if (speed >= thresholds[thresholds.length - 1].speed) {
        lowerThreshold = thresholds[thresholds.length - 1];
        upperThreshold = thresholds[thresholds.length - 1];
    }

    // Calculate the ratio of the speed between the two thresholds
    let ratio = 0;
    if (upperThreshold.speed !== lowerThreshold.speed) { // Prevents division by zero
        ratio = (speed - lowerThreshold.speed) / (upperThreshold.speed - lowerThreshold.speed);
    }

    // Calculate the gradient color
    const r = Math.round(lowerThreshold.color.r + ratio * (upperThreshold.color.r - lowerThreshold.color.r));
    const g = Math.round(lowerThreshold.color.g + ratio * (upperThreshold.color.g - lowerThreshold.color.g));
    const b = Math.round(lowerThreshold.color.b + ratio * (upperThreshold.color.b - lowerThreshold.color.b));
    // Determine text color for visibility (simple contrast)
    const textColor = r*0.299 + g*0.587 + b*0.114 > 150 ? 'black' : 'white';

    return { backgroundColor: `rgb(${r}, ${g}, ${b})`, textColor };

}
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
function flipTableRows(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    const header = rows.shift(); // Remove the header row not to flip it
    rows.reverse(); // Reverse the order of rows
    rows.unshift(header); // Add the header back to the beginning
    rows.forEach(row => table.appendChild(row)); // Append rows back to the table in new order
}

function onWindDataReceived(modelData, modelName) {
    console.log(`Creating table for: ${modelName}`); // Debug log

    // Before creating the table, check that modelData has the correct structure
    if (!modelData || !modelData.hourly || !modelData.hourly.time ||
        !Array.isArray(modelData.hourly.time) || modelData.hourly.time.length === 0) {
        console.error(`Model data for ${modelName} is missing or has incorrect structure.`);
        return; // Do not proceed with table creation
    }
    // Function to create and return a table based on the wind data
    const table = createTable(modelData, modelName);

   // Create a new table container for this model
   const modelContainerId = `${modelName.toLowerCase()}Container`;
   let modelContainer = document.getElementById(modelContainerId);
   if (!modelContainer) {
       // Create the container if it does not exist
       modelContainer = document.createElement('div');
       modelContainer.id = modelContainerId;
       document.getElementById('tableContainer').appendChild(modelContainer);
   }

   // Clear previous contents of the container
   modelContainer.innerHTML = '';

   // Create and append a heading for each model's data
   const heading = document.createElement('h2');
   heading.textContent = `${modelName} Wind Data`; // Set the text for the heading

   // Check before appending that the elements actually exist
   if (heading && table) {
       modelContainer.appendChild(heading); // Append the heading
       modelContainer.appendChild(table);   // Append the table
   } else {
       console.error(`Failed to create table or heading for ${modelName}`);
   }
}
window.addEventListener('DOMContentLoaded', (event) => {
    const updateValueLabel = (inputId, valueId) => {
        const inputElement = document.getElementById(inputId);
        const valueElement = document.getElementById(valueId);

        

        
    };

    updateValueLabel('blueThreshold', 'blueThresholdVal');
    updateValueLabel('greenThreshold', 'greenThresholdVal');
    updateValueLabel('redThreshold', 'redThresholdVal');

    // [...]
});