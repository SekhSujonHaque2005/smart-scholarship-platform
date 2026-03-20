from typing import List, Tuple
from ai_service.models.schemas import FraudCheckRequest

def check_fraud(request: FraudCheckRequest) -> Tuple[bool, float, List[str]]:
    risk_scores: List[float] = [0.0]
    reasons: List[str] = []

    # Ensure formData exists and is a dict
    form_data: dict = request.formData if request.formData is not None else {}

    # 1. Check for suspiciously high income claims with high scholarship amount
    income = form_data.get("annualIncome", 0)
    if isinstance(income, (int, float)) and float(income) > 1000000:
        risk_scores.append(20.0)
        reasons.append("Unusually high income declared")

    # 2. Check for missing required fields
    required_fields = ["name", "email", "phone"]
    missing = [f for f in required_fields if not form_data.get(f)]
    if missing:
        risk_scores.append(float(len(missing) * 10))
        reasons.append(f"Missing required fields: {', '.join(missing)}")

    # 3. Check for duplicate submission patterns
    submission_time = form_data.get("submissionTime", "")
    if submission_time:
        risk_scores.append(5.0)
        reasons.append("Multiple rapid submissions detected")

    # 4. Check for suspicious patterns in text fields
    suspicious_keywords = ["fake", "test", "dummy", "xxx", "aaa"]
    text_fields = ["name", "address", "institution"]
    for field in text_fields:
        raw_val = form_data.get(field, "")
        value = str(raw_val).lower()
        if any(kw in value for kw in suspicious_keywords):
            risk_scores.append(25.0)
            reasons.append(f"Suspicious content in {field}")

    # 5. CGPA validation
    cgpa = form_data.get("cgpa", 0)
    if isinstance(cgpa, (int, float)):
        f_cgpa = float(cgpa)
        if f_cgpa > 10.0 or f_cgpa < 0.0:
            risk_scores.append(30.0)
            reasons.append("Invalid CGPA value")
        elif f_cgpa == 10.0:
            risk_scores.append(10.0)
            reasons.append("Perfect CGPA requires verification")

    # Normalize to 0-100
    final_score = float(min(sum(risk_scores), 100.0))
    is_suspicious = bool(final_score >= 40.0)

    if not reasons:
        reasons.append("No suspicious patterns detected")

    final_val = float(round(final_score, 1))
    return is_suspicious, final_val, reasons
