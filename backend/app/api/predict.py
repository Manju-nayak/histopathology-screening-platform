from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.services.prediction_service import PredictionService
from app.schemas.scan import ScanPredictResponse

router = APIRouter()

@router.post("", response_model=ScanPredictResponse, status_code=status.HTTP_201_CREATED)
async def predict(
    image: UploadFile = File(..., description="Biopsy tissue image (PNG, JPG, JPEG, TIFF)"),
    patient_id: int = Form(..., description="Database ID of the associated patient"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Submits a histopathology biopsy slide for AI analysis.
    Runs validation, saves original image, runs classification, generates Grad-CAM, writes clinical report, and logs history in DB.
    Access restricted to logged-in users.
    """
    db_scan = await PredictionService.process_screening(
        db=db,
        image_file=image,
        patient_id=patient_id
    )

    # Return prediction and visual assets in the structure requested by the USER
    return {
        "scan_id": db_scan.id,
        "prediction": db_scan.prediction,
        "confidence": db_scan.confidence,
        "heatmap_url": db_scan.heatmap_path
    }
