# app/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import psycopg2
from app.db import get_db_connection

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ====================
# Request Schemas
# ====================
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ====================
# Register User
# ====================
@router.post("/register")
def register(req: RegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(req.password)

    cursor.execute(
        """
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES (%s, %s, %s, %s) RETURNING id
        """,
        (req.first_name, req.last_name, req.email, hashed_pw),
    )
    user_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Account created", "user_id": user_id}


# ====================
# Login User
# ====================
@router.post("/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, password_hash FROM users WHERE email = %s", (req.email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user or not pwd_context.verify(req.password, user[1]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"status": "success", "message": "Login successful", "user_id": user[0]}
