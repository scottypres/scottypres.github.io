let latitude, longitude;

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('autocomplete');

    input.addEventListener('input', function() {
        if (this.value.length > 2) { // To minimize requests, waiting for at least 3 characters to start autocompletion
            getLocationSuggestions(this.value);
        }
    });
});

function getLocationSuggestions(query) {
    const apiKey = 'pk.56b37a44389aea335d1c84d58086743d';
    const url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}`;

    axios.get(url)
        .then(response => {
            if (response.data && response.data[0]) {
                // Just to demonstrate, we pick the first result as the user's location.
                latitude = response.data[0].lat;
                longitude = response.data[0].lon;
                updateCoordinates(latitude, longitude);
            }
        })
        .catch(error => {
            console.error('An error occurred with the LocationIQ API:', error);
        });
}

function updateCoordinates(lat, lon) {
    console.log(`Latitude: ${lat}, Longitude: ${lon}`); // You can handle coordinates as you need.
    // If needed, update these to the UI or send to a server, etc.
}