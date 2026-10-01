# Architect Portfolio Platform

A Pinterest-style portfolio site for an architect to showcase completed
client work, with a scroll-driven house-assembly animation on the
landing page and an admin area for managing projects and inquiries.
Built to the project SRS (`Vibeyworlds_Architect_Portfolio_SRS.docx`).

- **Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, React Router
- **Backend:** FastAPI, SQLAlchemy, JWT auth (python-jose + passlib/bcrypt)
- **Database:** SQLite by default (zero-config, one file) — swap to
  Postgres for production by changing one environment variable (see below)

## Project structure

```
architect-portfolio/
  backend/          FastAPI app, SQLAlchemy models, JWT auth, image uploads
  frontend/         React + Vite + Tailwind SPA (public site + admin area)
```

## 1. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit ADMIN_EMAIL / ADMIN_PASSWORD / SECRET_KEY
python seed.py                  # creates the DB, admin account, and sample projects
uvicorn app.main:app --reload   # http://localhost:8000
```

- Interactive API docs: http://localhost:8000/docs
- The admin login printed by `seed.py` matches whatever `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` are set to in `.env` — change them before going live.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL, defaults to http://localhost:8000
npm run dev                     # http://localhost:5173
```

- Public site: `/`, `/projects/:id`, `/contact`
- Admin area: `/admin/login` → project + inquiry management

## Moving from SQLite to PostgreSQL

Nothing in the code talks to SQLite directly — it all goes through
SQLAlchemy — so switching database is a one-line change:

```bash
pip install psycopg2-binary
```

```env
# backend/.env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/architect_portfolio
```

Run `python seed.py` again against the new database to create tables
and the initial admin account.

## What's implemented (mapped to the SRS)

| Area | Status |
| --- | --- |
| Public masonry gallery, filtering, lazy-loaded images (3.1) | Done |
| Project detail page with image gallery + inquiry CTA (3.2) | Done |
| Scroll-triggered house-assembly animation, reduced-motion aware (3.3) | Done |
| Admin auth, project CRUD, image upload/reorder/cover (3.4) | Done |
| Public contact form + admin inquiry inbox with status (3.5) | Done |
| JWT auth, hashed passwords, server-side route protection (3.6) | Done |
| Password reset flow (REQ-AUTH-03) | Not built — v1 assumes one admin who can be reset by re-running `seed.py` with a new email/password. Flag if you need self-service reset. |
| Email notification on new inquiry (REQ-CON-04, marked [Could] in the SRS) | Not built — `create_inquiry` in `backend/app/routers/inquiries.py` is where to add an email provider call. |
| Object storage (S3) for images | Images are stored on local disk under `backend/uploads/` and served via FastAPI's static file mount. Fine for a single-server deployment; swap for S3 (or similar) before scaling past one machine. |

## Known simplifications worth knowing about

- **Project IDs aren't sequential** (random hex), so an unpublished
  draft's detail page isn't linkable from the gallery and is very hard to
  guess — but the API doesn't hide draft projects from someone who has
  the direct link. Fine for one architect's use; worth hardening if
  drafts need to stay fully private before publish.
- **Image reordering** uses simple up/down buttons rather than
  drag-and-drop — chosen deliberately for reliability and because it's
  easier for a non-technical user (REQ-NFR-10) than a drag interaction.
# arctecture_portifolio
