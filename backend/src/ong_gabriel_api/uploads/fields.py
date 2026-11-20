from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.base import ContentFile
from django.db.models.fields.files import ImageFieldFile
from rest_framework import serializers

from ong_gabriel_api.uploads.images import process_square_image


class SquareImageField(serializers.FileField):
    def __init__(self, *, output_size: int, **kwargs: object) -> None:
        self.output_size = output_size
        super().__init__(**kwargs)

    def to_internal_value(self, data: object) -> ContentFile | None:
        if data in (None, '', 'null'):
            return None
        uploaded = super().to_internal_value(data)
        try:
            return process_square_image(uploaded, self.output_size)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc

    def to_representation(self, value: ImageFieldFile | None) -> str | None:
        if not value:
            return None
        return value.url
