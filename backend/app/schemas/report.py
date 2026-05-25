from datetime import datetime
from pydantic import BaseModel, Field

class ReportResponse(BaseModel):
    id: int
    scan_id: int = Field(..., description="ID of the related histopathology scan record")
    report_text: str = Field(..., description="Full clinical report body and disclaimer")
    created_at: datetime

    class Config:
        from_attributes = True
