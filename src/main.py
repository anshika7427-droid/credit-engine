# Re-export from backend.main for backward compatibility
from backend.main import app, evaluate_credit, health_check, initiate_aa_consent, verify_aa_consent, synthesize_raw_telemetry

__all__ = [
    "app",
    "evaluate_credit",
    "health_check",
    "initiate_aa_consent",
    "verify_aa_consent",
    "synthesize_raw_telemetry",
]
