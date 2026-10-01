"""
ORM models - one class per table, matching the data model in the SRS (6.3).
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Integer, DateTime, ForeignKey, Enum, Boolean,
)
from sqlalchemy.orm import relationship

from app.database import Base


def make_id() -> str:
    return uuid.uuid4().hex


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class InquiryStatus(str, enum.Enum):
    new = "new"
    read = "read"
    archived = "archived"


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=make_id)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    security_question = Column(String, nullable=True)
    security_answer_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=make_id)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True, index=True)

    projects = relationship("Project", back_populates="category")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=make_id)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    location = Column(String, default="")
    year = Column(Integer, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.draft, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="projects")

    images = relationship(
        "ProjectImage",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectImage.sort_order",
    )
    inquiries = relationship("Inquiry", back_populates="project")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(String, primary_key=True, default=make_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    url = Column(String, nullable=False)
    caption = Column(String, default="")
    sort_order = Column(Integer, default=0)
    is_cover = Column(Boolean, default=False)

    project = relationship("Project", back_populates="images")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String, primary_key=True, default=make_id)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(InquiryStatus), default=InquiryStatus.new, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    project = relationship("Project", back_populates="inquiries")