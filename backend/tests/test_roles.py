from typing import ClassVar

import pytest
from django.contrib.auth.models import AbstractBaseUser, Group
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView

from allauth_http import create_verified_user
from ong_gabriel_api.accounts.permissions import IsEditor, IsModerator
from ong_gabriel_api.accounts.roles import EDITOR_GROUP, MODERATOR_GROUP

pytestmark = pytest.mark.django_db


class _EditorProbe(APIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]

    def get(self, request: Request) -> Response:
        return Response({'ok': True})


class _ModeratorProbe(APIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsModerator]

    def get(self, request: Request) -> Response:
        return Response({'ok': True})


def _get(view: type[APIView], user: AbstractBaseUser | None = None) -> int:
    request = APIRequestFactory().get('/probe')
    if user is not None:
        force_authenticate(request, user=user)
    return view.as_view()(request).status_code


def test_role_groups_exist() -> None:
    assert Group.objects.filter(name=EDITOR_GROUP).exists()
    assert Group.objects.filter(name=MODERATOR_GROUP).exists()


def test_editor_permission() -> None:
    anonymous = _get(_EditorProbe)
    plain = _get(_EditorProbe, create_verified_user('plain', 'plain@example.com'))
    editor = create_verified_user('editor1', 'ed@example.com')
    editor.groups.add(Group.objects.get(name=EDITOR_GROUP))
    editor_ok = _get(_EditorProbe, editor)
    superuser = create_verified_user('root', 'root@example.com')
    superuser.is_superuser = True
    superuser.save()
    super_ok = _get(_EditorProbe, superuser)
    assert anonymous == 403
    assert plain == 403
    assert editor_ok == 200
    assert super_ok == 200


def test_moderator_permission() -> None:
    plain = _get(_ModeratorProbe, create_verified_user('plain', 'plain@example.com'))
    moderator = create_verified_user('moderator1', 'mod@example.com')
    moderator.groups.add(Group.objects.get(name=MODERATOR_GROUP))
    moderator_ok = _get(_ModeratorProbe, moderator)
    editor = create_verified_user('editor1', 'ed@example.com')
    editor.groups.add(Group.objects.get(name=EDITOR_GROUP))
    editor_denied = _get(_ModeratorProbe, editor)
    superuser = create_verified_user('root', 'root@example.com')
    superuser.is_superuser = True
    superuser.save()
    super_ok = _get(_ModeratorProbe, superuser)
    assert plain == 403
    assert moderator_ok == 200
    assert editor_denied == 403
    assert super_ok == 200


def test_editor_permission_denies_moderator_and_inactive_users() -> None:
    moderator = create_verified_user('moderator1', 'mod@example.com')
    moderator.groups.add(Group.objects.get(name=MODERATOR_GROUP))
    editor = create_verified_user('editor1', 'ed@example.com')
    editor.groups.add(Group.objects.get(name=EDITOR_GROUP))
    editor.is_active = False
    editor.save()
    superuser = create_verified_user('root', 'root@example.com')
    superuser.is_superuser = True
    superuser.is_active = False
    superuser.save()
    assert _get(_EditorProbe, moderator) == 403
    assert _get(_EditorProbe, editor) == 403
    assert _get(_EditorProbe, superuser) == 403
