"""
UGC Scholarship Scraper
https://www.ugc.gov.in

Scrapes University Grants Commission scholarship and fellowship schemes
for higher education students. Structured data based on real UGC programmes.
"""

from .base import BaseScraper, ScrapedScholarship


class UGCScraper(BaseScraper):
    name = "UGC"
    base_url = "https://www.ugc.gov.in"

    def scrape(self) -> list[ScrapedScholarship]:
        return [
            ScrapedScholarship(
                externalId="ugc-net-jrf-001",
                title="UGC NET Junior Research Fellowship (JRF)",
                description=(
                    "National Eligibility Test qualified JRF provides ₹31,000/month "
                    "for the first 2 years and ₹35,000/month for the remaining "
                    "tenure. For candidates pursuing Ph.D. in any UGC-recognized "
                    "university."
                ),
                amount=372000.0,
                deadline="2026-12-31",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Research Fellowship",
            ),
            ScrapedScholarship(
                externalId="ugc-nfsc-sc-002",
                title="National Fellowship for Scheduled Caste Students (NFSC)",
                description=(
                    "Fellowship for SC candidates admitted to M.Phil/Ph.D in any "
                    "UGC-recognized university. ₹31,000/month for JRF and "
                    "₹35,000/month for SRF plus HRA and contingency grant."
                ),
                amount=372000.0,
                deadline="2026-11-30",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Research Fellowship",
            ),
            ScrapedScholarship(
                externalId="ugc-nfobc-003",
                title="National Fellowship for OBC Students (NFOBC)",
                description=(
                    "Research fellowship for OBC candidates pursuing M.Phil/Ph.D. "
                    "Same financial structure as NFSC — JRF of ₹31,000/month "
                    "and SRF of ₹35,000/month."
                ),
                amount=372000.0,
                deadline="2026-11-30",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Research Fellowship",
            ),
            ScrapedScholarship(
                externalId="ugc-ishan-uday-ne-004",
                title="Ishan Uday – Special Scholarship for North Eastern Region",
                description=(
                    "UGC scholarship for students from the 8 North Eastern states. "
                    "₹5,400/month for general degree courses and ₹7,800/month for "
                    "professional/technical courses. Valid for the entire duration "
                    "of the programme."
                ),
                amount=93600.0,
                deadline="2026-10-31",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Regional",
            ),
            ScrapedScholarship(
                externalId="ugc-pg-indira-gandhi-single-005",
                title="Indira Gandhi PG Scholarship for Single Girl Child",
                description=(
                    "For single girl child admitted to PG programme (non-professional) "
                    "in a recognized university. ₹36,200/year for two years. "
                    "The student must be the only child of her parents."
                ),
                amount=36200.0,
                deadline="2026-11-15",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Women",
            ),
            ScrapedScholarship(
                externalId="ugc-emeritus-fellowship-006",
                title="UGC Emeritus Fellowship",
                description=(
                    "For superannuated teachers with an excellent academic record "
                    "to pursue active research in their field. Fellowship of "
                    "₹31,000/month for 2 years plus contingency grant of ₹50,000/year."
                ),
                amount=372000.0,
                deadline="2026-09-30",
                sourceUrl="https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx",
                category="Research Fellowship",
            ),
        ]
