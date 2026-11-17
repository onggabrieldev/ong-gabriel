from pathlib import Path
from typing import Annotated, Literal, Self, TypedDict
from urllib.parse import unquote, urlparse

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

type Environment = Literal['local', 'dev', 'prod']
CACHE_TABLE = 'django_cache'

_REPO_ROOT = Path(__file__).resolve().parents[3]
_BACKEND_DIR = Path(__file__).resolve().parents[2]


class SecuritySettings(TypedDict):
    SESSION_COOKIE_HTTPONLY: bool
    SESSION_COOKIE_SAMESITE: Literal['Lax']
    CSRF_COOKIE_SAMESITE: Literal['Lax']
    SESSION_COOKIE_SECURE: bool
    CSRF_COOKIE_SECURE: bool
    SECURE_SSL_REDIRECT: bool
    SECURE_HSTS_SECONDS: int
    SECURE_HSTS_INCLUDE_SUBDOMAINS: bool
    SECURE_HSTS_PRELOAD: bool
    SECURE_PROXY_SSL_HEADER: tuple[str, str] | None


class MailerOptions(TypedDict):
    host: str
    port: int
    username: str
    password: str
    use_tls: bool


class MailerConfig(TypedDict):
    BACKEND: str
    OPTIONS: MailerOptions


class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_REPO_ROOT / '.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    ENVIRONMENT: Environment
    DEBUG: bool = False
    SECRET_KEY: str = Field(min_length=1)
    DATABASE_URL: str
    ALLOWED_HOSTS: Annotated[list[str], NoDecode] = Field(min_length=1)
    CSRF_TRUSTED_ORIGINS: Annotated[list[str], NoDecode] = Field(min_length=1)
    FRONTEND_URL: str
    PASSWORD_SIGNUP_ENABLED: bool = False
    TRUSTED_PROXY_COUNT: int = Field(default=0, ge=0)
    EMAIL_HOST: str = '127.0.0.1'
    EMAIL_PORT: int = 1025
    EMAIL_HOST_USER: str = ''
    EMAIL_HOST_PASSWORD: str = ''
    EMAIL_USE_TLS: bool = False
    DEFAULT_FROM_EMAIL: str = 'ONG Gabriel <noreply@localhost>'
    GOOGLE_CLIENT_ID: str = ''
    GOOGLE_CLIENT_SECRET: str = ''

    @field_validator('ALLOWED_HOSTS', 'CSRF_TRUSTED_ORIGINS', mode='before')
    @classmethod
    def split_csv(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [part.strip() for part in value.split(',') if part.strip()]
        return value

    @field_validator('DATABASE_URL')
    @classmethod
    def postgres_url(cls, value: str) -> str:
        scheme = urlparse(value).scheme
        if scheme not in {'postgres', 'postgresql'}:
            raise ValueError('DATABASE_URL must be a postgres URL.')
        return value

    @field_validator('FRONTEND_URL')
    @classmethod
    def origin_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
            raise ValueError('FRONTEND_URL must be an http(s) origin.')
        if parsed.path not in {'', '/'} or parsed.query or parsed.fragment:
            raise ValueError('FRONTEND_URL must be an origin with no path, query, or fragment.')
        return f'{parsed.scheme}://{parsed.netloc}'

    @model_validator(mode='after')
    def debug_only_in_local(self) -> Self:
        if self.DEBUG and self.ENVIRONMENT != 'local':
            raise ValueError('DEBUG can be true only when ENVIRONMENT=local.')
        if self.ENVIRONMENT != 'local' and self.TRUSTED_PROXY_COUNT < 1:
            raise ValueError('TRUSTED_PROXY_COUNT must be at least 1 when ENVIRONMENT is not local.')
        return self

    def database(self) -> dict[str, str]:
        parsed = urlparse(self.DATABASE_URL)
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': unquote(parsed.path.lstrip('/')),
            'USER': unquote(parsed.username or ''),
            'PASSWORD': unquote(parsed.password or ''),
            'HOST': parsed.hostname or '',
            'PORT': str(parsed.port or 5432),
        }


def security_settings(environment: Environment) -> SecuritySettings:
    outside_local = environment != 'local'
    return {
        'SESSION_COOKIE_HTTPONLY': True,
        'SESSION_COOKIE_SAMESITE': 'Lax',
        'CSRF_COOKIE_SAMESITE': 'Lax',
        'SESSION_COOKIE_SECURE': outside_local,
        'CSRF_COOKIE_SECURE': outside_local,
        'SECURE_SSL_REDIRECT': outside_local,
        'SECURE_HSTS_SECONDS': 31536000 if outside_local else 0,
        'SECURE_HSTS_INCLUDE_SUBDOMAINS': False,
        'SECURE_HSTS_PRELOAD': False,
        'SECURE_PROXY_SSL_HEADER': ('HTTP_X_FORWARDED_PROTO', 'https') if outside_local else None,
    }


def renderer_classes(environment: Environment) -> list[str]:
    classes = ['rest_framework.renderers.JSONRenderer']
    if environment == 'local':
        classes.append('rest_framework.renderers.BrowsableAPIRenderer')
    return classes


def headless_frontend_urls(frontend_url: str) -> dict[str, str]:
    return {
        'account_confirm_email': f'{frontend_url}/conta/confirmar-email/{{key}}',
        'account_reset_password': f'{frontend_url}/conta/redefinir-senha',
        'account_reset_password_from_key': f'{frontend_url}/conta/redefinir-senha/{{key}}',
        'account_signup': f'{frontend_url}/conta/cadastro',
        'socialaccount_login_error': f'{frontend_url}/conta/entrar/erro',
    }


def mailers_from_settings(
    *,
    host: str,
    port: int,
    username: str,
    password: str,
    use_tls: bool,
) -> dict[str, MailerConfig]:
    return {
        'default': {
            'BACKEND': 'django.core.mail.backends.smtp.EmailBackend',
            'OPTIONS': {
                'host': host,
                'port': port,
                'username': username,
                'password': password,
                'use_tls': use_tls,
            },
        }
    }


def google_provider_settings(client_id: str, client_secret: str) -> dict[str, object]:
    google: dict[str, object] = {
        'SCOPE': ['openid', 'email', 'profile'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'VERIFIED_EMAIL': True,
        'EMAIL_AUTHENTICATION': True,
    }
    if client_id and client_secret:
        google['APP'] = {
            'client_id': client_id,
            'secret': client_secret,
            'key': '',
        }
    return google


env = AppSettings()

SECRET_KEY = env.SECRET_KEY
DEBUG = env.DEBUG
ENVIRONMENT = env.ENVIRONMENT
ALLOWED_HOSTS = env.ALLOWED_HOSTS
CSRF_TRUSTED_ORIGINS = env.CSRF_TRUSTED_ORIGINS
FRONTEND_URL = env.FRONTEND_URL
PASSWORD_SIGNUP_ENABLED = env.PASSWORD_SIGNUP_ENABLED
TRUSTED_PROXY_COUNT = env.TRUSTED_PROXY_COUNT

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_spectacular',
    'ong_gabriel_api.accounts',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.headless',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'ong_gabriel_api.urls'
WSGI_APPLICATION = 'ong_gabriel_api.wsgi.application'
ASGI_APPLICATION = 'ong_gabriel_api.asgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {'default': env.database()}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': CACHE_TABLE,
    }
}

AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = _BACKEND_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

_security = security_settings(env.ENVIRONMENT)
SESSION_COOKIE_HTTPONLY = _security['SESSION_COOKIE_HTTPONLY']
SESSION_COOKIE_SAMESITE = _security['SESSION_COOKIE_SAMESITE']
CSRF_COOKIE_SAMESITE = _security['CSRF_COOKIE_SAMESITE']
SESSION_COOKIE_SECURE = _security['SESSION_COOKIE_SECURE']
CSRF_COOKIE_SECURE = _security['CSRF_COOKIE_SECURE']
SECURE_SSL_REDIRECT = _security['SECURE_SSL_REDIRECT']
SECURE_HSTS_SECONDS = _security['SECURE_HSTS_SECONDS']
SECURE_HSTS_INCLUDE_SUBDOMAINS = _security['SECURE_HSTS_INCLUDE_SUBDOMAINS']
SECURE_HSTS_PRELOAD = _security['SECURE_HSTS_PRELOAD']
SECURE_PROXY_SSL_HEADER = _security['SECURE_PROXY_SSL_HEADER']
SECURE_REDIRECT_EXEMPT = [r'^health$']

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': renderer_classes(env.ENVIRONMENT),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'ONG Gabriel API',
    'VERSION': '0.1.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
}

MAILERS = mailers_from_settings(
    host=env.EMAIL_HOST,
    port=env.EMAIL_PORT,
    username=env.EMAIL_HOST_USER,
    password=env.EMAIL_HOST_PASSWORD,
    use_tls=env.EMAIL_USE_TLS,
)
DEFAULT_FROM_EMAIL = env.DEFAULT_FROM_EMAIL

HEADLESS_ONLY = True
HEADLESS_CLIENTS = ('browser',)
HEADLESS_SERVE_SPECIFICATION = env.ENVIRONMENT != 'prod'
HEADLESS_FRONTEND_URLS = headless_frontend_urls(env.FRONTEND_URL)

ACCOUNT_ADAPTER = 'ong_gabriel_api.accounts.adapters.AccountAdapter'
ACCOUNT_LOGIN_METHODS = {'username', 'email'}
ACCOUNT_SIGNUP_FIELDS = ['username*', 'email*', 'password1*']
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_PREVENT_ENUMERATION = True
ACCOUNT_MAX_EMAIL_ADDRESSES = 1
ACCOUNT_USERNAME_MIN_LENGTH = 3
ACCOUNT_USERNAME_VALIDATORS = 'ong_gabriel_api.accounts.validators.ACCOUNT_USERNAME_VALIDATORS'
ACCOUNT_EMAIL_SUBJECT_PREFIX = '[ONG Gabriel] '

SOCIALACCOUNT_ADAPTER = 'ong_gabriel_api.accounts.adapters.SocialAccountAdapter'
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_STORE_TOKENS = False
SOCIALACCOUNT_PROVIDERS = {
    'google': google_provider_settings(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET),
}

ALLAUTH_TRUSTED_PROXY_COUNT = env.TRUSTED_PROXY_COUNT

LOGIN_REDIRECT_URL = env.FRONTEND_URL
ACCOUNT_LOGOUT_REDIRECT_URL = env.FRONTEND_URL
