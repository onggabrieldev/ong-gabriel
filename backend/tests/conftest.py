from collections.abc import Iterator

import pytest
from django.core.cache import cache
from django.core.management import call_command
from pytest_django import DjangoDbBlocker


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup: None, django_db_blocker: DjangoDbBlocker) -> None:
    with django_db_blocker.unblock():
        call_command('createcachetable', verbosity=0)


@pytest.fixture(autouse=True)
def clear_cache(request: pytest.FixtureRequest) -> Iterator[None]:
    uses_db = any(name in request.fixturenames for name in ('db', 'django_db_setup', 'transactional_db'))
    if not uses_db:
        yield
        return
    cache.clear()
    yield
    cache.clear()
