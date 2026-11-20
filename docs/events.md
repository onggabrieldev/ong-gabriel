---
title: Agenda
tags:
  - api
  - events
  - admin
aliases:
  - Agenda
  - Events
---

# Agenda

The "Próximos Eventos" list on `/agenda` (and the two cards on `/blog`) are stored in Django and edited from the Next.js admin at `/admin/agenda`. Auth and media work like [[activities|Activities]]. The gallery of past events and event registrations still use placeholders.

## Routes

Caddy forwards `/api/*` to Django. Session cookie auth and Django CSRF (`X-CSRFToken` with the `csrftoken` cookie) on every write.

| Operation | Method | Path | Auth |
| --- | --- | --- | --- |
| Public list | GET | `/api/v1/events/` | none |
| Admin list | GET | `/api/v1/admin/events/` | editor or superuser |
| Create | POST | `/api/v1/admin/events/` | editor or superuser |
| Get one | GET | `/api/v1/admin/events/{id}/` | editor or superuser |
| Update | PATCH | `/api/v1/admin/events/{id}/` | editor or superuser |
| Delete | DELETE | `/api/v1/admin/events/{id}/` | editor or superuser |

The public list returns published events that have not ended yet (`ends_at` is now or later), ordered by `starts_at`, with no pagination. An event in progress stays listed until it ends. Each item has `id`, `title`, `summary`, `description`, `event_type`, `location`, `starts_at`, `ends_at`, `accent`, `image` (a root-relative `/media/events/<random>.webp` URL, or `null`), and `image_alt`.

The admin list returns every event, hidden and ended ones included. There is no manual order: events sort by date.

Create and update take multipart. An update may leave `image` out to keep the current one; an empty `image` removes it. In Bruno, `admin-events/Create event` can send no file.

## Fields

| Field | Rule |
| --- | --- |
| `title` | required, up to 120 characters |
| `summary` | required, up to 280 characters. Shown on the card. |
| `description` | optional, up to 4000 characters. Shown in Detalhes. A blank line splits paragraphs. |
| `event_type` | required, free text up to 60 characters |
| `location` | required, free text up to 160 characters |
| `starts_at`, `ends_at` | required. `ends_at` must be after `starts_at`; the serializer and a database constraint both check it. |
| `accent` | `sky`, `butter`, or `teal`. The color of the date block on the card. Default `sky`. |
| `image` | optional. JPEG, PNG, or WebP, up to 5 MB and 6000x6000 px. Cropped to an 800x800 WebP. |
| `image_alt` | optional, up to 160 characters |

The limits live in `events/models.py` and are repeated in `frontend/components/admin/event-form.tsx`.

## Time zone

`TIME_ZONE` is `America/Sao_Paulo`. The admin sends wall-clock values such as `2027-01-15T14:00` with no offset, and Django reads them in that zone. Responses carry the offset (`2027-01-15T14:00:00-03:00`). The admin form shows and edits Brasília time whatever the browser's zone is.

## Filters

Event types and locations are free text, so the agenda builds its filter options from the events it receives. An option's id is a slug of the label: labels that differ only in case or accents share one option. The admin suggests the types and locations already in use, to keep them consistent. The period filter is fixed in `frontend/lib/events/content.ts`. An event in progress matches every period, as it is still on the agenda.

## Agenda page

The Next.js server reads `GET /api/v1/events/` (cache tag `events`, revalidated after each admin change). With an empty list, or a failed request, the agenda hides the filters and shows "Nenhum evento na agenda." The blog hides its events section.

The "Inscrição" button stays hidden: registrations are not stored yet, so the page does not offer a form that would discard what people type. It returns with the registration API.

Back to [[CONTEXT|Product context]].
