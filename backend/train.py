from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import joblib
import lightgbm as lgb
import pandas as pd
import shap
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

try:
    from backend.config import (
        ARTIFACTS_DIR,
        DATA_PATH,
        EXPLAINER_PATH,
        FEATURES_PATH,
        MODEL_PATH,
    )
except ImportError:
    from src.config import (
        ARTIFACTS_DIR,
        DATA_PATH,
        EXPLAINER_PATH,
        FEATURES_PATH,
        MODEL_PATH,
    )


def train():
    df = pd.read_csv(DATA_PATH)

    # One-hot encode borrower_type
    df = pd.get_dummies(df, columns=["borrower_type"], drop_first=False)

    X = df.drop(columns=["is_default"])
    y = df["is_default"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train LightGBM classifier with mobility_activity_score
    model = lgb.LGBMClassifier(
        n_estimators=150,
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
        verbose=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    preds = model.predict_proba(X_test)[:, 1]
    roc_score = roc_auc_score(y_test, preds)
    print(f"Model ROC-AUC: {roc_score:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, (preds > 0.5).astype(int)))

    # Create SHAP TreeExplainer
    explainer = shap.TreeExplainer(model)

    # Export pipeline artifacts
    joblib.dump(model, MODEL_PATH)
    joblib.dump(explainer, EXPLAINER_PATH)
    joblib.dump(X.columns.tolist(), FEATURES_PATH)

    # Also export to models/ directory if requested
    models_dir = BASE_DIR / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, models_dir / "credit_model.pkl")
    joblib.dump(explainer, models_dir / "shap_explainer.pkl")
    joblib.dump(X.columns.tolist(), models_dir / "feature_columns.pkl")

    print(f"\nArtifacts saved successfully in {MODEL_PATH.parent} and {models_dir}")
    print(f"Trained features: {X.columns.tolist()}")


if __name__ == "__main__":
    train()
