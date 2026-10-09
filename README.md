# 🌫️ Air Quality & Respiratory Risk Analysis

An **ML-based environmental intelligence project** that analyzes the relationship between air pollution, weather conditions, air quality, and potential respiratory-health concerns.

The project uses **PM2.5, PM10, temperature, humidity, AQI, and temporal/location information** to analyze pollution patterns and develop a foundation for air-quality forecasting and respiratory-health research.

> ⚠️ **Research Disclaimer:** The respiratory-risk label used in the current dataset is a **non-clinical risk proxy derived from the available AQI index**. It does not represent a medical diagnosis or confirm that a respiratory illness occurred. Actual respiratory-health prediction requires validated clinical or epidemiological data.

---

## 📌 Project Overview

Air pollution is an important environmental factor associated with respiratory health. Fine particulate matter such as **PM2.5** can penetrate deep into the respiratory system, while PM10 represents larger inhalable particles.

This project combines air-quality and environmental variables to:

- Analyze PM2.5 and PM10 pollution patterns
- Study the influence of temperature and humidity
- Analyze AQI variations
- Classify observations into relative air-pollution respiratory-risk levels
- Prepare data for machine-learning-based air-quality forecasting
- Provide a foundation for future respiratory-health research
- Enable geographical pollution visualization in future versions

---

## 🎯 Objectives

### Primary Objectives

1. Collect and organize environmental and air-quality data.
2. Analyze **PM2.5 and PM10** concentrations.
3. Study the relationship between weather conditions and pollution.
4. Analyze AQI patterns across locations and time.
5. Develop ML models for air-quality prediction/forecasting.
6. Create a non-clinical respiratory-risk proxy for research exploration.

### Future Objective

Once validated respiratory-health datasets become available, the project can investigate:

> **Air pollution exposure → respiratory-health outcomes**

using actual aggregated health indicators such as respiratory OPD visits, hospital admissions, asthma-related cases, or other epidemiological measures.

---

# 📊 Dataset

The current dataset is derived from an Indian weather and air-quality dataset.

### Core Features

| Feature | Description |
|---|---|
| `timestamp` | Date and time of observation |
| `location` | Observation location |
| `region` | State/region |
| `latitude` | Geographic latitude |
| `longitude` | Geographic longitude |
| `temperature_c` | Temperature in °C |
| `humidity` | Relative humidity |
| `pm2_5` | PM2.5 concentration |
| `pm10` | PM10 concentration |
| `aqi_us_epa_index` | AQI index provided by the source dataset |
| `hour` | Hour extracted from timestamp |
| `day` | Day of month |
| `month` | Month |
| `day_of_week` | Day of week |
| `respiratory_risk_proxy` | Non-clinical relative risk category |
| `risk_basis` | Explanation of the risk-label methodology |
| `health_interpretation` | Interpretation of the proxy category |

### Dataset Size

**6,557 cleaned observations**

### Risk Distribution

| Risk Proxy | Observations |
|---|---:|
| Low | 4,349 |
| Medium | 1,976 |
| High | 232 |

---

# 🧠 Respiratory Risk Proxy

The current dataset does **not contain actual patient-level respiratory-health outcomes**.

Therefore, a medical diagnosis label was intentionally not created.

Instead, the project uses the source dataset's AQI index to create a **relative air-pollution respiratory-health concern proxy**:

| AQI Index | Risk Proxy |
|---:|---|
| 1–2 | Low |
| 3–4 | Medium |
| 5–6 | High |

### Interpretation

**Low**

Lower relative air-pollution health concern.

**Medium**

Elevated relative air-pollution health concern.

**High**

Higher relative air-pollution health concern.

This classification is intended for **environmental analysis and ML experimentation**, not clinical decision-making.

---

# 🤖 Machine Learning Pipeline

The planned ML pipeline is:

```text
                 Environmental Data
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
      PM2.5           PM10          Weather Data
                                    │
                              Temperature
                              Humidity
                        │
                        ▼
                Data Preprocessing
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        Feature Engineering   EDA
              │                   │
              └─────────┬─────────┘
                        ▼
                 ML Model Training
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       Pollution Forecasting   Risk Analysis
              │                   │
              └─────────┬─────────┘
                        ▼
                  Visualization
                        │
                        ▼
              Research & Insights
```

---

# 🔬 Planned ML Tasks

## 1. Air Quality Analysis

Analyze:

- PM2.5 trends
- PM10 trends
- AQI distribution
- Temperature-pollution relationship
- Humidity-pollution relationship
- Location-wise pollution patterns
- Seasonal patterns

---

## 2. AQI Classification

The project can classify observations into AQI categories using environmental features.

Potential models:

- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost
- Gradient Boosting

Evaluation metrics:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

---

## 3. Pollution Forecasting

A more meaningful ML objective is to predict **future pollution levels** rather than simply reconstructing AQI.

Example:

```text
Historical PM2.5
Historical PM10
Temperature
Humidity
Time
Location
       ↓
   ML Model
       ↓
Future PM2.5
Future PM10
       ↓
Future AQI / Air Quality
```

Potential models:

- Linear Regression
- Random Forest
- Gradient Boosting
- XGBoost
- LSTM

Regression metrics:

- MAE
- RMSE
- R²

---

# 📈 Exploratory Data Analysis

The project will investigate relationships such as:

### PM2.5 vs AQI

```text
PM2.5 ───────────────► AQI
```

### PM10 vs AQI

```text
PM10 ────────────────► AQI
```

### Temperature vs PM2.5

```text
Temperature ─────────► PM2.5
```

### Humidity vs PM2.5

```text
Humidity ────────────► PM2.5
```

### Seasonal patterns

```text
Month
  │
  ├── PM2.5
  ├── PM10
  └── AQI
```

Correlation analysis and feature-importance techniques will be used to determine which variables contribute most to model predictions.

---

# 🗺️ Future Geographic Mapping

Because the dataset contains:

- Latitude
- Longitude
- Location
- Region

the project can later provide a geographical visualization.

Example:

```text
                 INDIA
        ┌────────────────────┐
        │                    │
        │  🟢 Low            │
        │       🟡 Medium    │
        │                    │
        │             🔴 High│
        │                    │
        └────────────────────┘
```

Future versions can integrate:

- Leaflet
- Mapbox
- GeoPandas
- Folium

to create an interactive pollution map.

---

# 🫁 Respiratory Health Research

The long-term research direction is to combine environmental data with **real aggregated respiratory-health data**.

Potential future health variables:

```text
Date
Location
Respiratory OPD Visits
Hospital Admissions
Asthma Cases
COPD Cases
Respiratory Infection Cases
```

The combined dataset could look like:

```text
Date
Location
PM2.5
PM10
Temperature
Humidity
AQI
Respiratory Cases
```

The project could then investigate:

```text
Air Pollution
     +
Weather
     ↓
Respiratory Health Indicators
     ↓
Statistical Analysis
     ↓
Association / Risk Modeling
```

### Important

The project will distinguish between:

**Association**

> Higher pollution levels are associated with higher respiratory-health indicators.

and

**Causation**

> Pollution directly caused a specific respiratory illness.

The latter requires substantially stronger epidemiological evidence and appropriate study design.

---

# 🧪 Research Methodology

The research workflow will follow:

### Phase 1 — Data Collection

Collect environmental and air-quality observations.

### Phase 2 — Data Cleaning

- Handle missing values
- Remove duplicates
- Detect outliers
- Normalize/transform variables where required
- Validate timestamps

### Phase 3 — Exploratory Analysis

Study:

- Distributions
- Correlations
- Seasonal variation
- Location-wise patterns

### Phase 4 — Feature Engineering

Create:

- Hour
- Day
- Month
- Day of week
- Lag features
- Rolling averages
- Previous pollution levels

### Phase 5 — ML Modeling

Train and compare multiple models.

### Phase 6 — Evaluation

Use appropriate classification or regression metrics.

### Phase 7 — Health Research

After obtaining validated health data, investigate associations between pollution exposure and respiratory-health indicators.

### Phase 8 — Visualization

Present results through an interactive dashboard and geographical map.

---

# 🛠️ Technology Stack

### Programming

- Python

### Data Processing

- Pandas
- NumPy

### Machine Learning

- Scikit-learn
- XGBoost
- TensorFlow/PyTorch *(optional for deep learning)*

### Visualization

- Matplotlib
- Seaborn
- Plotly

### Dashboard

- Streamlit

### Mapping

- Folium
- GeoPandas
- Mapbox / Leaflet

### Database

- PostgreSQL *(future version)*
- SQLite *(prototype)*

---

# 📁 Project Structure

```text
air-quality-respiratory-analysis/
│
├── data/
│   ├── raw/
│   │   └── IndianWeatherRepository.csv
│   │
│   └── processed/
│       └── air_quality_ml_with_respiratory_risk_proxy.csv
│
├── notebooks/
│   ├── 01_data_cleaning.ipynb
│   ├── 02_eda.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_model_training.ipynb
│   └── 05_model_evaluation.ipynb
│
├── src/
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── predict.py
│   └── evaluation.py
│
├── models/
│   └── trained_models/
│
├── dashboard/
│   └── app.py
│
├── requirements.txt
│
└── README.md
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone <repository-url>
cd air-quality-respiratory-analysis
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Streamlit dashboard:

```bash
streamlit run dashboard/app.py
```

---

# 📊 Expected Outputs

The completed system should provide:

- PM2.5 analysis
- PM10 analysis
- AQI analysis
- Temperature and humidity analysis
- Pollution forecasting
- Model performance comparison
- Feature importance
- Risk-proxy classification
- Location-wise pollution visualization
- Time-series pollution trends
- Research-oriented respiratory-health analysis

---

# ⚠️ Limitations

1. The current dataset does **not contain actual respiratory patient outcomes**.
2. The respiratory-risk field is a **non-clinical proxy**, not a diagnosis.
3. AQI in the current source dataset is a **US EPA index**, so it should not automatically be interpreted as CPCB/Indian AQI.
4. Correlation does not establish causation.
5. Weather conditions can influence pollution dispersion and health outcomes in complex ways.
6. Actual respiratory-health modeling requires validated epidemiological/clinical data.
7. Patient-level health information should only be used with appropriate ethical, privacy, and institutional approval.

---

# 🔮 Future Scope

### 1. Real Respiratory Health Data

Integrate aggregated hospital or public-health data to replace the current proxy.

### 2. Advanced Forecasting

Implement:

- XGBoost
- LSTM
- Temporal Fusion Transformer

for multi-step pollution forecasting.

### 3. Real-Time Monitoring

Integrate live air-quality APIs/sensors.

### 4. Interactive Pollution Map

Display real-time and predicted pollution levels geographically.

### 5. Health-Risk Modeling

After obtaining validated health data, investigate relationships between pollution exposure and respiratory-health outcomes.

### 6. Personalized Exposure Alerts

A future system could provide general environmental alerts such as:

> "Air quality is currently poor. Consider reducing prolonged outdoor exposure."

Such features would be designed as **general environmental guidance**, not individual medical advice.

---

# 📚 Research References

The scientific basis for the project includes:

- **World Health Organization (WHO)** — Global Air Quality Guidelines and particulate-matter health evidence.
- **US Environmental Protection Agency (EPA)** — Health and environmental effects of particulate matter.
- **Central Pollution Control Board (CPCB), India** — National Air Quality Index methodology and health-related AQI categories.
- **Indian systematic-review literature** on ambient air pollution and respiratory health.
- Peer-reviewed studies examining the interaction of particulate pollution, temperature, humidity and respiratory outcomes.

---

# 👥 Research Positioning

This project is positioned as an:

> **Environmental Machine Learning + Public Health Research project**

rather than a medical diagnostic system.

The core research question is:

> **"How can machine learning use air-quality and environmental data to forecast pollution patterns and investigate their association with respiratory-health indicators?"**

---

# 📜 Disclaimer

This project is intended for **educational, research, and environmental-analysis purposes only**.

The respiratory-risk proxy does not diagnose asthma, COPD, respiratory infections, or any other medical condition. The project should not be used to make individual medical decisions.

Any future health-risk model should be developed using validated health datasets and reviewed with appropriate domain experts.

---

## ⭐ Project Vision

The long-term goal is to develop an intelligent environmental monitoring system that connects:

```text
🌫️ Air Pollution
       +
🌡️ Weather
       +
📍 Location
       +
🤖 Machine Learning
       +
🫁 Public Health Research
       ↓
Environmental Health Intelligence
```

**From measuring pollution → to forecasting pollution → to understanding its potential relationship with respiratory health.**
