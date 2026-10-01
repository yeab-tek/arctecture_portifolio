from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.auth import create_access_token, hash_password, verify_password, require_admin
from app.database import get_db
from app.models import AdminUser
from app.schemas import (
    LoginRequest,
    TokenResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
)
router = APIRouter(prefix="/api/auth", tags=["auth"])
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)
@router.get("/me")
def me(current_user: AdminUser = Depends(require_admin)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
@router.patch("/me")
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_admin),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.email is not None:
        current_user.email = payload.email
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="That email is already in use")
    db.refresh(current_user)
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_admin),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated"}