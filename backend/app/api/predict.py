from fastapi import APIRouter, Depends, File, Form, UploadFile, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.services.prediction_service import PredictionService
from app.schemas.scan import ScanPredictResponse
from app.models.patient import Patient

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
    # Verify patient ownership
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record with ID {patient_id} not found."
        )
    if current_user.role != "admin" and patient.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to run AI analysis for this patient."
        )

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
