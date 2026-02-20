import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogproject.settings')

django.setup()

# Auto setup runs every time server starts
try:
    from django.core.management import call_command
    call_command('auto_setup')
except Exception as e:
    print(f"Auto setup error: {e}")

application = get_wsgi_application()
```

**Step 3** — Click **Commit changes**

**Step 4** — Go to Render → **Manual Deploy** → **Deploy latest commit**

---

This bypasses the start command completely. The moment gunicorn starts it will automatically run `auto_setup` which creates the admin, sample users and posts.

Check logs after deploy — you should see:
```
✅ Superuser created: admin / Admin@12345
✅ Sample data created successfully!
