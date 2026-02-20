import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.production_settings')

application = get_wsgi_application()

def run_startup():
    try:
        from django.core.management import call_command
        from django.contrib.auth.models import User
        from accounts.models import UserProfile

        print("Running migrate...")
        call_command('migrate', verbosity=1)

        # Fix missing profiles for ALL existing users before auto_setup runs
        print("Fixing missing user profiles...")
        for user in User.objects.all():
            UserProfile.objects.get_or_create(user=user)
        print("Profiles OK.")

        print("Running auto_setup...")
        call_command('auto_setup')
        print("Startup complete.")
    except Exception as e:
        print(f"Startup error: {e}")

run_startup()
