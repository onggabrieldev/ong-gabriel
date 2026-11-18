import re
from unittest.mock import patch

import pytest
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from django.http import HttpResponse
from django.test import Client, override_settings
from django.urls import reverse

from allauth_http import (
    GOOGLE_PROVIDERS,
    PASSWORD,
    create_verified_user,
    google_userinfo,
    json_get,
    start_google_redirect,
)
from ong_gabriel_api.accounts.models import User

pytestmark = pytest.mark.django_db


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS)
def test_google_redirect_goes_to_google(client: Client) -> None:
    response = client.post(
        '/api/v1/_allauth/browser/v1/auth/provider/redirect',
        data={
            'provider': 'google',
            'callback_url': 'http://localhost:3000/conta/entrar',
            'process': 'login',
        },
    )
    assert response.status_code == 302
    assert 'accounts.google.com' in response['Location']


def test_config_omits_google_without_credentials(client: Client) -> None:
    response = json_get(client, '/config')
    assert response.json()['data']['socialaccount']['providers'] == []


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS)
def test_config_lists_google_when_configured(client: Client) -> None:
    response = json_get(client, '/config')
    providers = response.json()['data']['socialaccount']['providers']
    assert [item['id'] for item in providers] == ['google']


def _complete_google_callback(client: Client, userinfo: dict[str, str | bool]) -> HttpResponse:
    state = start_google_redirect(client)
    with (
        patch(
            'allauth.socialaccount.providers.google.views.GoogleOAuth2Adapter.get_access_token_data',
            return_value={'access_token': 'ya29.test-token'},
        ),
        patch(
            'allauth.socialaccount.providers.google.views.GoogleOAuth2Adapter._fetch_user_info',
            return_value=userinfo,
        ),
    ):
        return client.get(
            reverse('google_callback'),
            {'code': 'auth-code', 'state': state},
        )


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS, SIGNUP_ENABLED=True, PASSWORD_SIGNUP_ENABLED=False)
def test_google_signup_creates_user_with_generated_username(client: Client) -> None:
    response = _complete_google_callback(
        client,
        google_userinfo(email='jose+tag@example.com', given_name='José', name='José Silva'),
    )
    assert response.status_code == 302
    user = User.objects.get(email='jose+tag@example.com')
    assert re.fullmatch(r'Jose\d{4}', user.username)
    assert 'jose+tag' not in user.username
    assert user.emailaddress_set.get().verified is True
    me = client.get('/api/v1/me/')
    assert me.status_code == 200
    assert me.json()['username'] == user.username


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS, SIGNUP_ENABLED=True)
def test_google_second_login_reuses_account(client: Client) -> None:
    _complete_google_callback(client, google_userinfo())
    client.logout()
    _complete_google_callback(client, google_userinfo())
    assert User.objects.filter(email='guser@example.com').count() == 1
    assert SocialAccount.objects.filter(provider='google').count() == 1


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS)
def test_google_connects_existing_verified_email(client: Client) -> None:
    existing = create_verified_user('team', 'guser@example.com')
    _complete_google_callback(client, google_userinfo(email='guser@example.com'))
    assert User.objects.filter(email__iexact='guser@example.com').count() == 1
    assert SocialAccount.objects.filter(user=existing, provider='google').exists()


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS, SIGNUP_ENABLED=False, PASSWORD_SIGNUP_ENABLED=True)
def test_google_signup_refused_when_signup_closed(client: Client) -> None:
    _complete_google_callback(client, google_userinfo(email='newgoogle@example.com', sub='google-new'))
    assert not User.objects.filter(email='newgoogle@example.com').exists()
    assert not SocialAccount.objects.filter(provider='google', uid='google-new').exists()


@override_settings(SOCIALACCOUNT_PROVIDERS=GOOGLE_PROVIDERS, SIGNUP_ENABLED=True)
def test_google_login_ignores_unverified_local_email(client: Client) -> None:
    attacker = User.objects.create_user('attacker', 'attacker@example.com', PASSWORD)
    EmailAddress.objects.create(user=attacker, email='victim@example.com', verified=False, primary=False)
    _complete_google_callback(client, google_userinfo(email='victim@example.com', sub='google-victim'))
    assert not SocialAccount.objects.filter(user=attacker).exists()
    me = client.get('/api/v1/me/')
    assert me.status_code == 403 or me.json()['username'] != 'attacker'
