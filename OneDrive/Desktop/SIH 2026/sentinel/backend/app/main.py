from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

app = FastAPI(
    title="SENTINEL Backend API",
    description="AI-Driven Multi-Vendor Network Security Compliance Auditor",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "SENTINEL API Server Running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SENTINEL Backend",
        "version": "0.1.0"
    }
