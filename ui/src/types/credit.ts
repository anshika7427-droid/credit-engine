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
  mobility_activity_score: number; // 0.0 to 100.0
  consent_artifact_id?: string | null;
  data_source_mode?: "MANUAL_SIMULATION" | "AA_INGESTED";
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
  consent_artifact_id?: string | null;
  data_source_mode?: string | null;
  mobility_activity_score?: number | null;
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
  phone?: string;
  vpaHandle?: string;
  vehicleRc?: string;
}

export interface ConsentInitiatePayload {
  phone_number: string;
  vpa_handle: string;
  data_range_days?: number;
  purpose_code?: string;
  fip_id?: string;
  persona_id?: string;
}

export interface ConsentInitiateResponse {
  session_id: string;
  phone_number: string;
  vpa_handle: string;
  fip_id: string;
  purpose_code: string;
  data_range_days: number;
  status: "PENDING";
  mock_otp: string;
  created_at: string;
  expires_at: string;
  message: string;
}

export interface ConsentVerifyPayload {
  session_id?: string;
  phone_number?: string;
  vpa_handle?: string;
  otp: string;
  fip_id?: string;
  persona_id?: string;
}

export interface RawIngestionPayload {
  borrower_type: "gig_worker" | "kirana_merchant" | "freelancer";
  transactions: Array<{
    timestamp: string;
    amount: number;
    type: "DEBIT" | "CREDIT";
    narration: string;
    mode: "UPI" | "NEFT" | "IMPS" | "CASH";
  }>;
  vehicle_rc?: string;
  fastag_transactions: Array<{
    timestamp: string;
    toll_plaza: string;
    amount: number;
  }>;
  daily_km_avg: number;
  gst_filing_punctuality?: number;
  ecommerce_cancellation_rate?: number;
  consent_artifact_id?: string;
  fip_name?: string;
}

export interface ConsentArtifactResponse {
  phone_number: string;
  vpa_handle: string;
  data_range_days: number;
  purpose_code: string;
  status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";
  artifact_token: string;
  consent_artifact_id: string;
  fiu_id: string;
  fip_id?: string;
  created_at: string;
  expires_at: string;
  mock_financial_records?: RawIngestionPayload;
}
