from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import kyc, credit_score
from app.db import get_db_connection  # Import database connection
from app.routes import auth

from pydantic import BaseModel
from web3 import Web3
import os

# ============================
# Web3 Setup
# ============================
# Use Infura or Alchemy RPC URL (Ethereum Mainnet or Sepolia Testnet)
ETH_RPC_URL = os.getenv("ETH_RPC_URL", "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID")
ESCROW_ADDRESS = Web3.to_checksum_address("0xb3d69F737B01a20E56A5486e4C8Cbb88d55ed567")

w3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))

# ============================
# FastAPI Setup
# ============================
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
# Payment Verification Route
# ============================

class VerifyPaymentRequest(BaseModel):
    loan_id: int
    sender_wallet: str
    tx_hash: str
    expected_amount: float

@app.post("/verify-payment")
def verify_payment(data: VerifyPaymentRequest):
    """Verify a lender's payment transaction"""
    try:
        tx = w3.eth.get_transaction(data.tx_hash)

        # Check sender matches
        if tx["from"].lower() != data.sender_wallet.lower():
            raise HTTPException(status_code=400, detail="Sender wallet does not match transaction")

        # Check receiver matches escrow
        if tx["to"].lower() != ESCROW_ADDRESS.lower():
            raise HTTPException(status_code=400, detail="Transaction not sent to escrow wallet")

        # Check value matches expected amount (convert ETH to Wei)
        expected_wei = w3.to_wei(data.expected_amount, "ether")
        if tx["value"] < expected_wei:
            raise HTTPException(status_code=400, detail="Transaction amount is less than expected")

        return {"status": "success", "message": "Transaction verified successfully!"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Transaction verification failed: {str(e)}")

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
