---
title: Deploy
tags:
  - deploy
aliases:
  - Deploy
---

# Deploy

The site runs on a Hostinger VPS with Docker Compose. Caddy terminates TLS and sends `/api/*` to Django and `/media/*` to the media volume. Everything else goes to Next.js. See [[CONTEXT|Product context]].

```text
Browser ──HTTPS──▶ Caddy :443 ── /api/*    ──▶ api :8000 (Django / gunicorn)
                    │           ── /media/* ──▶ media volume (file_server)
                    │           ── other     ──▶ web :3000 (Next.js standalone)
                    │
                    └─ Let's Encrypt certificate, HTTP → HTTPS, www → apex

api ── Postgres :5432 (db, unpublished)
web ── GET http://api:8000/api/v1/testimonials/  (Host: api, X-Forwarded-Proto: https)
```

Caddy never forwards `/django-admin/`. That path stays in Django for local use and an SSH tunnel.

## Files

| File | Role |
| --- | --- |
| `frontend/Dockerfile` | Builds the Next.js standalone server. Build context is the repository root. |
| `backend/Dockerfile` | Builds the Django API. Build context is the repository root. |
| `compose.yaml` | `db`, `api`, `web`, and `caddy`. Only Caddy publishes ports. |
| `deploy/Caddyfile` | TLS, security headers, `/api` and `/media` routing, the `www` redirect. |
| `deploy/release.sh` | Runs on the VPS: sets `WEB_TAG` and `API_TAG`, pulls, migrates, restarts, waits for health. |
| `deploy/backup.sh` | Daily `pg_dump`, 14 days in `/opt/ong-gabriel/backups`. |
| `.env.example` | Site, image tags, Django, and Postgres keys. No secrets. |
| `.github/workflows/deploy.yml` | Builds both images, pushes them to GHCR, runs `release.sh` over SSH. |

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

1. A push to `main` runs CI (`Lint and test`). CI also builds the frontend and the API image.
2. When CI succeeds on a push to `main`, Deploy runs.
3. `Build image` pushes `ghcr.io/onggabrieldev/ong-gabriel/web:sha-<commit>` and `:latest`, and the same tags for `.../api`.
4. `Deploy to VPS` copies `compose.yaml`, `deploy/Caddyfile`, `deploy/release.sh`, and `deploy/backup.sh` to `/opt/ong-gabriel`. It runs `release.sh` with a GitHub token that works only during the job.
5. `release.sh` writes `WEB_TAG` and `API_TAG` into `.env`, pulls both images, runs `migrate --noinput` and `createcachetable`, then `docker compose up -d --wait`, then logs out of GHCR.

A failed CI run, or a push to another branch, does not deploy. GitHub runs `deploy.yml` only from the default branch, so nothing deploys until this file is on `main`.

## Rollback

In GitHub: **Actions → Deploy → Run workflow**, branch `main`, tag `sha-<commit>`. Deploy skips the build and releases that tag for both images. Tags are listed on the package pages in GHCR.

A tag from before this branch has no API image. Rolling it back with the workflow, or by setting both `WEB_TAG` and `API_TAG`, fails. To roll back only the site, set `WEB_TAG` by hand and restart web:

```sh
cd /opt/ong-gabriel
sed -i 's/^WEB_TAG=.*/WEB_TAG=sha-<commit>/' .env
docker compose up -d web
```

From the VPS, as `deploy`, when both images exist for that tag:

```sh
cd /opt/ong-gabriel
sed -i 's/^WEB_TAG=.*/WEB_TAG=sha-<commit>/' .env
sed -i 's/^API_TAG=.*/API_TAG=sha-<commit>/' .env
docker compose up -d --wait
```

`docker compose pull` needs a GHCR login when the package is private. See [[deploy-github#Package visibility]].

## Checks

```sh
curl -I http://<domain>                    # 308 to https
curl -I https://www.<domain>               # 301 to the apex
curl -I https://<domain>                   # 200 with the security headers
curl -s https://<domain>/api/v1/testimonials/
curl -s https://<domain>/health            # served by Next.js; API health is internal
```

On the VPS:

```sh
cd /opt/ong-gabriel
docker compose ps              # db, api, web, caddy are healthy
docker compose logs -f caddy   # certificate obtained
docker compose exec api python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/health').read())"
```

External tests: SSL Labs (`ssllabs.com/ssltest`) and `securityheaders.com`.

## Backups

`deploy/backup.sh` dumps Postgres through `docker compose exec -T db`, gzips it, writes `/opt/ong-gabriel/backups/ong-gabriel-<timestamp>.sql.gz` mode 600, and deletes files older than 14 days. Cron, as `deploy`:

```sh
crontab -e
```

```text
0 3 * * * /opt/ong-gabriel/deploy/backup.sh
```

Restore:

```sh
cd /opt/ong-gabriel
gunzip -c backups/ong-gabriel-<timestamp>.sql.gz | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Stop `api` first if you need a quiet restore (`docker compose stop api`). Off-site copies come later.

## Django admin

Caddy does not send `/django-admin/` to Django. Create the first superuser on the VPS:

```sh
cd /opt/ong-gabriel
docker compose exec api python manage.py createsuperuser
```

To open the Django admin from your computer, tunnel to the api container:

```sh
# On the VPS, as deploy:
cid=$(docker compose ps -q api)
ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$cid")
echo "$ip"
```

Then from your computer: `ssh -N -L 8000:<ip>:8000 deploy@<ipv4>` and open `http://127.0.0.1:8000/django-admin/`. `ALLOWED_HOSTS` already includes `127.0.0.1` for the container healthcheck. Add `http://127.0.0.1:8000` to `CSRF_TRUSTED_ORIGINS` if a POST in that admin is rejected.

## Local run

`docker compose up --build` builds the images locally. Use `SITE_DOMAIN=localhost` in `.env`. Caddy then signs its own certificate, and the browser warns about it. Fill the Django and Postgres keys from `.env.example`. `MEDIA_ROOT` can stay empty: compose sets `/media` in the api container.

Internal Next.js calls to the API send `X-Forwarded-Proto: https` and `Host: api`. Do not add a new SSL-redirect exemption for those routes.

> [!warning] Keep Next.js current
> The server runs Next.js and React Server Components. A security release of either is a reason to update `frontend/package.json` and merge. The merge deploys it.
