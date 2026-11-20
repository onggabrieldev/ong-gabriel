from collections.abc import Iterator
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pytest
from django.contrib.auth.models import Group
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from django.test.client import BOUNDARY, MULTIPART_CONTENT, encode_multipart
from PIL import Image

from allauth_http import PASSWORD, create_verified_user, json_post
from ong_gabriel_api.accounts.roles import EDITOR_GROUP
from ong_gabriel_api.activities.models import Activity as ActivityRecord

ActivityRecord.__test__ = False

pytestmark = pytest.mark.django_db

PUBLIC_URL = '/api/v1/activities/'
ADMIN_URL = '/api/v1/admin/activities/'


@pytest.fixture
def media_root(tmp_path: Path) -> Iterator[Path]:
    with override_settings(MEDIA_ROOT=tmp_path):
        yield tmp_path


def _image_file(
    fmt: str = 'JPEG', size: tuple[int, int] = (160, 120), *, name: str | None = None
) -> SimpleUploadedFile:
    types = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp', 'GIF': 'image/gif'}
    buffer = BytesIO()
    Image.new('RGB', size, (200, 120, 40)).save(buffer, format=fmt)
    return SimpleUploadedFile(name or f'sample.{fmt.lower()}', buffer.getvalue(), content_type=types[fmt])


def _login_editor(client: Client) -> None:
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    json_post(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD})


def _create(**overrides: object) -> ActivityRecord:
    values: dict[str, object] = {
        'title': 'Rodas de conversa',
        'description': 'Conversas sobre saúde mental.',
        'image': ContentFile(b'fake-webp', name=f'{uuid4().hex}.webp'),
        'is_published': True,
    }
    values.update(overrides)
    return ActivityRecord.objects.create(**values)


def _assert_stored_webp(media_root: Path, image_url: str) -> Path:
    assert image_url.startswith('/media/activities/')
    assert image_url.endswith('.webp')
    path = media_root / image_url.removeprefix('/media/')
    assert path.is_file()
    with Image.open(path) as image:
        assert image.format == 'WEBP'
        assert image.size == (1080, 1080)
    return path


def test_editor_group_has_activity_permissions() -> None:
    group = Group.objects.get(name=EDITOR_GROUP)
    codes = set(group.permissions.filter(content_type__app_label='activities').values_list('codename', flat=True))
    assert codes == {'add_activity', 'change_activity', 'delete_activity', 'view_activity'}


def test_public_list_is_empty_without_activities(client: Client) -> None:
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    assert response.json() == []


def test_public_list_hides_unpublished_and_keeps_order(client: Client, media_root: Path) -> None:
    first = _create(title='Um')
    hidden = _create(title='Dois', is_published=False)
    third = _create(title='Três', image_alt='Grupo reunido')
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    body = response.json()
    assert [item['id'] for item in body] == [str(first.id), str(third.id)]
    assert str(hidden.id) not in {item['id'] for item in body}
    assert body[1]['image_alt'] == 'Grupo reunido'
    assert all(item['image'].startswith('/media/activities/') for item in body)
    assert 'is_published' not in body[0]
    assert 'position' not in body[0]


def test_anonymous_and_plain_user_forbidden_on_admin_routes(client: Client, media_root: Path) -> None:
    item = _create()
    detail = f'{ADMIN_URL}{item.id}/'
    reorder = f'{ADMIN_URL}reorder/'

    def attempts() -> list[int]:
        return [
            client.get(ADMIN_URL).status_code,
            client.get(detail).status_code,
            client.post(ADMIN_URL, data={'title': 't', 'description': 'd'}).status_code,
            client.patch(detail, data={'title': 'x'}, content_type='application/json').status_code,
            client.delete(detail).status_code,
            client.post(reorder, data={'ids': [str(item.id)]}, content_type='application/json').status_code,
        ]

    assert set(attempts()) == {403}
    create_verified_user('plain', 'plain@example.com')
    json_post(client, '/auth/login', {'username': 'plain', 'password': PASSWORD})
    assert set(attempts()) == {403}


def test_editor_can_create_update_delete(client: Client, media_root: Path) -> None:
    _login_editor(client)
    created = client.post(
        ADMIN_URL,
        data={'title': 'Palestras', 'description': 'Em escolas.', 'image_alt': 'Palco', 'image': _image_file()},
    )
    assert created.status_code == 201, created.content
    body = created.json()
    assert body['title'] == 'Palestras'
    assert body['description'] == 'Em escolas.'
    assert body['image_alt'] == 'Palco'
    assert body['is_published'] is True
    assert body['position'] == 0
    _assert_stored_webp(media_root, body['image'])
    pk = body['id']
    updated = client.patch(
        f'{ADMIN_URL}{pk}/',
        data={'title': 'Atualizado', 'is_published': False},
        content_type='application/json',
    )
    assert updated.status_code == 200
    assert updated.json()['title'] == 'Atualizado'
    assert updated.json()['is_published'] is False
    assert updated.json()['image'] == body['image']
    deleted = client.delete(f'{ADMIN_URL}{pk}/')
    assert deleted.status_code == 204
    assert not ActivityRecord.objects.filter(id=pk).exists()


def test_create_requires_an_image(client: Client, media_root: Path) -> None:
    _login_editor(client)
    missing = client.post(ADMIN_URL, data={'title': 't', 'description': 'd'})
    empty = client.post(ADMIN_URL, data={'title': 't', 'description': 'd', 'image': ''})
    assert missing.status_code == 400
    assert 'image' in missing.json()
    assert empty.status_code == 400
    assert 'image' in empty.json()


def test_empty_image_on_update_keeps_the_current_one(client: Client, media_root: Path) -> None:
    _login_editor(client)
    created = client.post(ADMIN_URL, data={'title': 't', 'description': 'd', 'image': _image_file()}).json()
    updated = client.patch(
        f'{ADMIN_URL}{created["id"]}/',
        data=encode_multipart(BOUNDARY, {'title': 'Novo', 'image': ''}),
        content_type=MULTIPART_CONTENT,
    )
    assert updated.status_code == 200, updated.content
    assert updated.json()['image'] == created['image']
    _assert_stored_webp(media_root, created['image'])


def test_text_validation(client: Client, media_root: Path) -> None:
    _login_editor(client)
    cases = {
        'title': {'title': '   ', 'description': 'd'},
        'description': {'title': 't', 'description': ''},
    }
    long_cases = {
        'title': {'title': 't' * 61, 'description': 'd'},
        'description': {'title': 't', 'description': 'd' * 241},
        'image_alt': {'title': 't', 'description': 'd', 'image_alt': 'a' * 161},
    }
    for field, data in [*cases.items(), *long_cases.items()]:
        response = client.post(ADMIN_URL, data={**data, 'image': _image_file()})
        assert response.status_code == 400, (field, response.content)
        assert field in response.json()


def test_invalid_images_rejected(client: Client, media_root: Path) -> None:
    _login_editor(client)
    svg = SimpleUploadedFile('pic.svg', b'<svg xmlns="http://www.w3.org/2000/svg"></svg>', content_type='image/svg+xml')
    renamed = SimpleUploadedFile('pic.jpg', b'not an image', content_type='image/jpeg')
    for upload in (svg, _image_file('GIF'), renamed):
        response = client.post(ADMIN_URL, data={'title': 't', 'description': 'd', 'image': upload})
        assert response.status_code == 400, response.content
        assert 'image' in response.json()
    assert list(media_root.rglob('*')) == []


def test_replace_image_deletes_old_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data={'title': 't', 'description': 'd', 'image': _image_file()})
    first_path = _assert_stored_webp(media_root, created.json()['image'])
    with TestCase.captureOnCommitCallbacks(execute=True):
        replaced = client.patch(
            f'{ADMIN_URL}{created.json()["id"]}/',
            data=encode_multipart(BOUNDARY, {'image': _image_file('PNG', name='two.png')}),
            content_type=MULTIPART_CONTENT,
        )
    assert replaced.status_code == 200, replaced.content
    _assert_stored_webp(media_root, replaced.json()['image'])
    assert not first_path.exists()


def test_delete_removes_image_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data={'title': 't', 'description': 'd', 'image': _image_file('WEBP')})
        path = _assert_stored_webp(media_root, created.json()['image'])
        deleted = client.delete(f'{ADMIN_URL}{created.json()["id"]}/')
    assert deleted.status_code == 204
    assert not path.exists()


def test_reorder_full_list(client: Client, media_root: Path) -> None:
    _login_editor(client)
    a = _create(title='A')
    b = _create(title='B')
    c = _create(title='C')
    response = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(c.id), str(a.id), str(b.id)]},
        content_type='application/json',
    )
    assert response.status_code == 200
    assert [item['title'] for item in response.json()] == ['C', 'A', 'B']
    assert [item['position'] for item in response.json()] == [0, 1, 2]


def test_reorder_rejects_missing_duplicate_and_unknown_ids(client: Client, media_root: Path) -> None:
    _login_editor(client)
    a = _create(title='A')
    b = _create(title='B')
    for ids in ([a.id], [a.id, a.id], [a.id, uuid4()], [a.id, b.id, uuid4()]):
        response = client.post(
            f'{ADMIN_URL}reorder/',
            data={'ids': [str(item) for item in ids]},
            content_type='application/json',
        )
        assert response.status_code == 400
