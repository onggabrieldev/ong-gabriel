from django.urls import include, path
from rest_framework.routers import SimpleRouter

from ong_gabriel_api.gallery.views import (
    AdminGalleryAlbumViewSet,
    AdminGalleryPhotoViewSet,
    PublicGalleryAlbumDetailView,
    PublicGalleryAlbumListView,
)

router = SimpleRouter()
router.register('admin/gallery', AdminGalleryAlbumViewSet, basename='admin-gallery-album')

photo_list = AdminGalleryPhotoViewSet.as_view({'get': 'list', 'post': 'create'})
photo_detail = AdminGalleryPhotoViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'})
photo_reorder = AdminGalleryPhotoViewSet.as_view({'post': 'reorder'})

urlpatterns = [
    path('gallery/', PublicGalleryAlbumListView.as_view(), name='gallery-album-list'),
    path('gallery/<slug:slug>/', PublicGalleryAlbumDetailView.as_view(), name='gallery-album-detail'),
    path('admin/gallery/<uuid:album_id>/photos/', photo_list, name='admin-gallery-photo-list'),
    path(
        'admin/gallery/<uuid:album_id>/photos/reorder/',
        photo_reorder,
        name='admin-gallery-photo-reorder',
    ),
    path(
        'admin/gallery/<uuid:album_id>/photos/<uuid:pk>/',
        photo_detail,
        name='admin-gallery-photo-detail',
    ),
    path('', include(router.urls)),
]
