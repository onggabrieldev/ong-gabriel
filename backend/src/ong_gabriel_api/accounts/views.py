from typing import ClassVar, cast

from rest_framework.generics import RetrieveUpdateAPIView

from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.serializers import MeSerializer


class MeView(RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    http_method_names: ClassVar[list[str]] = ['get', 'patch', 'head', 'options']

    def get_object(self) -> User:
        return cast(User, self.request.user)
