from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ScanBase(BaseModel):
    patient_id: int = Field(..., description="ID of the patient this scan belongs to")

class ScanResponse(ScanBase):
    id: int
    image_path: str = Field(..., description="Local relative path to original uploaded image")
    heatmap_path: Optional[str] = Field(None, description="Local relative path to Grad-CAM heatmap visualization")
    prediction: str = Field(..., description="Binary classification outcome (Benign or Malignant)")
    confidence: float = Field(..., description="Classification probability score")
    model_name: str = Field(..., description="Signature of the classifier model and configuration used")
    created_at: datetime

    class Config:
        from_attributes = True

class ScanPredictResponse(BaseModel):
    """Specific response payload defined by USER request for predictions."""
    scan_id: int = Field(..., description="Unique ID of the registered scan record")
    prediction: str = Field(..., description="Binary classification (Benign or Malignant)")
    confidence: float = Field(..., description="Inference probability score")
    heatmap_url: str = Field(..., description="Relative path/URL to access generated heatmap")
