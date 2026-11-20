from collections.abc import Mapping

from rest_framework import serializers

from ong_gabriel_api.testimonials.models import Testimonial
from ong_gabriel_api.uploads.fields import SquareImageField

PORTRAIT_SIZE = 256


class PublicTestimonialSerializer(serializers.ModelSerializer):
    portrait = SquareImageField(output_size=PORTRAIT_SIZE, read_only=True)

    class Meta:
        model = Testimonial
        fields = ('id', 'quote', 'name', 'role', 'portrait')


class AdminTestimonialSerializer(serializers.ModelSerializer):
    portrait = SquareImageField(output_size=PORTRAIT_SIZE, required=False, allow_null=True)
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
