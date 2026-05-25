import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.ai.preprocess import validate_image_extension

class FileService:
    @staticmethod
    def initialize_directories() -> None:
        """Ensures that all storage directories (uploads/, heatmaps/, reports/) are initialized."""
        settings.upload_dir_path.mkdir(parents=True, exist_ok=True)
        settings.heatmap_dir_path.mkdir(parents=True, exist_ok=True)
        settings.report_dir_path.mkdir(parents=True, exist_ok=True)

    @staticmethod
    async def save_uploaded_file(file: UploadFile) -> str:
        """Validates the file format, resolves paths, generates a unique secure filename, and streams it to uploads/."""
        # Ensure workspace directories are prepared
        FileService.initialize_directories()

        # 1. Verify file extension matches permitted biopsy images
        if not validate_image_extension(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Supported extensions are: PNG, JPG, JPEG, TIFF."
            )

        # 2. Extract extension and create a secure non-guessable unique UUID name
        _, ext = os.path.splitext(file.filename.lower())
        secure_filename = f"{uuid.uuid4().hex}{ext}"

        # 3. Form final save path
        save_path = settings.upload_dir_path / secure_filename

        # 4. Stream write file in 1MB chunks to handle larger slide scans efficiently
        try:
            with open(save_path, "wb") as buffer:
                while chunk := await file.read(1024 * 1024):  # 1MB chunk size
                    buffer.write(chunk)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Disk I/O failure while writing uploaded file: {str(e)}"
            )

        return str(save_path)
