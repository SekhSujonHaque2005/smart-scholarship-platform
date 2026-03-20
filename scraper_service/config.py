"""Configuration for the scraper service."""

import os
from dotenv import load_dotenv

# Load .env from the backend directory for shared secrets
_backend_env = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
if os.path.exists(_backend_env):
    load_dotenv(_backend_env)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")
SCRAPER_KEY = os.getenv("SCRAPER_KEY", "")
SYNC_ENDPOINT = f"{API_BASE_URL}/api/scraper/sync"
