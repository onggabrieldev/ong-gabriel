from django.conf import settings
from django.contrib import admin
from django.urls import URLPattern, URLResolver, include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from ong_gabriel_api.health import health

admin.site.site_header = 'ONG Gabriel'
admin.site.site_title = 'ONG Gabriel admin'
admin.site.index_title = 'Administration'


def build_urlpatterns() -> list[URLPattern | URLResolver]:
    api_v1: list[URLPattern | URLResolver] = []
    if settings.ENVIRONMENT != 'prod':
        api_v1.extend(
            [
                path('schema/', SpectacularAPIView.as_view(), name='schema'),
                path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
            ]
        )
    return [
        path('health', health, name='health'),
        path('django-admin/', admin.site.urls),
        path('api/v1/', include(api_v1)),
    ]


urlpatterns = build_urlpatterns()
