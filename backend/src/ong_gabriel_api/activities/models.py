import uuid
from typing import ClassVar

from django.core.validators import MaxLengthValidator
from django.db import models, transaction

from ong_gabriel_api.ordering import next_position
from ong_gabriel_api.uploads.files import schedule_file_delete

TITLE_MAX_LENGTH = 60
DESCRIPTION_MAX_LENGTH = 240
IMAGE_ALT_MAX_LENGTH = 160


class Activity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=TITLE_MAX_LENGTH)
    description = models.TextField(validators=[MaxLengthValidator(DESCRIPTION_MAX_LENGTH)])
    image = models.ImageField(upload_to='activities/')
    image_alt = models.CharField(max_length=IMAGE_ALT_MAX_LENGTH, blank=True)
    is_published = models.BooleanField(default=True)
    position = models.PositiveIntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ['position', 'created_at']
        verbose_name_plural = 'activities'

    def __str__(self) -> str:
        return self.title

    def save(self, *args: object, **kwargs: object) -> None:
        if self._state.adding:
            with transaction.atomic():
                self.position = next_position(Activity.objects.all())
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
        stored = Activity.objects.filter(pk=self.pk).values_list('image', flat=True).first()
        return stored or ''
