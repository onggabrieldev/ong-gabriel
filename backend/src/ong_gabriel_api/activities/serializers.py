from collections.abc import Mapping

from rest_framework import serializers

from ong_gabriel_api.activities.models import (
    DESCRIPTION_MAX_LENGTH,
    IMAGE_ALT_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    Activity,
)
from ong_gabriel_api.uploads.fields import SquareImageField

IMAGE_SIZE = 1080


class PublicActivitySerializer(serializers.ModelSerializer):
    image = SquareImageField(output_size=IMAGE_SIZE, read_only=True)

    class Meta:
        model = Activity
        fields = ('id', 'title', 'description', 'image', 'image_alt')


class AdminActivitySerializer(serializers.ModelSerializer):
    image = SquareImageField(output_size=IMAGE_SIZE)
    title = serializers.CharField(max_length=TITLE_MAX_LENGTH, min_length=1, trim_whitespace=True)
    description = serializers.CharField(max_length=DESCRIPTION_MAX_LENGTH, min_length=1, trim_whitespace=True)
    image_alt = serializers.CharField(
        max_length=IMAGE_ALT_MAX_LENGTH,
        allow_blank=True,
        required=False,
        trim_whitespace=True,
    )

    class Meta:
        model = Activity
        fields = (
            'id',
            'title',
            'description',
            'image',
            'image_alt',
            'is_published',
            'position',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'position', 'created_at', 'updated_at')

    def to_internal_value(self, data: Mapping[str, object]) -> dict[str, object]:
        # An activity always has an image. An empty upload keeps the current
        # one on update and fails the required check on create.
        payload = {key: data.get(key) for key in data}
        if 'image' in payload:
            value = payload['image']
            size = getattr(value, 'size', None)
            if value in ('', None, 'null') or size == 0:
                del payload['image']
        return super().to_internal_value(payload)


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.UUIDField(), allow_empty=True)
