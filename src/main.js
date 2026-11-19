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
            <button id="live-location" class="live-button" type="button"><span class="live-target"></span>Use my live location</button>
            <p id="live-status" class="live-status">Request location for a real-time prediction</p>
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
        <div class="metric"><span class="metric-label">Live PM2.5</span><strong id="pm25-value">—</strong><span class="metric-detail" id="pm25-detail">µg/m³ at your location</span></div>
        <div class="metric"><span class="metric-label" id="aqi-label">Average AQI index</span><strong id="aqi-value">—</strong><span class="metric-detail" id="aqi-detail">US EPA source index</span></div>
        <div class="metric metric-accent"><span class="metric-label">Selected location</span><strong id="selected-value">Overview</strong><span class="metric-detail" id="selected-detail">Click a marker to inspect</span></div>
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

function usAqiCategory(aqi) {
  if (aqi <= 50) return 1;
  if (aqi <= 100) return 2;
  if (aqi <= 150) return 3;
  if (aqi <= 200) return 4;
  if (aqi <= 300) return 5;
  return 6;
}

function predictLiveRisk(features) {
  const featureNames = ['pm2_5', 'pm10', 'temperature_c', 'humidity', 'aqi_us_epa_index', 'hour', 'month'];
  const ranges = {};
  featureNames.forEach((name) => {
    const values = allRows.map((row) => Number(row[name])).filter(Number.isFinite);
    ranges[name] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });

  const neighbors = allRows.map((row) => {
    let squaredDistance = 0;
    featureNames.forEach((name) => {
      const range = ranges[name].max - ranges[name].min || 1;
      const current = (features[name] - ranges[name].min) / range;
      const historic = (Number(row[name]) - ranges[name].min) / range;
      squaredDistance += (current - historic) ** 2;
    });
    return { risk: row.respiratory_risk_proxy, distance: Math.sqrt(squaredDistance) };
  }).sort((left, right) => left.distance - right.distance).slice(0, 31);

  const scores = { Low: 0, Medium: 0, High: 0 };
  neighbors.forEach((neighbor) => {
    scores[neighbor.risk] += 1 / (neighbor.distance + 0.001);
  });
  return Object.entries(scores).sort((left, right) => right[1] - left[1])[0][0];
}

async function fetchLivePrediction(position) {
  activeLivePosition = position;
  const { latitude, longitude } = position.coords;
  const liveStatus = document.querySelector('#live-status');
  liveStatus.textContent = 'Retrieving live air-quality and weather data...';

  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`;
  const aqicnToken = import.meta.env.VITE_AQICN_TOKEN;
  const stationUrl = aqicnToken
    ? `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${aqicnToken}`
    : null;

  const [airResponse, weatherResponse, stationResponse] = await Promise.all([
    fetch(airUrl),
    fetch(weatherUrl),
    stationUrl ? fetch(stationUrl).catch(() => null) : Promise.resolve(null)
  ]);
  if (!airResponse.ok || !weatherResponse.ok) throw new Error('Live weather provider unavailable');

  const [airData, weatherData, stationData] = await Promise.all([
    airResponse.json(),
    weatherResponse.json(),
    stationResponse?.ok ? stationResponse.json() : Promise.resolve(null)
  ]);
  const currentAir = airData.current;
  const currentWeather = weatherData.current;
  const station = stationData?.status === 'ok' ? stationData.data : null;
  const stationAqi = Number(station?.aqi);
  const pm25 = Number(station?.iaqi?.pm25?.v ?? currentAir.pm2_5);
  const pm10 = Number(station?.iaqi?.pm10?.v ?? currentAir.pm10);
  const rawAqi = Number.isFinite(stationAqi) ? stationAqi : Number(currentAir.us_aqi);
  const aqiSource = station ? 'Nearest monitoring station' : 'Open-Meteo grid model';
  const stationName = station?.city?.name ? ` · ${station.city.name}` : '';
  const temperature = Number(currentWeather.temperature_2m);
  const humidity = Number(currentWeather.relative_humidity_2m);
  const now = new Date();
  const features = {
    pm2_5: pm25,
    pm10,
    temperature_c: temperature,
    humidity,
    aqi_us_epa_index: usAqiCategory(rawAqi),
    hour: now.getHours(),
    month: now.getMonth() + 1
  };
  const risk = predictLiveRisk(features);
  const color = riskColors[risk];

  document.querySelector('#pm25-value').textContent = Number.isFinite(pm25) ? pm25.toFixed(1) : '—';
  document.querySelector('#pm25-detail').textContent = 'µg/m³ live PM2.5';
  document.querySelector('#aqi-label').textContent = 'Live US AQI';
  document.querySelector('#aqi-value').textContent = Number.isFinite(rawAqi) ? rawAqi.toFixed(0) : '—';
  document.querySelector('#aqi-detail').textContent = `${aqiSource}${stationName} · ${risk} proxy`;
  document.querySelector('#selected-value').textContent = 'Live location';
  document.querySelector('#selected-detail').textContent = `${risk} proxy · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  document.querySelector('#insight-title').textContent = `${risk} live respiratory-risk proxy`;
  document.querySelector('#insight-copy').textContent = `The weighted-neighbor model predicts ${risk.toLowerCase()} relative concern from live PM2.5 ${pm25.toFixed(1)} µg/m³, PM10 ${pm10.toFixed(1)} µg/m³, US AQI ${rawAqi.toFixed(0)}, ${temperature.toFixed(1)}°C and ${humidity.toFixed(0)}% humidity. This is non-clinical research output.`;
  liveStatus.textContent = `Live prediction: ${risk} · ${aqiSource}${stationName} · Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
    <div class="popup"><strong>Live location</strong><span>${now.toLocaleString()}</span><div><b>${risk}</b> ML respiratory-risk proxy</div><small>PM2.5 ${pm25.toFixed(1)} · PM10 ${pm10.toFixed(1)} · AQI ${rawAqi.toFixed(0)}</small></div>
  `).addTo(markerLayer);
  liveMarker.openPopup();
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
  let weightTotal = 0;
  neighbors.forEach(({ row, score }) => {
    const weight = 1 / (1 + score);
    weightedAqi += row.aqi_us_epa_index * weight;
    weightedPm25 += row.pm2_5 * weight;
    weightTotal += weight;
  });
  const estimatedIndex = weightedAqi / weightTotal;
  const estimatedPm25 = weightedPm25 / weightTotal;
  const closest = neighbors[0].row;
  const risk = predictLiveRisk({
    pm2_5: estimatedPm25,
    pm10: closest.pm10,
    temperature_c: closest.temperature_c,
    humidity: closest.humidity,
    aqi_us_epa_index: estimatedIndex,
    hour: now.getHours(),
    month: now.getMonth() + 1
  });
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
    <div class="popup"><strong>${escapeHtml(displayName)}</strong><span>Historical-data estimate</span><div><b>${escapeHtml(risk)}</b> risk proxy · EPA index ${estimatedIndex.toFixed(1)}</div><small>Estimated PM2.5 ${estimatedPm25.toFixed(1)} µg/m³</small></div>
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
  document.querySelector('#insight-copy').textContent = `This is a weighted estimate from the project's 2023 observations near ${displayName}. It estimates EPA AQI index ${estimatedIndex.toFixed(1)} and PM2.5 ${estimatedPm25.toFixed(1)} µg/m³ using place distance, hour and month. It is not a current measured AQI.`;
  status.textContent = `Estimated AQI index ${estimatedIndex.toFixed(1)} · ${risk} proxy · historical data only`;
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
  const coordinates = allRows.filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
    .map((row) => [row.latitude, row.longitude]);
  if (coordinates.length) map.fitBounds(L.latLngBounds(coordinates), { padding: [30, 30] });
  update();
}).catch((error) => {
  document.querySelector('#map-status').textContent = 'Unable to load observations';
  document.querySelector('#observation-count').textContent = 'Data unavailable';
  console.error(error);
});
