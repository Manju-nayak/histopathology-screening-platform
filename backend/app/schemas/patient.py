from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=125, description="Patient age in years")
    gender: str = Field(..., description="Gender identifier (e.g. Male, Female, Other)")
    medical_history: Optional[str] = Field(None, description="Previous clinical conditions or notes")

    @field_validator("gender")
    @classmethod
    def clean_gender(cls, value: str) -> str:
        """Capitalizes gender names for database uniformity."""
        return value.strip().title()

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
