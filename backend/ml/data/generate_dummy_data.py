import os
import pandas as pd
import numpy as np

# Ensure output directory exists
os.makedirs("ml/data", exist_ok=True)

# ---------- 1️⃣ Generate Individual Dataset ----------
def generate_individual_data(n=50):
    data = {
        "avg_monthly_income": np.random.randint(10000, 250000, n),
        "mobile_money_inflow_outflow_ratio": np.round(np.random.uniform(0.6, 2.0, n), 2),
        "mobile_money_txn_frequency": np.random.randint(50, 1200, n),
        "income_volatility": np.round(np.random.uniform(0.0, 0.5, n), 2),
        "total_outstanding_debt": np.random.randint(0, 500000, n),
        "tax_compliance_score": np.random.choice([0, 0.5, 1], n),
        "loan_repayment_history_score": np.round(np.random.uniform(0.0, 1.0, n), 2),
        "education_level_score": np.random.randint(1, 6, n),
        "label_default": np.random.choice([0, 1], n, p=[0.7, 0.3])  # 70% repaid, 30% defaulted
    }
    df = pd.DataFrame(data)
    df.to_csv("ml/data/individual_features.csv", index=False)
    print("✅ individual_features.csv created with", n, "rows")


# ---------- 2️⃣ Generate Business Dataset ----------
def generate_business_data(n=50):
    data = {
        "avg_monthly_revenue": np.random.randint(50000, 1500000, n),
        "revenue_trend_score": np.round(np.random.uniform(-0.3, 0.3, n), 2),
        "income_volatility": np.round(np.random.uniform(0.0, 0.6, n), 2),
        "total_outstanding_debt": np.random.randint(0, 5000000, n),
        "tax_compliance_score": np.random.choice([0, 0.5, 1], n),
        "loan_repayment_history_score": np.round(np.random.uniform(0.0, 1.0, n), 2),
        "owner_creditworthiness": np.round(np.random.uniform(40, 100, n), 2),
        "business_geolocation_verified": np.random.choice([0, 1], n, p=[0.3, 0.7]),
        "label_default": np.random.choice([0, 1], n, p=[0.7, 0.3])  # 70% repaid, 30% defaulted
    }
    df = pd.DataFrame(data)
    df.to_csv("ml/data/business_features.csv", index=False)
    print("✅ business_features.csv created with", n, "rows")


if __name__ == "__main__":
    generate_individual_data()
    generate_business_data()
    print("Dummy datasets generated successfully in ml/data/")
