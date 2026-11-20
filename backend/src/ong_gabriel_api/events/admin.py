from django.contrib import admin

from ong_gabriel_api.events.models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'starts_at', 'event_type', 'location', 'is_published')
    list_filter = ('is_published', 'event_type')
    ordering = ('-starts_at',)
