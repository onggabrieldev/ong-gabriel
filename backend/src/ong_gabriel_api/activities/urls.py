from django.urls import include, path
from rest_framework.routers import SimpleRouter

from ong_gabriel_api.activities.views import AdminActivityViewSet, PublicActivityListView

router = SimpleRouter()
router.register('admin/activities', AdminActivityViewSet, basename='admin-activity')

urlpatterns = [
    path('activities/', PublicActivityListView.as_view(), name='activity-list'),
    path('', include(router.urls)),
]
