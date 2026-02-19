"""
Script to create sample users and data for the blog platform
Run this after migrations: python manage.py shell < create_sample_data.py
"""

from django.contrib.auth.models import User
from blog.models import Post, Tag, Comment
from accounts.models import UserProfile

# Create sample users
print("Creating sample users...")

# User 1
user1, created = User.objects.get_or_create(
    username='john_doe',
    defaults={
        'email': 'john@example.com',
        'first_name': 'John',
        'last_name': 'Doe'
    }
)
if created:
    user1.set_password('password123')
    user1.save()
    user1.profile.bio = "Tech enthusiast and blogger. Love writing about web development and AI."
    user1.profile.location = "San Francisco, CA"
    user1.profile.save()

# User 2
user2, created = User.objects.get_or_create(
    username='jane_smith',
    defaults={
        'email': 'jane@example.com',
        'first_name': 'Jane',
        'last_name': 'Smith'
    }
)
if created:
    user2.set_password('password123')
    user2.save()
    user2.profile.bio = "Designer and writer. Sharing thoughts on creativity and design."
    user2.profile.location = "New York, NY"
    user2.profile.save()

# User 3
user3, created = User.objects.get_or_create(
    username='alex_johnson',
    defaults={
        'email': 'alex@example.com',
        'first_name': 'Alex',
        'last_name': 'Johnson'
    }
)
if created:
    user3.set_password('password123')
    user3.save()
    user3.profile.bio = "Full-stack developer. Building cool stuff with Django and React."
    user3.profile.location = "Austin, TX"
    user3.profile.save()

print(f"Created users: {User.objects.count()}")

# Create tags
print("Creating tags...")
tags_data = [
    'Python', 'Django', 'React', 'JavaScript', 'Web Development',
    'Tutorial', 'Tips & Tricks', 'Design', 'AI', 'Machine Learning',
    'Productivity', 'Career', 'Technology', 'Programming'
]

tags = []
for tag_name in tags_data:
    tag, created = Tag.objects.get_or_create(name=tag_name)
    tags.append(tag)

print(f"Created tags: {Tag.objects.count()}")

# Create sample posts
print("Creating sample posts...")

posts_data = [
    {
        'title': 'Getting Started with Django REST Framework',
        'content': '''
# Introduction to Django REST Framework

Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Django. In this tutorial, we'll explore the basics of creating a RESTful API.

## Why Django REST Framework?

- **Serialization**: Easy data transformation
- **Authentication**: Built-in auth classes
- **Viewsets**: Simplified view logic
- **Routers**: Automatic URL routing

## Installation

```python
pip install djangorestframework
```

## Creating Your First API

Let's create a simple API endpoint...

Start by defining your serializers, then create viewsets, and finally configure your URLs. It's that simple!

## Conclusion

Django REST Framework makes API development a breeze. Happy coding!
        ''',
        'author': user1,
        'tags': [tags[0], tags[1], tags[5]],
        'status': 'published',
    },
    {
        'title': 'React Hooks: A Complete Guide',
        'content': '''
# Understanding React Hooks

React Hooks revolutionized how we write React components. Let's dive deep into the most important hooks.

## useState

The most basic hook for managing state:

```javascript
const [count, setCount] = useState(0);
```

## useEffect

For side effects and lifecycle methods:

```javascript
useEffect(() => {
    // Your side effect here
}, [dependencies]);
```

## Custom Hooks

Create your own reusable logic:

```javascript
function useCustomHook() {
    // Your custom logic
}
```

Hooks make React components more readable and maintainable!
        ''',
        'author': user2,
        'tags': [tags[2], tags[3], tags[5]],
        'status': 'published',
    },
    {
        'title': 'Building Full-Stack Applications',
        'content': '''
# Full-Stack Development in 2024

Full-stack development combines frontend and backend skills. Here's what you need to know.

## Frontend Technologies

- React for UI
- Redux for state management
- CSS frameworks like Bootstrap

## Backend Technologies

- Django/Node.js for server
- PostgreSQL/MongoDB for database
- REST/GraphQL for APIs

## DevOps

- Docker for containerization
- CI/CD pipelines
- Cloud deployment (AWS/GCP/Azure)

## Best Practices

1. Write clean, maintainable code
2. Use version control (Git)
3. Test your application
4. Document your code
5. Follow security best practices

The key is to start small and gradually expand your skillset!
        ''',
        'author': user3,
        'tags': [tags[0], tags[2], tags[4]],
        'status': 'published',
    },
    {
        'title': '10 Productivity Tips for Developers',
        'content': '''
# Boost Your Developer Productivity

Here are 10 proven tips to become more productive as a developer.

## 1. Use Keyboard Shortcuts

Master your IDE shortcuts to save time.

## 2. Automate Repetitive Tasks

Write scripts to automate boring stuff.

## 3. Take Regular Breaks

Use the Pomodoro Technique for focused work sessions.

## 4. Learn to Say No

Focus on what matters most.

## 5. Keep Learning

Stay updated with new technologies and best practices.

## 6. Use Version Control

Git should be your best friend.

## 7. Write Documentation

Future you will thank present you.

## 8. Code Reviews

Learn from others and share knowledge.

## 9. Test Your Code

Automated testing saves debugging time.

## 10. Maintain Work-Life Balance

Don't burn out!

Implement these tips gradually and see your productivity soar!
        ''',
        'author': user1,
        'tags': [tags[10], tags[11], tags[12]],
        'status': 'published',
    },
    {
        'title': 'Introduction to Machine Learning with Python',
        'content': '''
# Getting Started with Machine Learning

Machine Learning is transforming technology. Let's explore the basics with Python.

## What is Machine Learning?

ML is about teaching computers to learn from data without explicit programming.

## Types of ML

1. **Supervised Learning**: Learn from labeled data
2. **Unsupervised Learning**: Find patterns in unlabeled data
3. **Reinforcement Learning**: Learn through trial and error

## Essential Libraries

- NumPy for numerical computing
- Pandas for data manipulation
- Scikit-learn for ML algorithms
- TensorFlow/PyTorch for deep learning

## Your First ML Project

```python
from sklearn.linear_model import LinearRegression

# Train your model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)
```

Start with simple projects and gradually tackle complex problems!
        ''',
        'author': user2,
        'tags': [tags[0], tags[8], tags[9]],
        'status': 'published',
    },
]

for post_data in posts_data:
    tags_list = post_data.pop('tags')
    post, created = Post.objects.get_or_create(
        title=post_data['title'],
        defaults=post_data
    )
    if created:
        post.tags.set(tags_list)
        post.views = 150  # Simulate some views
        post.save()

print(f"Created posts: {Post.objects.count()}")

# Create sample comments
print("Creating sample comments...")

posts = Post.objects.all()
if posts.exists():
    post1 = posts[0]
    Comment.objects.get_or_create(
        post=post1,
        author=user2,
        content="Great tutorial! Really helpful for beginners."
    )
    Comment.objects.get_or_create(
        post=post1,
        author=user3,
        content="Thanks for sharing this. DRF is indeed powerful!"
    )

print(f"Created comments: {Comment.objects.count()}")

print("\n✅ Sample data created successfully!")
print("\nSample credentials:")
print("Username: john_doe, Password: password123")
print("Username: jane_smith, Password: password123")
print("Username: alex_johnson, Password: password123")
