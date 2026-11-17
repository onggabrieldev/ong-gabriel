import importlib

from django.test import Client, override_settings
from django.urls import clear_url_caches


def _reload_urls() -> None:
    import allauth.headless.urls as headless_urls

    import ong_gabriel_api.urls as urls

    importlib.reload(headless_urls)
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
        with override_settings(ENVIRONMENT='prod', HEADLESS_SERVE_SPECIFICATION=False):
            _reload_urls()
            assert client.get('/api/v1/schema/').status_code == 404
            assert client.get('/api/v1/docs/').status_code == 404
            assert client.get('/api/v1/_allauth/openapi.json').status_code == 404
    finally:
        _reload_urls()


def test_headless_openapi_available_outside_prod(client: Client) -> None:
    response = client.get('/api/v1/_allauth/openapi.json')
    assert response.status_code == 200


def test_html_login_and_signup_are_absent(client: Client) -> None:
    assert client.get('/api/v1/accounts/login/').status_code == 404
    assert client.get('/api/v1/accounts/signup/').status_code == 404


def test_app_client_is_not_routed(client: Client) -> None:
    assert client.get('/api/v1/_allauth/app/v1/auth/session').status_code == 404


def test_google_one_tap_and_login_page_are_not_routed(client: Client) -> None:
    assert client.post('/api/v1/accounts/google/login/token/').status_code == 404
    assert client.get('/api/v1/accounts/google/login/').status_code == 404
