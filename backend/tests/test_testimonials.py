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
from PIL.ExifTags import GPS, IFD

from allauth_http import PASSWORD, create_verified_user, json_post
from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.roles import EDITOR_GROUP
from ong_gabriel_api.testimonials.models import Testimonial as TestimonialRecord

TestimonialRecord.__test__ = False

pytestmark = pytest.mark.django_db

PUBLIC_URL = '/api/v1/testimonials/'
ADMIN_URL = '/api/v1/admin/testimonials/'


@pytest.fixture
def media_root(tmp_path: Path) -> Iterator[Path]:
    with override_settings(MEDIA_ROOT=tmp_path):
        yield tmp_path


def _image_bytes(fmt: str, size: tuple[int, int] = (120, 80), *, exif: Image.Exif | None = None) -> bytes:
    buffer = BytesIO()
    image = Image.new('RGB', size, (12, 80, 160))
    kwargs: dict[str, object] = {'format': fmt}
    if exif is not None:
        kwargs['exif'] = exif
    image.save(buffer, **kwargs)
    return buffer.getvalue()


def _image_file(
    fmt: str,
    size: tuple[int, int] = (120, 80),
    *,
    name: str | None = None,
    exif: Image.Exif | None = None,
    content_type: str | None = None,
) -> SimpleUploadedFile:
    types = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp', 'GIF': 'image/gif'}
    filename = name or f'sample.{fmt.lower()}'
    return SimpleUploadedFile(
        filename,
        _image_bytes(fmt, size, exif=exif),
        content_type=content_type or types.get(fmt, 'application/octet-stream'),
    )


def _jpeg_with_gps() -> SimpleUploadedFile:
    exif = Image.Exif()
    gps = exif.get_ifd(IFD.GPSInfo)
    gps[GPS.GPSLatitudeRef] = 'N'
    gps[GPS.GPSLatitude] = (37.0, 46.0, 0.0)
    gps[GPS.GPSLongitudeRef] = 'W'
    gps[GPS.GPSLongitude] = (122.0, 25.0, 0.0)
    gps[GPS.GPSAltitude] = 12.0
    return _image_file('JPEG', name='gps.jpg', exif=exif)


def _login_editor(client: Client) -> None:
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    json_post(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD})


def _login_superuser(client: Client) -> None:
    user = create_verified_user('root', 'root@example.com')
    user.is_superuser = True
    user.save()
    json_post(client, '/auth/login', {'username': 'root', 'password': PASSWORD})


def _create(**overrides: object) -> TestimonialRecord:
    values: dict[str, object] = {
        'quote': 'A ONG mudou a minha vida.',
        'name': 'Maria',
        'role': 'Voluntária',
        'is_published': True,
    }
    values.update(overrides)
    return TestimonialRecord.objects.create(**values)


def test_editor_group_has_testimonial_permissions() -> None:
    group = Group.objects.get(name=EDITOR_GROUP)
    codes = set(group.permissions.filter(content_type__app_label='testimonials').values_list('codename', flat=True))
    assert codes == {'add_testimonial', 'change_testimonial', 'delete_testimonial', 'view_testimonial'}


def test_public_list_hides_unpublished_and_keeps_order(client: Client) -> None:
    first = _create(name='Ana', quote='um')
    hidden = _create(name='Bia', quote='dois', is_published=False)
    third = _create(name='Caio', quote='três')
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    body = response.json()
    assert [item['name'] for item in body] == ['Ana', 'Caio']
    assert [item['id'] for item in body] == [str(first.id), str(third.id)]
    assert str(hidden.id) not in {item['id'] for item in body}
    assert all(item['portrait'] is None or item['portrait'].startswith('/media/') for item in body)
    assert 'is_published' not in body[0]
    assert 'position' not in body[0]


def test_anonymous_and_plain_user_forbidden_on_admin_routes(client: Client) -> None:
    item = _create()
    detail = f'{ADMIN_URL}{item.id}/'
    reorder = f'{ADMIN_URL}reorder/'
    anonymous_gets = [
        client.get(ADMIN_URL),
        client.get(detail),
        client.post(ADMIN_URL, data={'quote': 'q', 'name': 'n'}),
        client.patch(detail, data={'name': 'x'}, content_type='application/json'),
        client.delete(detail),
        client.post(reorder, data={'ids': [str(item.id)]}, content_type='application/json'),
    ]
    assert all(response.status_code == 403 for response in anonymous_gets)
    create_verified_user('plain', 'plain@example.com')
    json_post(client, '/auth/login', {'username': 'plain', 'password': PASSWORD})
    signed_in = [
        client.get(ADMIN_URL),
        client.get(detail),
        client.post(ADMIN_URL, data={'quote': 'q', 'name': 'n'}),
        client.patch(detail, data={'name': 'x'}, content_type='application/json'),
        client.delete(detail),
        client.post(reorder, data={'ids': [str(item.id)]}, content_type='application/json'),
    ]
    assert all(response.status_code == 403 for response in signed_in)


def test_editor_can_create_update_delete(client: Client) -> None:
    _login_editor(client)
    created = client.post(ADMIN_URL, data={'quote': 'Primeiro', 'name': 'Lia', 'role': 'Mãe'})
    assert created.status_code == 201
    body = created.json()
    assert body['quote'] == 'Primeiro'
    assert body['name'] == 'Lia'
    assert body['role'] == 'Mãe'
    assert body['is_published'] is True
    assert body['position'] == 0
    assert body['portrait'] is None
    pk = body['id']
    updated = client.patch(
        f'{ADMIN_URL}{pk}/',
        data={'quote': 'Atualizado', 'is_published': False},
        content_type='application/json',
    )
    assert updated.status_code == 200
    assert updated.json()['quote'] == 'Atualizado'
    assert updated.json()['is_published'] is False
    deleted = client.delete(f'{ADMIN_URL}{pk}/')
    assert deleted.status_code == 204
    assert not TestimonialRecord.objects.filter(id=pk).exists()


def test_superuser_can_create(client: Client) -> None:
    _login_superuser(client)
    created = client.post(ADMIN_URL, data={'quote': 'Root', 'name': 'Root'})
    assert created.status_code == 201


def test_new_items_go_to_the_end(client: Client) -> None:
    _login_editor(client)
    first = client.post(ADMIN_URL, data={'quote': 'um', 'name': 'A'}).json()
    second = client.post(ADMIN_URL, data={'quote': 'dois', 'name': 'B'}).json()
    third = client.post(ADMIN_URL, data={'quote': 'três', 'name': 'C'}).json()
    assert first['position'] == 0
    assert second['position'] == 1
    assert third['position'] == 2


def test_quote_name_role_validation(client: Client) -> None:
    _login_editor(client)
    empty_quote = client.post(ADMIN_URL, data={'quote': '   ', 'name': 'Ana'})
    long_quote = client.post(ADMIN_URL, data={'quote': 'x' * 501, 'name': 'Ana'})
    empty_name = client.post(ADMIN_URL, data={'quote': 'ok', 'name': ''})
    long_name = client.post(ADMIN_URL, data={'quote': 'ok', 'name': 'n' * 81})
    long_role = client.post(ADMIN_URL, data={'quote': 'ok', 'name': 'Ana', 'role': 'r' * 81})
    assert empty_quote.status_code == 400
    assert 'quote' in empty_quote.json()
    assert long_quote.status_code == 400
    assert 'quote' in long_quote.json()
    assert empty_name.status_code == 400
    assert 'name' in empty_name.json()
    assert long_name.status_code == 400
    assert 'name' in long_name.json()
    assert long_role.status_code == 400
    assert 'role' in long_role.json()


def _assert_stored_webp(media_root: Path, portrait_url: str) -> Path:
    assert portrait_url.startswith('/media/testimonials/')
    assert portrait_url.endswith('.webp')
    relative = portrait_url.removeprefix('/media/')
    path = media_root / relative
    assert path.is_file()
    with Image.open(path) as image:
        assert image.format == 'WEBP'
        assert image.size == (256, 256)
        exif = image.getexif()
        assert IFD.GPSInfo not in exif
        assert not dict(exif.get_ifd(IFD.GPSInfo))
        assert not image.info.get('exif')
    return path


def test_jpeg_png_webp_stored_as_square_webp(client: Client, media_root: Path) -> None:
    _login_editor(client)
    for fmt in ('JPEG', 'PNG', 'WEBP'):
        response = client.post(
            ADMIN_URL,
            data={'quote': f'{fmt} ok', 'name': fmt, 'portrait': _image_file(fmt)},
        )
        assert response.status_code == 201, response.content
        _assert_stored_webp(media_root, response.json()['portrait'])


def test_exif_gps_is_stripped(client: Client, media_root: Path) -> None:
    original = _jpeg_with_gps()
    with Image.open(BytesIO(original.read())) as source:
        gps = source.getexif().get_ifd(IFD.GPSInfo)
        assert gps
    original.seek(0)
    _login_editor(client)
    response = client.post(ADMIN_URL, data={'quote': 'gps', 'name': 'GPS', 'portrait': original})
    assert response.status_code == 201, response.content
    _assert_stored_webp(media_root, response.json()['portrait'])


def test_invalid_portraits_rejected(client: Client, media_root: Path) -> None:
    _login_editor(client)
    svg = SimpleUploadedFile('pic.svg', b'<svg xmlns="http://www.w3.org/2000/svg"></svg>', content_type='image/svg+xml')
    gif = _image_file('GIF')
    renamed = SimpleUploadedFile('pic.jpg', b'not an image', content_type='image/jpeg')
    oversized = SimpleUploadedFile('big.jpg', b'x' * (5 * 1024 * 1024 + 1), content_type='image/jpeg')
    huge = _image_file('JPEG', size=(6001, 10), name='wide.jpg')
    for upload in (svg, gif, renamed, oversized, huge):
        response = client.post(ADMIN_URL, data={'quote': 'q', 'name': 'n', 'portrait': upload})
        assert response.status_code == 400, response.content
        assert 'portrait' in response.json()
    assert list(media_root.rglob('*')) == []


def test_replace_and_remove_portrait_deletes_old_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data={'quote': 'q', 'name': 'n', 'portrait': _image_file('JPEG')})
    assert created.status_code == 201
    first_url = created.json()['portrait']
    first_path = _assert_stored_webp(media_root, first_url)
    pk = created.json()['id']
    with TestCase.captureOnCommitCallbacks(execute=True):
        replaced = client.patch(
            f'{ADMIN_URL}{pk}/',
            data=encode_multipart(BOUNDARY, {'portrait': _image_file('PNG', name='two.png')}),
            content_type=MULTIPART_CONTENT,
        )
    assert replaced.status_code == 200, replaced.content
    second_url = replaced.json()['portrait']
    assert second_url != first_url
    _assert_stored_webp(media_root, second_url)
    assert not first_path.exists()
    with TestCase.captureOnCommitCallbacks(execute=True):
        removed = client.patch(
            f'{ADMIN_URL}{pk}/',
            data={'portrait': None},
            content_type='application/json',
        )
    assert removed.status_code == 200, removed.content
    assert removed.json()['portrait'] is None
    assert not (media_root / second_url.removeprefix('/media/')).exists()


def test_delete_removes_portrait_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data={'quote': 'q', 'name': 'n', 'portrait': _image_file('WEBP')})
        path = _assert_stored_webp(media_root, created.json()['portrait'])
        deleted = client.delete(f'{ADMIN_URL}{created.json()["id"]}/')
    assert deleted.status_code == 204
    assert not path.exists()


def test_queryset_delete_removes_portrait_file(media_root: Path) -> None:
    stored = ContentFile(b'fake-webp', name='abc.webp')
    with TestCase.captureOnCommitCallbacks(execute=True):
        record = TestimonialRecord.objects.create(quote='q', name='n', portrait=stored)
        path = Path(record.portrait.path)
        assert path.exists()
        TestimonialRecord.objects.filter(pk=record.pk).delete()
    assert not path.exists()


def test_reorder_full_list(client: Client) -> None:
    _login_editor(client)
    a = _create(name='A')
    b = _create(name='B')
    c = _create(name='C')
    response = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(c.id), str(a.id), str(b.id)]},
        content_type='application/json',
    )
    assert response.status_code == 200
    names = [item['name'] for item in response.json()]
    assert names == ['C', 'A', 'B']
    assert [item['position'] for item in response.json()] == [0, 1, 2]


def test_reorder_rejects_missing_duplicate_and_unknown_ids(client: Client) -> None:
    _login_editor(client)
    a = _create(name='A')
    b = _create(name='B')
    missing = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(a.id)]},
        content_type='application/json',
    )
    duplicate = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(a.id), str(a.id)]},
        content_type='application/json',
    )
    unknown = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(a.id), str(uuid4())]},
        content_type='application/json',
    )
    extra = client.post(
        f'{ADMIN_URL}reorder/',
        data={'ids': [str(a.id), str(b.id), str(uuid4())]},
        content_type='application/json',
    )
    assert missing.status_code == 400
    assert duplicate.status_code == 400
    assert unknown.status_code == 400
    assert extra.status_code == 400


@override_settings(
    SECURE_SSL_REDIRECT=True,
    SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO', 'https'),
    ALLOWED_HOSTS=['api', '127.0.0.1', 'testserver'],
    SECURE_REDIRECT_EXEMPT=[r'^health$'],
)
def test_internal_list_with_forwarded_proto_and_api_host(client: Client) -> None:
    client.handler.load_middleware()
    response = client.get(PUBLIC_URL, HTTP_HOST='api', HTTP_X_FORWARDED_PROTO='https')
    assert response.status_code == 200
    assert response.json() == []


def test_deactivated_editor_loses_admin_access_mid_session(client: Client) -> None:
    _login_editor(client)
    assert client.get(ADMIN_URL).status_code == 200
    user = User.objects.get(username='editor1')
    user.is_active = False
    user.save()
    assert client.get(ADMIN_URL).status_code == 403
    assert client.get('/api/v1/me/').status_code == 403
