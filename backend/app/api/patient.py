from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse

router = APIRouter()

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Patient:
    """Registers a new patient profile. Access restricted to logged-in users."""
    db_patient = Patient(
        full_name=patient_in.full_name,
        age=patient_in.age,
        gender=patient_in.gender,
        medical_history=patient_in.medical_history,
        doctor_id=current_user.id
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("", response_model=List[PatientResponse])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Patient]:
    """Lists all patient records on the platform. Access restricted to logged-in users."""
    if current_user.role == "admin":
        return db.query(Patient).all()
    return db.query(Patient).filter(Patient.doctor_id == current_user.id).all()

@router.get("/{id}", response_model=PatientResponse)
def get_patient(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Patient:
    """Retrieves a single patient profile by ID. Access restricted to logged-in users."""
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record with ID {id} not found."
        )
    if current_user.role != "admin" and patient.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to view this patient."
        )
    return patient
