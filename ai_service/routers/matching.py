from fastapi import APIRouter, HTTPException
from ai_service.models.schemas import MatchRequest, MatchResponse, MatchResult
from ai_service.services.matching_service import get_matches

router = APIRouter(
    prefix="/matching",
    tags=["matching"]
)

@router.post("/", response_model=MatchResponse)
async def match_scholarships(request: MatchRequest):
    """
    Detailed matching for a list of scholarships against a student profile.
    """
    try:
        matches = get_matches(request.student, request.scholarships)
        return MatchResponse(matches=matches)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quick", response_model=MatchResponse)
async def quick_match(request: MatchRequest):
    """
    Quick matching - returns top 5 results.
    """
    try:
        matches = get_matches(request.student, request.scholarships)
        return MatchResponse(matches=matches[:5])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
