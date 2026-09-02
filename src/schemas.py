from typing import List, Optional  # noqa: UP035

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


class CreditScoreResponse(BaseModel):
    application_id: str
    status: str
    credit_score: Optional[int] = None
    risk_tier: Optional[str] = None
    default_probability: Optional[float] = None
    knockout_reason: Optional[str] = None
    top_positive_factors: List[str] = []
    adverse_action_reasons: List[str] = []
