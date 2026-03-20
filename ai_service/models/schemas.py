from pydantic import BaseModel
from typing import Optional, List

class StudentProfile(BaseModel):
    cgpa: Optional[float] = None
    fieldOfStudy: Optional[str] = None
    incomeLevel: Optional[str] = None
    location: Optional[str] = None

class Scholarship(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    amount: Optional[float] = None
    criteriaJson: Optional[dict] = None

class MatchRequest(BaseModel):
    student: StudentProfile
    scholarships: List[Scholarship]

class MatchResult(BaseModel):
    scholarshipId: str
    matchScore: float
    reasons: List[str]

class MatchResponse(BaseModel):
    matches: List[MatchResult]

class FraudCheckRequest(BaseModel):
    applicationId: str
    studentId: str
    scholarshipId: str
    formData: Optional[dict] = None
    submittedAt: Optional[str] = None

class FraudCheckResponse(BaseModel):
    applicationId: str
    isSuspicious: bool
    riskScore: float
    reasons: List[str]
