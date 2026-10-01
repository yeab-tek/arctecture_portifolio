"""
One-off migration: adds the `name` column to admin_users for existing
databases created before this field existed. Safe to run multiple
times - it checks first and does nothing if the column is already
there. Does not touch any existing projects, images, or inquiries.
"""
import sqlite3

from app.config import settings

if not settings.database_url.startswith("sqlite"):
    print("This script only handles SQLite. For Postgres, add the column")
    print('manually: ALTER TABLE admin_users ADD COLUMN name VARCHAR;')
    raise SystemExit(0)

db_path = settings.database_url.replace("sqlite:///", "")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(admin_users)")
columns = [row[1] for row in cursor.fetchall()]

if "name" in columns:
    print("`name` column already exists - nothing to do.")
else:
    cursor.execute("ALTER TABLE admin_users ADD COLUMN name VARCHAR")
    conn.commit()
    print("Added `name` column to admin_users.")

conn.close()