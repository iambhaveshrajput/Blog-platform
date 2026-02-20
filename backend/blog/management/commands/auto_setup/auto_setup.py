"""
Auto setup command - runs on every deploy
Creates superuser and sample data automatically
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import Post, Tag, Comment
from accounts.models import UserProfile


class Command(BaseCommand):
    help = 'Auto setup: creates superuser and sample data'

    def handle(self, *args, **kwargs):
        self.create_superuser()
        self.create_sample_data()

    def create_superuser(self):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        email = os.environ.get('ADMIN_EMAIL', 'admin@blog.com')
        password = os.environ.get('ADMIN_PASSWORD', 'Admin@12345')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(f'✅ Superuser created: {username} / {password}')
        else:
            self.stdout.write(f'ℹ️ Superuser already exists: {username}')

    def create_sample_data(self):
        if Post.objects.exists():
            self.stdout.write('ℹ️ Sample data already exists, skipping.')
            return

        self.stdout.write('Creating sample data...')

        # Create sample users
        user1, created = User.objects.get_or_create(
            username='john_doe',
            defaults={'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'}
        )
        if created:
            user1.set_password('password123')
            user1.save()
            try:
                user1.profile.bio = "Tech enthusiast and blogger."
                user1.profile.location = "San Francisco, CA"
                user1.profile.save()
            except Exception:
                pass

        user2, created = User.objects.get_or_create(
            username='jane_smith',
            defaults={'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Smith'}
        )
        if created:
            user2.set_password('password123')
            user2.save()
            try:
                user2.profile.bio = "Designer and writer."
                user2.profile.location = "New York, NY"
                user2.profile.save()
            except Exception:
                pass

        user3, created = User.objects.get_or_create(
            username='alex_johnson',
            defaults={'email': 'alex@example.com', 'first_name': 'Alex', 'last_name': 'Johnson'}
        )
        if created:
            user3.set_password('password123')
            user3.save()
            try:
                user3.profile.bio = "Full-stack developer."
                user3.profile.location = "Austin, TX"
                user3.profile.save()
            except Exception:
                pass

        # Create tags
        tags_data = ['Python', 'Django', 'React', 'JavaScript', 'Web Development',
                     'Tutorial', 'Tips & Tricks', 'Design', 'AI', 'Machine Learning',
                     'Productivity', 'Career', 'Technology', 'Programming']
        tags = []
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)

        # Create posts
        posts_data = [
            {
                'title': 'Getting Started with Django REST Framework',
                'content': '# Introduction to Django REST Framework\n\nDjango REST Framework (DRF) is a powerful toolkit for building Web APIs in Django.\n\n## Why Django REST Framework?\n\n- **Serialization**: Easy data transformation\n- **Authentication**: Built-in auth classes\n- **Viewsets**: Simplified view logic\n\n## Installation\n\n```python\npip install djangorestframework\n```\n\nDjango REST Framework makes API development a breeze. Happy coding!',
                'excerpt': 'Learn how to build powerful REST APIs with Django REST Framework.',
                'author': user1,
                'tag_indices': [0, 1, 5],
                'status': 'published',
            },
            {
                'title': 'React Hooks: A Complete Guide',
                'content': '# Understanding React Hooks\n\nReact Hooks revolutionized how we write React components.\n\n## useState\n\n```javascript\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\n```javascript\nuseEffect(() => {\n    // Your side effect here\n}, [dependencies]);\n```\n\nHooks make React components more readable and maintainable!',
                'excerpt': 'A complete guide to React Hooks including useState, useEffect and custom hooks.',
                'author': user2,
                'tag_indices': [2, 3, 5],
                'status': 'published',
            },
            {
                'title': 'Building Full-Stack Applications in 2024',
                'content': '# Full-Stack Development in 2024\n\nFull-stack development combines frontend and backend skills.\n\n## Frontend Technologies\n\n- React for UI\n- Redux for state management\n\n## Backend Technologies\n\n- Django for server\n- PostgreSQL for database\n\n## Best Practices\n\n1. Write clean, maintainable code\n2. Use version control (Git)\n3. Test your application\n\nStart small and gradually expand your skillset!',
                'excerpt': 'Everything you need to know about building full-stack applications.',
                'author': user3,
                'tag_indices': [0, 2, 4],
                'status': 'published',
            },
            {
                'title': '10 Productivity Tips for Developers',
                'content': '# Boost Your Developer Productivity\n\n## 1. Use Keyboard Shortcuts\n\nMaster your IDE shortcuts to save time.\n\n## 2. Automate Repetitive Tasks\n\nWrite scripts to automate boring stuff.\n\n## 3. Take Regular Breaks\n\nUse the Pomodoro Technique for focused work sessions.\n\n## 4. Learn to Say No\n\nFocus on what matters most.\n\n## 5. Keep Learning\n\nStay updated with new technologies.\n\nImplement these tips gradually and see your productivity soar!',
                'excerpt': '10 proven tips to become a more productive developer.',
                'author': user1,
                'tag_indices': [10, 11, 12],
                'status': 'published',
            },
            {
                'title': 'Introduction to Machine Learning with Python',
                'content': '# Getting Started with Machine Learning\n\nMachine Learning is transforming technology.\n\n## Types of ML\n\n1. **Supervised Learning**: Learn from labeled data\n2. **Unsupervised Learning**: Find patterns in unlabeled data\n3. **Reinforcement Learning**: Learn through trial and error\n\n## Your First ML Model\n\n```python\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n```\n\nStart with simple projects and gradually tackle complex problems!',
                'excerpt': 'A beginner friendly introduction to machine learning using Python.',
                'author': user2,
                'tag_indices': [0, 8, 9],
                'status': 'published',
            },
        ]

        for post_data in posts_data:
            tag_indices = post_data.pop('tag_indices')
            post_tags = [tags[i] for i in tag_indices]
            post, created = Post.objects.get_or_create(
                title=post_data['title'],
                defaults=post_data
            )
            if created:
                post.tags.set(post_tags)
                post.views = 150
                post.save()

        # Add sample comments
        posts = Post.objects.all()
        if posts.exists():
            Comment.objects.get_or_create(
                post=posts[0], author=user2,
                defaults={'content': 'Great tutorial! Really helpful for beginners.'}
            )
            Comment.objects.get_or_create(
                post=posts[0], author=user3,
                defaults={'content': 'Thanks for sharing this. DRF is indeed powerful!'}
            )

        self.stdout.write('✅ Sample data created successfully!')
        self.stdout.write('Sample login: john_doe / password123')
