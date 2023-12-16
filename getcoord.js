
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
