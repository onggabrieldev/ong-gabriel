from collections.abc import Mapping

from rest_framework import serializers

from ong_gabriel_api.events.models import (
    DESCRIPTION_MAX_LENGTH,
    EVENT_TYPE_MAX_LENGTH,
    IMAGE_ALT_MAX_LENGTH,
    LOCATION_MAX_LENGTH,
    SUMMARY_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    Event,
)
from ong_gabriel_api.uploads.fields import SquareImageField

IMAGE_SIZE = 800

PUBLIC_FIELDS = (
    'id',
    'title',
    'summary',
    'description',
    'event_type',
    'location',
    'starts_at',
    'ends_at',
    'accent',
    'image',
    'image_alt',
)


class PublicEventSerializer(serializers.ModelSerializer):
    image = SquareImageField(output_size=IMAGE_SIZE, read_only=True)

    class Meta:
        model = Event
        fields = PUBLIC_FIELDS


class AdminEventSerializer(serializers.ModelSerializer):
    image = SquareImageField(output_size=IMAGE_SIZE, required=False, allow_null=True)
    title = serializers.CharField(max_length=TITLE_MAX_LENGTH, min_length=1, trim_whitespace=True)
    summary = serializers.CharField(max_length=SUMMARY_MAX_LENGTH, min_length=1, trim_whitespace=True)
    description = serializers.CharField(
        max_length=DESCRIPTION_MAX_LENGTH,
        allow_blank=True,
        required=False,
        trim_whitespace=True,
    )
    event_type = serializers.CharField(max_length=EVENT_TYPE_MAX_LENGTH, min_length=1, trim_whitespace=True)
    location = serializers.CharField(max_length=LOCATION_MAX_LENGTH, min_length=1, trim_whitespace=True)
    image_alt = serializers.CharField(
        max_length=IMAGE_ALT_MAX_LENGTH,
        allow_blank=True,
        required=False,
        trim_whitespace=True,
    )

    class Meta:
        model = Event
        fields = (*PUBLIC_FIELDS, 'is_published', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_internal_value(self, data: Mapping[str, object]) -> dict[str, object]:
        # An empty upload removes the image, like a testimonial portrait.
        payload = {key: data.get(key) for key in data}
        if 'image' in payload:
            value = payload['image']
            size = getattr(value, 'size', None)
            if value in ('', None, 'null') or size == 0:
                payload['image'] = None
        return super().to_internal_value(payload)

    def validate(self, attrs: dict[str, object]) -> dict[str, object]:
        # A partial update may send only one of the two dates.
        starts_at = attrs.get('starts_at', getattr(self.instance, 'starts_at', None))
        ends_at = attrs.get('ends_at', getattr(self.instance, 'ends_at', None))
        if starts_at is not None and ends_at is not None and ends_at <= starts_at:
            raise serializers.ValidationError({'ends_at': ['O término deve ser depois do início.']})
        return attrs
