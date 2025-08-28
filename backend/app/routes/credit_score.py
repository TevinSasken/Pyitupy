from fastapi import APIRouter, HTTPException
import pandas as pd
import joblib
import os

router = APIRouter()

# Paths to models and datasets
INDIVIDUAL_MODEL_PATH = "ml/models/individual_model.pkl"
BUSINESS_MODEL_PATH = "ml/models/business_model.pkl"
INDIVIDUAL_DATA_PATH = "ml/data/individual_features.csv"
BUSINESS_DATA_PATH = "ml/data/business_features.csv"


def load_model(model_path):
    if not os.path.exists(model_path):
        raise HTTPException(status_code=500, detail=f"Model not found: {model_path}")
    return joblib.load(model_path)


def probability_to_score(prob_default):
    """Convert probability of default to a 0-100 credit score."""
    return round((1 - prob_default) * 100, 2)


def risk_classification(score):
    """Classify credit score into risk level and suggestions."""
    if score >= 80:
        return {"risk_level": "low", "interest_rate": 10, "max_repayment_months": 24}
    elif score >= 60:
        return {"risk_level": "medium", "interest_rate": 14, "max_repayment_months": 12}
    elif score >= 40:
        return {"risk_level": "high", "interest_rate": 20, "max_repayment_months": 6}
    else:
        return {"risk_level": "very high", "interest_rate": 30, "max_repayment_months": 3}


@router.get("/credit-score/individual/{row_id}")
def get_individual_credit_score(row_id: int):
    """Predict credit score for an individual from dummy dataset."""
    df = pd.read_csv(INDIVIDUAL_DATA_PATH)
    if row_id < 0 or row_id >= len(df):
        raise HTTPException(status_code=404, detail="Borrower not found in dataset")

    model = load_model(INDIVIDUAL_MODEL_PATH)

    # Prepare features
    features = df.drop(columns=["label_default"]).iloc[[row_id]]
    prob_default = model.predict_proba(features)[0][1]  # probability of default

    score = probability_to_score(prob_default)
    risk_info = risk_classification(score)

    return {
        "borrower_type": "individual",
        "row_id": row_id,
        "credit_score": score,
        "probability_of_default": round(prob_default, 3),
        **risk_info
    }


@router.get("/credit-score/business/{row_id}")
def get_business_credit_score(row_id: int):
    """Predict credit score for a business from dummy dataset."""
    df = pd.read_csv(BUSINESS_DATA_PATH)
    if row_id < 0 or row_id >= len(df):
        raise HTTPException(status_code=404, detail="Business not found in dataset")

    model = load_model(BUSINESS_MODEL_PATH)

    # Prepare features
    features = df.drop(columns=["label_default"]).iloc[[row_id]]
    prob_default = model.predict_proba(features)[0][1]  # probability of default

    score = probability_to_score(prob_default)
    risk_info = risk_classification(score)

    return {
        "borrower_type": "business",
        "row_id": row_id,
        "credit_score": score,
        "probability_of_default": round(prob_default, 3),
        **risk_info
    }
