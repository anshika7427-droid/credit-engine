from contextlib import asynccontextmanager
import uuid
from fastapi import Depends, FastAPI
import joblib
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from src.config import EXPLAINER_PATH, FEATURES_PATH, MODEL_PATH
from src.database import LoanApplication, get_db, init_db
from src.rules import check_knockout_rules
from src.schemas import BorrowerProfile, CreditScoreResponse

# Load artifacts
model = joblib.load(MODEL_PATH)
explainer = joblib.load(EXPLAINER_PATH)
feature_columns = joblib.load(FEATURES_PATH)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Alternative Data Credit Engine",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/v1/score", response_model=CreditScoreResponse)
def evaluate_credit(profile: BorrowerProfile, db: Session = Depends(get_db)):
    app_id = str(uuid.uuid4())

    # 1. Hard knockouts
    knockout = check_knockout_rules(profile)
    if knockout:
        app_record = LoanApplication(
            application_id=app_id,
            borrower_type=profile.borrower_type,
            credit_score=300,
            risk_tier="HIGH_RISK",
            status="REJECTED",
            default_probability=1.0,
            raw_payload=profile.model_dump(),
            shap_explanations={"knockout": knockout},
        )
        db.add(app_record)
        db.commit()
        return CreditScoreResponse(
            application_id=app_id,
            status="REJECTED",
            credit_score=300,
            risk_tier="HIGH_RISK",
            default_probability=1.0,
            knockout_reason=knockout,
        )

    # 2. Prepare payload & align dummy columns
    input_df = pd.DataFrame([profile.model_dump()])
    input_df = pd.get_dummies(input_df, columns=["borrower_type"])

    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[feature_columns]

    # 3. Model Scoring (300-900 Scale)
    prob_default = float(model.predict_proba(input_df)[0, 1])
    score = int(round(900 - (prob_default * 600)))

    if score >= 740:
        tier, status = "PRIME", "APPROVED"
    elif score >= 620:
        tier, status = "NEAR_PRIME", "MANUAL_REVIEW"
    else:
        tier, status = "SUBPRIME", "REJECTED"

    # 4. SHAP Local Explainability
    shap_vals = explainer.shap_values(input_df)
    vals = shap_vals[1][0] if isinstance(shap_vals, list) else shap_vals[0]

    feature_impact = list(zip(feature_columns, vals))
    # Positive SHAP pushes toward default (risk factors)
    adverse_factors = sorted(
        [f for f in feature_impact if f[1] > 0], key=lambda x: x[1], reverse=True
    )[:3]
    # Negative SHAP pushes away from default (strengths)
    positive_factors = sorted(
        [f for f in feature_impact if f[1] < 0], key=lambda x: x[1]
    )[:2]

    top_positives = [f"Strong signal: {f[0]}" for f in positive_factors]
    adverse_reasons = [f"Risk factor: {f[0]}" for f in adverse_factors]

    # 5. Persist to DB
    app_record = LoanApplication(
        application_id=app_id,
        borrower_type=profile.borrower_type,
        credit_score=score,
        risk_tier=tier,
        status=status,
        default_probability=prob_default,
        raw_payload=profile.model_dump(),
        shap_explanations={
            "positives": top_positives,
            "adverse": adverse_reasons,
        },
    )
    db.add(app_record)
    db.commit()

    return CreditScoreResponse(
        application_id=app_id,
        status=status,
        credit_score=score,
        risk_tier=tier,
        default_probability=round(prob_default, 4),
        top_positive_factors=top_positives,
        adverse_action_reasons=adverse_reasons,
    )
