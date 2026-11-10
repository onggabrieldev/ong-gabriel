---
name: django
description: >
  Python and Django conventions for the ONG Gabriel API.
  Use when writing or changing backend Python, Django, DRF, settings, types,
  a sentinel, auth, RBAC, pytest, or access rules.
---

# Django

Product rules for the schema, auth, RBAC, accounts, and Redis are in `CONTEXT.md`. Follow them.

Ruff is in the root `pyproject.toml`: line length 120, single quotes. The runtime is Python 3.15.

## Settings

One `AppSettings` class in `ong_gabriel_api/settings.py`, using pydantic-settings. Every other module reads environment values through that object. Do not call `os.environ` or `getenv` anywhere else. `ENVIRONMENT` is `local`, `dev`, or `prod`. `DEBUG` can be true only when `ENVIRONMENT=local`. `SECRET_KEY` has no default. Local, dev, and prod differ by environment variables, not by a second settings class. Secrets stay in the environment. `.env.example` lists the keys with empty values.

## Types

Annotate parameters and return values. Do not leave a function untyped, and do not use `Any` to skip a known shape. Request and response bodies are DRF serializers.

## sentinel

`sentinel` is a Python 3.15 builtin for a placeholder that must stay distinct from real data. Use it when `None` is a valid value and "omitted" needs its own marker. Prefer `None` when `None` is not valid data.

`MISSING = object()` is the old form. Its repr is an address, it has no type of its own, and `copy` or `pickle` can break an `is` check.

```python
MISSING = sentinel('MISSING')


def save(title: str | MISSING = MISSING) -> None:
    if title is MISSING:
        return
```

Create it once at module level. The variable name matches the string. Compare with `is`. A sentinel is truthy. Each `sentinel()` call returns a new object, so share the assigned one.

## Database

Django ORM and Postgres. Django migrations own every schema change. `AUTH_USER_MODEL` is `accounts.User` from the first migration. Do not add SQLite as a fallback.

## Access

Check the permission on the server for every protected read or write. DRF `DEFAULT_PERMISSION_CLASSES` is deny by default (`IsAuthenticated`). Public endpoints opt in explicitly, for example `AllowAny` or a plain Django view. The session cookie proves who the caller is. It does not grant a permission. Cookie flags and hosts come from settings, so local, dev, and prod do not grow a second auth path. Session authentication only. No JWT.

## Tests

Pytest-django covers behavior that can break: permission denied, conflicts, invalid input, and settings that must refuse a bad environment. Run tests against Postgres. Do not test a constant or a framework default for coverage.

When a route changes, update `backend/tests` if the behavior can fail, and update Bruno with the `bruno-endpoints` skill.
