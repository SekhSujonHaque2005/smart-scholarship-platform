"""
Sync module — pushes scraped scholarship data to the backend API.
"""

import httpx
from scrapers.base import ScrapedScholarship
from config import SYNC_ENDPOINT, SCRAPER_KEY


def sync_to_backend(scholarships: list[ScrapedScholarship]) -> dict:
    """
    POST scraped scholarships to the backend bulk-sync endpoint.
    Returns the API response as a dict.
    """
    if not SCRAPER_KEY:
        raise RuntimeError(
            "SCRAPER_KEY is not set. Check your backend/.env file."
        )

    payload = {
        "scholarships": [s.model_dump() for s in scholarships]
    }

    headers = {
        "Content-Type": "application/json",
        "x-scraper-key": SCRAPER_KEY,
    }

    response = httpx.post(
        SYNC_ENDPOINT,
        json=payload,
        headers=headers,
        timeout=30.0,
    )

    response.raise_for_status()
    return response.json()
