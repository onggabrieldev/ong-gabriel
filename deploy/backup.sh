#!/usr/bin/env bash
# Daily Postgres dump on the VPS. Cron: 0 3 * * * /opt/ong-gabriel/deploy/backup.sh
set -euo pipefail

cd "$(dirname "$0")/.."
backup_dir=/opt/ong-gabriel/backups
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"

timestamp=$(date +%Y%m%d-%H%M%S)
outfile="$backup_dir/ong-gabriel-${timestamp}.sql.gz"
tmpfile="$outfile.tmp"

cleanup() {
  rm -f "$tmpfile"
}
trap cleanup EXIT

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip -c > "$tmpfile"
chmod 600 "$tmpfile"
mv "$tmpfile" "$outfile"
trap - EXIT

find "$backup_dir" -type f -name 'ong-gabriel-*.sql.gz' -mtime +14 -delete
