"""
Pydantic schemas - the request/response contracts for the API.
Keeping these separate from the ORM models means the API shape can stay
stable even if the database structure changes later.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models import ProjectStatus, InquiryStatus


# ---------- Auth ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    email: Optional[EmailStr] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=200)


# ---------- Category ----------

class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


# ---------- Project Image ----------

class ProjectImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    url: str
    caption: str
    sort_order: int
    is_cover: bool


class ImageReorderItem(BaseModel):
    id: str
    sort_order: int


class ImageReorderRequest(BaseModel):
    items: list[ImageReorderItem]
class AddImageFromUrlRequest(BaseModel):
    url: str


# ---------- Project ----------

class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    location: str = ""
    year: Optional[int] = None
    category_id: Optional[str] = None
    status: ProjectStatus = ProjectStatus.draft
    sort_order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    year: Optional[int] = None
    category_id: Optional[str] = None
    status: Optional[ProjectStatus] = None
    sort_order: Optional[int] = None


class ProjectListItem(BaseModel):
    """Slim shape for the gallery grid - avoids shipping full descriptions/images."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    location: str
    year: Optional[int]
    status: ProjectStatus
    category: Optional[CategoryOut] = None
    cover_image: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    location: str
    year: Optional[int]
    status: ProjectStatus
    sort_order: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None
    images: list[ProjectImageOut] = []


# ---------- Inquiry ----------

class InquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)
    project_id: Optional[str] = None


class InquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    message: str
    status: InquiryStatus
    created_at: datetime
    project_id: Optional[str] = None


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus