from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import kyc, credit_score

app = FastAPI(title="Pyitupy Backend API", version="1.0")

@app.get("/")
def home():
    return {"status": "ok", "message": "Welcome to the Pyitupy Backend API"}

# Register routes
app.include_router(kyc.router)
app.include_router(credit_score.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)