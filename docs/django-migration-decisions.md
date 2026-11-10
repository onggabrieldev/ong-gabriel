---
title: Django migration decisions
tags:
  - decisions
  - api
  - auth
  - admin
aliases:
  - Decisões da migração Django
---

# Django migration decisions

Decision log for the move to Django, the Next.js admin, login, and moderated blog comments. Started 2026-11-03.

> [!info] Two kinds of entries
> **Settled** means the owner decided it. Do not reopen it without the owner. **Proposed** means the coordinator chose it as a default and the owner has not confirmed it yet. Ask before treating a proposed entry as settled.

Product context is in [[CONTEXT|Product context]]. Comment rules are in [[comments|Comments]]. Old tables are in [[legacy-database|Legacy database]].

## Settled

### Stack

- The API is **Django**, not FastAPI. Django is simpler here, and most of the old work already exists in Django. This replaces the FastAPI, SQLAlchemy, and Alembic lines in the older docs.
- `bkp-repos/` is a reference. Reuse what was done, but do not clone it. The new code must be organized, follow REST conventions, be easy to read, be easy to change, and keep coupling low.
- The CMS is not ported. Home and about stay static in Next.js.

### Login

- Auth uses **`django-allauth` in headless mode**. Identity, sessions, roles, and moderation live in Django. Next.js only renders the screens.
  - Better Auth was rejected because it is Node-based, keeps its own user and session tables, and needs a bridge to Django.
  - NextAuth/Auth.js was rejected for the same reason, and because it has no built-in email and password sign-up.
- Google is the first social provider. Other providers come later through allauth.
- An account created on the site must confirm its email before it is verified.
- In production, at first, only Google login works for the public. Email and password sign-up is built and tested, but turned off by an environment variable until an email provider exists.
- The team (editors and moderators) can sign in with **both** Google and email and password. A superuser assigns roles by hand.

### API and domain

- The API is **same-origin**. Caddy sends `/api/*` and `/media/*` to Django. Everything else goes to Next.js. No CORS.
- Versioned routes live under `/api/v1/`.
- Every new or changed route gets a Bruno request. See the `bruno-endpoints` skill.

### Comments

- Comments start on blog posts.
- Every comment goes through moderator triage. A comment is **never** published directly to the blog.
- The Next.js admin has a moderation queue for this. The topic is sensitive, so triage is required.

### Scope added on 2026-11-03

- **Event registration**: the agenda modal stops simulating and saves registrations in the API. This stores personal data of people who sign up.
- **Testimonials admin**: managed from the Next.js admin. The Figma file has no screen for it.
- Old data is **not** imported. The new database starts empty.

### Quality bar for every frontend change

- Accessibility, including screen readers.
- Performance without hurting the experience. The home page scores 100 in Lighthouse today and must keep that score.
- UI and UX.
- Responsive layout.
- Screens follow the Figma file and the existing fonts, colors, and patterns: [Figma](https://www.figma.com/design/c5FIyAtv4MT0OA3OZPArYj/Web-site-ONG-Gabriel-?node-id=199-1338).

### Security must-haves

- Rate limit on login.
- Protection against XSS, CSRF, and the other common attacks.
- A security review of the whole site.

### Settled on 2026-11-09 for branch 1

- The API framework is **Django REST Framework**.
- Settings are one pydantic-settings class in `ong_gabriel_api/settings.py`. `ENVIRONMENT` is `local`, `dev`, or `prod`. No hard-coded secret key. `DEBUG` can only be true locally.
- The package keeps the name `ong-gabriel-api` and the import path `ong_gabriel_api`.
- The user model has a UUID primary key, a **username**, an email, and a password. No CPF and no other personal fields.
  - Sign-in accepts **either the username or the email**.
  - Username and email are each unique, ignoring case. A username cannot contain `@`, so it never looks like an email.
  - A failed sign-in gives one generic error, so it does not reveal whether the username or email exists.
  - The username is the public name, for example on comments. A Google sign-up gets a generated username that the user can change later.
- The session is a Django session cookie, `HttpOnly` and `SameSite=Lax`, plus Django CSRF. No JWT.
- DRF denies by default. Every write checks a role permission on the server.
- OpenAPI is served at `/api/v1/schema/` and `/api/v1/docs/`, but not in `prod`.
- The Django admin uses the plain theme at `/django-admin/`, only as a superuser fallback.

### Workflow

- Implementation is done by Orca workers running Grok 4.6. The coordinator reviews their work.
- One branch at a time. The owner tests the flow on that branch and approves it before the next branch starts.
- The coordinator asks about decisions and pull requests as they come up.
- Workers never push or open pull requests. The coordinator does that after approval.
- Commits use the owner's git identity. No AI attribution anywhere.

## Proposed

These defaults are written into the specs. Confirm or change them before the branch that uses them.

| Topic | Proposal | Branch |
| --- | --- | --- |
| Roles | Django groups and permissions as RBAC: `editor` for content and `moderator` for comments. A commenter has no group. | 2 |
| Rate-limit store | allauth rate limits backed by a shared Django cache. Database cache first, Redis only if needed. Trust the proxy IP count from Caddy. | 2 |
| Local email | Mailpit in `compose.dev.yaml`. | 2 |
| Media | Local Docker volume served by Caddy. Uploads checked for type and size. No SVG uploads. | 4 |
| Post body | A structured format rendered without `dangerouslySetInnerHTML`, such as Tiptap JSON mapped to the current block types. The Figma editor has a rich text toolbar. **Decide before branch 7.** | 4, 7 |
| Comment target | Plain foreign key to the post. Events can be added later by migration. | 9 |
| Comment format | Plain text only, rendered as text. No HTML or Markdown. | 9 |
| Comment states | `pending`, `approved`, `rejected`. Store the moderator, the time, and an internal note. No replies or notifications in v1. | 9, 10 |
| Comment form | After submit, say the comment will be reviewed. Show the CVV 188 help line next to the form. **Confirm wording with the owner.** | 9 |
| Session in pages | The session is read only in the client-side comment block. Public pages stay static. Admin JavaScript never loads on public pages. | 3, 9 |
| CSP | A strict nonce-based CSP on admin routes. A lighter CSP on public pages, because nonces force dynamic rendering. Assess in branch 11. | 11 |

## Branch plan

| # | Branch | Delivers | Status |
| --- | --- | --- | --- |
| 1 | `feat-django-api` | Django and DRF in place of FastAPI, custom user, Postgres for local dev, `/health`, CI, Bruno, `django` skill, updated docs | Ready for review |
| 2 | `feat-accounts-api` | allauth headless, Google, email verification behind a flag, team passwords and recovery, login rate limit, roles | Waiting |
| 3 | `feat-auth-screens` | Sign in, sign up, email verification, and password reset screens in Next.js | Waiting |
| 4 | `feat-content-api` | Blog, categories, and media with checked uploads | Waiting |
| 5 | `feat-events-api` | Events, addresses, types, gallery, testimonials, event registration | Waiting |
| 6 | `feat-site-integration` | Next.js reads from the API in place of `content.ts`, keeping cache and Lighthouse | Waiting |
| 7 | `feat-admin-blog` | Admin shell and blog management | Waiting |
| 8 | `feat-admin-events` | Agenda, gallery, and testimonials management | Waiting |
| 9 | `feat-comments` | Comment API and the form on the post page, published only after approval | Waiting |
| 10 | `feat-admin-moderation` | Moderation queue in the admin | Waiting |
| 11 | `feat-security-deploy` | CSP, Caddy, API deploy, Postgres backups, site security review | Waiting |

## What the owner must provide

> [!todo] Google, for production login
> A Google Cloud project, ideally under an ONG account, with an OAuth consent screen and an OAuth Client ID. Scopes are `openid`, `email`, and `profile`. The exact redirect URLs come with branch 2.

> [!todo] Email, only when public sign-up is turned on
> A transactional email provider such as Brevo, Resend, or SES. A sender such as `noreply@onggabriel.com.br`. SPF, DKIM, and DMARC records in DNS.

## Findings in the old backend

Not carried over:

- `IsAuthenticatedOrReadOnly` let any logged-in account edit posts. With public sign-up this would be critical.
- `SECRET_KEY` had a fallback value in code.
- Cookies were `SameSite=None`, with an unsigned double-submit CSRF cookie.
- Logout did not invalidate the refresh token.
- Login had no rate limit.
- CPF was required on every user.
- Django served media itself.
- `increment-share` accepted calls with no permission at all.

## Known gaps

- The Figma file has no screens for sign in, sign up, comments, or moderation. They follow the patterns of the existing admin and site screens.
- `django-allauth` installs on Python 3.15 but declares support only up to 3.14. Branch 2 checks it with tests.
- On 2026-11-03, `grok models` reported "not authenticated". If a worker stalls on login, run `grok login`.
