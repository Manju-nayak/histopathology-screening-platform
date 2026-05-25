from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class UserBase(BaseModel):
    email: str = Field(..., description="Unique email address for platform log in")
    full_name: str = Field(..., min_length=2, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        """Simple self-contained validation for email formatting."""
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email formatting.")
        return value

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    role: Optional[str] = Field("doctor", description="Authorized platform role ('doctor' or 'admin')")

    @field_validator("role")
    @classmethod
    def validate_user_role(cls, value: str) -> str:
        """Restricts staff registration roles to clinical doctors or administrators."""
        allowed = {"doctor", "admin"}
        value = value.strip().lower()
        if value not in allowed:
            raise ValueError("Role must be 'doctor' or 'admin'.")
        return value

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy models directly

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
