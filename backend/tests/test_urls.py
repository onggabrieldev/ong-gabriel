import importlib

from django.test import Client, override_settings
from django.urls import clear_url_caches


def _reload_urls() -> None:
    import ong_gabriel_api.urls as urls

    importlib.reload(urls)
    clear_url_caches()


def test_schema_available_outside_prod(client: Client) -> None:
    response = client.get('/api/v1/schema/')
    assert response.status_code == 200


def test_docs_available_outside_prod(client: Client) -> None:
    response = client.get('/api/v1/docs/')
    assert response.status_code == 200


def test_schema_and_docs_absent_in_prod(client: Client) -> None:
    try:
        with override_settings(ENVIRONMENT='prod'):
            _reload_urls()
            assert client.get('/api/v1/schema/').status_code == 404
            assert client.get('/api/v1/docs/').status_code == 404
    finally:
        _reload_urls()
