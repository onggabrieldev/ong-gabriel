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
from ong_gabriel_api.ordering import reorder_rows
from ong_gabriel_api.testimonials.models import Testimonial
from ong_gabriel_api.testimonials.serializers import (
    AdminTestimonialSerializer,
    PublicTestimonialSerializer,
    ReorderSerializer,
)


class PublicTestimonialListView(ListAPIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [AllowAny]
    serializer_class = PublicTestimonialSerializer
    pagination_class = None

    def get_queryset(self) -> QuerySet[Testimonial]:
        return Testimonial.objects.filter(is_published=True)


class AdminTestimonialViewSet(ModelViewSet):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]
    serializer_class = AdminTestimonialSerializer
    pagination_class = None
    http_method_names: ClassVar[list[str]] = ['get', 'post', 'patch', 'delete', 'head', 'options']
    queryset = Testimonial.objects.all()

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request: Request) -> Response:
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incoming: list[UUID] = serializer.validated_data['ids']
        reorder_rows(
            Testimonial.objects.all(),
            incoming,
            'A lista deve conter exatamente todos os depoimentos.',
        )
        ordered = Testimonial.objects.all()
        return Response(AdminTestimonialSerializer(ordered, many=True, context={'request': request}).data)
