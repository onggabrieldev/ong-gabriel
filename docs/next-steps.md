---
title: Next steps
tags:
  - planning
aliases:
  - Próximos passos
---

# Next steps

Where the Django migration stands and what comes next. The full branch plan and every decision are in [[django-migration-decisions|Django migration decisions]].

> [!important] How to work on the next branches
> Make changes directly on a branch in the main checkout, `C:\Users\kaironn\code\ong-gabriel`, created from an up-to-date `main`. Do not create a separate worktree. The owner checks each branch there before it is committed.
>
> 1. `git switch main && git pull`
> 2. `git switch -c Kaironn2/<branch-name>`
> 3. Implement, review, and leave the changes uncommitted until the owner tests and approves them.
> 4. After approval: commit with the owner's identity, open the pull request with the `Kaironn2` gh account, wait for CI, then merge.

## Done

- Branch 1, `feat-django-api`: Django and DRF, custom user, Postgres, `/health`. Merged in PR #14.
- Branch 2, `feat-accounts-api`: allauth headless, Google, email verification behind a flag, team passwords and recovery, login rate limit, roles, `/api/v1/me/`. See [[accounts|Accounts]].

## Next: branch 3, `feat-auth-screens`

Sign in, sign up, email verification, and password reset screens in Next.js. They call the routes in [[accounts|Accounts]].

Before it starts:

- [ ] Confirm the proposed "Session in pages" entry in [[django-migration-decisions|Django migration decisions]]: the session is read only in client-side blocks, public pages stay static, and admin JavaScript never loads on public pages.
- [ ] Decide the screen URLs. Branch 2 already sends these in emails: `/conta/confirmar-email/{key}`, `/conta/redefinir-senha/{key}`, `/conta/cadastro`, and `/conta/entrar/erro`. Changing them means changing `HEADLESS_FRONTEND_URLS` too.

Things branch 3 must handle:

- **Same origin in local dev.** Production is same-origin through Caddy. Locally the API runs on `127.0.0.1:8000` and Next.js on `localhost:3000`, so the session and CSRF cookies would not be shared. Proxy `/api/*` through Next.js (rewrites) in dev instead of adding CORS.
- **CSRF.** Call `GET /api/v1/_allauth/browser/v1/auth/session` first, then send the `csrftoken` cookie value as `X-CSRFToken` on every write. Django rotates the token on login.
- **Keys in links.** The key in a verification or reset link is URL-encoded. Decode it from the path before posting it.
- **Error text.** allauth's pt-BR text for a failed login reads "Conexão inválida". Show our own message for the `invalid_login` code.
- **Quality bar.** Accessibility, Lighthouse 100 on the home page, responsive layout, and the Figma patterns. The Figma file has no auth screens, so follow the existing admin and site screens.

## Waiting on the owner

> [!todo] Google, for real Google login
> A Google Cloud project, ideally under an ONG account, with an OAuth Client ID. Redirect URIs are in [[accounts|Accounts]]. Local testing can use a personal project.

> [!todo] Email, for production
> A transactional email provider and DNS records. Without it, team password recovery does not work in production. Team password login still works.

## For the API deploy (branch 11)

- Set `FRONTEND_URL`, `TRUSTED_PROXY_COUNT=1`, the email keys, and the Google keys on the server.
- Run `createcachetable` after `migrate`, or login rate limits fail.
- Decide what password recovery does if no email provider exists yet.

## Known local issue

On Windows, `core.autocrlf=true` checks files out with CRLF, so `pnpm lint:web` and `ruff format --check` complain locally even on `main`. CI runs on Linux and passes. Leave it alone.

Back to [[Home|Docs]].
