# 🌫️ Air Quality & Respiratory Risk Analysis

An **ML-based environmental intelligence project** that analyzes air pollution, weather conditions, air quality, and potential respiratory-health concerns.

The project uses **PM2.5, PM10, temperature, humidity, AQI, time, and geographical information** to understand pollution patterns and establish a foundation for machine-learning-based air-quality forecasting and respiratory-health research.

> ⚠️ **Research Disclaimer:** The respiratory-risk label in the current dataset is a **non-clinical risk proxy derived from the available AQI index**. It does not represent a medical diagnosis or confirm that a respiratory illness occurred.

---

# 📌 1. Project Overview

Air pollution is an important environmental factor associated with respiratory health. Fine particulate matter such as **PM2.5** can penetrate deep into the respiratory system, while **PM10** represents larger inhalable particles.

This project combines environmental and air-quality variables to:

- Analyze PM2.5 and PM10 pollution patterns
- Study relationships between weather and pollution
- Analyze AQI variation
- Identify relationships between environmental attributes
- Develop ML models for air-quality prediction/forecasting
- Classify observations according to relative pollution-related health concern
- Prepare a foundation for future respiratory-health research
- Enable geographical pollution visualization

---

# 🎯 2. Objectives

### Primary Objectives

1. Analyze PM2.5 and PM10 concentrations.
2. Study the effect/relationship of temperature and humidity with particulate pollution.
3. Analyze AQI patterns across time and locations.
4. Identify correlations between environmental attributes.
5. Develop ML models for pollution forecasting.
6. Create a non-clinical respiratory-risk proxy for research experimentation.
7. Build a foundation for integrating real respiratory-health data in the future.

### Long-Term Objective

After obtaining validated health/epidemiological data:

> **Investigate the association between air-pollution exposure and respiratory-health indicators.**

---

# 📊 3. Dataset Information

The current processed dataset contains:

**6,557 observations**

and includes environmental, pollution, temporal, geographical, and research-related attributes.

---

# 🧬 4. Data Attributes

## Environmental & Pollution Attributes

| Attribute | Data Type | Unit | Description | Role |
|---|---|---|---|---|
| `temperature_c` | Float | °C | Air temperature at the observation time | Environmental feature |
| `humidity` | Float | % | Relative humidity | Environmental feature |
| `pm2_5` | Float | µg/m³ | Fine particulate matter with aerodynamic diameter ≤ 2.5 µm | Primary pollution feature |
| `pm10` | Float | µg/m³ | Particulate matter with aerodynamic diameter ≤ 10 µm | Pollution feature |
| `aqi_us_epa_index` | Integer | Index | AQI index provided by the source dataset | Air-quality indicator |

---

## Geographic Attributes

| Attribute | Data Type | Description | Role |
|---|---|---|---|
| `location` | String | City/location of observation | Location analysis |
| `region` | String | State/region | Regional analysis |
| `latitude` | Float | Geographic latitude | Mapping |
| `longitude` | Float | Geographic longitude | Mapping |

---

## Temporal Attributes

| Attribute | Data Type | Description |
|---|---|---|
| `timestamp` | DateTime | Date and time of observation |
| `hour` | Integer | Hour extracted from timestamp |
| `day` | Integer | Day of month |
| `month` | Integer | Month |
| `day_of_week` | Integer | Day of week |

These variables are particularly useful for **time-series forecasting and seasonal analysis**.

---

## Research/Target Attribute

| Attribute | Values | Description |
|---|---|---|
| `respiratory_risk_proxy` | Low / Medium / High | Non-clinical relative pollution-related respiratory-health concern |
| `risk_basis` | Text | Method used to generate the proxy |
| `health_interpretation` | Text | Human-readable interpretation |

---

# 📈 5. Dataset Statistical Summary

The following statistics are calculated from the current **6,557 cleaned observations**.

| Attribute | Min | Mean | Median | Max |
|---|---:|---:|---:|---:|
| Temperature (°C) | -2.60 | 25.46 | 25.90 | 35.30 |
| Humidity (%) | 22.00 | 77.50 | 79.00 | 100.00 |
| PM2.5 (µg/m³) | 0.50 | 40.57 | 25.40 | 410.90 |
| PM10 (µg/m³) | 0.80 | 51.47 | 34.00 | 466.70 |
| AQI Index | 1 | 2.21 | 2 | 6 |

The large maximum values for PM2.5 and PM10 indicate the presence of **high-pollution observations**. These should be investigated as potential pollution events rather than automatically removed as errors.

---

# 🔗 6. Relationship Between Attributes

A correlation analysis was performed on the major numerical variables.

### Correlation Matrix

| | Temperature | Humidity | PM2.5 | PM10 | AQI |
|---|---:|---:|---:|---:|---:|
| **Temperature** | 1.000 | -0.368 | 0.208 | 0.253 | 0.211 |
| **Humidity** | -0.368 | 1.000 | -0.113 | -0.213 | -0.137 |
| **PM2.5** | 0.208 | -0.113 | 1.000 | **0.971** | **0.908** |
| **PM10** | 0.253 | -0.213 | **0.971** | 1.000 | **0.887** |
| **AQI** | 0.211 | -0.137 | **0.908** | **0.887** | 1.000 |

> **Note:** Correlation measures statistical association, not causation.

---

# 🧠 7. Interpretation of Relationships

## PM2.5 ↔ PM10

**Correlation: 0.971 — Very Strong Positive Relationship**

This is the strongest relationship in the dataset.

When PM2.5 increases, PM10 generally increases as well.

```text
PM2.5 ↑
   │
   └────────► PM10 ↑
```

This is expected because both represent particulate pollution and can increase during the same pollution events.

### ML implication

PM2.5 and PM10 contain highly related information.

This should be considered when selecting features because using both may introduce **multicollinearity** in some models.

---

# PM2.5 ↔ AQI

**Correlation: 0.908 — Strong Positive Relationship**

Higher PM2.5 values are strongly associated with higher AQI index values in this dataset.

```text
PM2.5 ↑
   │
   └────────► AQI ↑
```

This makes PM2.5 one of the most important pollution variables for predicting air-quality conditions.

---

# PM10 ↔ AQI

**Correlation: 0.887 — Strong Positive Relationship**

PM10 also shows a strong positive relationship with AQI.

```text
PM10 ↑
   │
   └────────► AQI ↑
```

This indicates that particulate pollution is strongly represented in the AQI variation within the dataset.

---

# Temperature ↔ PM2.5

**Correlation: 0.208 — Weak Positive Relationship**

The dataset shows a relatively weak positive association between temperature and PM2.5.

```text
Temperature ↑
      │
      └──────► PM2.5 slightly ↑
```

However, this relationship is not strong enough to conclude that increasing temperature directly causes higher PM2.5.

Other factors such as:

- wind
- atmospheric stability
- rainfall
- emissions
- season
- location

can influence particulate concentrations.

---

# Temperature ↔ PM10

**Correlation: 0.253 — Weak Positive Relationship**

Temperature has a weak positive relationship with PM10.

This suggests that temperature alone is not a strong predictor of particulate concentration.

For ML forecasting, temperature should therefore be considered alongside other variables rather than used independently.

---

# Temperature ↔ Humidity

**Correlation: -0.368 — Moderate Negative Relationship**

Higher temperatures in this dataset tend to occur with lower humidity.

```text
Temperature ↑
      │
      └────────► Humidity ↓
```

This is an environmental relationship rather than evidence that temperature directly controls humidity.

---

# Humidity ↔ PM2.5

**Correlation: -0.113 — Very Weak Negative Relationship**

The relationship between humidity and PM2.5 is weak in this dataset.

```text
Humidity ↑
    │
    └──────► PM2.5 slightly ↓
```

Therefore, humidity by itself is unlikely to be a strong predictor of PM2.5.

However, humidity can still be useful as a feature because atmospheric conditions can influence pollutant behavior.

---

# Humidity ↔ PM10

**Correlation: -0.213 — Weak Negative Relationship**

The dataset shows a weak negative association between humidity and PM10.

This suggests that humidity has some relationship with particulate levels, but it is considerably weaker than the PM2.5–PM10 relationship.

---

# Humidity ↔ AQI

**Correlation: -0.137 — Very Weak Negative Relationship**

Humidity has a relatively weak direct correlation with AQI in this dataset.

Therefore:

> Humidity should be treated as a contextual/weather feature rather than the primary determinant of air quality.

---

# 📊 8. Relationship Strength Summary

| Relationship | Correlation | Strength |
|---|---:|---|
| PM2.5 ↔ PM10 | **0.971** | Very Strong |
| PM2.5 ↔ AQI | **0.908** | Strong |
| PM10 ↔ AQI | **0.887** | Strong |
| Temperature ↔ Humidity | **-0.368** | Moderate |
| Temperature ↔ PM10 | 0.253 | Weak |
| Temperature ↔ PM2.5 | 0.208 | Weak |
| Humidity ↔ PM10 | -0.213 | Weak |
| Humidity ↔ AQI | -0.137 | Very Weak |
| Humidity ↔ PM2.5 | -0.113 | Very Weak |

---

# ⚠️ 9. Important Interpretation

The correlation analysis tells us:

### Strong relationships

```text
PM2.5 ─────────► PM10
  │                 │
  │                 │
  └──────► AQI ◄────┘
```

The pollution variables are strongly connected to AQI.

### Weather relationships

```text
Temperature ───► weak relationship ─── PM2.5
      │
      └────────► weak relationship ─── PM10

Humidity ──────► weak relationship ─── pollution
```

Therefore, the project should treat **PM2.5 and PM10 as primary pollution features**, while temperature and humidity provide additional environmental context.

---

# 🫁 10. Respiratory Risk Proxy

The current dataset does **not contain actual patient-level respiratory-health outcomes**.

Therefore, the project does not claim that a respiratory illness occurred for a particular observation.

Instead, a **relative air-pollution respiratory-health concern proxy** is generated from the source AQI index.

| AQI Index | Risk Proxy |
|---:|---|
| 1–2 | Low |
| 3–4 | Medium |
| 5–6 | High |

### Current Distribution

| Risk | Observations |
|---|---:|
| Low | 4,349 |
| Medium | 1,976 |
| High | 232 |

### Interpretation

**Low**

Lower relative air-pollution health concern.

**Medium**

Elevated relative air-pollution health concern.

**High**

Higher relative air-pollution health concern.

> This is an environmental research proxy and **not a medical diagnosis**.

---

# 🚨 11. Target Leakage Consideration

The respiratory-risk proxy is derived from the AQI index.

Therefore, it should **not** be treated as an independently observed medical outcome.

For example, training:

```text
PM2.5
PM10
Temperature
Humidity
       ↓
Respiratory Risk
```

and claiming that the model predicts whether a person develops respiratory disease would be scientifically inappropriate.

The current risk proxy is primarily useful for:

- exploratory analysis
- visualization
- environmental-risk categorization
- prototype dashboard development

For actual respiratory-health ML, the project needs independent health data.

---

# 🧪 12. Future Health Dataset

A stronger research dataset could contain:

| Attribute | Description |
|---|---|
| Date | Health observation date |
| Location | City/region |
| PM2.5 | Pollution exposure |
| PM10 | Pollution exposure |
| Temperature | Weather |
| Humidity | Weather |
| AQI | Air quality |
| Respiratory OPD visits | Aggregated health indicator |
| Hospital admissions | Aggregated health indicator |
| Asthma cases | Aggregated health indicator |
| COPD cases | Aggregated health indicator |
| Respiratory infection cases | Aggregated health indicator |

The research pipeline could then become:

```text
Air Quality
     +
Weather
     +
Location
     +
Time
     ↓
Respiratory Health Indicators
     ↓
Statistical Analysis
     ↓
ML / Risk Modeling
```

This would allow the project to study actual **associations between pollution exposure and respiratory-health indicators**.

---

# 🤖 13. Machine Learning Pipeline

```text
                Raw Dataset
                     │
                     ▼
             Data Quality Check
                     │
                     ▼
              Data Preprocessing
                     │
                     ▼
             Feature Engineering
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Exploratory Data       ML Modeling
        Analysis                 │
          │              ┌──────┴──────┐
          │              ▼             ▼
          │          Regression   Classification
          │              │             │
          │              ▼             ▼
          │          Pollution      AQI/Risk
          │          Forecasting    Analysis
          │
          └──────────────┬──────────────┘
                         ▼
                  Visualization
                         │
                         ▼
                Research Insights
```

---

# 🎯 14. Recommended ML Tasks

## Task 1 — Pollution Forecasting

Predict future:

- PM2.5
- PM10

using:

- historical pollution
- temperature
- humidity
- time
- location

Possible models:

- Linear Regression
- Random Forest
- Gradient Boosting
- XGBoost
- LSTM

---

## Task 2 — AQI Forecasting

Use predicted pollution concentrations and historical environmental conditions to estimate future air-quality conditions.

---

## Task 3 — AQI Classification

Classify air-quality conditions into appropriate categories.

Models:

- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost

Metrics:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

---

# 🧹 15. Data Cleaning & Validation

Before ML training, the following checks should be performed:

- Missing-value detection
- Duplicate detection
- Data-type validation
- Timestamp validation
- Negative PM2.5 detection
- Negative PM10 detection
- Humidity range validation
- Temperature anomaly investigation
- AQI-value validation
- PM2.5/PM10 consistency checks
- Outlier investigation
- Coordinate validation
- Location validation
- Chronological ordering
- Time-gap analysis
- Risk-label validation
- Target-leakage analysis

### Important

Outliers should **not automatically be removed**.

For example, an extremely high PM2.5 value could represent a genuine severe pollution event and may be valuable for forecasting.

---

# 🗺️ 16. Geographic Analysis

The dataset contains:

```text
latitude
longitude
location
region
```

These allow future development of an interactive pollution map.

Possible visualization:

```text
                    INDIA
        ┌────────────────────────┐
        │                        │
        │     🟢 Low             │
        │             🟡 Medium  │
        │                        │
        │                 🔴 High│
        │                        │
        └────────────────────────┘
```

Future technologies:

- Folium
- GeoPandas
- Leaflet
- Mapbox

---

# 📈 17. Exploratory Data Analysis

The EDA phase should include:

### Distribution Analysis

- PM2.5 distribution
- PM10 distribution
- Temperature distribution
- Humidity distribution
- AQI distribution

### Correlation Analysis

- Correlation matrix
- Scatter plots
- Pollution-weather relationships

### Temporal Analysis

- Hourly patterns
- Daily patterns
- Monthly patterns
- Seasonal patterns

### Geographic Analysis

- Location-wise PM2.5
- Location-wise PM10
- Region-wise AQI
- Geographic pollution hotspots

---

# 🛠️ 18. Technology Stack

### Programming

- Python

### Data Processing

- Pandas
- NumPy

### Machine Learning

- Scikit-learn
- XGBoost
- TensorFlow/PyTorch *(optional)*

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

- PostgreSQL
- SQLite

---

# 📁 19. Project Structure

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

# 📚 20. Research References

The project methodology is informed by established air-quality and public-health research.

### World Health Organization — Global Air Quality Guidelines

WHO provides evidence-based air-quality guideline levels for pollutants including PM2.5 and PM10 and documents their health relevance.

https://www.who.int/publications/i/item/9789240034228

### US Environmental Protection Agency — Particulate Matter

The US EPA summarizes evidence linking particulate-matter exposure with respiratory and cardiovascular health effects.

https://www.epa.gov/pm-pollution/health-and-environmental-effects-particulate-matter-pm

### Central Pollution Control Board — National Air Quality Index

CPCB provides India's National Air Quality Index methodology and associated AQI categories/health implications.

https://cpcb.nic.in/displaypdf.php?id=bWFudWFsLW1vbml0b3JpbmcvQVFJX05BTVBfUmVwX1NlcHRlbWJlcjIwMTYucGRm

### Indian Air Pollution & Respiratory Health Research

Peer-reviewed systematic-review evidence has investigated associations between ambient air pollution and respiratory illnesses in India.

https://pubmed.ncbi.nlm.nih.gov/31070475/

### Temperature, Air Pollution & Respiratory Health

Research has examined how temperature can modify associations between air pollution and respiratory outcomes.

https://pubmed.ncbi.nlm.nih.gov/34914983/

### WHO AirQ+

WHO's AirQ+ framework provides a methodology for assessing health effects associated with short- and long-term exposure to air pollution.

https://www.who.int/tools/airq

---

# ⚠️ 21. Limitations

1. The current dataset does not contain actual patient-level respiratory-health outcomes.
2. The respiratory-risk field is a non-clinical proxy.
3. The current AQI field represents a **US EPA AQI index** from the source dataset and should not automatically be treated as India's CPCB AQI.
4. Correlation does not establish causation.
5. Weather-pollution relationships are affected by many variables not currently included.
6. PM2.5 and PM10 are highly correlated and require consideration during feature selection.
7. Real respiratory-health modeling requires validated epidemiological/clinical data.
8. Patient-level health information requires appropriate privacy, ethical, and institutional safeguards.

---

# 🔮 22. Future Scope

### Phase 1 — Current

**Environmental Data Analysis**

```text
PM2.5
PM10
Temperature
Humidity
AQI
```

↓

EDA + correlation + data-quality analysis

---

### Phase 2

**Machine Learning**

```text
Historical Environmental Data
             ↓
       ML Forecasting
             ↓
Future PM2.5 / PM10 / AQI
```

---

### Phase 3

**Interactive Dashboard**

```text
Current AQI
PM2.5
PM10
Temperature
Humidity
Forecast
Risk Indicator
```

---

### Phase 4

**Geographical Intelligence**

```text
Location
   ↓
Pollution Level
   ↓
Map Visualization
   ↓
Pollution Hotspots
```

---

### Phase 5

**Respiratory Health Research**

```text
Environmental Data
        +
Validated Health Data
        ↓
Statistical Analysis
        ↓
Association Analysis
        ↓
Health-Risk Research
```

---

# 🌍 23. Project Vision

The long-term goal is to develop an intelligent environmental-health analysis platform connecting:

```text
🌫️ Air Pollution
       +
🌡️ Weather
       +
📍 Location
       +
⏱️ Time
       +
🤖 Machine Learning
       +
🫁 Public Health Research
       ↓
Environmental Health Intelligence
```

The project progresses from:

**Measuring pollution → Understanding pollution → Forecasting pollution → Mapping pollution → Researching its relationship with respiratory health.**

---

# 📜 24. Disclaimer

This project is intended for **educational, research, and environmental-analysis purposes only**.

The current respiratory-risk proxy does not diagnose asthma, COPD, respiratory infections, or any other medical condition.

It should not be used for individual medical decisions.

Any future health-risk model should use validated health data and involve appropriate environmental-health, medical, and epidemiological expertise.