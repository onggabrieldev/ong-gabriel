import pytest
from django.http import HttpResponse
from django.test import Client, override_settings

from allauth_http import HEADLESS_BROWSER, create_verified_user

pytestmark = pytest.mark.django_db

# allauth defaults: login 30/m/ip (HTTP 429), login_failed 10/m/ip,5/5m/key.
LOGIN_PER_IP = 30
LOGIN_FAILED_PER_KEY = 5
PROXY_REMOTE_ADDR = '10.0.0.1'


def _failed_login(
    client: Client,
    username: str,
    *,
    forwarded_for: str | None = None,
    remote_addr: str | None = None,
) -> HttpResponse:
    extras: dict[str, str] = {}
    if forwarded_for is not None:
        extras['HTTP_X_FORWARDED_FOR'] = forwarded_for
    if remote_addr is not None:
        extras['REMOTE_ADDR'] = remote_addr
    return client.post(
        f'{HEADLESS_BROWSER}/auth/login',
        data={'username': username, 'password': 'wrong-pass-ok-9x'},
        content_type='application/json',
        **extras,
    )


def test_failed_logins_from_one_ip_return_429(client: Client) -> None:
    last = None
    for index in range(LOGIN_PER_IP + 1):
        last = _failed_login(client, f'user{index:02d}')
    assert last is not None
    assert last.status_code == 429


@override_settings(ALLAUTH_TRUSTED_PROXY_COUNT=1)
def test_other_forwarded_ip_is_not_blocked(client: Client) -> None:
    last_a = None
    for index in range(LOGIN_PER_IP + 1):
        last_a = _failed_login(
            client,
            f'user{index:02d}',
            forwarded_for='203.0.113.10',
            remote_addr=PROXY_REMOTE_ADDR,
        )
    assert last_a is not None
    assert last_a.status_code == 429
    other = _failed_login(
        client,
        'bob',
        forwarded_for='203.0.113.20',
        remote_addr=PROXY_REMOTE_ADDR,
    )
    assert other.status_code == 400


@override_settings(ALLAUTH_TRUSTED_PROXY_COUNT=1)
def test_per_key_failed_logins_blocked_across_ips(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    for _ in range(LOGIN_FAILED_PER_KEY):
        response = _failed_login(
            client,
            'alice',
            forwarded_for='203.0.113.10',
            remote_addr=PROXY_REMOTE_ADDR,
        )
        assert response.status_code == 400
    blocked = _failed_login(
        client,
        'alice',
        forwarded_for='203.0.113.20',
        remote_addr=PROXY_REMOTE_ADDR,
    )
    assert blocked.status_code == 400
    assert blocked.json()['errors'][0]['code'] == 'too_many_login_attempts'
