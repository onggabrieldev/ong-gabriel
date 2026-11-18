#!/usr/bin/env bash
# Runs on the VPS from the Deploy workflow.
# Usage: release.sh <image tag> <GHCR user>, with a GHCR token on stdin.
set -euo pipefail

tag="$1"
ghcr_user="$2"

if [[ ! "$tag" =~ ^sha-[0-9a-f]{40}$ ]]; then
  echo "Invalid image tag: $tag" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

set_tag() {
  local key="$1"
  if grep -q "^${key}=" .env; then
    sed -i "s/^${key}=.*/${key}=$tag/" .env
  else
    echo "${key}=$tag" >> .env
  fi
}

# The tags live in .env so a manual `docker compose up -d` keeps the same release.
set_tag WEB_TAG
set_tag API_TAG

docker login ghcr.io --username "$ghcr_user" --password-stdin
trap 'docker logout ghcr.io >/dev/null' EXIT

docker compose pull
docker compose run --rm api python manage.py migrate --noinput
docker compose run --rm api python manage.py createcachetable
docker compose up -d --remove-orphans --wait
docker image prune -f
