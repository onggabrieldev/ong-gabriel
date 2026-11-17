import pytest
from django.test import Client, override_settings
from pydantic import ValidationError

from ong_gabriel_api.settings import AppSettings, mailers_from_settings, security_settings


def _settings(**overrides: object) -> AppSettings:
    values: dict[str, object] = {
        'ENVIRONMENT': 'local',
        'DEBUG': False,
        'SECRET_KEY': 'unit-test-secret-key',
        'DATABASE_URL': 'postgresql://ong_gabriel:ong_gabriel@127.0.0.1:5432/ong_gabriel',
        'ALLOWED_HOSTS': ['localhost'],
        'CSRF_TRUSTED_ORIGINS': ['http://localhost:3000'],
        'FRONTEND_URL': 'http://localhost:3000',
    }
    values.update(overrides)
    return AppSettings(_env_file=None, **values)


@pytest.mark.parametrize('environment', ['dev', 'prod'])
def test_debug_refused_outside_local(environment: str) -> None:
    with pytest.raises(ValidationError):
        _settings(ENVIRONMENT=environment, DEBUG=True)


def test_secret_key_required(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv('SECRET_KEY', raising=False)
    with pytest.raises(ValidationError):
        AppSettings(
            _env_file=None,
            ENVIRONMENT='local',
            DATABASE_URL='postgresql://ong_gabriel:ong_gabriel@127.0.0.1:5432/ong_gabriel',
            ALLOWED_HOSTS=['localhost'],
            CSRF_TRUSTED_ORIGINS=['http://localhost:3000'],
            FRONTEND_URL='http://localhost:3000',
        )


def test_unknown_environment_refused() -> None:
    with pytest.raises(ValidationError):
        _settings(ENVIRONMENT='staging')


def test_secure_cookies_and_hsts_outside_local() -> None:
    flags = security_settings('prod')
    assert flags['SESSION_COOKIE_HTTPONLY'] is True
    assert flags['SESSION_COOKIE_SAMESITE'] == 'Lax'
    assert flags['CSRF_COOKIE_SAMESITE'] == 'Lax'
    assert flags['SESSION_COOKIE_SECURE'] is True
    assert flags['CSRF_COOKIE_SECURE'] is True
    assert flags['SECURE_PROXY_SSL_HEADER'] == ('HTTP_X_FORWARDED_PROTO', 'https')
    assert flags['SECURE_HSTS_SECONDS'] == 31536000
    assert flags['SECURE_HSTS_INCLUDE_SUBDOMAINS'] is False
    assert flags['SECURE_HSTS_PRELOAD'] is False


def test_insecure_cookies_in_local() -> None:
    flags = security_settings('local')
    assert flags['SESSION_COOKIE_SECURE'] is False
    assert flags['CSRF_COOKIE_SECURE'] is False
    assert flags['SECURE_SSL_REDIRECT'] is False
    assert flags['SECURE_HSTS_SECONDS'] == 0
    assert flags['SECURE_PROXY_SSL_HEADER'] is None


@override_settings(SECURE_SSL_REDIRECT=True, SECURE_REDIRECT_EXEMPT=[r'^health$'])
def test_health_exempt_from_ssl_redirect(client: Client) -> None:
    client.handler.load_middleware()
    health = client.get('/health')
    assert health.status_code == 200
    admin = client.get('/django-admin/')
    assert admin.status_code == 301


def test_frontend_url_strips_trailing_slash() -> None:
    settings = _settings(FRONTEND_URL='http://localhost:3000/')
    assert settings.FRONTEND_URL == 'http://localhost:3000'


def test_frontend_url_rejects_path() -> None:
    with pytest.raises(ValidationError):
        _settings(FRONTEND_URL='http://localhost:3000/app')


@pytest.mark.parametrize('environment', ['dev', 'prod'])
def test_trusted_proxy_count_required_outside_local(environment: str) -> None:
    with pytest.raises(ValidationError):
        _settings(ENVIRONMENT=environment, TRUSTED_PROXY_COUNT=0)


def test_trusted_proxy_count_zero_allowed_in_local() -> None:
    settings = _settings(ENVIRONMENT='local', TRUSTED_PROXY_COUNT=0)
    assert settings.TRUSTED_PROXY_COUNT == 0


def test_mailers_built_from_email_env_fields() -> None:
    settings = _settings()
    mailers = mailers_from_settings(
        host=settings.EMAIL_HOST,
        port=settings.EMAIL_PORT,
        username=settings.EMAIL_HOST_USER,
        password=settings.EMAIL_HOST_PASSWORD,
        use_tls=settings.EMAIL_USE_TLS,
    )
    options = mailers['default']['OPTIONS']
    assert mailers['default']['BACKEND'] == 'django.core.mail.backends.smtp.EmailBackend'
    assert options['host'] == '127.0.0.1'
    assert options['port'] == 1025
    assert options['use_tls'] is False
