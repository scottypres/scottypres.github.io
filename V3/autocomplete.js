function debounceGetSuggestions() {
  const inputValue = document.getElementById("locationInput").value;
  if (!inputValue) return;

  clearTimeout(timeout);
  timeout = setTimeout(() => getSuggestions(inputValue), 1000);
}

async function getSuggestions(inputText) {
  let url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: inputText,
    format: "json",
    addressdetails: 1,
  });

  try {
    const response = await fetch(url);
    const suggestions = await response.json();
    displaySuggestions(suggestions);
  } catch (error) {
    console.error(error);
  }
}

function displaySuggestions(suggestions) {
  const autocompleteList = document.getElementById("autocomplete-list");
  autocompleteList.innerHTML = "";

  suggestions.forEach((place) => {
    const item = document.createElement("div");
    item.innerHTML = `<strong>${place.display_name}</strong>`;
    item.className = "autocomplete-items";

    item.addEventListener("click", () => {
      document.getElementById("locationInput").value = place.display_name;
      document.getElementById(
        "selectedLocation"
      ).innerText = `Latitude: ${place.lat}, Longitude: ${place.lon}`;
      autocompleteList.innerHTML = "";
      getWeathergfs(place.lat, place.lon);
      getWeathericon(place.lat, place.lon);
      
    });

    autocompleteList.appendChild(item);
  });
}


