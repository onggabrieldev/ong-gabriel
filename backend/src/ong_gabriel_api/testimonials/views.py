from typing import ClassVar
from uuid import UUID

from django.db import transaction
from django.db.models import QuerySet
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from ong_gabriel_api.accounts.permissions import IsEditor
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
        incoming_ids = [str(item) for item in incoming]
        if len(incoming_ids) != len(set(incoming_ids)):
            raise ValidationError({'ids': ['A lista contém identificadores duplicados.']})
        with transaction.atomic():
            rows = list(Testimonial.objects.select_for_update().order_by('position', 'created_at'))
            existing_ids = {str(row.id) for row in rows}
            if set(incoming_ids) != existing_ids:
                raise ValidationError({'ids': ['A lista deve conter exatamente todos os depoimentos.']})
            by_id = {str(row.id): row for row in rows}
            for position, pk in enumerate(incoming_ids):
                row = by_id[pk]
                if row.position != position:
                    row.position = position
                    row.save(update_fields=['position', 'updated_at'])
        ordered = Testimonial.objects.all()
        return Response(AdminTestimonialSerializer(ordered, many=True, context={'request': request}).data)
