from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
import sys
import uuid
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

try:
    from backend.config import EXPLAINER_PATH, FEATURES_PATH, MODEL_PATH
    from backend.database import LoanApplication, get_db, init_db
    from backend.ingestion.telemetry_parser import parse_aa_fi_data, parse_mobility_signals
    from backend.rules import check_knockout_rules
    from backend.schemas import (
        BorrowerProfile,
        ConsentArtifactResponse,
        ConsentRequest,
        ConsentVerifyRequest,
        CreditScoreResponse,
        RawIngestionPayload,
    )
except ImportError:
    from src.config import EXPLAINER_PATH, FEATURES_PATH, MODEL_PATH
    from src.database import LoanApplication, get_db, init_db
    from src.ingestion.telemetry_parser import parse_aa_fi_data, parse_mobility_signals
    from src.rules import check_knockout_rules
    from src.schemas import (
        BorrowerProfile,
        ConsentArtifactResponse,
        ConsentRequest,
        ConsentVerifyRequest,
        CreditScoreResponse,
        RawIngestionPayload,
    )

# Model Artifacts Cache
model = None
explainer = None
feature_columns = None


def load_artifacts():
    global model, explainer, feature_columns
    if MODEL_PATH.exists() and EXPLAINER_PATH.exists() and FEATURES_PATH.exists():
        model = joblib.load(MODEL_PATH)
        explainer = joblib.load(EXPLAINER_PATH)
        feature_columns = joblib.load(FEATURES_PATH)
    else:
        model = None
        explainer = None
        feature_columns = None


# Load artifacts on import
load_artifacts()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    load_artifacts()
    yield


app = FastAPI(
    title="AURA 2-Stage Autonomous Underwriting Engine",
    description=(
        "Stage 1: Raw Telemetry Ingestion & Feature Synthesis -> "
        "Stage 2: LightGBM / TreeSHAP Scoring."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite & institutional dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "AURA 2-Stage Underwriting Engine",
        "version": "2.0.0",
        "model_loaded": model is not None,
        "features_count": len(feature_columns) if feature_columns else 0,
    }


# ==============================================================================
# Helper Mock Telemetry Generators for RBI Account Aggregator Sandbox
# ==============================================================================

def generate_mock_fi_records(persona_id: str = "gig_prime", fip_id: str = "HDFC Bank") -> Dict[str, Any]:
    """Generates realistic raw multi-month transaction & mobility telemetry per persona."""
    base_date = datetime.utcnow() - timedelta(days=120)
    txs: List[Dict[str, Any]] = []

    if persona_id == "gig_prime":
        # Prime Delivery Fleet Partner (Ravi K.)
        # Daily settlements from Zomato/Swiggy, fuel topups, utility bills
        running_day = base_date
        for day in range(120):
            running_day = base_date + timedelta(days=day)
            # Daily platform payout
            payout = 1200.0 + (day % 7) * 90.0 + ((day * 17) % 150)
            txs.append({
                "timestamp": running_day.strftime("%Y-%m-%dT18:30:00Z"),
                "amount": round(payout, 2),
                "type": "CREDIT",
                "narration": "UPI/ZOMATO LIMITED/DELIVERY-SETTLEMENT",
                "mode": "UPI",
            })
            # Fuel debit every 2 days
            if day % 2 == 0:
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT09:15:00Z"),
                    "amount": 320.0,
                    "type": "DEBIT",
                    "narration": "UPI/HPCL PETROL BUNK/FUEL",
                    "mode": "UPI",
                })
            # Monthly telecom recharge
            if day in (5, 35, 65, 95):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT11:00:00Z"),
                    "amount": 479.0,
                    "type": "DEBIT",
                    "narration": "UPI/AIRTEL PREPAID RECHARGE",
                    "mode": "UPI",
                })
            # Monthly utility bill
            if day in (10, 40, 70, 100):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT14:20:00Z"),
                    "amount": 950.0,
                    "type": "DEBIT",
                    "narration": "BBPS/BESCOM ELECTRICITY BILL/PAID ON TIME",
                    "mode": "NEFT",
                })

        fastag_records = [
            {"timestamp": (base_date + timedelta(days=d * 8)).strftime("%Y-%m-%d"), "toll_plaza": "ELECTRONIC CITY TOLLWAY", "amount": 65.0}
            for d in range(14)
        ]
        return {
            "borrower_type": "gig_worker",
            "transactions": txs,
            "vehicle_rc": "KA-01-EQ-4921",
            "fastag_transactions": fastag_records,
            "daily_km_avg": 78.5,
            "gst_filing_punctuality": 0.0,
            "ecommerce_cancellation_rate": 0.02,
        }

    elif persona_id == "kirana_solid":
        # Solid Kirana Merchant (Gupta Stores)
        running_day = base_date
        for day in range(120):
            running_day = base_date + timedelta(days=day)
            # Daily retail UPI QR inward collections
            qr_turnover = 2800.0 + (day % 5) * 450.0 + ((day * 23) % 400)
            txs.append({
                "timestamp": running_day.strftime("%Y-%m-%dT21:00:00Z"),
                "amount": round(qr_turnover, 2),
                "type": "CREDIT",
                "narration": "UPI/BHARATPE/MERCHANT QR SETTLEMENT",
                "mode": "UPI",
            })
            # Bi-weekly wholesale distributor debits
            if day % 3 == 0:
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT15:45:00Z"),
                    "amount": 5400.0,
                    "type": "DEBIT",
                    "narration": "NEFT/METRO CASH AND CARRY/STOCK",
                    "mode": "NEFT",
                })
            # Utility billing
            if day in (12, 42, 72, 102):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT10:00:00Z"),
                    "amount": 2800.0,
                    "type": "DEBIT",
                    "narration": "BBPS/TNEB COMMERCIAL POWER BILL",
                    "mode": "NEFT",
                })

        fastag_records = [
            {"timestamp": (base_date + timedelta(days=d * 18)).strftime("%Y-%m-%d"), "toll_plaza": "DEVANAHALLI TOLL PLAZA", "amount": 110.0}
            for d in range(6)
        ]
        return {
            "borrower_type": "kirana_merchant",
            "transactions": txs,
            "vehicle_rc": "DL-1N-AA-9982",
            "fastag_transactions": fastag_records,
            "daily_km_avg": 46.0,
            "gst_filing_punctuality": 0.88,
            "ecommerce_cancellation_rate": 0.04,
        }

    elif persona_id == "freelancer_review":
        # Borderline Freelancer (Ananya S.)
        running_day = base_date
        for day in range(120):
            running_day = base_date + timedelta(days=day)
            # Monthly invoice lump sum credits
            if day in (2, 33, 64, 95):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT12:00:00Z"),
                    "amount": 68000.0,
                    "type": "CREDIT",
                    "narration": "IMPS/CLIENT RETAINER INVOICE/DESIGN",
                    "mode": "IMPS",
                })
            # High spend debits
            if day % 4 == 0:
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT16:00:00Z"),
                    "amount": 2200.0,
                    "type": "DEBIT",
                    "narration": "UPI/SWIGGY/ZOMATO/FOOD",
                    "mode": "UPI",
                })
            # Utility bill with minor delays
            if day in (20, 52, 84, 114):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT10:00:00Z"),
                    "amount": 1800.0,
                    "type": "DEBIT",
                    "narration": "BBPS/ELECTRICITY BILL/SETTLED POST DUE",
                    "mode": "NEFT",
                })

        fastag_records = [
            {"timestamp": (base_date + timedelta(days=35)).strftime("%Y-%m-%d"), "toll_plaza": "KHALAPUR TOLL", "amount": 320.0},
            {"timestamp": (base_date + timedelta(days=75)).strftime("%Y-%m-%d"), "toll_plaza": "KHALAPUR TOLL", "amount": 320.0},
        ]
        return {
            "borrower_type": "freelancer",
            "transactions": txs,
            "vehicle_rc": "MH-02-CR-1120",
            "fastag_transactions": fastag_records,
            "daily_km_avg": 24.0,
            "gst_filing_punctuality": 0.45,
            "ecommerce_cancellation_rate": 0.08,
        }

    else:
        # Delinquency Knockout (Vikas M.)
        running_day = base_date
        for day in range(120):
            running_day = base_date + timedelta(days=day)
            if day in (1, 30, 60, 90):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT10:00:00Z"),
                    "amount": 22000.0,
                    "type": "CREDIT",
                    "narration": "NEFT/PART TIME STIPEND",
                    "mode": "NEFT",
                })
            # Heavy debits leading to account depletion
            if day % 2 == 0:
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT14:00:00Z"),
                    "amount": 1450.0,
                    "type": "DEBIT",
                    "narration": "UPI/CASH OUTFLOW/WITHDRAWAL",
                    "mode": "UPI",
                })
            # Severe utility bounce / penalty
            if day in (15, 45, 75, 105):
                txs.append({
                    "timestamp": running_day.strftime("%Y-%m-%dT11:00:00Z"),
                    "amount": 850.0,
                    "type": "DEBIT",
                    "narration": "BBPS/ELECTRICITY OVERDUE PENALTY BOUNCE CHARGE",
                    "mode": "NEFT",
                })

        return {
            "borrower_type": "gig_worker",
            "transactions": txs,
            "vehicle_rc": "DL-04-A-1002",
            "fastag_transactions": [],
            "daily_km_avg": 7.5,
            "gst_filing_punctuality": 0.0,
            "ecommerce_cancellation_rate": 0.28,
        }


# ==============================================================================
# Phase 1.4: New API Endpoints
# ==============================================================================

@app.post("/api/v1/consent/initiate")
def initiate_aa_consent(req: ConsentRequest):
    """
    Accepts phone number and AA handle, initiating a pending RBI-compliant AA consent session.
    """
    session_id = f"AA-SESS-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.utcnow()
    expires_at = (now + timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "session_id": session_id,
        "phone_number": req.phone_number,
        "vpa_handle": req.vpa_handle,
        "fip_id": req.fip_id or "HDFC_BANK",
        "purpose_code": req.purpose_code,
        "data_range_days": req.data_range_days,
        "status": "PENDING",
        "mock_otp": "882190",
        "created_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "expires_at": expires_at,
        "message": "RBI Account Aggregator consent request pushed to user handle.",
    }


@app.post("/api/v1/consent/verify", response_model=ConsentArtifactResponse)
def verify_aa_consent(req: ConsentVerifyRequest):
    """
    Accepts 6-digit mock OTP, generates a signed-format ConsentArtifact
    (token: "AA-IND-CONSENT-88219-..."), and pulls mock financial records for that persona.
    """
    # Accept standard mock OTPs or any 6-digit number
    clean_otp = (req.otp or "").strip()
    if not clean_otp or len(clean_otp) < 4:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Enter the 6-digit verification code.")

    token_suffix = uuid.uuid4().hex[:6].upper()
    artifact_id = "AA-88219"
    artifact_token = f"AA-IND-CONSENT-88219-{token_suffix}"

    now = datetime.utcnow()
    expires_at = (now + timedelta(days=180)).strftime("%Y-%m-%dT%H:%M:%SZ")

    persona = req.persona_id or "gig_prime"
    fip = req.fip_id or "HDFC Bank"
    mock_records = generate_mock_fi_records(persona_id=persona, fip_id=fip)

    return ConsentArtifactResponse(
        phone_number=req.phone_number or "+91-98765-43210",
        vpa_handle=req.vpa_handle or f"{persona}@okhdfcbank",
        data_range_days=180,
        purpose_code="CREDIT_UNDERWRITING",
        status="ACTIVE",
        artifact_token=artifact_token,
        consent_artifact_id=artifact_id,
        fiu_id="AURA Autonomous Underwriting",
        fip_id=fip,
        created_at=now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        expires_at=expires_at,
        mock_financial_records=mock_records,
    )


@app.post("/api/v1/ingest/synthesize", response_model=BorrowerProfile)
def synthesize_raw_telemetry(payload: RawIngestionPayload):
    """
    Stage 1: Raw Telemetry Ingestion & Feature Synthesis.
    Takes raw mock statement logs and mobility payloads, runs telemetry_parser.py,
    and returns calculated profile features ready for Stage 2 scoring.
    """
    # 1. Parse Financial Information via Account Aggregator parser
    aa_features = parse_aa_fi_data(payload.transactions)

    # 2. Parse Mobility & Fleet Telemetry signals
    mobility_score = parse_mobility_signals(
        vehicle_rc=payload.vehicle_rc,
        fastag_transactions=payload.fastag_transactions,
        daily_km_avg=payload.daily_km_avg,
    )

    # 3. Construct structured BorrowerProfile ready for LightGBM scoring
    profile = BorrowerProfile(
        borrower_type=payload.borrower_type,
        monthly_inflow=aa_features["monthly_inflow"],
        upi_tx_count_monthly=aa_features["upi_tx_count_monthly"],
        upi_debit_to_credit_ratio=aa_features["upi_debit_to_credit_ratio"],
        cashflow_volatility=aa_features["cashflow_volatility"],
        utility_payment_delay_days=aa_features["utility_payment_delay_days"],
        telecom_recharge_regularity=aa_features["telecom_recharge_regularity"],
        gst_filing_punctuality=payload.gst_filing_punctuality,
        ecommerce_cancellation_rate=payload.ecommerce_cancellation_rate,
        mobility_activity_score=mobility_score,
        consent_artifact_id=payload.consent_artifact_id or "AA-88219",
        data_source_mode="AA_INGESTED",
    )

    return profile


# ==============================================================================
# Stage 2: LightGBM / TreeSHAP Scoring
# ==============================================================================

@app.post("/api/v1/score", response_model=CreditScoreResponse)
def evaluate_credit(profile: BorrowerProfile, db: Session = Depends(get_db)):
    """
    Stage 2: LightGBM / TreeSHAP Scoring.
    Evaluates hard policy knockouts, computes calibrated credit score (300-900),
    and derives exact Shapley attributions for FCRA § 615 & RBI compliance.
    """
    global model, explainer, feature_columns
    if model is None or explainer is None or feature_columns is None:
        load_artifacts()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model artifacts not yet compiled. Please run python backend/train.py first.",
        )

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
            consent_artifact_id=profile.consent_artifact_id,
            data_source_mode=profile.data_source_mode,
            mobility_activity_score=profile.mobility_activity_score,
        )

    # 2. Prepare payload & align dummy columns
    input_dict = profile.model_dump()
    # Exclude metadata fields not part of model training
    input_dict.pop("consent_artifact_id", None)
    input_dict.pop("data_source_mode", None)

    input_df = pd.DataFrame([input_dict])
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
        consent_artifact_id=profile.consent_artifact_id,
        data_source_mode=profile.data_source_mode,
        mobility_activity_score=profile.mobility_activity_score,
    )
