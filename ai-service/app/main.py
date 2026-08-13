from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import search, summary

app = FastAPI(title="Real Estate OS - AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(summary.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}