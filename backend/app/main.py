"""
App entrypoint. Wires up CORS, static file serving for uploaded images,
error handling, and all routers.

Run with:  uvicorn app.main:app --reload
Docs at:   http://localhost:8000/docs   (REQ-NFR-04)
"""
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, projects, images, categories, inquiries, forgot_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("architect_portfolio")

# Creates tables on first run. For real schema changes later, switch to
# Alembic migrations instead of relying on create_all.
Base.metadata.create_all(bind=engine)
os.makedirs(settings.upload_dir, exist_ok=True)

app = FastAPI(
    title="Architect Portfolio API",
    version="1.0.0",
    description="Backend for the architect's Pinterest-style project portfolio.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # REQ-NFR-05: log the real error server-side, never leak internals
    # (stack traces, DB errors) to the client.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(forgot_password.router)
app.include_router(categories.router)
app.include_router(projects.router)
app.include_router(images.router)
app.include_router(inquiries.router)
