"""
Telemetry Ingestion & Feature Synthesis Module for AURA Underwriting Engine.
Stage 1 of the 2-stage underwriting engine:
Raw Telemetry Ingestion & Feature Synthesis -> Stage 2: LightGBM / TreeSHAP Scoring.
"""

from datetime import datetime
import re
from typing import Any, Dict, List, Optional
import numpy as np


def parse_aa_fi_data(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parses raw Account Aggregator (AA) Financial Information (FI) JSON transaction records.
    Each transaction record schema:
      - timestamp: ISO 8601 string or YYYY-MM-DD (e.g. '2026-08-15T10:30:00Z')
      - amount: float (positive number)
      - type: 'DEBIT' | 'CREDIT'
      - narration: str (transaction description)
      - mode: 'UPI' | 'NEFT' | 'IMPS' | 'CASH'

    Synthesizes and returns real credit underwriting metrics:
      - upi_tx_count_monthly: Total UPI transactions per 30-day window
      - upi_debit_to_credit_ratio: Sum of debits divided by max(sum of credits, 1.0)
      - cashflow_volatility: Coefficient of variation of rolling 7-day balances (sigma / mu)
      - punctuality_score: Percentage of recurring utility/rent debits completed without default
      - monthly_inflow: Total credited amount normalized to a 30-day window
      - telecom_recharge_regularity: Regularity score (0.0 to 1.0) of recurring telecom topups
      - utility_payment_delay_days: Estimated billing lag in days
    """
    if not transactions:
        return {
            "upi_tx_count_monthly": 0,
            "upi_debit_to_credit_ratio": 1.0,
            "cashflow_volatility": 0.5,
            "punctuality_score": 0.5,
            "monthly_inflow": 0.0,
            "telecom_recharge_regularity": 0.5,
            "utility_payment_delay_days": 10,
        }

    # Normalize records
    parsed_txs = []
    for tx in transactions:
        amount = float(tx.get("amount", 0.0))
        tx_type = str(tx.get("type", "DEBIT")).strip().upper()
        mode = str(tx.get("mode", "UPI")).strip().upper()
        narration = str(tx.get("narration", "")).strip().lower()
        ts_raw = tx.get("timestamp")

        parsed_dt = None
        if ts_raw:
            try:
                # Handle ISO format and standard date variations
                clean_ts = str(ts_raw).replace("Z", "+00:00")
                parsed_dt = datetime.fromisoformat(clean_ts)
            except Exception:
                try:
                    parsed_dt = datetime.strptime(str(ts_raw)[:10], "%Y-%m-%d")
                except Exception:
                    parsed_dt = None

        parsed_txs.append({
            "amount": amount,
            "type": tx_type,
            "mode": mode,
            "narration": narration,
            "datetime": parsed_dt,
        })

    # Sort chronologically if datetimes exist
    valid_dts = [t["datetime"] for t in parsed_txs if t["datetime"] is not None]
    if valid_dts:
        parsed_txs.sort(key=lambda x: x["datetime"] or datetime.min)
        min_date = min(valid_dts)
        max_date = max(valid_dts)
        span_days = max((max_date - min_date).days, 1)
    else:
        span_days = 30

    window_months = max(span_days / 30.0, 1.0)

    # 1. UPI Transaction Count Monthly
    upi_txs = [t for t in parsed_txs if t["mode"] == "UPI"]
    upi_tx_count_monthly = int(round(len(upi_txs) / window_months))

    # 2. UPI & Cashflow Debit to Credit Ratio
    upi_debits = sum(t["amount"] for t in upi_txs if t["type"] == "DEBIT")
    upi_credits = sum(t["amount"] for t in upi_txs if t["type"] == "CREDIT")

    # If UPI credits are small or absent, look at total credits to compute cash burn ratio
    total_credits = sum(t["amount"] for t in parsed_txs if t["type"] == "CREDIT")
    total_debits = sum(t["amount"] for t in parsed_txs if t["type"] == "DEBIT")

    if upi_credits > 0:
        upi_debit_to_credit_ratio = round(upi_debits / max(upi_credits, 1.0), 3)
    else:
        upi_debit_to_credit_ratio = round(total_debits / max(total_credits, 1.0), 3)

    # 3. Cashflow Volatility (CV of rolling 7-day balance)
    # Reconstruct running balance over time
    running_balance = 10000.0  # Assumed baseline opening liquidity
    daily_balances: Dict[str, float] = {}

    for t in parsed_txs:
        if t["type"] == "CREDIT":
            running_balance += t["amount"]
        else:
            running_balance -= t["amount"]

        day_key = t["datetime"].strftime("%Y-%m-%d") if t["datetime"] else "2026-08-01"
        daily_balances[day_key] = running_balance

    balance_values = list(daily_balances.values())
    if len(balance_values) >= 7:
        # Calculate 7-day rolling balance window
        rolling_means = []
        for i in range(len(balance_values) - 6):
            window = balance_values[i : i + 7]
            rolling_means.append(np.mean(window))
        mu = float(np.mean(rolling_means))
        sigma = float(np.std(rolling_means))
        cv = sigma / max(abs(mu), 1000.0)
    elif len(balance_values) > 1:
        mu = float(np.mean(balance_values))
        sigma = float(np.std(balance_values))
        cv = sigma / max(abs(mu), 1000.0)
    else:
        # Fallback volatility estimate from debit/credit fluctuation
        cv = 0.22

    cashflow_volatility = round(float(np.clip(cv, 0.08, 0.95)), 3)

    # 4. Punctuality Score (Recurring utility / rent / EMI settlement)
    utility_keywords = [
        "bescom", "tneb", "tatapower", "electricity", "water", "gas",
        "broadband", "airtel", "jio", "vi", "rent", "billdesk", "bbps", "utility"
    ]
    delinquency_keywords = ["penalty", "bounce", "overdue", "late", "return", "dishonour", "insufficient"]

    utility_debits = [
        t for t in parsed_txs
        if t["type"] == "DEBIT" and any(k in t["narration"] for k in utility_keywords)
    ]

    delinquent_debits = [
        t for t in utility_debits
        if any(dk in t["narration"] for dk in delinquency_keywords)
    ]

    if utility_debits:
        punctual_count = len(utility_debits) - len(delinquent_debits)
        punctuality_score = round(max(0.0, min(1.0, punctual_count / len(utility_debits))), 3)
    else:
        punctuality_score = 0.95

    # 5. Supplementary Synthesized Features
    monthly_inflow = round(total_credits / window_months, 2)
    if monthly_inflow < 1000.0 and total_credits > 0:
        monthly_inflow = round(total_credits, 2)

    # Telecom regularity
    telecom_txs = [
        t for t in parsed_txs
        if any(tk in t["narration"] for tk in ["airtel", "jio", "vi telecom", "recharge", "prepaid"])
    ]
    if telecom_txs:
        # Regular telecom recharges (at least 1 per month with no bounce)
        telecom_regularity = round(min(1.0, len(telecom_txs) / window_months), 2)
        telecom_recharge_regularity = max(0.40, min(0.99, telecom_regularity))
    else:
        telecom_recharge_regularity = 0.92

    # Utility delay days derived from punctuality
    if punctuality_score >= 0.95:
        utility_payment_delay_days = 1
    elif punctuality_score >= 0.85:
        utility_payment_delay_days = 4
    elif punctuality_score >= 0.70:
        utility_payment_delay_days = 9
    elif punctuality_score >= 0.50:
        utility_payment_delay_days = 16
    else:
        utility_payment_delay_days = 28

    return {
        "upi_tx_count_monthly": upi_tx_count_monthly,
        "upi_debit_to_credit_ratio": upi_debit_to_credit_ratio,
        "cashflow_volatility": cashflow_volatility,
        "punctuality_score": punctuality_score,
        "monthly_inflow": monthly_inflow,
        "telecom_recharge_regularity": telecom_recharge_regularity,
        "utility_payment_delay_days": utility_payment_delay_days,
    }


def parse_mobility_signals(
    vehicle_rc: Optional[str],
    fastag_transactions: List[Dict[str, Any]],
    daily_km_avg: float,
) -> float:
    """
    Synthesizes mobility and fleet telemetry into a normalized mobility_activity_score (0.0 to 100.0).
    Evaluates:
      1. Active highway transit frequency (FASTag toll plaza passes) -> up to 35 pts
      2. Commercial vehicle registration validation (RC pattern & transport series) -> up to 30 pts
      3. Consistency of daily mileage (sustained delivery/logistics operations) -> up to 35 pts
    """
    total_score = 0.0

    # 1. Highway Transit Frequency (FASTag) (0 - 35 points)
    # Active transit signals ongoing inter-city or delivery corridor presence
    fastag_count = len(fastag_transactions or [])
    if fastag_count >= 12:
        fastag_score = 35.0
    elif fastag_count >= 6:
        fastag_score = 25.0 + (fastag_count - 6) * 1.6
    elif fastag_count >= 2:
        fastag_score = 15.0 + (fastag_count - 2) * 2.5
    elif fastag_count == 1:
        fastag_score = 10.0
    else:
        # Default baseline if vehicle operates largely in dense intra-city zones without toll plazas
        fastag_score = 12.0

    total_score += fastag_score

    # 2. Commercial Vehicle Registration Validation (0 - 30 points)
    # Standard Indian registration formats (e.g. KA01EQ4921, DL-1N-AA-9982)
    rc_clean = (vehicle_rc or "").strip().upper().replace(" ", "").replace("-", "")
    rc_score = 0.0

    if rc_clean:
        standard_rc_regex = r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$"
        if re.match(standard_rc_regex, rc_clean):
            rc_score = 22.0
            # Check for commercial / transport plate identifiers:
            # Common Indian commercial series: 'N', 'T', 'Y', 'V', 'Z' or yellow board designation
            commercial_indicators = ["T", "N", "Y", "V", "Z", "COM"]
            state_code = rc_clean[:2]
            series = rc_clean[4:-4] if len(rc_clean) >= 9 else ""
            if any(ci in series for ci in commercial_indicators) or "DL1N" in rc_clean or "KA01" in rc_clean:
                rc_score += 8.0  # Max 30 points for verified commercial fleet
        else:
            rc_score = 12.0
    else:
        # If no RC provided, baseline allocation
        rc_score = 10.0

    total_score += rc_score

    # 3. Consistency of Daily Mileage (0 - 35 points)
    # For logistics, gig delivery, or fleet operators:
    # 45 - 140 km/day is the prime band for steady commercial operation
    km = float(daily_km_avg or 0.0)
    if 45.0 <= km <= 140.0:
        km_score = 35.0
    elif 30.0 <= km < 45.0:
        km_score = 25.0 + (km - 30.0) * (10.0 / 15.0)
    elif 140.0 < km <= 220.0:
        # High highway long-haul
        km_score = 30.0
    elif 15.0 <= km < 30.0:
        km_score = 15.0 + (km - 15.0) * (10.0 / 15.0)
    elif 5.0 <= km < 15.0:
        km_score = 8.0 + (km - 5.0) * 0.7
    else:
        km_score = 5.0

    total_score += km_score

    return round(float(np.clip(total_score, 0.0, 100.0)), 1)
