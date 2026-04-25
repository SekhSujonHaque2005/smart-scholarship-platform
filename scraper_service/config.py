"""Configuration for the scraper service."""

import os
from dotenv import load_dotenv

# Load .env from the backend directory for shared secrets
_backend_env = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
if os.path.exists(_backend_env):
    load_dotenv(_backend_env)

# Use environment variables (set in Cloud Run or .env)
# In production, we use the internal localhost address since it's in the same container
API_BASE_URL = os.getenv("API_BASE_URL", f"http://localhost:{os.getenv('PORT', '5000')}")
SCRAPER_KEY = os.getenv("SCRAPER_KEY", "")
SYNC_ENDPOINT = f"{API_BASE_URL}/api/scraper/sync"
