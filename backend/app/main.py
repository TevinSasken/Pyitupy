from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import kyc, credit_score
from app.db import get_db_connection  #Import database connection
from app.routes import auth 


app = FastAPI(title="Pyitupy Backend API", version="1.0")

@app.get("/")
def home():
    return {"status": "ok", "message": "Welcome to the Pyitupy Backend API"}


# ============================
# Loan Routes
# ============================

@app.get("/loans")
def get_loans():
    """Fetch all available loans"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, wallet_address, amount, rate, repayment_period, purpose, status
        FROM loans
    """)
    loans = cursor.fetchall()
    conn.close()

    loan_list = [
        {
            "id": loan[0],
            "wallet_address": loan[1],
            "amount": float(loan[2]),
            "rate": float(loan[3]),
            "repayment_period": loan[4],
            "purpose": loan[5],
            "status": loan[6]
        }
        for loan in loans
    ]
    return loan_list


@app.get("/loans/{loan_id}")
def get_loan(loan_id: int):
    """Fetch details of a specific loan"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, wallet_address, amount, rate, repayment_period, purpose, status
        FROM loans
        WHERE id = %s
    """, (loan_id,))
    loan = cursor.fetchone()
    conn.close()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    return {
        "id": loan[0],
        "wallet_address": loan[1],
        "amount": float(loan[2]),
        "rate": float(loan[3]),
        "repayment_period": loan[4],
        "purpose": loan[5],
        "status": loan[6]
    }


@app.post("/loans/fund")
def fund_loan(loan_id: int, amount: float, lender_wallet: str = "0xSampleLenderWallet"):
    """Fund a loan (mock lender wallet for now)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify loan exists
    cursor.execute("SELECT id FROM loans WHERE id = %s", (loan_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Loan not found")

    # Insert funding record
    cursor.execute("""
        INSERT INTO funding (loan_id, lender_wallet, amount)
        VALUES (%s, %s, %s)
    """, (loan_id, lender_wallet, amount))
    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Loan {loan_id} funded with {amount}"}


# ============================
# Register routes
# ============================
app.include_router(kyc.router)
app.include_router(credit_score.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
