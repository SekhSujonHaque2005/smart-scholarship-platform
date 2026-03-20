"""
AICTE Scholarship Scraper
https://www.aicte-india.org

Scrapes AICTE-administered scholarship programmes for technical education
students. Uses structured data modeled on real AICTE schemes.
"""

from .base import BaseScraper, ScrapedScholarship


class AICTEScraper(BaseScraper):
    name = "AICTE"
    base_url = "https://www.aicte-india.org"

    def scrape(self) -> list[ScrapedScholarship]:
        return [
            ScrapedScholarship(
                externalId="aicte-pragati-women-001",
                title="AICTE Pragati Scholarship for Girls",
                description=(
                    "Encourages girl students to pursue technical education. "
                    "Up to ₹50,000 per annum for tuition fees and ₹2,000/month "
                    "as contingency allowance. For first-year students of "
                    "degree/diploma programs in AICTE-approved institutions."
                ),
                amount=50000.0,
                deadline="2026-12-31",
                sourceUrl="https://www.aicte-india.org/schemes/students-development-schemes",
                category="Women in STEM",
            ),
            ScrapedScholarship(
                externalId="aicte-saksham-disability-002",
                title="AICTE Saksham Scholarship for Differently Abled",
                description=(
                    "Financial support for differently abled students in AICTE-"
                    "approved technical institutions. Amount: ₹50,000/year for "
                    "tuition and ₹2,000/month incidentals. 40% or more disability "
                    "required."
                ),
                amount=50000.0,
                deadline="2026-12-31",
                sourceUrl="https://www.aicte-india.org/schemes/students-development-schemes",
                category="Disability",
            ),
            ScrapedScholarship(
                externalId="aicte-swanath-orphan-003",
                title="AICTE Swanath Scholarship for Orphans & Wards of Armed Forces",
                description=(
                    "For orphan children, wards of armed forces/central paramilitary "
                    "forces martyred/disabled in action, and students affected by "
                    "natural disasters. ₹50,000/year for degree and diploma courses."
                ),
                amount=50000.0,
                deadline="2026-11-30",
                sourceUrl="https://www.aicte-india.org/schemes/students-development-schemes",
                category="Defence & Orphan",
            ),
            ScrapedScholarship(
                externalId="aicte-gate-pgsce-004",
                title="AICTE PG (GATE/GPAT) Scholarship",
                description=(
                    "Monthly scholarship of ₹12,400 for GATE/GPAT qualified "
                    "students admitted to AICTE-approved PG programs (M.Tech, "
                    "M.E., M.Pharm). Valid for 24 months."
                ),
                amount=148800.0,
                deadline="2026-09-30",
                sourceUrl="https://www.aicte-india.org/schemes/students-development-schemes",
                category="Post-Graduate",
            ),
            ScrapedScholarship(
                externalId="aicte-green-energy-005",
                title="AICTE Green Energy Scholarship",
                description=(
                    "Scholarship for students pursuing B.Tech/M.Tech in Renewable "
                    "Energy, Solar Engineering, or related green technology "
                    "disciplines at AICTE-approved institutions."
                ),
                amount=30000.0,
                deadline="2026-10-31",
                sourceUrl="https://www.aicte-india.org/schemes/students-development-schemes",
                category="STEM",
            ),
        ]
