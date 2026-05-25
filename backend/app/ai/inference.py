import torch
import gc
from app.ai.preprocess import load_image, preprocess_image
from app.ai.model_loader import load_model

# Set PyTorch to use 1 CPU thread to avoid thread pool memory overhead
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

# Global cached model variable to avoid disk read overhead on every request
_cached_model = None

def get_model():
    """Retrieves the globally cached model, loading it only if not already initialized."""
    global _cached_model
    if _cached_model is None:
        _cached_model = load_model()
    return _cached_model

def run_inference(image_path: str) -> dict:
    """Runs histopathology tissue classification on the image located at image_path."""
    # 1. Load PIL Image
    image = load_image(image_path)

    # 2. Apply ResNet50 preprocessing and generate 4D Tensor
    tensor = preprocess_image(image)

    # 3. Retrieve model and run forward pass in evaluation mode (no gradients)
    model = get_model()
    with torch.inference_mode():
        outputs = model(tensor)
        # Apply Softmax to convert raw logits to probabilities
        probabilities = torch.softmax(outputs, dim=1)[0]
    
    # 4. Get index of the class with highest probability
    # Index 0 corresponds to "Benign", Index 1 corresponds to "Malignant"
    class_idx = torch.argmax(probabilities).item()
    confidence = probabilities[class_idx].item()

    prediction_label = "Benign" if class_idx == 0 else "Malignant"

    # Explicitly clear variables and invoke garbage collector to free memory immediately
    del tensor
    del outputs
    gc.collect()

    return {
        "prediction": prediction_label,
        "confidence": float(round(confidence, 4))
    }
