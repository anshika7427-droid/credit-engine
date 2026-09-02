from src.schemas import BorrowerProfile


def check_knockout_rules(profile: BorrowerProfile):
    # Severe liquidity deficit
    if profile.upi_debit_to_credit_ratio > 1.05 and profile.cashflow_volatility > 0.80:
        return "HARD_REJECT: Extreme cashflow depletion and high account volatility."

    # Chronic delinquent utilities
    if profile.utility_payment_delay_days > 25:
        return "HARD_REJECT: Chronic delinquency across utility billing."

    # Inactivity / thin file floor
    if profile.upi_tx_count_monthly < 5:
        return "INSUFFICIENT_DATA: Minimum digital footprint threshold not met."

    return None
