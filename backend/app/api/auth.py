from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel, Field

router = APIRouter()

class UserLoginRequest(BaseModel):
    """Payload representing standard JSON login credentials."""
    email: str = Field(..., description="User registered email address")
    password: str = Field(..., description="User plain-text password")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    """Registers a new doctor or admin onto the platform."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The email is already registered on this platform."
        )

    # Hash the user's password using bcrypt
    hashed_password = get_password_hash(user_in.password)

    # Save user record
    db_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post("/login", response_model=Token)
def login(login_credentials: UserLoginRequest, db: Session = Depends(get_db)) -> dict:
    """Authenticates staff credentials and returns a secure JWT bearer token."""
    user = db.query(User).filter(User.email == login_credentials.email).first()
    
    if not user or not verify_password(login_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password credentials."
        )

    # Generate JWT containing user ID, role, and full name
    token = create_access_token(subject=user.id, role=user.role, full_name=user.full_name)
    return {"access_token": token, "token_type": "bearer"}

from app.core.auth import get_current_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Retrieves details of the currently authenticated user."""
    return current_user
