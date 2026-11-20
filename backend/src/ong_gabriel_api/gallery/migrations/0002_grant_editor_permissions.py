from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps

PERMISSIONS = (
    (
        'galleryalbum',
        (
            ('add_galleryalbum', 'Can add gallery album'),
            ('change_galleryalbum', 'Can change gallery album'),
            ('delete_galleryalbum', 'Can delete gallery album'),
            ('view_galleryalbum', 'Can view gallery album'),
        ),
    ),
    (
        'galleryphoto',
        (
            ('add_galleryphoto', 'Can add gallery photo'),
            ('change_galleryphoto', 'Can change gallery photo'),
            ('delete_galleryphoto', 'Can delete gallery photo'),
            ('view_galleryphoto', 'Can view gallery photo'),
        ),
    ),
)


def _gallery_permissions(apps: StateApps) -> list[object]:
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')
    permissions: list[object] = []
    for model, model_permissions in PERMISSIONS:
        content_type, _created = ContentType.objects.get_or_create(app_label='gallery', model=model)
        for codename, name in model_permissions:
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
    editor.permissions.add(*_gallery_permissions(apps))


def revoke_editor_permissions(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    Group = apps.get_model('auth', 'Group')
    editor = Group.objects.get(name='editor')
    editor.permissions.remove(*_gallery_permissions(apps))


class Migration(migrations.Migration):
    dependencies = [
        ('gallery', '0001_initial'),
        ('accounts', '0002_create_role_groups'),
        ('contenttypes', '0002_remove_content_type_name'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(grant_editor_permissions, revoke_editor_permissions),
    ]
