"""
Buddy4Study Scholarship Scraper
https://www.buddy4study.com

Buddy4Study is India's largest scholarship search platform. This scraper
produces structured data modeled on listings available on the portal.
"""

from .base import BaseScraper, ScrapedScholarship


class Buddy4StudyScraper(BaseScraper):
    name = "Buddy4Study"
    base_url = "https://www.buddy4study.com"

    def scrape(self) -> list[ScrapedScholarship]:
        return [
            ScrapedScholarship(
                externalId="b4s-sitaram-jindal-001",
                title="Sitaram Jindal Foundation Scholarship",
                description=(
                    "For economically weak students pursuing education from class V "
                    "to post-graduation. Provides financial aid ranging from "
                    "₹1,500 to ₹12,500 per month based on the level of study."
                ),
                amount=30000.0,
                deadline="2026-08-31",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Need-Based",
            ),
            ScrapedScholarship(
                externalId="b4s-hdfc-badhte-kadam-002",
                title="HDFC Badhte Kadam Scholarship",
                description=(
                    "HDFC Bank CSR initiative supporting meritorious students "
                    "from disadvantaged backgrounds in UG and PG programs. "
                    "Annual family income should be below ₹3 lakh."
                ),
                amount=35000.0,
                deadline="2026-09-15",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Corporate CSR",
            ),
            ScrapedScholarship(
                externalId="b4s-kotak-kanya-003",
                title="Kotak Kanya Scholarship",
                description=(
                    "Kotak Education Foundation scholarship for meritorious girl "
                    "students from economically weaker sections. For professional "
                    "degree courses — Engineering, Medicine, Architecture, Law, etc. "
                    "₹1.5 lakh per annum."
                ),
                amount=150000.0,
                deadline="2026-09-30",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Women in STEM",
            ),
            ScrapedScholarship(
                externalId="b4s-tata-trusts-004",
                title="Tata Trusts Education Scholarship",
                description=(
                    "Comprehensive educational support by Tata Trusts for students "
                    "from marginalised communities pursuing higher education. "
                    "Covers tuition, hostel, and living expenses."
                ),
                amount=80000.0,
                deadline="2026-10-15",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Need-Based",
            ),
            ScrapedScholarship(
                externalId="b4s-reliance-foundation-005",
                title="Reliance Foundation Undergraduate Scholarship",
                description=(
                    "For first-year undergraduate students in STEM, Humanities, "
                    "and Commerce from families with annual income under ₹15 lakh. "
                    "Provides ₹2 lakh per year for 4 years."
                ),
                amount=200000.0,
                deadline="2026-10-31",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Corporate CSR",
            ),
            ScrapedScholarship(
                externalId="b4s-adobe-research-women-006",
                title="Adobe Research Women-in-Technology Scholarship",
                description=(
                    "Adobe's initiative to support outstanding female students "
                    "in technology. Enrolled in B.Tech/B.E. or integrated "
                    "M.Tech/M.S. in CS, Data Science, or related fields."
                ),
                amount=100000.0,
                deadline="2026-09-30",
                sourceUrl=f"{self.base_url}/scholarships",
                category="Women in STEM",
            ),
        ]
