import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ingestion.telemetry_parser import parse_aa_fi_data, parse_mobility_signals
from backend.schemas import BorrowerProfile

client = TestClient(app)


def test_telemetry_parser_aa():
    raw_txs = [
        {"timestamp": "2026-08-01T10:00:00Z", "amount": 1500.0, "type": "CREDIT", "narration": "UPI/Zomato Settlement", "mode": "UPI"},
        {"timestamp": "2026-08-02T11:00:00Z", "amount": 350.0, "type": "DEBIT", "narration": "UPI/HPCL Petrol", "mode": "UPI"},
        {"timestamp": "2026-08-10T12:00:00Z", "amount": 499.0, "type": "DEBIT", "narration": "UPI/Airtel Recharge", "mode": "UPI"},
        {"timestamp": "2026-08-15T15:00:00Z", "amount": 800.0, "type": "DEBIT", "narration": "BBPS/Bescom Electricity Bill", "mode": "NEFT"},
    ]
    metrics = parse_aa_fi_data(raw_txs)
    assert metrics["upi_tx_count_monthly"] > 0
    assert metrics["upi_debit_to_credit_ratio"] > 0
    assert 0.0 <= metrics["cashflow_volatility"] <= 1.0
    assert 0.0 <= metrics["punctuality_score"] <= 1.0


def test_telemetry_parser_mobility():
    fastag = [
        {"timestamp": "2026-08-05", "toll_plaza": "Electronic City Tollway", "amount": 65.0},
        {"timestamp": "2026-08-12", "toll_plaza": "Electronic City Tollway", "amount": 65.0},
    ]
    score = parse_mobility_signals(
        vehicle_rc="KA-01-EQ-4921",
        fastag_transactions=fastag,
        daily_km_avg=75.0,
    )
    assert 0.0 <= score <= 100.0
    assert score > 60.0  # Prime fleet profile


def test_consent_flow_roundtrip():
    # 1. Initiate Consent
    init_res = client.post("/api/v1/consent/initiate", json={
        "phone_number": "+91-98765-43210",
        "vpa_handle": "ravi.fleet@okhdfcbank",
        "fip_id": "HDFC_BANK",
        "data_range_days": 180,
    })
    assert init_res.status_code == 200
    init_data = init_res.json()
    assert init_data["status"] == "PENDING"
    assert "session_id" in init_data

    # 2. Verify Consent & Pull Encrypted Records
    verify_res = client.post("/api/v1/consent/verify", json={
        "session_id": init_data["session_id"],
        "otp": "882190",
        "fip_id": "HDFC Bank",
        "persona_id": "gig_prime",
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "ACTIVE"
    assert verify_data["artifact_token"].startswith("AA-IND-CONSENT-88219")
    assert verify_data["consent_artifact_id"] == "AA-88219"
    assert "mock_financial_records" in verify_data

    # 3. Synthesize Raw Telemetry (Stage 1)
    raw_payload = verify_data["mock_financial_records"]
    synth_res = client.post("/api/v1/ingest/synthesize", json={
        "borrower_type": raw_payload["borrower_type"],
        "transactions": raw_payload["transactions"],
        "vehicle_rc": raw_payload["vehicle_rc"],
        "fastag_transactions": raw_payload["fastag_transactions"],
        "daily_km_avg": raw_payload["daily_km_avg"],
        "gst_filing_punctuality": raw_payload["gst_filing_punctuality"],
        "ecommerce_cancellation_rate": raw_payload["ecommerce_cancellation_rate"],
        "consent_artifact_id": verify_data["consent_artifact_id"],
    })
    assert synth_res.status_code == 200
    profile_data = synth_res.json()
    assert profile_data["borrower_type"] == "gig_worker"
    assert profile_data["data_source_mode"] == "AA_INGESTED"
    assert profile_data["consent_artifact_id"] == "AA-88219"
    assert 0.0 <= profile_data["mobility_activity_score"] <= 100.0

    # 4. Underwriting Scoring with LightGBM & TreeSHAP (Stage 2)
    score_res = client.post("/api/v1/score", json=profile_data)
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["status"] in ["APPROVED", "MANUAL_REVIEW"]
    assert 300 <= score_data["credit_score"] <= 900
    assert 0.0 <= score_data["default_probability"] <= 1.0
    assert score_data["consent_artifact_id"] == "AA-88219"
    assert score_data["data_source_mode"] == "AA_INGESTED"
    assert len(score_data["top_positive_factors"]) > 0 or len(score_data["adverse_action_reasons"]) > 0


def test_score_knockout():
    knockout_profile = {
        "borrower_type": "gig_worker",
        "monthly_inflow": 18000.0,
        "upi_tx_count_monthly": 12,
        "upi_debit_to_credit_ratio": 1.25,
        "cashflow_volatility": 0.88,
        "utility_payment_delay_days": 28,
        "telecom_recharge_regularity": 0.40,
        "gst_filing_punctuality": 0.0,
        "ecommerce_cancellation_rate": 0.25,
        "mobility_activity_score": 15.0,
    }
    score_res = client.post("/api/v1/score", json=knockout_profile)
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["status"] == "REJECTED"
    assert score_data["credit_score"] == 300
    assert score_data["default_probability"] == 1.0
    assert score_data["knockout_reason"] is not None
