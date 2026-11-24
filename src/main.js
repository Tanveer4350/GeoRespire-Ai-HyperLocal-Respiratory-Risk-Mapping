import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';

const DATA_URL = '/air_quality_ml_with_respiratory_risk_proxy.csv';
const riskOrder = ['Low', 'Medium', 'High'];
const riskColors = { Low: '#3f8f72', Medium: '#e2a23b', High: '#d96b58' };
const riskRank = { Low: 1, Medium: 2, High: 3 };
const app = document.querySelector('#app');

app.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="GeoRespire home">
        <span class="brand-mark"><span></span><span></span><span></span></span>
        <span>Geo<span>Respire</span></span>
      </a>
      <div class="topbar-meta"><span class="live-dot"></span> Research dashboard <span class="divider"></span> India air-quality observations</div>
    </header>

    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">Environmental intelligence / 01</p>
          <h1>See the air<br /><em>around you.</em></h1>
          <p class="hero-copy">Explore hyperlocal pollution patterns and a non-clinical respiratory risk proxy across monitored locations.</p>
        </div>
        <div class="hero-note"><span>↗</span><p>Use the map to inspect a location.<br />Select a risk level to focus the view.</p></div>
      </section>

      <section class="dashboard">
        <aside class="sidebar">
          <div class="section-heading"><p class="eyebrow">Map controls</p><span class="observation-count" id="observation-count">Loading...</span></div>
          <label class="field-label" for="location-filter">Location</label>
          <div class="select-wrap"><select id="location-filter"><option value="all">All locations</option></select></div>
          <label class="field-label" for="location-search">Search observations</label>
          <div class="search-wrap"><input id="location-search" type="search" placeholder="Search city or region" autocomplete="off" /><button id="clear-search" type="button" aria-label="Clear search">×</button></div>
          <button id="predict-place" class="live-button predict-place" type="button"><span class="live-target"></span>Predict AQI for place</button>
          <p id="place-prediction-status" class="live-status">Search a place to estimate from 2023 observations</p>
          <label class="field-label" for="risk-filter">Risk proxy</label>
          <div class="risk-options" id="risk-filter">
            <button class="risk-option active" data-risk="all"><span class="risk-swatch all-swatch"></span>All observations <b>—</b></button>
            <button class="risk-option" data-risk="High"><span class="risk-swatch high"></span>High <b>—</b></button>
            <button class="risk-option" data-risk="Medium"><span class="risk-swatch medium"></span>Medium <b>—</b></button>
            <button class="risk-option" data-risk="Low"><span class="risk-swatch low"></span>Low <b>—</b></button>
          </div>
          <div class="live-panel">
            <button id="live-location" class="live-button" type="button"><span class="live-target"></span>Predict at my location</button>
            <p id="live-status" class="live-status">Estimate AQI from current weather and historical observations</p>
          </div>
          <div class="sidebar-foot"><span class="info-icon">i</span><p>This dashboard uses a research proxy based primarily on the source dataset's AQI index. It is not a medical diagnosis.</p></div>
        </aside>
        <section class="map-section">
          <div id="map" role="application" aria-label="Air quality observation map"></div>
          <div class="map-legend"><span class="legend-title">Site boundary</span><span><i class="legend-dot high"></i>High</span><span><i class="legend-dot medium"></i>Medium</span><span><i class="legend-dot low"></i>Low</span></div>
          <div class="map-status" id="map-status">Loading observations...</div>
        </section>
      </section>

      <section class="metrics">
        <div class="metric"><span class="metric-label">Locations monitored</span><strong id="locations-value">—</strong><span class="metric-detail">distinct observation sites</span></div>
        <div class="metric"><span class="metric-label">PM2.5 estimate</span><strong id="pm25-value">—</strong><span class="metric-detail" id="pm25-detail">µg/m³ at your location</span></div>
        <div class="metric"><span class="metric-label" id="aqi-label">Average AQI index</span><strong id="aqi-value">—</strong><span class="metric-detail" id="aqi-detail">US EPA source index</span></div>
        <div class="metric metric-accent"><span class="metric-label">Selected location</span><strong id="selected-value">Overview</strong><span class="metric-detail" id="selected-detail">Click a marker to inspect</span></div>
      </section>

      <section class="prediction-details" aria-live="polite">
        <div class="prediction-details-head">
          <div>
            <p class="eyebrow">Prediction details / 03</p>
            <h2 id="prediction-location">Waiting for a prediction</h2>
            <p class="prediction-summary" id="prediction-summary">Use your location or choose a monitored city to estimate current conditions from weather and historical observations.</p>
          </div>
          <div class="other-location">
            <label class="field-label" for="other-location-select">Check another monitored location</label>
            <div class="other-location-controls">
              <select id="other-location-select" disabled>
                <option value="">Loading locations...</option>
              </select>
              <button id="check-other-location" class="live-button" type="button" disabled>Check current</button>
            </div>
            <p class="live-status" id="other-location-status">Choose a city to get its current weather-based estimate.</p>
          </div>
        </div>
        <div class="prediction-facts">
          <div class="prediction-fact"><span>Estimated AQI category</span><strong id="detail-aqi">—</strong><small id="detail-aqi-band">Category index 1–6</small></div>
          <div class="prediction-fact"><span>Risk proxy</span><strong id="detail-risk">—</strong><small>Non-clinical, AQI-derived label</small></div>
          <div class="prediction-fact"><span>Estimated PM2.5</span><strong id="detail-pm25">—</strong><small>µg/m³</small></div>
          <div class="prediction-fact"><span>Estimated PM10</span><strong id="detail-pm10">—</strong><small>µg/m³</small></div>
          <div class="prediction-fact"><span>Temperature used</span><strong id="detail-temperature">—</strong><small>Current or historical match</small></div>
          <div class="prediction-fact"><span>Humidity used</span><strong id="detail-humidity">—</strong><small>Current or historical match</small></div>
        </div>
        <div class="prediction-explanation">
          <p id="prediction-method">The estimate will show its inputs and historical matching method here.</p>
          <span id="prediction-updated">No prediction yet</span>
        </div>
      </section>

      <section class="insight-card">
        <div><p class="eyebrow">Reading the data / 02</p><h2 id="insight-title">A living picture of local air.</h2></div>
        <p id="insight-copy">Each marker represents an observation in the dataset. Use the filters to compare relative pollution-related concern and inspect the local conditions behind each reading.</p>
        <div class="insight-arrow">↘</div>
      </section>
    </main>
    <footer><span>GeoRespire</span><span>Built for environmental research · Data observations from 2023</span></footer>
  </div>
`;

const map = L.map('map', { zoomControl: false, scrollWheelZoom: true }).setView([21.5, 78.9], 5);
L.control.zoom({ position: 'bottomright' }).addTo(map);
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const openStreetMapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const openStreetMapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const useOpenStreetMap = () => L.tileLayer(openStreetMapUrl, {
  maxZoom: 18,
  attribution: openStreetMapAttribution
}).addTo(map);

if (mapboxToken) {
  const mapboxLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`, {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  let fallbackStarted = false;
  mapboxLayer.on('tileerror', () => {
    if (fallbackStarted) return;
    fallbackStarted = true;
    map.removeLayer(mapboxLayer);
    useOpenStreetMap();
  });
  mapboxLayer.addTo(map);
} else {
  useOpenStreetMap();
}

const markerLayer = L.layerGroup().addTo(map);
let allRows = [];
let activeRisk = 'all';
let activeLocation = 'all';
let searchTerm = '';
const monitoredLocations = new Map();

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map((line) => {
    const values = [];
    let value = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"' && line[index - 1] !== '\\') {
        quoted = !quoted;
      } else if (character === ',' && !quoted) {
        values.push(value);
        value = '';
      } else {
        value += character;
      }
    }
    values.push(value);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  }).map((row) => Object.assign(row, {
    latitude: Number(row.latitude), longitude: Number(row.longitude), pm2_5: Number(row.pm2_5),
    pm10: Number(row.pm10), aqi_us_epa_index: Number(row.aqi_us_epa_index),
    temperature_c: Number(row.temperature_c), humidity: Number(row.humidity),
    hour: Number(row.hour), month: Number(row.month)
  }));
}

function visibleRows() {
  const query = searchTerm.trim().toLowerCase();
  return allRows.filter((row) => {
    const matchesRisk = activeRisk === 'all' || row.respiratory_risk_proxy === activeRisk;
    const matchesLocation = activeLocation === 'all' || row.location === activeLocation;
    const matchesSearch = !query || `${row.location} ${row.region}`.toLowerCase().includes(query);
    return matchesRisk && matchesLocation && matchesSearch;
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function siteBoundary(row) {
  const color = riskColors[row.respiratory_risk_proxy] || riskColors.Low;
  return L.circle([row.latitude, row.longitude], {
    radius: 12000,
    color,
    fillColor: color,
    fillOpacity: 0.16,
    opacity: 0.9,
    weight: 2
  }).bindPopup(`
    <div class="popup"><strong>${escapeHtml(row.location)}</strong><span>${escapeHtml(row.region)}</span><div><b>${escapeHtml(row.respiratory_risk_proxy)}</b> risk proxy · AQI ${row.aqi_us_epa_index}</div><small>${escapeHtml(row.timestamp)}</small></div>
  `).on('click', () => selectRow(row));
}

function selectRow(row) {
  document.querySelector('#selected-value').textContent = row.location;
  document.querySelector('#selected-detail').textContent = `${row.respiratory_risk_proxy} proxy · ${row.timestamp.slice(0, 10)}`;
  document.querySelector('#insight-title').textContent = `${row.location}, ${row.region}`;
  document.querySelector('#insight-copy').textContent = `This observation recorded ${row.pm2_5.toFixed(1)} µg/m³ PM2.5, ${row.pm10.toFixed(1)} µg/m³ PM10 and an AQI index of ${row.aqi_us_epa_index}. The ${row.respiratory_risk_proxy.toLowerCase()} label is a relative, non-clinical pollution-related proxy.`;
}

function update() {
  const rows = visibleRows();
  markerLayer.clearLayers();
  const sites = new Map();
  rows.filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
    .forEach((row) => {
      const current = sites.get(row.location);
      if (!current || riskRank[row.respiratory_risk_proxy] > riskRank[current.respiratory_risk_proxy]) {
        sites.set(row.location, row);
      }
    });
  sites.forEach((row) => siteBoundary(row).addTo(markerLayer));
  const locations = new Set(rows.map((row) => row.location));
  const mean = (key) => rows.length ? rows.reduce((sum, row) => sum + row[key], 0) / rows.length : 0;
  document.querySelector('#observation-count').textContent = `${rows.length.toLocaleString()} observations`;
  document.querySelector('#locations-value').textContent = locations.size;
  document.querySelector('#pm25-value').textContent = `${mean('pm2_5').toFixed(1)}`;
  document.querySelector('#aqi-value').textContent = mean('aqi_us_epa_index').toFixed(1);
  document.querySelector('#map-status').textContent = `${rows.length.toLocaleString()} observations shown`;
  riskOrder.forEach((risk) => {
    const button = document.querySelector(`[data-risk="${risk}"] b`);
    const query = searchTerm.trim().toLowerCase();
    button.textContent = allRows.filter((row) => row.respiratory_risk_proxy === risk &&
      (activeLocation === 'all' || row.location === activeLocation) &&
      (!query || `${row.location} ${row.region}`.toLowerCase().includes(query))).length.toLocaleString();
  });
}

document.querySelector('#location-filter').addEventListener('change', (event) => { activeLocation = event.target.value; update(); });
document.querySelector('#location-search').addEventListener('input', (event) => { searchTerm = event.target.value; update(); });
document.querySelector('#clear-search').addEventListener('click', () => {
  document.querySelector('#location-search').value = '';
  searchTerm = '';
  activeLocation = 'all';
  document.querySelector('#location-filter').value = 'all';
  update();
});
document.querySelectorAll('.risk-option').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.risk-option').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  activeRisk = button.dataset.risk;
  update();
}));

let liveMarker = null;
let liveRefreshTimer = null;
let activeLivePosition = null;

function riskFromAqiIndex(aqiIndex) {
  const category = Math.max(1, Math.min(6, Math.round(aqiIndex)));
  return category <= 2 ? 'Low' : category <= 4 ? 'Medium' : 'High';
}

function predictCurrentAqi(features) {
  const historicalRows = allRows.filter((row) =>
    Number.isFinite(row.latitude) && Number.isFinite(row.longitude)
    && Number.isFinite(row.temperature_c) && Number.isFinite(row.humidity)
    && Number.isFinite(row.aqi_us_epa_index) && Number.isFinite(row.pm2_5) && Number.isFinite(row.pm10)
  );
  if (!historicalRows.length) throw new Error('Historical observations are unavailable');

  const range = (key) => {
    const values = historicalRows.map((row) => row[key]);
    return Math.max(...values) - Math.min(...values) || 1;
  };
  const temperatureRange = range('temperature_c');
  const humidityRange = range('humidity');
  const neighbors = historicalRows.map((row) => {
    const hourDifference = Math.abs(row.hour - features.hour);
    const monthDifference = Math.abs(row.month - features.month);
    const score = haversineKm(features, row) / 100
      + Math.abs(row.temperature_c - features.temperature_c) / temperatureRange
      + Math.abs(row.humidity - features.humidity) / humidityRange
      + Math.min(hourDifference, 24 - hourDifference) / 12
      + Math.min(monthDifference, 12 - monthDifference) / 6;
    return { row, score };
  }).sort((left, right) => left.score - right.score).slice(0, 31);

  let aqi = 0;
  let pm25 = 0;
  let pm10 = 0;
  let weightTotal = 0;
  neighbors.forEach(({ row, score }) => {
    const weight = 1 / (1 + score);
    aqi += row.aqi_us_epa_index * weight;
    pm25 += row.pm2_5 * weight;
    pm10 += row.pm10 * weight;
    weightTotal += weight;
  });
  return {
    aqi: aqi / weightTotal,
    pm25: pm25 / weightTotal,
    pm10: pm10 / weightTotal,
    neighborCount: neighbors.length
  };
}

function renderPredictionDetails({ label, prediction, temperature, humidity, risk, updatedAt, summary, method }) {
  document.querySelector('#prediction-location').textContent = label;
  document.querySelector('#prediction-summary').textContent = summary;
  document.querySelector('#detail-aqi').textContent = `${prediction.aqi.toFixed(1)} / 6`;
  document.querySelector('#detail-aqi-band').textContent = epiBand(Math.round(prediction.aqi));
  const riskElement = document.querySelector('#detail-risk');
  riskElement.textContent = risk;
  riskElement.dataset.risk = risk.toLowerCase();
  document.querySelector('#detail-pm25').textContent = prediction.pm25.toFixed(1);
  document.querySelector('#detail-pm10').textContent = prediction.pm10.toFixed(1);
  document.querySelector('#detail-temperature').textContent = `${temperature.toFixed(1)}°C`;
  document.querySelector('#detail-humidity').textContent = `${humidity.toFixed(0)}%`;
  document.querySelector('#prediction-method').textContent = method;
  document.querySelector('#prediction-updated').textContent = `Updated ${updatedAt.toLocaleString()}`;
}

async function predictAtCoordinates({ latitude, longitude, label, statusElement }) {
  statusElement.textContent = 'Retrieving current weather and matching historical observations...';
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`;
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) throw new Error('Live weather provider unavailable');
  const weatherData = await weatherResponse.json();
  const currentWeather = weatherData.current;
  const temperature = Number(currentWeather.temperature_2m);
  const humidity = Number(currentWeather.relative_humidity_2m);
  if (!Number.isFinite(temperature) || !Number.isFinite(humidity)) {
    throw new Error('Current weather data is incomplete');
  }
  const now = new Date();
  const prediction = predictCurrentAqi({
    latitude,
    longitude,
    temperature_c: temperature,
    humidity,
    hour: now.getHours(),
    month: now.getMonth() + 1
  });
  const predictedIndex = prediction.aqi;
  const riskIndex = Math.max(1, Math.min(6, Math.round(predictedIndex)));
  const risk = riskFromAqiIndex(predictedIndex);
  const color = riskColors[risk];
  const summary = `Current weather near ${label} matched against the supplied historical observations.`;

  document.querySelector('#pm25-value').textContent = prediction.pm25.toFixed(1);
  document.querySelector('#pm25-detail').textContent = 'µg/m³ historical estimate';
  document.querySelector('#aqi-label').textContent = 'Estimated AQI category index';
  document.querySelector('#aqi-value').textContent = predictedIndex.toFixed(1);
  document.querySelector('#aqi-detail').textContent = `${epiBand(riskIndex)} · weather-based estimate`;
  document.querySelector('#selected-value').textContent = label;
  document.querySelector('#selected-detail').textContent = `${risk} proxy · weather-based estimate`;
  document.querySelector('#insight-title').textContent = `${risk} estimated respiratory-risk proxy`;
  document.querySelector('#insight-copy').textContent = `A weighted estimate from nearby historical observations matched to current weather (${temperature.toFixed(1)}°C, ${humidity.toFixed(0)}% humidity) and time. Estimated AQI category index ${predictedIndex.toFixed(1)}, PM2.5 ${prediction.pm25.toFixed(1)} µg/m³ and PM10 ${prediction.pm10.toFixed(1)} µg/m³. This is not a live air-quality measurement or a medical assessment.`;
  statusElement.textContent = `Weather-based estimate: AQI category ${predictedIndex.toFixed(1)} · ${risk} proxy · Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  renderPredictionDetails({
    label,
    prediction,
    temperature,
    humidity,
    risk,
    updatedAt: now,
    summary,
    method: `Matched ${prediction.neighborCount} historical observations using geographic distance, current temperature and humidity, hour, and month. AQI is estimated on the source dataset's 1–6 category scale; it is not a measured live AQI value.`
  });

  map.setView([latitude, longitude], 11, { animate: true });
  if (liveMarker) markerLayer.removeLayer(liveMarker);
  liveMarker = L.marker([latitude, longitude], {
    zIndexOffset: 1000,
    icon: L.divIcon({
      className: 'live-marker-icon',
      html: `<span style="--live-color:${color}"></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }).bindPopup(`
    <div class="popup"><strong>${escapeHtml(label)}</strong><span>Weather-based historical estimate · ${now.toLocaleString()}</span><div><b>${risk}</b> risk proxy · AQI category ${predictedIndex.toFixed(1)}</div><small>Estimated PM2.5 ${prediction.pm25.toFixed(1)} · PM10 ${prediction.pm10.toFixed(1)}</small></div>
  `).addTo(markerLayer);
  liveMarker.openPopup();
}

function fetchLivePrediction(position) {
  activeLivePosition = position;
  return predictAtCoordinates({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    label: 'My current location',
    statusElement: document.querySelector('#live-status')
  });
}

function locateAndPredict() {
  if (!navigator.geolocation) {
    document.querySelector('#live-status').textContent = 'Browser geolocation is not supported';
    return;
  }
  document.querySelector('#live-status').textContent = 'Waiting for location permission...';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchLivePrediction(position).catch((error) => {
        document.querySelector('#live-status').textContent = 'Unable to retrieve live prediction';
        console.error(error);
      });
    },
    (error) => {
      document.querySelector('#live-status').textContent = error.code === error.PERMISSION_DENIED
        ? 'Location permission denied'
        : 'Unable to determine your location';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
  );
}

document.querySelector('#live-location').addEventListener('click', () => {
  locateAndPredict();
  if (liveRefreshTimer) clearInterval(liveRefreshTimer);
  liveRefreshTimer = setInterval(() => {
    if (activeLivePosition) {
      fetchLivePrediction(activeLivePosition).catch((error) => console.error(error));
    }
  }, 15 * 60 * 1000);
});

document.querySelector('#check-other-location').addEventListener('click', () => {
  const selectedLocation = document.querySelector('#other-location-select').value;
  const location = monitoredLocations.get(selectedLocation);
  const statusElement = document.querySelector('#other-location-status');
  if (!location) {
    statusElement.textContent = 'Choose a monitored location first.';
    return;
  }
  if (liveRefreshTimer) clearInterval(liveRefreshTimer);
  liveRefreshTimer = null;
  activeLivePosition = null;
  predictAtCoordinates({
    latitude: location.latitude,
    longitude: location.longitude,
    label: `${location.location}, ${location.region}`,
    statusElement
  }).catch((error) => {
    statusElement.textContent = 'Unable to retrieve current weather for this location.';
    console.error(error);
  });
});

function haversineKm(first, second) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDistance = radians(second.latitude - first.latitude);
  const longitudeDistance = radians(second.longitude - first.longitude);
  const a = Math.sin(latitudeDistance / 2) ** 2
    + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude))
    * Math.sin(longitudeDistance / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function epiBand(aqiIndex) {
  const bands = {
    1: '1 (Good, approximately 0-50)',
    2: '2 (Moderate, approximately 51-100)',
    3: '3 (Unhealthy for sensitive groups, approximately 101-150)',
    4: '4 (Unhealthy, approximately 151-200)',
    5: '5 (Very unhealthy, approximately 201-300)',
    6: '6 (Hazardous, approximately 301+)'
  };
  return bands[Math.max(1, Math.min(6, Math.round(aqiIndex)))] || bands[1];
}

async function predictForSearchedPlace() {
  const query = document.querySelector('#location-search').value.trim();
  const status = document.querySelector('#place-prediction-status');
  if (!query) {
    status.textContent = 'Enter a city or place name first';
    return;
  }
  if (!allRows.length) {
    status.textContent = 'Historical observations are still loading';
    return;
  }

  status.textContent = 'Geocoding place...';
  const exactLocation = allRows.find((row) => `${row.location}, ${row.region}`.toLowerCase().includes(query.toLowerCase()));
  let latitude;
  let longitude;
  let displayName = query;

  if (exactLocation) {
    latitude = exactLocation.latitude;
    longitude = exactLocation.longitude;
    displayName = `${exactLocation.location}, ${exactLocation.region}`;
  } else {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(geocodeUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Place search unavailable');
    const places = await response.json();
    if (!places.length) {
      status.textContent = 'No place found';
      return;
    }
    latitude = Number(places[0].lat);
    longitude = Number(places[0].lon);
    displayName = places[0].display_name;
  }

  const now = new Date();
  const neighbors = allRows.map((row) => {
    const distance = haversineKm({ latitude, longitude }, row);
    const hourDistance = Math.min(Math.abs(row.hour - now.getHours()), 24 - Math.abs(row.hour - now.getHours())) / 12;
    const monthDistance = Math.min(Math.abs(row.month - (now.getMonth() + 1)), 12 - Math.abs(row.month - (now.getMonth() + 1))) / 6;
    return { row, distance, score: distance + hourDistance * 80 + monthDistance * 60 };
  }).sort((left, right) => left.score - right.score).slice(0, 31);

  let weightedAqi = 0;
  let weightedPm25 = 0;
  let weightedPm10 = 0;
  let weightedTemperature = 0;
  let weightedHumidity = 0;
  let weightTotal = 0;
  neighbors.forEach(({ row, score }) => {
    const weight = 1 / (1 + score);
    weightedAqi += row.aqi_us_epa_index * weight;
    weightedPm25 += row.pm2_5 * weight;
    weightedPm10 += row.pm10 * weight;
    weightedTemperature += row.temperature_c * weight;
    weightedHumidity += row.humidity * weight;
    weightTotal += weight;
  });
  const estimatedIndex = weightedAqi / weightTotal;
  const estimatedPm25 = weightedPm25 / weightTotal;
  const estimatedPm10 = weightedPm10 / weightTotal;
  const estimatedTemperature = weightedTemperature / weightTotal;
  const estimatedHumidity = weightedHumidity / weightTotal;
  const risk = riskFromAqiIndex(estimatedIndex);
  const color = riskColors[risk];

  map.setView([latitude, longitude], exactLocation ? 10 : 11, { animate: true });
  if (liveMarker) markerLayer.removeLayer(liveMarker);
  liveMarker = L.marker([latitude, longitude], {
    zIndexOffset: 1000,
    icon: L.divIcon({
      className: 'live-marker-icon',
      html: `<span style="--live-color:${color}"></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }).bindPopup(`
    <div class="popup"><strong>${escapeHtml(displayName)}</strong><span>Historical-data estimate</span><div><b>${escapeHtml(risk)}</b> risk proxy · AQI category ${estimatedIndex.toFixed(1)}</div><small>Estimated PM2.5 ${estimatedPm25.toFixed(1)} · PM10 ${estimatedPm10.toFixed(1)} µg/m³</small></div>
  `).addTo(markerLayer);
  liveMarker.openPopup();

  document.querySelector('#aqi-label').textContent = 'Estimated AQI index';
  document.querySelector('#aqi-value').textContent = estimatedIndex.toFixed(1);
  document.querySelector('#aqi-detail').textContent = epiBand(estimatedIndex);
  document.querySelector('#pm25-value').textContent = estimatedPm25.toFixed(1);
  document.querySelector('#pm25-detail').textContent = 'µg/m³ historical estimate';
  document.querySelector('#selected-value').textContent = displayName.split(',')[0];
  document.querySelector('#selected-detail').textContent = `${risk} proxy · historical estimate`;
  document.querySelector('#insight-title').textContent = `${risk} estimated respiratory-risk proxy`;
  document.querySelector('#insight-copy').textContent = `This is a weighted estimate from the project's 2023 observations near ${displayName}. It estimates AQI category ${estimatedIndex.toFixed(1)}, PM2.5 ${estimatedPm25.toFixed(1)} µg/m³ and PM10 ${estimatedPm10.toFixed(1)} µg/m³ using place distance, hour and month. It is not a current measured AQI.`;
  status.textContent = `Estimated AQI index ${estimatedIndex.toFixed(1)} · ${risk} proxy · historical data only`;
  renderPredictionDetails({
    label: displayName,
    prediction: { aqi: estimatedIndex, pm25: estimatedPm25, pm10: estimatedPm10, neighborCount: neighbors.length },
    temperature: estimatedTemperature,
    humidity: estimatedHumidity,
    risk,
    updatedAt: now,
    summary: `Historical estimate near ${displayName}; current weather is not fetched for place-search predictions.`,
    method: `Weighted estimate from ${neighbors.length} nearby 2023 observations, matched by geographic distance, hour, and month. Temperature and humidity shown are weighted historical conditions, not current weather. AQI uses the source dataset's 1–6 category scale.`
  });
}

document.querySelector('#predict-place').addEventListener('click', () => {
  predictForSearchedPlace().catch((error) => {
    document.querySelector('#place-prediction-status').textContent = 'Unable to predict for this place';
    console.error(error);
  });
});

fetch(DATA_URL).then((response) => {
  if (!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
  return response.text();
}).then((text) => {
  allRows = parseCsv(text);
  const locations = [...new Set(allRows.map((row) => row.location))].sort();
  document.querySelector('#location-filter').innerHTML += locations.map((location) => `<option value="${location}">${location}</option>`).join('');
  const otherLocationSelect = document.querySelector('#other-location-select');
  otherLocationSelect.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a monitored location';
  otherLocationSelect.append(placeholder);
  allRows.forEach((row) => {
    if (!Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) return;
    const key = JSON.stringify([row.location, row.region]);
    if (!monitoredLocations.has(key)) {
      monitoredLocations.set(key, {
        location: row.location,
        region: row.region,
        latitude: row.latitude,
        longitude: row.longitude
      });
    }
  });
  [...monitoredLocations.entries()]
    .sort((left, right) => left[1].location.localeCompare(right[1].location) || left[1].region.localeCompare(right[1].region))
    .forEach(([key, location]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${location.location}, ${location.region}`;
      otherLocationSelect.append(option);
    });
  otherLocationSelect.disabled = false;
  document.querySelector('#check-other-location').disabled = false;
  const coordinates = allRows.filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
    .map((row) => [row.latitude, row.longitude]);
  if (coordinates.length) map.fitBounds(L.latLngBounds(coordinates), { padding: [30, 30] });
  update();
}).catch((error) => {
  document.querySelector('#map-status').textContent = 'Unable to load observations';
  document.querySelector('#observation-count').textContent = 'Data unavailable';
  console.error(error);
});
