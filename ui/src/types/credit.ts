export interface BorrowerProfile {
  borrower_type: "gig_worker" | "kirana_merchant" | "freelancer";
  monthly_inflow: number;
  upi_tx_count_monthly: number;
  upi_debit_to_credit_ratio: number;
  cashflow_volatility: number;
  utility_payment_delay_days: number;
  telecom_recharge_regularity: number;
  gst_filing_punctuality: number;
  ecommerce_cancellation_rate: number;
}

export interface CreditScoreResponse {
  application_id: string;
  status: "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  credit_score: number;
  risk_tier: "PRIME" | "NEAR_PRIME" | "SUBPRIME" | "HIGH_RISK";
  default_probability: number;
  knockout_reason: string | null;
  top_positive_factors: string[];
  adverse_action_reasons: string[];
}

export interface EvaluationRecord {
  id: string;
  timestamp: string;
  profile: BorrowerProfile;
  result: CreditScoreResponse;
  latencyMs?: number;
}

export interface PersonaPreset {
  id: string;
  name: string;
  shortName?: string;
  personName?: string;
  description: string;
  badge: string;
  dotColor?: "emerald" | "blue" | "amber" | "rose";
  profile: BorrowerProfile;
}
