from typing import ClassVar

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from ong_gabriel_api.accounts.roles import EDITOR_GROUP, MODERATOR_GROUP


class _HasGroup(BasePermission):
    group_name: ClassVar[str]

    def has_permission(self, request: Request, view: APIView) -> bool:
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
        if user.is_superuser:
            return True
        return user.groups.filter(name=self.group_name).exists()


class IsEditor(_HasGroup):
    group_name = EDITOR_GROUP


class IsModerator(_HasGroup):
    group_name = MODERATOR_GROUP
