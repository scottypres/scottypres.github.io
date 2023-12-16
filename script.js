document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = 'https://api.locationiq.com/v1/autocomplete.php';
    let searchBox = document.getElementById('location-input');
    let autoCompleteResults = document.getElementById('autocomplete-list');