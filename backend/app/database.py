"""
SQLAlchemy engine/session setup.

Default is SQLite (app.db) - zero config, a single file, plenty reliable
for one architect's project catalogue. To move to Postgres for a bigger
production deployment, just change DATABASE_URL in .env to a
postgresql+psycopg2:// URL and `pip install psycopg2-binary` - nothing
else in this file needs to change, because all the code below talks to
SQLAlchemy, not to SQLite directly.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
