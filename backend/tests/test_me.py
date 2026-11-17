import pytest
from django.contrib.auth.models import Group
from django.test import Client

from allauth_http import PASSWORD, create_verified_user, csrf_token, json_post, json_post_csrf
from ong_gabriel_api.accounts.roles import EDITOR_GROUP, MODERATOR_GROUP

pytestmark = pytest.mark.django_db


def test_me_anonymous_forbidden(client: Client) -> None:
    assert client.get('/api/v1/me/').status_code == 403
    assert client.patch('/api/v1/me/', data={'username': 'x'}, content_type='application/json').status_code == 403


def test_me_get_and_patch_username(client: Client) -> None:
    user = create_verified_user('alice', 'alice@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    me = client.get('/api/v1/me/')
    assert me.status_code == 200
    body = me.json()
    assert body['username'] == 'alice'
    assert body['email'] == 'alice@example.com'
    assert body['roles'] == [EDITOR_GROUP]
    assert body['is_superuser'] is False
    patched = client.patch('/api/v1/me/', data={'username': 'alice2'}, content_type='application/json')
    assert patched.status_code == 200
    assert patched.json()['username'] == 'alice2'
    user.refresh_from_db()
    assert user.username == 'alice2'


def test_me_patch_taken_username_other_casing(client: Client) -> None:
    create_verified_user('bob', 'bob@example.com')
    create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    taken = client.patch('/api/v1/me/', data={'username': 'BOB'}, content_type='application/json')
    assert taken.status_code == 400


def test_me_patch_rejects_at(client: Client) -> None:
    create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    response = client.patch('/api/v1/me/', data={'username': 'al@ice'}, content_type='application/json')
    assert response.status_code == 400


def test_me_patch_ignores_other_fields(client: Client) -> None:
    user = create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    response = client.patch(
        '/api/v1/me/',
        data={'username': 'alice', 'email': 'hacker@example.com', 'is_superuser': True, 'roles': [MODERATOR_GROUP]},
        content_type='application/json',
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.email == 'alice@example.com'
    assert user.is_superuser is False


def test_me_patch_requires_csrf() -> None:
    client = Client(enforce_csrf_checks=True)
    create_verified_user('alice', 'alice@example.com')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    response = client.patch('/api/v1/me/', data={'username': 'alice2'}, content_type='application/json')
    assert response.status_code == 403


def test_me_patch_with_csrf_token_succeeds() -> None:
    client = Client(enforce_csrf_checks=True)
    create_verified_user('alice', 'alice@example.com')
    token = csrf_token(client)
    login = json_post_csrf(client, '/auth/login', {'username': 'alice', 'password': PASSWORD}, token)
    assert login.status_code == 200
    token = client.cookies['csrftoken'].value
    patched = client.patch(
        '/api/v1/me/',
        data={'username': 'alice2'},
        content_type='application/json',
        HTTP_X_CSRFTOKEN=token,
    )
    assert patched.status_code == 200
    assert patched.json()['username'] == 'alice2'


def test_me_get_roles_only_known_groups(client: Client) -> None:
    user = create_verified_user('alice', 'alice@example.com')
    user.groups.add(Group.objects.get(name=MODERATOR_GROUP))
    user.groups.create(name='other')
    json_post(client, '/auth/login', {'username': 'alice', 'password': PASSWORD})
    assert client.get('/api/v1/me/').json()['roles'] == [MODERATOR_GROUP]
