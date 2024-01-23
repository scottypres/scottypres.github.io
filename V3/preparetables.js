window.prepareTables = () => {
  // Your code for preparing tables
console.log('preparetables');
  
  // Extract the wind speed data and timestamps for ICON and GFS models
  const iconData = iconWeatherData.hourly;
  const gfsData = gfsWeatherData.hourly;

  // Identifying the altitude parameters for ICON and GFS by filtering the keys
  // that contain 'windspeed' and 'wind_speed' respectively.
  const iconAltitudes = Object.keys(iconData).filter(key => key.startsWith('windspeed_'));
  const gfsAltitudes = Object.keys(gfsData).filter(key => key.startsWith('wind_speed_'));

  // Preparing tables for ICON and GFS wind speed data using the altitudes and timestamps
  const iconTable = prepareDataTable(iconData, iconAltitudes, 'icon');
  const gfsTable = prepareDataTable(gfsData, gfsAltitudes, 'gfs');

  return { iconTable, gfsTable };
}

// Convert the wind speed data for each altitude and timestamp into a format suitable for DataTables
function prepareDataTable(data, altitudes, modelId) {
  const timestamps = data.time;
  let tableData = {
    columns: [{ title: 'Timestamp' }], // Start with a single Timestamp column
    data: []
  };

  // Create column headers based on the altitude markers, and push them into the tableData
  altitudes.forEach(altitude => {
    const friendlyAltitudeName = altitude.replace('_', ' ').toUpperCase();
    tableData.columns.push({ title: friendlyAltitudeName });
  });

  // Create the table data by looping over each timestamp and collecting the wind speed for each altitude
  timestamps.forEach((timestamp, timestampIndex) => {
    let row = [timestamp]; // First column is the timestamp
    altitudes.forEach(altitude => {
      row.push(data[altitude][timestampIndex]);
    });
    tableData.data.push(row); // Add the row to the table data
  });

  // Attaching the prepared data to the corresponding HTML table element by modelId
  $(`#${modelId}WindSpeedTable`).dataTable(tableData);

  return tableData;
}

// Call the function to prepare the tables when this script is loaded
const { iconTable, gfsTable } = prepareTables();

// Expose the generated table data for use by other scripts (e.g., displaytable.js)
window.iconTableData = iconTable;
window.gfsTableData = gfsTable;