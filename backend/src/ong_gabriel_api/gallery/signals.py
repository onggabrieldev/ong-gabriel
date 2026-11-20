from ong_gabriel_api.gallery.models import GalleryAlbum, GalleryPhoto
from ong_gabriel_api.uploads.files import schedule_file_delete


def delete_cover_file(sender: type[GalleryAlbum], instance: GalleryAlbum, **kwargs: object) -> None:
    cover_name = instance.cover.name if instance.cover else ''
    if cover_name:
        schedule_file_delete(cover_name)


def delete_photo_file(sender: type[GalleryPhoto], instance: GalleryPhoto, **kwargs: object) -> None:
    image_name = instance.image.name if instance.image else ''
    if image_name:
        schedule_file_delete(image_name)
