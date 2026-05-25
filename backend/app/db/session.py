from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
from app.core.config import settings

# For PostgreSQL, create an engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # checks if database connection is alive before query execution
    pool_size=10,        # maintaining up to 10 connections in pool
    max_overflow=20      # maximum connections beyond pool size
)

# Thread-safe database session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for mapping models
Base = declarative_base()

def get_db() -> Generator:
    """FastAPI dependency to retrieve db session. Automatically closes session after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
