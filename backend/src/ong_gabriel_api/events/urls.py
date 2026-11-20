from django.urls import include, path
from rest_framework.routers import SimpleRouter

from ong_gabriel_api.events.views import AdminEventViewSet, PublicEventListView

router = SimpleRouter()
router.register('admin/events', AdminEventViewSet, basename='admin-event')

urlpatterns = [
    path('events/', PublicEventListView.as_view(), name='event-list'),
    path('', include(router.urls)),
]
