from fastapi import FastAPI

# Create FastAPI app
app = FastAPI(title="Pyitupy Backend API", version="1.0")

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Welcome to the Pyitupy Backend API"
    }