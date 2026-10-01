"""
Forgot-password + security-question flow for the admin login.

Reuses the SAME hashing (pwd_context) and JWT library (python-jose)
already set up in app/auth.py, so there's only one auth stack in
this project - not a second, inconsistent one.
"""
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.auth import pwd_context, require_admin
from app.config import settings
from app.database import get_db
from app.models import AdminUser

router = APIRouter(prefix="/api/auth/forgot-password", tags=["password-reset"])

ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 15

GENERIC_QUESTION = "Security question unavailable. Contact the site owner."
GENERIC_ERROR = "If that account exists, check the details and try again."

_attempts: dict[str, list[float]] = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60


def _check_rate_limit(email: str):
    now = time.time()
    window = _attempts.setdefault(email, [])
    window[:] = [t for t in window if now - t < WINDOW_SECONDS]
    if len(window) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Try again later.",
        )
    window.append(now)


class QuestionRequest(BaseModel):
    email: EmailStr


class QuestionResponse(BaseModel):
    question: str


class VerifyRequest(BaseModel):
    email: EmailStr
    answer: str


class VerifyResponse(BaseModel):
    reset_token: str


class ResetRequest(BaseModel):
    reset_token: str
    new_password: str


class SetSecurityQuestionRequest(BaseModel):
    question: str
    answer: str


@router.post("/question", response_model=QuestionResponse)
def get_security_question(payload: QuestionRequest, db: Session = Depends(get_db)):
    _check_rate_limit(payload.email)
    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()

    if not user or not user.security_question:
        return QuestionResponse(question=GENERIC_QUESTION)

    return QuestionResponse(question=user.security_question)


@router.post("/verify", response_model=VerifyResponse)
def verify_security_answer(payload: VerifyRequest, db: Session = Depends(get_db)):
    _check_rate_limit(payload.email)
    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()

    if not user or not user.security_answer_hash or not pwd_context.verify(
        payload.answer.strip().lower(), user.security_answer_hash
    ):
        raise HTTPException(status_code=400, detail=GENERIC_ERROR)

    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": user.email, "purpose": "password_reset", "exp": expire},
        settings.reset_token_secret,
        algorithm=ALGORITHM,
    )
    return VerifyResponse(reset_token=token)


@router.post("/reset")
def reset_password(payload: ResetRequest, db: Session = Depends(get_db)):
    try:
        data = jwt.decode(payload.reset_token, settings.reset_token_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=400, detail="Reset link expired or invalid, request a new one.")

    if data.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    user = db.query(AdminUser).filter(AdminUser.email == data["sub"]).first()
    if not user:
        raise HTTPException(status_code=400, detail=GENERIC_ERROR)

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user.password_hash = pwd_context.hash(payload.new_password)
    db.commit()
    return {"detail": "Password updated. You can log in with your new password."}


@router.post("/set-security-question")
def set_security_question(
    payload: SetSecurityQuestionRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_admin),
):
    current_user.security_question = payload.question
    current_user.security_answer_hash = pwd_context.hash(payload.answer.strip().lower())
    db.commit()
    return {"detail": "Security question saved."}