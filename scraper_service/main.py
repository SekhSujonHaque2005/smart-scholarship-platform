"""
Scholarship Scraper — Entry Point

Usage:
    python main.py --dry-run     # Print scraped data to stdout (no API calls)
    python main.py --live        # Scrape and push to backend API
    python main.py --source nsp  # Run only a specific scraper
"""

import argparse
import json
import sys
from datetime import datetime

from scrapers import ALL_SCRAPERS
from scrapers.base import ScrapedScholarship


def get_scraper_by_name(name: str):
    """Find a specific scraper class by its name (case-insensitive)."""
    for scraper_cls in ALL_SCRAPERS:
        if scraper_cls.name.lower() == name.lower():
            return scraper_cls
    return None


def run_scrapers(source: str | None = None) -> list[ScrapedScholarship]:
    """Run all (or a specific) scraper and return combined results."""
    results: list[ScrapedScholarship] = []

    if source:
        scraper_cls = get_scraper_by_name(source)
        if not scraper_cls:
            print(f"❌ Unknown source: '{source}'")
            print(f"   Available: {', '.join(s.name for s in ALL_SCRAPERS)}")
            sys.exit(1)
        scrapers_to_run = [scraper_cls]
    else:
        scrapers_to_run = ALL_SCRAPERS

    for scraper_cls in scrapers_to_run:
        scraper = scraper_cls()
        print(f"🔍 Scraping {scraper.name} ({scraper.base_url})...")
        try:
            items = scraper.scrape()
            results.extend(items)
            print(f"   ✅ Found {len(items)} scholarships")
        except Exception as e:
            print(f"   ❌ Error: {e}")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="ScholarHub Scholarship Scraper"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print scraped data to stdout without pushing to API",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Scrape and push data to the backend API",
    )
    parser.add_argument(
        "--source",
        type=str,
        default=None,
        help="Run a specific scraper (nsp, aicte, buddy4study, ugc)",
    )
    args = parser.parse_args()

    if not args.dry_run and not args.live:
        parser.print_help()
        print("\n⚠️  Please specify --dry-run or --live")
        sys.exit(1)

    print("=" * 60)
    print("  ScholarHub Scholarship Scraper")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'LIVE SYNC'}")
    print(f"  Time: {datetime.now().isoformat()}")
    print("=" * 60)
    print()

    scholarships = run_scrapers(source=args.source)

    if not scholarships:
        print("\n⚠️  No scholarships scraped.")
        sys.exit(0)

    print(f"\n📊 Total scholarships scraped: {len(scholarships)}")

    if args.dry_run:
        print("\n--- DRY RUN OUTPUT (JSON) ---\n")
        output = [s.model_dump() for s in scholarships]
        print(json.dumps(output, indent=2, default=str))
        print(f"\n✅ Dry run complete. {len(scholarships)} scholarships ready.")
    else:
        print("\n🚀 Pushing to backend API...")
        try:
            from sync import sync_to_backend
            result = sync_to_backend(scholarships)
            print(f"\n✅ Sync complete!")
            print(f"   Response: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"\n❌ Sync failed: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
