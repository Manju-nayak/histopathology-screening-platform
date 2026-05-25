import os
import logging
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.services.file_service import FileService
from app.services.report_service import ReportService
from app.ai.inference import run_inference
from app.ai.gradcam import generate_gradcam_overlay
from app.models.scan import Scan
from app.models.patient import Patient
from app.core.config import settings, BASE_DIR

logger = logging.getLogger(__name__)

class PredictionService:
    @staticmethod
    async def process_screening(
        db: Session,
        image_file: UploadFile,
        patient_id: int
    ) -> Scan:
        """Orchestrates image screening pipeline. Runs inference, Grad-CAM, creates DB logs, and saves reports."""
        
        # 1. Enforce that the patient records exist before doing slide processing
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient record with ID {patient_id} does not exist in DB."
            )

        # 2. Store physical file in uploads/
        original_image_path = await FileService.save_uploaded_file(image_file)
        logger.info(f"Screening Pipeline: Original biopsy image written to: {original_image_path}")

        # 3. Perform ResNet50 Binary Cancer Classification
        try:
            classification_result = run_inference(original_image_path)
            prediction = classification_result["prediction"]
            confidence = classification_result["confidence"]
            logger.info(f"Screening Pipeline: Classification complete. Result={prediction}, Conf={confidence}")
        except Exception as e:
            # File cleanup on prediction crash
            if os.path.exists(original_image_path):
                os.remove(original_image_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI Classification Engine encountered an error: {str(e)}"
            )

        # 4. Generate visual Grad-CAM Heatmap overlay
        orig_filename = os.path.basename(original_image_path)
        heatmap_filename = f"heatmap_{orig_filename}"
        heatmap_save_path = settings.heatmap_dir_path / heatmap_filename
        
        # Map labels to indices for backward gradient hooks (Benign=0, Malignant=1)
        target_class_idx = 0 if prediction == "Benign" else 1

        try:
            generate_gradcam_overlay(
                image_path=original_image_path,
                output_path=str(heatmap_save_path),
                target_class_idx=target_class_idx
            )
            logger.info(f"Screening Pipeline: Grad-CAM overlay saved to: {heatmap_save_path}")
        except Exception as e:
            # Clean up original upload
            if os.path.exists(original_image_path):
                os.remove(original_image_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Grad-CAM Heatmap generator encountered an error: {str(e)}"
            )

        # 5. Calculate database-friendly relative paths for API/frontend integration
        # Relative to backend/ root directory
        rel_image_path = os.path.relpath(original_image_path, start=BASE_DIR)
        rel_heatmap_path = os.path.relpath(str(heatmap_save_path), start=BASE_DIR)

        # Ensure standard forward-slashes for database portability
        rel_image_path = rel_image_path.replace("\\", "/")
        rel_heatmap_path = rel_heatmap_path.replace("\\", "/")

        # 6. Save Scan history
        db_scan = Scan(
            patient_id=patient_id,
            image_path=rel_image_path,
            heatmap_path=rel_heatmap_path,
            prediction=prediction,
            confidence=confidence,
            model_name="ResNet50 + Grad-CAM"
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)

        # 7. Generate clinical text report file and add DB row
        try:
            ReportService.generate_scan_report(db, db_scan)
            logger.info(f"Screening Pipeline: Diagnostic report successfully written.")
        except Exception as e:
            logger.error(f"Screening Pipeline: Report generation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inference complete, but clinical report generation failed: {str(e)}"
            )

        return db_scan
