import os
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.config import settings
from app.database import get_db
from app.models import Project, ProjectImage, AdminUser
from app.schemas import ProjectImageOut, ImageReorderRequest, AddImageFromUrlRequest

router = APIRouter(prefix="/api", tags=["images"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _save_image_bytes(project: Project, contents: bytes, extension: str) -> ProjectImage:
    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{extension}"
    stored_path = os.path.join(settings.upload_dir, stored_name)
    with open(stored_path, "wb") as f:
        f.write(contents)

    next_sort_order = len(project.images)
    return ProjectImage(
        project_id=project.id,
        url=f"/uploads/{stored_name}",
        caption="",
        sort_order=next_sort_order,
        is_cover=next_sort_order == 0,
    )


@router.post("/projects/{project_id}/images", response_model=ProjectImageOut, status_code=201)
async def upload_image(
    project_id: str,
    file: UploadFile = File(...),
    caption: str = Form(default=""),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image is larger than the 10MB limit")

    extension = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    image = _save_image_bytes(project, contents, extension)
    image.caption = caption
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.post("/projects/{project_id}/images/from-url", response_model=ProjectImageOut, status_code=201)
async def add_image_from_url(
    project_id: str,
    payload: AddImageFromUrlRequest,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    """Downloads an image from an external URL and stores it the same
    way as a direct upload. Since this is admin-only (single trusted
    user), the main risk to guard against is fetching something huge
    or non-image rather than malicious internal targets - still, we
    restrict to http/https and cap the response size."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    url = payload.url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url)
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="Could not download an image from that link")

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Could not download an image from that link")

    content_type = response.headers.get("content-type", "").split(";")[0].strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="That link doesn't point to a supported image type")

    contents = response.content
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image is larger than the 10MB limit")

    extension = EXTENSION_BY_CONTENT_TYPE.get(content_type, ".jpg")
    image = _save_image_bytes(project, contents, extension)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/projects/{project_id}/images/reorder", response_model=list[ProjectImageOut])
def reorder_images(
    project_id: str,
    payload: ImageReorderRequest,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    images = db.query(ProjectImage).filter(ProjectImage.project_id == project_id).all()
    order_map = {item.id: item.sort_order for item in payload.items}
    for image in images:
        if image.id in order_map:
            image.sort_order = order_map[image.id]
    db.commit()
    return sorted(images, key=lambda i: i.sort_order)


@router.put("/images/{image_id}/cover", response_model=ProjectImageOut)
def set_cover_image(
    image_id: str,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    image = db.query(ProjectImage).filter(ProjectImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.query(ProjectImage).filter(
        ProjectImage.project_id == image.project_id
    ).update({ProjectImage.is_cover: False})
    image.is_cover = True
    db.commit()
    db.refresh(image)
    return image


@router.delete("/images/{image_id}", status_code=204)
def delete_image(
    image_id: str,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
):
    image = db.query(ProjectImage).filter(ProjectImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    stored_path = image.url.lstrip("/")
    if os.path.exists(stored_path):
        os.remove(stored_path)
    db.delete(image)
    db.commit()