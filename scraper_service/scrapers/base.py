"""Abstract base class for all scholarship scrapers."""

from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional


class ScrapedScholarship(BaseModel):
    """Standardized schema for a scraped scholarship."""
    externalId: str
    title: str
    description: Optional[str] = None
    amount: Optional[float] = None
    deadline: Optional[str] = None  # ISO 8601 date string
    sourceUrl: str
    category: Optional[str] = None


class BaseScraper(ABC):
    """Abstract base class that all source-specific scrapers must extend."""

    name: str = "BaseScraper"
    base_url: str = ""

    @abstractmethod
    def scrape(self) -> list[ScrapedScholarship]:
        """
        Scrape scholarships from the source and return a list of
        ScrapedScholarship objects.
        """
        ...

    def __repr__(self) -> str:
        return f"<{self.name} scraper>"
