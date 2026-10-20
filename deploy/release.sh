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

# The tag lives in .env so a manual `docker compose up -d` keeps the same release.
if grep -q '^WEB_TAG=' .env; then
  sed -i "s/^WEB_TAG=.*/WEB_TAG=$tag/" .env
else
  echo "WEB_TAG=$tag" >> .env
fi

docker login ghcr.io --username "$ghcr_user" --password-stdin
trap 'docker logout ghcr.io >/dev/null' EXIT

docker compose pull
docker compose up -d --remove-orphans --wait
docker image prune -f
