from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class BorrowerProfile(BaseModel):
    borrower_type: str = Field(..., example="gig_worker")
    monthly_inflow: float = Field(..., example=35000.0)
    upi_tx_count_monthly: int = Field(..., example=45)
    upi_debit_to_credit_ratio: float = Field(..., example=0.82)
    cashflow_volatility: float = Field(..., example=0.25)
    utility_payment_delay_days: int = Field(..., example=3)
    telecom_recharge_regularity: float = Field(..., example=0.95)
    gst_filing_punctuality: float = Field(default=0.0, example=0.0)
    ecommerce_cancellation_rate: float = Field(..., example=0.05)
    mobility_activity_score: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Mobility & Fleet Telemetry Index (0-100) from FASTag, RC & Daily KM",
        example=78.5,
    )
    consent_artifact_id: Optional[str] = Field(
        default=None,
        description="RBI Account Aggregator Signed Consent Artifact Token",
        example="AA-88219",
    )
    data_source_mode: Literal["MANUAL_SIMULATION", "AA_INGESTED"] = Field(
        default="MANUAL_SIMULATION",
        description="Telemetry sourcing channel",
    )


class ConsentRequest(BaseModel):
    phone_number: str = Field(..., example="+91-98765-43210")
    vpa_handle: str = Field(..., example="ravi.fleet@okhdfcbank")
    data_range_days: int = Field(default=180, example=180)
    purpose_code: str = Field(default="CREDIT_UNDERWRITING", example="CREDIT_UNDERWRITING")
    fip_id: Optional[str] = Field(default="HDFC_BANK", example="HDFC_BANK")
    persona_id: Optional[str] = Field(default="gig_prime", example="gig_prime")


class ConsentArtifactResponse(BaseModel):
    phone_number: str
    vpa_handle: str
    data_range_days: int
    purpose_code: str
    status: Literal["PENDING", "ACTIVE", "REVOKED", "EXPIRED"]
    artifact_token: Optional[str] = None
    consent_artifact_id: Optional[str] = None
    fiu_id: str = "AURA Autonomous Underwriting"
    fip_id: Optional[str] = None
    created_at: Optional[str] = None
    expires_at: Optional[str] = None
    mock_financial_records: Optional[Dict[str, Any]] = None


class ConsentVerifyRequest(BaseModel):
    session_id: Optional[str] = None
    phone_number: Optional[str] = None
    vpa_handle: Optional[str] = None
    otp: str = Field(..., example="882190")
    fip_id: Optional[str] = "HDFC Bank"
    persona_id: Optional[str] = "gig_prime"


class RawIngestionPayload(BaseModel):
    borrower_type: str = Field(default="gig_worker", example="gig_worker")
    transactions: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Raw mock bank / UPI JSON transaction records",
    )
    vehicle_rc: Optional[str] = Field(
        default="KA-01-EQ-4921",
        description="Vehicle registration certificate identifier",
    )
    fastag_transactions: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="FASTag toll transit records",
    )
    daily_km_avg: float = Field(
        default=65.0,
        description="Average daily vehicle mileage (KM)",
    )
    gst_filing_punctuality: float = Field(default=0.0, example=0.0)
    ecommerce_cancellation_rate: float = Field(default=0.04, example=0.04)
    consent_artifact_id: Optional[str] = Field(default="AA-88219")
    fip_name: Optional[str] = Field(default="HDFC Bank")


class CreditScoreResponse(BaseModel):
    application_id: str
    status: str
    credit_score: Optional[int] = None
    risk_tier: Optional[str] = None
    default_probability: Optional[float] = None
    knockout_reason: Optional[str] = None
    top_positive_factors: List[str] = []
    adverse_action_reasons: List[str] = []
    consent_artifact_id: Optional[str] = None
    data_source_mode: Optional[str] = None
    mobility_activity_score: Optional[float] = None
