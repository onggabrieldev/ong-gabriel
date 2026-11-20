import uuid
from typing import ClassVar

from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator
from django.db import IntegrityError, models, transaction
from django.utils.text import slugify

from ong_gabriel_api.ordering import next_position
from ong_gabriel_api.uploads.files import schedule_file_delete

TITLE_MAX_LENGTH = 120
SLUG_MAX_LENGTH = 140
SUMMARY_MAX_LENGTH = 280
EVENT_TYPE_MAX_LENGTH = 60
LOCATION_MAX_LENGTH = 160
IMAGE_ALT_MAX_LENGTH = 160
MAX_PHOTOS_PER_ALBUM = 60
EMPTY_SLUG_FALLBACK = 'album'
MAX_PHOTOS_MESSAGE = 'O álbum pode ter no máximo 60 fotos.'
SLUG_SAVE_ATTEMPTS = 5


def _is_slug_unique_conflict(exc: IntegrityError) -> bool:
    message = str(exc.__cause__ or exc).lower()
    return 'slug' in message


class GalleryAlbum(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=TITLE_MAX_LENGTH)
    slug = models.SlugField(max_length=SLUG_MAX_LENGTH, unique=True)
    summary = models.TextField(validators=[MaxLengthValidator(SUMMARY_MAX_LENGTH)])
    event_type = models.CharField(max_length=EVENT_TYPE_MAX_LENGTH)
    location = models.CharField(max_length=LOCATION_MAX_LENGTH)
    held_on = models.DateField(db_index=True)
    cover = models.ImageField(upload_to='gallery/covers/')
    cover_alt = models.CharField(max_length=IMAGE_ALT_MAX_LENGTH, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ['-held_on', '-created_at']

    def __str__(self) -> str:
        return self.title

    def save(self, *args: object, **kwargs: object) -> None:
        if self._state.adding:
            if not self.slug:
                self._save_new_with_generated_slug(*args, **kwargs)
            else:
                super().save(*args, **kwargs)
            return
        update_fields = kwargs.get('update_fields')
        previous_name = ''
        if update_fields is None or 'cover' in update_fields:
            previous_name = self._cover_name_on_disk()
        super().save(*args, **kwargs)
        current_name = self.cover.name if self.cover else ''
        if previous_name and previous_name != current_name:
            schedule_file_delete(previous_name)

    def _save_new_with_generated_slug(self, *args: object, **kwargs: object) -> None:
        last_error: IntegrityError | None = None
        for _ in range(SLUG_SAVE_ATTEMPTS):
            self.slug = self._unique_slug()
            try:
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return
            except IntegrityError as exc:
                if not _is_slug_unique_conflict(exc):
                    raise
                last_error = exc
        assert last_error is not None
        raise last_error

    def _unique_slug(self) -> str:
        base = slugify(self.title) or EMPTY_SLUG_FALLBACK
        candidate = base
        suffix = 2
        while GalleryAlbum.objects.filter(slug=candidate).exists():
            candidate = f'{base}-{suffix}'
            suffix += 1
        return candidate

    def _cover_name_on_disk(self) -> str:
        stored = GalleryAlbum.objects.filter(pk=self.pk).values_list('cover', flat=True).first()
        return stored or ''


class GalleryPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    album = models.ForeignKey(GalleryAlbum, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='gallery/photos/', width_field='width', height_field='height')
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    image_alt = models.CharField(max_length=IMAGE_ALT_MAX_LENGTH, blank=True)
    position = models.PositiveIntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ['position', 'created_at']

    def __str__(self) -> str:
        return self.image_alt or str(self.pk)

    def save(self, *args: object, **kwargs: object) -> None:
        if self._state.adding:
            with transaction.atomic():
                scoped = GalleryPhoto.objects.filter(album=self.album)
                self.position = next_position(scoped)
                if scoped.count() >= MAX_PHOTOS_PER_ALBUM:
                    raise ValidationError(MAX_PHOTOS_MESSAGE)
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
        stored = GalleryPhoto.objects.filter(pk=self.pk).values_list('image', flat=True).first()
        return stored or ''
