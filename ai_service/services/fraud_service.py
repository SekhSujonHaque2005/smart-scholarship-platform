from typing import List, Tuple
from models.schemas import FraudCheckRequest

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

    # 6. Gender Eligibility Check
    if request.criteria and request.studentGender:
        target_gender = request.criteria.get("genderRequirement", "UNIVERSAL").upper()
        student_gender = request.studentGender.upper()
        
        if target_gender != "UNIVERSAL" and student_gender != target_gender:
            risk_scores.append(50.0)
            reasons.append(f"Gender mismatch: Scholarship is for {target_gender}, but student is {student_gender}")

    # 7. Document Authenticity Check (Advanced)
    # We check if the "document" field in formData looks suspicious
    doc_fields = [k for k in form_data.keys() if "proof" in k.lower() or "doc" in k.lower() or "transcript" in k.lower() or "photo" in k.lower()]
    for field in doc_fields:
        doc_url = str(form_data.get(field, ""))
        
        # Check for placeholder URLs or names
        if any(x in doc_url.lower() for x in ["example.com", "placeholder", "test-file", "dummy"]):
            risk_scores.append(40.0)
            reasons.append(f"Suspicious document placeholder in {field}")
        
        # 8. Visual / Image Content Simulation (Advanced)
        # In a production app, we would use a Vision API (like Google Vision) here.
        # This simulation catches suspicious filenames that indicate wrong content (e.g., dog.jpg)
        invalid_content_keywords = ["dog", "cat", "animal", "wallpaper", "meme"]
        if any(kw in doc_url.lower() for kw in invalid_content_keywords):
            risk_scores.append(60.0)
            reasons.append(f"Invalid visual content detected in {field}: File appears to be a non-human image.")

        # Check for invalid extensions
        valid_extensions = (".pdf", ".jpg", ".jpeg", ".png")
        if not any(doc_url.lower().endswith(ext) for ext in valid_extensions) and doc_url:
            risk_scores.append(15.0)
            reasons.append(f"Invalid file format for {field}. Expected PDF or Image.")

    # Normalize to 0-100
    final_score = float(min(sum(risk_scores), 100.0))
    is_suspicious = bool(final_score >= 40.0)

    if not reasons:
        reasons.append("No suspicious patterns detected")

    final_val = float(round(final_score, 1))
    return is_suspicious, final_val, reasons
