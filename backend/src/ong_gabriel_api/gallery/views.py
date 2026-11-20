from typing import ClassVar
from uuid import UUID

from django.db.models import Count, QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.viewsets import ModelViewSet

from ong_gabriel_api.accounts.permissions import IsEditor
from ong_gabriel_api.gallery.models import GalleryAlbum, GalleryPhoto
from ong_gabriel_api.gallery.serializers import (
    AdminGalleryAlbumSerializer,
    AdminGalleryPhotoSerializer,
    AdminGalleryPhotoUpdateSerializer,
    PublicGalleryAlbumDetailSerializer,
    PublicGalleryAlbumSerializer,
    ReorderSerializer,
)
from ong_gabriel_api.ordering import reorder_rows


class PublicGalleryAlbumListView(ListAPIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [AllowAny]
    serializer_class = PublicGalleryAlbumSerializer
    pagination_class = None

    def get_queryset(self) -> QuerySet[GalleryAlbum]:
        return (
            GalleryAlbum.objects.filter(is_published=True)
            .annotate(photo_count=Count('photos'))
            .order_by('-held_on', '-created_at')
        )


class PublicGalleryAlbumDetailView(RetrieveAPIView):
    permission_classes: ClassVar[list[type[BasePermission]]] = [AllowAny]
    serializer_class = PublicGalleryAlbumDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self) -> QuerySet[GalleryAlbum]:
        return (
            GalleryAlbum.objects.filter(is_published=True)
            .annotate(photo_count=Count('photos'))
            .prefetch_related('photos')
            .order_by('-held_on', '-created_at')
        )


class AdminGalleryAlbumViewSet(ModelViewSet):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]
    serializer_class = AdminGalleryAlbumSerializer
    pagination_class = None
    http_method_names: ClassVar[list[str]] = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self) -> QuerySet[GalleryAlbum]:
        return GalleryAlbum.objects.annotate(photo_count=Count('photos')).order_by('-held_on', '-created_at')


class AdminGalleryPhotoViewSet(ModelViewSet):
    permission_classes: ClassVar[list[type[BasePermission]]] = [IsEditor]
    pagination_class = None
    http_method_names: ClassVar[list[str]] = ['get', 'post', 'patch', 'delete', 'head', 'options']
    queryset = GalleryPhoto.objects.all()

    def get_album(self) -> GalleryAlbum:
        return get_object_or_404(GalleryAlbum, pk=self.kwargs['album_id'])

    def get_queryset(self) -> QuerySet[GalleryPhoto]:
        return GalleryPhoto.objects.filter(album=self.get_album())

    def get_serializer_class(self) -> type[BaseSerializer]:
        if self.action == 'partial_update':
            return AdminGalleryPhotoUpdateSerializer
        return AdminGalleryPhotoSerializer

    def perform_create(self, serializer: AdminGalleryPhotoSerializer) -> None:
        serializer.save(album=self.get_album())

    def reorder(self, request: Request, **kwargs: object) -> Response:
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incoming: list[UUID] = serializer.validated_data['ids']
        reorder_rows(
            self.get_queryset(),
            incoming,
            'A lista deve conter exatamente todas as fotos do álbum.',
        )
        ordered = self.get_queryset()
        return Response(AdminGalleryPhotoSerializer(ordered, many=True, context={'request': request}).data)
