import logging
from sqlalchemy.orm import Session
from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.core.security import get_password_hash

# Set up simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """Creates the tables and seeds default users (Admin & Doctor) if they don't already exist."""
    # Ensure tables are created (creates them if they don't exist yet, safe fallback to Alembic)
    Base.metadata.create_all(bind=engine)

    # Seed Admin User
    admin = db.query(User).filter(User.email == "admin@cancerplatform.com").first()
    if not admin:
        admin_user = User(
            full_name="System Administrator",
            email="admin@cancerplatform.com",
            password_hash=get_password_hash("adminpassword"),
            role="admin",
        )
        db.add(admin_user)
        logger.info("Database Seeding: Admin user created successfully (admin@cancerplatform.com).")
    else:
        logger.info("Database Seeding: Admin user already exists.")

    # Seed Doctor User
    doctor = db.query(User).filter(User.email == "doctor@cancerplatform.com").first()
    if not doctor:
        doctor_user = User(
            full_name="Dr. Sarah Connor",
            email="doctor@cancerplatform.com",
            password_hash=get_password_hash("doctorpassword"),
            role="doctor",
        )
        db.add(doctor_user)
        logger.info("Database Seeding: Doctor user created successfully (doctor@cancerplatform.com).")
    else:
        logger.info("Database Seeding: Doctor user already exists.")

    db.commit()

if __name__ == "__main__":
    from app.db.session import SessionLocal
    print("Database Init: Connecting to database...")
    db = SessionLocal()
    try:
        init_db(db)
        print("Database Init: Table creation and default seeding complete!")
    except Exception as e:
        print(f"Database Init CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
