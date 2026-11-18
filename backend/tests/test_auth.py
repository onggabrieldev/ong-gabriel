import pytest
from allauth.account.models import EmailAddress
from django.core import mail
from django.test import Client, override_settings

from allauth_http import (
    PASSWORD,
    create_verified_user,
    csrf_token,
    json_delete,
    json_get,
    json_post,
    json_post_csrf,
    key_from_mail,
)
from ong_gabriel_api.accounts.models import User

pytestmark = pytest.mark.django_db


def test_signup_closed_by_default(client: Client) -> None:
    response = json_post(
        client,
        '/auth/signup',
        {'username': 'newbie', 'email': 'newbie@example.com', 'password': PASSWORD},
    )
    assert response.status_code == 403
    assert not User.objects.filter(username='newbie').exists()


@override_settings(SIGNUP_ENABLED=False, PASSWORD_SIGNUP_ENABLED=True)
def test_password_signup_refused_when_signup_disabled(client: Client) -> None:
    response = json_post(
        client,
        '/auth/signup',
        {'username': 'newbie', 'email': 'newbie@example.com', 'password': PASSWORD},
    )
    assert response.status_code == 403
    assert not User.objects.filter(username='newbie').exists()


@override_settings(SIGNUP_ENABLED=False, PASSWORD_SIGNUP_ENABLED=True)
def test_existing_account_login_with_signup_closed(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    response = json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    assert response.status_code == 200


@override_settings(SIGNUP_ENABLED=True, PASSWORD_SIGNUP_ENABLED=True)
def test_signup_open_sends_verification_and_login_works(client: Client) -> None:
    signup = json_post(
        client,
        '/auth/signup',
        {'username': 'newbie', 'email': 'newbie@example.com', 'password': PASSWORD},
    )
    assert signup.status_code == 401
    assert signup.json()['meta']['is_authenticated'] is False
    assert mail.outbox
    key = key_from_mail('/conta/confirmar-email/')
    verify = json_post(client, '/auth/email/verify', {'key': key})
    assert verify.status_code == 401
    assert verify.json()['meta']['is_authenticated'] is False
    by_username = json_post(client, '/auth/login', {'username': 'newbie', 'password': PASSWORD})
    assert by_username.status_code == 200
    json_delete(client, '/auth/session')
    by_email = json_post(client, '/auth/login', {'email': 'newbie@example.com', 'password': PASSWORD})
    assert by_email.status_code == 200


@override_settings(SIGNUP_ENABLED=True, PASSWORD_SIGNUP_ENABLED=True)
def test_signup_enumeration_matches_existing_email(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    taken = json_post(
        client,
        '/auth/signup',
        {'username': 'other', 'email': 'alice@example.com', 'password': PASSWORD},
    )
    fresh = json_post(
        client,
        '/auth/signup',
        {'username': 'brandnew', 'email': 'brandnew@example.com', 'password': PASSWORD},
    )
    assert taken.status_code == fresh.status_code
    assert taken.json()['status'] == fresh.json()['status']


def test_create_superuser_login_by_username_and_email(client: Client) -> None:
    User.objects.create_superuser('admin', 'admin@example.com', PASSWORD)
    by_username = json_post(client, '/auth/login', {'username': 'admin', 'password': PASSWORD})
    assert by_username.status_code == 200
    json_delete(client, '/auth/session')
    by_email = json_post(client, '/auth/login', {'email': 'admin@example.com', 'password': PASSWORD})
    assert by_email.status_code == 200


def test_login_errors_do_not_enumerate(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    wrong_password = json_post(client, '/auth/login', {'username': 'alice', 'password': 'wrong-pass-ok-9x'})
    unknown_username = json_post(client, '/auth/login', {'username': 'missing', 'password': PASSWORD})
    unknown_email = json_post(client, '/auth/login', {'email': 'missing@example.com', 'password': PASSWORD})
    assert wrong_password.status_code == unknown_username.status_code == unknown_email.status_code
    assert wrong_password.json() == unknown_username.json() == unknown_email.json()


def test_login_without_csrf_is_forbidden() -> None:
    client = Client(enforce_csrf_checks=True)
    create_verified_user('alice', 'alice@example.com')
    response = json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    assert response.status_code == 403


def test_login_with_csrf_token_succeeds() -> None:
    client = Client(enforce_csrf_checks=True)
    create_verified_user('alice', 'alice@example.com')
    token = csrf_token(client)
    response = json_post_csrf(client, '/auth/login', {'username': 'alice', 'password': PASSWORD}, token)
    assert response.status_code == 200


def test_session_get_and_logout(client: Client) -> None:
    anonymous = json_get(client, '/auth/session')
    assert anonymous.status_code == 401
    create_verified_user('alice', 'alice@example.com')
    login = json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    assert login.status_code == 200
    session = json_get(client, '/auth/session')
    assert session.status_code == 200
    assert session.json()['data']['user']['username'] == 'alice'
    logout = json_delete(client, '/auth/session')
    assert logout.status_code == 401
    assert json_get(client, '/auth/session').status_code == 401


def test_config_lists_login_methods_and_closed_signup(client: Client) -> None:
    response = json_get(client, '/config')
    assert response.status_code == 200
    account = response.json()['data']['account']
    assert set(account['login_methods']) == {'username', 'email'}
    assert account['is_open_for_signup'] is False
    assert response.json()['data']['socialaccount']['providers'] == []


@override_settings(SIGNUP_ENABLED=True, PASSWORD_SIGNUP_ENABLED=True)
def test_config_reports_open_signup(client: Client) -> None:
    response = json_get(client, '/config')
    assert response.json()['data']['account']['is_open_for_signup'] is True


def test_password_reset_sends_mail_and_changes_password(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    request = json_post(client, '/auth/password/request', {'email': 'alice@example.com'})
    assert request.status_code == 200
    assert mail.outbox
    key = key_from_mail('/conta/redefinir-senha/')
    reset = json_post(client, '/auth/password/reset', {'key': key, 'password': 'test-pass-ok-8y'})
    assert reset.status_code == 401
    assert json_post(client, '/auth/login', {'username': 'alice', 'password': 'test-pass-ok-8y'}).status_code == 200
    json_delete(client, '/auth/session')
    assert json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD}).status_code == 400


def test_password_reset_unknown_email_matches_known(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    known = json_post(client, '/auth/password/request', {'email': 'alice@example.com'})
    unknown = json_post(client, '/auth/password/request', {'email': 'missing@example.com'})
    assert known.status_code == unknown.status_code
    assert known.json() == unknown.json()


def test_password_change_for_logged_in_user(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    change = json_post(
        client,
        '/account/password/change',
        {'current_password': PASSWORD, 'new_password': 'test-pass-ok-8y'},
    )
    assert change.status_code == 200
    json_delete(client, '/auth/session')
    assert json_post(client, '/auth/login', {'username': 'alice', 'password': 'test-pass-ok-8y'}).status_code == 200


def test_signup_username_rules(client: Client) -> None:
    with override_settings(SIGNUP_ENABLED=True, PASSWORD_SIGNUP_ENABLED=True):
        too_short = json_post(
            client,
            '/auth/signup',
            {'username': 'ab', 'email': 'ab@example.com', 'password': PASSWORD},
        )
        at_sign = json_post(
            client,
            '/auth/signup',
            {'username': 'al@ice', 'email': 'at@example.com', 'password': PASSWORD},
        )
    assert too_short.status_code == 400
    assert at_sign.status_code == 400


def test_account_cannot_add_a_second_email(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    response = json_post(client, '/account/email', {'email': 'victim@example.com'})
    assert response.status_code == 400
    assert not EmailAddress.objects.filter(email__iexact='victim@example.com').exists()
