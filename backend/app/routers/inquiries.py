from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import require_admin
from app.database import get_db
from app.models import Inquiry, Project, AdminUser
from app.schemas import InquiryCreate, InquiryOut, InquiryStatusUpdate
from app.email import send_inquiry_notification

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])


@router.post("", response_model=InquiryOut, status_code=201)
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)):
    """Public contact form submission (REQ-CON-01..03). Pydantic already
    validates required fields and email format before we get here."""
    if payload.project_id:
        project = db.query(Project).filter(Project.id == payload.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Linked project not found")
    inquiry = Inquiry(**payload.model_dump())
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    send_inquiry_notification(inquiry)
    return inquiry


@router.get("", response_model=list[InquiryOut])
def list_inquiries(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    return db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()


@router.patch("/{inquiry_id}", response_model=InquiryOut)
def update_inquiry_status(
    inquiry_id: str,
    payload: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry.status = payload.status
    db.commit()
    db.refresh(inquiry)
    return inquiry
