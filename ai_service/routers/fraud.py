from fastapi import APIRouter, HTTPException
from ai_service.models.schemas import FraudCheckRequest, FraudCheckResponse
from ai_service.services.fraud_service import check_fraud

router = APIRouter(
    prefix="/fraud",
    tags=["fraud"]
)

@router.post("/check", response_model=FraudCheckResponse)
async def detect_fraud(request: FraudCheckRequest):
    """
    Checks a scholarship application for potential fraud.
    """
    try:
        is_suspicious, risk_score, reasons = check_fraud(request)
        return FraudCheckResponse(
            applicationId=request.applicationId,
            isSuspicious=is_suspicious,
            riskScore=risk_score,
            reasons=reasons
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))