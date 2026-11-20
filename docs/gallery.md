---
title: Gallery
tags:
  - api
  - gallery
  - admin
aliases:
  - Galeria
---

# Gallery

Past events with photos. An editor creates an album, uploads its photos, and publishes it. The public site lists published albums at `/galeria` and shows an album's photos at `/galeria/<slug>`. Auth and media work like [[activities|Activities]].

## Routes

Caddy forwards `/api/*` to Django. Session cookie auth and Django CSRF (`X-CSRFToken` with the `csrftoken` cookie) on every write.

| Operation | Method | Path | Auth |
| --- | --- | --- | --- |
| Public list | GET | `/api/v1/gallery/` | none |
| Public detail | GET | `/api/v1/gallery/{slug}/` | none |
| Admin list | GET | `/api/v1/admin/gallery/` | editor or superuser |
| Create album | POST | `/api/v1/admin/gallery/` | editor or superuser |
| Get album | GET | `/api/v1/admin/gallery/{id}/` | editor or superuser |
| Update album | PATCH | `/api/v1/admin/gallery/{id}/` | editor or superuser |
| Delete album | DELETE | `/api/v1/admin/gallery/{id}/` | editor or superuser |
| List photos | GET | `/api/v1/admin/gallery/{album_id}/photos/` | editor or superuser |
| Upload photo | POST | `/api/v1/admin/gallery/{album_id}/photos/` | editor or superuser |
| Update photo | PATCH | `/api/v1/admin/gallery/{album_id}/photos/{photo_id}/` | editor or superuser |
| Delete photo | DELETE | `/api/v1/admin/gallery/{album_id}/photos/{photo_id}/` | editor or superuser |
| Reorder photos | POST | `/api/v1/admin/gallery/{album_id}/photos/reorder/` | editor or superuser |

The public list returns published albums, newest `held_on` first, with no pagination. Each item has `id`, `slug`, `title`, `summary`, `event_type`, `location`, `held_on`, `cover` (a root-relative `/media/gallery/covers/<random>.webp` URL), `cover_alt`, and `photo_count`.

Public detail is the same fields plus `photos`: `id`, `image` (`/media/gallery/photos/<random>.webp`), `image_alt`, `width`, and `height`, ordered by `position`. An unpublished or missing album returns 404.

The admin list includes hidden albums. Create and update take multipart or JSON. An update may leave `cover` out, or send it empty, to keep the current one. An album cannot exist without a cover. PUT is not routed.

The frontend uploads several photos by calling the upload route once per file. PATCH on a photo updates `image_alt` only; the image cannot be replaced. Reorder takes `{"ids": ["uuid", ...]}` with every photo of that album exactly once. In Bruno, pick a file for `cover` in `admin-gallery/Create album` and for `image` in `admin-gallery/Upload photo` before sending them.

## Fields

| Field | Rule |
| --- | --- |
| `title` | required, up to 120 characters |
| `slug` | generated from the title on create, unique, up to 140 characters. Read-only after that. |
| `summary` | required, up to 280 characters. Shown on the card. |
| `event_type` | required, free text up to 60 characters |
| `location` | required, free text up to 160 characters |
| `held_on` | required date |
| `cover` | required. JPEG, PNG, or WebP, up to 5 MB and 6000x6000 px. Cropped to an 800x800 WebP. |
| `cover_alt` | optional, up to 160 characters |
| `image` (photo) | required. JPEG, PNG, or WebP, up to 5 MB and 6000x6000 px. Fitted so the longest side is at most 1600 px, aspect ratio kept, never upscaled. Saved as WebP. |
| `image_alt` | optional, up to 160 characters |

The limits live in `gallery/models.py`.

## Slug

The slug comes from `django.utils.text.slugify(title)` on create. A title that slugifies to nothing becomes `album`. A collision appends `-2`, `-3`, and so on. The slug never changes after create, even when the title changes, so `/galeria/<slug>` stays stable.

## Photo cap

An album holds at most 60 photos. Uploading past that returns 400 with `O álbum pode ter no máximo 60 fotos.` The count uses the same row lock as the position assignment, so concurrent uploads cannot exceed the cap.

## Media

Django center-crops the cover to a square, resizes it to 800x800, and saves WebP (quality 82) with no metadata. Photos keep their aspect ratio and only downsize. Replacing a cover deletes the old file after the transaction commits. Deleting an album deletes its cover and every photo file. Deleting a photo deletes its file. The processing code is shared in `ong_gabriel_api/uploads/`. See [[testimonials#Media|Testimonials media]].

## Gallery page

The Next.js server reads `GET /api/v1/gallery/` and `GET /api/v1/gallery/{slug}/` (cache tag `gallery`, revalidated after each admin change). The gallery filters come from the albums it receives, like the agenda's. Without albums, the agenda hides its "Galeria de Eventos Passados" section.

> [!note] Placeholder slug
> Cache Components needs `generateStaticParams` to return at least one param, and the API is not reachable during the Docker build. With no albums, `/galeria/[slug]` prerenders the slug `_`, which `slugify` never produces, so it renders the not-found screen. The frontend only sends slugs made of letters, digits, `-`, and `_` to the API.

## Admin

Editors manage albums at `/admin/galeria`. Creating an album opens its photos right away. Photos are uploaded one request per file, in the order chosen, with progress shown. Each photo has its own description field, arrows to move it, and a delete button.

Back to [[CONTEXT|Product context]].
