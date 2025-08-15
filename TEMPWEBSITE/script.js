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
    console.log("save settings and fetch data function");
    const capeCheckbox = document.getElementById('capeCheckbox');
    console.log('capeCheckbox:', capeCheckbox); // Check if the element is found
    const precipProbCheckbox = document.getElementById('precipProbCheckbox');
    const temp2mCheckbox = document.getElementById('temp2mCheckbox');
    const cloudCoverCheckbox = document.getElementById('cloudCoverCheckbox');
    const precipSumCheckbox = document.getElementById('precipSumCheckbox');
    const dewpointSpreadCheckbox = document.getElementById('dewpointSpreadCheckbox');
    const relativeHumidityCheckbox = document.getElementById('relativeHumidityCheckbox');
    const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
    const visibilityCheckbox = document.getElementById('visibilityCheckbox');
    console.log(liftedIndexCheckbox);
    
    console.log(document.getElementById('liftedIndexCheckbox'));
    // Save the checkbox states to cookies
    setCookie('variable_cape', capeCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_precipitation_probability', precipProbCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_temperature_2m', temp2mCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_cloud_cover', cloudCoverCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_precipitation_sum', precipSumCheckbox.checked ? 'true' : 'false', 365);
    setCookie('variable_dewpoint_spread', dewpointSpreadCheckbox.checked ? 'true' : 'false', 365);
    console.log('About to save checkbox state:', liftedIndexCheckbox.checked);
    setCookie('variable_lifted_index', liftedIndexCheckbox.checked ? 'true' : 'false', 365);
    console.log(liftedIndexCheckbox.checked);
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
// document.addEventListener('DOMContentLoaded', function () {
//         // Get references to checkboxes by their IDs
 //       const capeCheckbox = document.getElementById('capeCheckbox');
   //     const precipProbCheckbox = document.getElementById('precipProbCheckbox');
     //   const temp2mCheckbox = document.getElementById('temp2mCheckbox');
       // const cloudCoverCheckbox = document.getElementById('cloudCoverCheckbox');
       // const precipSumCheckbox = document.getElementById('precipSumCheckbox');

       
    //});

    

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
    
   
        ////console.log("Wind shear button clicked");
        windShearEnabled = !windShearEnabled;
        setCookie('windShearEnabled', windShearEnabled ? 'true' : 'false', 365);
        ////console.log(windShearEnabled);
        const button = this; // 'this' refers to the button element in a regular function.

        // Always display "Loading..." text and disable the button while processing
        button.textContent = 'Loading...';
    

    
        fetchAllModelsData();
        if (windShearEnabled == true) { button.textContent = 'Disable Wind Shear'; }
        else (button.textContent = 'Enable Wind Shear' )
    
    });
function fillTableWithTemperature(table, weatherData) {
    let tableHtml = '<tr>' + table.getElementsByTagName('tr')[0].innerHTML + '</tr>';
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
     ////console.log('checkwindshear');
        

        

    // Select all tables that end in '-table', such as 'icon-table', 'gfs-table', etc.
    ////console.log("Wind shear check starting...");
    const tables = document.querySelectorAll('table[id$="-table"]');
            tables.forEach(table => {
        
        ////console.log(`Checking wind shear for table with ID: ${table.id}`); // Log which table is being checked

        // Get all the rows (tr elements) of the current table, excluding the header row
        const rows = table.querySelectorAll('tr:not(:first-child)');
        ////console.log(`${table.id} has ${rows.length} data rows available for wind shear detection.`);
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
                    //////console.log(`Row: ${rowIndex + 1}, Column: ${cellIndex + 1}, Current Wind Speed: ${currentWindSpeed}, Next Wind Speed: ${nextWindSpeed}`);
                    // ////console.log(`Row: ${rowIndex + 1}, Column: ${cellIndex + 1}, Current Wind Direction: ${currentWindDirection}, Next Wind Direction: ${nextWindDirection}`);

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

     ////console.log("Wind shear check completed.");
            
            
        
}

function removeWindShearStyles() {
    ////console.log('removeWindShearStyles');
    document.querySelectorAll('.shear-detected').forEach(cell => {
        cell.classList.remove('shear-detected');
    });
}
function toggleHighAltitude() {
    console.log('toggleHighAltitude called, highAltitudeVisible:', highAltitudeVisible);
    highAltitudeVisible = !highAltitudeVisible; // Toggle the state
    console.log('New highAltitudeVisible state:', highAltitudeVisible);
    
    const tables = document.querySelectorAll('table[id$="-table"]');
    tables.forEach(table => {
        console.log('Processing table:', table.id);
        const rows = table.getElementsByTagName('tr');
        console.log('Total rows found:', rows.length);
        // Skip the header row by starting the loop at index 1
        for (let i = 1; i < rows.length; i++) {
            const altitudeText = rows[i].cells[0].innerText;
            const altitudeInFeet = altitudeText.replace(' ft', '');
            console.log(`Row ${i}: Altitude text = "${altitudeText}", parsed value = ${parseInt(altitudeInFeet)}`);
            if (parseInt(altitudeInFeet) > 5000 && altitudeText !== 'High%' && 
                altitudeText !== 'Mid%' && altitudeText !== 'Low%') {
                console.log(`${highAltitudeVisible ? 'Showing' : 'Hiding'} row ${i} with altitude ${altitudeText}`);
                rows[i].style.display = highAltitudeVisible ? '' : 'none'; // Show if highAltitudeVisible is true, hide if false
            }
        }
    });
    console.log('toggleHighAltitude completed');
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
            ////console.log('daylight hours shown');
        
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
            ////console.log(daylightHoursShown);
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
    
    console.log('resetTables');
    // Loop over each model to create the tables again using the stored data
    //  ////console.log('resetTables');
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
function getWindArrowClass(degrees) {
    // Ensure degrees are within 0-359 and add 180 degrees to flip the arrow
    degrees = (degrees + 180) % 360;
    // Get the nearest multiple of 22.5
    const closestMultiple = Math.round(degrees / 22.5) * 22.5;
    // Create the class name by replacing '.' with '-' to match CSS class naming
    const classNameDegrees = closestMultiple.toString().replace('.', '-');
    return 'wind-arrow rotate-' + classNameDegrees;
}
function initialTableSetup() {
    const tableIds=['icon-table','gfs-table']
    console.log('Initial Table Setup');
    
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        
            fillTableWithWindSpeed(table, globalWeatherData[table.dataset.model]);
        
    });
    
    // toggleDaylightHours();
    //submitThresholdsAndRepaint();
    
}
function initialAllTableSetup(tableIds) {
    
console.log('Initial All Table Setup');
console.log('tableIDS: ', tableIds);

tableIds.forEach(tableId => {
const table = document.getElementById(tableId);

if (table && table.dataset.model) { // Ensure the dataset model attribute exists
    const model = table.dataset.model; // Get model name from data attribute
    if (allTableWeatherData[tableId]) { // Check if the model exists in allTableWeatherData
        // Use model data to fill the table with wind speed
        fillAllTablesWithWindSpeed(table, allTableWeatherData[tableId]);
        console.log(`Table setup for model: ${model}`);
        
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

function showConfigPopup() {
document.getElementById('configPopup').style.display = 'flex';

// Disable buttons other than 'submitThresholds' and 'fetchCoordinatesButton'
toggleButtonsDisabledState(true, ['submitThresholds', 'editButton']);
}

document.getElementById('submitThresholds').addEventListener('click', submitThresholdsAndRepaint);
function repaintGraphsWithNewThresholds(low, med, high) {
    console.log('repaintgraphs');
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
    console.log('fetch coord button');
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

    //#####

    
let isUpdatingTables = false;
async function fetchAllModelsData() {
        console.log('fetchAllModelsData called');
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
                console.log(`Processing model: ${model}`);
                await checkAndFetchData(baseUrl, model); // await added here
                console.log(`Finished processing model: ${model}`);
                
            }));

            console.log('All models data fetched');
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
    const cacheDuration = 15 * 60 * 1000;

    if (lastApiCallDataStr) {
        const lastApiCallData = JSON.parse(lastApiCallDataStr);
        if (now - lastApiCallData.timestamp < cacheDuration) {
            return true; // API has been called within last 15 minutes
        }
    }
    return false;
}


async function checkAndFetchAllDataTables(baseUrl, model, lat, lon, name, tableElement, tableId) {
console.log("checkAndFetchAllData");

    try {
        console.log(`Fetching data for ${name} using model ${model} with fallback system...`);
        
        // Create a temporary userLocation for this specific call
        const tempUserLocation = { latitude: lat, longitude: lon };
        const originalUserLocation = userLocation;
        userLocation = tempUserLocation;
        
        // Use the new fallback system
        const result = await fetchWeatherDataWithFallback(baseUrl, model);
        
        // Restore original userLocation
        userLocation = originalUserLocation;
        
        // Process data to handle any missing parameters
        const processedData = handleMissingData(result.data, model);
        allTableWeatherData[tableId] = processedData;
        console.log('ALLTABLEWEATHERDATA CHECKANDFETCH: ', allTableWeatherData);

if(tableElement instanceof HTMLTableElement) {
// Passed an actual table element, we want to retrieve its ID
createAllTables(tableElement.id, allTableWeatherData[tableId], name, tableElement);
} else {
// If it's not an HTMLTableElement, it's expected to be an ID string
createAllTables(tableId, allTableWeatherData[tableId], name, tableElement);
}
        
        // Log fallback information if fallback was used
        if (result.fallbackLevel > 0) {
            console.warn(`Location ${name} used fallback level ${result.fallbackLevel} with ${result.parametersUsed} parameters from ${result.endpoint}`);
            showFallbackNotification(model, result.fallbackLevel, result.parametersUsed, result.endpoint);
        } else {
            console.log(`Data fetched successfully for ${name} with full parameter set`);
        }
        
console.log(`Data fetched and table created for ${name} using model: ${model}`);
        
} catch (error) {
        console.error(`Failed to fetch data for ${name} using model ${model} after all fallback attempts:`, error);
        
        // Show user-friendly error message
        const errorMessage = `Unable to fetch weather data for ${name}. Please try again later.`;
        console.error(errorMessage);
        
        // Optionally show a user notification
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Weather Data Error',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        }
}
}



async function checkAndFetchData(baseUrl, model) {
    console.log("checkAndFetchData");
    console.log("check and fetch data");
    
      let shouldFetchData = true;  // Default to true to indicate new data should be fetched
    const lastApiCallKey = `lastApiCall_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    console.log(lastApiCallKey);

    const now = Date.now();
    const cacheDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
   const lastApiCallDataStr = localStorage.getItem(lastApiCallKey);

    // Check if we have cached data for this model and coordinates
     if (lastApiCallDataStr) {
        try {
const lastApiCallData = JSON.parse(lastApiCallDataStr);

// Check if the cached data's timestamp is within the acceptable range
if (now - lastApiCallData.timestamp < cacheDuration) {
    // If the data is still fresh, use the cached data and avoid making a new fetch
    shouldFetchData = false;
    globalWeatherData[model] = lastApiCallData.data;
    createTable(`${model.toLowerCase()}-table`, lastApiCallData.data, model);
                console.log(`Using cached data for model ${model}`);
            }
        } catch (error) {
            console.error(`Error parsing cached data for model ${model}:`, error);
            // If cache is corrupted, we'll fetch new data
        }
    }
    
    console.log('should fetch data: ', shouldFetchData);
    
    // Fetch new data if necessary
    if (shouldFetchData) {
        try {
            console.log(`Fetching new data for model ${model} with fallback system...`);
            
            // Use the new fallback system
            const result = await fetchWeatherDataWithFallback(baseUrl, model);
            
            // Cache the new API data with fallback information
            localStorage.setItem(lastApiCallKey, JSON.stringify({
timestamp: now,
                data: result.data,
latitude: userLocation.latitude,
longitude: userLocation.longitude,
                cityName: $('#cityName').text(),
                fallbackInfo: {
                    endpoint: result.endpoint,
                    parametersUsed: result.parametersUsed,
                    fallbackLevel: result.fallbackLevel
                }
            }));

            // Process data to handle any missing parameters
            const processedData = handleMissingData(result.data, model);

            // Populate the respective table with the fetched data
            createTable(`${model.toLowerCase()}-table`, processedData, model);

            // Store the fetched data globally
            globalWeatherData[model] = processedData;
            
            // Log fallback information if fallback was used
            if (result.fallbackLevel > 0) {
                console.warn(`Model ${model} used fallback level ${result.fallbackLevel} with ${result.parametersUsed} parameters from ${result.endpoint}`);
                showFallbackNotification(model, result.fallbackLevel, result.parametersUsed, result.endpoint);
            } else {
                console.log(`Data fetched successfully for model ${model} with full parameter set`);
            }
            
        } catch (error) {
            console.error(`Failed to fetch data for model ${model} after all fallback attempts:`, error);
            
            // Record the error for future reference
            recordApiError(model, error);
            
            // Check if we should use cached data due to recent errors
            if (shouldUseCachedData(model)) {
                const lastApiCallDataStr = localStorage.getItem(lastApiCallKey);
                if (lastApiCallDataStr) {
                    try {
                        const lastApiCallData = JSON.parse(lastApiCallDataStr);
                        console.log(`Using cached data for ${model} due to API errors`);
                        globalWeatherData[model] = lastApiCallData.data;
                        createTable(`${model.toLowerCase()}-table`, lastApiCallData.data, model);
                        
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Using Cached Data',
                                text: `Unable to fetch fresh data for ${model.toUpperCase()}. Using cached data from ${new Date(lastApiCallData.timestamp).toLocaleString()}.`,
                                confirmButtonText: 'OK',
                                timer: 5000,
                                timerProgressBar: true
                            });
                        }
                        return;
                    } catch (cacheError) {
                        console.error('Error using cached data:', cacheError);
                    }
                }
            }
            
            // Show user-friendly error message
            const errorMessage = `Unable to fetch weather data for ${model.toUpperCase()} model. Please try again later.`;
            console.error(errorMessage);
            
            // Optionally show a user notification
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Weather Data Error',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
            }
        }
    }

    console.log(`checkAndFetchData finished for model ${model}`);
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
    console.log('Saving state for:', checkbox.id, 'State:', checkbox.checked);
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
    return defaultValue; // Return default value if cookie is not found
    console.log(liftedIndexCheckbox);
}



window.onload = function () {
    console.log("window.onload");
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


    
    //console.log('Before initializing checkboxes:');
    //console.log(`Cape Checkbox Cookie: ${getCookie('variable_cape')}`);
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
    
    
    //console.log(`GFS/OpeMeteo length value: ${gfsOpenMeteoLengthValue}`);
    //console.log(`ICON length value: ${iconLengthValue}`);
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
console.log('Display All Tables called');


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
function copyTablesForAllLocations(numberOfLocations) {
const gfsTableOriginal = document.getElementById('gfs-table');
for (let i = 1; i <= numberOfLocations; i++) {
const tableCopy = gfsTableOriginal.cloneNode(true); // Deep clone the original table
tableCopy.id = `table${i}-table`; // Assign a new ID based on the location index
// You can now insert this new tableCopy into the DOM where needed
}
}


function saveForecastLengthSettings() {
    console.log('forecast length');
        const gfsOpenMeteoLength = document.getElementById('gfsOpenMeteoLength').value;
        const iconLength = document.getElementById('iconLength').value;

        setCookie('gfsOpenMeteoLength', gfsOpenMeteoLength, 365);
        setCookie('iconLength', iconLength, 365);

        document.getElementById('forecastLengthPopup').style.display = 'none'; // Hide the popup

        fetchAllModelsData();
    }

    // Function to close the forecast length popup
    function closeForecastLengthPopup() {
        document.getElementById('forecastLengthPopup').style.display = 'none';
    }

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
            console.log('DCOMContentLoaded');
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
                // Manually adjust the timestamp to be older than the cache duration.
                localStorage.setItem(lastApiCallKey, JSON.stringify({
                    timestamp: Date.now() - 1000 * 60 * 60,
                    data: {} // You can set the data to an empty object or the most recent data as per your preference.
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
    console.log('createTable');
    console.log(weatherData);
    const altitudeLabels = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100].reverse();
    const timestamps = weatherData.hourly.time;
    const dataTable = document.getElementById(tableId);

    let tableHtml = `<tr><th>${model.replace('Meteo', '<br>Meteo')}</th>`;
    let currentDay = null; // Variable to store the current day as you loop through the timestamps
    // Assuming that weatherData.hourly.is_day is an array with the same length as timestamps
    let isDayArray = weatherData.hourly.is_day;
    ////console.log(isDayArray);
    isDayArray = extendDaylightHours(isDayArray);
    ////console.log(isDayArray);
    
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
    //////console.log(`Listeners added for ${model} model`);
}

function createAllTables(tableId, weatherData, locationName, tableElement) {
    console.log(`Creating table with ID: ${tableId} for location: ${locationName}`);
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
    ////console.log(isDayArray);
    isDayArray = extendDaylightHours(isDayArray);
    ////console.log(isDayArray);
    
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
    //////console.log(`Listeners added for ${model} model`);
if (tableElement) {
// Create a header for the table to display the location name
const locationHeader = document.createElement('h3');


// Fill the table with the generated HTML
console.log(`Updating innerHTML for table with ID: ${tableId}`);

tableElement.innerHTML = tableHtml;

// Get a reference to the container where the tables should be appended
const tablesContainer = document.getElementById('tables-container');
globalWeatherData[tableId] = weatherData;
console.log('GLOBALWEATHERDATA',globalWeatherData)

// Append the location name and the table to the container
tablesContainer.appendChild(locationHeader); // Adds the location name as a header
tablesContainer.appendChild(tableElement);   // Appends the table after the header
} else {
console.error(`Table element not found for ID: ${tableId}`);
}
console.log(`Table creation completed for location ${locationName}`);
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
        console.log('Switching to clouds - enabling high altitudes first');
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
    ////console.log('extendDaylightHours');
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
console.log('filltablewithwindspeed');
console.log(`Filling table with ID: ${table.id} using data:`, weatherData);

let tableHtml = '<tr>' + table.getElementsByTagName('tr')[0].innerHTML + '</tr>';
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
                const windArrowClass = getWindArrowClass(windDirection);
                const roundedWindSpeed = windSpeed !== null ? Math.round(windSpeed) : '?';

                // Get the background and text color based on the wind speed
                const { backgroundColor, textColor } = getWindSpeedColor(roundedWindSpeed);

                // We're using the upwards arrow Unicode symbol and rotating it using CSS
                const windArrowUnicode = '&#x2191;&#xFE0E;'; // Upwards arrow (we'll rotate it using CSS)

                // Add wind speed and a Unicode arrow for wind direction with the proper rotation
                tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};"
data-wind-speed="${roundedWindSpeed}" data-wind-direction="${windDirection}">
<div>${roundedWindSpeed}</div>
<div class="${windArrowClass}">${windArrowUnicode}</div>
</td>`;
            });
            

            tableHtml += '</tr>';

        }
        
        }) ;
    


    // Finally, set the table's HTML to the newly created rows
    
    table.innerHTML = tableHtml;

    const windGustsKey = `wind_gusts_10m`;
    if (weatherData.hourly.hasOwnProperty(windGustsKey)) {
        // Start the gusts table row with a descriptive header
        tableHtml += `<tr><th class="sticky-header small-text-cell">Gusts</th>`;

        // Add a data cell for each time interval with wind gusts data
        weatherData.hourly[windGustsKey].forEach((windGust, idx) => {
            const roundedWindGust = windGust !== null ? Math.round(windGust) : '?';

            // Get the background and text color based on the wind gust speed
            const { backgroundColor, textColor } = getWindSpeedColor(roundedWindGust);

            // Add wind gust value with the appropriate color coding
            tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};">
            <div>${roundedWindGust}</div>
          </td>`;
        });
        

        // Close the gusts table row
        tableHtml += '</tr>';

    }
    
        // Assuming weatherData.hourly['cape'] is an array of CAPE values at hourly intervals
        if (weatherData.hourly.hasOwnProperty('cape') && capeCheckbox && capeCheckbox.checked) {

            // Add CAPE row header
            tableHtml += `<tr><th class="sticky-header small-text-cell">CAPE</th>`;

            // Add CAPE data cells for each time interval
            weatherData.hourly['cape'].forEach(capeValue => {
                const { backgroundColor, textColor } = getCAPEColor(capeValue); // Get colors based on value
                const shortCapeValue = formatCapeValue(capeValue); // Ensure this line is before its usage

                // Add CAPE data cells with gradient background and contrast text
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${shortCapeValue}</td>`;
            
            });

            // Close the CAPE table row
            tableHtml += '</tr>';
        }

    
    
    
      const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
        if (liftedIndexCheckbox && liftedIndexCheckbox.checked && weatherData.hourly.hasOwnProperty('lifted_index')) {
            tableHtml += '<tr><th class="sticky-header small-text-cell">Lifted Index</th>';
            weatherData.hourly['lifted_index'].forEach(liftedIndex => {
                const { backgroundColor, textColor } = getLiftedIndexColor(liftedIndex);
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${liftedIndex.toFixed(1)}</td>`;
            });
            tableHtml += '</tr>';
        }

 
        // Precipitation probability only exists for certain models
        if (weatherData.hourly.hasOwnProperty('precipitation_probability') && precipProbCheckbox && precipProbCheckbox.checked) {
            // Add precipitation probability row header
            tableHtml += '<tr><th class="sticky-header small-text-cell">Precip %</th>';

            // Add precipitation probability data cells for each time interval
            weatherData.hourly.precipitation_probability.forEach(precipProbability => {
                precipProbability = precipProbability !== null ? precipProbability : '?';  // Check for null values
                const { backgroundColor, textColor } = getPrecipitationProbabilityColor(precipProbability);

                // Substitute N/A for missing precipitation_probability values or add cell with the actual value
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${precipProbability !== '?' ? precipProbability: precipProbability}</td>`;
            });

            tableHtml += '</tr>';
            
            
        }
        
       
    
    if (table.id === 'icon-table' && precipSumCheckbox && precipSumCheckbox.checked) {
        // Add Precipitation row header
        tableHtml += '<tr><th class="sticky-header small-text-cell">Precip (in)</th>';

        // Add Precipitation data cells for each time interval
        weatherData.hourly.precipitation.forEach(precipValue => {
            const backgroundColor = getPrecipitationColor(precipValue);
            const textColor = getTextColorForBackground(backgroundColor);
            if (precipValue !== null) {
            // Round to two decimal places and convert to string for display
            const precipValueDisplay = precipValue.toFixed(2);

            // Add the Precipitation data cell with fading blue background based on the value
            tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${precipValueDisplay}</td>`;
        } else {}
        });
        
         

        // Close the Precipitation table row
        tableHtml += '</tr>';
    }
    if (weatherData.hourly.hasOwnProperty('temperature_2m') && temp2mCheckbox && temp2mCheckbox.checked) {
        let temperatureRowHtml = '<tr><th class="sticky-header small-text-cell">Temp (°F)</th>'; // Header for the temperature row
        weatherData.hourly.temperature_2m.forEach(temp => {
            const { backgroundColor, textColor } = getTemperatureColor(temp); // Reusing getTemperatureColor function
            const displayedTemp = temp !== null ? Math.round(temp) : '?'; // Round temperature or use placeholder
            temperatureRowHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${displayedTemp}</td>`;
        });
        temperatureRowHtml += '</tr>';
        tableHtml += temperatureRowHtml; // Add the temperature row to the table HTML
    }
    const relativeHumidityCheckbox = document.getElementById('relativeHumidityCheckbox');
    if (weatherData.hourly.hasOwnProperty('relative_humidity_2m') && relativeHumidityCheckbox.checked) {
        tableHtml += '<tr><th class="sticky-header small-text-cell">Rel. Humidity</th>';

        const startColor = { r: 255, g: 255, b: 255 }; // White for 40% humidity
        const endColor = { r: 0, g: 0, b: 255 }; // Blue for 100% humidity
        weatherData.hourly.relative_humidity_2m.forEach(humidity => {
            let cellStyle = 'background-color: white;'; // Default cell style
            if (fogEnabled && humidity > 90) {
                cellStyle = 'border: 2px solid red;'; // Apply lightblue border when fog conditions are met
            }
            tableHtml += `<td class="data-cell small-text-cell" style="${cellStyle}">${Math.round(humidity)}%</td>`;
        });

        tableHtml += '</tr>';
    }
    const dewpointSpreadCheckbox = document.getElementById('dewpointSpreadCheckbox');
    if (dewpointSpreadCheckbox && dewpointSpreadCheckbox.checked && weatherData.hourly.hasOwnProperty('dew_point_2m') && weatherData.hourly.hasOwnProperty('temperature_2m')) {
        let temperature2m = weatherData.hourly.temperature_2m;
        let dewpoint2m = weatherData.hourly.dew_point_2m;

        // Define a new row for the dewpoint spread
        let dewpointSpreadRowHtml = `<tr><th class="sticky-header small-text-cell">Dp Spread</th>`;
        for (let i = 0; i < temperature2m.length; i++) {
            let spread = temperature2m[i] - dewpoint2m[i];
            let cellStyle = 'background-color: white;'; // Default background color white
            if (fogEnabled && spread < 3) {
                cellStyle = 'border: 2px solid red;'; // Apply lightblue border when fog conditions are met
            }
            // Add the dewpoint spread cell with computed styles
            dewpointSpreadRowHtml += `<td class="data-cell small-text-cell" style="${cellStyle}">${spread.toFixed(1)}</td>`;
        }

        // Close the dewpoint spread row
        dewpointSpreadRowHtml += '</tr>';

        // Add the dewpoint spread row to the existing HTML of the table
        tableHtml += dewpointSpreadRowHtml;
    }
    if ((table.id === 'gfs-table' || table.id === 'openmeteo-table')) {
        

        // Add Visibility row if option selected and data is available
        if (weatherData.hourly.hasOwnProperty('visibility') && document.getElementById('visibilityCheckbox').checked) {
            tableHtml += `<tr><th class="sticky-header small-text-cell">Visibility (mi)</th>`;
            weatherData.hourly['visibility'].forEach(visibility => {
                const visibilityInMiles = (visibility * 0.000621371).toFixed(1); // Convert meters to miles
                let cellStyle = 'background-color: white;';
                if (fogEnabled && visibilityInMiles < 20) {
                    cellStyle = 'border: 2px solid red;';
                }
                tableHtml += `<td class="data-cell smallest-text-cell" style="${cellStyle}">${visibilityInMiles}</td>`;
            });

            tableHtml += '</tr>';
        }
        


    }
    
    if (weatherData.hourly.hasOwnProperty('cloud_cover') && cloudCoverCheckbox && cloudCoverCheckbox.checked) {
        // Add cloud cover row header
        tableHtml += `<tr><th class="sticky-header small-text-cell">Clouds %</th>`;

        // Add cloud cover data cells for each time interval
        weatherData.hourly['cloud_cover'].forEach(cloudCover => {
            const maxDarkness = 0.70; // Maximum darkness for cloud cover (70%)
            const opacity = cloudCover * maxDarkness / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`; // Calculate background color based on cloud cover percentage

            // Determine text color based on the darkness of the background
            // If opacity is more than 0.5 (halfway to max darkness), use light text color
            const textColor = (opacity > 0.5) ? 'white' : 'black';

            tableHtml += `<td class="data-cell small-text-cell grey-bg" style="background-color: ${bgColor}; color: ${textColor};">${cloudCover}</td>`;
        });}
        
    // Finally, set the table's HTML to the newly created rows
    table.innerHTML = tableHtml;

    // New code to add black horizontal border below "33 ft" row
    const allRows = table.getElementsByTagName('tr');
    for (let i = 0; i < allRows.length; i++) {
        // Check if the first cell (header) contains "33 ft"
        if (allRows[i].cells[0].innerText === '33 ft') {
            // If "33 ft" is found, set a black border above ("top" of) this row
            if (i > 0) {  // Make sure it's not the first row
                allRows[i - 1].style.borderBottom = '3px solid black'; // Apply border to the bottom of the row above
            }
            break; // Border applied, no need to continue loop
        }
    }
    toggleHighAltitude();
    
    toggleDaylightHours();
    if (windShearEnabled) {
        ////console.log('Wind Shear Enabled: Checking...');
        // Asynchronously call the wind shear check function
        displaywindshear();
        // Once completed, set the text to reflect the current state
        this.textContent = 'Disable Wind Shear';
        this.disabled = false; // Re-enable the button
    };
    
    addVerticalBordersBetweenDays();
    cityName.style.display = 'block';

    
    
    }
    

function fillTableWithWindSpeed(table, weatherData) {
    console.log('filltablewithwindspeed');
    console.log(`Filling table with ID: ${table.id} for wind speed`);

    // Safety check - ensure table exists and has content
    if (!table || !table.getElementsByTagName('tr')[0]) {
        console.error(`Table ${table?.id} is empty or undefined, cannot fill with wind speed data`);
        return;
    }

    let tableHtml = '<tr>' + table.getElementsByTagName('tr')[0].innerHTML + '</tr>';
    const altitudeLevels = [10, 1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30].reverse(); // Order hPa values and feet values in descending order
    let gustRowAdded = false;
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
                const windArrowClass = getWindArrowClass(windDirection);
                const roundedWindSpeed = windSpeed !== null ? Math.round(windSpeed) : '?';

                // Get the background and text color based on the wind speed
                const { backgroundColor, textColor } = getWindSpeedColor(roundedWindSpeed);

                // We're using the upwards arrow Unicode symbol and rotating it using CSS
                const windArrowUnicode = '&#x2191;&#xFE0E;'; // Upwards arrow (we'll rotate it using CSS)

                // Add wind speed and a Unicode arrow for wind direction with the proper rotation
                tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};"
data-wind-speed="${roundedWindSpeed}" data-wind-direction="${windDirection}">
<div>${roundedWindSpeed}</div>
<div class="${windArrowClass}">${windArrowUnicode}</div>
</td>`;
            });
            

            tableHtml += '</tr>';

        }
        
        }) ;
    


    // Finally, set the table's HTML to the newly created rows
    table.innerHTML = tableHtml;

    const windGustsKey = `wind_gusts_10m`;
    if (weatherData.hourly.hasOwnProperty(windGustsKey)) {
        // Start the gusts table row with a descriptive header
        tableHtml += `<tr><th class="sticky-header small-text-cell">Gusts</th>`;

        // Add a data cell for each time interval with wind gusts data
        weatherData.hourly[windGustsKey].forEach((windGust, idx) => {
            const roundedWindGust = windGust !== null ? Math.round(windGust) : '?';

            // Get the background and text color based on the wind gust speed
            const { backgroundColor, textColor } = getWindSpeedColor(roundedWindGust);

            // Add wind gust value with the appropriate color coding
            tableHtml += `<td class="data-cell" style="background-color: ${backgroundColor}; color: ${textColor};">
            <div>${roundedWindGust}</div>
          </td>`;
        });
        

        // Close the gusts table row
        tableHtml += '</tr>';

    }
    
        // Assuming weatherData.hourly['cape'] is an array of CAPE values at hourly intervals
        if (weatherData.hourly.hasOwnProperty('cape') && capeCheckbox && capeCheckbox.checked) {

            // Add CAPE row header
            tableHtml += `<tr><th class="sticky-header small-text-cell">CAPE</th>`;

            // Add CAPE data cells for each time interval
            weatherData.hourly['cape'].forEach(capeValue => {
                const { backgroundColor, textColor } = getCAPEColor(capeValue); // Get colors based on value
                const shortCapeValue = formatCapeValue(capeValue); // Ensure this line is before its usage

                // Add CAPE data cells with gradient background and contrast text
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${shortCapeValue}</td>`;
            
            });

            // Close the CAPE table row
            tableHtml += '</tr>';
        }

    
    
    if ((table.id === 'gfs-table' || table.id === 'openmeteo-table')) {
      const liftedIndexCheckbox = document.getElementById('liftedIndexCheckbox');
        if (liftedIndexCheckbox && liftedIndexCheckbox.checked && weatherData.hourly.hasOwnProperty('lifted_index')) {
            tableHtml += '<tr><th class="sticky-header small-text-cell">Lifted Index</th>';
            weatherData.hourly['lifted_index'].forEach(liftedIndex => {
                const { backgroundColor, textColor } = getLiftedIndexColor(liftedIndex);
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${liftedIndex.toFixed(1)}</td>`;
            });
            tableHtml += '</tr>';
        }

 
        // Precipitation probability only exists for certain models
        if (weatherData.hourly.hasOwnProperty('precipitation_probability') && precipProbCheckbox && precipProbCheckbox.checked) {
            // Add precipitation probability row header
            tableHtml += '<tr><th class="sticky-header small-text-cell">Precip %</th>';

            // Add precipitation probability data cells for each time interval
            weatherData.hourly.precipitation_probability.forEach(precipProbability => {
                precipProbability = precipProbability !== null ? precipProbability : '?';  // Check for null values
                const { backgroundColor, textColor } = getPrecipitationProbabilityColor(precipProbability);

                // Substitute N/A for missing precipitation_probability values or add cell with the actual value
                tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${precipProbability !== '?' ? precipProbability: precipProbability}</td>`;
            });

            tableHtml += '</tr>';
            
            
        }
        
       
    }
    if (table.id === 'icon-table' && precipSumCheckbox && precipSumCheckbox.checked) {
        // Add Precipitation row header
        tableHtml += '<tr><th class="sticky-header small-text-cell">Precip (in)</th>';

        // Add Precipitation data cells for each time interval
        weatherData.hourly.precipitation.forEach(precipValue => {
            const backgroundColor = getPrecipitationColor(precipValue);
            const textColor = getTextColorForBackground(backgroundColor);
            if (precipValue !== null) {
            // Round to two decimal places and convert to string for display
            const precipValueDisplay = precipValue.toFixed(2);

            // Add the Precipitation data cell with fading blue background based on the value
            tableHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${precipValueDisplay}</td>`;
        } else {}
        });
        
         

        // Close the Precipitation table row
        tableHtml += '</tr>';
    }
    if (weatherData.hourly.hasOwnProperty('temperature_2m') && temp2mCheckbox && temp2mCheckbox.checked) {
        let temperatureRowHtml = '<tr><th class="sticky-header small-text-cell">Temp (°F)</th>'; // Header for the temperature row
        weatherData.hourly.temperature_2m.forEach(temp => {
            const { backgroundColor, textColor } = getTemperatureColor(temp); // Reusing getTemperatureColor function
            const displayedTemp = temp !== null ? Math.round(temp) : '?'; // Round temperature or use placeholder
            temperatureRowHtml += `<td class="data-cell small-text-cell" style="background-color: ${backgroundColor}; color: ${textColor};">${displayedTemp}</td>`;
        });
        temperatureRowHtml += '</tr>';
        tableHtml += temperatureRowHtml; // Add the temperature row to the table HTML
    }
    const relativeHumidityCheckbox = document.getElementById('relativeHumidityCheckbox');
    if (weatherData.hourly.hasOwnProperty('relative_humidity_2m') && relativeHumidityCheckbox.checked) {
        tableHtml += '<tr><th class="sticky-header small-text-cell">Rel. Humidity</th>';

        const startColor = { r: 255, g: 255, b: 255 }; // White for 40% humidity
        const endColor = { r: 0, g: 0, b: 255 }; // Blue for 100% humidity
        weatherData.hourly.relative_humidity_2m.forEach(humidity => {
            let cellStyle = 'background-color: white;'; // Default cell style
            if (fogEnabled && humidity > 90) {
                cellStyle = 'border: 2px solid red;'; // Apply lightblue border when fog conditions are met
            }
            tableHtml += `<td class="data-cell small-text-cell" style="${cellStyle}">${Math.round(humidity)}%</td>`;
        });

        tableHtml += '</tr>';
    }
    const dewpointSpreadCheckbox = document.getElementById('dewpointSpreadCheckbox');
    if (dewpointSpreadCheckbox && dewpointSpreadCheckbox.checked && weatherData.hourly.hasOwnProperty('dew_point_2m') && weatherData.hourly.hasOwnProperty('temperature_2m')) {
        let temperature2m = weatherData.hourly.temperature_2m;
        let dewpoint2m = weatherData.hourly.dew_point_2m;

        // Define a new row for the dewpoint spread
        let dewpointSpreadRowHtml = `<tr><th class="sticky-header small-text-cell">Dp Spread</th>`;
        for (let i = 0; i < temperature2m.length; i++) {
            let spread = temperature2m[i] - dewpoint2m[i];
            let cellStyle = 'background-color: white;'; // Default background color white
            if (fogEnabled && spread < 3) {
                cellStyle = 'border: 2px solid red;'; // Apply lightblue border when fog conditions are met
            }
            // Add the dewpoint spread cell with computed styles
            dewpointSpreadRowHtml += `<td class="data-cell small-text-cell" style="${cellStyle}">${spread.toFixed(1)}</td>`;
        }

        // Close the dewpoint spread row
        dewpointSpreadRowHtml += '</tr>';

        // Add the dewpoint spread row to the existing HTML of the table
        tableHtml += dewpointSpreadRowHtml;
    }
    if ((table.id === 'gfs-table' || table.id === 'openmeteo-table')) {
        

        // Add Visibility row if option selected and data is available
        if (weatherData.hourly.hasOwnProperty('visibility') && document.getElementById('visibilityCheckbox').checked) {
            tableHtml += `<tr><th class="sticky-header small-text-cell">Visibility (mi)</th>`;
            weatherData.hourly['visibility'].forEach(visibility => {
                const visibilityInMiles = (visibility * 0.000621371).toFixed(1); // Convert meters to miles
                let cellStyle = 'background-color: white;';
                if (fogEnabled && visibilityInMiles < 20) {
                    cellStyle = 'border: 2px solid red;';
                }
                tableHtml += `<td class="data-cell smallest-text-cell" style="${cellStyle}">${visibilityInMiles}</td>`;
            });

            tableHtml += '</tr>';
        }
        


    }
    
    if (weatherData.hourly.hasOwnProperty('cloud_cover') && cloudCoverCheckbox && cloudCoverCheckbox.checked) {
        // Add cloud cover row header
        tableHtml += `<tr><th class="sticky-header small-text-cell">Clouds %</th>`;

        // Add cloud cover data cells for each time interval
        weatherData.hourly['cloud_cover'].forEach(cloudCover => {
            const maxDarkness = 0.70; // Maximum darkness for cloud cover (70%)
            const opacity = cloudCover * maxDarkness / 100;
            const bgColor = `rgba(0, 0, 0, ${opacity})`; // Calculate background color based on cloud cover percentage

            // Determine text color based on the darkness of the background
            // If opacity is more than 0.5 (halfway to max darkness), use light text color
            const textColor = (opacity > 0.5) ? 'white' : 'black';

            tableHtml += `<td class="data-cell small-text-cell grey-bg" style="background-color: ${bgColor}; color: ${textColor};">${cloudCover}</td>`;
        });}
        
    // Finally, set the table's HTML to the newly created rows
    table.innerHTML = tableHtml;

    // New code to add black horizontal border below "33 ft" row
    const allRows = table.getElementsByTagName('tr');
    for (let i = 0; i < allRows.length; i++) {
        // Check if the first cell (header) contains "33 ft"
        if (allRows[i].cells[0].innerText === '33 ft') {
            // If "33 ft" is found, set a black border above ("top" of) this row
            if (i > 0) {  // Make sure it's not the first row
                allRows[i - 1].style.borderBottom = '3px solid black'; // Apply border to the bottom of the row above
            }
            break; // Border applied, no need to continue loop
        }
    }
    toggleHighAltitude();
    
    toggleDaylightHours();
    if (windShearEnabled) {
        ////console.log('Wind Shear Enabled: Checking...');
        // Asynchronously call the wind shear check function
        displaywindshear();
        // Once completed, set the text to reflect the current state
        this.textContent = 'Disable Wind Shear';
        this.disabled = false; // Re-enable the button
    };
    enableAllButtons();
    addVerticalBordersBetweenDays();
    cityName.style.display = 'block';
    
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
    console.log('refreshWeatherDataAndTables');
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
    isColorDark();
    // Set text color to white if background is dark
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

    console.log("=== Starting fillTableWithCloudCover ===");
    console.log("Table model:", table.dataset.model);
    
    const model = table.dataset.model;
    table.dataset.showing = 'clouds';
    
    // Log the structure of weatherData.hourly
    console.log("=== WeatherData Structure ===");
    console.log("Available hourly keys:", Object.keys(weatherData.hourly));
    console.log("Time array length:", weatherData.hourly.time?.length);
    
    // Get boundary layer height data only if it exists and only for GFS model
    const boundaryLayerHeight = model.toLowerCase() === 'gfs' ? weatherData.hourly?.boundary_layer_height : null;
    console.log("=== Boundary Layer Height Data ===");
    console.log("Model:", model);
    console.log("Boundary layer height data:", boundaryLayerHeight);
    console.log("Boundary layer height type:", typeof boundaryLayerHeight);
    console.log("Boundary layer height length:", boundaryLayerHeight?.length);
    if (boundaryLayerHeight && Array.isArray(boundaryLayerHeight)) {
        console.log("First few boundary layer heights:", boundaryLayerHeight.slice(0, 5));
    }
    
    let tableHtml = '<tr>' + table.getElementsByTagName('tr')[0].innerHTML + '</tr>';
    
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
        console.log("=== Adding Boundary Layer Height Row ===");
        console.log("Table model:", table.dataset.model);
        console.log("Boundary layer height data:", weatherData.hourly.boundary_layer_height);
        
        tableHtml += '<tr><th class="sticky-header small-text-cell" style="min-width: 15px;">Thermals (ft)</th>';
        weatherData.hourly.boundary_layer_height.forEach((height, index) => {
            if (height === null || height === undefined) {
                height = 0;
            }
            // Round to nearest integer since it's already in feet
            const heightInFeet = Math.round(height);
            console.log(`Boundary layer height: ${heightInFeet}ft`);
            
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
// Initialize the tables to display clouds by default
document.querySelectorAll('table[id$="-table"]').forEach(table => {
    table.dataset.showing = 'winds'; // Default view
});
// Function to convert degrees to Unicode arrows with text-style rendering
function getWindDirectionArrow(degrees) {
        if (typeof degrees === 'undefined' || degrees === null) {
            return ''; // Return empty string if the direction is undefined or null
        }
        const arrows = {
            S: '&#x2191;&#xFE0E;', // Upwards arrow (used to be North, now South)
            SW: '&#x2197;&#xFE0E;', // North East arrow (used to be NE, now SW)
            W: '&#x2192;&#xFE0E;', // Rightwards arrow (used to be East, now West)
            NW: '&#x2198;&#xFE0E;', // South East arrow (used to be SE, now NW)
            N: '&#x2193;&#xFE0E;', // Downwards arrow (used to be South, now North)
            NE: '&#x2199;&#xFE0E;', // South West arrow (used to be SW, now NE)
            E: '&#x2190;&#xFE0E;', // Leftwards arrow (used to be West, now East)
            SE: '&#x2196;&#xFE0E;'  // North West arrow (used to be NW, now SE)
        };

        // Convert the degrees to an arrow string with the given mapping
        const directions = [
            { direction: 'N', range: [337.5, 360], rangeStart: [0, 22.5] },
            { direction: 'NE', range: [22.5, 67.5] },
            { direction: 'E', range: [67.5, 112.5] },
            { direction: 'SE', range: [112.5, 157.5] },
            { direction: 'S', range: [157.5, 202.5] },
            { direction: 'SW', range: [202.5, 247.5] },
            { direction: 'W', range: [247.5, 292.5] },
            { direction: 'NW', range: [292.5, 337.5] }
        ];

        for (let i = 0; i < directions.length; i++) {
            const { direction, range, rangeStart } = directions[i];
            if ((degrees >= range[0] && degrees < range[1]) || (rangeStart && degrees >= rangeStart[0] && degrees < rangeStart[1])) {
                return arrows[direction]; // Return the Unicode arrow character for the direction
            }
         
        }
        return ''; // Return empty string if the direction does not fall within known ranges
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
        console.log('Return to wind table clicked');
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
    
    // Add this function before fillTableWithCloudCover
    function getCloudCoverColor(cloudCover) {
        // Convert cloud cover percentage to opacity (0 to 0.75)
        const maxDarkness = 0.75;
        const opacity = (cloudCover / 100) * maxDarkness;
        return `rgba(0, 0, 0, ${opacity})`;
    }

// Add these utility functions for error handling and fallback mechanisms
function handleMissingData(weatherData, model) {
    // Create a copy of the weather data to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(weatherData));
    
    // Get all possible parameters for this model
    const parameterGroups = createParameterGroups();
    let allPossibleParams;
    if (model.toLowerCase() === 'icon') {
        // For ICON, filter out GFS-specific parameters that ICON doesn't have
        const iconParams = parameterGroups.icon_full;
        const gfsOnlyParams = [
            'lifted_index', 'visibility', 'precipitation_probability',
            'temperature_300hPa', 'windspeed_300hPa', 'winddirection_300hPa',
            'temperature_250hPa', 'windspeed_250hPa', 'winddirection_250hPa',
            'temperature_200hPa', 'windspeed_200hPa', 'winddirection_200hPa',
            'temperature_150hPa', 'windspeed_150hPa', 'winddirection_150hPa',
            'temperature_100hPa', 'windspeed_100hPa', 'winddirection_100hPa',
            'temperature_70hPa', 'windspeed_70hPa', 'winddirection_70hPa',
            'temperature_50hPa', 'windspeed_50hPa', 'winddirection_50hPa',
            'temperature_30hPa', 'windspeed_30hPa', 'winddirection_30hPa'
        ];
        allPossibleParams = iconParams.filter(param => !gfsOnlyParams.includes(param));
    } else {
        allPossibleParams = parameterGroups.gfs_full;
    }
    
    // Define default values for missing parameters
    const defaultValues = {
        temperature_2m: 70,
        temperature_80m: 70,
        wind_speed_10m: 0,
        wind_speed_80m: 0,
        wind_direction_10m: 0,
        wind_direction_80m: 0,
        wind_gusts_10m: 0,
        relative_humidity_2m: 50,
        dew_point_2m: 50,
        cloud_cover: 0,
        cloud_cover_low: 0,
        cloud_cover_mid: 0,
        cloud_cover_high: 0,
        cape: 0,
        lifted_index: 0,
        visibility: 10000,
        precipitation_probability: 0,
        precipitation: 0,
        is_day: 1
    };
    
    // Add model-specific parameters
    if (model.toLowerCase() === 'icon') {
        defaultValues.temperature_180m = 70;
        defaultValues.wind_speed_180m = 0;
        defaultValues.wind_direction_180m = 0;
    }
    
    // Add default values for high altitude parameters
    const pressureLevels = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30];
    pressureLevels.forEach(level => {
        defaultValues[`temperature_${level}hPa`] = 70;
        defaultValues[`windspeed_${level}hPa`] = 0;
        defaultValues[`winddirection_${level}hPa`] = 0;
        defaultValues[`cloud_cover_${level}hPa`] = 0;
    });
    
    // Ensure hourly data exists
    if (!processedData.hourly) {
        processedData.hourly = {};
    }
    
    // Get the time array length for creating default arrays
    const timeLength = processedData.hourly.time ? processedData.hourly.time.length : 0;
    
    // Fill missing parameters with default values
    Object.keys(defaultValues).forEach(param => {
        if (!processedData.hourly[param]) {
            console.warn(`Missing parameter ${param} in ${model} data, using default values`);
            processedData.hourly[param] = new Array(timeLength).fill(defaultValues[param]);
        }
    });
    
    // Handle model-specific parameters
    if (model.toLowerCase() === 'gfs') {
        // GFS-specific parameters
        if (!processedData.hourly.boundary_layer_height) {
            console.warn(`Missing boundary_layer_height in ${model} data, using default values`);
            processedData.hourly.boundary_layer_height = new Array(timeLength).fill(1000);
        }
    } else if (model.toLowerCase() === 'icon') {
        // ICON-specific parameters
        if (!processedData.hourly.precipitation) {
            console.warn(`Missing precipitation in ${model} data, using default values`);
            processedData.hourly.precipitation = new Array(timeLength).fill(0);
        }
    }
    
    // Check for any missing parameters that should exist based on the model's full parameter set
    allPossibleParams.forEach(param => {
        if (!processedData.hourly[param] && defaultValues[param] !== undefined) {
            console.warn(`Missing expected parameter ${param} in ${model} data, using default values`);
            processedData.hourly[param] = new Array(timeLength).fill(defaultValues[param]);
        }
    });
    
    // Only check for model-specific parameters that should exist for this model
    if (model.toLowerCase() === 'gfs') {
        // GFS-specific parameters that should exist
        const gfsSpecificParams = ['boundary_layer_height', 'lifted_index', 'visibility', 'precipitation_probability'];
        gfsSpecificParams.forEach(param => {
            if (!processedData.hourly[param]) {
                console.warn(`Missing GFS-specific parameter ${param} in ${model} data, using default values`);
                processedData.hourly[param] = new Array(timeLength).fill(defaultValues[param] || 0);
            }
        });
    } else if (model.toLowerCase() === 'icon') {
        // ICON-specific parameters that should exist
        const iconSpecificParams = ['precipitation'];
        iconSpecificParams.forEach(param => {
            if (!processedData.hourly[param]) {
                console.warn(`Missing ICON-specific parameter ${param} in ${model} data, using default values`);
                processedData.hourly[param] = new Array(timeLength).fill(defaultValues[param] || 0);
            }
        });
    }
    
    return processedData;
}

function showFallbackNotification(model, fallbackLevel, parametersUsed, endpoint) {
    const fallbackMessages = {
        0: "Full data set retrieved successfully",
        1: "Some advanced features unavailable - using standard parameters",
        2: "Limited data available - using basic parameters", 
        3: "Minimal data available - using essential parameters only"
    };
    
    const message = fallbackMessages[fallbackLevel] || "Using fallback data";
    
    if (typeof Swal !== 'undefined' && fallbackLevel > 0) {
        Swal.fire({
            icon: 'warning',
            title: `${model.toUpperCase()} Data Notice`,
            text: `${message}. Retrieved ${parametersUsed} parameters from ${endpoint.includes('gfs') ? 'GFS' : endpoint.includes('icon') ? 'ICON' : 'Open-Meteo'}.`,
            confirmButtonText: 'OK',
            timer: 5000,
            timerProgressBar: true
        });
    }
    
    console.log(`${model.toUpperCase()}: ${message}`);
}

function createParameterGroups() {
    return {
        // Core essential parameters that should always work for all models
        essential: [
            'temperature_2m', 'wind_speed_10m', 'wind_direction_10m', 'is_day'
        ],
        
        // GFS-specific basic parameters (no temperature_180m)
        gfs_basic: [
            'temperature_2m', 'temperature_80m',
            'wind_speed_10m', 'wind_speed_80m',
            'wind_direction_10m', 'wind_direction_80m',
            'wind_gusts_10m', 'weather_code', 'is_day'
        ],
        
        // ICON-specific basic parameters (includes temperature_180m)
        icon_basic: [
            'temperature_2m', 'temperature_80m', 'temperature_180m',
            'wind_speed_10m', 'wind_speed_80m', 'wind_speed_180m',
            'wind_direction_10m', 'wind_direction_80m', 'wind_direction_180m',
            'wind_gusts_10m', 'weather_code', 'is_day'
        ],
        
        // GFS-specific standard parameters
        gfs_standard: [
            'temperature_2m', 'temperature_80m',
            'wind_speed_10m', 'wind_speed_80m',
            'wind_direction_10m', 'wind_direction_80m',
            'wind_gusts_10m', 'weather_code', 'relative_humidity_2m',
            'dew_point_2m', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
            'is_day', 'precipitation_probability'
        ],
        
        // ICON-specific standard parameters
        icon_standard: [
            'temperature_2m', 'temperature_80m', 'temperature_180m',
            'wind_speed_10m', 'wind_speed_80m', 'wind_speed_180m',
            'wind_direction_10m', 'wind_direction_80m', 'wind_direction_180m',
            'wind_gusts_10m', 'weather_code', 'relative_humidity_2m',
            'dew_point_2m', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
            'is_day', 'precipitation_probability'
        ],
        
        // GFS-specific full parameters (no temperature_180m, includes boundary_layer_height)
        gfs_full: [
            'temperature_2m', 'temperature_80m',
            'boundary_layer_height', 'weather_code', 'relative_humidity_2m',
            'dew_point_2m', 'visibility', 'lifted_index', 'cloud_cover',
            'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
            'cloud_cover_1000hPa', 'cloud_cover_975hPa', 'cloud_cover_950hPa',
            'cloud_cover_925hPa', 'cloud_cover_900hPa', 'cloud_cover_850hPa',
            'cloud_cover_800hPa', 'cloud_cover_700hPa', 'cloud_cover_600hPa',
            'cloud_cover_500hPa', 'cloud_cover_400hPa', 'cloud_cover_250hPa',
            'cloud_cover_200hPa', 'cloud_cover_150hPa', 'cloud_cover_300hPa',
            'cloud_cover_100hPa', 'cloud_cover_70hPa', 'cloud_cover_50hPa',
            'cloud_cover_30hPa', 'wind_speed_10m', 'wind_speed_80m',
            'wind_gusts_10m', 'wind_direction_10m', 'wind_direction_80m',
            'temperature_1000hPa', 'temperature_975hPa', 'temperature_950hPa',
            'temperature_925hPa', 'temperature_900hPa', 'temperature_850hPa',
            'temperature_800hPa', 'temperature_700hPa', 'temperature_600hPa',
            'temperature_500hPa', 'temperature_400hPa', 'windspeed_1000hPa',
            'windspeed_975hPa', 'windspeed_950hPa', 'windspeed_925hPa',
            'windspeed_900hPa', 'windspeed_850hPa', 'windspeed_800hPa',
            'windspeed_700hPa', 'windspeed_600hPa', 'windspeed_500hPa',
            'windspeed_400hPa', 'winddirection_1000hPa', 'winddirection_975hPa',
            'winddirection_950hPa', 'winddirection_925hPa', 'winddirection_900hPa',
            'winddirection_850hPa', 'winddirection_800hPa', 'winddirection_700hPa',
            'winddirection_600hPa', 'winddirection_500hPa', 'winddirection_400hPa',
            'cape', 'is_day', 'precipitation_probability'
        ],
        
        // ICON-specific full parameters (includes temperature_180m, precipitation, no boundary_layer_height)
        icon_full: [
            'temperature_2m', 'temperature_80m', 'temperature_180m', 'precipitation',
            'weather_code', 'relative_humidity_2m', 'dew_point_2m', 'cloud_cover',
            'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
            'cloud_cover_1000hPa', 'cloud_cover_975hPa', 'cloud_cover_950hPa',
            'cloud_cover_925hPa', 'cloud_cover_900hPa', 'cloud_cover_850hPa',
            'cloud_cover_800hPa', 'cloud_cover_700hPa', 'cloud_cover_600hPa',
            'cloud_cover_500hPa', 'cloud_cover_400hPa', 'cloud_cover_250hPa',
            'cloud_cover_200hPa', 'cloud_cover_150hPa', 'cloud_cover_300hPa',
            'cloud_cover_100hPa', 'cloud_cover_70hPa', 'cloud_cover_50hPa',
            'cloud_cover_30hPa', 'wind_speed_10m', 'wind_speed_80m', 'wind_speed_180m',
            'wind_gusts_10m', 'wind_direction_10m', 'wind_direction_80m',
            'wind_direction_180m', 'temperature_1000hPa', 'temperature_975hPa',
            'temperature_950hPa', 'temperature_925hPa', 'temperature_900hPa',
            'temperature_850hPa', 'temperature_800hPa', 'temperature_700hPa',
            'temperature_600hPa', 'temperature_500hPa', 'temperature_400hPa',
            'windspeed_1000hPa', 'windspeed_975hPa', 'windspeed_950hPa',
            'windspeed_925hPa', 'windspeed_900hPa', 'windspeed_850hPa',
            'windspeed_800hPa', 'windspeed_700hPa', 'windspeed_600hPa',
            'windspeed_500hPa', 'windspeed_400hPa', 'winddirection_1000hPa',
            'winddirection_975hPa', 'winddirection_950hPa', 'winddirection_925hPa',
            'winddirection_900hPa', 'winddirection_850hPa', 'winddirection_800hPa',
            'winddirection_700hPa', 'winddirection_600hPa', 'winddirection_500hPa',
            'winddirection_400hPa', 'cape', 'is_day'
        ]
    };
}

function createFallbackEndpoints(model) {
    const baseEndpoints = {
        gfs: [
            'https://api.open-meteo.com/v1/gfs',
            'https://api.open-meteo.com/v1/forecast' // Fallback to general forecast
        ],
        icon: [
            'https://api.open-meteo.com/v1/dwd-icon',
            'https://api.open-meteo.com/v1/forecast' // Fallback to general forecast
        ],
        openmeteo: [
            'https://api.open-meteo.com/v1/forecast',
            'https://api.open-meteo.com/v1/gfs' // Fallback to GFS
        ]
    };
    
    return baseEndpoints[model.toLowerCase()] || baseEndpoints.gfs;
}

async function tryApiCall(baseUrl, hourlyParams, dailyParams, units, additionalParams, model, attempt = 1) {
    const maxAttempts = 3;
    const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
    const timeout = 30000; // 30 second timeout
    
    try {
        const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${hourlyParams}&daily=${dailyParams}${units}${additionalParams}`;
        console.log(`API Attempt ${attempt}: ${requestUrl}`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        
        // Create the fetch promise
        const fetchPromise = fetch(requestUrl);
        
        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const weatherData = await response.json();
        
        // Validate that we got meaningful data
        if (!weatherData.hourly || !weatherData.hourly.time || weatherData.hourly.time.length === 0) {
            throw new Error('Invalid or empty weather data received');
        }
        
        // Additional validation for required fields
        const requiredFields = ['temperature_2m', 'wind_speed_10m', 'wind_direction_10m'];
        const missingFields = requiredFields.filter(field => !weatherData.hourly[field]);
        
        if (missingFields.length > 0) {
            console.warn(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        console.log(`API call successful on attempt ${attempt}`);
        return weatherData;
        
    } catch (error) {
        console.error(`API attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxAttempts) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return await tryApiCall(baseUrl, hourlyParams, dailyParams, units, additionalParams, model, attempt + 1);
        }
        
        throw error; // Re-throw if all attempts failed
    }
}

async function fetchWeatherDataWithFallback(baseUrl, model) {
    const parameterGroups = createParameterGroups();
    const fallbackEndpoints = createFallbackEndpoints(model);
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ].join(',');
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    // Define parameter sets to try in order of preference
    let parameterSets;
    if (model.toLowerCase() === 'icon') {
        parameterSets = [
            parameterGroups.icon,
            parameterGroups.standard,
            parameterGroups.basic,
            parameterGroups.essential
        ];
    } else {
        parameterSets = [
            parameterGroups.full,
            parameterGroups.standard,
            parameterGroups.basic,
            parameterGroups.essential
        ];
    }
    
    // Try each endpoint
    for (const endpoint of fallbackEndpoints) {
        console.log(`Trying endpoint: ${endpoint}`);
        
        // Try each parameter set
        for (const paramSet of parameterSets) {
            console.log(`Trying parameter set: ${paramSet.length} parameters`);
            
            try {
                const hourlyParams = paramSet.join(',');
                const weatherData = await tryApiCall(endpoint, hourlyParams, dailyParameters, units, additionalParameters, model);
                
                if (weatherData) {
                    console.log(`Successfully fetched data using ${paramSet.length} parameters from ${endpoint}`);
                    return {
                        data: weatherData,
                        endpoint: endpoint,
                        parametersUsed: paramSet.length,
                        fallbackLevel: parameterSets.indexOf(paramSet)
                    };
                }
            } catch (error) {
                console.error(`Failed with parameter set (${paramSet.length} params):`, error.message);
                continue; // Try next parameter set
            }
        }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Failed to fetch weather data for model ${model} after trying all endpoints and parameter combinations`);
}

// Function to handle rate limiting and retry with exponential backoff
async function handleRateLimit(model, retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds
    
    if (retryCount >= maxRetries) {
        throw new Error(`Rate limit exceeded for ${model} after ${maxRetries} retries`);
    }
    
    const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
    console.log(`Rate limit detected for ${model}, waiting ${delay}ms before retry ${retryCount + 1}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryCount + 1;
}

// Function to check if we should use cached data due to API issues
function shouldUseCachedData(model) {
    const lastErrorKey = `lastError_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    const lastErrorStr = localStorage.getItem(lastErrorKey);
    
    if (lastErrorStr) {
        try {
            const lastError = JSON.parse(lastErrorStr);
            const timeSinceError = Date.now() - lastError.timestamp;
            const errorThreshold = 5 * 60 * 1000; // 5 minutes
            
            // If we had an error recently, use cached data even if it's older
            if (timeSinceError < errorThreshold) {
                console.log(`Using cached data for ${model} due to recent API errors`);
                return true;
            }
        } catch (error) {
            console.error('Error parsing last error data:', error);
        }
    }
    
    return false;
}

// Function to record API errors for future reference
function recordApiError(model, error) {
    const lastErrorKey = `lastError_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    const errorData = {
        timestamp: Date.now(),
        error: error.message,
        model: model
    };
    
    localStorage.setItem(lastErrorKey, JSON.stringify(errorData));
    console.error(`API error recorded for ${model}:`, error.message);
}

// ... existing code ...

// Add binary search function to identify problematic variables
async function identifyProblematicVariables(baseUrl, model, allParameters) {
    console.log(`Starting binary search to identify problematic variables for ${model} model`);
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ].join(',');
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    // Test if the full parameter set works
    const fullParamsTest = await testParameterSet(baseUrl, allParameters, dailyParameters, units, additionalParameters, model);
    
    if (fullParamsTest.success) {
        console.log(`Full parameter set works for ${model} - no problematic variables found`);
        return { working: allParameters, problematic: [] };
    }
    
    console.log(`Full parameter set fails for ${model} - starting binary search...`);
    
    // Binary search to find problematic variables
    const problematicVars = await binarySearchProblematicVariables(
        baseUrl, 
        allParameters, 
        dailyParameters, 
        units, 
        additionalParameters, 
        model
    );
    
    // Create working parameter set by removing problematic variables
    const workingParams = allParameters.filter(param => !problematicVars.includes(param));
    
    console.log(`Binary search complete for ${model}:`);
    console.log(`Working parameters: ${workingParams.length}`);
    console.log(`Problematic parameters: ${problematicVars.join(', ')}`);
    
    return { working: workingParams, problematic: problematicVars };
}

async function testParameterSet(baseUrl, parameters, dailyParams, units, additionalParams, model) {
    try {
        const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${parameters.join(',')}&daily=${dailyParams}${units}${additionalParams}`;
        console.log(`Testing parameter set (${parameters.length} params): ${parameters.slice(0, 3).join(',')}...`);
        
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const weatherData = await response.json();
        
        // Basic validation
        if (!weatherData.hourly || !weatherData.hourly.time || weatherData.hourly.time.length === 0) {
            return { success: false, error: 'Invalid response data' };
        }
        
        return { success: true, data: weatherData };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function binarySearchProblematicVariables(baseUrl, allParams, dailyParams, units, additionalParams, model) {
    console.log(`Starting binary search for problematic variables in ${model}`);
    
    const problematicVars = [];
    let remainingParams = [...allParams];
    
    // True binary search - keep halving until we find individual problematic variables
    while (remainingParams.length > 1) {
        const midPoint = Math.ceil(remainingParams.length / 2);
        const firstHalf = remainingParams.slice(0, midPoint);
        const secondHalf = remainingParams.slice(midPoint);
        
        console.log(`Testing first half (${firstHalf.length} params): ${firstHalf.slice(0, 3).join(',')}...`);
        const firstHalfResult = await testParameterSet(baseUrl, firstHalf, dailyParams, units, additionalParams, model);
        
        if (!firstHalfResult.success) {
            console.log(`First half failed: ${firstHalfResult.error}`);
            remainingParams = firstHalf; // Problem is in first half
        } else {
            console.log(`First half passed, testing second half (${secondHalf.length} params): ${secondHalf.slice(0, 3).join(',')}...`);
            const secondHalfResult = await testParameterSet(baseUrl, secondHalf, dailyParams, units, additionalParams, model);
            
            if (!secondHalfResult.success) {
                console.log(`Second half failed: ${secondHalfResult.error}`);
                remainingParams = secondHalf; // Problem is in second half
            } else {
                console.log(`Both halves passed - testing combined`);
                // If both halves work individually but fail together, test combinations
                const combinedResult = await testParameterSet(baseUrl, remainingParams, dailyParams, units, additionalParams, model);
                if (!combinedResult.success) {
                    console.log(`Combined fails but halves work - testing individual params`);
                    // Test each parameter individually
                    for (const param of remainingParams) {
                        const individualResult = await testParameterSet(baseUrl, [param], dailyParams, units, additionalParams, model);
                        if (!individualResult.success) {
                            console.log(`Individual parameter ${param} fails: ${individualResult.error}`);
                            problematicVars.push(param);
                        }
                    }
                    break; // We've tested all individual parameters
                } else {
                    console.log(`Combined works - no problematic variables in this set`);
                    break;
                }
            }
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // If we have exactly one parameter left, test it
    if (remainingParams.length === 1) {
        const lastParam = remainingParams[0];
        console.log(`Testing final parameter: ${lastParam}`);
        const lastResult = await testParameterSet(baseUrl, [lastParam], dailyParams, units, additionalParams, model);
        if (!lastResult.success) {
            console.log(`Final parameter ${lastParam} fails: ${lastResult.error}`);
            problematicVars.push(lastParam);
        }
    }
    
    return problematicVars;
}

async function testIndividualParameters(baseUrl, paramGroup, dailyParams, units, additionalParams, model) {
    const problematic = [];
    
    // Test each parameter individually
    for (const param of paramGroup) {
        console.log(`Testing individual parameter: ${param}`);
        
        const testResult = await testParameterSet(baseUrl, [param], dailyParams, units, additionalParams, model);
        
        if (!testResult.success) {
            console.log(`Parameter ${param} is problematic: ${testResult.error}`);
            problematic.push(param);
        } else {
            console.log(`Parameter ${param} works`);
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return problematic;
}

// Function to create optimized parameter sets based on problematic variable detection
async function createOptimizedParameterSets(baseUrl, model) {
    console.log(`Creating optimized parameter sets for ${model}`);
    
    // Get the model-specific parameter sets
    const parameterGroups = createParameterGroups();
    let fullParams, basicParams, standardParams;
    
    if (model.toLowerCase() === 'icon') {
        fullParams = parameterGroups.icon_full;
        basicParams = parameterGroups.icon_basic;
        standardParams = parameterGroups.icon_standard;
    } else {
        // Default to GFS for gfs, openmeteo, and any other models
        fullParams = parameterGroups.gfs_full;
        basicParams = parameterGroups.gfs_basic;
        standardParams = parameterGroups.gfs_standard;
    }
    
    // Identify problematic variables
    const result = await identifyProblematicVariables(baseUrl, model, fullParams);
    
    // Create optimized parameter sets
    const optimizedSets = {
        essential: parameterGroups.essential.filter(param => !result.problematic.includes(param)),
        basic: basicParams.filter(param => !result.problematic.includes(param)),
        standard: standardParams.filter(param => !result.problematic.includes(param)),
        full: result.working
    };
    
    // Add model-specific full set
    if (model.toLowerCase() === 'icon') {
        optimizedSets.icon_full = parameterGroups.icon_full.filter(param => !result.problematic.includes(param));
    } else {
        optimizedSets.gfs_full = parameterGroups.gfs_full.filter(param => !result.problematic.includes(param));
    }
    
    console.log(`Optimized parameter sets created for ${model}:`);
    Object.keys(optimizedSets).forEach(setName => {
        console.log(`${setName}: ${optimizedSets[setName].length} parameters`);
    });
    
    return optimizedSets;
}

// Update the fetchWeatherDataWithFallback function to trigger comprehensive testing on API failure
async function fetchWeatherDataWithFallback(baseUrl, model) {
    console.log(`Fetching weather data with fallback for ${model}`);
    
    const parameterGroups = createParameterGroups();
    const fallbackEndpoints = createFallbackEndpoints(model);
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ].join(',');
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    // Get the full parameter set for this model
    let fullParams;
    if (model.toLowerCase() === 'icon') {
        fullParams = parameterGroups.icon_full;
    } else {
        fullParams = parameterGroups.gfs_full;
    }
    
    // Try the full parameter set first
    try {
        const hourlyParams = fullParams.join(',');
        const weatherData = await tryApiCall(baseUrl, hourlyParams, dailyParameters, units, additionalParameters, model);
        
        if (weatherData) {
            console.log(`Successfully fetched data using full parameter set from ${baseUrl}`);
            return {
                data: weatherData,
                endpoint: baseUrl,
                parametersUsed: fullParams.length,
                fallbackLevel: 0
            };
        }
    } catch (error) {
        console.error(`Full parameter set failed for ${model}:`, error.message);
        
        // API failed - trigger comprehensive testing to identify problematic variables
        console.log(`API failed for ${model} - starting comprehensive parameter testing...`);
        
        try {
            const comprehensiveResults = await testAllParametersIndividually(baseUrl, model);
            
            // Cache the problematic variables
            cacheProblematicVariables(model, comprehensiveResults.failing);
            
            // Create working parameter set by removing problematic variables
            const workingParams = fullParams.filter(param => !comprehensiveResults.failing.includes(param));
            
            // Try again with working parameters
            if (workingParams.length > 0) {
                const hourlyParams = workingParams.join(',');
                const weatherData = await tryApiCall(baseUrl, hourlyParams, dailyParameters, units, additionalParameters, model);
                
                if (weatherData) {
                    console.log(`Successfully fetched data using ${workingParams.length} working parameters after comprehensive testing`);
                    return {
                        data: weatherData,
                        endpoint: baseUrl,
                        parametersUsed: workingParams.length,
                        fallbackLevel: 1
                    };
                }
            }
        } catch (comprehensiveError) {
            console.error(`Comprehensive testing failed for ${model}:`, comprehensiveError.message);
        }
        
        // If comprehensive testing also fails, throw the original error to trigger fallback endpoints
        throw error;
    }
    
    // Try fallback endpoints with essential parameters
    const essentialParams = parameterGroups.essential;
    
    for (const endpoint of fallbackEndpoints) {
        if (endpoint === baseUrl) continue; // Skip the original endpoint
        
        console.log(`Trying fallback endpoint: ${endpoint}`);
        
        try {
            const hourlyParams = essentialParams.join(',');
            const weatherData = await tryApiCall(endpoint, hourlyParams, dailyParameters, units, additionalParameters, model);
            
            if (weatherData) {
                console.log(`Successfully fetched data using essential parameters from ${endpoint}`);
                return {
                    data: weatherData,
                    endpoint: endpoint,
                    parametersUsed: essentialParams.length,
                    fallbackLevel: 2
                };
            }
        } catch (error) {
            console.error(`Failed with fallback endpoint ${endpoint}:`, error.message);
            continue;
        }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Failed to fetch weather data for model ${model} after trying all endpoints and parameter combinations`);
}

// ... existing code ...

// Add caching for problematic variable detection
function getCachedProblematicVariables(model) {
    // Check if we should bypass cache detection
    if (window.bypassCacheDetection) {
        console.log(`Bypassing cached problematic variables for ${model} - doing fresh detection`);
        window.bypassCacheDetection = false; // Reset the flag
        return null;
    }
    
    const cacheKey = `problematicVars_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const data = JSON.parse(cached);
            const cacheAge = Date.now() - data.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (cacheAge < maxAge) {
                // Validate that the cached data is reasonable
                if (Array.isArray(data.problematic) && data.problematic.length < 50) {
                    console.log(`Using cached problematic variables for ${model}: ${data.problematic.length} variables`);
                    return data.problematic;
                } else {
                    console.warn(`Cached problematic variables for ${model} seem corrupted (${data.problematic?.length || 'undefined'} variables), clearing cache`);
                    localStorage.removeItem(cacheKey);
                    return null;
                }
            }
        } catch (error) {
            console.error('Error parsing cached problematic variables:', error);
            localStorage.removeItem(cacheKey); // Clear corrupted cache
        }
    }
    
    return null;
}

function cacheProblematicVariables(model, problematicVars) {
    const cacheKey = `problematicVars_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    const cacheData = {
        timestamp: Date.now(),
        problematic: problematicVars,
        model: model
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached problematic variables for ${model}: ${problematicVars.join(', ')}`);
}

// Manual testing function for debugging specific variables
async function testSpecificVariable(baseUrl, model, variable) {
    console.log(`Manually testing variable: ${variable} for ${model} model`);
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ].join(',');
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    const testResult = await testParameterSet(baseUrl, [variable], dailyParameters, units, additionalParameters, model);
    
    if (testResult.success) {
        console.log(`✅ Variable ${variable} works for ${model}`);
        return true;
    } else {
        console.log(`❌ Variable ${variable} fails for ${model}: ${testResult.error}`);
        return false;
    }
}

// Function to test a group of variables
async function testVariableGroup(baseUrl, model, variables) {
    console.log(`Testing variable group for ${model}: ${variables.join(', ')}`);
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ].join(',');
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    const testResult = await testParameterSet(baseUrl, variables, dailyParameters, units, additionalParameters, model);
    
    if (testResult.success) {
        console.log(`✅ Variable group works for ${model}`);
        return true;
    } else {
        console.log(`❌ Variable group fails for ${model}: ${testResult.error}`);
        return false;
    }
}

// Update the identifyProblematicVariables function to use caching
async function identifyProblematicVariables(baseUrl, model, allParameters) {
    console.log(`Starting binary search to identify problematic variables for ${model} model`);
    
    // Check cache first
    const cachedProblematic = getCachedProblematicVariables(model);
    if (cachedProblematic !== null) {
        console.log(`Using cached problematic variables for ${model}: ${cachedProblematic.join(', ')}`);
        const workingParams = allParameters.filter(param => !cachedProblematic.includes(param));
        return { working: workingParams, problematic: cachedProblematic };
    }
    
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ];
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    // Test if the full parameter set works
    const fullParamsTest = await testParameterSet(baseUrl, allParameters, dailyParameters.join(','), units, additionalParameters, model);
    
    if (fullParamsTest.success) {
        console.log(`Full parameter set works for ${model} - no problematic variables found`);
        cacheProblematicVariables(model, []);
        return { working: allParameters, problematic: [] };
    }
    
    console.log(`Full parameter set fails for ${model} - starting binary search...`);
    
    // First, test daily parameters separately
    console.log(`Testing daily parameters for ${model}...`);
    const dailyProblematic = await testDailyParameters(baseUrl, dailyParameters, units, additionalParameters, model);
    
    // Binary search to find problematic hourly variables
    const hourlyProblematic = await binarySearchProblematicVariables(
        baseUrl, 
        allParameters, 
        dailyParameters.join(','), 
        units, 
        additionalParameters, 
        model
    );
    
    // Combine problematic variables
    const allProblematic = [...hourlyProblematic, ...dailyProblematic];
    
    // Cache the results
    cacheProblematicVariables(model, allProblematic);
    
    // Create working parameter set by removing problematic variables
    const workingParams = allParameters.filter(param => !allProblematic.includes(param));
    
    console.log(`Binary search complete for ${model}:`);
    console.log(`Working hourly parameters: ${workingParams.length}`);
    console.log(`Problematic hourly parameters: ${hourlyProblematic.join(', ')}`);
    console.log(`Problematic daily parameters: ${dailyProblematic.join(', ')}`);
    
    return { working: workingParams, problematic: allProblematic };
}

async function testDailyParameters(baseUrl, dailyParams, units, additionalParams, model) {
    const problematic = [];
    
    // Test each daily parameter individually
    for (const param of dailyParams) {
        console.log(`Testing daily parameter: ${param}`);
        
        try {
            const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&daily=${param}${units}${additionalParams}`;
            const response = await fetch(requestUrl);
            
            if (!response.ok) {
                console.log(`Daily parameter ${param} fails: HTTP ${response.status}`);
                problematic.push(param);
            } else {
                const data = await response.json();
                if (!data.daily || !data.daily[param]) {
                    console.log(`Daily parameter ${param} fails: missing data`);
                    problematic.push(param);
                } else {
                    console.log(`Daily parameter ${param} works`);
                }
            }
        } catch (error) {
            console.log(`Daily parameter ${param} fails: ${error.message}`);
            problematic.push(param);
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return problematic;
}

// Add global functions for manual testing (accessible from browser console)
window.testWeatherVariable = testSpecificVariable;
window.testWeatherVariableGroup = testVariableGroup;
window.clearProblematicVariableCache = function(model) {
    const cacheKey = `problematicVars_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(cacheKey);
    console.log(`Cleared problematic variable cache for ${model}`);
};

// Function to force fresh problematic variable detection
window.forceFreshDetection = function(model) {
    console.log(`Forcing fresh problematic variable detection for ${model}`);
    
    // Clear the cache
    clearProblematicVariableCache(model);
    
    // Clear any error cache
    const errorCacheKey = `lastError_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(errorCacheKey);
    
    // Clear the API call cache to force fresh data
    const apiCacheKey = `lastApiCall_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(apiCacheKey);
    
    console.log(`All caches cleared for ${model}. Next fetch will perform fresh detection.`);
    
    // Trigger a new fetch
    fetchAllModelsData();
};

// Special function to test wind-related variables for GFS debugging
window.testGFSWindVariables = async function() {
    console.log('Testing GFS wind variables specifically...');
    
    const baseUrl = 'https://api.open-meteo.com/v1/gfs';
    const model = 'gfs';
    
    const windVariables = [
        'wind_speed_10m',
        'wind_speed_80m', 
        'wind_speed_180m',
        'wind_direction_10m',
        'wind_direction_80m',
        'wind_direction_180m',
        'wind_gusts_10m',
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
        'winddirection_400hPa'
    ];
    
    const results = {};
    
    for (const variable of windVariables) {
        console.log(`Testing ${variable}...`);
        const result = await testSpecificVariable(baseUrl, model, variable);
        results[variable] = result;
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('GFS Wind Variable Test Results:');
    console.table(results);
    
    const working = Object.keys(results).filter(v => results[v]);
    const failing = Object.keys(results).filter(v => !results[v]);
    
    console.log(`✅ Working wind variables: ${working.join(', ')}`);
    console.log(`❌ Failing wind variables: ${failing.join(', ')}`);
    
    return { working, failing, results };
};

// Function to test the specific problematic variables mentioned
window.testKnownProblematicVariables = async function() {
    console.log('Testing known problematic variables for GFS...');
    
    const baseUrl = 'https://api.open-meteo.com/v1/gfs';
    const model = 'gfs';
    
    const knownProblematic = [
        'wind_speed_10m',
        'wind_direction_10m',
        'apparent_temperature_max',
        'apparent_temperature_min'
    ];
    
    const results = {};
    
    for (const variable of knownProblematic) {
        console.log(`Testing known problematic variable: ${variable}...`);
        const result = await testSpecificVariable(baseUrl, model, variable);
        results[variable] = result;
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('Known Problematic Variable Test Results:');
    console.table(results);
    
    const working = Object.keys(results).filter(v => results[v]);
    const failing = Object.keys(results).filter(v => !results[v]);
    
    console.log(`✅ Working variables: ${working.join(', ')}`);
    console.log(`❌ Failing variables: ${failing.join(', ')}`);
    
    return { working, failing, results };
};

// Function to test daily parameters specifically
window.testDailyParameters = async function() {
    console.log('Testing daily parameters for GFS...');
    
    const baseUrl = 'https://api.open-meteo.com/v1/gfs';
    const model = 'gfs';
    
    const dailyParams = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ];
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    const forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    const additionalParams = `&forecast_days=${forecastDays}`;
    
    const results = {};
    
    for (const param of dailyParams) {
        console.log(`Testing daily parameter: ${param}`);
        
        try {
            const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&daily=${param}${units}${additionalParams}`;
            const response = await fetch(requestUrl);
            
            if (!response.ok) {
                console.log(`Daily parameter ${param} fails: HTTP ${response.status}`);
                results[param] = false;
            } else {
                const data = await response.json();
                if (!data.daily || !data.daily[param]) {
                    console.log(`Daily parameter ${param} fails: missing data`);
                    results[param] = false;
                } else {
                    console.log(`Daily parameter ${param} works`);
                    results[param] = true;
                }
            }
        } catch (error) {
            console.log(`Daily parameter ${param} fails: ${error.message}`);
            results[param] = false;
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('Daily Parameter Test Results:');
    console.table(results);
    
    const working = Object.keys(results).filter(v => results[v]);
    const failing = Object.keys(results).filter(v => !results[v]);
    
    console.log(`✅ Working daily parameters: ${working.join(', ')}`);
    console.log(`❌ Failing daily parameters: ${failing.join(', ')}`);
    
    return { working, failing, results };
};

// Function to clear all caches and force fresh detection
window.clearAllCachesAndDetect = function(model) {
    console.log(`Clearing all caches and forcing fresh problematic variable detection for ${model}`);
    
    // Clear problematic variables cache
    clearProblematicVariableCache(model);
    
    // Clear error cache
    const errorCacheKey = `lastError_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(errorCacheKey);
    
    // Clear API call cache to force fresh data
    const apiCacheKey = `lastApiCall_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(apiCacheKey);
    
    console.log(`All caches cleared for ${model}. Starting fresh detection...`);
    
    // Force the system to bypass cache and do fresh detection
    window.bypassCacheDetection = true;
    
    // Trigger a new fetch
    fetchAllModelsData();
};

// Function to test half of the parameters at a time
window.testParameterHalf = async function(baseUrl, model, allParameters) {
    console.log(`Testing parameter halves for ${model}...`);
    
    const midPoint = Math.ceil(allParameters.length / 2);
    const firstHalf = allParameters.slice(0, midPoint);
    const secondHalf = allParameters.slice(midPoint);
    
    console.log(`First half (${firstHalf.length} params): ${firstHalf.slice(0, 3).join(',')}...`);
    console.log(`Second half (${secondHalf.length} params): ${secondHalf.slice(0, 3).join(',')}...`);
    
    const firstHalfResult = await testVariableGroup(baseUrl, model, firstHalf);
    const secondHalfResult = await testVariableGroup(baseUrl, model, secondHalf);
    
    console.log(`First half result: ${firstHalfResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Second half result: ${secondHalfResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (firstHalfResult && !secondHalfResult) {
        console.log('Problem is in the second half of parameters');
        return { problematicHalf: 'second', params: secondHalf };
    } else if (!firstHalfResult && secondHalfResult) {
        console.log('Problem is in the first half of parameters');
        return { problematicHalf: 'first', params: firstHalf };
    } else if (!firstHalfResult && !secondHalfResult) {
        console.log('Both halves have problems - testing smaller groups');
        return { problematicHalf: 'both', params: allParameters };
    } else {
        console.log('Both halves work - testing individual parameters');
        return { problematicHalf: 'none', params: [] };
    }
};

// ... existing code ...

// Add comprehensive one-by-one parameter testing system
async function testAllParametersIndividually(baseUrl, model) {
    console.log(`Starting comprehensive parameter testing for ${model}`);
    
    // Check if we already have comprehensive test results
    const comprehensiveCacheKey = `comprehensiveTest_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    const cachedComprehensive = localStorage.getItem(comprehensiveCacheKey);
    
    if (cachedComprehensive) {
        try {
            const data = JSON.parse(cachedComprehensive);
            const cacheAge = Date.now() - data.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (cacheAge < maxAge) {
                console.log(`Using cached comprehensive test results for ${model}`);
                return data.results;
            }
        } catch (error) {
            console.error('Error parsing cached comprehensive test results:', error);
        }
    }
    
    // Get all possible parameters for this model
    const hourlyParameters = getAllPossibleParameters(model);
    const dailyParameters = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'apparent_temperature_max', 'apparent_temperature_min',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'
    ];
    
    // Combine all parameters to test
    const allParameters = [...hourlyParameters, ...dailyParameters];
    
    // Create progress UI
    const progressContainer = createProgressUI(model, allParameters.length);
    
    const results = {
        working: [],
        failing: [],
        details: {}
    };
    
    const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
    
    // Determine forecast days based on model
    let forecastDays = 7; // Default
    if (model.toLowerCase() === 'openmeteo' || model.toLowerCase() === 'gfs') {
        forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14);
    } else if (model.toLowerCase() === 'icon') {
        forecastDays = getCookieValueOrDefault('iconLength', 7);
    }
    
    const additionalParameters = `&forecast_days=${forecastDays}`;
    
    // Test each parameter individually (both hourly and daily)
    for (let i = 0; i < allParameters.length; i++) {
        const param = allParameters[i];
        
        // Update progress
        updateProgress(progressContainer, i + 1, allParameters.length, param);
        
        console.log(`Testing parameter ${i + 1}/${allParameters.length}: ${param}`);
        
        try {
            // Determine if this is a daily or hourly parameter
            const isDailyParam = dailyParameters.includes(param);
            
            if (isDailyParam) {
                // Test daily parameter individually (no hourly parameters)
                const testResult = await testDailyParameterIndividually(baseUrl, param, units, additionalParameters, model);
                
                if (testResult.success) {
                    results.working.push(param);
                    results.details[param] = { status: 'working', error: null, type: 'daily' };
                    console.log(`✅ Daily parameter ${param} works`);
                } else {
                    results.failing.push(param);
                    results.details[param] = { status: 'failing', error: testResult.error, type: 'daily' };
                    console.log(`❌ Daily parameter ${param} fails: ${testResult.error}`);
                }
            } else {
                // Test hourly parameter individually (no daily parameters)
                const testResult = await testHourlyParameterIndividually(baseUrl, param, units, additionalParameters, model);
                
                if (testResult.success) {
                    results.working.push(param);
                    results.details[param] = { status: 'working', error: null, type: 'hourly' };
                    console.log(`✅ Hourly parameter ${param} works`);
                } else {
                    results.failing.push(param);
                    results.details[param] = { status: 'failing', error: testResult.error, type: 'hourly' };
                    console.log(`❌ Hourly parameter ${param} fails: ${testResult.error}`);
                }
            }
        } catch (error) {
            results.failing.push(param);
            results.details[param] = { status: 'failing', error: error.message, type: 'unknown' };
            console.log(`❌ ${param} fails: ${error.message}`);
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Cache the comprehensive results
    const cacheData = {
        timestamp: Date.now(),
        results: results,
        model: model
    };
    localStorage.setItem(comprehensiveCacheKey, JSON.stringify(cacheData));
    
    // Show final results
    showComprehensiveResults(progressContainer, results, model);
    
    console.log(`Comprehensive parameter testing complete for ${model}:`);
    console.log(`Working: ${results.working.length} parameters`);
    console.log(`Failing: ${results.failing.length} parameters`);
    
    return results;
}

// Test a single hourly parameter individually (no daily parameters)
async function testHourlyParameterIndividually(baseUrl, parameter, units, additionalParams, model) {
    try {
        const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${parameter}${units}${additionalParams}`;
        console.log(`Testing hourly parameter individually: ${parameter}`);
        console.log(`URL: ${requestUrl}`);
        
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const weatherData = await response.json();
        
        // Basic validation
        if (!weatherData.hourly || !weatherData.hourly.time || weatherData.hourly.time.length === 0) {
            return { success: false, error: 'Invalid response data' };
        }
        
        // Check if the specific parameter exists in the response
        if (!weatherData.hourly[parameter]) {
            return { success: false, error: 'Parameter not found in response' };
        }
        
        return { success: true, data: weatherData };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test a single daily parameter individually (no hourly parameters)
async function testDailyParameterIndividually(baseUrl, parameter, units, additionalParams, model) {
    try {
        const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&daily=${parameter}${units}${additionalParams}`;
        console.log(`Testing daily parameter individually: ${parameter}`);
        console.log(`URL: ${requestUrl}`);
        
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const weatherData = await response.json();
        
        // Basic validation
        if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
            return { success: false, error: 'Invalid response data' };
        }
        
        // Check if the specific parameter exists in the response
        if (!weatherData.daily[parameter]) {
            return { success: false, error: 'Parameter not found in response' };
        }
        
        return { success: true, data: weatherData };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getAllPossibleParameters(model) {
    // Get all possible parameters for the model
    const parameterGroups = createParameterGroups();
    
    if (model.toLowerCase() === 'icon') {
        return parameterGroups.icon_full;
    } else {
        return parameterGroups.gfs_full;
    }
}

function createProgressUI(model, totalParameters) {
    // Remove any existing progress UI
    const existingProgress = document.getElementById('parameter-test-progress');
    if (existingProgress) {
        existingProgress.remove();
    }
    
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.id = 'parameter-test-progress';
    progressContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #007bff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 400px;
        max-width: 600px;
    `;
    
    progressContainer.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #007bff;">Testing ${model.toUpperCase()} Parameters</h3>
        <p style="margin: 0 0 10px 0; color: #666;">Testing all parameters individually...</p>
        <div style="background: #f0f0f0; border-radius: 5px; height: 20px; margin: 10px 0;">
            <div id="progress-bar" style="background: #007bff; height: 100%; border-radius: 5px; width: 0%; transition: width 0.3s;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span id="progress-text">0 / ${totalParameters}</span>
            <span id="progress-percentage">0%</span>
        </div>
        <p id="current-parameter" style="margin: 10px 0 0 0; font-weight: bold; color: #333;">Starting...</p>
    `;
    
    document.body.appendChild(progressContainer);
    return progressContainer;
}

function updateProgress(container, current, total, currentParameter) {
    const progressBar = container.querySelector('#progress-bar');
    const progressText = container.querySelector('#progress-text');
    const progressPercentage = container.querySelector('#progress-percentage');
    const currentParamElement = container.querySelector('#current-parameter');
    
    const percentage = Math.round((current / total) * 100);
    
    progressBar.style.width = percentage + '%';
    progressText.textContent = `${current} / ${total}`;
    progressPercentage.textContent = percentage + '%';
    currentParamElement.textContent = `Testing: ${currentParameter}`;
}

function showComprehensiveResults(container, results, model) {
    container.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #28a745;">${model.toUpperCase()} Parameter Test Complete</h3>
        <div style="margin: 10px 0;">
            <p style="margin: 5px 0; color: #28a745;">✅ Working: ${results.working.length} parameters</p>
            <p style="margin: 5px 0; color: #dc3545;">❌ Failing: ${results.failing.length} parameters</p>
        </div>
        <div style="max-height: 200px; overflow-y: auto; margin: 10px 0;">
            <h4 style="margin: 10px 0 5px 0; color: #28a745;">Working Parameters:</h4>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">${results.working.join(', ')}</p>
            <h4 style="margin: 10px 0 5px 0; color: #dc3545;">Failing Parameters:</h4>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">${results.failing.join(', ')}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Close</button>
    `;
}

// Update the identifyProblematicVariables function to only test when API fails
async function identifyProblematicVariables(baseUrl, model, allParameters) {
    console.log(`Checking for problematic variables for ${model} model`);
    
    // Check if we should bypass cache detection
    if (window.bypassCacheDetection) {
        console.log(`Bypassing cached problematic variables for ${model} - doing fresh detection`);
        window.bypassCacheDetection = false; // Reset the flag
    } else {
        // Check cache first
        const cachedProblematic = getCachedProblematicVariables(model);
        if (cachedProblematic !== null) {
            console.log(`Using cached problematic variables for ${model}: ${cachedProblematic.length} variables`);
            const workingParams = allParameters.filter(param => !cachedProblematic.includes(param));
            return { working: workingParams, problematic: cachedProblematic };
        }
    }
    
    // Only perform comprehensive testing if explicitly requested or no cache exists
    // This will be called from fetchWeatherDataWithFallback when an API error occurs
    console.log(`No cached problematic variables found for ${model} - will test when API fails`);
    return { working: allParameters, problematic: [] };
}

// Add global function to manually trigger comprehensive testing
window.runComprehensiveParameterTest = async function(model) {
    console.log(`Manually triggering comprehensive parameter test for ${model}`);
    
    // Clear any existing cache
    clearProblematicVariableCache(model);
    
    // Clear comprehensive test cache
    const comprehensiveCacheKey = `comprehensiveTest_${model}_${userLocation.latitude}_${userLocation.longitude}`;
    localStorage.removeItem(comprehensiveCacheKey);
    
    // Run the test
    const baseUrl = model.toLowerCase() === 'icon' ? 'https://api.open-meteo.com/v1/dwd-icon' : 'https://api.open-meteo.com/v1/gfs';
    const results = await testAllParametersIndividually(baseUrl, model);
    
    return results;
};

// ... existing code ...