from collections.abc import Mapping

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.base import ContentFile
from django.db.models.fields.files import ImageFieldFile
from rest_framework import serializers

from ong_gabriel_api.testimonials.images import process_portrait
from ong_gabriel_api.testimonials.models import Testimonial


class PortraitField(serializers.FileField):
    def to_internal_value(self, data: object) -> ContentFile | None:
        if data in (None, '', 'null'):
            return None
        uploaded = super().to_internal_value(data)
        try:
            return process_portrait(uploaded)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc

    def to_representation(self, value: ImageFieldFile | None) -> str | None:
        if not value:
            return None
        return value.url


class PublicTestimonialSerializer(serializers.ModelSerializer):
    portrait = PortraitField(read_only=True)

    class Meta:
        model = Testimonial
        fields = ('id', 'quote', 'name', 'role', 'portrait')


class AdminTestimonialSerializer(serializers.ModelSerializer):
    portrait = PortraitField(required=False, allow_null=True)
    quote = serializers.CharField(max_length=500, min_length=1, trim_whitespace=True)
    name = serializers.CharField(max_length=80, min_length=1, trim_whitespace=True)
    role = serializers.CharField(max_length=80, allow_blank=True, required=False, trim_whitespace=True)

    class Meta:
        model = Testimonial
        fields = (
            'id',
            'quote',
            'name',
            'role',
            'portrait',
            'is_published',
            'position',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'position', 'created_at', 'updated_at')

    def to_internal_value(self, data: Mapping[str, object]) -> dict[str, object]:
        payload = {key: data.get(key) for key in data}
        if 'portrait' in payload:
            value = payload['portrait']
            size = getattr(value, 'size', None)
            if value in ('', None, 'null') or size == 0:
                payload['portrait'] = None
        return super().to_internal_value(payload)


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.UUIDField(), allow_empty=True)
