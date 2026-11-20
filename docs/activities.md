---
title: Activities
tags:
  - api
  - activities
  - admin
aliases:
  - Atividades
---

# Activities

The "O que fazemos" cards on the home page are stored in Django and edited from the Next.js admin at `/admin/atividades`. They work like [[testimonials|Testimonials]]: same auth, same media pipeline, same ordering.

## Routes

Caddy forwards `/api/*` to Django. Session cookie auth and Django CSRF (`X-CSRFToken` with the `csrftoken` cookie) on every write.

| Operation | Method | Path | Auth |
| --- | --- | --- | --- |
| Public list | GET | `/api/v1/activities/` | none |
| Admin list | GET | `/api/v1/admin/activities/` | editor or superuser |
| Create | POST | `/api/v1/admin/activities/` | editor or superuser |
| Get one | GET | `/api/v1/admin/activities/{id}/` | editor or superuser |
| Update | PATCH | `/api/v1/admin/activities/{id}/` | editor or superuser |
| Delete | DELETE | `/api/v1/admin/activities/{id}/` | editor or superuser |
| Reorder | POST | `/api/v1/admin/activities/reorder/` | editor or superuser |

The public list returns only published rows, ordered by `position`, with no pagination. Each item has `id`, `title`, `description`, `image` (a root-relative `/media/activities/<random>.webp` URL), and `image_alt` (may be empty).

Create takes multipart with an `image` file. An update may leave `image` out, or send it empty, to keep the current one. An activity cannot exist without an image. Reorder takes `{"ids": ["uuid", ...]}` with every existing id exactly once. In Bruno, pick a file for `image` in `admin-activities/Create activity` before sending it.

## Limits

| Field | Rule |
| --- | --- |
| `title` | required, up to 60 characters |
| `description` | required, up to 240 characters |
| `image_alt` | optional, up to 160 characters. Empty means the image is decorative. |
| `image` | JPEG, PNG, or WebP, up to 5 MB and 6000x6000 px |

Text limits keep the cards close in height. The limits live in `activities/models.py` and are repeated in `frontend/components/admin/activity-form.tsx`.

## Media

Django center-crops every image to a square, resizes it to 1080x1080, and saves WebP (quality 82) with no metadata. Replacing an image deletes the old file after the transaction commits. Deleting an activity deletes its file. The processing code is shared with testimonials in `ong_gabriel_api/uploads/`. See [[testimonials#Media|Testimonials media]].

## Home page

The Next.js server reads `GET /api/v1/activities/` (cache tag `activities`, revalidated after each admin change). An empty list, or a failed request, hides the section. The cards wrap and stay centered: one card sits in the middle, two sit side by side in the middle, and a short last row is centered too. Cards in a row share the same height, the title reserves two lines on desktop so descriptions line up, and long words wrap instead of overflowing.

Back to [[CONTEXT|Product context]].
