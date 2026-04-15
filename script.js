document.getElementById('bestDaysButton').style.display = 'none';
allTableWeatherData=[];
    $(document).ready(function () {
            // Existing event handlers...

            // Clear the input field every time it gains focus
            $('#location-input').on('focus', function () {
                $(this).val(''); // Set the value to an empty string
            });

            // Your other code can remain the same...
        });
  const input = $('#location-input');
    const autocompleteResults = $('#autocomplete-results');
let debouncedFetchLocations = function() {};
     input.on('input', function (e) {
// Clear any previously set timeouts to ensure only the last one runs
clearTimeout(debouncedFetchLocations);

// call the API after the user has stopped typing for a period of time (e.g., 500 ms)
const value = $(this).val();
if (value.length > 2) {
    // Set up the debounced function which will only trigger after 500ms of no input
    debouncedFetchLocations = setTimeout(function() {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`)
            .then(response => response.json())
            .then(data => {
                autocompleteResults.empty();
                data.forEach((item) => {
                    autocompleteResults.append(
                        `<li class="autocomplete-item" data-lat="${item.lat}" data-lon="${item.lon}">${item.display_name}</li>`
                    );
                });
                autocompleteResults.show();
            })
            .catch(err => console.error("Error fetching autocomplete data", err));
    }, 500); // The delay in milliseconds (500ms in this case)
} else {
    autocompleteResults.hide();
}
});

$(document).on('click', '.autocomplete-item', function () {
// Fill the input with the selected location 
input.val($(this).text());
input.data('lat', $(this).data('lat'));
input.data('lon', $(this).data('lon'));

// Also, store the coordinates in cookies
setCookie('lastSelectedLat', $(this).data('lat'), 1);
setCookie('lastSelectedLon', $(this).data('lon'), 1);

autocompleteResults.hide();
// Store the city name in a global variable or data attribute
const cityName = $(this).text().split(',')[0]; // Get the city name (assuming it is the first part of the location string)
$('#cityName').text(cityName);
setCookie('cityName', cityName, 365); // Update the cookie with the new city name

// Automatically click the fetch weather data button after selection
$('#fetchCoordinatesButton').click();
});
    
    $('#submit-button').on('click', function () {
        
        const lat = input.data('lat');
        const lon = input.data('lon');
        if (lat && lon) {
            // do something with the coordinates
            alert(`Coordinates are: Latitude: ${lat}, Longitude: ${lon}`);
        } else {
            // input does not have coordinates data, you can make a new request or urge the user to select from suggestions
            alert('Please select a location from the suggestions.');
           
            
            return
        }
    });

    // To hide results when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).is('#location-input')) {
            autocompleteResults.hide();
        }
    });

let highAltitudeVisible = false;
let windShearEnabled = false;
let fogEnabled = false;


const highPressureAltitudes = [400, 500, 600, 700, 800]; // hPa values to be toggled

const editButton = document.getElementById('editButton');
const buttonSections = document.getElementById('buttonSections');



document.getElementById('DisplayAllTables').addEventListener('click', function () {
document.getElementById('savedLocationsPopup').style.display = 'none';
DisplayAllTables();

})

document.getElementById('resetAllButton').addEventListener('click', function () {
    // Clear all cookies
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });

    // Clear all localStorage data
    localStorage.clear();

    // Refresh the page to apply changes
    location.reload();
});
function isWindShearDetected(currentSpeed, nextSpeed, currentDirection, nextDirection) {
    const speedDiff = Math.abs(currentSpeed - nextSpeed);
    const directionDiff = getWindDirectionDifference(currentDirection, nextDirection);

    // Check wind shear conditions based on speed and direction differences
    return speedDiff > 10 || (speedDiff > 5 && directionDiff > 90);
}

function getWindDirectionDifference(dir1, dir2) {
    const diff = Math.abs(dir1 - dir2) % 360; // This is the naive difference
    // The smallest difference takes the wraparound into account
    return diff > 180 ? 360 - diff : diff;
}

// Function to toggle the variable options popup
function toggleVariableOptionsPopup() {
        const popup = document.getElementById('variableOptionsPopup');
        popup.style.display = popup.style.display === 'none' ? 'flex' : 'none'; // Toggle between showing and hiding
    }


let dewpointSpreadCheckbox = null;
document.getElementById('addCurrentLocationButton').addEventListener('click', function () {
const cityName = $('#cityName').text();
const lat = $('#location-input').data('lat');
const lon = $('#location-input').data('lon');
addLocationToSavedLocations(cityName, { lat, lon });
});

function addLocationToSavedLocations(name) {
let coords = {
lat: $('#location-input').data('lat'),
lon: $('#location-input').data('lon')
};

// If coordinates are not present in data attributes, try loading from cookies
if (!coords.lat || !coords.lon) {
coords.lat = getCookie('lastSelectedLat');
coords.lon = getCookie('lastSelectedLon');
}

// If coordinates are still not available, return and do not attempt to save the location
if (!coords.lat || !coords.lon) {
alert('Please select a location first.');
return;
}

const savedLocations = getSavedLocations();
if (savedLocations.length < 10) {
savedLocations.push({ name, coords });
setCookie('savedLocations', JSON.stringify(savedLocations), 365);
updateSavedLocationsList();
} else {
alert('Maximum of 10 locations can be saved.');
}
}
function deleteLocationFromSavedLocations(index) {
    // Retrieve existing locations from cookies
    const savedLocations = getSavedLocations();
    savedLocations.splice(index, 1); // Remove the location at the given index
    setCookie('savedLocations', JSON.stringify(savedLocations), 365);
    updateSavedLocationsList();
}
function loadWeatherDataForLocation(coords) {
        userLocation.latitude = coords.lat;
        userLocation.longitude = coords.lon;
        setCookie('userLatitude', userLocation.latitude, 365);
        setCookie('userLongitude', userLocation.longitude, 365);
        const bestDaysButton = document.getElementById('bestDaysButton');
if (bestDaysButton) {
bestDaysButton.textContent = 'Best Hours'; // Reset the button text
}

        fetchAllModelsData();
    }
    function getSavedLocations() {
            // Try to get the saved locations from a cookie
            const savedLocationsStr = getCookie('savedLocations');
            // If the cookie exists and is not empty, parse it into an array of locations
            if (savedLocationsStr) {
                try {
                    return JSON.parse(savedLocationsStr);
                } catch (e) {
                    console.error("Failed to parse saved locations:", e);
                    return []; // Return an empty array if parsing fails
                }
            }
            // If there is no such cookie, return an empty array
            return [];
        }
function updateSavedLocationsList() {
        const savedLocations = getSavedLocations();
        const listElement = document.getElementById('savedLocationsList');
        listElement.innerHTML = ''; // Clear current list

        savedLocations.forEach((location, index) => {
            const locationItem = document.createElement('li');
            locationItem.classList.add('saved-location-item'); // Added class for styling

            const locationLink = document.createElement('a');
            locationLink.href = "#";
            locationLink.textContent = location.name;

            // Attach a click event listener to the link
            locationLink.addEventListener('click', () => {
                // Update the displayed city name
                document.getElementById('cityName').textContent = location.name;
                document.getElementById('cityName').style.display = 'block'; // Ensure the city name is visible
                 setCookie('cityName', location.name, 365); // <-- Make sure this line exists
                // Load weather data for the selected saved location
                loadWeatherDataForLocation(location.coords);
                toggleSavedLocationsPopup(); // Close the saved locations popup
                clickCollapseButton();
                
            });

            locationItem.appendChild(locationLink);

            // Add a delete button for each saved location
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deleteLocationFromSavedLocations(index); // Function to delete the location
            });

            locationItem.appendChild(deleteButton); // Append delete button to the flex container

            listElement.appendChild(locationItem); // Append the list item with flexbox to the saved locations list
        });
    }

function saveSettingsAndFetchData() {
    // Get all the checkbox elements
    const capeCheckbox = document.getElementById('capeCheckbox');
    const precipProbCheckbox = document.getElementById('precipProbCheckbox');
    const temp2mCheckbox = document.getElementById('temp2mCheckbox');
    const cloudCoverCheckbox = document.getElementById('cloudCoverCheckbox');
    const precipSumCheckbox = document.getElementById('precipSumCheckbox');
    const dewpointSpreadCheckbox = document.getElementById('dewpointSpreadCheckbox');
    const relativeHumidityCheckbox = document.getElementById('relativeHumidityCheckbox');
    const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
    const visibilityCheckbox = document.getElementById('visibilityCheckbox');
    
    // Save the checkbox states to cookies
    setCookie('variable_cape', capeCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_precipitation_probability', precipProbCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_temperature_2m', temp2mCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_cloud_cover', cloudCoverCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_precipitation_sum', precipSumCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_dewpoint_spread', dewpointSpreadCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_lifted_index', liftedIndexCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_visibility', visibilityCheckbox.checked ? 'true' : 'false', 365);
    // Hide the popup
     saveCheckboxState(capeCheckbox);
saveCheckboxState(precipProbCheckbox);
saveCheckboxState(temp2mCheckbox);
saveCheckboxState(cloudCoverCheckbox);
saveCheckboxState(precipSumCheckbox);
saveCheckboxState(dewpointSpreadCheckbox);
saveCheckboxState(relativeHumidityCheckbox);
saveCheckboxState(liftedIndexCheckbox);
saveCheckboxState(visibilityCheckbox);

    toggleVariableOptionsPopup();
    clickCollapseButton();
    // Fetch all model data
    fetchAllModelsData();
}

// Listen for click events on the "Edit" button

editButton.addEventListener('click', function () {
    // Toggle visibility state
    if (buttonSections.style.display === 'none') {
        buttonSections.style.display = 'block';    // Show the buttons
        editButton.textContent = 'Collapse';       // Update the button text to "Collapse"
    } else {
        buttonSections.style.display = 'none';     // Hide the buttons
        editButton.textContent = 'Toolbar';           // Reset the button text to "Edit"
    }
});
document.getElementById('toggleHighAltitudeButton').addEventListener('click', function () {
    // Toggle the flag
    highAltitudeVisible = !highAltitudeVisible;

    // Optionally, update button text or styling to reflect the state
    this.textContent = highAltitudeVisible ? 'Hide High Altitude' : 'Show High Altitude';
    fetchAllModelsData();
});
document.getElementById('checkWindShearButton').addEventListener('click', function () {
    
   
        windShearEnabled = !windShearEnabled;
        setCookie('windShearEnabled', windShearEnabled ? 'true' : 'false', 365);
        const button = this; // 'this' refers to the button element in a regular function.

        // Always display "Loading..." text and disable the button while processing
        button.textContent = 'Loading...';
    

    
        fetchAllModelsData();
        if (windShearEnabled == true) { button.textContent = 'Disable Wind Shear'; }
        else (button.textContent = 'Enable Wind Shear' )
    
    });
function fillTableWithTemperature(table, weatherData) {
    // Safety check: ensure table has at least one row
    const existingRows = table.getElementsByTagName('tr');
    if (existingRows.length === 0) {
        console.error(`Table ${table.id} has no rows, cannot fill with temperature data`);
        return;
    }

    let tableHtml = '<tr>' + existingRows[0].innerHTML + '</tr>';
    // Adjusted to include values in meters (2m, 10m, 80m, 180m), and their approximate conversion to feet
    const altitudeLevels = [2, 10, 1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30].reverse();

    // Convert altitude levels to their corresponding temperature keys and display values
    altitudeLevels.forEach(altitude => {
        let temperatureKey;
        let displayAltitude; // Define a variable to hold our display altitude

        if (altitude === 2 || altitude === 10 || altitude === 80 || altitude === 180) {
            // Handle the specific meters values, convert to feet for display
            temperatureKey = `temperature_${altitude}m`;
            displayAltitude = `${Math.round(altitude * 3.28084)} ft`; // Convert meters to feet
        } else {
            // Handle hPa values
            temperatureKey = `temperature_${altitude}hPa`;
            displayAltitude = `${hPaToFeet(altitude)} ft`; // Convert hPa to feet for display
        }

        // Check if the data contains temperature info for this altitude
        if (weatherData.hourly.hasOwnProperty(temperatureKey)) {
            tableHtml += `<tr><th class="sticky-header">${displayAltitude}</th>`;
            weatherData.hourly[temperatureKey].forEach(temp => {
                const { backgroundColor, textColor } = getTemperatureColor(temp);
                // Round temp to the nearest whole number or display a placeholder if null
                const displayedTemp = temp !== null ? Math.round(temp) : '?';
                tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${displayedTemp}</td>`;
            });
            tableHtml += '</tr>';
        }
    });

    table.innerHTML = tableHtml; // Update the table HTML
    table.dataset.showing = 'temperature'; // Set attribute to indicate current data shown

    // After adding temperature data, enable/disable buttons as needed
    toggleHighAltitude();
    toggleDaylightHours();
    disableButtonsExcept(['cloudsButton', 'toggleTemperatureButton', 'returnToWindTableButton']);
}
    function getTemperatureColor(temperature) {
            let backgroundColorRGB;
            let textColor = 'black'; // Default text color for light backgrounds

            if (temperature >= 100) {
                backgroundColorRGB = colors.darkred; // Dark Red color for 100 and above
            } else if (temperature >= 90) {
                // Gradient from red to dark red
                backgroundColorRGB = interpolateColorRGB('red', 'darkred', (temperature - 90) / (100 - 90));
            } else if (temperature >= 72) {
                // Gradient from green to red
                backgroundColorRGB = interpolateColorRGB('green', 'red', (temperature - 72) / (90 - 72));
            } else if (temperature >= 55) {
                // Gradient from blue to green
                backgroundColorRGB = interpolateColorRGB('blue', 'green', (temperature - 50) / (72 - 50));
            } else if (temperature >= 32) {
                // Gradient from white to blue
                backgroundColorRGB = interpolateColorRGB('white', 'blue', (temperature - 32) / (50 - 32));
            } else {
                backgroundColorRGB = colors.white; // White color for temperatures below 32
            }

            // Set text color to white if background is dark
            if (isColorDark(backgroundColorRGB.r, backgroundColorRGB.g, backgroundColorRGB.b)) {
                textColor = 'white';
            }

            // Return the background color in CSS rgb() format and the contrasting text color
            const backgroundColor = `rgb(${backgroundColorRGB.r}, ${backgroundColorRGB.g}, ${backgroundColorRGB.b})`;
            return { backgroundColor, textColor };
        }
        document.getElementById('instructionsButton').addEventListener('click', function () {
                window.open('https://scottypres.github.io/instructions.html', '_blank');
            });
function displaywindshear() {
        

        

    // Select all tables that end in '-table', such as 'icon-table', 'gfs-table', etc.
    const tables = document.querySelectorAll('table[id$="-table"]');
            tables.forEach(table => {
        

        // Get all the rows (tr elements) of the current table, excluding the header row
        const rows = table.querySelectorAll('tr:not(:first-child)');
        const rowCount = rows.length;

        // Ensure only the last 5 rows are considered
        const startRow = Math.max(rowCount - 18, 0);
        // Iterate through each row, but not the last row since there's no row below it
         for (let rowIndex = startRow; rowIndex < rows.length - 1; rowIndex++) {
            const currentRow = rows[rowIndex];
            const nextRow = rows[rowIndex + 1];

            // Get all cells within the current row that contain wind speed and direction data
            const currentRowWindCells = currentRow.querySelectorAll('td[data-wind-speed][data-wind-direction]');

            // Get all cells within the next row that contain wind speed and direction data
            const nextRowWindCells = nextRow.querySelectorAll('td[data-wind-speed][data-wind-direction]');

            // Only compare cells if the next row has the same number of wind data cells
            if (currentRowWindCells.length === nextRowWindCells.length) {
                // Compare each cell from the current row to the corresponding cell in the next row
                currentRowWindCells.forEach((cell, cellIndex) => {
                    const currentWindSpeed = parseFloat(cell.dataset.windSpeed);
                    const currentWindDirection = parseFloat(cell.dataset.windDirection);

                    const nextCell = nextRowWindCells[cellIndex];
                    const nextWindSpeed = parseFloat(nextCell.dataset.windSpeed);
                    const nextWindDirection = parseFloat(nextCell.dataset.windDirection);

                    // Log the wind speeds and directions being compared for shear

                    // Check if the difference between current and next wind speed exceeds the threshold and check wind direction difference
                     if (isWindShearDetected(currentWindSpeed, nextWindSpeed, currentWindDirection, nextWindDirection)) {
                        // Apply the "shear-detected" class to current and corresponding cell in the next row
                        cell.classList.add('shear-detected');
                        nextCell.classList.add('shear-detected');
                    }
                });
            }
        }
    });

            
            
        
}

function removeWindShearStyles() {
    document.querySelectorAll('.shear-detected').forEach(cell => {
        cell.classList.remove('shear-detected');
    });
}
function toggleHighAltitude() {
    highAltitudeVisible = !highAltitudeVisible; // Toggle the state
    
    const tables = document.querySelectorAll('table[id$="-table"]');
    tables.forEach(table => {
        const rows = table.getElementsByTagName('tr');
        // Skip the header row by starting the loop at index 1
        for (let i = 1; i < rows.length; i++) {
            const altitudeText = rows[i].cells[0].innerText;
            const altitudeInFeet = altitudeText.replace(' ft', '');
            if (parseInt(altitudeInFeet) > 5000 && altitudeText !== 'High%' && 
                altitudeText !== 'Mid%' && altitudeText !== 'Low%') {
                rows[i].style.display = highAltitudeVisible ? '' : 'none'; // Show if highAltitudeVisible is true, hide if false
            }
        }
    });
}
let daylightHoursShown = true;
userLocation = getUserLocationFromCookies();



// Initialize global threshold variables
lowWindThreshold = 7;
medWindThreshold = 15;
highWindThreshold = 20;
// Declare this at the top to store the initial view

let globalWeatherData = {};
let bestWindSpeedThreshold = 15;

document.getElementById('toggleDaylightButton').addEventListener('click', function () {
        daylightHoursShown = !daylightHoursShown;
        this.textContent = daylightHoursShown ? 'Show All Hours' : 'Daylight Hours Only';
        setCookie('daylightHoursShown', daylightHoursShown ? 'true' : 'false', 365); // Save the state in a cookie
        fetchAllModelsData();
    });

function toggleDaylightHours() {
        const tables = document.querySelectorAll('table[id$="-table"]'); // Select all tables

        // Iterate over each table
        tables.forEach(table => {
            const headerCells = table.querySelectorAll('tr:first-child th:not(:first-child)'); // Header cells, excluding the first sticky column
        
            headerCells.forEach((cell, index) => {
                // Check if the header cell has the 'daylight' class
                const isDaylight = cell.classList.contains('daylight');

                // Instead of removing cells, we toggle their visibility
                if (daylightHoursShown && !isDaylight) {
                    // If daylight hours should be shown but the cell is not marked as daylight, hide it
                    cell.style.display = 'none';
                } else {
                    // Otherwise, show the cell
                    cell.style.display = '';
                }

                // Apply the same display style to the corresponding data cells in each row
                table.querySelectorAll(`tr:not(:first-child) td:nth-child(${index + 2})`).forEach(dataCell => {
                    dataCell.style.display = cell.style.display; // Match the display style of the header cell
                });
            });
        });

        
        
    }


document.getElementById('bestDaysButton').addEventListener('click', function () {
const isPopupVisible = document.getElementById('bestDaysPopup').style.display === 'flex';

    // Show the popup
    document.getElementById('bestDaysPopup').style.display = 'flex';
    // Disable buttons other than 'applyBestDaysButton' and 'fetchCoordinatesButton'
    toggleButtonsDisabledState(true, ['applyBestDaysButton', 'editButton']);
}
);


let showingBestHours = false;
;
function resetTables() {
    
    // Loop over each model to create the tables again using the stored data
    Object.keys(globalWeatherData).forEach(model => {
        const tableId = `${model.toLowerCase()}-table`;
        createTable(tableId, globalWeatherData[model], model);
    });
    // After resetting the tables, update the toggle button text to reflect the content shown in the tables

    initialTableSetup();
   
    cityName.style.display = 'block';
}

// Event listener to handle when the user clicks the "Apply" button in the Best Days popup
document.getElementById('applyBestDaysButton').addEventListener('click', function () {
   
        const bestDaysPopup = document.getElementById('bestDaysPopup');
        bestDaysPopup.style.display = 'none';
        const applyBestDaysButton = this; // "this" refers to the 'applyBestDaysButton'
        const bestDaysButton = document.getElementById('bestDaysButton'); // Assuming this is the ID of your "Best Days/Reset Best Hours" button

        if (!bestDaysPopup.style.display || bestDaysPopup.style.display === 'none') {
            // Show the popup
            bestDaysPopup.style.display = 'flex';
        } else {
            // Since the popup is visible, apply the filter
            filterBestDaysColumns();
            
            applyBestDaysButton.textContent = 'Apply';
            bestDaysButton.textContent = 'Reset Best Hours'; // Change the button text to 'Reset Best Hours'
            bestDaysPopup.style.display = 'none';
        }
        toggleButtonsDisabledState(false, ['editButton']);
        
        cityName.style.display='block';
    });
document.getElementById('bestDaysButton').addEventListener('click', function () {

if (this.textContent === 'Reset Best Hours') {
// Reset the tables
resetTables();

// Change the button text back to 'Best Hours'
this.textContent = 'Best Hours';

// Hide the popup if it's visible
document.getElementById('bestDaysPopup').style.display = 'none';
}

cityName.style.display = 'block';
});
function filterBestDaysColumns() {
// Threshold in mph
const bestWindSpeedThreshold = parseFloat(document.getElementById('bestWindSpeed').value);

// Get tables containing wind speeds
const tables = document.querySelectorAll('table[id$="-table"]');

tables.forEach(table => {
// Get all header cells (ignoring the first row which contains model names)
const headers = table.querySelectorAll('tr:first-child th:not(:first-child)');
// Get all rows to access speed values at specified altitudes
const rows = table.querySelectorAll('tr:not(:first-child)');

// Determine which rows correspond to altitudes 33, 262, and 361 ft
const targetAltitudeRows = [...rows].filter(row => {
    const altitudeText = row.cells[0].innerText.replace(' ft', '');
    const altitude = parseInt(altitudeText, 10);
    return [33, 262, 361].includes(altitude);
});

// Iterate over each column (time slot) to build a list of columns to delete
const columnsToDelete = new Set();

headers.forEach((header, columnIndex) => {
    // Skip if this column is already marked for deletion
    if (columnsToDelete.has(columnIndex)) return;

    // Check whether any of the wind speeds exceed the threshold
    let columnOverThreshold = targetAltitudeRows.some(row => {
        const windSpeedText = row.cells[columnIndex + 1].innerText.trim();
        const windSpeed = parseFloat(windSpeedText);
        return windSpeed > bestWindSpeedThreshold;
    });

    // Mark the whole column for deletion if the threshold is exceeded
    if (columnOverThreshold) {
        columnsToDelete.add(columnIndex);
    }
});

// Delete marked columns starting from the highest index to avoid index shifting
[...columnsToDelete].sort((a, b) => b - a).forEach(columnIndex => {
    // Iterate over all rows to remove the cell at columnIndex
    rows.forEach(row => {
        row.deleteCell(columnIndex + 1); // +1 to account for the sticky header cell
    });
    headers[columnIndex].parentNode.removeChild(headers[columnIndex]); // Remove header cell
});
});
addVerticalBordersBetweenDays();
document.getElementById('bestDaysButton').textContent = 'Reset Best Hours';
}

// Event listener for the "Apply Best Days" button
document.getElementById('applyBestDaysButton').addEventListener('click', function () {
const bestDaysPopup = document.getElementById('bestDaysPopup');
if (!bestDaysPopup.style.display || bestDaysPopup.style.display === 'none') {
bestDaysPopup.style.display = 'flex';
} else {
filterBestDaysColumns(); // Call the modified function
bestDaysPopup.style.display = 'none';
}
});

// After tables have been generated, enable the "Best Days" button
function enableBestDaysButton() {
    const bestDaysButton = document.getElementById('bestDaysButton');
    if (bestDaysButton) {
        bestDaysButton.disabled = false; // Enable the button
    }
}
function getWindArrowRotation(degrees) {
    degrees = (degrees + 180) % 360;
    const closestMultiple = Math.round(degrees / 22.5) * 22.5;
    return closestMultiple;
}
function initialTableSetup() {
    const tableIds=['icon-table','gfs-table']
    
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        
            fillTableWithWindSpeed(table, globalWeatherData[table.dataset.model]);
        
    });
    
    // toggleDaylightHours();
    //submitThresholdsAndRepaint();
    
}
function initialAllTableSetup(tableIds) {
    

tableIds.forEach(tableId => {
const table = document.getElementById(tableId);

if (table && table.dataset.model) { // Ensure the dataset model attribute exists
    const model = table.dataset.model; // Get model name from data attribute
    if (allTableWeatherData[tableId]) { // Check if the model exists in allTableWeatherData
        // Use model data to fill the table with wind speed
        fillAllTablesWithWindSpeed(table, allTableWeatherData[tableId]);
        
    } else {
        console.error(`Model data not found for model: ${model}`);
    }
}
});

}

function showConfigPopup() {
        document.getElementById('configPopup').style.display = 'flex';

        // Now, include the 'editButton' ID in the list of buttons to be excluded from disabling
        toggleButtonsDisabledState(true, ['submitThresholds', 'fetchCoordinatesButton', 'editButton']);
    }
    
// Fetch data for each model
const baseUrls = {
    //openMeteo: 'https://api.open-meteo.com/v1/forecast',
   gfs: 'https://api.open-meteo.com/v1/gfs',
    icon: 'https://api.open-meteo.com/v1/dwd-icon'
};
//fetchAllModelsData();
document.getElementById('editThresholdsButton').addEventListener('click', showConfigPopup); // assume editThresholdsButton is the ID of the button to show the popup
function submitThresholdsAndRepaint() {
    // Get the threshold values from the input fields
    const blueThreshold = parseInt(document.getElementById('blueThreshold').value, 10);
    const greenThreshold = parseInt(document.getElementById('greenThreshold').value, 10);
    const redThreshold = parseInt(document.getElementById('redThreshold').value, 10);

    // Store them in cookies
    setCookie('blueThreshold', blueThreshold, 365);
    setCookie('greenThreshold', greenThreshold, 365);
    setCookie('redThreshold', redThreshold, 365);

    // Repaint the graph
    repaintGraphsWithNewThresholds(blueThreshold, greenThreshold, redThreshold);

    // Hide the config popup
    document.getElementById('configPopup').style.display = 'none';
    
 toggleButtonsDisabledState(false, ['editButton']);
}
function toggleButtonsDisabledState(disable, excludeIds = []) {
const allButtons = document.querySelectorAll('button');
allButtons.forEach(button => {
    if (!excludeIds.includes(button.id)) {
        button.disabled = disable; // Disable or enable buttons based on the 'disable' boolean
        button.style.opacity = disable ? '0.5' : '1'; // Toggle opacity
    }
});
}

document.getElementById('submitThresholds').addEventListener('click', submitThresholdsAndRepaint);
function repaintGraphsWithNewThresholds(low, med, high) {
    // Assume these are the names of three different tables you have
    lowWindThreshold = low;
    medWindThreshold = med;
    highWindThreshold = high;

    const tableIds = ['icon-table', 'gfs-table']; // Add other table IDs as needed
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
       
            fillTableWithWindSpeed(table, globalWeatherData[table.dataset.model]);
        
    });
    
   
}
function hPaToFeet(hPa) {
    const conversionTable = {
        1000: 110,
        975: 320,
        950: 500,
        925: 800,
        900: 1000,
        850: 1500,
        800: 1900,
        700: 3000,
        600: 4200,
        500: 5600,
        400: 7200,
        300: 9200,
        250: 10400,
        200: 11800,
        150: 13700,
        100: 16200,
        70: 18300,
        50: 20600,
        30: 24000
    };

    const meters = conversionTable[hPa];
    const feet = meters * 3.28084; // Convert meters to feet
    return Math.round(feet);
}

document.querySelectorAll('table[id$="-table"]').forEach(table => {
    table.dataset.showing = 'winds'; // Start with winds data shown
});

document.getElementById('fetchCoordinatesButton').addEventListener('click', function () {
    clickCollapseButton();
   
    
        const input = $('#location-input');
        const lat = input.data('lat');
        const lon = input.data('lon');
        if (lat && lon) {
            // Set the user's coordinates with fetched latitude and longitude
            userLocation.latitude = lat;
            userLocation.longitude = lon;
            setCookie('userLatitude', lat, 365);
            setCookie('userLongitude', lon, 365);
            // Trigger data fetch with these new coordinates
            fetchAllModelsData();
        } else {
            alert('Please select a location from the suggestions.');
            buttonSections.style.display = 'block';    // Show the buttons
            editButton.textContent = 'Collapse';
            return
        }
    });

document.getElementById('gpsLocationButton').addEventListener('click', function () {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    const btn = this;
    btn.textContent = 'Locating...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const input = $('#location-input');
            input.data('lat', lat);
            input.data('lon', lon);
            userLocation.latitude = lat;
            userLocation.longitude = lon;
            setCookie('userLatitude', lat, 365);
            setCookie('userLongitude', lon, 365);
            setCookie('lastSelectedLat', lat, 1);
            setCookie('lastSelectedLon', lon, 1);

            // Reverse geocode to get city name
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(r => r.json())
                .then(data => {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || 'My Location';
                    $('#cityName').text(city);
                    setCookie('cityName', city, 365);
                    document.getElementById('cityName').style.display = 'block';
                })
                .catch(() => {
                    $('#cityName').text('My Location');
                    setCookie('cityName', 'My Location', 365);
                });

            btn.textContent = 'Use My Location';
            btn.disabled = false;
            clickCollapseButton();
            fetchAllModelsData();
        },
        function (error) {
            btn.textContent = 'Use My Location';
            btn.disabled = false;
            alert('Unable to get your location. Please check your browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

    //#####

    
let isUpdatingTables = false;
async function fetchAllModelsData() {
const displayAllTablesButton = document.getElementById('DisplayAllTables');
displayAllTablesButton.textContent ="Display All Saved Locations";
      
        
        if (isUpdatingTables) {
            // If already updating tables, do nothing.
            // You might want to handle this case more gracefully.
            
            return;
        }

        isUpdatingTables = true;

        try {
            // Await all promises related to API calls.
            // This ensures all promises are evaluated before closing the Swal modal.
            await Promise.all(Object.entries(baseUrls).map(async ([model, baseUrl]) => {
                await checkAndFetchData(baseUrl, model); // await added here
                
            }));

            initialTableSetup(); // Call initial setup after all models have been processed.
        } catch (error) {
            console.error('Error fetching data for all models:', error);
            // Optionally handle error display here.
        } finally {
            isUpdatingTables = false;
            
            cityName.style.display = 'block';
        }
    }

// Fetch data for each model by calling the new fetchAllModelsData function
//fetchAllModelsData();

let commonParameters = [];


//#####

function getUserLocationFromCookies() {
const latitude = getCookie('userLatitude');
const longitude = getCookie('userLongitude');
return { latitude, longitude };
}
function hasApiBeenCalledRecently(latitude, longitude) {
    const lastApiCallKey = `lastApiCall_${latitude}_${longitude}`;
    const lastApiCallDataStr = localStorage.getItem(lastApiCallKey);
    const now = Date.now();
    // Use shortest model interval (GFS/OpenMeteo = 60 min) as the threshold;
    // per-model caching in checkAndFetchData handles ICON's longer 6-hour window
    const cacheDuration = 60 * 60 * 1000; // 60 minutes

    if (lastApiCallDataStr) {
        const lastApiCallData = JSON.parse(lastApiCallDataStr);
        if (now - lastApiCallData.timestamp < cacheDuration) {
            return true; // API has been called within last 60 minutes
        }
    }
    return false;
}


async function checkAndFetchAllDataTables(baseUrl, model, lat, lon, name, tableElement, tableId) {

    try {
        const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
        let additionalParameters = '';

        const forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
        additionalParameters += `&forecast_days=${forecastDays}`;

        // Cache check for saved locations — same logic as checkAndFetchData
        const lastApiCallKey = `lastApiCall_savedLoc_${model}_${lat}_${lon}`;
        const now = Date.now();
        const cacheDuration = model.toLowerCase() === 'icon'
            ? 6 * 60 * 60 * 1000   // 6 hours for ICON
            : 60 * 60 * 1000;      // 60 minutes for GFS/OpenMeteo
        const lastApiCallDataStr = localStorage.getItem(lastApiCallKey);

        if (lastApiCallDataStr) {
            const lastApiCallData = JSON.parse(lastApiCallDataStr);
            if (now - lastApiCallData.timestamp < cacheDuration) {
                // Use cached data
                const weatherData = lastApiCallData.data;
                allTableWeatherData[tableId] = weatherData;
                if (tableElement instanceof HTMLTableElement) {
                    createAllTables(tableElement.id, weatherData, name, tableElement);
                } else {
                    createAllTables(tableId, weatherData, name, tableElement);
                }
                return;
            }
        }

        // Fetch new data — use fallback functions that return data directly
        let weatherData;

        if (model.toLowerCase() === 'gfs') {
            const result = await getGFSParametersWithFallback(baseUrl, lat, lon, units, additionalParameters);
            weatherData = result.data;
        } else if (model.toLowerCase() === 'icon') {
            const result = await getICONParametersWithFallback(baseUrl, lat, lon, units, additionalParameters);
            weatherData = result.data;

            // Add missing parameters that ICON doesn't support
            const timeLength = weatherData.hourly.time.length;
            if (!weatherData.hourly.boundary_layer_height) {
                weatherData.hourly.boundary_layer_height = new Array(timeLength).fill(null);
            }
            if (!weatherData.hourly.visibility) {
                weatherData.hourly.visibility = new Array(timeLength).fill(null);
            }
            if (!weatherData.hourly.lifted_index) {
                weatherData.hourly.lifted_index = new Array(timeLength).fill(null);
            }
            if (!weatherData.hourly.cape) {
                weatherData.hourly.cape = new Array(timeLength).fill(null);
            }
            if (!weatherData.hourly.precipitation_probability) {
                weatherData.hourly.precipitation_probability = new Array(timeLength).fill(null);
            }
        } else {
            // OpenMeteo: direct fetch
            commonParameters = [
                'temperature_2m', 'temperature_80m',
                'weather_code', 'relative_humidity_2m',
                'dew_point_2m',
                'visibility','lifted_index',
                'cloud_cover',
                'cloud_cover_low',
                'cloud_cover_mid',
                'cloud_cover_high',
                'cloud_cover_1000hPa',
                'cloud_cover_975hPa',
                'cloud_cover_950hPa',
                'cloud_cover_925hPa',
                'cloud_cover_900hPa',
                'cloud_cover_850hPa',
                'cloud_cover_800hPa',
                'cloud_cover_700hPa',
                'cloud_cover_600hPa',
                'cloud_cover_500hPa',
                'cloud_cover_400hPa',
                'cloud_cover_250hPa',
                'cloud_cover_200hPa',
                'cloud_cover_150hPa',
                'cloud_cover_300hPa',
                'cloud_cover_100hPa',
                'cloud_cover_70hPa',
                'cloud_cover_50hPa',
                'cloud_cover_30hPa',
                'wind_speed_10m',
                'wind_speed_80m',
                'wind_speed_180m', 'wind_gusts_10m',
                'wind_direction_10m',
                'wind_direction_80m',
                'wind_direction_180m',
                'temperature_1000hPa',
                'temperature_975hPa',
                'temperature_950hPa',
                'temperature_925hPa',
                'temperature_900hPa',
                'temperature_850hPa',
                'temperature_800hPa',
                'temperature_700hPa',
                'temperature_600hPa',
                'temperature_500hPa',
                'temperature_400hPa',
                'windspeed_1000hPa',
                'windspeed_975hPa',
                'windspeed_950hPa',
                'windspeed_925hPa',
                'windspeed_900hPa',
                'windspeed_850hPa',
                'windspeed_800hPa',
                'windspeed_700hPa',
                'windspeed_600hPa',
                'windspeed_500hPa',
                'windspeed_400hPa',
                'winddirection_1000hPa',
                'winddirection_975hPa',
                'winddirection_950hPa',
                'winddirection_925hPa',
                'winddirection_900hPa',
                'winddirection_850hPa',
                'winddirection_800hPa',
                'winddirection_700hPa',
                'winddirection_600hPa',
                'winddirection_500hPa',
                'winddirection_400hPa',
                'cape',
                'is_day',
                'precipitation_probability'
            ].join(',');

            const daily = [
                'weather_code', 'sunrise', 'sunset',
                'uv_index_max', 'precipitation_sum'
            ].join(',');

            const requestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${commonParameters}&daily=${daily}&current_weather=true${units}${additionalParameters}`;
            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            weatherData = await response.json();
        }

        // Cache the fetched data
        localStorage.setItem(lastApiCallKey, JSON.stringify({
            timestamp: now,
            data: weatherData
        }));

        allTableWeatherData[tableId] = weatherData;

        if (tableElement instanceof HTMLTableElement) {
            createAllTables(tableElement.id, allTableWeatherData[tableId], name, tableElement);
        } else {
            createAllTables(tableId, allTableWeatherData[tableId], name, tableElement);
        }
    } catch (error) {
        console.error(`Failed to fetch data for ${name} using model ${model}`, error);
    }
}



// Function to test ICON parameters and handle missing wind data at 180m
async function getICONParametersWithFallback(baseUrl, lat, lon, units, additionalParameters) {
    // First, try with all wind parameters including 180m
    const fullParameters = [
        'temperature_2m', 'temperature_80m', 'temperature_180m','precipitation',
        'weather_code', 'relative_humidity_2m',
        'dew_point_2m',
        'cloud_cover',
        'cloud_cover_low',
        'cloud_cover_mid',
        'cloud_cover_high',
        'cloud_cover_1000hPa',
        'cloud_cover_975hPa',
        'cloud_cover_950hPa',
        'cloud_cover_925hPa',
        'cloud_cover_900hPa',
        'cloud_cover_850hPa',
        'cloud_cover_800hPa',
        'cloud_cover_700hPa',
        'cloud_cover_600hPa',
        'cloud_cover_500hPa',
        'cloud_cover_400hPa',
        'cloud_cover_250hPa',
        'cloud_cover_200hPa',
        'cloud_cover_150hPa',
        'cloud_cover_300hPa',
        'cloud_cover_100hPa',
        'cloud_cover_70hPa',
        'cloud_cover_50hPa',
        'cloud_cover_30hPa',
        'wind_speed_10m',
        'wind_speed_80m',
        'wind_speed_180m', 'wind_gusts_10m',
        'wind_direction_10m',
        'wind_direction_80m',
        'wind_direction_180m',
        'temperature_1000hPa',
        'temperature_975hPa',
        'temperature_950hPa',
        'temperature_925hPa',
        'temperature_900hPa',
        'temperature_850hPa',
        'temperature_800hPa',
        'temperature_700hPa',
        'temperature_600hPa',
        'temperature_500hPa',
        'temperature_400hPa',
        'windspeed_1000hPa',
        'windspeed_975hPa',
        'windspeed_950hPa',
        'windspeed_925hPa',
        'windspeed_900hPa',
        'windspeed_850hPa',
        'windspeed_800hPa',
        'windspeed_700hPa',
        'windspeed_600hPa',
        'windspeed_500hPa',
        'windspeed_400hPa',
        'winddirection_1000hPa',
        'winddirection_975hPa',
        'winddirection_950hPa',
        'winddirection_925hPa',
        'winddirection_900hPa',
        'winddirection_850hPa',
        'winddirection_800hPa',
        'winddirection_700hPa',
        'winddirection_600hPa',
        'winddirection_500hPa',
        'winddirection_400hPa',
        'is_day'
    ].join(',');

    const dailyParameters = [
        'weather_code',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum'
    ].join(',');

    const requestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${fullParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
    
    try {
        const response = await fetch(requestUrl);
        if (response.ok) {
            const weatherData = await response.json();
            // Check if wind_speed_180m or wind_direction_180m are missing
            const missingWindData = !weatherData.hourly.wind_speed_180m || 
                                   !weatherData.hourly.wind_direction_180m;
            
            if (missingWindData) {
                // Add placeholder data for missing wind parameters
                const timeLength = weatherData.hourly.time.length;
                if (!weatherData.hourly.wind_speed_180m) {
                    weatherData.hourly.wind_speed_180m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_direction_180m) {
                    weatherData.hourly.wind_direction_180m = new Array(timeLength).fill(null);
                }
            }
            
            return { parameters: fullParameters, data: weatherData };
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {

        // Fallback: try without wind_speed_180m and wind_direction_180m
        const fallbackParameters = [
            'temperature_2m', 'temperature_80m', 'temperature_180m','precipitation',
            'weather_code', 'relative_humidity_2m',
            'dew_point_2m',
            'cloud_cover',
            'cloud_cover_low',
            'cloud_cover_mid',
            'cloud_cover_high',
            'cloud_cover_1000hPa',
            'cloud_cover_975hPa',
            'cloud_cover_950hPa',
            'cloud_cover_925hPa',
            'cloud_cover_900hPa',
            'cloud_cover_850hPa',
            'cloud_cover_800hPa',
            'cloud_cover_700hPa',
            'cloud_cover_600hPa',
            'cloud_cover_500hPa',
            'cloud_cover_400hPa',
            'cloud_cover_250hPa',
            'cloud_cover_200hPa',
            'cloud_cover_150hPa',
            'cloud_cover_300hPa',
            'cloud_cover_100hPa',
            'cloud_cover_70hPa',
            'cloud_cover_50hPa',
            'cloud_cover_30hPa',
            'wind_speed_10m',
            'wind_speed_80m', 'wind_gusts_10m',
            'wind_direction_10m',
            'wind_direction_80m',
            'temperature_1000hPa',
            'temperature_975hPa',
            'temperature_950hPa',
            'temperature_925hPa',
            'temperature_900hPa',
            'temperature_850hPa',
            'temperature_800hPa',
            'temperature_700hPa',
            'temperature_600hPa',
            'temperature_500hPa',
            'temperature_400hPa',
            'windspeed_1000hPa',
            'windspeed_975hPa',
            'windspeed_950hPa',
            'windspeed_925hPa',
            'windspeed_900hPa',
            'windspeed_850hPa',
            'windspeed_800hPa',
            'windspeed_700hPa',
            'windspeed_600hPa',
            'windspeed_500hPa',
            'windspeed_400hPa',
            'winddirection_1000hPa',
            'winddirection_975hPa',
            'winddirection_950hPa',
            'winddirection_925hPa',
            'winddirection_900hPa',
            'winddirection_850hPa',
            'winddirection_800hPa',
            'winddirection_700hPa',
            'winddirection_600hPa',
            'winddirection_500hPa',
            'winddirection_400hPa',
            'is_day'
        ].join(',');
        
        const fallbackRequestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${fallbackParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
        
        try {
            const fallbackResponse = await fetch(fallbackRequestUrl);
            if (fallbackResponse.ok) {
                const weatherData = await fallbackResponse.json();
                
                // Add placeholder data for missing 180m wind parameters
                const timeLength = weatherData.hourly.time.length;
                weatherData.hourly.wind_speed_180m = new Array(timeLength).fill(null);
                weatherData.hourly.wind_direction_180m = new Array(timeLength).fill(null);
                
                return { parameters: fallbackParameters, data: weatherData };
            } else {
                throw new Error(`Fallback HTTP error! Status: ${fallbackResponse.status}`);
            }
        } catch (fallbackError) {
            console.error('Both ICON API calls failed:', fallbackError);
            throw fallbackError;
        }
    }
}

// Function to test GFS parameters and handle missing wind data
async function getGFSParametersWithFallback(baseUrl, lat, lon, units, additionalParameters) {
    // First, try with all wind parameters including 10m
    const fullParameters = [
        'temperature_2m', 'temperature_80m',
        'boundary_layer_height',
        'weather_code', 'relative_humidity_2m',
        'dew_point_2m',
        'visibility','lifted_index',
        'cloud_cover',
        'cloud_cover_low',
        'cloud_cover_mid',
        'cloud_cover_high',
        'cloud_cover_1000hPa',
        'cloud_cover_975hPa',
        'cloud_cover_950hPa',
        'cloud_cover_925hPa',
        'cloud_cover_900hPa',
        'cloud_cover_850hPa',
        'cloud_cover_800hPa',
        'cloud_cover_700hPa',
        'cloud_cover_600hPa',
        'cloud_cover_500hPa',
        'cloud_cover_400hPa',
        'cloud_cover_250hPa',
        'cloud_cover_200hPa',
        'cloud_cover_150hPa',
        'cloud_cover_300hPa',
        'cloud_cover_100hPa',
        'cloud_cover_70hPa',
        'cloud_cover_50hPa',
        'cloud_cover_30hPa',
        'wind_speed_10m',
        'wind_speed_80m',
        'wind_speed_180m', 'wind_gusts_10m',
        'wind_direction_10m',
        'wind_direction_80m',
        'wind_direction_180m',
        'temperature_1000hPa',
        'temperature_975hPa',
        'temperature_950hPa',
        'temperature_925hPa',
        'temperature_900hPa',
        'temperature_850hPa',
        'temperature_800hPa',
        'temperature_700hPa',
        'temperature_600hPa',
        'temperature_500hPa',
        'temperature_400hPa',
        'windspeed_1000hPa',
        'windspeed_975hPa',
        'windspeed_950hPa',
        'windspeed_925hPa',
        'windspeed_900hPa',
        'windspeed_850hPa',
        'windspeed_800hPa',
        'windspeed_700hPa',
        'windspeed_600hPa',
        'windspeed_500hPa',
        'windspeed_400hPa',
        'winddirection_1000hPa',
        'winddirection_975hPa',
        'winddirection_950hPa',
        'winddirection_925hPa',
        'winddirection_900hPa',
        'winddirection_850hPa',
        'winddirection_800hPa',
        'winddirection_700hPa',
        'winddirection_600hPa',
        'winddirection_500hPa',
        'winddirection_400hPa',
        'cape',
        'is_day',
        'precipitation_probability'
    ].join(',');

    const dailyParameters = [
        'weather_code',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum'
    ].join(',');

    const requestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${fullParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
    
    try {
        const response = await fetch(requestUrl);
        if (response.ok) {
            const weatherData = await response.json();
            // Check if wind_speed_10m, wind_direction_10m, or wind_gusts_10m are missing
            const missingWindData = !weatherData.hourly.wind_speed_10m || 
                                   !weatherData.hourly.wind_direction_10m || 
                                   !weatherData.hourly.wind_gusts_10m;
            
            if (missingWindData) {
                // Add placeholder data for missing wind parameters
                const timeLength = weatherData.hourly.time.length;
                if (!weatherData.hourly.wind_speed_10m) {
                    weatherData.hourly.wind_speed_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_direction_10m) {
                    weatherData.hourly.wind_direction_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_gusts_10m) {
                    weatherData.hourly.wind_gusts_10m = new Array(timeLength).fill(null);
                }
            }
            
            return { parameters: fullParameters, data: weatherData };
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {

        // Fallback: try without wind_speed_10m, wind_direction_10m, and wind_gusts_10m
        const fallbackParameters = [
            'temperature_2m', 'temperature_80m',
            'boundary_layer_height',
            'weather_code', 'relative_humidity_2m',
            'dew_point_2m',
            'visibility','lifted_index',
            'cloud_cover',
            'cloud_cover_low',
            'cloud_cover_mid',
            'cloud_cover_high',
            'cloud_cover_1000hPa',
            'cloud_cover_975hPa',
            'cloud_cover_950hPa',
            'cloud_cover_925hPa',
            'cloud_cover_900hPa',
            'cloud_cover_850hPa',
            'cloud_cover_800hPa',
            'cloud_cover_700hPa',
            'cloud_cover_600hPa',
            'cloud_cover_500hPa',
            'cloud_cover_400hPa',
            'cloud_cover_250hPa',
            'cloud_cover_200hPa',
            'cloud_cover_150hPa',
            'cloud_cover_300hPa',
            'cloud_cover_100hPa',
            'cloud_cover_70hPa',
            'cloud_cover_50hPa',
            'cloud_cover_30hPa',
            'wind_speed_80m',
            'wind_speed_180m',
            'wind_direction_80m',
            'wind_direction_180m',
            'temperature_1000hPa',
            'temperature_975hPa',
            'temperature_950hPa',
            'temperature_925hPa',
            'temperature_900hPa',
            'temperature_850hPa',
            'temperature_800hPa',
            'temperature_700hPa',
            'temperature_600hPa',
            'temperature_500hPa',
            'temperature_400hPa',
            'windspeed_1000hPa',
            'windspeed_975hPa',
            'windspeed_950hPa',
            'windspeed_925hPa',
            'windspeed_900hPa',
            'windspeed_850hPa',
            'windspeed_800hPa',
            'windspeed_700hPa',
            'windspeed_600hPa',
            'windspeed_500hPa',
            'windspeed_400hPa',
            'winddirection_1000hPa',
            'winddirection_975hPa',
            'winddirection_950hPa',
            'winddirection_925hPa',
            'winddirection_900hPa',
            'winddirection_850hPa',
            'winddirection_800hPa',
            'winddirection_700hPa',
            'winddirection_600hPa',
            'winddirection_500hPa',
            'winddirection_400hPa',
            'cape',
            'is_day',
            'precipitation_probability'
        ].join(',');

        const fallbackRequestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${fallbackParameters}&daily=${dailyParameters}${units}${additionalParameters}`;

        try {
            const fallbackResponse = await fetch(fallbackRequestUrl);
            if (fallbackResponse.ok) {
                const weatherData = await fallbackResponse.json();

                // Add placeholder data for missing 10m wind parameters
                const timeLength = weatherData.hourly.time.length;
                weatherData.hourly.wind_speed_10m = new Array(timeLength).fill(null);
                weatherData.hourly.wind_direction_10m = new Array(timeLength).fill(null);
                weatherData.hourly.wind_gusts_10m = new Array(timeLength).fill(null);

                return { parameters: fallbackParameters, data: weatherData };
            } else {
                throw new Error(`Fallback HTTP error! Status: ${fallbackResponse.status}`);
            }
        } catch (fallbackError) {
            console.error('Both GFS API calls failed:', fallbackError);
            throw fallbackError;
        }
    }
}

async function checkAndFetchData(baseUrl, model) {
    const dailyParameters = [
        'weather_code',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum'
    ].join(',');



    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    let additionalParameters = ''; // Initialize additional parameters string


    // Check the model to determine the correct forecast_days parameter
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        const forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14); // Default 7, max 14
        additionalParameters += `&forecast_days=${forecastDays}`;
    } else if (model.toLowerCase() === 'icon') {
        const forecastDays = getCookieValueOrDefault('iconLength', 7); // Default 7, max 7
        additionalParameters += `&forecast_days=${forecastDays}`;
    }
      let shouldFetchData = true;  // Default to true to indicate new data should be fetched
    const lastApiCallKey = `lastApiCall_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    
    //#####

    const now = Date.now();
    // Cache durations based on model update frequency:
    // GFS/OpenMeteo (HRRR hybrid): updates ~hourly, cache for 60 minutes
    // ICON: runs at 00, 06, 12, 18 UTC, cache for 6 hours
    const cacheDuration = model.toLowerCase() === 'icon'
        ? 6 * 60 * 60 * 1000   // 6 hours for ICON
        : 60 * 60 * 1000;      // 60 minutes for GFS/OpenMeteo
   const lastApiCallDataStr = localStorage.getItem(lastApiCallKey);

    


    // Check if we have cached data for this model and zipcode
     if (lastApiCallDataStr) {
const lastApiCallData = JSON.parse(lastApiCallDataStr);

// Check if the cached data's timestamp is within the acceptable range
if (now - lastApiCallData.timestamp < cacheDuration) {
    // If the data is still fresh, use the cached data and avoid making a new fetch
    shouldFetchData = false;
    globalWeatherData[model] = lastApiCallData.data;
    createTable(`${model.toLowerCase()}-table`, lastApiCallData.data, model);
}
}
    // Fetch new data if necessary
    if (shouldFetchData) {

        let weatherData;

        try {
            if (model.toLowerCase() === 'gfs') {
                // GFS: fetch with parameter fallback — returns { parameters, data }
                const result = await getGFSParametersWithFallback(baseUrl, userLocation.latitude, userLocation.longitude, units, additionalParameters);
                weatherData = result.data;
            } else if (model.toLowerCase() === 'icon') {
                // ICON: fetch with parameter fallback — returns { parameters, data }
                const result = await getICONParametersWithFallback(baseUrl, userLocation.latitude, userLocation.longitude, units, additionalParameters);
                weatherData = result.data;

                // Add missing parameters that ICON doesn't support
                const timeLength = weatherData.hourly.time.length;
                if (!weatherData.hourly.boundary_layer_height) {
                    weatherData.hourly.boundary_layer_height = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.visibility) {
                    weatherData.hourly.visibility = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.lifted_index) {
                    weatherData.hourly.lifted_index = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.cape) {
                    weatherData.hourly.cape = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.precipitation_probability) {
                    weatherData.hourly.precipitation_probability = new Array(timeLength).fill(null);
                }
            } else {
                // OpenMeteo: direct fetch (no parameter fallback needed)
                commonParameters = [
                    'temperature_2m', 'temperature_80m',
                    'boundary_layer_height',
                    'weather_code', 'relative_humidity_2m',
                    'dew_point_2m',
                    'visibility','lifted_index',
                    'cloud_cover',
                    'cloud_cover_low',
                    'cloud_cover_mid',
                    'cloud_cover_high',
                    'cloud_cover_1000hPa',
                    'cloud_cover_975hPa',
                    'cloud_cover_950hPa',
                    'cloud_cover_925hPa',
                    'cloud_cover_900hPa',
                    'cloud_cover_850hPa',
                    'cloud_cover_800hPa',
                    'cloud_cover_700hPa',
                    'cloud_cover_600hPa',
                    'cloud_cover_500hPa',
                    'cloud_cover_400hPa',
                    'cloud_cover_250hPa',
                    'cloud_cover_200hPa',
                    'cloud_cover_150hPa',
                    'cloud_cover_300hPa',
                    'cloud_cover_100hPa',
                    'cloud_cover_70hPa',
                    'cloud_cover_50hPa',
                    'cloud_cover_30hPa',
                    'wind_speed_10m',
                    'wind_speed_80m',
                    'wind_speed_180m', 'wind_gusts_10m',
                    'wind_direction_10m',
                    'wind_direction_80m',
                    'wind_direction_180m',
                    'temperature_1000hPa',
                    'temperature_975hPa',
                    'temperature_950hPa',
                    'temperature_925hPa',
                    'temperature_900hPa',
                    'temperature_850hPa',
                    'temperature_800hPa',
                    'temperature_700hPa',
                    'temperature_600hPa',
                    'temperature_500hPa',
                    'temperature_400hPa',
                    'windspeed_1000hPa',
                    'windspeed_975hPa',
                    'windspeed_950hPa',
                    'windspeed_925hPa',
                    'windspeed_900hPa',
                    'windspeed_850hPa',
                    'windspeed_800hPa',
                    'windspeed_700hPa',
                    'windspeed_600hPa',
                    'windspeed_500hPa',
                    'windspeed_400hPa',
                    'winddirection_1000hPa',
                    'winddirection_975hPa',
                    'winddirection_950hPa',
                    'winddirection_925hPa',
                    'winddirection_900hPa',
                    'winddirection_850hPa',
                    'winddirection_800hPa',
                    'winddirection_700hPa',
                    'winddirection_600hPa',
                    'winddirection_500hPa',
                    'winddirection_400hPa',
                    'cape',
                    'is_day',
                    'precipitation_probability'
                ].join(',');

                const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${commonParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
                const response = await fetch(requestUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                weatherData = await response.json();
            }

            // Cache the new API data
            localStorage.setItem(lastApiCallKey, JSON.stringify({
                timestamp: now,
                data: weatherData,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                cityName: $('#cityName').text()
            }));

            // Populate the respective table with the fetched data
            createTable(`${model.toLowerCase()}-table`, weatherData, model);

            // Store the fetched data globally
            globalWeatherData[model] = weatherData;

        } catch (error) {
            console.error(`Failed to fetch data for model ${model}`, error);
            return;
        }
    }

}



function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
        const cname = `${encodeURIComponent(name)}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
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
function saveCheckboxState(checkbox) {
setCookie(checkbox.id, checkbox.checked ? 'true' : 'false', 365);
}

// Controller function to restore checkbox state
function restoreCheckboxState(checkboxId) {
        // Default values map for each checkbox
        const defaultValues = {
            capeCheckbox: false,
            precipProbCheckbox: true,
            temp2mCheckbox: true,
            cloudCoverCheckbox: true,
            precipSumCheckbox: true,
            dewpointSpreadCheckbox: false,
            relativeHumidityCheckbox: false,
            liftedIndexCheckbox: false,
            visibilityCheckbox: false
        };

        // Get the cookie value or use default if the cookie does not exist
        const cookieValue = getCookie(checkboxId);
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            // If the cookie has a value set, use it; otherwise, use the default
            checkbox.checked = cookieValue !== "" ? (cookieValue === 'true') : defaultValues[checkboxId];
        }
    }

function getCookieValueOrDefault(cookieName, defaultValue) {
    const value = getCookie(cookieName); // getCookie is supposed to fetch the cookie by its name
    if (value !== "") {
        return isNaN(value) ? value : parseInt(value, 10); // Return value as a number if it's numeric
    }
    return defaultValue;
}



window.onload = function () {
     const cityNameFromCookie = getCookie('cityName');
if (cityNameFromCookie) {
document.getElementById('cityName').textContent = cityNameFromCookie;
}
    
    // Automatically click the edit button when the page loads for the first time
    
    

    restoreCheckboxState('capeCheckbox');
    restoreCheckboxState('precipProbCheckbox');
    restoreCheckboxState('temp2mCheckbox');
    restoreCheckboxState('cloudCoverCheckbox');
    restoreCheckboxState('precipSumCheckbox');
    restoreCheckboxState('dewpointSpreadCheckbox');
    restoreCheckboxState('relativeHumidityCheckbox');
   restoreCheckboxState('liftedIndexCheckbox');
    restoreCheckboxState('visibilityCheckbox');


    
    const gfsOpenMeteoLengthValue = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    const iconLengthValue = getCookieValueOrDefault('iconLength', 7);
    const dewpointSpreadCheckbox = document.getElementById('dewpointSpreadCheckbox');
    const capeCheckbox = document.getElementById('capeCheckbox');
    const precipProbCheckbox = document.getElementById('precipProbCheckbox');
    const temp2mCheckbox = document.getElementById('temp2mCheckbox');
    const cloudCoverCheckbox = document.getElementById('cloudCoverCheckbox');
    const precipSumCheckbox = document.getElementById('precipSumCheckbox');
    const relativeHumidityCheckbox = document.getElementById('relativeHumidityCheckbox');
    const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
    const visibilityCheckbox = document.getElementById('visibilityCheckbox');
    
    const liftedIndexCookieValue = getCookie('liftedIndexCheckbox');
    
    // Load saved cookie values and set checkbox status; default to true
    document.getElementById('gfsOpenMeteoLength').addEventListener('keyup', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            document.getElementById('submitForecastLength').click();
        }
    });
    document.getElementById('iconLength').addEventListener('keyup', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            document.getElementById('submitForecastLength').click();
        }
    });
    document.getElementById('gfsOpenMeteoLength').value = gfsOpenMeteoLengthValue;
    document.getElementById('iconLength').value = iconLengthValue;
    
    
    const fogStatusCookie = getCookie('fogEnabled');
    if (fogStatusCookie !== "") {
        fogEnabled = (fogStatusCookie === 'true');
    }
    const fogButton = document.getElementById('toggleFogButton');
    if (fogButton) {
        fogButton.textContent = fogEnabled ? 'Disable Fog' : 'Fog';
    }

const editButton = document.getElementById('editButton');
if (editButton) {
editButton.click();
}
    // Retrieve the 'windShearEnabled' flag from the cookie, if it exists
    const windShearCookie = getCookie('windShearEnabled');
    if (windShearCookie) {
        // Set the global variable to the value from the cookie
        windShearEnabled = (windShearCookie === 'true');
    }

    // Update the button text based on the cookie value
    const windShearButton = document.getElementById('checkWindShearButton');
    if (windShearButton) {
        windShearButton.textContent = windShearEnabled ? 'Disable Wind Shear' : 'Enable Wind Shear';
    }
    
    // Get threshold values from cookies, if they exist
    const blueThreshold = getCookie('blueThreshold');
    const greenThreshold = getCookie('greenThreshold');
    const redThreshold = getCookie('redThreshold');
    
    
    
    // Update threshold inputs with cookie values
    if (blueThreshold) document.getElementById('blueThreshold').value = blueThreshold;
    if (greenThreshold) document.getElementById('greenThreshold').value = greenThreshold;
    if (redThreshold) document.getElementById('redThreshold').value = redThreshold;

    

    
    const savedBestWindSpeed = getCookie('bestWindSpeed');

    if (savedBestWindSpeed) {
        // If we have a saved value, use it as the best wind speed threshold
        bestWindSpeedThreshold = parseFloat(savedBestWindSpeed);
    } else {
        // If no value is saved, use default value
        bestWindSpeedThreshold = 15;
    }

    // Update the value in the input field
    document.getElementById('bestWindSpeed').value = bestWindSpeedThreshold;
    document.getElementById('toggleTemperatureButton').addEventListener('click', () => {
        toggleTemperatureTables();
    });
    const daylightHoursCookie = getCookie('daylightHoursShown');
    if (daylightHoursCookie !== "") {
        daylightHoursShown = (daylightHoursCookie === 'true');
    } else {
        // If the cookie does not exist, use your initial default value
        daylightHoursShown = true;
    }
    // Set the initial button text
    document.getElementById('toggleDaylightButton').textContent = daylightHoursShown ? 'Show All Hours' : 'Daylight Hours Only';
if (userLocation.latitude && userLocation.longitude) {
        if (hasApiBeenCalledRecently(userLocation.latitude, userLocation.longitude)) {
            // Create table without calling API
            createTableBasedOnCachedData(userLocation.latitude, userLocation.longitude);
        } else {
            // Fetch new data and create table
            refreshWeatherDataAndTables(userLocation.latitude, userLocation.longitude);
        }
    }

    
};

let allTableIds = [];


async function DisplayAllTables() {
    

    daylightHoursShown = false;
        
       
disableButtonsExcept(['DisplayAllTables']);
$('#location-input').hide();


const displayAllTablesButton = document.getElementById('DisplayAllTables');

if (displayAllTablesButton.textContent === "Back") {
location.reload();
} else {
clickCollapseButton();
// Show loading indicator using SweetAlert2
Swal.fire({
title: 'Loading...',
text: 'Please wait while we prepare the tables.',
allowOutsideClick: false,
showConfirmButton: false,
customClass: {
container: 'full-screen-modal'
},
willOpen: () => {
Swal.showLoading(); // Show loading animation
}
});

const tablesToClear = ['gfs-table', 'icon-table'];

// Clear out the tables
tablesToClear.forEach(tableId => {
    const tableElement = document.getElementById(tableId);
    if (tableElement) {
        tableElement.innerHTML = ''; // Clear table content
    }
});

if (isUpdatingTables) {
    Swal.close(); // Dismiss the SweetAlert2 modal if updating is in progress
    return;
}
isUpdatingTables = true;

try {
    const savedLocations = getSavedLocations();
    const baseUrl = 'https://api.open-meteo.com/v1/gfs';

    await Promise.all(savedLocations.map(async (location, index) => {
        const tableId = `table${index + 1}-table`;
        allTableIds.push(tableId); // Keep track of the table IDs

        let tableElement = document.getElementById(tableId);
        if (!tableElement) {
            tableElement = document.createElement('table');
            tableElement.id = tableId;
            document.body.appendChild(tableElement);
        }
        tableElement.innerHTML = ''; // Clear previous table content
        const { lat, lon } = location.coords;

        return checkAndFetchAllDataTables(baseUrl, 'gfs', lat, lon, location.name, tableElement, tableId);
    }));

    initialAllTableSetup(allTableIds); // Call initial setup after all locations have been processed
} catch (error) {
    // Handle any errors from the data fetch
    console.error('Error fetching data for all models:', error);
} finally {
    isUpdatingTables = false;
    enableAllButtons(); // Re-enable all buttons after the fetch
    Swal.close(); // Dismiss the loading animation
}

// After displaying all tables, change the button text to "Back"
displayAllTablesButton.textContent = "Back";
}


disableButtonsExcept(['DisplayAllTables']);
document.getElementById('cityNameContainer').style.display = 'none';
}

// Function to copy tables for all saved locations
    // Event listener for the Forecast Length button
    document.getElementById('forecastLengthButton').addEventListener('click', function () {
        document.getElementById('forecastLengthPopup').style.display = 'flex'; // Show the popup
        toggleButtonsDisabledState(true, ['submitForecastLength', 'editButton']);
    });

    document.addEventListener('DOMContentLoaded', function () {
            // Add event listeners for slider changes to update the displayed value
            document.getElementById('gfsOpenMeteoLength').addEventListener('input', function () {
                document.getElementById('gfsOpenMeteoLengthValue').textContent = this.value;
            });
            document.getElementById('iconLength').addEventListener('input', function () {
                document.getElementById('iconLengthValue').textContent = this.value;
            });})
            const saveAndFetchButton = document.getElementById('saveAndFetchButton');

            // Register the click event listener for the submit button
            saveAndFetchButton.addEventListener('click', saveSettingsAndFetchData);
            

            
            
    // Event listener for the Submit button in the forecast length popup
    document.getElementById('submitForecastLength').addEventListener('click', function () {
            // Retrieve the forecast lengths from the input fields.
            clickCollapseButton();
            const gfsOpenMeteoLength = parseInt(document.getElementById('gfsOpenMeteoLength').value, 10);
            const iconLength = parseInt(document.getElementById('iconLength').value, 10);

            // Save the new lengths to cookies.
            setCookie('gfsOpenMeteoLength', gfsOpenMeteoLength, 365);
            setCookie('iconLength', iconLength, 365);

            // Invalidate the cache by updating the timestamp for both models.
            ['gfs', 'icon'].forEach(model => {
                const lastApiCallKey = `lastApiCall_${model}_${userLocation.latitude}_${userLocation.longitude}`;
                // Manually adjust the timestamp to be older than the longest cache duration (ICON = 6hrs).
                localStorage.setItem(lastApiCallKey, JSON.stringify({
                    timestamp: Date.now() - 7 * 60 * 60 * 1000, // 7 hours ago — exceeds all cache durations
                    data: {}
                }));
            });
            document.getElementById('forecastLengthPopup').style.display = 'none';
        
            // Fetch new data for both models now that the cache is invalidated.
            fetchAllModelsData();

        
        });


function createTableBasedOnCachedData(latitude, longitude) {
const lastApiCallKey = `lastApiCall_${latitude}_${longitude}`;
const cachedDataStr = localStorage.getItem(lastApiCallKey);
if (cachedDataStr) {
const cachedData = JSON.parse(cachedDataStr);
// Set the city name from cached data
if (cachedData.cityName) {
    $('#cityName').text(cachedData.cityName);
    $('#cityName').show(); // Make sure the city name is visible
}
Object.keys(cachedData.data).forEach(model => {
    const tableId = `${model.toLowerCase()}-table`;
    createTable(tableId, cachedData.data[model], model);
});
initialTableSetup();
}
}

    function handleFogButtonClick() {
        fogEnabled = !fogEnabled;
        setCookie('fogEnabled', fogEnabled, 365);
        const fogButton = document.getElementById('toggleFogButton');
        fogButton.textContent = fogEnabled ? 'Disable Fog' : 'Fog';

        // Check the relevant checkboxes
        document.getElementById('relativeHumidityCheckbox').checked = fogEnabled;
        document.getElementById('visibilityCheckbox').checked = fogEnabled;
        document.getElementById('dewpointSpreadCheckbox').checked = fogEnabled;

        // Click collapse button if needed
        clickCollapseButton();

        // Fetch all models data
        fetchAllModelsData();
    }
    document.getElementById('toggleFogButton').addEventListener('click', handleFogButtonClick);
function toggleTemperatureTables() {
Object.keys(globalWeatherData).forEach(model => {
const tableId = `${model.toLowerCase()}-table`;
const dataTable = document.getElementById(tableId);

if (dataTable.dataset.showing !== 'temperature') {
    // Currently showing something other than temperature, switch to temperature
    fillTableWithTemperature(dataTable, globalWeatherData[model]);
    dataTable.dataset.showing = 'temperature';
} else {
    // Currently showing temperature, switch to wind speed
    fillTableWithWindSpeed(dataTable, globalWeatherData[model]);
    dataTable.dataset.showing = 'winds';
}
});

manageViewButtons(); // Update button display
}
    

        


function addVerticalBordersBetweenDays() {
// Select all tables that you want to apply the border to
const tables = document.querySelectorAll('table');

// Iterate over each table
tables.forEach(table => {
// Get all header cells in the first row that have 'data-day' attribute, excluding the very first cell
const dayHeaders = table.querySelectorAll('tr:first-child th:not(:first-child)');

// Initialize variable to store the previous day
let previousDay = null;

// Iterate through headers to find day transitions
dayHeaders.forEach((headerCell, index) => {
    // Check if the cell is visible (not hidden due to daylight or altitudes toggle)
    if (headerCell.style.display !== 'none') {
        const currentDay = headerCell.getAttribute('data-day');

        // Add border if the current day is different from the previous day and not the first cell
        if (previousDay && currentDay !== previousDay) {
            // Add a vertical border to the left side of the current header cell
            headerCell.style.borderLeft = '3px solid black';
            // Also apply the border to all cells in the same column below the header
            table.querySelectorAll(`tr:not(:first-child) td:nth-child(${index + 2}):not([style*="display: none"])`).forEach(cell => {
                // Check if the cell is visible (not hidden due to daylight or altitudes toggle)
                if (cell.style.display !== 'none') {
                    cell.style.borderLeft = '3px solid black';
                }
            });
        }

        // Update previousDay to the current day for the next iteration
        previousDay = currentDay;
    }
});
});
};


function createTable(tableId, weatherData, model) {
    const altitudeLabels = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100].reverse();
    const timestamps = weatherData.hourly.time;
    const dataTable = document.getElementById(tableId);

    let tableHtml = `<tr><th>${model.replace('Meteo', '<br>Meteo')}</th>`;
    let currentDay = null; // Variable to store the current day as you loop through the timestamps
    // Assuming that weatherData.hourly.is_day is an array with the same length as timestamps
    let isDayArray = weatherData.hourly.is_day;
    isDayArray = extendDaylightHours(isDayArray);
    
    timestamps.forEach((timestamp, index) => {
        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2); // Use first two letters
        const hour = date.getHours();
        const hour12 = hour % 12 || 12; // Convert to 12-hour format
        const ampm = hour >= 12 ? 'PM' : 'AM';
        // Determine if the timestamp corresponds to daylight using is_day array
        const isDaylight = isDayArray[index] === 1;
        const daylightClass = isDaylight ? 'daylight' : '';
        

        

        headerClass = '';
            tableHtml += `<th class="column-header2 ${daylightClass}" data-day="${day}">
            <span class="smalldate">${month}/${day}</span><br>
            <span class="small-font">${dayOfWeek}</span><br>
            <span class="small-font">${hour12}</span><br><span class="small-font">${ampm}</span>
         </th>`;
        enableBestDaysButton();
    });


    

    // Add rows for each altitude
    

    dataTable.innerHTML = tableHtml;




    dataTable.dataset.model = model;
}

function createAllTables(tableId, weatherData, locationName, tableElement) {
    const altitudeLabels = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100].reverse();
    const timestamps = weatherData.hourly.time;
    const dataTable = tableElement;
    let table = document.getElementById(tableId);
if (!table) {
table = document.createElement('table');
table.id = tableId;
// append it to a suitable container
}

    model='gfs';
    
    let tableHtml = `<tr><th style="min-width: 125px;">${locationName}</th>`;
    let currentDay = null; // Variable to store the current day as you loop through the timestamps    // Assuming that weatherData.hourly.is_day is an array with the same length as timestamps
    let isDayArray = weatherData.hourly.is_day;
    isDayArray = extendDaylightHours(isDayArray);
    
    timestamps.forEach((timestamp, index) => {
        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2); // Use first two letters
        const hour = date.getHours();
        const hour12 = hour % 12 || 12; // Convert to 12-hour format
        const ampm = hour >= 12 ? 'PM' : 'AM';
        // Determine if the timestamp corresponds to daylight using is_day array
        const isDaylight = isDayArray[index] === 1;
        const daylightClass = isDaylight ? 'daylight' : '';
        

        

        headerClass = '';
            tableHtml += `<th class="column-header2 ${daylightClass}" data-day="${day}">
            <span class="smalldate">${month}/${day}</span><br>
            <span class="small-font">${dayOfWeek}</span><br>
            <span class="small-font">${hour12}</span><br><span class="small-font">${ampm}</span>
         </th>`;
        enableBestDaysButton();
    });


    

    // Add rows for each altitude
    
if (!dataTable) {
console.error(`Table element not found for ID: ${tableId}`);
return;
}
    dataTable.innerHTML = tableHtml;




    dataTable.dataset.model = model;
if (tableElement) {
// Create a header for the table to display the location name
const locationHeader = document.createElement('h3');


// Fill the table with the generated HTML

tableElement.innerHTML = tableHtml;

// Get a reference to the container where the tables should be appended
const tablesContainer = document.getElementById('tables-container');
globalWeatherData[tableId] = weatherData;

// Append the location name and the table to the container
tablesContainer.appendChild(locationHeader); // Adds the location name as a header
tablesContainer.appendChild(tableElement);   // Appends the table after the header
} else {
console.error(`Table element not found for ID: ${tableId}`);
}
};
document.getElementById('cloudsButton').addEventListener('click', function() {
toggleWindClouds();
});

// Add this variable at the top of the file with other global variables
let previousHighAltitudeState = false;

function toggleWindClouds() {
    // Store the current state before potentially changing it
    previousHighAltitudeState = highAltitudeVisible;
    
    // If we're switching to clouds and high altitudes are hidden, show them first
    if (!highAltitudeVisible && document.querySelector('table[id$="-table"]').dataset.showing === 'winds') {
        highAltitudeVisible = true;
        const highAltitudeButton = document.getElementById('toggleHighAltitudeButton');
        if (highAltitudeButton) {
            highAltitudeButton.textContent = 'Hide High Altitudes';
        }
        // Fetch new data with high altitudes visible
        fetchAllModelsData().then(() => {
            // After data is fetched, proceed with cloud display
            Object.keys(globalWeatherData).forEach(model => {
                const tableId = `${model.toLowerCase()}-table`;
                const dataTable = document.getElementById(tableId);
                if (globalWeatherData[model]) {
                    fillTableWithCloudCover(dataTable, globalWeatherData[model]);
                    dataTable.dataset.showing = 'clouds';
                }
            });
            manageViewButtons();
        });
        return;
    }

    // Normal toggle behavior
    Object.keys(globalWeatherData).forEach(model => {
        const tableId = `${model.toLowerCase()}-table`;
        const dataTable = document.getElementById(tableId);
        const currentDisplay = dataTable.dataset.showing;

        if (currentDisplay === 'clouds') {
            // Currently showing clouds, switch to wind data
            if (globalWeatherData[model]) {
                fillTableWithWindSpeed(dataTable, globalWeatherData[model]);
                dataTable.dataset.showing = 'winds';
            }
        } else {
            // Currently showing wind, switch to cloud cover data
            if (globalWeatherData[model]) {
                fillTableWithCloudCover(dataTable, globalWeatherData[model]);
                dataTable.dataset.showing = 'clouds';
            }
        }
    });

    manageViewButtons(); // Update button display
}



function extendDaylightHours(isDayArray) {
        const transitions = [];

        // Step 1: Identify all transition indices
        for (let i = 1; i < isDayArray.length; i++) {
            if (isDayArray[i] !== isDayArray[i - 1]) {
                transitions.push(i);
            }
        }

        // Step 2: Extend daylight by modifying the array at the transition points
        transitions.forEach(index => {
            if (isDayArray[index] === 1) {
                // Extend the daylight by setting the previous hour to 1 (morning transition)
                isDayArray[index - 1] = 1;
            } else {
                // Extend the daylight by setting the next hour to 1 (evening transition)
                // Check if the index is not the last element of the array
                if (index < isDayArray.length) {
                    isDayArray[index] = 1;
                }
            }
        });

        return isDayArray;
    }
function fillAllTablesWithWindSpeed(table, weatherData) {

// Safety check: ensure table has at least one row
const existingRows = table.getElementsByTagName('tr');
if (existingRows.length === 0) {
    console.error(`Table ${table.id} has no rows, cannot fill with wind speed data`);
    return;
}

let tableHtml = '<tr>' + existingRows[0].innerHTML + '</tr>';
    const altitudeLevels = [10, 1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30].reverse(); // Order hPa values and feet values in descending order
    let gustRowAdded = false; // Flag to control the addition of the gust row
    altitudeLevels.forEach(alt => {
        let windSpeedKey, windDirectionKey;
        let displayAltitude; // Define a variable to hold our display altitude

        if (alt === 2 || alt === 10 || alt === 80 || alt === 180) {
            // Handle the specific feet values (10m, 80m, 180m are in meters, need conversion to feet)
            const altInFeet = Math.round(alt * 3.28084); // Convert meters to feet, rounding to the nearest whole number
            windSpeedKey = `wind_speed_${alt}m`;
            windDirectionKey = `wind_direction_${alt}m`;
            displayAltitude = `${altInFeet} ft`; // Display in feet
        } else {
            // Handle hPa values and convert to feet for display
            windSpeedKey = `windspeed_${alt}hPa`;
            windDirectionKey = `winddirection_${alt}hPa`;
            displayAltitude = `${hPaToFeet(alt)} ft`; // Covert hPa to feet and display in feet
        }

        // Check if wind data exists for this particular elevation
        if (weatherData.hourly.hasOwnProperty(windSpeedKey) && weatherData.hourly.hasOwnProperty(windDirectionKey)) {
            tableHtml += `<tr><th class="sticky-header">${displayAltitude}</th>`;

            // Iterate over wind speeds and directions together
            weatherData.hourly[windSpeedKey].forEach((windSpeed, idx) => {
                const windDirection = weatherData.hourly[windDirectionKey][idx];
                const rotation = getWindArrowRotation(windDirection);
                const roundedWindSpeed = windSpeed !== null ? Math.round(windSpeed) : '?';
                const { backgroundColor, textColor } = getWindSpeedColor(roundedWindSpeed);

                tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};"
data-wind-speed="${roundedWindSpeed}" data-wind-direction="${windDirection}">
<div>${roundedWindSpeed}</div>
<div class="wind-arrow" style="transform: rotate(${rotation}deg)">&#x2191;&#xFE0E;</div>
</td>`;
            });

            tableHtml += '</tr>';
        }
    });

    tableHtml += buildExtraRows(table, weatherData);

    table.innerHTML = tableHtml;
    applyTablePostProcessing(table);
    }

// Shared function to build extra rows (gusts, CAPE, precip, temp, humidity, etc.)
function buildExtraRows(table, weatherData) {
    let html = '';
    const capeCheckbox = document.getElementById('capeCheckbox');
    const precipProbCheckbox = document.getElementById('precipProbCheckbox');
    const temp2mCheckbox = document.getElementById('temp2mCheckbox');
    const cloudCoverCheckbox = document.getElementById('cloudCoverCheckbox');
    const precipSumCheckbox = document.getElementById('precipSumCheckbox');

    // Wind gusts
    if (weatherData.hourly.hasOwnProperty('wind_gusts_10m')) {
        html += `<tr><th class="sticky-header small-text-cell">Gusts</th>`;
        weatherData.hourly.wind_gusts_10m.forEach(windGust => {
            const rounded = windGust !== null ? Math.round(windGust) : '?';
            const { backgroundColor, textColor } = getWindSpeedColor(rounded);
            html += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};"><div>${rounded}</div></td>`;
        });
        html += '</tr>';
    }

    // CAPE
    if (weatherData.hourly.hasOwnProperty('cape') && capeCheckbox && capeCheckbox.checked) {
        html += `<tr><th class="sticky-header small-text-cell">CAPE</th>`;
        weatherData.hourly.cape.forEach(capeValue => {
            const { backgroundColor, textColor } = getCAPEColor(capeValue);
            html += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${formatCapeValue(capeValue)}</td>`;
        });
        html += '</tr>';
    }

    // Lifted Index (GFS only)
    const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
    if (liftedIndexCheckbox && liftedIndexCheckbox.checked && weatherData.hourly.hasOwnProperty('lifted_index')) {
        html += '<tr><th class="sticky-header small-text-cell">Lifted Index</th>';
        weatherData.hourly.lifted_index.forEach(li => {
            const { backgroundColor, textColor } = getLiftedIndexColor(li);
            html += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${li.toFixed(1)}</td>`;
        });
        html += '</tr>';
    }

    // Precipitation probability
    if (weatherData.hourly.hasOwnProperty('precipitation_probability') && precipProbCheckbox && precipProbCheckbox.checked) {
        html += '<tr><th class="sticky-header small-text-cell">Precip %</th>';
        weatherData.hourly.precipitation_probability.forEach(pp => {
            pp = pp !== null ? pp : '?';
            const { backgroundColor, textColor } = getPrecipitationProbabilityColor(pp);
            html += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${pp}</td>`;
        });
        html += '</tr>';
    }

    // Precipitation sum (ICON)
    if (table.id === 'icon-table' && precipSumCheckbox && precipSumCheckbox.checked && weatherData.hourly.hasOwnProperty('precipitation')) {
        html += '<tr><th class="sticky-header small-text-cell">Precip (in)</th>';
        weatherData.hourly.precipitation.forEach(pv => {
            if (pv !== null) {
                const bg = getPrecipitationColor(pv);
                const tc = getTextColorForBackground(bg);
                html += `<td class="data-cell small-text-cell" style="background-color: ${bg}; color: ${tc};">${pv.toFixed(2)}</td>`;
            }
        });
        html += '</tr>';
    }

    // Temperature 2m
    if (weatherData.hourly.hasOwnProperty('temperature_2m') && temp2mCheckbox && temp2mCheckbox.checked) {
        html += '<tr><th class="sticky-header small-text-cell">Temp (\u00B0F)</th>';
        weatherData.hourly.temperature_2m.forEach(temp => {
            const { backgroundColor, textColor } = getTemperatureColor(temp);
            html += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${temp !== null ? Math.round(temp) : '?'}</td>`;
        });
        html += '</tr>';
    }

    // Relative humidity
    const relHumCheckbox = document.getElementById('relativeHumidityCheckbox');
    if (weatherData.hourly.hasOwnProperty('relative_humidity_2m') && relHumCheckbox && relHumCheckbox.checked) {
        html += '<tr><th class="sticky-header small-text-cell">Rel. Humidity</th>';
        weatherData.hourly.relative_humidity_2m.forEach(humidity => {
            let cellStyle = 'background-color: white;';
            if (fogEnabled && humidity > 90) cellStyle = 'border: 2px solid red;';
            html += `<td class="data-cell small-text-cell" style="${cellStyle}">${Math.round(humidity)}%</td>`;
        });
        html += '</tr>';
    }

    // Dewpoint spread
    const dpCheckbox = document.getElementById('dewpointSpreadCheckbox');
    if (dpCheckbox && dpCheckbox.checked && weatherData.hourly.hasOwnProperty('dew_point_2m') && weatherData.hourly.hasOwnProperty('temperature_2m')) {
        html += `<tr><th class="sticky-header small-text-cell">Dp Spread</th>`;
        const temp2m = weatherData.hourly.temperature_2m;
        const dp2m = weatherData.hourly.dew_point_2m;
        for (let i = 0; i < temp2m.length; i++) {
            const spread = temp2m[i] - dp2m[i];
            let cellStyle = 'background-color: white;';
            if (fogEnabled && spread < 3) cellStyle = 'border: 2px solid red;';
            html += `<td class="data-cell small-text-cell" style="${cellStyle}">${spread.toFixed(1)}</td>`;
        }
        html += '</tr>';
    }

    // Visibility (GFS only)
    if ((table.id === 'gfs-table' || table.id === 'openmeteo-table') && weatherData.hourly.hasOwnProperty('visibility') && document.getElementById('visibilityCheckbox').checked) {
        html += `<tr><th class="sticky-header small-text-cell">Visibility (mi)</th>`;
        weatherData.hourly.visibility.forEach(vis => {
            const miles = (vis * 0.000621371).toFixed(1);
            let cellStyle = 'background-color: white;';
            if (fogEnabled && miles < 20) cellStyle = 'border: 2px solid red;';
            html += `<td class="data-cell smallest-text-cell" style="${cellStyle}">${miles}</td>`;
        });
        html += '</tr>';
    }

    // Cloud cover
    if (weatherData.hourly.hasOwnProperty('cloud_cover') && cloudCoverCheckbox && cloudCoverCheckbox.checked) {
        html += `<tr><th class="sticky-header small-text-cell">Clouds %</th>`;
        weatherData.hourly.cloud_cover.forEach(cc => {
            const opacity = cc * 0.70 / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`;
            const tc = opacity > 0.5 ? 'white' : 'black';
            html += `<td class="data-cell small-text-cell grey-bg" style="background-color: ${bgColor}; color: ${tc};">${cc}</td>`;
        });
        html += '</tr>';
    }

    return html;
}

// Shared post-processing for tables (borders, toggles, wind shear)
function applyTablePostProcessing(table) {
    const allRows = table.getElementsByTagName('tr');
    for (let i = 0; i < allRows.length; i++) {
        if (allRows[i].cells[0].innerText === '33 ft') {
            if (i > 0) allRows[i - 1].style.borderBottom = '3px solid black';
            break;
        }
    }
    toggleHighAltitude();
    toggleDaylightHours();
    if (windShearEnabled) displaywindshear();
    addVerticalBordersBetweenDays();
    cityName.style.display = 'block';
}

function fillTableWithWindSpeed(table, weatherData) {
    const existingRows = table.getElementsByTagName('tr');
    if (existingRows.length === 0) {
        console.error(`Table ${table.id} has no rows, cannot fill with wind speed data`);
        return;
    }

    let tableHtml = '<tr>' + existingRows[0].innerHTML + '</tr>';
    const altitudeLevels = [10, 1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30].reverse();

    altitudeLevels.forEach(alt => {
        let windSpeedKey, windDirectionKey, displayAltitude;

        if (alt === 2 || alt === 10 || alt === 80 || alt === 180) {
            const altInFeet = Math.round(alt * 3.28084);
            windSpeedKey = `wind_speed_${alt}m`;
            windDirectionKey = `wind_direction_${alt}m`;
            displayAltitude = `${altInFeet} ft`;
        } else {
            windSpeedKey = `windspeed_${alt}hPa`;
            windDirectionKey = `winddirection_${alt}hPa`;
            displayAltitude = `${hPaToFeet(alt)} ft`;
        }

        if (weatherData.hourly.hasOwnProperty(windSpeedKey) && weatherData.hourly.hasOwnProperty(windDirectionKey)) {
            tableHtml += `<tr><th class="sticky-header">${displayAltitude}</th>`;
            weatherData.hourly[windSpeedKey].forEach((windSpeed, idx) => {
                const windDirection = weatherData.hourly[windDirectionKey][idx];
                const rotation = getWindArrowRotation(windDirection);
                const roundedWindSpeed = windSpeed !== null ? Math.round(windSpeed) : '?';
                const { backgroundColor, textColor } = getWindSpeedColor(roundedWindSpeed);

                tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};"
data-wind-speed="${roundedWindSpeed}" data-wind-direction="${windDirection}">
<div>${roundedWindSpeed}</div>
<div class="wind-arrow" style="transform: rotate(${rotation}deg)">&#x2191;&#xFE0E;</div>
</td>`;
            });
            tableHtml += '</tr>';
        }
    });

    tableHtml += buildExtraRows(table, weatherData);

    table.innerHTML = tableHtml;
    applyTablePostProcessing(table);
    enableAllButtons();
    }

function getPrecipitationColor(precipValue) {
const startColor = { r: 255, g: 255, b: 255 }; // White color for 0 inches
const endColor = { r: 0, g: 0, b: 139 }; // Blue color for 0.5 inches or more
const percent = Math.min(precipValue / 0.1, 1); // Ensuring percentage is between 0 and 1
const interpolate = (value1, value2) => value1 + (value2 - value1) * percent; // Linear interpolation
const interpolatedColor = {
    r: interpolate(startColor.r, endColor.r),
    g: interpolate(startColor.g, endColor.g),
    b: interpolate(startColor.b, endColor.b),
};
return `rgb(${Math.round(interpolatedColor.r)}, ${Math.round(interpolatedColor.g)}, ${Math.round(interpolatedColor.b)})`;
}

function getTextColorForBackground(backgroundColor) {
const rgbValues = backgroundColor.substring(4, backgroundColor.length - 1).replace(/ /g, '').split(',');
return isColorDark(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2])) ? 'white' : 'black';
}


function getLiftedIndexColor(liftedIndex) {
        let backgroundColorRGB;
        let textColor = 'white'; // Default text color (for contrast against darker backgrounds)

        if (liftedIndex >= 6) {
            backgroundColorRGB = colors.blue; // Blue for very stable conditions
        } else if (liftedIndex >= 0) {
            // Directly interpolate the color from blue to red
            backgroundColorRGB = interpolateColorRGB('blue', 'red', (6 - liftedIndex) / 6);
        } else {
            backgroundColorRGB = colors.red; // Red for very unstable (severe thunderstorms likely)
        }

        // Return the background color in CSS rgb() format and the text color
        const backgroundColor = `rgb(${backgroundColorRGB.r}, ${backgroundColorRGB.g}, ${backgroundColorRGB.b})`;
        return { backgroundColor, textColor };
    }

function enableAllButtons() {
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
            button.disabled = false; // Enable the button
            button.style.opacity = 1; // Ensure full opacity for enabled buttons
        });
    }
function formatCapeValue(value) {
        const stringValue = value.toString(); // Convert number to string for easy length check
        if (stringValue.length > 3) {
            const shortenedValue = (value / 1000).toFixed(1); // Reduce to kilo (k) and round to 1 decimal place
            return `${shortenedValue}k`; // Add the 'k' character to denote 'kilo'
        }
        return stringValue; // Return the original string if it's not too long
    }
function getCAPEColor(capeValue) {
    let percentage;
    let backgroundColorRGB;
    let textColor = 'black'; // Default text color

    if (capeValue >= 2000) {
        backgroundColorRGB = { r: 255, g: 0, b: 0 }; // Red
    } else if (capeValue >= 1200) {
        percentage = (capeValue - 1200) / (2000 - 1200);
        backgroundColorRGB = interpolateColorRGB('yellow', 'red', percentage);
    } else if (capeValue >= 800) {
        percentage = (capeValue - 800) / (1200 - 800);
        backgroundColorRGB = interpolateColorRGB('green', 'yellow', percentage);
    } else if (capeValue >= 400) {
        percentage = (capeValue - 400) / (800 - 400);
        backgroundColorRGB = interpolateColorRGB('lightblue', 'green', percentage);
    } else {
        percentage = capeValue / 400;
        backgroundColorRGB = interpolateColorRGB('white', 'lightblue', percentage);
    }

    // Set text color to white if background is dark
    if (isColorDark(backgroundColorRGB.r, backgroundColorRGB.g, backgroundColorRGB.b)) {
        textColor = 'white';
    }

    // Return the color in CSS rgb() format
    const backgroundColor = `rgb(${backgroundColorRGB.r}, ${backgroundColorRGB.g}, ${backgroundColorRGB.b})`;
    return { backgroundColor, textColor };
}
const colors = {
    darkred: { r: 139, g: 0, b: 0 },    // A dark red color
     maroon: { r: 128, g: 0, b: 0 }, // Maroon color
    blue: { r: 0, g: 0, b: 255 },
    green: { r: 0, g: 255, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    yellow: { r: 255, g: 255, b: 0 },
    white: { r: 255, g: 255, b: 255 }, // Adding white
    lightblue: { r: 173, g: 216, b: 230 }, // Light blue color
    darkblue: { r: 0, g: 0, b: 139 } // Dark blue color
};

async function refreshWeatherDataAndTables(zipcode) {
    // Fetch coordinates from zipcode
   

    // Fetch weather data
    await fetchAllModelsData();

    // Update tables (if necessary)
    //resetTables();


}

function isColorDark(r, g, b) {
    // Calculate the luminance of the color using the approximate formula:
    // luminance = 0.299*R + 0.587*G + 0.114*B
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    // If luminance is less than 128, we will consider the color to be "dark"
    return luminance < 128;
}
// Helper function to get the background color based on the wind speed
function getWindSpeedColor(windSpeed) {
    let backgroundColorRGB;
    let textColor = 'black'; // Default text color

    if (windSpeed === '?') {
        backgroundColorRGB = { r: 255, g: 255, b: 255 }; // White background
        textColor = 'black';
    } else if (windSpeed <= lowWindThreshold) {
        backgroundColorRGB = { r: 0, g: 0, b: 255 }; // Blue background
    } else if (windSpeed >= highWindThreshold) {
        backgroundColorRGB = { r: 255, g: 0, b: 0 }; // Red background
    } else if (windSpeed <= medWindThreshold) {
        // Interpolating blue to green
        backgroundColorRGB = interpolateColorRGB('blue', 'green', (windSpeed - lowWindThreshold) / (medWindThreshold - lowWindThreshold));
    } else {
        // Interpolating green to red
        backgroundColorRGB = interpolateColorRGB('green', 'red', (windSpeed - medWindThreshold) / (highWindThreshold - medWindThreshold));
    }
    if (isColorDark(backgroundColorRGB.r, backgroundColorRGB.g, backgroundColorRGB.b)) {
        textColor = 'white';
    }

    // Return the color in CSS rgb() format
    const backgroundColor = `rgb(${backgroundColorRGB.r}, ${backgroundColorRGB.g}, ${backgroundColorRGB.b})`;
    return { backgroundColor, textColor };
}
function getPrecipitationProbabilityColor(value) {
    if (value === '?') {
        return {
            backgroundColor: 'rgb(255, 255, 255)', // White color for N/A values
            textColor: 'rgb(0, 0, 0)' // Black text color for better readability
        };
    }
    const backgroundColor = interpolateColorRGB('white', 'darkblue', value / 100);
    const textColor = isColorDark(backgroundColor.r, backgroundColor.g, backgroundColor.b) ? 'white' : 'black';
    return { backgroundColor: `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`, textColor };
    
}
// Modify interpolate to return an object
function interpolateColorRGB(color1, color2, percentage) {

    // Start and end colors as rgb objects
    const startColor = colors[color1];
    const endColor = colors[color2];

    // Make sure the color names are valid
    if (!startColor || !endColor) {
        throw new Error(`Invalid color names: "${color1}" or "${color2}"`);
    }

    // Interpolate each color channel
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * percentage);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * percentage);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * percentage);

    // Return the interpolated color as an object
    return { r, g, b };
}




 function fillTableWithCloudCover(table, weatherData) {
    // Safety check for weatherData
    if (!weatherData || !weatherData.hourly) {
        console.error("Invalid weatherData passed to fillTableWithCloudCover");
        return;
    }

    
    const model = table.dataset.model;
    table.dataset.showing = 'clouds';
    
    // Log the structure of weatherData.hourly
    
    // Get boundary layer height data only if it exists and only for GFS model
    const boundaryLayerHeight = model.toLowerCase() === 'gfs' ? weatherData.hourly?.boundary_layer_height : null;
    if (boundaryLayerHeight && Array.isArray(boundaryLayerHeight)) {
    }
    
    // Safety check: ensure table has at least one row
    const existingRows = table.getElementsByTagName('tr');
    if (existingRows.length === 0) {
        console.error(`Table ${table.id} has no rows, cannot fill with cloud cover data`);
        return;
    }

    let tableHtml = '<tr>' + existingRows[0].innerHTML + '</tr>';
    
    // Define all possible altitudes in feet in descending order to match table rows
    const allAltitudes = [53150, 44948, 38714, 34121, 30184, 23622, 18373, 13780, 9843, 6234, 4921, 3281, 2625, 1640, 1050, 361];
    
    // Add cloud cover rows for each pressure level
    const pressureLevels = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100].reverse();
    
    // Track which columns need vertical borders
    const columnsWithBorders = new Set();
    
    pressureLevels.forEach(pressure => {
        const cloudCoverKey = `cloud_cover_${pressure}hPa`;
        if (weatherData.hourly.hasOwnProperty(cloudCoverKey)) {
            const altitude = hPaToFeet(pressure);
            tableHtml += `<tr><th class="sticky-header">${altitude} ft</th>`;
            
            weatherData.hourly[cloudCoverKey].forEach((cover, index) => {
                if (cover === null || cover === undefined) {
                    cover = 0;
                }
                const maxDarkness = 0.75;
                const opacity = cover * maxDarkness / 100;
                const bgColor = `rgba(0, 0, 0, ${opacity})`;
                const textColor = opacity > 0.5 ? 'white' : 'black';
                
                // Check if this cell should be highlighted based on boundary layer height
                let cellStyle = `color: ${textColor};`;
                if (boundaryLayerHeight && Array.isArray(boundaryLayerHeight) && boundaryLayerHeight[index] !== null) {
                    const boundaryHeight = boundaryLayerHeight[index];
                    // Find the closest altitude below the boundary layer height
                    const closestAltitudeBelow = allAltitudes.find(alt => alt <= boundaryHeight) || allAltitudes[allAltitudes.length - 1];
                    
                    // Only highlight if this row's altitude matches the closest altitude below
                    if (altitude === closestAltitudeBelow) {
                        columnsWithBorders.add(index);
                        // Check if current hour is between 10am and 5pm
                        const currentHour = new Date(weatherData.hourly.time[index]).getHours();
                        if (currentHour >= 10 && currentHour < 17) {
                            cellStyle = 'border-left: 2px solid red; border-right: 2px solid red;';
                        }
                    } else if (columnsWithBorders.has(index)) {
                        // Add vertical borders for cells below the boundary layer cell
                        // Check if current hour is between 10am and 5pm
                        const currentHour = new Date(weatherData.hourly.time[index]).getHours();
                        if (currentHour >= 10 && currentHour < 17) {
                            cellStyle = 'border-left: 2px solid red; border-right: 2px solid red;';
                        }
                    }
                }
                
                tableHtml += `<td class="data-cell grey-bg" style="background-color: ${bgColor}; ${cellStyle}">${cover}</td>`;
            });
            
            tableHtml += '</tr>';
        }
    });
    
    // Add boundary layer height row only for GFS model
    if (model.toLowerCase() === 'gfs' && weatherData.hourly.hasOwnProperty('boundary_layer_height')) {
        
        tableHtml += '<tr><th class="sticky-header small-text-cell" style="min-width: 15px;">Thermals (ft)</th>';
        weatherData.hourly.boundary_layer_height.forEach((height, index) => {
            if (height === null || height === undefined) {
                height = 0;
            }
            // Round to nearest integer since it's already in feet
            const heightInFeet = Math.round(height);
            
            // Check if current hour is between 10am and 5pm
            const currentHour = new Date(weatherData.hourly.time[index]).getHours();
            if (currentHour >= 10 && currentHour < 17) {
                tableHtml += `<td class="data-cell boundary-data-cell" style="background-color: #f0f0f0; color: black;">${heightInFeet}</td>`;
            } else {
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: #f0f0f0; color: black;"></td>`;
            }
        });
        tableHtml += '</tr>';
    }
    
    // Add summary rows for high, mid, and low cloud cover
    if (weatherData.hourly.hasOwnProperty('cloud_cover_high')) {
        tableHtml += '<tr><th class="sticky-header small-text-cell">High Clouds</th>';
        weatherData.hourly.cloud_cover_high.forEach(cover => {
            if (cover === null || cover === undefined) {
                cover = 0;
            }
            const maxDarkness = 0.75;
            const opacity = cover * maxDarkness / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`;
            const textColor = opacity < 0.35 ? 'black' : 'white';
            tableHtml += `<td class="data-cell grey-bg small-text-cell" style="background-color: ${bgColor}; color: ${textColor};">${cover}</td>`;
        });
        tableHtml += '</tr>';
    }
    
    if (weatherData.hourly.hasOwnProperty('cloud_cover_mid')) {
        tableHtml += '<tr><th class="sticky-header small-text-cell">Mid Clouds</th>';
        weatherData.hourly.cloud_cover_mid.forEach(cover => {
            if (cover === null || cover === undefined) {
                cover = 0;
            }
            const maxDarkness = 0.75;
            const opacity = cover * maxDarkness / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`;
            const textColor = opacity < 0.35 ? 'black' : 'white';
            tableHtml += `<td class="data-cell grey-bg small-text-cell" style="background-color: ${bgColor}; color: ${textColor};">${cover}</td>`;
        });
        tableHtml += '</tr>';
    }
    
    if (weatherData.hourly.hasOwnProperty('cloud_cover_low')) {
        tableHtml += '<tr><th class="sticky-header small-text-cell">Low Clouds</th>';
        weatherData.hourly.cloud_cover_low.forEach(cover => {
            if (cover === null || cover === undefined) {
                cover = 0;
            }
            const maxDarkness = 0.75;
            const opacity = cover * maxDarkness / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`;
            const textColor = opacity < 0.35 ? 'black' : 'white';
            tableHtml += `<td class="data-cell grey-bg small-text-cell" style="background-color: ${bgColor}; color: ${textColor};">${cover}</td>`;
        });
        tableHtml += '</tr>';
    }
    
    table.innerHTML = tableHtml;
    
    // Additional calls to manipulate table appearance after it is created
    toggleHighAltitude();
    toggleDaylightHours();
    addVerticalBordersBetweenDays();
    disableButtonsExcept(['cloudsButton', 'toggleTemperatureButton', 'returnToWindTableButton']);
}

function disableButtonsExcept(buttonIds) {
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(button => {
                if (!buttonIds.includes(button.id) && button.id !== 'editButton') { // Exclude the edit button from being disabled
                    button.disabled = true; // Disable the button
                    button.style.opacity = 0.5; // Gray out the button visually
                } else {
                    button.disabled = false; // Enable specified buttons
                    button.style.opacity = 1; // Ensure full opacity for enabled buttons
                }
            });
        }
const collapseButton = document.getElementById('editButton');

function clickCollapseButton() {
    // Check if the collapse button text is "Collapse" and click it
    if (collapseButton.textContent.trim() === 'Collapse') {
        collapseButton.click();
    }
}

function toggleSavedLocationsPopup() {
        const popup = document.getElementById('savedLocationsPopup');
        popup.style.display = (popup.style.display === 'none' || popup.style.display === '') ? 'flex' : 'none';

        // Update the list of saved locations whenever the popup is displayed
        if (popup.style.display === 'flex') {
            updateSavedLocationsList();
        }
    }
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('savedLocationsButton').addEventListener('click', toggleSavedLocationsPopup);

// Update saved locations list when the popup is shown

// Array of button IDs that should trigger the collapse button click
const buttonIdsToTriggerCollapse = [
    // Add all the button IDs that need to trigger the collapse
    'cloudsButton', // Wind/Clouds button ID
    'toggleTemperatureButton', // Temperature button ID
    'submitThresholds', // Submit button ID (from config popup)
    'applyBestDaysButton', // Apply button ID (from best days popup)
    'checkWindShearButton', // Enable Wind Shear button ID
    'toggleDaylightButton', // All Hours/Daylight button ID
    'toggleHighAltitudeButton', // High Altitude button ID
   
];

buttonIdsToTriggerCollapse.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            // Perform the button's original action here if necessary...

            // Then trigger the collapse button click after the action
            clickCollapseButton();
        });
    }
});

// If there are more buttons with similar functionality that are not captured by ID,
// you can assign them a common class and add event listeners based on that.

});
function manageViewButtons() {
    const toggleButton = document.getElementById('cloudsButton');
    const toggleTemperatureButton = document.getElementById('toggleTemperatureButton');
    const returnToWindTableButton = document.getElementById('returnToWindTableButton');
    
    const isTemperatureTableDisplayed = [...document.querySelectorAll('table[id$="-table"]')]
    .some(table => table.dataset.showing === 'temperature');
    const isCloudTableDisplayed = [...document.querySelectorAll('table[id$="-table"]')]
    .some(table => table.dataset.showing === 'clouds');
    
    if (isCloudTableDisplayed || isTemperatureTableDisplayed) {
    // Hide the toggle buttons and show the "Return to Wind Table" button
    toggleButton.style.display = 'none';
    toggleTemperatureButton.style.display = 'none';
    returnToWindTableButton.style.display = 'inline-block'; // Show the return button
    } else {
    // Show the toggle buttons and hide the "Return to Wind Table" button
    toggleButton.style.display = 'inline-block';
    toggleTemperatureButton.style.display = 'inline-block';
    returnToWindTableButton.style.display = 'none'; // Hide the return button
    }
    }
    document.getElementById('returnToWindTableButton').addEventListener('click', function() {
        // Restore the previous state of highAltitudeVisible
        highAltitudeVisible = previousHighAltitudeState;
        const highAltitudeButton = document.getElementById('toggleHighAltitudeButton');
        if (highAltitudeButton) {
            highAltitudeButton.textContent = highAltitudeVisible ? 'Hide High Altitudes' : 'Show High Altitudes';
        }
        // Fetch new data with the restored high altitudes state
        fetchAllModelsData().then(() => {
            // After data is fetched, proceed with wind display
            Object.keys(globalWeatherData).forEach(model => {
                const tableId = `${model.toLowerCase()}-table`;
                const dataTable = document.getElementById(tableId);
                fillTableWithWindSpeed(dataTable, globalWeatherData[model]);
                dataTable.dataset.showing = 'winds';
            });
            manageViewButtons();
        });
    });