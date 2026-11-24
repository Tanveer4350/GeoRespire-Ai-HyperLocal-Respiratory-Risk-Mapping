# GeoRespire

GeoRespire is an interactive environmental research dashboard for exploring air-quality observations across India. It combines a Leaflet map, 2023 observation data, historical place estimates, live browser geolocation, and a non-clinical respiratory-risk proxy.

> **Research use only:** Respiratory-risk labels are derived from the source AQI index and are not medical diagnoses. Live readings and historical estimates must not be used for emergency or clinical decisions.

## Features

- Interactive Leaflet map with location, text-search, and Low/Medium/High risk filters
- Marker popups and map circles with PM2.5, PM10, AQI, region, and timestamp details
- Dataset summaries for monitored locations, PM2.5, and average AQI
- Place prediction using nearby 2023 observations, distance, hour, and month
- Browser-geolocation AQI estimate using current weather matched to historical observations
- Detailed prediction cards and on-demand current-weather estimates for other monitored locations
- Automatic Mapbox-to-OpenStreetMap fallback for map tiles
- Responsive desktop and mobile layout

## Technology

- HTML, CSS, and vanilla JavaScript
- Vite 6
- Leaflet 1.9
- OpenStreetMap tiles
- Mapbox tiles, when `VITE_MAPBOX_TOKEN` is configured
- Open-Meteo weather API for current temperature and humidity
- OpenStreetMap Nominatim for place geocoding
- Pandas for the included data-quality notebook

## Getting Started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The default development server is typically available at `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Environment Variables

The app works without environment variables. Optional services can be enabled by creating an `.env.local` file:

```dotenv
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

| Variable | Purpose |
|---|---|
| `VITE_MAPBOX_TOKEN` | Uses Mapbox Light tiles; falls back to OpenStreetMap if tiles fail |

Use only public Mapbox tokens in `VITE_*` variables. They are exposed to browser-side code.

## Data

The repository contains 6,557 records in each CSV:

| File | Purpose |
|---|---|
| `air_quality_ml_project.csv` | Base cleaned observations |
| `air_quality_ml_with_respiratory_risk_proxy.csv` | Dashboard dataset with respiratory-risk labels |

The base dataset includes 543 unique locations across 33 regions.

### Dataset fields

| Field | Description |
|---|---|
| `timestamp` | Observation date and time |
| `location` | City or monitoring location |
| `region` | State or region |
| `latitude`, `longitude` | Geographic coordinates |
| `temperature_c` | Temperature in degrees Celsius |
| `humidity` | Relative humidity in percent |
| `pm2_5` | Fine particulate matter in µg/m³ |
| `pm10` | Inhalable particulate matter in µg/m³ |
| `aqi_us_epa_index` | Source US EPA AQI category index, from 1 to 6 |
| `hour`, `day`, `month`, `day_of_week` | Extracted time features |
| `respiratory_risk_proxy` | Low, Medium, or High research label |
| `risk_basis` | Method used to assign the proxy |
| `health_interpretation` | Human-readable interpretation |

### Dataset summary

| Metric | Minimum | Mean | Median | Maximum |
|---|---:|---:|---:|---:|
| Temperature (°C) | -2.60 | 25.46 | 25.90 | 35.30 |
| Humidity (%) | 22.00 | 77.50 | 79.00 | 100.00 |
| PM2.5 (µg/m³) | 0.50 | 40.57 | 25.40 | 410.90 |
| PM10 (µg/m³) | 0.80 | 51.47 | 34.00 | 466.70 |
| AQI category index | 1 | 2.21 | 2 | 6 |

## Respiratory-Risk Proxy

The proxy is assigned directly from the source AQI category index:

| AQI category index | Risk proxy |
|---:|---|
| 1–2 | Low |
| 3–4 | Medium |
| 5–6 | High |

Distribution in the dashboard dataset:

| Risk | Observations |
|---|---:|
| Low | 4,349 |
| Medium | 1,976 |
| High | 232 |

This label expresses relative pollution-related concern. It does not represent an individual diagnosis, exposure outcome, or clinical respiratory condition.

## Prediction Methods

### Place estimate

The searched-place workflow first checks whether the place matches a location in the dataset. Otherwise, it geocodes the place with Nominatim. It then:

1. Finds the 31 nearest historical observations using geographic distance
2. Applies penalties for hour and month differences
3. Calculates weighted PM2.5 and AQI estimates
4. Uses the weighted-neighbor model to assign a risk label

Place estimates are historical extrapolations, not current measurements.

### Live location estimate

For geolocation or a selected monitored location, the dashboard retrieves current temperature and humidity from Open-Meteo, then matches them with the current hour, month, and location against the 2023 observations. It uses the 31 closest historical matches, weighted by similarity, to estimate the AQI category index, PM2.5, and PM10. Other monitored locations are queried on demand to avoid making hundreds of weather API requests at once.

The prediction card shows the estimate, risk proxy, particulate estimates, weather inputs, matching method, and update time. This is a historical weather-based estimate, not a live air-quality measurement. The source dataset stores AQI categories from 1 to 6, not exact numeric AQI readings, so the estimate does not provide an exact current AQI value. The geolocation estimate refreshes every 15 minutes after the first location request.

## Project Structure

```text
.
├── index.html
├── package.json
├── src/
│   ├── main.js       # Dashboard UI, map, filters, and prediction logic
│   └── style.css     # Responsive visual system
├── air_quality_ml_project.csv
├── air_quality_ml_with_respiratory_risk_proxy.csv
├── data_cleaning.ipynb
└── dist/             # Generated production build
```

## Data Quality Analysis

`data_cleaning.ipynb` provides a 27-cell audit covering:

- Dataset shape and column types
- Missing values and duplicate records
- Timestamp validation
- Humidity and temperature range checks
- Negative or physically inconsistent particulate values
- Invalid latitude and longitude checks
- PM2.5/PM10 relationships
- Numeric correlation analysis
- Risk-label distribution
- A generated data-quality summary

## Known Limitations

- The dataset is from 2023 and is not a real-time source.
- Searched-place estimates depend on historical observations rather than live field measurements.
- Risk labels are proxy values derived from the AQI category, not validated health outcomes.
- Live estimates require third-party API availability and browser location permission.
- Geographic coverage is limited to observations in the included CSV files.
- The data does not contain patient, hospital, asthma, COPD, or exposure-outcome records.

## References

- [WHO air quality and health guidance](https://www.who.int/publications/i/item/9789240034228/)
- [US EPA PM pollution information](https://www.epa.gov/pm-pollution/national-ambient-air-quality-standards-naaqs-pm)
- [Fine particulate matter exposure research](https://pubmed.ncbi.nlm.nih.gov/31070475/)
- [India air-quality and temperature correlation notebook](https://www.kaggle.com/code/matviyamchislavskiy/india-air-quality-and-temp-correlation/notebook)
