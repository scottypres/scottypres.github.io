

function displayTable(tableData, tableElementId) {
  // Check if DataTables is already initialized for the given tableElementId
  // to prevent re-initializing it on subsequent calls.
  if (!$.fn.DataTable.isDataTable(`#${tableElementId}`)) {
    // Initialize DataTables for the table element using the provided data
    $(`#${tableElementId}`).DataTable({
      data: tableData.data,
      columns: tableData.columns,
      // Additional DataTables configuration options can go here
    });
  }
}
window.displayTables = () => {
  // Assuming you have prepared the data with keys `iconTableData` and `gfsTableData`
  // and these are objects compatible with DataTables initialization.
  displayTable(window.iconTableData, 'iconWindSpeedTable');
  displayTable(window.gfsTableData, 'gfsWindSpeedTable');
}
// Call the displayTable function with the generated table data from preparetables.js
// This is using the global variables set in preparetables.js
