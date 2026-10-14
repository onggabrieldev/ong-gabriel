---
name: fastapi
description: >
  Python and FastAPI conventions for the ONG Gabriel API.
  Use when writing or changing backend Python, FastAPI routes, SQLAlchemy,
  Alembic, auth, RBAC, pytest, settings, types, or a sentinel.
---

# FastAPI

Product rules for the schema, auth, RBAC, accounts, and Redis are in `CONTEXT.md`. Follow them.

Ruff is in the root `pyproject.toml`: line length 120, single quotes. The runtime is Python 3.15.

## Settings

One `Settings` class in `ong_gabriel_api/settings.py`, using pydantic-settings. Every other module imports that object. Do not call `os.environ` or `getenv` anywhere else. Local, dev, and prod differ by environment variables, not by a second settings class. Secrets stay in the environment. `.env.example` lists the keys with empty values.

## Types

Annotate parameters and return values. Do not leave a function untyped, and do not use `Any` to skip a known shape. Request and response bodies are Pydantic models.

## Annotated dependencies

Define the alias once. Use the alias at the call site.

```python
CurrentUser = Annotated[User, Depends(get_current_user)]
```

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

SQLAlchemy 2 async and Postgres. Alembic owns every schema change. One `AsyncSession` per request, with `expire_on_commit=False`. Load relationships in the query. Do not call the sync engine from an async route.

## Access

Check the RBAC permission on the server for every protected read or write. The default is deny. The cookie proves who the caller is. It does not grant a permission. Cookie flags and the API origin come from settings, so local, dev, and prod do not grow a second auth path.

## Tests

Pytest covers behavior that can break: permission denied, conflicts, expired or missing auth, invalid input, and filters. Do not test a constant or a framework default for coverage.

When a route changes, update `backend/tests` if the behavior can fail, and update Bruno with the `bruno-endpoints` skill.
