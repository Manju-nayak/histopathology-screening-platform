import os
import cv2
import numpy as np
import torch
from fastapi import HTTPException, status

# Disable OpenCV multi-threading to conserve memory on resource-constrained instances
cv2.setNumThreads(0)

# Supported clinical image formats
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tiff"}

def validate_image_extension(filename: str) -> bool:
    """Verifies if the uploaded file has a valid histopathology image extension."""
    ext = os.path.splitext(filename.lower())[1]
    return ext in ALLOWED_EXTENSIONS

def load_image(file_path: str) -> np.ndarray:
    """Loads an image from a path and converts it to RGB format using OpenCV."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image not found at path: {file_path}")
        
        # Load image via OpenCV in BGR format
        image = cv2.imread(file_path)
        if image is None:
            raise ValueError("OpenCV failed to read the image file. It may be corrupt.")
            
        # Convert BGR to RGB channel order
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_rgb
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to load image safely via OpenCV: {str(e)}"
        )

def preprocess_image(image: np.ndarray) -> torch.Tensor:
    """Preprocesses a NumPy image array using OpenCV and NumPy for cleaning, resizing, and normalizing."""
    try:
        # 1. Remove high-frequency scanner/dust noise using Gaussian Blur
        cleaned = cv2.GaussianBlur(image, (3, 3), 0)
        
        # 2. Resize input slide to ResNet50 expectation: 224x224 pixels
        resized = cv2.resize(cleaned, (224, 224), interpolation=cv2.INTER_LINEAR)
        
        # 3. Normalize: Scale pixel values to [0.0, 1.0] and apply standard ImageNet mean/std
        normalized = resized.astype(np.float32) / 255.0
        
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        normalized = (normalized - mean) / std
        
        # 4. Transpose layout from HWC (Height, Width, Channels) to CHW (Channels, Height, Width)
        transposed = np.transpose(normalized, (2, 0, 1))
        
        # 5. Convert to PyTorch Tensor and add batch dimension (1, 3, 224, 224)
        tensor = torch.from_numpy(transposed).unsqueeze(0)
        return tensor
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Preprocessing failed: {str(e)}"
        )
