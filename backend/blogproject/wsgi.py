import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.settings')

django.setup()

try:
    from django.core.management import call_command
    call_command('auto_setup')
except Exception as e:
    print(f"Auto setup error: {e}")

application = get_wsgi_application()
