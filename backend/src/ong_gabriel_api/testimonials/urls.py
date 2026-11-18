from django.urls import include, path
from rest_framework.routers import SimpleRouter

from ong_gabriel_api.testimonials.views import AdminTestimonialViewSet, PublicTestimonialListView

router = SimpleRouter()
router.register('admin/testimonials', AdminTestimonialViewSet, basename='admin-testimonial')

urlpatterns = [
    path('testimonials/', PublicTestimonialListView.as_view(), name='testimonial-list'),
    path('', include(router.urls)),
]
