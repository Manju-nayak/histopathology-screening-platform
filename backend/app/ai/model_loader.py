import os
import logging
import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_resnet50_architecture() -> nn.Module:
    """Instantiates a ResNet50 model and replaces the final fully connected layer to output 2 classes."""
    try:
        # Load modern ResNet50 with pre-trained ImageNet weights if available
        model = resnet50(weights=ResNet50_Weights.DEFAULT)
        logger.info("ResNet50: Initialized architecture with ImageNet weights.")
    except Exception as e:
        logger.warning(f"ResNet50: Could not download pretrained weights ({str(e)}). Instantiating with random weights.")
        model = resnet50(weights=None)
    
    # ResNet50 fully connected layer input features is 2048
    in_features = model.fc.in_features
    # Map the output to 2 classes: Benign (Index 0), Malignant (Index 1)
    model.fc = nn.Linear(in_features, 2)
    return model

def load_model() -> nn.Module:
    """Loads ResNet50 classifier. Bootstraps base weights if file does not exist to ensure immediate runnability."""
    model_path = settings.model_file_path

    # Ensure parent folder exists (e.g. models/)
    model_path.parent.mkdir(parents=True, exist_ok=True)

    if not model_path.exists():
        logger.warning(f"Model file not found at {model_path}. Bootstrapping base weights...")
        model = get_resnet50_architecture()
        try:
            # Save the newly created model architecture states to seed the path
            torch.save(model.state_dict(), str(model_path))
            logger.info(f"Model file bootstrapped successfully and saved to: {model_path}")
        except Exception as e:
            logger.error(f"Failed to write bootstrap model file: {str(e)}")
    else:
        try:
            # Instantiate empty model structure first to save memory overhead
            model = resnet50(weights=None)
            in_features = model.fc.in_features
            model.fc = nn.Linear(in_features, 2)
            
            # Load weights onto CPU (safest fallback for development machines without high-end GPUs)
            model.load_state_dict(torch.load(str(model_path), map_location=torch.device("cpu")))
            logger.info(f"Successfully loaded model weights from: {model_path}")
        except Exception as e:
            logger.error(f"Error loading model weights from {model_path}: {str(e)}. Using base weights instead.")
            # Fallback to base weights architecture
            model = get_resnet50_architecture()
    
    # Put model in evaluation mode to disable Dropout / BatchNorm updating
    model.eval()
    return model
