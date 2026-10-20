---
title: Deploy
tags:
  - deploy
aliases:
  - Deploy
---

# Deploy

The site runs on a Hostinger VPS with Docker Compose. Only the Next.js site is deployed. The API is not deployed yet. See [[CONTEXT|Product context]].

```text
Browser ──HTTPS──▶ Caddy :443 ──HTTP──▶ web :3000 (Next.js standalone)
                    │
                    └─ Let's Encrypt certificate, HTTP → HTTPS, www → apex
```

## Files

| File | Role |
| --- | --- |
| `frontend/Dockerfile` | Builds the Next.js standalone server. Build context is the repository root. |
| `compose.yaml` | `web` and `caddy`. Only Caddy publishes ports. |
| `deploy/Caddyfile` | TLS, security headers, compression, the `www` redirect. |
| `deploy/release.sh` | Runs on the VPS: sets `WEB_TAG`, pulls, restarts, waits for health. |
| `.env.example` | `SITE_DOMAIN`, `ACME_EMAIL`, `WEB_TAG`. No secrets. |
| `.github/workflows/deploy.yml` | Builds the image, pushes it to GHCR, runs `release.sh` over SSH. |

## Why Caddy and not Nginx

Caddy is the reverse proxy, the job Nginx would do. It also gets and renews the Let's Encrypt certificate and redirects HTTP to HTTPS without extra setup. Nginx would need Certbot, a renewal timer, and a shared certificate volume. Changing to Nginx later only touches `compose.yaml` and `deploy/`.

## From zero

Follow these notes in order. Each one owns its steps.

1. [[deploy-vps|VPS]]: install Ubuntu, lock down SSH and the firewall, install Docker, create the `deploy` user and `/opt/ong-gabriel/.env`.
2. [[deploy-domain|Domain]]: point the DNS records at the VPS and wait until they resolve.
3. [[deploy-github|GitHub]]: branch rules, the `production` environment, its secret and variables.
4. Merge to `main`. CI passes, then Deploy builds and releases. See [[#Release flow]].
5. Check the site. See [[#Checks]].

> [!warning] DNS before the first release
> Caddy asks Let's Encrypt for a certificate as soon as it starts. If the domain does not point at the VPS yet, validation fails, and repeated failures hit the Let's Encrypt rate limit for about an hour.

## Release flow

1. A push to `main` runs CI (`Lint and test`). CI also builds the frontend.
2. When CI succeeds on a push to `main`, Deploy runs.
3. `Build image` pushes `ghcr.io/onggabrieldev/ong-gabriel/web:sha-<commit>` and `:latest`.
4. `Deploy to VPS` copies `compose.yaml`, `deploy/Caddyfile`, and `deploy/release.sh` to `/opt/ong-gabriel`. It runs `release.sh` with a GitHub token that works only during the job.
5. `release.sh` writes `WEB_TAG` into `.env`, runs `docker compose pull` and `docker compose up -d --wait`, then logs out of GHCR.

A failed CI run, or a push to another branch, does not deploy. GitHub runs `deploy.yml` only from the default branch, so nothing deploys until this file is on `main`.

## Rollback

In GitHub: **Actions → Deploy → Run workflow**, branch `main`, tag `sha-<commit>`. Deploy skips the build and releases that tag. Tags are listed on the package page in GHCR.

From the VPS, as `deploy`:

```sh
cd /opt/ong-gabriel
sed -i 's/^WEB_TAG=.*/WEB_TAG=sha-<commit>/' .env
docker compose up -d --wait
```

`docker compose pull` needs a GHCR login when the package is private. See [[deploy-github#Package visibility]].

## Checks

```sh
curl -I http://<domain>        # 308 to https
curl -I https://www.<domain>   # 301 to the apex
curl -I https://<domain>       # 200 with the security headers
```

On the VPS:

```sh
cd /opt/ong-gabriel
docker compose ps              # web is healthy
docker compose logs -f caddy   # certificate obtained
```

External tests: SSL Labs (`ssllabs.com/ssltest`) and `securityheaders.com`.

## Local run

`docker compose up --build` builds the image locally. Use `SITE_DOMAIN=localhost` in `.env`. Caddy then signs its own certificate, and the browser warns about it.

> [!warning] Keep Next.js current
> The server runs Next.js and React Server Components. A security release of either is a reason to update `frontend/package.json` and merge. The merge deploys it.
