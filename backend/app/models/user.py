from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="doctor", nullable=False)  # "doctor" or "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patients = relationship("Patient", back_populates="doctor", cascade="all, delete-orphan")
