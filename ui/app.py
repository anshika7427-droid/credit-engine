import json
import requests
import streamlit as st

st.set_page_config(
    page_title="Alternative Credit Scoring Engine",
    page_icon="💳",
    layout="wide",
)

st.title("💳 Alternative Data Underwriting Hub")
st.caption("AI-Powered Credit Decisioning for Thin-File & Gig Borrowers")

# Sidebar for borrower telemetry inputs
st.sidebar.header("Borrower Telemetry Input")

borrower_type = st.sidebar.selectbox(
    "Borrower Persona", ["gig_worker", "kirana_merchant", "freelancer"]
)
monthly_inflow = st.sidebar.number_input(
    "Monthly Inflows (₹)", min_value=1000.0, value=35000.0, step=1000.0
)
upi_tx_count = st.sidebar.slider(
    "Monthly UPI Transactions", min_value=0, max_value=150, value=45
)
debit_credit_ratio = st.sidebar.slider(
    "UPI Debit-to-Credit Ratio", min_value=0.1, max_value=1.5, value=0.82
)
volatility = st.sidebar.slider(
    "Cashflow Volatility (σ / μ)", min_value=0.0, max_value=1.0, value=0.25
)
utility_delay = st.sidebar.slider(
    "Utility Payment Delay (Days)", min_value=0, max_value=60, value=3
)
telecom_regularity = st.sidebar.slider(
    "Telecom Recharge Consistency", min_value=0.0, max_value=1.0, value=0.95
)
gst_punctuality = st.sidebar.slider(
    "GST Filing Punctuality",
    min_value=0.0,
    max_value=1.0,
    value=0.0 if borrower_type != "kirana_merchant" else 0.85,
)
ecom_cancellation = st.sidebar.slider(
    "E-Commerce Cancellation Rate", min_value=0.0, max_value=0.5, value=0.05
)

# Score application
if st.sidebar.button("Evaluate Application", type="primary", use_container_width=True):
    payload = {
        "borrower_type": borrower_type,
        "monthly_inflow": monthly_inflow,
        "upi_tx_count_monthly": upi_tx_count,
        "upi_debit_to_credit_ratio": debit_credit_ratio,
        "cashflow_volatility": volatility,
        "utility_payment_delay_days": utility_delay,
        "telecom_recharge_regularity": telecom_regularity,
        "gst_filing_punctuality": gst_punctuality,
        "ecommerce_cancellation_rate": ecom_cancellation,
    }

    try:
        res = requests.post("http://127.0.0.1:8000/api/v1/score", json=payload)
        if res.status_code == 200:
            data = res.json()

            col1, col2, col3 = st.columns(3)

            # Underwriting verdict
            status = data["status"]
            if status == "APPROVED":
                col1.metric("Status", "APPROVED", delta="Prime Borrower")
            elif status == "MANUAL_REVIEW":
                col1.metric("Status", "REVIEW", delta="Borderline Risk")
            else:
                col1.metric("Status", "REJECTED", delta="-High Risk")

            col2.metric("Credit Score", f"{data['credit_score']} / 900")
            col3.metric(
                "Default Probability", f"{data['default_probability'] * 100:.2f}%"
            )

            st.markdown("---")

            # Knockout alerts
            if data.get("knockout_reason"):
                st.error(f"⚠️ Knockout Triggered: {data['knockout_reason']}")

            # SHAP Explainability cards
            c_left, c_right = st.columns(2)

            with c_left:
                st.subheader("✅ Credit Strengths")
                if data["top_positive_factors"]:
                    for factor in data["top_positive_factors"]:
                        st.success(factor)
                else:
                    st.write("No major positive indicators found.")

            with c_right:
                st.subheader("⚠️ Adverse Action Risk Factors")
                if data["adverse_action_reasons"]:
                    for factor in data["adverse_action_reasons"]:
                        st.warning(factor)
                else:
                    st.write("No adverse factors flagged.")

            # Regulatory JSON output
            with st.expander("Underwriting Audit Trail (JSON)"):
                st.json(data)

        else:
            st.error(f"API Error ({res.status_code}): {res.text}")

    except requests.exceptions.ConnectionError:
        st.error(
            "Cannot connect to FastAPI backend. Ensure `uvicorn src.main:app` is running on port 8000."
        )
