---
title: Testimonials
tags:
  - api
  - testimonials
  - admin
aliases:
  - Depoimentos
---

# Testimonials

Home testimonials are stored in Django and edited from the Next.js admin. Product decisions are in [[django-migration-decisions|Django migration decisions]]. Deploy is in [[deploy|Deploy]].

## Routes

Caddy forwards `/api/*` to Django. Session cookie auth and Django CSRF (`X-CSRFToken` with the `csrftoken` cookie) on every write.

| Operation | Method | Path | Auth |
| --- | --- | --- | --- |
| Public list | GET | `/api/v1/testimonials/` | none |
| Admin list | GET | `/api/v1/admin/testimonials/` | editor or superuser |
| Create | POST | `/api/v1/admin/testimonials/` | editor or superuser |
| Get one | GET | `/api/v1/admin/testimonials/{id}/` | editor or superuser |
| Update | PATCH | `/api/v1/admin/testimonials/{id}/` | editor or superuser |
| Delete | DELETE | `/api/v1/admin/testimonials/{id}/` | editor or superuser |
| Reorder | POST | `/api/v1/admin/testimonials/reorder/` | editor or superuser |

The public list returns only published rows, ordered by `position`, with no pagination. `portrait` is a root-relative URL (`/media/testimonials/<random>.webp`) or `null`. `role` may be empty.

Admin list includes hidden rows. Create and update accept multipart or JSON. New items go to the end. Reorder takes `{"ids": ["uuid", ...]}` with every existing id exactly once. PUT is not routed.

Anonymous callers and signed-in users without the role get 403 on admin routes. The role is the Django `editor` group, or a superuser. See [[accounts|Accounts]].

## Media

Uploads accept JPEG, PNG, or WebP, detected by decoding with Pillow, up to 5 MB and 6000x6000 px. SVG, GIF, HEIC, and anything else is rejected. Django applies EXIF orientation, center-crops to a square, resizes to 256x256, and saves WebP (quality 82) with no metadata, under a random filename.

Replacing or removing a portrait deletes the old file after the transaction commits. Deleting a testimonial deletes its file.

Files live in `MEDIA_ROOT`. Locally that defaults to `backend/media/`. In production the compose file mounts a named volume at `/media`. Caddy serves `/media/*` from that volume. Django itself serves media only when `ENVIRONMENT=local`.

## Home page

The Next.js server reads `GET /api/v1/testimonials/` and renders the home testimonials section. In production it calls `http://api:8000/api/v1/testimonials/` with `Host: api` and `X-Forwarded-Proto: https`, so Django's SSL redirect does not bounce the request. `ALLOWED_HOSTS` must include `api`. Portrait URLs stay root-relative and go through Caddy on the same origin.

Back to [[CONTEXT|Product context]].
