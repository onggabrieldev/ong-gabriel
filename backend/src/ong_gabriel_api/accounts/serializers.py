from typing import ClassVar

from rest_framework import serializers

from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.roles import ROLE_GROUPS
from ong_gabriel_api.accounts.validators import ACCOUNT_USERNAME_VALIDATORS


class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'roles', 'is_superuser')
        read_only_fields = ('id', 'email', 'roles', 'is_superuser')
        extra_kwargs: ClassVar[dict[str, dict[str, object]]] = {
            'username': {'validators': list(ACCOUNT_USERNAME_VALIDATORS)},
        }

    def get_roles(self, obj: User) -> list[str]:
        names = set(obj.groups.values_list('name', flat=True))
        return [name for name in ROLE_GROUPS if name in names]

    def validate_username(self, value: str) -> str:
        queryset = User.objects.filter(username__iexact=value)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('A user with that username already exists.', code='unique')
        return value
