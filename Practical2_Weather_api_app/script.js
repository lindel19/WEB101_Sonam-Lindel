// Configuration and Constants
const WEATHER_API_KEY = '30b56c61c7628fc786a2118061bf557e'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const PLACEHOLDER_API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Global state
let savedLocations = [];

// DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabs = document.querySelectorAll('.tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide all contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Show target tab
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });

  // Event listeners
  document.getElementById('get-weather').addEventListener('click', getWeather);
  document.getElementById('save-location').addEventListener('click', saveLocation);
  document.getElementById('update-location').addEventListener('click', updateLocation);
  document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
  });

  // Close modal if clicked outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('edit-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Load initial saved locations
  fetchSavedLocations();
});

// Utility function
function displayResponseInfo(method, url, status, data) {
  const responseInfo = document.getElementById('response-info');
  responseInfo.textContent =
`Method: ${method}
URL: ${url}
Status: ${status}
Timestamp: ${new Date().toLocaleString()}

Data:
${JSON.stringify(data, null, 2)}`;
}

// GET Request Implementation - Weather data
async function getWeather() {
  const cityInput = document.getElementById('city-input');
  const city = cityInput.value.trim();

  if (!city) {
    alert('Please enter a city name');
    return;
  }

  const weatherResult = document.getElementById('weather-result');
  weatherResult.innerHTML = 'Loading...';

  try {
    const url = `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    displayResponseInfo('GET', url, response.status, data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    weatherResult.innerHTML = `
      <div class="weather-card">
        <h3>${data.name}, ${data.sys.country}</h3>
        <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
        <button id="save-current-location" style="background-color:#27ae60;">Save This Location</button>
      </div>
    `;

    // Add save current weather location
    document.getElementById('save-current-location').addEventListener('click', () => {
      document.getElementById('location-name').value = data.name;
      document.getElementById('location-city').value = data.name;
      document.getElementById('location-country').value = data.sys.country;
      document.getElementById('location-notes').value = `Weather: ${data.weather[0].description}`;

      // Switch to POST tab
      document.querySelector('[data-tab="post"]').click();
    });

  } catch (error) {
    weatherResult.innerHTML = `
      <div class="weather-card" style="border-left-color:#e74c3c;">
        <p>${error.message}</p>
      </div>
    `;
  }
}

// POST Request Implementation
async function saveLocation() {
  const name = document.getElementById('location-name').value.trim();
  const city = document.getElementById('location-city').value.trim();
  const country = document.getElementById('location-country').value.trim();
  const notes = document.getElementById('location-notes').value.trim();

  if (!name || !city) {
    alert('Please enter at least a name and city');
    return;
  }

  try {
    const locationData = {
      title: name,
      body: JSON.stringify({
        city,
        country,
        notes
      }),
      userId: 1
    };

    const response = await fetch(PLACEHOLDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    const data = await response.json();

    displayResponseInfo('POST', PLACEHOLDER_API_URL, response.status, data);

    if (!response.ok) {
      throw new Error('Failed to save location');
    }

    const savedLocation = {
      id: data.id,
      name,
      city,
      country,
      notes
    };

    savedLocations.push(savedLocation);
    renderSavedLocations();

    // Clear form
    document.getElementById('location-name').value = '';
    document.getElementById('location-city').value = '';
    document.getElementById('location-country').value = '';
    document.getElementById('location-notes').value = '';

    // Switch to saved locations tab
    document.querySelector('[data-tab="saved"]').click();

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Fetch mock saved locations from JSONPlaceholder
async function fetchSavedLocations() {
  try {
    const response = await fetch(PLACEHOLDER_API_URL);
    const data = await response.json();

    // Transform first 5 items into our format
    savedLocations = data.slice(0, 5).map(item => {
      let city = '';
      let country = '';
      let notes = '';

      try {
        const body = JSON.parse(item.body);
        city = body.city || 'Unknown City';
        country = body.country || '';
        notes = body.notes || '';
      } catch (e) {
        city = 'Unknown City';
        notes = item.body;
      }

      return {
        id: item.id,
        name: item.title,
        city,
        country,
        notes
      };
    });

    renderSavedLocations();
  } catch (error) {
    console.error('Error fetching saved locations:', error);
  }
}

// Render saved locations list
function renderSavedLocations() {
  const container = document.getElementById('saved-locations');

  if (!savedLocations.length) {
    container.innerHTML = '<p>No saved locations. Add one in the "POST Locations" tab.</p>';
    return;
  }

  container.innerHTML = savedLocations.map(location => `
    <div class="location-item">
      <h3>${location.name}</h3>
      <div><strong>City:</strong> ${location.city}</div>
      <div><strong>Country:</strong> ${location.country || '-'}</div>
      <div><strong>Notes:</strong> ${location.notes || '-'}</div>

      <div class="location-actions">
        <button class="btn-edit" onclick="editLocation(${location.id})">Edit</button>
        <button class="btn-delete" onclick="deleteLocation(${location.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// PUT Request Implementation - Show edit modal
function editLocation(id) {
  const location = savedLocations.find(loc => loc.id === id);

  if (!location) return;

  document.getElementById('edit-id').value = location.id;
  document.getElementById('edit-name').value = location.name;
  document.getElementById('edit-city').value = location.city;
  document.getElementById('edit-country').value = location.country;
  document.getElementById('edit-notes').value = location.notes;

  document.getElementById('edit-modal').style.display = 'block';
}

// PUT Request Implementation - Update location
async function updateLocation() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value.trim();
  const city = document.getElementById('edit-city').value.trim();
  const country = document.getElementById('edit-country').value.trim();
  const notes = document.getElementById('edit-notes').value.trim();

  if (!name || !city) {
    alert('Please enter at least a name and city');
    return;
  }

  try {
    const locationData = {
      id,
      title: name,
      body: JSON.stringify({
        city,
        country,
        notes
      }),
      userId: 1
    };

    const response = await fetch(`${PLACEHOLDER_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    const data = await response.json();

    displayResponseInfo('PUT', `${PLACEHOLDER_API_URL}/${id}`, response.status, data);

    if (!response.ok) {
      throw new Error('Failed to update location');
    }

    const index = savedLocations.findIndex(loc => String(loc.id) === String(id));

    if (index !== -1) {
      savedLocations[index] = {
        id: savedLocations[index].id,
        name,
        city,
        country,
        notes
      };
    }

    renderSavedLocations();
    document.getElementById('edit-modal').style.display = 'none';

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// DELETE Request Implementation
async function deleteLocation(id) {
  const confirmDelete = confirm('Are you sure you want to delete this location?');

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${PLACEHOLDER_API_URL}/${id}`, {
      method: 'DELETE'
    });

    displayResponseInfo('DELETE', `${PLACEHOLDER_API_URL}/${id}`, response.status, {
      message: 'Resource deleted successfully'
    });

    if (!response.ok) {
      throw new Error('Failed to delete location');
    }

    savedLocations = savedLocations.filter(loc => loc.id !== id);
    renderSavedLocations();

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}