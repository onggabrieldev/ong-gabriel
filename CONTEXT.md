---
title: ONG Gabriel
tags:
  - ong-gabriel
aliases:
  - Context
---

# ONG Gabriel

Public site for ONG Gabriel, a Brazilian nonprofit focused on suicide prevention. It publishes a blog, an event calendar, outreach pages, and donations.

The note map is [[docs/Home|Docs]].

## Apps

- `frontend/` is Next.js (App Router) and stays. Public copy and page structure live here.
- `backend/` is FastAPI and replaces the old Django API. The package name is `ong-gabriel-api`. The import path is `ong_gabriel_api`.

`pnpm dev` runs the API on `127.0.0.1:8000` and the site on `localhost:3000`.

## What stays dynamic

> [!warning] Not a CMS
> The old Django app stored home and about pages as CMS rows. Those pages become static content in Next.js. Do not recreate `/v1/cms/*`.

The API is for records that change and are shared across the site:

- blog posts and categories
- comments on posts, and later maybe on events and the agenda — see [[docs/comments|Comments]]
- events, addresses, and event types
- testimonials, while they stay editable
- media attached to those records
- editor authentication
- donations, once that flow exists

The old tables, and which ones were CMS, are in [[docs/legacy-database|Legacy database]].

## Stack

- Python 3.15, uv, FastAPI, pytest, Ruff. Tests run with `pnpm test:api`.
- Persistence is SQLAlchemy async, Postgres, and Alembic. The new schema starts empty. Django rows are not imported.
- API configuration is one pydantic-settings object. Local, dev, and prod differ by environment variables.
- Authorization is RBAC in Postgres: roles and `resource:action` permissions. The browser uses an HTTP-only cookie. Local, dev, and prod change that cookie through settings.
- A user account is email and password. Redis waits until a read path needs a cache.
- Node 22 or newer, pnpm, Next.js, React, Tailwind 4, Biome. `pnpm lint` runs Ruff and Biome. Class names follow the `frontend` skill.
- CI is `.github/workflows/ci.yml`.

## API checks

`GET /health` returns `{"status": "ok"}`.

Manual requests live in `bruno/`. The `local`, `dev`, and `prod` environments differ by `baseUrl`. The `bruno-endpoints` skill is how new routes get a request file.

The old Django API was mounted at `/v1/` (cookie JWT auth, blog, events, testimonials, and CMS).
