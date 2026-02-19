# Generated migration for adding is_pinned field to Post model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),  # Update this to match your last migration
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='is_pinned',
            field=models.BooleanField(default=False, help_text='Pin this post to the top'),
        ),
        migrations.AlterModelOptions(
            name='post',
            options={'ordering': ['-is_pinned', '-created_at']},
        ),
        migrations.AddIndex(
            model_name='post',
            index=models.Index(fields=['-is_pinned', '-created_at'], name='blog_post_is_pinn_idx'),
        ),
    ]
