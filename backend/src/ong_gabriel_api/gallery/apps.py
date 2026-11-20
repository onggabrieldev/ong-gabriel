from django.apps import AppConfig


class GalleryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ong_gabriel_api.gallery'
    label = 'gallery'
    verbose_name = 'Gallery'

    def ready(self) -> None:
        from django.db.models.signals import post_delete

        from ong_gabriel_api.gallery.models import GalleryAlbum, GalleryPhoto
        from ong_gabriel_api.gallery.signals import delete_cover_file, delete_photo_file

        post_delete.connect(
            delete_cover_file,
            sender=GalleryAlbum,
            dispatch_uid='gallery.delete_cover_file',
        )
        post_delete.connect(
            delete_photo_file,
            sender=GalleryPhoto,
            dispatch_uid='gallery.delete_photo_file',
        )
