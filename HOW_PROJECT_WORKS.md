# How GeoRespire Works

## Overview

GeoRespire is a browser-based environmental research dashboard for exploring air-quality observations across India. It uses the Leaflet map library, a CSV dataset from 2023, and browser-side JavaScript to provide map filters, historical summaries, and historical weather-based estimates.

GeoRespire does not use a server-side ML training service. The application runs in the browser and performs the estimation when a user requests a prediction.

## Main Technologies

- **Vite:** builds and serves the project.
- **Vanilla JavaScript:** loads data, controls the interface, and performs calculations.
- **Leaflet:** displays the map, markers, circles, popups, and map controls.
- **OpenStreetMap:** provides the default map tiles.
- **Mapbox:** optionally provides map tiles when `VITE_MAPBOX_TOKEN` is configured.
- **Open-Meteo:** provides current temperature and relative humidity.
- **OpenStreetMap Nominatim:** converts searched place names into coordinates.
- **CSV files:** store the historical observations used by the dashboard.

## Project Structure

- `index.html` defines the page container and loads `src/main.js`.
- `src/main.js` contains the application logic, UI rendering, map behavior, API requests, and estimation methods.
- `src/style.css` contains the dashboard layout and visual design.
- `air_quality_ml_with_respiratory_risk_proxy.csv` is the primary dataset used by the dashboard.
- `air_quality_ml_project.csv` contains the base dataset.
- `data_cleaning.ipynb` documents the data-quality checks used in the project.

## Data Loading

When the page starts, `src/main.js` performs these steps:

1. Fetches `/air_quality_ml_with_respiratory_risk_proxy.csv`.
2. Parses the CSV text in the browser.
3. Converts numeric fields such as latitude, longitude, PM2.5, PM10, AQI category, temperature, humidity, hour, and month into numbers.
4. Builds lists of locations and monitored locations.
5. Fits the map to the available coordinates.
6. Displays the observations and summary metrics.

The main data fields include location, region, coordinates, timestamp, temperature, humidity, PM2.5, PM10, US EPA AQI category index, and respiratory-risk proxy.

## Dashboard and Map

Leaflet uses OpenStreetMap as the default tile provider. If a public Mapbox token is supplied through `VITE_MAPBOX_TOKEN`, the app uses Mapbox tiles first and falls back to OpenStreetMap if a tile request fails.

The map uses a 12 km circular boundary for each displayed location. When a location has multiple observations, the dashboard shows the observation with the highest-risk label for that location. Clicking a circle displays the location, region, PM values, AQI category, timestamp, and risk proxy.

The sidebar allows users to:

- Filter by location.
- Search city or region names.
- Filter Low, Medium, or High observations.
- Estimate conditions for a searched place.
- Estimate conditions at the browser's current location.
- Select another monitored location.

The metrics section updates from the currently visible rows and shows monitored location count, mean PM2.5, mean AQI category index, and the selected location.

## Respiratory-Risk Proxy

The respiratory-risk label is derived from the AQI category index rather than from a trained medical classifier:

| AQI category index | Respiratory-risk proxy |
|---:|---|
| 1-2 | Low |
| 3-4 | Medium |
| 5-6 | High |

The project rounds a predicted continuous AQI value to the nearest category before assigning the risk label. This label represents relative pollution-related concern, not a diagnosis or health outcome.

## ML Estimation Method

The project uses a **weighted 31-nearest-neighbor method**. It is a nearest-neighbor prediction algorithm, not a trained neural network or a classification model.

### Live-location prediction

When the user selects **Predict at my location**:

1. The browser requests the user's coordinates through the Geolocation API.
2. Open-Meteo receives those coordinates and returns current temperature and relative humidity.
3. The app combines the coordinates, current temperature, humidity, hour, and month.
4. It compares the result with all valid historical observations.
5. It selects the 31 observations with the lowest distance-based score.
6. It gives each observation an inverse-weight based on `1 / (1 + score)`.
7. The weighted observations produce estimated PM2.5, PM10, and AQI category values.

The live-location score combines geographic distance, normalized temperature difference, normalized humidity difference, circular hour difference, and circular month difference.

### Searched-place prediction

When the user searches for a place:

1. The app first checks whether the search matches a monitored dataset location.
2. Otherwise, it geocodes the search with Nominatim.
3. It compares every observation to the place coordinates.
4. It applies penalties for hour and month differences.
5. It selects the 31 nearest observations.
6. It calculates inverse-weighted AQI, PM2.5, PM10, temperature, and humidity estimates.

Place-search predictions use current hour and month but do not fetch current weather. Their temperature and humidity values are weighted historical values.

### Monitored-location prediction

The other-location workflow gets the coordinates of a selected monitored location, fetches current temperature and humidity from Open-Meteo, and applies the same weighted-neighbor calculation used for live locations.

## Live Refresh Behavior

After a live-location prediction, the browser refreshes the estimate every 15 minutes. The refresh uses the stored browser position and fetches updated weather before repeating the weighted-neighbor calculation.

Selecting another monitored location stops the live-position refresh timer so that refreshes do not continue for a previous location.

## External API Failure Handling

The app reports failures when:

- Historical CSV data cannot be loaded.
- Browser geolocation is unsupported or denied.
- Open-Meteo cannot return valid weather data.
- Nominatim cannot find or geocode a place.
- Mapbox tiles fail and trigger the OpenStreetMap fallback.

## Prediction Formula

For live-location matching, an observation receives a score containing:

- Haversine geographic distance divided by 100.
- Absolute temperature difference divided by the dataset temperature range.
- Absolute humidity difference divided by the dataset humidity range.
- Circular hour difference divided by 12.
- Circular month difference divided by 6.

Each of the selected neighbors has weight:

```text
weight = 1 / (1 + score)
```

The predicted value is:

```text
predictedValue = sum(observationValue * weight) / sum(weights)
```

For searched-place predictions, the app uses a separate score based on geographic distance plus hour and month penalties.

## Limitations

- The observations are from 2023, not a real-time monitoring network.
- Live predictions estimate values from current weather matched to historical observations.
- Searched-place predictions do not fetch current weather.
- The dashboard uses an AQI category index from 1 to 6; it does not provide an exact measured AQI reading.
- The nearest-neighbor algorithm may not match real monitoring behavior in every location.
- Risk labels are non-clinical research proxies.
- Prediction availability depends on browser location permission and third-party API availability.
