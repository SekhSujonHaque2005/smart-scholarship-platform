from typing import List
from models.schemas import StudentProfile, Scholarship, MatchResult

# Income level mapping
INCOME_WEIGHTS = {
    "below_1L": 1.0,
    "1L_3L": 0.85,
    "3L_6L": 0.70,
    "6L_10L": 0.50,
    "above_10L": 0.30
}

def calculate_match_score(
    student: StudentProfile,
    scholarship: Scholarship
) -> tuple[float, List[str]]:
    score = 0.0
    reasons = []
    total_weight = 0.0

    criteria = scholarship.criteriaJson or {}

    # 1. CGPA Score (30% weight)
    if student.cgpa is not None:
        weight = 0.30
        total_weight += weight
        min_cgpa = criteria.get("minCgpa", 0)
        if student.cgpa >= min_cgpa:
            cgpa_score = min(student.cgpa / 10.0, 1.0)
            score += cgpa_score * weight
            if student.cgpa >= 8.0:
                reasons.append(f"Excellent CGPA of {student.cgpa}")
            elif student.cgpa >= 6.0:
                reasons.append(f"Good CGPA of {student.cgpa}")
        else:
            reasons.append(f"CGPA {student.cgpa} below minimum {min_cgpa}")

    # 2. Income Level Score (25% weight)
    if student.incomeLevel:
        weight = 0.25
        total_weight += weight
        income_score = INCOME_WEIGHTS.get(student.incomeLevel, 0.5)
        score += income_score * weight
        if income_score >= 0.7:
            reasons.append("Eligible based on income criteria")

    # 3. Field of Study Match (25% weight)
    if student.fieldOfStudy:
        weight = 0.25
        total_weight += weight
        allowed_fields = criteria.get("allowedFields", [])
        text = f"{scholarship.title} {scholarship.description or ''}".lower()

        if not allowed_fields:
            # Check if field mentioned in scholarship text
            if student.fieldOfStudy.lower() in text:
                score += 1.0 * weight
                reasons.append(f"Strong match for {student.fieldOfStudy}")
            else:
                score += 0.5 * weight
                reasons.append("General scholarship - open to all fields")
        elif isinstance(allowed_fields, list) and student.fieldOfStudy.lower() in [f.lower() for f in allowed_fields]:
            score += 1.0 * weight
            reasons.append(f"Perfect field match: {student.fieldOfStudy}")
        else:
            score += 0.1 * weight

    # 4. Location Match (20% weight)
    if student.location:
        weight = 0.20
        total_weight += weight
        allowed_locations = criteria.get("allowedLocations", [])
        if not allowed_locations:
            score += 0.7 * weight
            reasons.append("Available in your location")
        elif isinstance(allowed_locations, list) and student.location.lower() in [l.lower() for l in allowed_locations]:
            score += 1.0 * weight
            reasons.append(f"Location match: {student.location}")
        else:
            score += 0.2 * weight

    # Normalize score
    if total_weight > 0:
        final_score = float((score / total_weight) * 100.0)
    else:
        final_score = 50.0  # Default 50% if no profile data

    final_val = float(f"{final_score:.1f}")
    return final_val, reasons


def get_matches(
    student: StudentProfile,
    scholarships: List[Scholarship]
) -> List[MatchResult]:
    results = []

    for scholarship in scholarships:
        score, reasons = calculate_match_score(student, scholarship)
        results.append(MatchResult(
            scholarshipId=scholarship.id,
            matchScore=score,
            reasons=reasons
        ))

    # Sort by score descending
    results.sort(key=lambda x: x.matchScore, reverse=True)
    return results
