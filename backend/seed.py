"""
One-off setup script: creates tables (if needed), the initial admin
account from .env, and a few sample categories/projects so the gallery
isn't empty on first run.

Run with:  python seed.py
Safe to re-run - it skips anything that already exists.
"""
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.auth import hash_password
from app.models import AdminUser, Category, Project, ProjectStatus

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    if not db.query(AdminUser).filter(AdminUser.email == settings.admin_email).first():
        db.add(AdminUser(email=settings.admin_email, password_hash=hash_password(settings.admin_password)))
        db.commit()
        print(f"Created admin account: {settings.admin_email}")
    else:
        print("Admin account already exists, skipping.")

    sample_categories = [("Residential", "residential"), ("Commercial", "commercial"), ("Interiors", "interiors")]
    slug_to_category = {}
    for name, slug in sample_categories:
        category = db.query(Category).filter(Category.slug == slug).first()
        if not category:
            category = Category(name=name, slug=slug)
            db.add(category)
            db.commit()
            db.refresh(category)
            print(f"Created category: {name}")
        slug_to_category[slug] = category

    if db.query(Project).count() == 0:
        sample_projects = [
            {
                "title": "Meridian House",
                "description": "A concrete-and-timber family home organised around a central courtyard, "
                                "designed to bring daylight into every room across the seasons.",
                "location": "Addis Ababa, Ethiopia",
                "year": 2024,
                "category": "residential",
            },
            {
                "title": "Riverside Office Pavilion",
                "description": "A low-rise workspace for a design studio, with a folded roofline that "
                                "steps down toward the river to keep the scale human at ground level.",
                "location": "Addis Ababa, Ethiopia",
                "year": 2023,
                "category": "commercial",
            },
            {
                "title": "Atelier Loft Interior",
                "description": "An adaptive-reuse interior fit-out for a working artist's studio and gallery.",
                "location": "Addis Ababa, Ethiopia",
                "year": 2025,
                "category": "interiors",
            },
        ]
        for i, data in enumerate(sample_projects):
            db.add(Project(
                title=data["title"],
                description=data["description"],
                location=data["location"],
                year=data["year"],
                status=ProjectStatus.published,
                sort_order=i,
                category_id=slug_to_category[data["category"]].id,
            ))
        db.commit()
        print(f"Created {len(sample_projects)} sample projects.")
    else:
        print("Projects already exist, skipping sample data.")

finally:
    db.close()

print("\nSeed complete. Log in to the admin area with:")
print(f"  email:    {settings.admin_email}")
print(f"  password: {settings.admin_password}")
print("Change this password by creating a new admin user before going live.")
