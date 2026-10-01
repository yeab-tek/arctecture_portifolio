"""
One-off migration script: copies all data from local SQLite (app.db)
into a Supabase Postgres database, preserving IDs and relationships.
Safe to re-run: rows that already exist in Supabase (matched by
primary key) are skipped, so this won't create duplicates.
"""
import os
from sqlalchemy import create_engine, text, Integer
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import AdminUser, Category, Project, ProjectImage, Inquiry

SQLITE_URL = "sqlite:///./app.db"
SUPABASE_URL = os.environ.get(
    "SUPABASE_DATABASE_URL",
    "postgresql+psycopg2://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres",
)

source_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
target_engine = create_engine(SUPABASE_URL)

SourceSession = sessionmaker(bind=source_engine)
TargetSession = sessionmaker(bind=target_engine)

Base.metadata.create_all(bind=target_engine)

MODELS_IN_ORDER = [AdminUser, Category, Project, ProjectImage, Inquiry]


def migrate():
    src = SourceSession()
    dst = TargetSession()
    try:
        for model in MODELS_IN_ORDER:
            rows = src.query(model).all()
            copied = 0
            for row in rows:
                if dst.get(model, row.id):
                    continue
                data = {c.name: getattr(row, c.name) for c in model.__table__.columns}
                dst.add(model(**data))
                copied += 1
            dst.commit()
            print(f"{model.__tablename__}: copied {copied} of {len(rows)} rows")
    finally:
        src.close()
        dst.close()


def reset_sequences():
    dst = TargetSession()
    try:
        for model in MODELS_IN_ORDER:
            table = model.__tablename__
            id_col = model.__table__.columns.get('id')
            # Only integer primary keys have an auto-increment sequence
            # to fix up. UUID/text keys (e.g. admin_users) don't need this.
            if id_col is None or not isinstance(id_col.type, Integer):
                print(f"{table}: skipped (non-integer id, no sequence)")
                continue
            dst.execute(text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}), 1))"
            ))
            print(f"{table}: sequence reset")
        dst.commit()
    finally:
        dst.close()


if __name__ == "__main__":
    migrate()
    reset_sequences()
