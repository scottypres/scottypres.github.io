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
        const daily = [
            'weather_code',
            'sunrise',
            'sunset',
            'uv_index_max',
            'precipitation_sum'
        ].join(',');

        const units = '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';
        let additionalParameters = ''; // Initialize additional parameters string

        model =='gfs';
        // Check the model to determine the correct forecast_days parameter
      
        const forecastDays = getCookieValueOrDefault('gfsOpenMeteoLength', 14); // Default to max 14
        additionalParameters += `&forecast_days=${forecastDays}`;
       
          
        // Fetch new data if necessary
        
    //console.log('fetching new data');
            
            
                // For GFS model, test parameters and handle missing wind data
                if (model.toLowerCase() === 'gfs') {
                    commonParameters = await getGFSParametersWithFallback(baseUrl, lat, lon, units, additionalParameters);
                } else if (model.toLowerCase() === 'icon') {
                    // ICON model has different parameters
                    commonParameters = [
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
                        // Add new variables below
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
                } else {
                    // For other models (like openmeteo), use full parameters
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
                        // Add new variables below
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
                }
        

/////WE DID IT!


        
        // For GFS model, the API call might have already been made in getGFSParametersWithFallback
        let weatherData;
        if (model.toLowerCase() === 'gfs') {
            // The weatherData should already be available from the parameter testing
            const requestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${commonParameters}&daily=${daily}&current_weather=true${units}${additionalParameters}`;
            console.log(requestUrl);
            try {
                const response = await fetch(requestUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                weatherData = await response.json();
                
                // Add placeholder data for missing 10m wind parameters if they don't exist
                if (!weatherData.hourly.wind_speed_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_speed_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_direction_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_direction_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_gusts_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_gusts_10m = new Array(timeLength).fill(null);
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${name} using model ${model}`, error);
                return;
            }
        } else {
            const requestUrl = `${baseUrl}?latitude=${lat}&longitude=${lon}&hourly=${commonParameters}&daily=${daily}&current_weather=true${units}${additionalParameters}`;
            console.log(requestUrl);
            try {
                const response = await fetch(requestUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                weatherData = await response.json();
                
                // Add placeholder data for missing parameters in ICON model
                if (model.toLowerCase() === 'icon') {
                    const timeLength = weatherData.hourly.time.length;
                    
                    // Add missing parameters that ICON doesn't support
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
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${name} using model ${model}`, error);
                return;
            }
        }
        
        allTableWeatherData[tableId] = weatherData;
        console.log('ALLTABLEWEATHERDATA CHECKANDFETCH: ', allTableWeatherData)

        if(tableElement instanceof HTMLTableElement) {
            // Passed an actual table element, we want to retrieve its ID
            createAllTables(tableElement.id, allTableWeatherData[tableId], name, tableElement);
        } else {
            // If it's not an HTMLTableElement, it's expected to be an ID string
            createAllTables(tableId, allTableWeatherData[tableId], name, tableElement);
        }
        console.log(`Data fetched and table created for ${name} using model: ${model}`);
    } catch (error) {
        console.error(`Failed to fetch data for ${name} using model ${model}`, error);
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
                console.log('GFS API missing 10m wind data, adding placeholder data');
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
            
            return fullParameters;
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.log('GFS API call failed with 10m wind parameters, trying without them');
        
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
                console.log('GFS API call succeeded without 10m wind parameters, adding placeholder data');
                
                // Add placeholder data for missing 10m wind parameters
                const timeLength = weatherData.hourly.time.length;
                weatherData.hourly.wind_speed_10m = new Array(timeLength).fill(null);
                weatherData.hourly.wind_direction_10m = new Array(timeLength).fill(null);
                weatherData.hourly.wind_gusts_10m = new Array(timeLength).fill(null);
                
                return fallbackParameters;
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
    console.log("checkAndFetchData");
    // ////console.log(`checkAndFetchData called for model ${model}`, new Date().toISOString());
    console.log("check and fetch data");
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
    console.log(lastApiCallKey);
    
    //#####

    const now = Date.now();
    const cacheDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
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
console.log('should fetch data: ',shouldFetchData)
    // Fetch new data if necessary
    if (shouldFetchData) {
//console.log('fetching new data');
        
        if (model.toLowerCase() === 'gfs' || model.toLowerCase() === 'openmeteo') {
            // For GFS model, test parameters and handle missing wind data
            if (model.toLowerCase() === 'gfs') {
                commonParameters = await getGFSParametersWithFallback(baseUrl, userLocation.latitude, userLocation.longitude, units, additionalParameters);
            } else {
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
                    // Add new variables below
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
            }
        }
if (model.toLowerCase() === 'icon') {
            commonParameters = [
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
                // Add new variables below
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
        }




        // For GFS model, the API call might have already been made in getGFSParametersWithFallback
        let weatherData;
        if (model.toLowerCase() === 'gfs') {
            const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${commonParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
            console.log(requestUrl);
            try {
                console.log("REQUEST");
                console.log(requestUrl);
                const response = await fetch(requestUrl);

                // If the response is not okay, throw an error
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse the response as JSON
                weatherData = await response.json();
                
                // Add placeholder data for missing 10m wind parameters if they don't exist
                if (!weatherData.hourly.wind_speed_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_speed_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_direction_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_direction_10m = new Array(timeLength).fill(null);
                }
                if (!weatherData.hourly.wind_gusts_10m) {
                    const timeLength = weatherData.hourly.time.length;
                    weatherData.hourly.wind_gusts_10m = new Array(timeLength).fill(null);
                }
            } catch (error) {
                console.error(`Failed to fetch data for model ${model}`, error);
                return;
            }
        } else {
            const requestUrl = `${baseUrl}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=${commonParameters}&daily=${dailyParameters}${units}${additionalParameters}`;
            console.log(requestUrl);
            try {
                console.log("REQUEST");
                console.log(requestUrl);
                const response = await fetch(requestUrl);

                // If the response is not okay, throw an error
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse the response as JSON
                weatherData = await response.json();
                
                // Add placeholder data for missing parameters in ICON model
                if (model.toLowerCase() === 'icon') {
                    const timeLength = weatherData.hourly.time.length;
                    
                    // Add missing parameters that ICON doesn't support
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
                }
            } catch (error) {
                console.error(`Failed to fetch data for model ${model}`, error);
                return;
            }
        }

        try {
            // Cache the new API data
            localStorage.setItem(lastApiCallKey, JSON.stringify({
                timestamp: now,
                data: weatherData,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                cityName: $('#cityName').text() // Store the current city name as well
            }));

            // Populate the respective table with the fetched data
            createTable(`${model.toLowerCase()}-table`, weatherData, model);

            // Store the fetched data globally
            globalWeatherData[model] = weatherData;

            ////console.log(`Data fetched successfully for model ${model}`);
        } catch (error) {
            // Log the error if fetching the data fails
            console.error(`Failed to fetch data for model ${model}`, error);
            // Optionally, handle the error in the UI
        }
    }

    // ////console.log(`checkAndFetchData finished for model ${model}`, new Date().toISOString());
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

    // Safety check: ensure table has at least one row
    const existingRows = table.getElementsByTagName('tr');
    if (existingRows.length === 0) {
        console.error(`Table ${table.id} has no rows, cannot fill with wind speed data`);
        return;
    }

    let tableHtml = '<tr>' + existingRows[0].innerHTML + '</tr>';
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