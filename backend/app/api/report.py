from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.models.report import Report
from app.schemas.report import ReportResponse

router = APIRouter()

@router.get("/{id}", response_model=ReportResponse)
def get_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Report:
    """Retrieves a specific diagnostic report by its unique ID. Access restricted to logged-in users."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinical report with ID {id} not found."
        )
    return report

@router.get("/scan/{scan_id}", response_model=ReportResponse)
def get_report_by_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Report:
    """Retrieves the diagnostic report associated with a specific histopathology scan ID. Access restricted to logged-in users."""
    report = db.query(Report).filter(Report.scan_id == scan_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinical report for scan ID {scan_id} not found."
        )
    return report
