from django.contrib import admin

from ong_gabriel_api.gallery.models import GalleryAlbum, GalleryPhoto


class GalleryPhotoInline(admin.TabularInline):
    model = GalleryPhoto
    extra = 0


@admin.register(GalleryAlbum)
class GalleryAlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'held_on', 'event_type', 'location', 'is_published')
    list_filter = ('is_published', 'event_type')
    ordering = ('-held_on', '-created_at')
    inlines = (GalleryPhotoInline,)


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(admin.ModelAdmin):
    list_display = ('album', 'position', 'image_alt')
    list_filter = ('album',)
    ordering = ('position', 'created_at')
