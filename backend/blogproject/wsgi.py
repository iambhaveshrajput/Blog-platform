import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.production_settings')

application = get_wsgi_application()

# Run migrations on startup (needed since Shell is unavailable)
def run_migrations():
    try:
        from django.core.management import call_command
        print("Running migrations...")
        call_command('migrate', '--run-syncdb', verbosity=1)
        print("Migrations complete.")
    except Exception as e:
        print(f"Migration error: {e}")

run_migrations()
