import type { BorrowerProfile } from "../types/credit";

export interface ShapDriverItem {
  featureKey: keyof BorrowerProfile;
  label: string;
  points: number; // positive = +pts (strengths), negative = -pts (drag)
  category: "cashflow" | "discipline" | "volume";
  displayValue: string;
  description: string;
}

export function computeShapPointAttributions(
  profile: BorrowerProfile,
  isKnockout = false
): {
  drivers: ShapDriverItem[];
  positives: ShapDriverItem[];
  negatives: ShapDriverItem[];
  netImpact: number;
} {
  const drivers: ShapDriverItem[] = [];

  // 1. Telecom Regularity
  const telecomDelta = profile.telecom_recharge_regularity - 0.85;
  const telecomPts = Math.round(telecomDelta * 220);
  drivers.push({
    featureKey: "telecom_recharge_regularity",
    label: "Telecom Recharge Regularity",
    points: Math.max(-65, Math.min(55, telecomPts)),
    category: "discipline",
    displayValue: `${Math.round(profile.telecom_recharge_regularity * 100)}%`,
    description:
      profile.telecom_recharge_regularity >= 0.9
        ? "Consistent periodic mobile top-ups confirm liquidity habit"
        : "Irregular recharge patterns signal episodic cashflow stress",
  });

  // 2. UPI Transaction Volume
  const txDelta = profile.upi_tx_count_monthly - 35;
  const txPts = Math.round(txDelta * 0.9);
  drivers.push({
    featureKey: "upi_tx_count_monthly",
    label: "Monthly UPI Velocity",
    points: Math.max(-75, Math.min(65, txPts)),
    category: "volume",
    displayValue: `${profile.upi_tx_count_monthly} tx/mo`,
    description:
      profile.upi_tx_count_monthly >= 40
        ? "Robust transactional velocity shows active commercial livelihood"
        : "Low transaction density flags thin alternative footprint",
  });

  // 3. Monthly Digital Inflow
  const inflowDelta = (profile.monthly_inflow - 35000) / 10000;
  const inflowPts = Math.round(inflowDelta * 14);
  drivers.push({
    featureKey: "monthly_inflow",
    label: "Digital Inflow Volume",
    points: Math.max(-60, Math.min(75, inflowPts)),
    category: "cashflow",
    displayValue: `₹${profile.monthly_inflow.toLocaleString("en-IN")}`,
    description:
      profile.monthly_inflow >= 40000
        ? "High net verified inflows provide ample debt-service coverage"
        : "Restricted inflow volume limits debt capacity",
  });

  // 4. UPI Debit to Credit Ratio
  const d2cDelta = 0.82 - profile.upi_debit_to_credit_ratio;
  const d2cPts = Math.round(d2cDelta * 240);
  drivers.push({
    featureKey: "upi_debit_to_credit_ratio",
    label: "Debit-to-Credit Cash Burn",
    points: Math.max(-85, Math.min(60, d2cPts)),
    category: "cashflow",
    displayValue: profile.upi_debit_to_credit_ratio.toFixed(2),
    description:
      profile.upi_debit_to_credit_ratio <= 0.8
        ? "Prudent cash retention buffer with net savings accumulation"
        : "High cash outflow ratio indicates working capital depletion",
  });

  // 5. Cashflow Volatility
  const volDelta = 0.30 - profile.cashflow_volatility;
  const volPts = Math.round(volDelta * 180);
  drivers.push({
    featureKey: "cashflow_volatility",
    label: "Cashflow Volatility (σ/μ)",
    points: Math.max(-90, Math.min(50, volPts)),
    category: "cashflow",
    displayValue: profile.cashflow_volatility.toFixed(2),
    description:
      profile.cashflow_volatility <= 0.25
        ? "Stable earning periodicity with low week-over-week deviation"
        : "Erratic income swings elevate probability of default during dips",
  });

  // 6. Utility Payment Delay
  const delayDelta = 3 - profile.utility_payment_delay_days;
  const delayPts = Math.round(delayDelta * 6);
  drivers.push({
    featureKey: "utility_payment_delay_days",
    label: "Utility Delinquency Lag",
    points: Math.max(-110, Math.min(45, delayPts)),
    category: "discipline",
    displayValue: `${profile.utility_payment_delay_days} days`,
    description:
      profile.utility_payment_delay_days <= 3
        ? "Prompt bill settlement reflects financial discipline"
        : "Persistent billing delays indicate recurring cash strain",
  });

  // 7. Mobility & Fleet Activity Index (Stage 1 Feature)
  const mobilityScore = profile.mobility_activity_score ?? 50.0;
  const mobilityDelta = mobilityScore - 50.0;
  const mobilityPts = Math.round(mobilityDelta * 1.15);
  drivers.push({
    featureKey: "mobility_activity_score",
    label: "Mobility & Fleet Index",
    points: Math.max(-50, Math.min(60, mobilityPts)),
    category: "volume",
    displayValue: `${Math.round(mobilityScore)}/100`,
    description:
      mobilityScore >= 70
        ? "Active commercial transit and verified mileage confirms continuous livelihood"
        : mobilityScore >= 40
        ? "Localized route operations with moderate transit activity"
        : "Subdued vehicle movement flags restricted commercial delivery radius",
  });

  // 8. GST Filing Punctuality (Kirana Priority)
  if (profile.borrower_type === "kirana_merchant" || profile.gst_filing_punctuality > 0) {
    const gstDelta = profile.gst_filing_punctuality - 0.75;
    const gstPts = Math.round(gstDelta * 140);
    drivers.push({
      featureKey: "gst_filing_punctuality",
      label: "GST Compliance Regularity",
      points: Math.max(-50, Math.min(55, gstPts)),
      category: "discipline",
      displayValue: `${Math.round(profile.gst_filing_punctuality * 100)}%`,
      description:
        profile.gst_filing_punctuality >= 0.8
          ? "Disciplined tax filing validates legitimate commercial turnover"
          : "Delayed filings indicate informal or unorganized bookkeeping",
    });
  }

  // 9. E-Commerce Order Cancellation
  const ecomDelta = 0.06 - profile.ecommerce_cancellation_rate;
  const ecomPts = Math.round(ecomDelta * 200);
  drivers.push({
    featureKey: "ecommerce_cancellation_rate",
    label: "Order Cancellation Rate",
    points: Math.max(-55, Math.min(30, ecomPts)),
    category: "discipline",
    displayValue: `${(profile.ecommerce_cancellation_rate * 100).toFixed(1)}%`,
    description:
      profile.ecommerce_cancellation_rate <= 0.05
        ? "Normal transactional completion with low dispute/return rates"
        : "High cancellation spikes correlate with impulse spending volatility",
  });

  // If knockout rule triggered, clamp negative drivers to reflect knockout severity
  if (isKnockout) {
    drivers.forEach((d) => {
      if (d.points > 0) d.points = Math.round(d.points * 0.2);
      if (
        (d.featureKey === "utility_payment_delay_days" && profile.utility_payment_delay_days > 25) ||
        (d.featureKey === "upi_debit_to_credit_ratio" && profile.upi_debit_to_credit_ratio > 1.05) ||
        (d.featureKey === "upi_tx_count_monthly" && profile.upi_tx_count_monthly < 5)
      ) {
        d.points = -140; // Hard knockout drag
      }
    });
  }

  // Sort by absolute impact
  drivers.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

  const positives = drivers.filter((d) => d.points > 0).sort((a, b) => b.points - a.points);
  const negatives = drivers.filter((d) => d.points < 0).sort((a, b) => a.points - b.points);
  const netImpact = drivers.reduce((sum, d) => sum + d.points, 0);

  return { drivers, positives, negatives, netImpact };
}
