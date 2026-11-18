# syntax=docker/dockerfile:1
# Build context is the repository root, where the uv workspace and lockfile live.

FROM python:3.15-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.12.3 /uv /bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0
COPY pyproject.toml uv.lock ./
COPY backend backend
RUN uv sync --frozen --no-dev --package ong-gabriel-api --no-editable

FROM python:3.15-slim AS runner
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid app --create-home --home-dir /home/app app \
    && mkdir -p /media /app \
    && chown app:app /media /app
WORKDIR /app
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --from=builder --chown=app:app /app/backend/manage.py /app/manage.py
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=ong_gabriel_api.settings
USER app
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "30", "--graceful-timeout", "30", "--access-logfile", "-", "--error-logfile", "-", "ong_gabriel_api.wsgi:application"]
