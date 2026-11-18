from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps


def verify_superuser_emails(apps: StateApps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    User = apps.get_model('accounts', 'User')
    EmailAddress = apps.get_model('account', 'EmailAddress')
    for user in User.objects.filter(is_superuser=True).exclude(email=''):
        email = user.email
        current = EmailAddress.objects.filter(user=user, email__iexact=email).first()
        if current is None:
            EmailAddress.objects.filter(user=user).delete()
            EmailAddress.objects.create(user=user, email=email, verified=True, primary=True)
            continue
        current.email = email
        current.verified = True
        current.primary = True
        current.save()
        EmailAddress.objects.filter(user=user).exclude(pk=current.pk).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_create_role_groups'),
        ('account', '0009_emailaddress_unique_primary_email'),
    ]

    operations = [
        migrations.RunPython(verify_superuser_emails, migrations.RunPython.noop),
    ]
