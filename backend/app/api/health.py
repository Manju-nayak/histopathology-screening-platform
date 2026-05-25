from fastapi import APIRouter

router = APIRouter()

@router.get("", response_model=dict)
def health_check() -> dict:
    """Verifies that the backend API services are responsive."""
    return {"status": "ok"}
