from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps

PERMISSIONS = (
    ('add_testimonial', 'Can add testimonial'),
    ('change_testimonial', 'Can change testimonial'),
    ('delete_testimonial', 'Can delete testimonial'),
    ('view_testimonial', 'Can view testimonial'),
)


def _testimonial_permissions(apps: StateApps) -> list[object]:
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')
    content_type, _created = ContentType.objects.get_or_create(app_label='testimonials', model='testimonial')
    permissions: list[object] = []
    for codename, name in PERMISSIONS:
        permission, _created = Permission.objects.get_or_create(
            content_type=content_type,
            codename=codename,
            defaults={'name': name},
        )
        permissions.append(permission)
    return permissions


def grant_editor_permissions(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    Group = apps.get_model('auth', 'Group')
    editor = Group.objects.get(name='editor')
    editor.permissions.add(*_testimonial_permissions(apps))


def revoke_editor_permissions(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    Group = apps.get_model('auth', 'Group')
    editor = Group.objects.get(name='editor')
    editor.permissions.remove(*_testimonial_permissions(apps))


class Migration(migrations.Migration):
    dependencies = [
        ('testimonials', '0001_initial'),
        ('accounts', '0002_create_role_groups'),
        ('contenttypes', '0002_remove_content_type_name'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(grant_editor_permissions, revoke_editor_permissions),
    ]
