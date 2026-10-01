from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth import require_admin
from app.database import get_db
from app.models import Project, ProjectStatus, AdminUser
from app.schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectListItem

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _to_list_item(project: Project) -> ProjectListItem:
    cover = next((img.url for img in project.images if img.is_cover), None)
    if cover is None and project.images:
        cover = project.images[0].url
    item = ProjectListItem.model_validate(project)
    item.cover_image = cover
    return item


@router.get("", response_model=list[ProjectListItem])
def list_projects(
    category: str | None = Query(default=None, description="Filter by category slug"),
    include_drafts: bool = False,
    db: Session = Depends(get_db),
):
    """Public gallery feed (REQ-GAL-01..04). By default only published
    projects are returned; `include_drafts` is intended for the admin UI
    (still requires the admin to be logged in to reach that screen)."""
    query = db.query(Project).options(joinedload(Project.images), joinedload(Project.category))
    if not include_drafts:
        query = query.filter(Project.status == ProjectStatus.published)
    if category:
        query = query.join(Project.category).filter_by(slug=category)
    projects = query.order_by(Project.sort_order, Project.created_at.desc()).all()
    return [_to_list_item(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(joinedload(Project.images), joinedload(Project.category))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    project = Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
