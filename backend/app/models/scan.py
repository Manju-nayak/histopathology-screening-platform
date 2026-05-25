from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(500), nullable=False)
    heatmap_path = Column(String(500), nullable=True)
    prediction = Column(String(100), nullable=False)  # "Benign" or "Malignant"
    confidence = Column(Float, nullable=False)        # e.g. 0.92
    model_name = Column(String(100), nullable=False)  # e.g. "ResNet50 + Grad-CAM"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship: Scan belongs to Patient
    patient = relationship("Patient", back_populates="scans")

    # Relationship: One Scan has one Report (1-to-1)
    report = relationship("Report", back_populates="scan", uselist=False, cascade="all, delete-orphan")
