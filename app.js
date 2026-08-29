// ==========================================
// 1. DOM ELEMENTS (Selection)
// ==========================================
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');

// State Card Elements
const stateCards = {
    intro: document.getElementById('weather-intro'),
    loading: document.getElementById('weather-loading'),
    error: document.getElementById('weather-error'),
    data: document.getElementById('weather-data-card')
};

// Sub-elements within cards
const errorMessage = document.getElementById('error-message');
const displayCityName = document.getElementById('display-city-name');
const displayCountry = document.getElementById('display-country');
const displayTemp = document.getElementById('display-temp');
const displayCondition = document.getElementById('display-condition');
const displayHumidity = document.getElementById('display-humidity');
const displayWind = document.getElementById('display-wind');
const btnSaveCity = document.getElementById('btn-save-city');
const savedLocationsList = document.getElementById('saved-locations-list');

// ==========================================
// 2. GLOBAL STATE
// ==========================================
// Hydrate saved cities from local storage or default to an empty list
let savedCities = JSON.parse(localStorage.getItem('skyflow_cities')) || [];
let currentActiveCity = null; // Stores { name, country } of the loaded city

// ==========================================
// 3. STATE SWAPPER (UI Layouts)
// ==========================================
function showState(stateName) {
    Object.keys(stateCards).forEach(key => {
        const card = stateCards[key];
        if (key === stateName) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// ==========================================
// 4. ASYNCHRONOUS API NETWORK FUNCTIONS
// ==========================================
async function fetchWeatherData(cityName) {
    try {
        showState('loading');

        // Step A: Convert text search to latitude and longitude
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geocodeResponse = await fetch(geocodeUrl);

        if (!geocodeResponse.ok) {
            throw new Error("Unable to contact geocoding server. Check connection.");
        }

        const geocodeData = await geocodeResponse.json();

        if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error(`We couldn't find "${cityName}". Please check the spelling.`);
        }

        const { latitude, longitude, name, country } = geocodeData.results[0];

        // Store active loaded city details
        currentActiveCity = { name, country };

        // Step B: Fetch live forecast parameters using resolved coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather forecast parameters.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Render parameters to display card
        displayCityName.textContent = name;
        displayCountry.textContent = country;
        
        const temp = Math.round(current.temperature_2m);
        displayTemp.textContent = temp;
        
        const condition = getWeatherCondition(current.weather_code);
        displayCondition.textContent = condition;
        
        displayHumidity.textContent = `${current.relative_humidity_2m}%`;
        displayWind.textContent = `${current.wind_speed_10m} km/h`;

        // Update Theme class list based on conditions
        updateTheme(temp, current.weather_code);

        // Update active status indicator on the save heart button
        updateSaveButtonUI();

        showState('data');

    } catch (error) {
        console.error("Fetch operation failed:", error);
        errorMessage.textContent = error.message;
        showState('error');
    }
}

// ==========================================
// 5. ADAPTIVE THEME CONTROL
// ==========================================
function updateTheme(temp, weatherCode) {
    // Remove all previous themes
    document.body.classList.remove('theme-hot', 'theme-cold', 'theme-rainy');

    // WMO codes 61-65, 80-82, 95-99 correspond to Rain/Thunderstorms
    const isRainy = (weatherCode >= 61 && weatherCode <= 65) || 
                    (weatherCode >= 80 && weatherCode <= 82) || 
                    (weatherCode >= 95 && weatherCode <= 99);

    if (isRainy) {
        document.body.classList.add('theme-rainy');
    } else if (temp > 25) {
        document.body.classList.add('theme-hot');
    } else if (temp < 12) {
        document.body.classList.add('theme-cold');
    }
    // Otherwise, remains theme-default
}

// ==========================================
// 6. FAVORITE LOCATIONS CONTROLLER
// ==========================================
function updateSaveButtonUI() {
    if (!currentActiveCity) return;
    
    // Check if current active city is already in the saved list
    const isAlreadySaved = savedCities.some(
        city => city.toLowerCase() === currentActiveCity.name.toLowerCase()
    );

    if (isAlreadySaved) {
        btnSaveCity.classList.add('saved-active');
    } else {
        btnSaveCity.classList.remove('saved-active');
    }
}

function renderSavedLocations() {
    savedLocationsList.innerHTML = '';

    if (savedCities.length === 0) {
        savedLocationsList.innerHTML = `<li class="empty-saved-msg">No saved cities yet</li>`;
        return;
    }

    savedCities.forEach(cityName => {
        const li = document.createElement('li');
        li.textContent = cityName;

        // Create secondary delete button inside the list item
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-remove-saved';
        deleteBtn.innerHTML = '×';
        deleteBtn.ariaLabel = `Remove ${cityName}`;
        
        // Prevent clicking the delete button from triggering a search
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSavedCity(cityName);
        });

        // Click on the city name triggers a search
        li.addEventListener('click', () => {
            fetchWeatherData(cityName);
        });

        li.appendChild(deleteBtn);
        savedLocationsList.appendChild(li);
    });
}

function toggleSaveCity() {
    if (!currentActiveCity) return;

    const cityName = currentActiveCity.name;
    const index = savedCities.findIndex(
        city => city.toLowerCase() === cityName.toLowerCase()
    );

    if (index === -1) {
        // Add to saved list
        savedCities.push(cityName);
    } else {
        // Remove from saved list
        savedCities.splice(index, 1);
    }

    // Save and re-render sidebar
    localStorage.setItem('skyflow_cities', JSON.stringify(savedCities));
    renderSavedLocations();
    updateSaveButtonUI();
}

function removeSavedCity(cityName) {
    savedCities = savedCities.filter(
        city => city.toLowerCase() !== cityName.toLowerCase()
    );
    
    localStorage.setItem('skyflow_cities', JSON.stringify(savedCities));
    renderSavedLocations();
    
    // Sync the active save button state if the removed city is the active one
    if (currentActiveCity && currentActiveCity.name.toLowerCase() === cityName.toLowerCase()) {
        updateSaveButtonUI();
    }
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        cityInput.value = '';
    }
});

btnSaveCity.addEventListener('click', toggleSaveCity);

// ==========================================
// 8. INITIALIZATION
// ==========================================
// Mappings for weather conditions code standard
function getWeatherCondition(code) {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Variable Conditions";
}

// Draw list from local storage on load
renderSavedLocations();
showState('intro');
