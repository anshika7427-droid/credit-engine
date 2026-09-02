import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";

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
    };
  }

  // 2. Synthetic Credit Scoring Calculation (300 - 900 scale)
  let scorePoints = 580;

  // Monthly inflow impact
  if (profile.monthly_inflow >= 75000) scorePoints += 80;
  else if (profile.monthly_inflow >= 40000) scorePoints += 50;
  else if (profile.monthly_inflow < 20000) scorePoints -= 40;

  // UPI volume
  if (profile.upi_tx_count_monthly >= 70) scorePoints += 60;
  else if (profile.upi_tx_count_monthly >= 30) scorePoints += 30;
  else scorePoints -= 30;

  // Debit/Credit ratio
  if (profile.upi_debit_to_credit_ratio <= 0.75) scorePoints += 60;
  else if (profile.upi_debit_to_credit_ratio <= 0.90) scorePoints += 20;
  else scorePoints -= (profile.upi_debit_to_credit_ratio - 0.9) * 120;

  // Volatility
  if (profile.cashflow_volatility <= 0.25) scorePoints += 50;
  else scorePoints -= (profile.cashflow_volatility - 0.25) * 100;

  // Utility delay
  if (profile.utility_payment_delay_days <= 2) scorePoints += 40;
  else scorePoints -= profile.utility_payment_delay_days * 5;

  // Telecom regularity
  if (profile.telecom_recharge_regularity >= 0.9) scorePoints += 40;
  else scorePoints -= (1.0 - profile.telecom_recharge_regularity) * 70;

  // GST punctuality
  if (profile.borrower_type === "kirana_merchant") {
    if (profile.gst_filing_punctuality >= 0.8) scorePoints += 50;
    else scorePoints -= 30;
  }

  // E-commerce cancellation
  if (profile.ecommerce_cancellation_rate <= 0.05) scorePoints += 20;
  else scorePoints -= profile.ecommerce_cancellation_rate * 120;

  // Bound score 300 - 900
  const finalScore = Math.min(890, Math.max(320, Math.round(scorePoints)));
  const defaultProb = Math.max(0.015, Math.min(0.95, (900 - finalScore) / 600));

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

  if (profile.telecom_recharge_regularity >= 0.88) {
    positives.push("Strong signal: telecom_recharge_regularity");
  }
  if (profile.upi_tx_count_monthly >= 40) {
    positives.push("Strong signal: upi_tx_count_monthly");
  }
  if (profile.monthly_inflow >= 35000) {
    positives.push("Strong signal: monthly_inflow");
  }
  if (profile.upi_debit_to_credit_ratio < 0.8) {
    positives.push("Strong signal: upi_debit_to_credit_ratio");
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
  };
}
