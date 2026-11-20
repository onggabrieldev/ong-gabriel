from collections.abc import Iterator
from datetime import date
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

from allauth_http import PASSWORD, create_verified_user, csrf_token, json_post, json_post_csrf
from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.roles import EDITOR_GROUP, MODERATOR_GROUP
from ong_gabriel_api.gallery.models import MAX_PHOTOS_MESSAGE, MAX_PHOTOS_PER_ALBUM
from ong_gabriel_api.gallery.models import GalleryAlbum as GalleryAlbumRecord
from ong_gabriel_api.gallery.models import GalleryPhoto as GalleryPhotoRecord
from ong_gabriel_api.uploads.images import process_fitted_image

GalleryAlbumRecord.__test__ = False
GalleryPhotoRecord.__test__ = False

pytestmark = pytest.mark.django_db

PUBLIC_URL = '/api/v1/gallery/'
ADMIN_URL = '/api/v1/admin/gallery/'


@pytest.fixture
def media_root(tmp_path: Path) -> Iterator[Path]:
    with override_settings(MEDIA_ROOT=tmp_path):
        yield tmp_path


def _image_bytes(fmt: str, size: tuple[int, int] = (160, 120), *, exif: Image.Exif | None = None) -> bytes:
    buffer = BytesIO()
    image = Image.new('RGB', size, (200, 120, 40))
    kwargs: dict[str, object] = {'format': fmt}
    if exif is not None:
        kwargs['exif'] = exif
    image.save(buffer, **kwargs)
    return buffer.getvalue()


def _image_file(
    fmt: str = 'JPEG',
    size: tuple[int, int] = (160, 120),
    *,
    name: str | None = None,
    exif: Image.Exif | None = None,
) -> SimpleUploadedFile:
    types = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp', 'GIF': 'image/gif'}
    return SimpleUploadedFile(
        name or f'sample.{fmt.lower()}',
        _image_bytes(fmt, size, exif=exif),
        content_type=types[fmt],
    )


def _webp_content(size: tuple[int, int] = (40, 30)) -> ContentFile:
    buffer = BytesIO()
    Image.new('RGB', size, (10, 20, 30)).save(buffer, format='WEBP')
    return ContentFile(buffer.getvalue(), name=f'{uuid4().hex}.webp')


def _login_editor(client: Client) -> None:
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    json_post(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD})


def _create(held_on: date = date(2026, 6, 12), **overrides: object) -> GalleryAlbumRecord:
    values: dict[str, object] = {
        'title': 'Festa junina',
        'summary': 'Festa da comunidade.',
        'event_type': 'Festa',
        'location': 'Sede da ONG',
        'held_on': held_on,
        'cover': _webp_content((80, 80)),
        'is_published': True,
    }
    values.update(overrides)
    return GalleryAlbumRecord.objects.create(**values)


def _add_photo(album: GalleryAlbumRecord, **overrides: object) -> GalleryPhotoRecord:
    values: dict[str, object] = {
        'album': album,
        'image': _webp_content(),
        'image_alt': '',
    }
    values.update(overrides)
    return GalleryPhotoRecord.objects.create(**values)


def _form(**overrides: object) -> dict[str, object]:
    values: dict[str, object] = {
        'title': 'Mutirão de saúde',
        'summary': 'Atendimento gratuito na praça.',
        'event_type': 'Mutirão',
        'location': 'Praça central',
        'held_on': '2026-03-20',
        'cover': _image_file(),
        'cover_alt': 'Tenda na praça',
    }
    values.update(overrides)
    return values


def _photos_url(album_id: object) -> str:
    return f'{ADMIN_URL}{album_id}/photos/'


def _assert_cover_webp(media_root: Path, cover_url: str) -> Path:
    assert cover_url.startswith('/media/gallery/covers/')
    assert cover_url.endswith('.webp')
    path = media_root / cover_url.removeprefix('/media/')
    assert path.is_file()
    with Image.open(path) as image:
        assert image.format == 'WEBP'
        assert image.size == (800, 800)
    return path


def _assert_fitted_webp(media_root: Path, image_url: str, *, max_side: int = 1600) -> Path:
    assert image_url.startswith('/media/gallery/photos/')
    assert image_url.endswith('.webp')
    path = media_root / image_url.removeprefix('/media/')
    assert path.is_file()
    with Image.open(path) as image:
        assert image.format == 'WEBP'
        width, height = image.size
        assert max(width, height) <= max_side
        assert not image.info.get('exif')
    return path


def test_editor_group_has_gallery_permissions() -> None:
    group = Group.objects.get(name=EDITOR_GROUP)
    album_codes = set(
        group.permissions.filter(content_type__app_label='gallery', content_type__model='galleryalbum').values_list(
            'codename',
            flat=True,
        )
    )
    photo_codes = set(
        group.permissions.filter(content_type__app_label='gallery', content_type__model='galleryphoto').values_list(
            'codename',
            flat=True,
        )
    )
    assert album_codes == {'add_galleryalbum', 'change_galleryalbum', 'delete_galleryalbum', 'view_galleryalbum'}
    assert photo_codes == {'add_galleryphoto', 'change_galleryphoto', 'delete_galleryphoto', 'view_galleryphoto'}


def test_public_list_shows_published_albums_in_order(client: Client, media_root: Path) -> None:
    older = _create(date(2025, 1, 10), title='Antigo')
    newer = _create(date(2026, 8, 1), title='Recente')
    hidden = _create(date(2026, 9, 1), title='Oculto', is_published=False)
    _add_photo(newer)
    _add_photo(newer)
    response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    body = response.json()
    assert [item['id'] for item in body] == [str(newer.id), str(older.id)]
    assert str(hidden.id) not in {item['id'] for item in body}
    by_id = {item['id']: item for item in body}
    assert by_id[str(newer.id)]['photo_count'] == 2
    assert by_id[str(older.id)]['photo_count'] == 0
    assert by_id[str(newer.id)]['slug'] == 'recente'
    assert 'is_published' not in body[0]
    assert 'photos' not in body[0]
    assert body[0]['cover'].startswith('/media/gallery/covers/')


def test_public_list_uses_a_bounded_query_count(
    client: Client,
    media_root: Path,
    django_assert_max_num_queries: object,
) -> None:
    first = _create(date(2026, 1, 1), title='Um')
    second = _create(date(2026, 2, 1), title='Dois')
    third = _create(date(2026, 3, 1), title='Três')
    for album in (first, second, third):
        _add_photo(album)
        _add_photo(album)
    with django_assert_max_num_queries(2):
        response = client.get(PUBLIC_URL)
    assert response.status_code == 200
    assert [item['photo_count'] for item in response.json()] == [2, 2, 2]


def test_public_detail_returns_photos_in_position_order(client: Client, media_root: Path) -> None:
    album = _create(title='Encontro')
    first = _add_photo(album, image_alt='Primeira')
    second = _add_photo(album, image_alt='Segunda')
    third = _add_photo(album, image_alt='Terceira')
    GalleryPhotoRecord.objects.filter(pk=first.pk).update(position=2)
    GalleryPhotoRecord.objects.filter(pk=second.pk).update(position=0)
    GalleryPhotoRecord.objects.filter(pk=third.pk).update(position=1)
    response = client.get(f'{PUBLIC_URL}{album.slug}/')
    assert response.status_code == 200
    body = response.json()
    assert body['id'] == str(album.id)
    assert body['slug'] == 'encontro'
    assert body['photo_count'] == 3
    assert [photo['image_alt'] for photo in body['photos']] == ['Segunda', 'Terceira', 'Primeira']
    assert [photo['id'] for photo in body['photos']] == [str(second.id), str(third.id), str(first.id)]
    assert {'id', 'image', 'image_alt', 'width', 'height'} <= set(body['photos'][0])
    assert 'position' not in body['photos'][0]


def test_public_detail_hidden_album_is_404(client: Client, media_root: Path) -> None:
    album = _create(title='Oculto', is_published=False)
    response = client.get(f'{PUBLIC_URL}{album.slug}/')
    assert response.status_code == 404


def test_public_detail_unknown_slug_is_404(client: Client) -> None:
    response = client.get(f'{PUBLIC_URL}nao-existe/')
    assert response.status_code == 404


def test_anonymous_and_plain_user_forbidden_on_admin_routes(client: Client, media_root: Path) -> None:
    album = _create()
    photo = _add_photo(album)
    detail = f'{ADMIN_URL}{album.id}/'
    photos = _photos_url(album.id)
    photo_detail = f'{photos}{photo.id}/'
    reorder = f'{photos}reorder/'

    def attempts() -> list[int]:
        return [
            client.get(ADMIN_URL).status_code,
            client.get(detail).status_code,
            client.post(ADMIN_URL, data=_form()).status_code,
            client.patch(detail, data={'title': 'x'}, content_type='application/json').status_code,
            client.delete(detail).status_code,
            client.get(photos).status_code,
            client.post(photos, data={'image': _image_file()}).status_code,
            client.patch(photo_detail, data={'image_alt': 'x'}, content_type='application/json').status_code,
            client.delete(photo_detail).status_code,
            client.post(reorder, data={'ids': [str(photo.id)]}, content_type='application/json').status_code,
        ]

    assert set(attempts()) == {403}
    create_verified_user('plain', 'plain@example.com')
    json_post(client, '/auth/login', {'username': 'plain', 'password': PASSWORD})
    assert set(attempts()) == {403}


def test_moderator_and_inactive_editor_forbidden(client: Client, media_root: Path) -> None:
    album = _create()
    detail = f'{ADMIN_URL}{album.id}/'
    photos = _photos_url(album.id)
    moderator = create_verified_user('mod1', 'mod@example.com')
    moderator.groups.add(Group.objects.get(name=MODERATOR_GROUP))
    json_post(client, '/auth/login', {'username': 'mod1', 'password': PASSWORD})
    assert client.get(ADMIN_URL).status_code == 403
    assert client.get(photos).status_code == 403
    assert client.patch(detail, data={'title': 'x'}, content_type='application/json').status_code == 403
    client.logout()
    _login_editor(client)
    assert client.get(ADMIN_URL).status_code == 200
    User.objects.filter(username='editor1').update(is_active=False)
    assert client.get(ADMIN_URL).status_code == 403
    assert client.delete(detail).status_code == 403
    assert GalleryAlbumRecord.objects.filter(id=album.id, title='Festa junina').exists()


def test_admin_writes_require_csrf_token(media_root: Path) -> None:
    client = Client(enforce_csrf_checks=True)
    user = create_verified_user('editor1', 'ed@example.com')
    user.groups.add(Group.objects.get(name=EDITOR_GROUP))
    token = csrf_token(client)
    login = json_post_csrf(client, '/auth/login', {'username': 'editor1', 'password': PASSWORD}, token)
    assert login.status_code == 200
    without = client.post(ADMIN_URL, data=_form())
    assert without.status_code == 403
    assert not GalleryAlbumRecord.objects.exists()
    with_token = client.post(ADMIN_URL, data=_form(), HTTP_X_CSRFTOKEN=client.cookies['csrftoken'].value)
    assert with_token.status_code == 201, with_token.content


def test_editor_can_create_update_delete_album(client: Client, media_root: Path) -> None:
    _login_editor(client)
    created = client.post(ADMIN_URL, data=_form())
    assert created.status_code == 201, created.content
    body = created.json()
    assert body['title'] == 'Mutirão de saúde'
    assert body['slug'] == 'mutirao-de-saude'
    assert body['summary'] == 'Atendimento gratuito na praça.'
    assert body['event_type'] == 'Mutirão'
    assert body['location'] == 'Praça central'
    assert body['held_on'] == '2026-03-20'
    assert body['cover_alt'] == 'Tenda na praça'
    assert body['is_published'] is True
    assert body['photo_count'] == 0
    _assert_cover_webp(media_root, body['cover'])
    pk = body['id']
    updated = client.patch(
        f'{ADMIN_URL}{pk}/',
        data={'title': 'Mutirão atualizado', 'is_published': False},
        content_type='application/json',
    )
    assert updated.status_code == 200, updated.content
    assert updated.json()['title'] == 'Mutirão atualizado'
    assert updated.json()['slug'] == 'mutirao-de-saude'
    assert updated.json()['is_published'] is False
    deleted = client.delete(f'{ADMIN_URL}{pk}/')
    assert deleted.status_code == 204
    assert not GalleryAlbumRecord.objects.filter(id=pk).exists()


def test_admin_list_includes_hidden_albums(client: Client, media_root: Path) -> None:
    _login_editor(client)
    hidden = _create(is_published=False)
    visible = _create(date(2025, 5, 1), title='Visível')
    response = client.get(ADMIN_URL)
    assert response.status_code == 200
    assert {item['id'] for item in response.json()} == {str(hidden.id), str(visible.id)}


def test_slug_comes_from_title_and_stays_stable(client: Client, media_root: Path) -> None:
    _login_editor(client)
    first = client.post(ADMIN_URL, data=_form(title='Roda de conversa'))
    assert first.status_code == 201, first.content
    assert first.json()['slug'] == 'roda-de-conversa'
    second = client.post(ADMIN_URL, data=_form(title='Roda de conversa'))
    assert second.status_code == 201, second.content
    assert second.json()['slug'] == 'roda-de-conversa-2'
    third = client.post(ADMIN_URL, data=_form(title='Roda de conversa'))
    assert third.json()['slug'] == 'roda-de-conversa-3'
    empty = client.post(ADMIN_URL, data=_form(title='!!!'))
    assert empty.status_code == 201, empty.content
    assert empty.json()['slug'] == 'album'
    another_empty = client.post(ADMIN_URL, data=_form(title='@@@'))
    assert another_empty.json()['slug'] == 'album-2'
    patched = client.patch(
        f'{ADMIN_URL}{first.json()["id"]}/',
        data={'title': 'Outro nome'},
        content_type='application/json',
    )
    assert patched.status_code == 200
    assert patched.json()['title'] == 'Outro nome'
    assert patched.json()['slug'] == 'roda-de-conversa'


def test_slug_retries_when_first_candidate_is_taken(media_root: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    existing = _create(title='Festa')
    original = GalleryAlbumRecord._unique_slug
    calls = {'n': 0}

    def once_stale(self: GalleryAlbumRecord) -> str:
        calls['n'] += 1
        if calls['n'] == 1:
            return existing.slug
        return original(self)

    monkeypatch.setattr(GalleryAlbumRecord, '_unique_slug', once_stale)
    album = GalleryAlbumRecord(
        title='Festa',
        summary='Festa da comunidade.',
        event_type='Festa',
        location='Sede da ONG',
        held_on=date(2026, 6, 12),
        cover=_webp_content((80, 80)),
    )
    album.save()
    assert album.slug == 'festa-2'
    assert calls['n'] == 2
    assert GalleryAlbumRecord.objects.filter(slug='festa-2').exists()


def test_text_validation(client: Client, media_root: Path) -> None:
    _login_editor(client)
    response = client.post(
        ADMIN_URL,
        data=_form(title='   ', summary='x' * 281, event_type='', location='y' * 161, cover_alt='a' * 161),
    )
    assert response.status_code == 400
    assert set(response.json()) >= {'title', 'summary', 'event_type', 'location', 'cover_alt'}


def test_cover_is_required_on_create(client: Client, media_root: Path) -> None:
    _login_editor(client)
    data = {key: value for key, value in _form().items() if key != 'cover'}
    missing = client.post(ADMIN_URL, data=data)
    empty = client.post(ADMIN_URL, data={**data, 'cover': ''})
    assert missing.status_code == 400
    assert 'cover' in missing.json()
    assert empty.status_code == 400
    assert 'cover' in empty.json()


def test_replace_cover_deletes_old_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data=_form())
    assert created.status_code == 201, created.content
    first_path = _assert_cover_webp(media_root, created.json()['cover'])
    with TestCase.captureOnCommitCallbacks(execute=True):
        replaced = client.patch(
            f'{ADMIN_URL}{created.json()["id"]}/',
            data=encode_multipart(BOUNDARY, {'cover': _image_file('PNG', name='two.png')}),
            content_type=MULTIPART_CONTENT,
        )
    assert replaced.status_code == 200, replaced.content
    _assert_cover_webp(media_root, replaced.json()['cover'])
    assert not first_path.exists()


def test_delete_album_removes_cover_and_photo_files(client: Client, media_root: Path) -> None:
    _login_editor(client)
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(ADMIN_URL, data=_form())
        album_id = created.json()['id']
        cover_path = _assert_cover_webp(media_root, created.json()['cover'])
        first = client.post(_photos_url(album_id), data={'image': _image_file(), 'image_alt': 'Uma'})
        second = client.post(_photos_url(album_id), data={'image': _image_file('PNG'), 'image_alt': 'Duas'})
        assert first.status_code == 201, first.content
        assert second.status_code == 201, second.content
        first_path = _assert_fitted_webp(media_root, first.json()['image'])
        second_path = _assert_fitted_webp(media_root, second.json()['image'])
        deleted = client.delete(f'{ADMIN_URL}{album_id}/')
    assert deleted.status_code == 204
    assert not GalleryAlbumRecord.objects.filter(id=album_id).exists()
    assert not GalleryPhotoRecord.objects.filter(album_id=album_id).exists()
    assert not cover_path.exists()
    assert not first_path.exists()
    assert not second_path.exists()


def test_upload_photo_stores_fitted_webp(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    response = client.post(
        _photos_url(album.id),
        data={'image': _image_file('JPEG', (2000, 1000)), 'image_alt': 'Paisagem'},
    )
    assert response.status_code == 201, response.content
    body = response.json()
    assert body['image_alt'] == 'Paisagem'
    assert body['position'] == 0
    assert body['width'] == 1600
    assert body['height'] == 800
    path = _assert_fitted_webp(media_root, body['image'])
    with Image.open(path) as image:
        assert image.size == (1600, 800)


def test_small_photo_is_not_upscaled(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    response = client.post(_photos_url(album.id), data={'image': _image_file('PNG', (80, 50))})
    assert response.status_code == 201, response.content
    body = response.json()
    assert body['width'] == 80
    assert body['height'] == 50
    path = _assert_fitted_webp(media_root, body['image'])
    with Image.open(path) as image:
        assert image.size == (80, 50)


def test_invalid_photo_rejected(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    bogus = SimpleUploadedFile('fake.jpg', b'not an image', content_type='image/jpeg')
    gif = _image_file('GIF')
    response = client.post(_photos_url(album.id), data={'image': bogus})
    assert response.status_code == 400
    assert 'image' in response.json()
    gif_response = client.post(_photos_url(album.id), data={'image': gif})
    assert gif_response.status_code == 400
    assert 'image' in gif_response.json()
    photos_dir = media_root / 'gallery' / 'photos'
    assert not photos_dir.exists() or list(photos_dir.iterdir()) == []


def test_photo_cap(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    for _ in range(MAX_PHOTOS_PER_ALBUM):
        _add_photo(album)
    response = client.post(_photos_url(album.id), data={'image': _image_file()})
    assert response.status_code == 400
    assert MAX_PHOTOS_MESSAGE in str(response.json())
    assert GalleryPhotoRecord.objects.filter(album=album).count() == MAX_PHOTOS_PER_ALBUM


def test_patch_photo_changes_alt_and_ignores_image(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    created = client.post(_photos_url(album.id), data={'image': _image_file(), 'image_alt': 'Antes'})
    assert created.status_code == 201, created.content
    photo_id = created.json()['id']
    original_image = created.json()['image']
    updated = client.patch(
        f'{_photos_url(album.id)}{photo_id}/',
        data=encode_multipart(BOUNDARY, {'image_alt': 'Depois', 'image': _image_file('PNG', name='new.png')}),
        content_type=MULTIPART_CONTENT,
    )
    assert updated.status_code == 200, updated.content
    assert updated.json()['image_alt'] == 'Depois'
    assert updated.json()['image'] == original_image


def test_delete_photo_removes_file(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    with TestCase.captureOnCommitCallbacks(execute=True):
        created = client.post(_photos_url(album.id), data={'image': _image_file('WEBP')})
        path = _assert_fitted_webp(media_root, created.json()['image'])
        deleted = client.delete(f'{_photos_url(album.id)}{created.json()["id"]}/')
    assert deleted.status_code == 204
    assert not path.exists()
    assert not GalleryPhotoRecord.objects.filter(id=created.json()['id']).exists()


def test_reorder_photos(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    a = _add_photo(album, image_alt='A')
    b = _add_photo(album, image_alt='B')
    c = _add_photo(album, image_alt='C')
    response = client.post(
        f'{_photos_url(album.id)}reorder/',
        data={'ids': [str(c.id), str(a.id), str(b.id)]},
        content_type='application/json',
    )
    assert response.status_code == 200
    assert [item['image_alt'] for item in response.json()] == ['C', 'A', 'B']
    assert [item['position'] for item in response.json()] == [0, 1, 2]


def test_reorder_rejects_duplicates_and_mismatch(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    a = _add_photo(album)
    b = _add_photo(album)
    duplicate = client.post(
        f'{_photos_url(album.id)}reorder/',
        data={'ids': [str(a.id), str(a.id)]},
        content_type='application/json',
    )
    missing = client.post(
        f'{_photos_url(album.id)}reorder/',
        data={'ids': [str(a.id)]},
        content_type='application/json',
    )
    extra = client.post(
        f'{_photos_url(album.id)}reorder/',
        data={'ids': [str(a.id), str(b.id), str(uuid4())]},
        content_type='application/json',
    )
    assert duplicate.status_code == 400
    assert duplicate.json()['ids'] == ['A lista contém identificadores duplicados.']
    assert missing.status_code == 400
    assert missing.json()['ids'] == ['A lista deve conter exatamente todas as fotos do álbum.']
    assert extra.status_code == 400
    assert extra.json()['ids'] == ['A lista deve conter exatamente todas as fotos do álbum.']


def test_photo_of_another_album_is_404(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create(title='Um')
    other = _create(title='Outro')
    photo = _add_photo(other)
    detail = f'{_photos_url(album.id)}{photo.id}/'
    patched = client.patch(detail, data={'image_alt': 'x'}, content_type='application/json')
    deleted = client.delete(detail)
    assert patched.status_code == 404
    assert deleted.status_code == 404
    assert GalleryPhotoRecord.objects.filter(id=photo.id).exists()


def test_unknown_album_is_404_on_photo_routes(client: Client, media_root: Path) -> None:
    _login_editor(client)
    missing_id = uuid4()
    photos = _photos_url(missing_id)
    listed = client.get(photos)
    uploaded = client.post(photos, data={'image': _image_file()})
    reordered = client.post(f'{photos}reorder/', data={'ids': []}, content_type='application/json')
    patched = client.patch(f'{photos}{uuid4()}/', data={'image_alt': 'x'}, content_type='application/json')
    deleted = client.delete(f'{photos}{uuid4()}/')
    assert listed.status_code == 404
    assert uploaded.status_code == 404
    assert reordered.status_code == 404
    assert patched.status_code == 404
    assert deleted.status_code == 404


def test_process_fitted_image_landscape() -> None:
    uploaded = _image_file('JPEG', (2000, 1000), name='wide.jpg')
    result = process_fitted_image(uploaded, max_side=1600)
    with Image.open(result) as image:
        assert image.format == 'WEBP'
        assert image.size == (1600, 800)
        assert not image.info.get('exif')


def test_process_fitted_image_portrait() -> None:
    uploaded = _image_file('PNG', (1000, 2000), name='tall.png')
    result = process_fitted_image(uploaded, max_side=1600)
    with Image.open(result) as image:
        assert image.format == 'WEBP'
        assert image.size == (800, 1600)


def test_process_fitted_image_exif_orientation() -> None:
    exif = Image.Exif()
    exif[0x0112] = 6
    uploaded = _image_file('JPEG', (300, 100), name='rot.jpg', exif=exif)
    with Image.open(BytesIO(uploaded.read())) as source:
        assert source.size == (300, 100)
        assert source.getexif()[0x0112] == 6
    uploaded.seek(0)
    result = process_fitted_image(uploaded, max_side=1600)
    with Image.open(result) as image:
        assert image.format == 'WEBP'
        assert image.size == (100, 300)
        assert 0x0112 not in image.getexif()
        assert not image.info.get('exif')


def test_photo_upload_requires_an_image(client: Client, media_root: Path) -> None:
    _login_editor(client)
    album = _create()
    missing = client.post(_photos_url(album.id), data={'image_alt': 'Sem arquivo'})
    empty = client.post(_photos_url(album.id), data={'image': '', 'image_alt': 'Vazio'})
    assert missing.status_code == 400
    assert 'image' in missing.json()
    assert empty.status_code == 400
    assert 'image' in empty.json()
    assert not GalleryPhotoRecord.objects.filter(album=album).exists()
