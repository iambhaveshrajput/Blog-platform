import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import Post, Tag, Comment

class Command(BaseCommand):
    help = 'Auto setup: creates superuser and sample data'

    def handle(self, *args, **kwargs):
        self.create_superuser()
        self.create_sample_data()

    def create_superuser(self):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        email = os.environ.get('ADMIN_EMAIL', 'admin@blog.com')
        password = os.environ.get('ADMIN_PASSWORD', 'Admin@12345')

        if User.objects.filter(username=username).exists():
            # Always reset password in case it changed
            u = User.objects.get(username=username)
            u.set_password(password)
            u.is_staff = True
            u.is_superuser = True
            u.save()
            self.stdout.write(f'Superuser password reset: {username}')
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(f'Superuser created: {username}')

    def create_sample_data(self):
        if Post.objects.exists():
            self.stdout.write('Sample data already exists, skipping.')
            return

        user1, created = User.objects.get_or_create(
            username='john_doe',
            defaults={'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'}
        )
        if created:
            user1.set_password('password123')
            user1.save()

        user2, created = User.objects.get_or_create(
            username='jane_smith',
            defaults={'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Smith'}
        )
        if created:
            user2.set_password('password123')
            user2.save()

        tag_names = ['Python', 'Django', 'React', 'JavaScript', 'Web Development', 'Tutorial']
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)

        posts = [
            {
                'title': 'Getting Started with Django REST Framework',
                'content': '# Django REST Framework\n\nDRF is a powerful toolkit for building Web APIs.',
                'excerpt': 'Learn how to build powerful REST APIs with Django REST Framework.',
                'author': user1,
                'status': 'published',
                'tags_list': [tags[0], tags[1], tags[5]],
            },
            {
                'title': 'React Hooks: A Complete Guide',
                'content': '# React Hooks\n\nHooks changed how we write React apps.',
                'excerpt': 'A complete guide to React Hooks.',
                'author': user2,
                'status': 'published',
                'tags_list': [tags[2], tags[3], tags[5]],
            },
        ]

        for post_data in posts:
            post_tags = post_data.pop('tags_list')
            post, created = Post.objects.get_or_create(
                title=post_data['title'],
                defaults=post_data
            )
            if created:
                post.tags.set(post_tags)
                post.views = 100
                post.save()

        self.stdout.write('Sample data created: john_doe / password123')
