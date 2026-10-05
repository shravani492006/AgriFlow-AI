
"""
AgriFlow AI - FastAPI backend.

Random Forest  -> predicts whether irrigation is required (0 / 1)
Rule-based     -> turns that prediction into a duration + readable reason
"""

import json
import logging
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator


logger = logging.getLogger("agriflow")
BASE_DIR = Path(__file__).parent


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.104:5173",

    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


# --------------------------------------------------
# CROP MAPPING
# --------------------------------------------------

CROP_MAPPING = json.loads(
    (BASE_DIR / "crop_mapping.json").read_text(encoding="utf-8")
)


# Exact feature names used during model training
FEATURE_COLUMNS = [
    "crop type",
    "Temperature",
    "Humidity",
    "Soil Moisture",
    "Soil Tempertuer",
]


# --------------------------------------------------
# LOAD RANDOM FOREST MODEL
# --------------------------------------------------

model = None

try:
    model = joblib.load(BASE_DIR / "irrigation_model.pkl")

    trained_cols = list(
        getattr(model, "feature_names_in_", FEATURE_COLUMNS)
    )

    if trained_cols != FEATURE_COLUMNS:
        logger.warning(
            "Model feature names differ from FEATURE_COLUMNS: %s",
            trained_cols,
        )

    logger.info("Irrigation model loaded successfully.")

except Exception:
    logger.exception("Could not load irrigation_model.pkl")


# --------------------------------------------------
# FASTAPI APP + CORS
# --------------------------------------------------

app = FastAPI(
    title="AgriFlow AI - Irrigation Advisor API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# REQUEST MODEL + VALIDATION
# --------------------------------------------------

class PredictRequest(BaseModel):
    crop_type: int

    temperature: float = Field(
        ge=-10,
        le=60,
        description="Air temperature, deg C",
    )

    humidity: float = Field(
        ge=0,
        le=100,
        description="Relative humidity, %",
    )

    soil_moisture: float = Field(
        ge=0,
        le=100,
        description="Soil moisture, %",
    )

    soil_temperature: float = Field(
        ge=-10,
        le=60,
        description="Soil temperature, deg C",
    )

    @field_validator("crop_type")
    @classmethod
    def crop_must_be_known(cls, v: int) -> int:
        if v not in CROP_MAPPING.values():
            raise ValueError(
                f"crop_type must be one of "
                f"{sorted(CROP_MAPPING.values())}"
            )
        return v


# --------------------------------------------------
# IRRIGATION RECOMMENDATION
# --------------------------------------------------

def get_recommendation(
    prediction: int,
    soil_moisture: float,
    temperature: float,
    humidity: float,
) -> dict:

    if prediction == 0:
        return {
            "status": "No Irrigation Required",
            "duration": "0 minutes",
            "reason": (
                "The AI model predicts that irrigation is not "
                "required under the current conditions."
            ),
        }

    if soil_moisture < 30:
        duration = 30
    elif soil_moisture < 40:
        duration = 25
    else:
        duration = 15

    reasons = []

    if soil_moisture < 40:
        reasons.append("soil moisture is low")

    if temperature > 30:
        reasons.append("temperature is high")

    if humidity < 50:
        reasons.append("humidity is low")

    if not reasons:
        reasons.append(
            "the model found the overall combination of "
            "current conditions calls for irrigation"
        )

    return {
        "status": "Irrigation Recommended",
        "duration": f"{duration} minutes",
        "reason": (
            "Irrigation is recommended because "
            + ", ".join(reasons)
            + "."
        ),
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
    }


# --------------------------------------------------
# GET CROPS
# --------------------------------------------------

@app.get("/crops")
def crops():
    return CROP_MAPPING


# --------------------------------------------------
# PREDICTION ENDPOINT
# --------------------------------------------------

@app.post("/predict")
def predict(req: PredictRequest):

    if model is None:
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "The AI model is not available on the server."
                )
            },
        )

    X = pd.DataFrame(
        [[
            req.crop_type,
            req.temperature,
            req.humidity,
            req.soil_moisture,
            req.soil_temperature,
        ]],
        columns=FEATURE_COLUMNS,
    )

    prediction = int(model.predict(X)[0])

    recommendation = get_recommendation(
        prediction,
        req.soil_moisture,
        req.temperature,
        req.humidity,
    )

    return {
        "prediction": prediction,
        "prediction_label": (
            "Irrigation Required"
            if prediction == 1
            else "Irrigation Not Required"
        ),
        **recommendation,
        "inputs": req.model_dump(),
    }


# --------------------------------------------------
# FRIENDLY ERROR HANDLING
# --------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_handler(
    _: Request,
    exc: RequestValidationError,
):
    messages = []

    for error in exc.errors():
        field = ".".join(
            str(part)
            for part in error["loc"]
            if part != "body"
        )

        messages.append(f"{field}: {error['msg']}")

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid input. " + "; ".join(messages)
        },
    )


@app.exception_handler(Exception)
async def unhandled_handler(
    request: Request,
    exc: Exception,
):
    logger.exception("Unhandled error", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Prediction failed. Please try again."
        },
    )