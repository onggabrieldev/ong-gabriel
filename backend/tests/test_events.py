from collections.abc import Iterator
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pytest
from django.contrib.auth.models import Group
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from django.test.client import BOUNDARY, MULTIPART_CONTENT, encode_multipart
from django.utils import timezone
from PIL import Image

from allauth_http import PASSWORD, create_verified_user, csrf_token, json_post, json_post_csrf
from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.roles import EDITOR_GROUP, MODERATOR_GROUP
from ong_gabriel_api.events.models import Event as EventRecord

EventRecord.__test__ = False

pytestmark = pytest.mark.django_db

PUBLIC_URL = '/api/v1/events/'
ADMIN_URL = '/api/v1/admin/events/'


@pytest.fixture
def media_root(tmp_path: Path) -> Iterator[Path]:
    with override_settings(MEDIA_ROOT=tmp_path):
        yield tmp_path


def _image_file(fmt: str = 'JPEG', *, name: str | None = None) -> SimpleUploadedFile:
    types = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp'}
    buffer = BytesIO()
    Image.new('RGB', (160, 120), (200, 120, 40)).save(buffer, format=fmt)
    return SimpleUploadedFile(name or f'sample.{fmt.lower()}', buffer.getvalue(), content_type=types[fmt])


def _login_editor(client: Client) -> None:
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    json_post(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD})


def _create(starts_in: timedelta = timedelta(days=7), **overrides: object) -> EventRecord:
    starts_at = timezone.now() + starts_in
    values: dict[str, object] = {
        'title': 'Roda de conversa',
        'summary': 'Conversa aberta sobre saúde mental.',
        'event_type': 'Roda de conversa',
        'location': 'Centro comunitário',
        'starts_at': starts_at,
        'ends_at': starts_at + timedelta(hours=2),
        'is_published': True,
    }
    values.update(overrides)
    return EventRecord.objects.create(**values)


def _form(**overrides: object) -> dict[str, object]:
    values: dict[str, object] = {
        'title': 'Palestra',
        'summary': 'Palestra em escola.',
        'event_type': 'Palestra',
        'location': 'Escola Estadual',
        'starts_at': '2027-01-15T14:00',
        'ends_at': '2027-01-15T16:00',
    }
    values.update(overrides)
    return values


def test_editor_group_has_event_permissions() -> None:
    group = Group.objects.get(name=EDITOR_GROUP)
    codes = set(group.permissions.filter(content_type__app_label='events').values_list('codename', flat=True))
    assert codes == {'add_event', 'change_event', 'delete_event', 'view_event'}


def test_public_list_is_empty_without_events(client: Client) -> None:
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    assert response.json() == []


def test_public_list_shows_published_events_until_they_end(client: Client) -> None:
    later = _create(timedelta(days=30), title='Depois')
    sooner = _create(timedelta(days=2), title='Antes')
    _create(timedelta(days=5), title='Oculto', is_published=False)
    _create(timedelta(days=-2), title='Encerrado')
    ongoing = _create(timedelta(hours=-1), title='Acontecendo')
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    body = response.json()
    assert [item['id'] for item in body] == [str(ongoing.id), str(sooner.id), str(later.id)]
    assert 'is_published' not in body[0]
    assert body[0]['image'] is None


def test_anonymous_and_plain_user_forbidden_on_admin_routes(client: Client) -> None:
    item = _create()
    detail = f'{ADMIN_URL}{item.id}/'

    def attempts() -> list[int]:
        return [
            client.get(ADMIN_URL).status_code,
            client.get(detail).status_code,
            client.post(ADMIN_URL, data=_form()).status_code,
            client.patch(detail, data={'title': 'x'}, content_type='application/json').status_code,
            client.delete(detail).status_code,
        ]

    assert set(attempts()) == {403}
    create_verified_user('plain', 'plain@example.com')
    json_post(client, '/auth/login', {'username': 'plain', 'password': PASSWORD})
    assert set(attempts()) == {403}


def test_editor_can_create_update_delete(client: Client, media_root: Path) -> None:
    _login_editor(client)
    created = client.post(ADMIN_URL, data=_form(description='Primeiro.\n\nSegundo.', accent='teal'))
    assert created.status_code == 201, created.content
    body = created.json()
    assert body['title'] == 'Palestra'
    assert body['description'] == 'Primeiro.\n\nSegundo.'
    assert body['accent'] == 'teal'
    assert body['image'] is None
    assert body['is_published'] is True
    # Naive input is read as America/Sao_Paulo.
    assert datetime.fromisoformat(body['starts_at']) == datetime.fromisoformat('2027-01-15T14:00:00-03:00')
    pk = body['id']
    updated = client.patch(
        f'{ADMIN_URL}{pk}/',
        data={'location': 'Praça central', 'is_published': False},
        content_type='application/json',
    )
    assert updated.status_code == 200, updated.content
    assert updated.json()['location'] == 'Praça central'
    assert updated.json()['is_published'] is False
    deleted = client.delete(f'{ADMIN_URL}{pk}/')
    assert deleted.status_code == 204
    assert not EventRecord.objects.filter(id=pk).exists()


def test_admin_list_includes_hidden_and_past_events(client: Client) -> None:
    _login_editor(client)
    hidden = _create(is_published=False)
    past = _create(timedelta(days=-10))
    response = client.get(ADMIN_URL)
    assert response.status_code == 200
    assert {item['id'] for item in response.json()} == {str(hidden.id), str(past.id)}


def test_text_validation(client: Client) -> None:
    _login_editor(client)
    response = client.post(
        ADMIN_URL,
        data=_form(title='   ', summary='x' * 281, event_type='', location='y' * 161, accent='red'),
    )
    assert response.status_code == 400
    assert set(response.json()) >= {'title', 'summary', 'event_type', 'location', 'accent'}


def test_end_must_be_after_start(client: Client) -> None:
    _login_editor(client)
    same = client.post(ADMIN_URL, data=_form(ends_at='2027-01-15T14:00'))
    assert same.status_code == 400
    assert 'ends_at' in same.json()
    item = _create()
    # A partial update is checked against the stored date.
    earlier = (item.starts_at - timedelta(hours=1)).isoformat()
    partial = client.patch(f'{ADMIN_URL}{item.id}/', data={'ends_at': earlier}, content_type='application/json')
    assert partial.status_code == 400
    assert 'ends_at' in partial.json()


def test_image_is_optional_and_can_be_replaced_or_removed(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data=_form(image=_image_file(), image_alt='Plateia'))
    assert created.status_code == 201, created.content
    first_url = created.json()['image']
    assert first_url.startswith('/media/events/')
    first_path = media_root / first_url.removeprefix('/media/')
    with Image.open(first_path) as image:
        assert image.format == 'WEBP'
        assert image.size == (800, 800)
    detail = f'{ADMIN_URL}{created.json()["id"]}/'
    with TestCase.captureOnCommitCallbacks(execute=True):
        replaced = client.patch(
            detail,
            data=encode_multipart(BOUNDARY, {'image': _image_file('PNG', name='two.png')}),
            content_type=MULTIPART_CONTENT,
        )
    assert replaced.status_code == 200, replaced.content
    assert not first_path.exists()
    second_path = media_root / replaced.json()['image'].removeprefix('/media/')
    assert second_path.is_file()
    with TestCase.captureOnCommitCallbacks(execute=True):
        removed = client.patch(
            detail,
            data=encode_multipart(BOUNDARY, {'image': ''}),
            content_type=MULTIPART_CONTENT,
        )
    assert removed.status_code == 200, removed.content
    assert removed.json()['image'] is None
    assert not second_path.exists()


def test_delete_removes_image_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    item = _create(image=ContentFile(b'fake-webp', name=f'{uuid4().hex}.webp'))
    path = media_root / item.image.name
    assert path.is_file()
    with TestCase.captureOnCommitCallbacks(execute=True):
        deleted = client.delete(f'{ADMIN_URL}{item.id}/')
    assert deleted.status_code == 204
    assert not path.exists()


def test_invalid_image_rejected(client: Client, media_root: Path) -> None:
    _login_editor(client)
    bogus = SimpleUploadedFile('fake.jpg', b'not an image', content_type='image/jpeg')
    response = client.post(ADMIN_URL, data=_form(image=bogus))
    assert response.status_code == 400
    assert 'image' in response.json()
    assert list(media_root.rglob('*')) == []


def test_moderator_and_inactive_editor_forbidden(client: Client) -> None:
    item = _create()
    detail = f'{ADMIN_URL}{item.id}/'
    moderator = create_verified_user('mod1', 'mod@example.com')
    moderator.groups.add(Group.objects.get(name=MODERATOR_GROUP))
    json_post(client, '/auth/login', {'username': 'mod1', 'password': PASSWORD})
    assert client.get(ADMIN_URL).status_code == 403
    assert client.patch(detail, data={'title': 'x'}, content_type='application/json').status_code == 403
    client.logout()
    _login_editor(client)
    assert client.get(ADMIN_URL).status_code == 200
    User.objects.filter(username='editor1').update(is_active=False)
    assert client.get(ADMIN_URL).status_code == 403
    assert client.delete(detail).status_code == 403
    assert EventRecord.objects.filter(id=item.id, title='Roda de conversa').exists()


def test_admin_writes_require_csrf_token() -> None:
    client = Client(enforce_csrf_checks=True)
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    token = csrf_token(client)
    login = json_post_csrf(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD}, token)
    assert login.status_code == 200
    without = client.post(ADMIN_URL, data=_form())
    assert without.status_code == 403
    assert not EventRecord.objects.exists()
    with_token = client.post(ADMIN_URL, data=_form(), HTTP_X_CSRFTOKEN=client.cookies['csrftoken'].value)
    assert with_token.status_code == 201, with_token.content
