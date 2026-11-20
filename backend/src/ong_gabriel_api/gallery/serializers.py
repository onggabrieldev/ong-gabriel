from collections.abc import Mapping

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.base import ContentFile
from rest_framework import serializers

from ong_gabriel_api.gallery.models import (
    EVENT_TYPE_MAX_LENGTH,
    IMAGE_ALT_MAX_LENGTH,
    LOCATION_MAX_LENGTH,
    SUMMARY_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    GalleryAlbum,
    GalleryPhoto,
)
from ong_gabriel_api.uploads.fields import FittedImageField, SquareImageField

COVER_SIZE = 800
PHOTO_MAX_SIDE = 1600

PUBLIC_ALBUM_FIELDS = (
    'id',
    'slug',
    'title',
    'summary',
    'event_type',
    'location',
    'held_on',
    'cover',
    'cover_alt',
    'photo_count',
)


class PublicGalleryPhotoSerializer(serializers.ModelSerializer):
    image = FittedImageField(max_side=PHOTO_MAX_SIDE, read_only=True)

    class Meta:
        model = GalleryPhoto
        fields = ('id', 'image', 'image_alt', 'width', 'height')


class PublicGalleryAlbumSerializer(serializers.ModelSerializer):
    cover = SquareImageField(output_size=COVER_SIZE, read_only=True)
    photo_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = GalleryAlbum
        fields = PUBLIC_ALBUM_FIELDS


class PublicGalleryAlbumDetailSerializer(PublicGalleryAlbumSerializer):
    photos = PublicGalleryPhotoSerializer(many=True, read_only=True)

    class Meta(PublicGalleryAlbumSerializer.Meta):
        fields = (*PUBLIC_ALBUM_FIELDS, 'photos')


class AdminGalleryAlbumSerializer(serializers.ModelSerializer):
    cover = SquareImageField(output_size=COVER_SIZE)
    photo_count = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=TITLE_MAX_LENGTH, min_length=1, trim_whitespace=True)
    summary = serializers.CharField(max_length=SUMMARY_MAX_LENGTH, min_length=1, trim_whitespace=True)
    event_type = serializers.CharField(max_length=EVENT_TYPE_MAX_LENGTH, min_length=1, trim_whitespace=True)
    location = serializers.CharField(max_length=LOCATION_MAX_LENGTH, min_length=1, trim_whitespace=True)
    cover_alt = serializers.CharField(
        max_length=IMAGE_ALT_MAX_LENGTH,
        allow_blank=True,
        required=False,
        trim_whitespace=True,
    )

    class Meta:
        model = GalleryAlbum
        fields = (*PUBLIC_ALBUM_FIELDS, 'is_published', 'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'photo_count', 'created_at', 'updated_at')

    def to_internal_value(self, data: Mapping[str, object]) -> dict[str, object]:
        # An album always has a cover. An empty upload keeps the current
        # one on update and fails the required check on create.
        payload = {key: data.get(key) for key in data}
        if 'cover' in payload:
            value = payload['cover']
            size = getattr(value, 'size', None)
            if value in ('', None, 'null') or size == 0:
                del payload['cover']
        return super().to_internal_value(payload)

    def to_representation(self, instance: GalleryAlbum) -> dict[str, object]:
        if not hasattr(instance, 'photo_count'):
            instance.photo_count = instance.photos.count() if instance.pk else 0
        return super().to_representation(instance)


class AdminGalleryPhotoSerializer(serializers.ModelSerializer):
    image = FittedImageField(max_side=PHOTO_MAX_SIDE)
    image_alt = serializers.CharField(
        max_length=IMAGE_ALT_MAX_LENGTH,
        allow_blank=True,
        required=False,
        trim_whitespace=True,
    )

    class Meta:
        model = GalleryPhoto
        fields = (
            'id',
            'image',
            'image_alt',
            'width',
            'height',
            'position',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'width', 'height', 'position', 'created_at', 'updated_at')

    def validate_image(self, value: ContentFile | None) -> ContentFile:
        if value is None:
            raise serializers.ValidationError('Envie uma imagem.')
        return value

    def create(self, validated_data: dict[str, object]) -> GalleryPhoto:
        try:
            return super().create(validated_data)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc


class AdminGalleryPhotoUpdateSerializer(AdminGalleryPhotoSerializer):
    image = FittedImageField(max_side=PHOTO_MAX_SIDE, read_only=True)


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.UUIDField(), allow_empty=True)
