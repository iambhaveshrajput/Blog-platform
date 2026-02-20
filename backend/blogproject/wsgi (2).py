import os
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.settings')

django.setup()

print("Running makemigrations...")
call_command('makemigrations', 'accounts')
call_command('makemigrations', 'blog')

print("Running migrate...")
call_command('migrate')

def run_setup():
    try:
        from django.contrib.auth.models import User
        from blog.models import Post, Tag, Comment

        admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_pass = os.environ.get('ADMIN_PASSWORD', 'Admin@12345')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@blog.com')

        if not User.objects.filter(username=admin_user).exists():
            User.objects.create_superuser(admin_user, admin_email, admin_pass)
            print("Superuser created: " + admin_user + " / " + admin_pass)
        else:
            print("Superuser already exists")

        if Post.objects.exists():
            print("Sample data already exists")
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

        user3, created = User.objects.get_or_create(
            username='alex_johnson',
            defaults={'email': 'alex@example.com', 'first_name': 'Alex', 'last_name': 'Johnson'}
        )
        if created:
            user3.set_password('password123')
            user3.save()

        tag_names = ['Python', 'Django', 'React', 'JavaScript', 'Web Development',
                     'Tutorial', 'Tips', 'Design', 'AI', 'Machine Learning',
                     'Productivity', 'Career', 'Technology', 'Programming']
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)

        posts = [
            {
                'title': 'Getting Started with Django REST Framework',
                'content': '# Django REST Framework\n\nDRF is a powerful toolkit for building Web APIs.\n\n## Why DRF?\n\n- Easy serialization\n- Built-in authentication\n- Automatic URL routing\n\nDRF makes API development simple and fast!',
                'excerpt': 'Learn how to build powerful REST APIs with Django REST Framework.',
                'author': user1,
                'tag_list': [tags[0], tags[1], tags[5]],
            },
            {
                'title': 'React Hooks: A Complete Guide',
                'content': '# React Hooks\n\nHooks changed how we write React apps.\n\n## useState\n\nManage component state easily.\n\n## useEffect\n\nHandle side effects and API calls.\n\nHooks make components cleaner!',
                'excerpt': 'A complete guide to React Hooks including useState and useEffect.',
                'author': user2,
                'tag_list': [tags[2], tags[3], tags[5]],
            },
            {
                'title': 'Building Full Stack Apps in 2024',
                'content': '# Full Stack Development\n\nFull stack combines frontend and backend skills.\n\n## Frontend\n\n- React for UI\n- Bootstrap for styling\n\n## Backend\n\n- Django for server\n- PostgreSQL for database',
                'excerpt': 'Everything you need to know about building full stack applications.',
                'author': user3,
                'tag_list': [tags[0], tags[2], tags[4]],
            },
            {
                'title': '10 Productivity Tips for Developers',
                'content': '# Developer Productivity\n\n1. Use keyboard shortcuts\n2. Automate repetitive tasks\n3. Take regular breaks\n4. Write documentation\n5. Do code reviews\n6. Write tests\n7. Learn continuously\n8. Maintain work life balance',
                'excerpt': '10 proven tips to become a more productive developer.',
                'author': user1,
                'tag_list': [tags[10], tags[11], tags[12]],
            },
            {
                'title': 'Introduction to Machine Learning with Python',
                'content': '# Machine Learning Basics\n\nML teaches computers to learn from data.\n\n## Types\n\n1. Supervised Learning\n2. Unsupervised Learning\n3. Reinforcement Learning\n\n## Popular Libraries\n\n- NumPy\n- Pandas\n- Scikit-learn',
                'excerpt': 'A beginner friendly introduction to machine learning using Python.',
                'author': user2,
                'tag_list': [tags[0], tags[8], tags[9]],
            },
        ]

        for post_data in posts:
            post_tags = post_data.pop('tag_list')
            post_data['status'] = 'published'
            post, created = Post.objects.get_or_create(
                title=post_data['title'],
                defaults=post_data
            )
            if created:
                post.tags.set(post_tags)
                post.views = 100
                post.save()

        all_posts = Post.objects.all()
        if all_posts.exists():
            Comment.objects.get_or_create(
                post=all_posts[0],
                author=user2,
                defaults={'content': 'Great tutorial! Very helpful.'}
            )

        print("Sample data created successfully!")
        print("Login: john_doe / password123")

    except Exception as e:
        print("Setup error: " + str(e))

run_setup()

application = get_wsgi_application()
