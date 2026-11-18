---
title: Accounts
tags:
  - api
  - auth
  - accounts
aliases:
  - Contas
---

# Accounts

django-allauth in headless mode owns identity, sessions, email verification, password recovery, and Google. Next.js only renders the screens. Product decisions are in [[django-migration-decisions|Django migration decisions]]. Product context is in [[CONTEXT|Product context]].

The browser client uses the Django session cookie and Django CSRF. There are no JWTs and no app tokens.

## Routes

Caddy forwards `/api/*` to Django. Headless routes live under `/api/v1/_allauth/browser/v1/`. Only the Google OAuth callback is routed under `/api/v1/accounts/`.

| Operation | Method | Path |
| --- | --- | --- |
| Config | GET | `/api/v1/_allauth/browser/v1/config` |
| Session | GET | `/api/v1/_allauth/browser/v1/auth/session` |
| Login | POST | `/api/v1/_allauth/browser/v1/auth/login` |
| Logout | DELETE | `/api/v1/_allauth/browser/v1/auth/session` |
| Signup | POST | `/api/v1/_allauth/browser/v1/auth/signup` |
| Verify email | POST | `/api/v1/_allauth/browser/v1/auth/email/verify` |
| Password request | POST | `/api/v1/_allauth/browser/v1/auth/password/request` |
| Password reset | POST | `/api/v1/_allauth/browser/v1/auth/password/reset` |
| Password change | POST | `/api/v1/_allauth/browser/v1/account/password/change` |
| Google redirect | POST | `/api/v1/_allauth/browser/v1/auth/provider/redirect` |
| Google callback | GET | `/api/v1/accounts/google/login/callback/` |
| Current user | GET, PATCH | `/api/v1/me/` |

HTML login and signup pages are not routed. Google One Tap (`/api/v1/accounts/google/login/token/`) is not routed either, because it skips Django CSRF. The app client is not routed. Headless OpenAPI (`/api/v1/_allauth/openapi.json`) is served only outside prod, like the DRF schema.

Session writes send `X-CSRFToken` with the `csrftoken` cookie. In Bruno, run `auth/Session` first: each response that sets `csrftoken` stores it in the `csrfToken` variable, and Django rotates it on login.

The key in a verification or reset link is URL-encoded (`%3A` stands for `:`). The Next.js page decodes it from the path. In Bruno, paste the decoded key into `verificationKey` or `resetKey`.

Email verify and password reset succeed without opening a session (`ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION` and `ACCOUNT_LOGIN_ON_PASSWORD_RESET` stay off). Headless then returns `401` with `meta.is_authenticated: false`. The user signs in afterwards.

## Flags

| Setting | Default | Role |
| --- | --- | --- |
| `FRONTEND_URL` | required | Next.js origin, no trailing slash. Builds verification and reset links. |
| `SIGNUP_ENABLED` | `false` | When false, every signup is closed, Google included. Login still works for accounts that already exist. |
| `PASSWORD_SIGNUP_ENABLED` | `false` | When false, email and password signup is closed. Only applies when `SIGNUP_ENABLED` is true. |
| `TRUSTED_PROXY_COUNT` | `0` | Trusted hops in `X-Forwarded-For`. Must equal the real number of proxies: `1` behind Caddy. Must be at least `1` outside `local`. |
| `EMAIL_HOST` | `127.0.0.1` | SMTP host. Local default is Mailpit. Builds `MAILERS['default']`. |
| `EMAIL_PORT` | `1025` | SMTP port. |
| `EMAIL_HOST_USER` | empty | SMTP username. Empty for Mailpit. |
| `EMAIL_HOST_PASSWORD` | empty | SMTP password. Empty for Mailpit. |
| `EMAIL_USE_TLS` | `false` | STARTTLS. False for Mailpit. |
| `DEFAULT_FROM_EMAIL` | `ONG Gabriel <noreply@localhost>` | From address for account emails. |
| `GOOGLE_CLIENT_ID` | empty | Google OAuth client ID. Empty disables the provider. |
| `GOOGLE_CLIENT_SECRET` | empty | Google OAuth client secret. Empty disables the provider. |

Frontend paths used in emails:

- confirm email: `{FRONTEND_URL}/conta/confirmar-email/{key}`
- reset password (request): `{FRONTEND_URL}/conta/redefinir-senha`
- reset password (from key): `{FRONTEND_URL}/conta/redefinir-senha/{key}`
- signup: `{FRONTEND_URL}/conta/cadastro`
- social login error: `{FRONTEND_URL}/conta/entrar/erro`

## Login

Sign-in accepts the username or the email. A failed sign-in returns one generic error, so it does not reveal whether the username or email exists. Enumeration is also prevented on signup and password reset (`ACCOUNT_PREVENT_ENUMERATION`).

With `SIGNUP_ENABLED=false` (the default), nobody can create an account through the API, including Google. Existing accounts still sign in. Create the first team accounts with `createsuperuser` or in Django admin. `PASSWORD_SIGNUP_ENABLED` only matters when signup is open.

The Next.js admin accepts a superuser or a member of the `editor` group.

Username rules match the `User` model: min 3, max 32, `[A-Za-z0-9._-]`, no `@`, unique ignoring case. Emails are unique ignoring case.

Accounts created on the site must confirm their email (`ACCOUNT_EMAIL_VERIFICATION = 'mandatory'`). Team accounts created by a superuser in Django admin get a primary, verified `EmailAddress` for `user.email`, so they can sign in with a password without a verification mail. An email change in that admin save follows through.

## Google

Register these redirect URIs with Google:

- production: `https://<domain>/api/v1/accounts/google/login/callback/`
- local: `http://127.0.0.1:8000/api/v1/accounts/google/login/callback/`

Scopes are `openid`, `email`, and `profile`. Credentials come from the environment. The provider is configured in `SOCIALACCOUNT_PROVIDERS['google']['APP']` only when both are set. There are no `SocialApp` database rows. With them empty, the headless config endpoint does not list Google.

A Google verified email can sign in to an existing account with that email (`SOCIALACCOUNT_EMAIL_AUTHENTICATION` and auto-connect), but only when that local address is verified too. allauth would otherwise fall back to an unverified address, so anyone who parked a victim's email on their own account would receive the victim's Google login. Each account holds one email (`ACCOUNT_MAX_EMAIL_ADDRESSES = 1`). A Google signup gets a generated username from the Google given name (or the first word of the full name), slugged, then a random 4-digit suffix (`jose4821`). The email is never used: the username is public on comments. With no usable name, the stem is `usuario`. A case-insensitive collision draws a new suffix; after a few tries the suffix grows more digits, still fitting 32 characters. The user can change that username later through `PATCH /api/v1/me/`.

## Roles

Django groups are the RBAC. A data migration creates `editor` (content) and `moderator` (comments). A commenter has no group. Content and comment models are not here yet, so the groups get permissions in later branches.

DRF classes `IsEditor` and `IsModerator` live in `accounts/permissions.py`. A superuser passes both. Anonymous and group-less users are denied.

`GET /api/v1/me/` returns `id`, `username`, `email`, `roles` (group names among editor/moderator), and `is_superuser`. `PATCH /api/v1/me/` changes only `username`.

## Rate limits

allauth rate limits use the Django cache. `CACHES['default']` is `django.core.cache.backends.db.DatabaseCache` with table `django_cache`. Create that table after migrate:

```text
pnpm migrate:api
```

That script runs `migrate` and `createcachetable`. Tests create the table in the session setup.

allauth defaults. Brazil has heavy CGNAT, so many real users share one IP. Tightening the per-IP login limit would block those users. The per-key half of `login_failed` still protects each account.

| Action | Limit | Why |
| --- | --- | --- |
| `login` | `30/m/ip` | allauth default. Not tightened: CGNAT means many users share one IP. |
| `login_failed` | `10/m/ip,5/5m/key` | allauth default. The per-key half is five failures per five minutes for one username or email. |
| `signup` | `20/m/ip` | Default. |
| `reset_password` | `20/m/ip,5/m/key` | Default. |
| `reset_password_from_key` | `20/m/ip` | Default. |
| `confirm_email` | `1/180s/key` | Default cooldown. |

`TRUSTED_PROXY_COUNT` maps to `ALLAUTH_TRUSTED_PROXY_COUNT`. Outside `local` it must be at least 1. Set it to the exact number of proxies: a larger value lets a client choose the IP the limits key on, by prepending its own `X-Forwarded-For` entries.

## Mailpit

Dev only, in `compose.dev.yaml`. Image `axllent/mailpit:v1.33.1`. SMTP is `127.0.0.1:1025`. Web UI is `http://127.0.0.1:8025`. Django tests use locmem mail; Mailpit is for a running local server.

```text
docker compose -f compose.dev.yaml up -d
SIGNUP_ENABLED=true PASSWORD_SIGNUP_ENABLED=true uv run python backend/manage.py runserver 127.0.0.1:8000
```

Open `http://127.0.0.1:8025/` or `http://127.0.0.1:8025/api/v1/messages` after a signup or password reset.

Back to [[CONTEXT|Product context]].
