import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Get the base directory (the 'backend/' folder)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/cancer_db"
    )

    # Security
    SECRET_KEY: str = Field(
        default="9a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z_super_secret_for_development"
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # AI Model & Local Directories
    MODEL_PATH: str = Field(default="models/cancer_model.pth")
    PRELOAD_MODEL: bool = Field(default=True)
    UPLOAD_DIR: str = Field(default="uploads")
    HEATMAP_DIR: str = Field(default="heatmaps")
    REPORT_DIR: str = Field(default="reports")

    # Server Address
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    @property
    def model_file_path(self) -> Path:
        """Returns absolute path to models/cancer_model.pth"""
        path = Path(self.MODEL_PATH)
        if path.is_absolute():
            return path
        return BASE_DIR / path

    @property
    def upload_dir_path(self) -> Path:
        """Returns absolute path to uploads/"""
        path = Path(self.UPLOAD_DIR)
        if path.is_absolute():
            return path
        return BASE_DIR / path

    @property
    def heatmap_dir_path(self) -> Path:
        """Returns absolute path to heatmaps/"""
        path = Path(self.HEATMAP_DIR)
        if path.is_absolute():
            return path
        return BASE_DIR / path

    @property
    def report_dir_path(self) -> Path:
        """Returns absolute path to reports/"""
        path = Path(self.REPORT_DIR)
        if path.is_absolute():
            return path
        return BASE_DIR / path

settings = Settings()
