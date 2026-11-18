from django.contrib import admin

from ong_gabriel_api.testimonials.models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_published', 'position')
    list_filter = ('is_published',)
    ordering = ('position', 'created_at')
