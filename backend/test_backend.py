import os
import sys
from pathlib import Path
from PIL import Image

# Add current backend folder to python paths
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

def run_pipeline_check():
    print("==========================================================")
    print("      INTEGRATION TEST: AI CLASSIFIER & GRAD-CAM HOOKS")
    print("==========================================================")

    # 1. Generate a mock biopsy slide image
    mock_image_path = BASE_DIR / "temp_test_slide.png"
    print(f"1. Generating mock tissue biopsy slide image at: {mock_image_path}")
    # Draw a colored image matching cellular slides
    img = Image.new("RGB", (300, 300), color=(180, 80, 150))
    img.save(mock_image_path)

    try:
        # 2. Test Image loading and format checks
        from app.ai.preprocess import load_image, preprocess_image, validate_image_extension
        print("2. Testing file validators...")
        is_valid = validate_image_extension(mock_image_path.name)
        print(f"   Is filename extension allowed? {is_valid}")
        assert is_valid, "Extension validation failed"

        print("3. Testing OpenCV BGR-to-RGB conversion loader...")
        cv_img = load_image(str(mock_image_path))
        assert cv_img is not None, "Failed to load OpenCV image"

        # 3. Test OpenCV/NumPy preprocessing
        print("4. Testing OpenCV/NumPy Resize, Gaussian Blur, and ImageNet normalizer...")
        tensor = preprocess_image(cv_img)
        print(f"   Reshaped tensor dimensions (must be 1x3x224x224): {list(tensor.shape)}")
        assert tensor.shape == (1, 3, 224, 224), "Tensor shaping failed"

        # 4. Test ResNet50 architecture remapping & weight loading
        from app.ai.model_loader import load_model
        print("5. Testing Model structure instantiation & weights bootstrapper...")
        model = load_model()
        assert model is not None, "Model loader returned None"

        # 5. Test Inference engine prediction scores
        from app.ai.inference import run_inference
        print("6. Running test inference slide evaluation...")
        metrics = run_inference(str(mock_image_path))
        print(f"   Inference Outcome: Category={metrics['prediction']}, Confidence={metrics['confidence'] * 100:.2f}%")
        assert "prediction" in metrics and "confidence" in metrics, "Missing inference properties"

        # 6. Test Grad-CAM visualizer hooks and blending
        from app.ai.gradcam import generate_gradcam_overlay
        print("7. Testing Grad-CAM backward hook activation maps...")
        test_heatmap_path = BASE_DIR / "heatmaps" / "integration_test_heatmap.png"
        
        target_idx = 0 if metrics["prediction"] == "Benign" else 1
        generate_gradcam_overlay(
            image_path=str(mock_image_path),
            output_path=str(test_heatmap_path),
            target_class_idx=target_idx
        )
        print(f"   Grad-CAM file successfully blended and written to: {test_heatmap_path}")
        assert test_heatmap_path.exists(), "Heatmap image file was not generated"

        print("\n==========================================================")
        print(" SUCCESS: ALL AI PIPELINE AND IMAGING MODULES VERIFIED!")
        print("==========================================================")

    finally:
        # Clean up temporary test file
        if mock_image_path.exists():
            mock_image_path.unlink()
            print("Cleanup: Temporary test biopsy slide removed.")

if __name__ == "__main__":
    run_pipeline_check()
