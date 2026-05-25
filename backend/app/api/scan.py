from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.models.scan import Scan
from app.schemas.scan import ScanResponse

router = APIRouter()

@router.get("", response_model=List[ScanResponse])
def list_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Scan]:
    """Retrieves list of all histopathology scan logs. Access restricted to logged-in users."""
    return db.query(Scan).all()

@router.get("/{id}", response_model=ScanResponse)
def get_scan(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Scan:
    """Retrieves a specific scan log by ID. Access restricted to logged-in users."""
    scan = db.query(Scan).filter(Scan.id == id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan log with ID {id} not found."
        )
    return scan
