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
          <label class="field-label" for="risk-filter">Risk proxy</label>
          <div class="risk-options" id="risk-filter">
            <button class="risk-option active" data-risk="all"><span class="risk-swatch all-swatch"></span>All observations <b>—</b></button>
            <button class="risk-option" data-risk="High"><span class="risk-swatch high"></span>High <b>—</b></button>
            <button class="risk-option" data-risk="Medium"><span class="risk-swatch medium"></span>Medium <b>—</b></button>
            <button class="risk-option" data-risk="Low"><span class="risk-swatch low"></span>Low <b>—</b></button>
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
        <div class="metric"><span class="metric-label">Average PM2.5</span><strong id="pm25-value">—</strong><span class="metric-detail">µg/m³ across selection</span></div>
        <div class="metric"><span class="metric-label">Average AQI index</span><strong id="aqi-value">—</strong><span class="metric-detail">US EPA source index</span></div>
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
if (!mapboxToken) {
  throw new Error('Missing VITE_MAPBOX_TOKEN. Add it to .env.local before starting Vite.');
}
L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`, {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
let allRows = [];
let activeRisk = 'all';
let activeLocation = 'all';
let searchTerm = '';

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map((line) => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((value) => value.replace(/^"|"$/g, '')) || [];
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  }).map((row) => Object.assign(row, {
    latitude: Number(row.latitude), longitude: Number(row.longitude), pm2_5: Number(row.pm2_5),
    pm10: Number(row.pm10), aqi_us_epa_index: Number(row.aqi_us_epa_index)
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
