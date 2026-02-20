import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.production_settings')

application = get_wsgi_application()

def run_startup():
    try:
        from django.core.management import call_command
        print("Running migrate...")
        call_command('migrate', verbosity=1)
        print("Running auto_setup...")
        call_command('auto_setup')
        print("Startup complete.")
    except Exception as e:
        print(f"Startup error: {e}")

run_startup()
