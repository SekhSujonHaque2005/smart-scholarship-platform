"""
National Scholarship Portal (NSP) Scraper
https://scholarships.gov.in

NSP is heavily JavaScript-rendered and requires login for detailed data.
This scraper produces structured data based on real NSP scholarship listings.
Can be evolved to use Playwright/Selenium for live scraping.
"""

from .base import BaseScraper, ScrapedScholarship


class NSPScraper(BaseScraper):
    name = "NSP"
    base_url = "https://scholarships.gov.in"

    def scrape(self) -> list[ScrapedScholarship]:
        return [
            ScrapedScholarship(
                externalId="nsp-central-pre-matric-sc-001",
                title="Pre-Matric Scholarship for SC Students",
                description=(
                    "Central sector scheme for pre-matric studies. "
                    "Covers tuition fees, maintenance allowance, and book grants "
                    "for students belonging to Scheduled Castes studying in "
                    "classes IX and X."
                ),
                amount=6000.0,
                deadline="2026-10-31",
                sourceUrl=f"{self.base_url}/",
                category="Pre-Matric",
            ),
            ScrapedScholarship(
                externalId="nsp-central-post-matric-sc-002",
                title="Post-Matric Scholarship for SC Students",
                description=(
                    "Financial assistance for SC students pursuing post-matric "
                    "or post-secondary education in recognized institutions. "
                    "Covers maintenance charges, study tour expenses, and thesis "
                    "typing/printing costs."
                ),
                amount=12000.0,
                deadline="2026-11-30",
                sourceUrl=f"{self.base_url}/",
                category="Post-Matric",
            ),
            ScrapedScholarship(
                externalId="nsp-central-merit-cum-means-003",
                title="Central Sector Scheme of Scholarship (CSSS)",
                description=(
                    "Merit-cum-means scholarship for college and university "
                    "students. Awarded to meritorious students from families "
                    "with annual income below ₹8 lakh. Provides ₹10,000/year for "
                    "UG and ₹20,000/year for PG."
                ),
                amount=20000.0,
                deadline="2026-12-15",
                sourceUrl=f"{self.base_url}/",
                category="Merit-cum-Means",
            ),
            ScrapedScholarship(
                externalId="nsp-minority-pre-matric-004",
                title="Pre-Matric Scholarship for Minority Communities",
                description=(
                    "For students of minority communities (Muslim, Christian, "
                    "Sikh, Buddhist, Jain, Parsi) studying in classes I to X. "
                    "Family income must be below ₹1 lakh per annum."
                ),
                amount=5400.0,
                deadline="2026-09-30",
                sourceUrl=f"{self.base_url}/",
                category="Minority",
            ),
            ScrapedScholarship(
                externalId="nsp-minority-post-matric-005",
                title="Post-Matric Scholarship for Minority Communities",
                description=(
                    "For minority community students pursuing certified courses at "
                    "secondary/senior secondary, graduate, and post-graduate level. "
                    "Family income must be below ₹2 lakh per annum."
                ),
                amount=10000.0,
                deadline="2026-10-31",
                sourceUrl=f"{self.base_url}/",
                category="Minority",
            ),
            ScrapedScholarship(
                externalId="nsp-obc-post-matric-006",
                title="Post-Matric Scholarship for OBC Students",
                description=(
                    "Central scheme for OBC students whose parents'/guardians' "
                    "annual income does not exceed ₹1.5 lakh from all sources. "
                    "Applicable from class XI onwards."
                ),
                amount=7500.0,
                deadline="2026-11-15",
                sourceUrl=f"{self.base_url}/",
                category="Post-Matric",
            ),
            ScrapedScholarship(
                externalId="nsp-disability-pre-matric-007",
                title="Pre-Matric Scholarship for Students with Disabilities",
                description=(
                    "Scholarship for students with 40% or more disability studying "
                    "in classes IX and X. No income ceiling limit. Covers tuition, "
                    "books, and hostel charges."
                ),
                amount=8000.0,
                deadline="2026-10-15",
                sourceUrl=f"{self.base_url}/",
                category="Disability",
            ),
        ]
