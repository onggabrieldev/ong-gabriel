import uuid
from typing import ClassVar

from django.core.validators import MaxLengthValidator
from django.db import models

from ong_gabriel_api.uploads.files import schedule_file_delete

TITLE_MAX_LENGTH = 120
SUMMARY_MAX_LENGTH = 280
DESCRIPTION_MAX_LENGTH = 4000
EVENT_TYPE_MAX_LENGTH = 60
LOCATION_MAX_LENGTH = 160
IMAGE_ALT_MAX_LENGTH = 160


class Accent(models.TextChoices):
    SKY = 'sky', 'Azul'
    BUTTER = 'butter', 'Amarelo'
    TEAL = 'teal', 'Verde'


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=TITLE_MAX_LENGTH)
    summary = models.TextField(validators=[MaxLengthValidator(SUMMARY_MAX_LENGTH)])
    description = models.TextField(blank=True, validators=[MaxLengthValidator(DESCRIPTION_MAX_LENGTH)])
    event_type = models.CharField(max_length=EVENT_TYPE_MAX_LENGTH)
    location = models.CharField(max_length=LOCATION_MAX_LENGTH)
    starts_at = models.DateTimeField(db_index=True)
    ends_at = models.DateTimeField(db_index=True)
    accent = models.CharField(max_length=10, choices=Accent.choices, default=Accent.SKY)
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    image_alt = models.CharField(max_length=IMAGE_ALT_MAX_LENGTH, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ['starts_at', 'created_at']
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.CheckConstraint(
                condition=models.Q(ends_at__gt=models.F('starts_at')),
                name='event_ends_after_start',
            ),
        ]

    def __str__(self) -> str:
        return self.title

    def save(self, *args: object, **kwargs: object) -> None:
        if self._state.adding:
            super().save(*args, **kwargs)
            return
        update_fields = kwargs.get('update_fields')
        previous_name = ''
        if update_fields is None or 'image' in update_fields:
            previous_name = self._image_name_on_disk()
        super().save(*args, **kwargs)
        current_name = self.image.name if self.image else ''
        if previous_name and previous_name != current_name:
            schedule_file_delete(previous_name)

    def _image_name_on_disk(self) -> str:
        stored = Event.objects.filter(pk=self.pk).values_list('image', flat=True).first()
        return stored or ''
