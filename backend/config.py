from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

DATA_PATH = DATA_DIR / "credit_training_data.csv"
DB_PATH = DATA_DIR / "credit.db"

MODEL_PATH = ARTIFACTS_DIR / "credit_model.pkl"
EXPLAINER_PATH = ARTIFACTS_DIR / "shap_explainer.pkl"
FEATURES_PATH = ARTIFACTS_DIR / "feature_columns.pkl"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
