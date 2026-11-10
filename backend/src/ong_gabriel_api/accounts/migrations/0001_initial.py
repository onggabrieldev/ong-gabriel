import uuid

import django.core.validators
import django.db.models.functions.text
import django.utils.timezone
from django.db import migrations, models

import ong_gabriel_api.accounts.models
import ong_gabriel_api.accounts.validators


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                (
                    'is_superuser',
                    models.BooleanField(
                        default=False,
                        help_text='Designates that this user has all permissions without explicitly assigning them.',
                        verbose_name='superuser status',
                    ),
                ),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    'username',
                    models.CharField(
                        max_length=32,
                        unique=True,
                        validators=[
                            django.core.validators.MinLengthValidator(3),
                            ong_gabriel_api.accounts.validators.username_charset_validator,
                            ong_gabriel_api.accounts.validators.validate_username_without_at,
                        ],
                    ),
                ),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                (
                    'groups',
                    models.ManyToManyField(
                        blank=True,
                        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
                        related_name='user_set',
                        related_query_name='user',
                        to='auth.group',
                        verbose_name='groups',
                    ),
                ),
                (
                    'user_permissions',
                    models.ManyToManyField(
                        blank=True,
                        help_text='Specific permissions for this user.',
                        related_name='user_set',
                        related_query_name='user',
                        to='auth.permission',
                        verbose_name='user permissions',
                    ),
                ),
            ],
            options={
                'constraints': [
                    models.UniqueConstraint(
                        django.db.models.functions.text.Lower('username'),
                        name='accounts_user_username_lower_uniq',
                    ),
                    models.UniqueConstraint(
                        django.db.models.functions.text.Lower('email'),
                        name='accounts_user_email_lower_uniq',
                    ),
                ],
            },
            managers=[
                ('objects', ong_gabriel_api.accounts.models.UserManager()),
            ],
        ),
    ]
