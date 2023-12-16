// Replace 'YOUR_API_KEY' with your actual API key
const apiKey = 'pk.56b37a44389aea335d1c84d58086743d';

// Function to query user location with autocomplete
async function queryUserLocation() {
  const locationInput = prompt('Enter your location:');

  if (!locationInput) {
    console.error('Location input cannot be empty.');
    return;
  }

  try {
    const response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${locationInput}&format=json`);
    const data = await response.json();

    if (data.length === 0) {
      console.error('Location not found.');
      return;
    }

    const latitude = data[0].lat;
    const longitude = data[0].lon;

    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);

    // Use the latitude and longitude as needed
    // ...

  } catch (error) {
    console.error('An error occurred while fetching user location:', error);
  }
}

// Call the function to query user location
queryUserLocation();