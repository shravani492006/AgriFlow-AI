<div align="center">

# 🌱 AgriFlow AI

### Smart Irrigation Advisor for Small Farmers

**An explainable AI-powered irrigation advisory system for condition-based water management.**

<br/>

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit Learn](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

<br/>

**AI for Social Good · Explainable AI · Precision Agriculture · Responsible AI**

</div>

---

## 🌾 Overview

**AgriFlow AI** is a web-based smart irrigation advisory system designed for small and resource-conscious farmers.

Instead of relying only on fixed irrigation schedules or manual estimation, AgriFlow AI uses current environmental and soil conditions to predict whether irrigation is required.

The system combines:

- A **Random Forest classifier** for the irrigation prediction
- A **rule-based reasoning layer** for duration and explanation
- A **React + Vite interface** for farmer interaction
- A **FastAPI backend** for model inference and validation

The goal is not to automate the farmer's decision, but to provide a simple, transparent and understandable recommendation.

> **AgriFlow AI is an advisory system — not an autonomous irrigation controller.**
>
> The farmer always makes the final decision, and the application does not control pumps, valves or other irrigation equipment.

---

# 🎯 The Problem

Irrigation decisions on small farms are often influenced by fixed schedules, visual inspection or personal experience.

However, irrigation requirements can change with environmental and soil conditions.

A farmer may need to consider:

```text
             ┌──────────────────────┐
             │     FIELD STATE      │
             └──────────┬───────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
   Crop Type       Environment          Soil
                    │    │              │
                    │    │              ├── Soil Moisture
                    │    │              └── Soil Temperature
                    │    │
                    │    ├── Temperature
                    │    └── Humidity
                    │
                    ▼
           "Is irrigation required?"
```

The challenge is therefore not simply predicting a class.

The recommendation also needs to be communicated in a form that a non-technical user can understand.

---

# 💡 The AgriFlow Approach

AgriFlow AI separates the system into two decision layers:

### Layer 1 — Machine Learning

The **Random Forest model** predicts:

```text
0 → Irrigation Not Required
1 → Irrigation Required
```

### Layer 2 — Rule-Based Reasoning

A separate rule layer uses the prediction and current conditions to generate:

```text
Irrigation Status
       +
Suggested Duration
       +
Human-Readable Reason
```

This separation allows the machine learning model to focus on classification while the recommendation layer focuses on communicating the result.

---

# 🧠 Intelligence Pipeline

```text
┌────────────────────────────────────────────┐
│             FARM CONDITIONS                │
│                                            │
│  Crop Type                                 │
│  Temperature                               │
│  Humidity                                  │
│  Soil Moisture                             │
│  Soil Temperature                          │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│          INPUT VALIDATION                  │
│                                            │
│  Range checks + crop-code validation      │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│           RANDOM FOREST MODEL              │
│                                            │
│           irrigation_model.pkl             │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
             ┌───────────────────┐
             │   PREDICTION      │
             │                   │
             │  0 → Not Required │
             │  1 → Required     │
             └─────────┬─────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│         RULE-BASED REASONING               │
│                                            │
│      Duration + Explanation                │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│       EXPLAINABLE RECOMMENDATION           │
│                                            │
│  Status + Duration + Reason + Inputs       │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│               REACT UI                     │
└────────────────────────────────────────────┘
```

---

# 🔬 Machine Learning Model

AgriFlow AI uses a **Random Forest Classifier** built using scikit-learn.

The model uses five input features:

| Feature | Description |
|---|---|
| 🌾 Crop Type | Encoded crop category |
| 🌡️ Temperature | Ambient air temperature |
| 💧 Humidity | Relative humidity |
| 🌱 Soil Moisture | Current soil moisture level |
| 🌡️ Soil Temperature | Soil temperature |

### Target

```text
0 → Irrigation Not Required
1 → Irrigation Required
```

Random Forest was selected because it can handle non-linear relationships between the input variables, does not require feature scaling, and provides fast predictions for the application.

---

# 🧩 Prediction vs Recommendation

A key design decision in AgriFlow AI is that **the model does not generate the complete recommendation by itself**.

### Random Forest

Answers:

> **"Is irrigation required?"**

```text
Input Conditions
       ↓
Random Forest
       ↓
     0 / 1
```

### Rule-Based Reasoning

Answers:

> **"How should this prediction be communicated?"**

```text
Prediction + Conditions
          ↓
   Rule-Based Layer
          ↓
Duration + Explanation
```

The reasoning logic is implemented through:

```text
get_recommendation()
```

inside:

```text
backend/main.py
```

The rules are **not learned by the model**.

They are prototype heuristics used to generate a suggested duration and human-readable explanation.

---

# 🏗️ System Architecture

```text
                       ┌─────────────────────┐
                       │    React + Vite      │
                       │      Frontend       │
                       └──────────┬──────────┘
                                  │
                                  │ HTTP
                                  │ POST /predict
                                  ▼
                       ┌─────────────────────┐
                       │       FastAPI       │
                       │       Backend       │
                       │                     │
                       │ Input Validation    │
                       │ Model Inference     │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   Random Forest     │
                       │      Classifier     │
                       │                     │
                       │ irrigation_model    │
                       │       .pkl          │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Irrigation          │
                       │ Prediction          │
                       │                     │
                       │       0 / 1         │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Rule-Based          │
                       │ Reasoning           │
                       │                     │
                       │ Duration + Reason   │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Explainable Result  │
                       │                     │
                       │ Status              │
                       │ Duration            │
                       │ Reason              │
                       │ Inputs              │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      React UI       │
                       └─────────────────────┘
```

---

# 🖥️ Product Experience

AgriFlow AI provides a complete farmer-oriented interface rather than exposing only a prediction API.

## 01 — Welcome

Introduces AgriFlow AI and its purpose of providing smarter irrigation guidance.

## 02 — Farm Setup

Users can enter:

- Farmer name
- Location
- Farm size
- Crop type
- Soil type

Farm profile information is used for the application experience and is **not sent to the machine learning model**.

## 03 — Dashboard

Provides a quick overview of:

- Farm information
- Current conditions
- Latest irrigation assessment
- Irrigation status

## 04 — AI Irrigation Advisor

The main AI interaction.

```text
Crop Type
Temperature
Humidity
Soil Moisture
Soil Temperature
       │
       ▼
Get AI Recommendation
       │
       ▼
┌──────────────────────────────┐
│   Irrigation Recommendation  │
│                              │
│   Status                     │
│   Duration                   │
│   Explanation                │
└──────────────────────────────┘
```

## 05 — Weather & Environment

Displays the environmental and soil conditions used for the assessment.

## 06 — Irrigation Schedule

Tracks irrigation recommendations and their status.

## 07 — History

Stores previous prediction results locally in the browser.

## 08 — Responsible AI

Communicates the project's responsible AI principles and limitations.

---

# 📸 Interface

Add your application screenshots to:

```text
screenshots/
```

Recommended structure:

```text
screenshots/
├── dashboard.png
├── ai-advisor.png
├── weather-environment.png
├── irrigation-schedule.png
├── history.png
└── responsible-ai.png
```

### Dashboard
<img width="1911" height="872" alt="Screenshot 2026-10-02 222227" src="https://github.com/user-attachments/assets/08f8df18-14b0-46cc-a997-96cfcca5939a" />

<img width="1917" height="873" alt="Screenshot 2026-10-02 222350" src="https://github.com/user-attachments/assets/3d744020-a521-4e0b-af3c-4e1ccac3e8a7" />


### AI Irrigation Advisor
<img width="1917" height="847" alt="Screenshot 2026-10-02 222401" src="https://github.com/user-attachments/assets/05bdf4bf-5cb9-4220-b53f-df120e64150e" />

<img width="1558" height="860" alt="Screenshot 2026-10-02 223414" src="https://github.com/user-attachments/assets/6f0a05ac-4f55-4a47-b1c7-89857d30ba6c" />


### Weather & Environment

<img width="1570" height="866" alt="Screenshot 2026-10-02 224020" src="https://github.com/user-attachments/assets/c66b93ff-8841-4606-9ec0-c08335b5c3d8" />


### Irrigation Schedule

<img width="1551" height="858" alt="Screenshot 2026-10-02 224040" src="https://github.com/user-attachments/assets/3908b2c3-a3d7-480c-a848-3a57bc731d3c" />


### History

<img width="1570" height="865" alt="Screenshot 2026-10-02 224051" src="https://github.com/user-attachments/assets/daae5b47-629f-4e46-b7db-092623e1617e" />


### Responsible AI


<img width="1555" height="860" alt="Screenshot 2026-10-02 224108" src="https://github.com/user-attachments/assets/000ac9f3-924e-4504-9692-c4102652e3e5" />

---

# 📊 Model Evaluation

During development, the Random Forest classifier achieved:

<div align="center">

## 99.58%

### Test Accuracy

</div>

The result comes from the held-out test split used during development.

### Classification Report

| Class | Precision | Recall | F1-Score | Support |
|---|---:|---:|---:|---:|
| Irrigation Not Required | 1.00 | 1.00 | 1.00 | 600 |
| Irrigation Required | 0.98 | 0.99 | 0.99 | 118 |

### Confusion Matrix

```text
                    Predicted
                  0          1

Actual  0       598          2
        1         1        117
```

### Interpretation

The held-out test split contained **718 samples**.

The model made three classification errors on this split:

- 2 false positives
- 1 false negative

> **Important:** 99.58% is test-split performance, not a claim of 99.58% real-world agricultural accuracy.

The model requires broader evaluation across crops, soil conditions and geographical regions before real-world deployment.

---

# ⚠️ Known Limitations & Model Risks

AgriFlow AI intentionally documents its limitations rather than presenting the prototype as production-ready agricultural intelligence.

## 1. Crop Encoding

The original crop-to-number encoding used during training was not preserved with the model.

The current mapping is therefore maintained in:

```text
backend/crop_mapping.json
```

The mapping is an assumed mapping:

```text
Tomato → 1
...
Cotton → 5
```

If the original training encoding becomes available, this mapping should be replaced.

Crop type currently has very low importance in the model, approximately **1%**.

---

## 2. Model Behaviour Requires Verification

During testing, the model mostly predicted:

```text
"Irrigation Required"
```

when soil moisture was relatively high or soil temperature was low.

This is opposite to normal agronomic intuition.

Therefore, the meaning of the `irrigation` target label in the original training dataset should be verified before interpreting model predictions as real irrigation advice.

This is a critical validation issue rather than something hidden by the application.

---

## 3. No Live Weather Data

The current prototype does not use:

- Live weather APIs
- Rainfall forecasts
- Real-time weather observations

All current environmental values are entered manually.

---

## 4. No IoT Hardware

AgriFlow AI currently does not directly connect to:

- Soil moisture sensors
- Pumps
- Valves
- Irrigation controllers

It is intentionally an advisory prototype.

---

## 5. No Field Validation

The model has not yet been validated through real-world field trials with farmers or agronomists.

Therefore, the system should not be treated as an agronomic authority.

---

# 🤖 Responsible AI

AgriFlow AI was designed around seven responsible AI principles.

| Principle | Implementation |
|---|---|
| **Fairness** | Designed to require only a browser and five field-condition values |
| **Transparency** | Inputs and recommendation path are visible to the user |
| **Explainability** | Every recommendation includes a plain-language reason |
| **Accountability** | The farmer makes the final irrigation decision |
| **Privacy** | Only required model inputs are sent to the backend |
| **Safety** | No direct connection to irrigation equipment |
| **Sustainability** | Promotes condition-based rather than routine irrigation |

### Safety Boundary

```text
              AgriFlow AI
                   │
                   ▼
           AI Recommendation
                   │
                   ▼
          Human Decision
                   │
             ┌─────┴─────┐
             │           │
             ▼           ▼
          Irrigate     Don't Irrigate
```

The system **does not automatically execute** the recommendation.

---

# 🔐 Data & Privacy

AgriFlow AI does not use a database.

The following information is stored locally in the browser:

- Farm profile
- Prediction history
- Irrigation schedule status

The backend receives only the five values required for prediction:

```text
crop_type
temperature
humidity
soil_moisture
soil_temperature
```

Farm size and soil type are profile information only and are not sent to the model.

---

# 📡 API

## `POST /predict`

The frontend sends the current field conditions to the FastAPI backend.

### Request

```json
{
  "crop_type": 1,
  "temperature": 30,
  "humidity": 50,
  "soil_moisture": 30,
  "soil_temperature": 25
}
```

### Response

The API returns:

```text
prediction
status
duration
reason
inputs
```

### Validation

The backend validates:

```text
Humidity        → 0 to 100 %
Soil Moisture   → 0 to 100 %
Temperature     → -10 to 60 °C
Soil Temperature→ -10 to 60 °C
Crop Type       → Known crop code
```

---

# 🧪 API Flow

```text
Frontend
   │
   │ POST /predict
   │
   ▼
FastAPI
   │
   ├── Validate input
   │
   ├── Build model DataFrame
   │
   ├── Load Random Forest
   │
   ├── Generate prediction
   │
   ├── Apply recommendation rules
   │
   └── Return JSON
   │
   ▼
Frontend
   │
   ▼
Display recommendation
```

The backend constructs a pandas DataFrame using the exact training column names.

One of the original training columns contains the spelling:

```text
Soil Tempertuer
```

This spelling is preserved because it is part of the original training data schema.

---

# 🗂️ Project Structure

```text
AgriFlow-AI/
│
├── backend/
│   ├── main.py
│   │   ├── FastAPI application
│   │   ├── /predict endpoint
│   │   ├── input validation
│   │   ├── rule-based reasoning
│   │   └── CORS configuration
│   │
│   ├── irrigation_model.pkl
│   │   └── trained Random Forest model
│   │
│   ├── crop_mapping.json
│   │   └── crop name → model number
│   │
│   └── requirements.txt
│
├── src/
│   ├── App.tsx
│   │   └── Application screens and UI
│   │
│   ├── api.ts
│   │   └── API communication + error handling
│   │
│   ├── config.ts
│   │   └── Crop list + backend configuration
│   │
│   ├── storage.ts
│   │   └── localStorage functionality
│   │
│   ├── types.ts
│   │   └── Shared types and helpers
│   │
│   └── index.css
│       └── Application styling
│
├── screenshots/
│   └── Application screenshots
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

---

# ⚙️ Configuration

## Crop Mapping

Crop numbers are maintained in:

```text
backend/crop_mapping.json
```

This file acts as the single source of truth for the crop mapping used by the frontend and backend.

---

## Backend URL

The frontend backend address can be configured through:

```text
src/config.ts
```

or with:

```env
VITE_API_URL=http://localhost:8000
```

---

## CORS

Allowed frontend origins can be configured using:

```text
ALLOWED_ORIGINS
```

inside:

```text
backend/main.py
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

- Node.js
- npm
- Python
- pip

installed on your system.

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/AgriFlow-AI.git

cd AgriFlow-AI
```

---

## 2. Start the Backend

Open a terminal:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

## 3. Start the Frontend

Open a **new terminal** from the project root:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔗 Local Development

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8000` |
| API Documentation | `http://localhost:8000/docs` |
| Prediction API | `http://localhost:8000/predict` |

---

# 🛠️ Technology Stack

### Frontend

- React
- Vite
- TypeScript
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- pandas

### Machine Learning

- scikit-learn
- Random Forest
- Serialized model using `joblib` / model file

### Storage

- Browser `localStorage`

### Development

- Git
- GitHub
- VS Code
- Figma-based original UI design

---

# 🔮 Roadmap

The current prototype can be extended toward a more robust agricultural decision-support system.

```text
CURRENT
   │
   ├── Manual environmental inputs
   ├── Random Forest prediction
   ├── Rule-based explanation
   └── Browser-based history
   │
   ▼
NEXT
   │
   ├── Live weather integration
   ├── Rainfall forecasting
   ├── IoT soil-moisture sensors
   ├── Larger and more diverse datasets
   ├── Crop-specific models
   └── Region-specific models
   │
   ▼
FUTURE
   │
   ├── Mobile application
   ├── Multilingual interaction
   ├── Voice-based assistance
   ├── Continuous fairness evaluation
   └── Real-world field validation
```

These enhancements are future scope and are not part of the current prototype.

---

# 🌱 Design Philosophy

AgriFlow AI follows three important principles:

### 01 — Assist, Don't Replace

The system provides recommendations rather than making autonomous agricultural decisions.

### 02 — Explain, Don't Just Predict

A prediction without understandable context is difficult for a non-technical user to evaluate.

### 03 — Be Honest About Uncertainty

The project explicitly documents model limitations, dataset concerns and the need for real-world validation.

---

# 📚 Project Context

AgriFlow AI was developed as an **Artificial Intelligence Lab PBL-2 / Experiment 11** project at:

**Vidyalankar Institute of Technology**  
Department of Information Technology

### Project Title

**AgriFlow AI — Smart Irrigation Advisor for Small Farmers**

### Contributors

**Shravani Kadam**  
**Tanvi Jaware**

---

# 📌 Important Disclaimer

AgriFlow AI is an academic and research-oriented prototype.

The system's predictions have **not been validated through real-world agricultural field trials** and should not be treated as professional agronomic advice.

The reported model accuracy represents performance on the held-out test split used during development.

The project does not automatically control irrigation equipment.

---

<div align="center">

### 🌱 Smarter irrigation. Healthier harvests.

**Built with AI, responsible design and a focus on accessible agricultural technology.**

</div>
