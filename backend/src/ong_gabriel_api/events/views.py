from typing import ClassVar

from django.db.models import QuerySet
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.viewsets import ModelViewSet

from ong_gabriel_api.accounts.permissions import IsEditor
from ong_gabriel_api.events.models import Event
from ong_gabriel_api.events.serializers import AdminEventSerializer, PublicEventSerializer


class PublicEventListView(ListAPIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [AllowAny]
    serializer_class = PublicEventSerializer
    pagination_class = None

    def get_queryset(self) -> QuerySet[Event]:
        # An event stays on the agenda until it ends.
        return Event.objects.filter(is_published=True, ends_at__gte=timezone.now())


class AdminEventViewSet(ModelViewSet):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]
    serializer_class = AdminEventSerializer
    pagination_class = None
    http_method_names: ClassVar[list[str]] = ['get', 'post', 'patch', 'delete', 'head', 'options']
    queryset = Event.objects.all()
