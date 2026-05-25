import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.base import Base # Force load all models (User, Patient, Scan, Report)
from app.db.init_db import init_db
from app.services.file_service import FileService
from app.ai.inference import get_model
from app.api import auth, predict, patient, scan, report, health

# Set up logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages the startup and shutdown lifecycles of the application."""
    logger.info("==========================================================")
    logger.info("        STARTING MEDICAL AI PLATFORM BACKEND SERVICES")
    logger.info("==========================================================")
    
    # 1. Initialize local directory structures (uploads/, heatmaps/, reports/)
    try:
        logger.info("Lifespan: Preparing local file directories...")
        FileService.initialize_directories()
        logger.info("Lifespan: Storage directories are verified and ready.")
    except Exception as e:
        logger.error(f"Lifespan: Failed preparing directories: {str(e)}")

    # 2. Initialize database schema and seed default users
    try:
        logger.info("Lifespan: Initializing database session and seeding default profiles...")
        db = SessionLocal()
        try:
            init_db(db)
            logger.info("Lifespan: Database initialized and seeded successfully.")
        finally:
            db.close()
    except Exception as e:
        logger.critical(f"Lifespan: Critical error initializing database: {str(e)}")

    # 3. Pre-load AI ResNet50 weights to avoid loading overhead on the first /predict request
    try:
        logger.info("Lifespan: Pre-loading ResNet50 classifier model weights...")
        get_model()
        logger.info("Lifespan: AI Model is successfully loaded in RAM and cached.")
    except Exception as e:
        logger.error(f"Lifespan: Failed pre-loading AI weights: {str(e)}")

    logger.info("==========================================================")
    logger.info("        PLATFORM BACKEND API SERVICE IS RUNNING")
    logger.info("==========================================================")
    yield
    logger.info("Shutting down medical AI platform services...")

app = FastAPI(
    title="AI-Assisted Histopathology Cancer Screening Platform",
    description="FastAPI REST Backend for AI-assisted cancer classification and region overlays using ResNet50 + Grad-CAM.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing) for smooth frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development; adjust for production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all standard request methods
    allow_headers=["*"],  # Allows all standard request headers
)

# Register API Routers with standard RESTful paths
app.include_router(health.router, prefix="/health", tags=["System Health"])
app.include_router(auth.router, prefix="/auth", tags=["Security & Authentication"])
app.include_router(patient.router, prefix="/patients", tags=["Patient Profiles"])
app.include_router(predict.router, prefix="/predict", tags=["AI screening"])
app.include_router(scan.router, prefix="/scans", tags=["Inference Logs"])
app.include_router(report.router, prefix="/reports", tags=["Diagnostics Reports"])

# Mount static asset folders to easily serve uploaded images and Grad-CAM heatmaps
# E.g. access heatmap at: http://localhost:8000/heatmaps/heatmap_xxx.png
try:
    # Ensure physical folders exist before mounting
    FileService.initialize_directories()
    app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir_path)), name="uploads")
    app.mount("/heatmaps", StaticFiles(directory=str(settings.heatmap_dir_path)), name="heatmaps")
    logger.info("Static file mounts are active for /uploads and /heatmaps.")
except Exception as e:
    logger.error(f"Failed to mount static file system routes: {str(e)}")

# Reload server to pick up new PyTorch weights

