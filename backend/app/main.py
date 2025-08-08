from fastapi import FastAPI
from app.routes import kyc

app = FastAPI(title="Pyitupy Backend API", version="1.0")

# Include KYC routes
app.include_router(kyc.router)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Welcome to the Pyitupy Backend API"
    }
