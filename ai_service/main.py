from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import matching, fraud, generate

app = FastAPI(
    title="ScholarHub AI Service",
    description="AI-powered scholarship matching and fraud detection",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(matching.router, prefix="/api")
app.include_router(fraud.router, prefix="/api")
app.include_router(generate.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": "ScholarHub AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "matching": "/api/matching",
            "fraud": "/api/fraud/check",
            "generate": "/api/generate/description",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
