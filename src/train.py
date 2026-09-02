import joblib
import lightgbm as lgb
import pandas as pd
import shap
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

from src.config import DATA_PATH, EXPLAINER_PATH, FEATURES_PATH, MODEL_PATH


def train():
    df = pd.read_csv(DATA_PATH)

    # One-hot encode borrower_type
    df = pd.get_dummies(df, columns=["borrower_type"], drop_first=False)

    X = df.drop(columns=["is_default"])
    y = df["is_default"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train LightGBM classifier
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

    print(f"\nArtifacts saved successfully in {MODEL_PATH.parent}")


if __name__ == "__main__":
    train()
