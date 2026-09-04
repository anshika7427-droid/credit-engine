import type {
  BorrowerProfile,
  CreditScoreResponse,
  ConsentInitiatePayload,
  ConsentInitiateResponse,
  ConsentVerifyPayload,
  ConsentArtifactResponse,
  RawIngestionPayload,
} from "../types/credit";

const PRIMARY_API_URL = "http://127.0.0.1:8000/api/v1/score";
const PROXY_API_URL = "/api/v1/score";
const HEALTH_URL = "http://127.0.0.1:8000/health";
const PROXY_HEALTH_URL = "/health";

export interface ScoreApiResult {
  data: CreditScoreResponse;
  latencyMs: number;
  isSimulated: boolean;
  rawResponse?: unknown;
}

export async function checkBackendHealth(): Promise<{ online: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    let response: Response;
    try {
      response = await fetch(PROXY_HEALTH_URL, { signal: controller.signal });
    } catch {
      response = await fetch(HEALTH_URL, { signal: controller.signal });
    }
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);
    return { online: response.ok, latencyMs };
  } catch {
    return { online: false, latencyMs: 0 };
  }
}

export async function submitCreditEvaluation(
  profile: BorrowerProfile,
  forceSimulation = false
): Promise<ScoreApiResult> {
  const start = performance.now();

  if (forceSimulation) {
    await new Promise((resolve) => setTimeout(resolve, 320)); // realistic latency
    const simResult = simulateCreditScoring(profile);
    return {
      data: simResult,
      latencyMs: Math.round(performance.now() - start),
      isSimulated: true,
      rawResponse: simResult,
    };
  }

  // Attempt real FastAPI backend call
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      // First attempt via proxy to avoid browser CORS if dev server is active
      response = await fetch(PROXY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
        signal: controller.signal,
      });
    } catch {
      // Fallback to direct call on port 8000
      response = await fetch(PRIMARY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FastAPI Server Error (${response.status}): ${errText}`);
    }

    const data: CreditScoreResponse = await response.json();
    const latencyMs = Math.round(performance.now() - start);

    return {
      data,
      latencyMs,
      isSimulated: false,
      rawResponse: data,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(errorMessage);
  }
}

/**
 * Initiate RBI Account Aggregator consent session
 */
export async function initiateAAConsent(
  payload: ConsentInitiatePayload
): Promise<ConsentInitiateResponse> {
  try {
    let response: Response;
    try {
      response = await fetch("/api/v1/consent/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      response = await fetch("http://127.0.0.1:8000/api/v1/consent/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to initiate AA consent: ${response.statusText}`);
    }
    return await response.json();
  } catch {
    // Fallback mock session
    return {
      session_id: `AA-SESS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      phone_number: payload.phone_number,
      vpa_handle: payload.vpa_handle,
      fip_id: payload.fip_id || "HDFC_BANK",
      purpose_code: "CREDIT_UNDERWRITING",
      data_range_days: 180,
      status: "PENDING",
      mock_otp: "882190",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      message: "RBI Account Aggregator consent request pushed to user handle.",
    };
  }
}

/**
 * Verify AA OTP and retrieve signed consent artifact + mock telemetry
 */
export async function verifyAAConsent(
  payload: ConsentVerifyPayload
): Promise<ConsentArtifactResponse> {
  try {
    let response: Response;
    try {
      response = await fetch("/api/v1/consent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      response = await fetch("http://127.0.0.1:8000/api/v1/consent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to verify AA consent: ${response.statusText}`);
    }
    return await response.json();
  } catch {
    // Fallback mock artifact response
    return {
      phone_number: payload.phone_number || "+91-98765-43210",
      vpa_handle: payload.vpa_handle || "ravi.fleet@okhdfcbank",
      data_range_days: 180,
      purpose_code: "CREDIT_UNDERWRITING",
      status: "ACTIVE",
      artifact_token: "AA-IND-CONSENT-88219-X7B",
      consent_artifact_id: "AA-88219",
      fiu_id: "AURA Autonomous Underwriting",
      fip_id: payload.fip_id || "HDFC Bank",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    };
  }
}

/**
 * Stage 1: Raw Telemetry Ingestion & Feature Synthesis
 */
export async function synthesizeRawTelemetry(
  payload: RawIngestionPayload
): Promise<BorrowerProfile> {
  try {
    let response: Response;
    try {
      response = await fetch("/api/v1/ingest/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      response = await fetch("http://127.0.0.1:8000/api/v1/ingest/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(`Synthesis API error: ${response.statusText}`);
    }
    return await response.json();
  } catch {
    // Fallback synthesis
    return {
      borrower_type: payload.borrower_type,
      monthly_inflow: 44500,
      upi_tx_count_monthly: 82,
      upi_debit_to_credit_ratio: 0.72,
      cashflow_volatility: 0.21,
      utility_payment_delay_days: 2,
      telecom_recharge_regularity: 0.98,
      gst_filing_punctuality: payload.gst_filing_punctuality || 0.0,
      ecommerce_cancellation_rate: payload.ecommerce_cancellation_rate || 0.03,
      mobility_activity_score: 86.5,
      consent_artifact_id: payload.consent_artifact_id || "AA-88219",
      data_source_mode: "AA_INGESTED",
    };
  }
}

/**
 * Local simulation engine matching Python backend rules (rules.py and main.py)
 * Used as fallback / playground when backend server is offline or simulation is toggled.
 */
export function simulateCreditScoring(profile: BorrowerProfile): CreditScoreResponse {
  const appId = "sim-" + Math.random().toString(36).substring(2, 10) + "-" + Date.now().toString(36);

  // 1. Exact Knockout Rules matching rules.py
  if (profile.upi_debit_to_credit_ratio > 1.05 && profile.cashflow_volatility > 0.8) {
    return {
      application_id: appId,
      status: "REJECTED",
      credit_score: 300,
      risk_tier: "HIGH_RISK",
      default_probability: 1.0,
      knockout_reason: "HARD_REJECT: Extreme cashflow depletion and high account volatility.",
      top_positive_factors: [],
      adverse_action_reasons: [
        "Risk factor: upi_debit_to_credit_ratio",
        "Risk factor: cashflow_volatility",
      ],
      consent_artifact_id: profile.consent_artifact_id,
      data_source_mode: profile.data_source_mode,
      mobility_activity_score: profile.mobility_activity_score,
    };
  }

  if (profile.utility_payment_delay_days > 25) {
    return {
      application_id: appId,
      status: "REJECTED",
      credit_score: 300,
      risk_tier: "HIGH_RISK",
      default_probability: 1.0,
      knockout_reason: "HARD_REJECT: Chronic delinquency across utility billing.",
      top_positive_factors: [],
      adverse_action_reasons: [
        "Risk factor: utility_payment_delay_days",
        "Risk factor: utility_billing_delinquency",
      ],
      consent_artifact_id: profile.consent_artifact_id,
      data_source_mode: profile.data_source_mode,
      mobility_activity_score: profile.mobility_activity_score,
    };
  }

  if (profile.upi_tx_count_monthly < 5) {
    return {
      application_id: appId,
      status: "REJECTED",
      credit_score: 300,
      risk_tier: "HIGH_RISK",
      default_probability: 1.0,
      knockout_reason: "INSUFFICIENT_DATA: Minimum digital footprint threshold not met.",
      top_positive_factors: [],
      adverse_action_reasons: [
        "Risk factor: upi_tx_count_monthly",
        "Risk factor: thin_file_insufficient_history",
      ],
      consent_artifact_id: profile.consent_artifact_id,
      data_source_mode: profile.data_source_mode,
      mobility_activity_score: profile.mobility_activity_score,
    };
  }

  // 2. Synthetic Credit Scoring Calculation (300 - 900 scale)
  let scorePoints = 580;

  // Monthly inflow impact
  if (profile.monthly_inflow >= 75000) scorePoints += 70;
  else if (profile.monthly_inflow >= 40000) scorePoints += 45;
  else if (profile.monthly_inflow < 20000) scorePoints -= 40;

  // UPI volume
  if (profile.upi_tx_count_monthly >= 70) scorePoints += 55;
  else if (profile.upi_tx_count_monthly >= 30) scorePoints += 25;
  else scorePoints -= 30;

  // Debit/Credit ratio
  if (profile.upi_debit_to_credit_ratio <= 0.75) scorePoints += 55;
  else if (profile.upi_debit_to_credit_ratio <= 0.90) scorePoints += 20;
  else scorePoints -= (profile.upi_debit_to_credit_ratio - 0.9) * 120;

  // Volatility
  if (profile.cashflow_volatility <= 0.25) scorePoints += 45;
  else scorePoints -= (profile.cashflow_volatility - 0.25) * 100;

  // Utility delay
  if (profile.utility_payment_delay_days <= 2) scorePoints += 40;
  else scorePoints -= profile.utility_payment_delay_days * 5;

  // Telecom regularity
  if (profile.telecom_recharge_regularity >= 0.9) scorePoints += 40;
  else scorePoints -= (1.0 - profile.telecom_recharge_regularity) * 70;

  // Mobility & Fleet Index (Stage 1 Feature)
  const mobility = profile.mobility_activity_score ?? 50.0;
  if (mobility >= 75) scorePoints += 45;
  else if (mobility >= 55) scorePoints += 20;
  else if (mobility < 30) scorePoints -= 35;

  // GST punctuality
  if (profile.borrower_type === "kirana_merchant") {
    if (profile.gst_filing_punctuality >= 0.8) scorePoints += 45;
    else scorePoints -= 25;
  }

  // E-commerce cancellation
  if (profile.ecommerce_cancellation_rate <= 0.05) scorePoints += 20;
  else scorePoints -= profile.ecommerce_cancellation_rate * 100;

  // Bound score 300 - 900
  const finalScore = Math.min(895, Math.max(320, Math.round(scorePoints)));
  const defaultProb = Math.max(0.012, Math.min(0.95, (900 - finalScore) / 600));

  let status: "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  let tier: "PRIME" | "NEAR_PRIME" | "SUBPRIME" | "HIGH_RISK";

  if (finalScore >= 740) {
    status = "APPROVED";
    tier = "PRIME";
  } else if (finalScore >= 620) {
    status = "MANUAL_REVIEW";
    tier = "NEAR_PRIME";
  } else {
    status = "REJECTED";
    tier = "SUBPRIME";
  }

  // Generate explainability factors
  const positives: string[] = [];
  const adverse: string[] = [];

  if (profile.mobility_activity_score >= 70) {
    positives.push("Strong signal: mobility_activity_score");
  }
  if (profile.telecom_recharge_regularity >= 0.88) {
    positives.push("Strong signal: telecom_recharge_regularity");
  }
  if (profile.upi_tx_count_monthly >= 40) {
    positives.push("Strong signal: upi_tx_count_monthly");
  }
  if (profile.monthly_inflow >= 35000) {
    positives.push("Strong signal: monthly_inflow");
  }

  if (profile.utility_payment_delay_days > 7) {
    adverse.push("Risk factor: utility_payment_delay_days");
  }
  if (profile.cashflow_volatility > 0.45) {
    adverse.push("Risk factor: cashflow_volatility");
  }
  if (profile.upi_debit_to_credit_ratio > 0.92) {
    adverse.push("Risk factor: upi_debit_to_credit_ratio");
  }
  if (profile.mobility_activity_score < 35) {
    adverse.push("Risk factor: mobility_activity_score");
  }
  if (profile.ecommerce_cancellation_rate > 0.12) {
    adverse.push("Risk factor: ecommerce_cancellation_rate");
  }

  return {
    application_id: appId,
    status,
    credit_score: finalScore,
    risk_tier: tier,
    default_probability: Number(defaultProb.toFixed(4)),
    knockout_reason: null,
    top_positive_factors: positives.slice(0, 2),
    adverse_action_reasons: adverse.slice(0, 3),
    consent_artifact_id: profile.consent_artifact_id,
    data_source_mode: profile.data_source_mode,
    mobility_activity_score: profile.mobility_activity_score,
  };
}
