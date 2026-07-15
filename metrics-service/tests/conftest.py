import os

# Settings.from_env() runs at import time in src.app; give it harmless
# defaults so tests don't need a real backend/DB just to import the app.
os.environ.setdefault("BACKEND_URL", "http://localhost:3000")
os.environ.setdefault("METRICS_WEBHOOK_SECRET", "test-secret")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_NAME", "trading_test")
