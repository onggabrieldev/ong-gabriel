from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps


def create_role_groups(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name='editor')
    Group.objects.get_or_create(name='moderator')


def remove_role_groups(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=('editor', 'moderator')).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_role_groups, remove_role_groups),
    ]
