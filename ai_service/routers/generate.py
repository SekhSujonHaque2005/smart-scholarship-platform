from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.description_service import (
    generate_scholarship_description,
    generate_application_tips,
    generate_review_summary,
    generate_profile_suggestions,
    generate_eligibility_check,
)

router = APIRouter(tags=["generate"])


# ─── Schemas ─────────────────────────────────────────────────────

class GenerateDescriptionRequest(BaseModel):
    title: str
    category: str = ""

class GenerateDescriptionResponse(BaseModel):
    description: str


class GenerateTipsRequest(BaseModel):
    scholarshipTitle: str
    scholarshipDescription: str = ""
    criteria: str = ""
    studentField: str = ""
    studentCgpa: str = ""
    studentLocation: str = ""

class GenerateTipsResponse(BaseModel):
    tips: str


class GenerateReviewRequest(BaseModel):
    studentName: str
    studentField: str = ""
    studentCgpa: str = ""
    studentLocation: str = ""
    scholarshipTitle: str
    scholarshipCriteria: str = ""
    mode: str = "review"  # "review" or "rejection"

class GenerateReviewResponse(BaseModel):
    summary: str


class GenerateProfileSuggestionsRequest(BaseModel):
    name: str
    cgpa: str = ""
    fieldOfStudy: str = ""
    incomeLevel: str = ""
    location: str = ""
    gender: str = ""
    profileStrength: int = 0

class GenerateProfileSuggestionsResponse(BaseModel):
    suggestions: str


class GenerateEligibilityRequest(BaseModel):
    scholarshipTitle: str
    scholarshipCriteria: str = ""
    studentField: str = ""
    studentCgpa: str = ""
    studentLocation: str = ""
    studentIncome: str = ""

class GenerateEligibilityResponse(BaseModel):
    result: str


# ─── Endpoints ───────────────────────────────────────────────────

@router.post("/generate/description", response_model=GenerateDescriptionResponse)
async def api_generate_description(request: GenerateDescriptionRequest):
    """Generate a professional scholarship description."""
    if not request.title or len(request.title.strip()) < 3:
        raise HTTPException(status_code=400, detail="Title must be at least 3 characters")
    try:
        description = await generate_scholarship_description(request.title.strip(), request.category.strip() or "General")
        return GenerateDescriptionResponse(description=description)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/generate/tips", response_model=GenerateTipsResponse)
async def api_generate_tips(request: GenerateTipsRequest):
    """Generate personalized application tips for a student."""
    if not request.scholarshipTitle:
        raise HTTPException(status_code=400, detail="Scholarship title is required")
    try:
        tips = await generate_application_tips(
            scholarship_title=request.scholarshipTitle,
            scholarship_description=request.scholarshipDescription,
            criteria=request.criteria,
            student_field=request.studentField,
            student_cgpa=request.studentCgpa,
            student_location=request.studentLocation,
        )
        return GenerateTipsResponse(tips=tips)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/generate/review-summary", response_model=GenerateReviewResponse)
async def api_generate_review(request: GenerateReviewRequest):
    """Generate an AI review summary or rejection reason for a provider."""
    if not request.scholarshipTitle:
        raise HTTPException(status_code=400, detail="Scholarship title is required")
    try:
        summary = await generate_review_summary(
            student_name=request.studentName,
            student_field=request.studentField,
            student_cgpa=request.studentCgpa,
            student_location=request.studentLocation,
            scholarship_title=request.scholarshipTitle,
            scholarship_criteria=request.scholarshipCriteria,
            mode=request.mode,
        )
        return GenerateReviewResponse(summary=summary)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/generate/profile-suggestions", response_model=GenerateProfileSuggestionsResponse)
async def api_generate_profile_suggestions(request: GenerateProfileSuggestionsRequest):
    """Generate AI profile improvement suggestions for a student."""
    try:
        suggestions = await generate_profile_suggestions(
            name=request.name,
            cgpa=request.cgpa,
            field_of_study=request.fieldOfStudy,
            income_level=request.incomeLevel,
            location=request.location,
            gender=request.gender,
            profile_strength=request.profileStrength,
        )
        return GenerateProfileSuggestionsResponse(suggestions=suggestions)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/generate/eligibility-check", response_model=GenerateEligibilityResponse)
async def api_generate_eligibility_check(request: GenerateEligibilityRequest):
    """Check if a student is eligible for a scholarship using AI."""
    if not request.scholarshipTitle:
        raise HTTPException(status_code=400, detail="Scholarship title is required")
    try:
        result = await generate_eligibility_check(
            scholarship_title=request.scholarshipTitle,
            scholarship_criteria=request.scholarshipCriteria,
            student_field=request.studentField,
            student_cgpa=request.studentCgpa,
            student_location=request.studentLocation,
            student_income=request.studentIncome,
        )
        return GenerateEligibilityResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
