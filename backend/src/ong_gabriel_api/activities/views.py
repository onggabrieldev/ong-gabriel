from typing import ClassVar
from uuid import UUID

from django.db.models import QuerySet
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from ong_gabriel_api.accounts.permissions import IsEditor
from ong_gabriel_api.activities.models import Activity
from ong_gabriel_api.activities.serializers import (
    AdminActivitySerializer,
    PublicActivitySerializer,
    ReorderSerializer,
)
from ong_gabriel_api.ordering import reorder_rows


class PublicActivityListView(ListAPIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [AllowAny]
    serializer_class = PublicActivitySerializer
    pagination_class = None

    def get_queryset(self) -> QuerySet[Activity]:
        return Activity.objects.filter(is_published=True)


class AdminActivityViewSet(ModelViewSet):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]
    serializer_class = AdminActivitySerializer
    pagination_class = None
    http_method_names: ClassVar[list[str]] = ['get', 'post', 'patch', 'delete', 'head', 'options']
    queryset = Activity.objects.all()

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request: Request) -> Response:
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incoming: list[UUID] = serializer.validated_data['ids']
        reorder_rows(
            Activity.objects.all(),
            incoming,
            'A lista deve conter exatamente todas as atividades.',
        )
        ordered = Activity.objects.all()
        return Response(AdminActivitySerializer(ordered, many=True, context={'request': request}).data)
