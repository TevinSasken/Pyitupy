import pandas as pd
import joblib
import os
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Ensure models directory exists
os.makedirs("ml/models", exist_ok=True)

def train_and_save_model(data_path, model_path, label_column):
    # Load dataset
    df = pd.read_csv(data_path)
    
    # Features and labels
    X = df.drop(columns=[label_column])
    y = df[label_column]
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train logistic regression
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model trained for {data_path} — Accuracy: {acc:.2f}")
    
    # Save model
    joblib.dump(model, model_path)
    print(f"💾 Model saved to {model_path}\n")


if __name__ == "__main__":
    # Train individual model
    train_and_save_model(
        data_path="ml/data/individual_features.csv",
        model_path="ml/models/individual_model.pkl",
        label_column="label_default"
    )
    
    # Train business model
    train_and_save_model(
        data_path="ml/data/business_features.csv",
        model_path="ml/models/business_model.pkl",
        label_column="label_default"
    )
    
    print("All models trained and saved successfully!")
