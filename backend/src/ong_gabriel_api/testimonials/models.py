import uuid
from typing import ClassVar

from django.core.files.storage import default_storage
from django.core.validators import MaxLengthValidator
from django.db import models, transaction


def _delete_stored_file(name: str) -> None:
    if name and default_storage.exists(name):
        default_storage.delete(name)


def _schedule_file_delete(name: str) -> None:
    transaction.on_commit(lambda stored=name: _delete_stored_file(stored))


class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote = models.TextField(validators=[MaxLengthValidator(500)])
    name = models.CharField(max_length=80)
    role = models.CharField(max_length=80, blank=True)
    portrait = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    is_published = models.BooleanField(default=True)
    position = models.PositiveIntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ['position', 'created_at']

    def __str__(self) -> str:
        return self.name

    def save(self, *args: object, **kwargs: object) -> None:
        if self._state.adding:
            with transaction.atomic():
                max_position = (
                    Testimonial.objects.select_for_update()
                    .order_by('-position')
                    .values_list('position', flat=True)
                    .first()
                )
                self.position = 0 if max_position is None else max_position + 1
                super().save(*args, **kwargs)
            return
        update_fields = kwargs.get('update_fields')
        previous_name = ''
        if update_fields is None or 'portrait' in update_fields:
            previous_name = self._portrait_name_on_disk()
        super().save(*args, **kwargs)
        current_name = self.portrait.name if self.portrait else ''
        if previous_name and previous_name != current_name:
            _schedule_file_delete(previous_name)

    def _portrait_name_on_disk(self) -> str:
        stored = Testimonial.objects.filter(pk=self.pk).values_list('portrait', flat=True).first()
        return stored or ''
