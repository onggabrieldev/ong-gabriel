from django.contrib import admin

from ong_gabriel_api.activities.models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'position')
    list_filter = ('is_published',)
    ordering = ('position', 'created_at')
