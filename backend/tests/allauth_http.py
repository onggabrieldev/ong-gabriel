import re
from urllib.parse import parse_qs, unquote, urlparse

from django.core import mail
from django.http import HttpResponse
from django.test import Client

from ong_gabriel_api.accounts.emails import sync_verified_primary_email
from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.settings import google_provider_settings

HEADLESS_BROWSER = '/api/v1/_allauth/browser/v1'
PASSWORD = 'test-pass-ok-9x'
GOOGLE_PROVIDERS = {'google': google_provider_settings('test-google-client-id', 'test-google-secret')}
GOOGLE_CALLBACK = 'http://localhost:3000/conta/entrar'


def json_get(client: Client, path: str) -> HttpResponse:
    return client.get(f'{HEADLESS_BROWSER}{path}')


def json_post(client: Client, path: str, payload: dict[str, object]) -> HttpResponse:
    return client.post(f'{HEADLESS_BROWSER}{path}', data=payload, content_type='application/json')


def json_delete(client: Client, path: str) -> HttpResponse:
    return client.delete(f'{HEADLESS_BROWSER}{path}')


def csrf_token(client: Client) -> str:
    json_get(client, '/auth/session')
    return client.cookies['csrftoken'].value


def json_post_csrf(client: Client, path: str, payload: dict[str, object], token: str) -> HttpResponse:
    return client.post(
        f'{HEADLESS_BROWSER}{path}',
        data=payload,
        content_type='application/json',
        HTTP_X_CSRFTOKEN=token,
    )


def create_verified_user(username: str, email: str, password: str = PASSWORD) -> User:
    user = User.objects.create_user(username, email, password)
    sync_verified_primary_email(user)
    return user


def key_from_mail(path: str) -> str:
    body = mail.outbox[-1].body
    match = re.search(re.escape(path) + r'([^\s/?#]+)', body)
    assert match is not None, body
    return unquote(match.group(1)).rstrip('.,;:!?')


def google_userinfo(
    *,
    email: str = 'guser@example.com',
    sub: str = 'google-uid-1',
    given_name: str = 'G',
    family_name: str = 'User',
    name: str = 'G User',
) -> dict[str, str | bool]:
    return {
        'id': sub,
        'sub': sub,
        'email': email,
        'verified_email': True,
        'email_verified': True,
        'given_name': given_name,
        'family_name': family_name,
        'name': name,
    }


def start_google_redirect(client: Client) -> str:
    response = client.post(
        f'{HEADLESS_BROWSER}/auth/provider/redirect',
        data={'provider': 'google', 'callback_url': GOOGLE_CALLBACK, 'process': 'login'},
    )
    assert response.status_code == 302, response.content
    state = parse_qs(urlparse(response['Location']).query).get('state', [''])[0]
    assert state
    return state
