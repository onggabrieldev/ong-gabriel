from pathlib import Path
from typing import Annotated, Literal, Self, TypedDict
from urllib.parse import unquote, urlparse

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

type Environment = Literal['local', 'dev', 'prod']

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

    @model_validator(mode='after')
    def debug_only_in_local(self) -> Self:
        if self.DEBUG and self.ENVIRONMENT != 'local':
            raise ValueError('DEBUG can be true only when ENVIRONMENT=local.')
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


env = AppSettings()

SECRET_KEY = env.SECRET_KEY
DEBUG = env.DEBUG
ENVIRONMENT = env.ENVIRONMENT
ALLOWED_HOSTS = env.ALLOWED_HOSTS
CSRF_TRUSTED_ORIGINS = env.CSRF_TRUSTED_ORIGINS

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
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
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

AUTH_USER_MODEL = 'accounts.User'

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
