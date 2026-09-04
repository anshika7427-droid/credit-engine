from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd

from backend.config import DATA_PATH

np.random.seed(42)
n_samples = 10000

borrower_types = np.random.choice(
    ["gig_worker", "kirana_merchant", "freelancer"],
    size=n_samples,
    p=[0.4, 0.4, 0.2],
)
monthly_inflow = np.random.lognormal(mean=10.2, sigma=0.5, size=n_samples)
upi_tx_count_monthly = np.random.poisson(lam=45, size=n_samples)
upi_debit_to_credit_ratio = np.random.uniform(0.6, 1.1, size=n_samples)
cashflow_volatility = np.random.uniform(0.1, 0.9, size=n_samples)
utility_payment_delay_days = np.random.negative_binomial(n=1, p=0.2, size=n_samples)
telecom_recharge_regularity = np.random.uniform(0.2, 1.0, size=n_samples)
gst_filing_punctuality = np.random.uniform(0.0, 1.0, size=n_samples)
gst_filing_punctuality[borrower_types != "kirana_merchant"] = 0.0
ecommerce_cancellation_rate = np.random.uniform(0.02, 0.35, size=n_samples)

# Synthesize Mobility & Fleet Index (0.0 to 100.0)
# Delivery fleet workers show strong mobility clusters (mean 72), Kiranas lower/moderate (mean 42), Freelancers (mean 36)
mobility_activity_score = np.zeros(n_samples)
for i in range(n_samples):
    btype = borrower_types[i]
    if btype == "gig_worker":
        score = np.random.normal(loc=72.0, scale=14.0)
    elif btype == "kirana_merchant":
        score = np.random.normal(loc=44.0, scale=16.0)
    else:
        score = np.random.normal(loc=36.0, scale=15.0)
    mobility_activity_score[i] = np.clip(score, 5.0, 99.0)

# Gig delivery fleet workers with steady mobility signals show ~18% lower default rates
log_odds = (
    -2.0
    + 2.5 * cashflow_volatility
    + 1.8 * (upi_debit_to_credit_ratio - 0.8)
    + 0.12 * utility_payment_delay_days
    - 2.0 * telecom_recharge_regularity
    - 1.5 * gst_filing_punctuality
    + 1.2 * ecommerce_cancellation_rate
    - 0.024 * (mobility_activity_score - 50.0)
)

prob_default = 1 / (1 + np.exp(-log_odds))
is_default = (np.random.rand(n_samples) < prob_default).astype(int)

df = pd.DataFrame(
    {
        "borrower_type": borrower_types,
        "monthly_inflow": monthly_inflow.round(2),
        "upi_tx_count_monthly": upi_tx_count_monthly,
        "upi_debit_to_credit_ratio": upi_debit_to_credit_ratio.round(3),
        "cashflow_volatility": cashflow_volatility.round(3),
        "utility_payment_delay_days": utility_payment_delay_days,
        "telecom_recharge_regularity": telecom_recharge_regularity.round(3),
        "gst_filing_punctuality": gst_filing_punctuality.round(3),
        "ecommerce_cancellation_rate": ecommerce_cancellation_rate.round(3),
        "mobility_activity_score": mobility_activity_score.round(1),
        "is_default": is_default,
    }
)

df.to_csv(DATA_PATH, index=False)
print(
    f"Generated {n_samples} records at {DATA_PATH}. Default rate:"
    f" {df['is_default'].mean():.2%}. Mean mobility: {df['mobility_activity_score'].mean():.1f}"
)
