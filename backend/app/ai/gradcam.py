import os
import cv2
import numpy as np
import torch
from app.ai.preprocess import load_image, preprocess_image
from app.ai.inference import get_model

class GradCAM:
    """Helper class to register hooks and extract activations and gradients for Grad-CAM."""
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register forward and backward hooks
        self.forward_hook = target_layer.register_forward_hook(self._save_activation)
        self.backward_hook = target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        # grad_output is a tuple containing gradients with respect to output
        self.gradients = grad_output[0].detach()

    def __call__(self, input_tensor, class_idx=None):
        self.gradients = None
        self.activations = None

        # Run forward pass
        output = self.model(input_tensor)
        
        if class_idx is None:
            class_idx = torch.argmax(output, dim=1).item()

        # Zero gradients, compute loss relative to predicted class score, and run backward pass
        self.model.zero_grad()
        score = output[0, class_idx]
        score.backward()

        # Compute weights: spatial global average pooling of gradients
        # Shape of self.gradients: [1, 2048, 7, 7] for standard ResNet50
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True) # [1, 2048, 1, 1]

        # Compute weighted sum of spatial feature maps (activations)
        cam = torch.sum(weights * self.activations, dim=1).squeeze(0) # [7, 7]

        # Apply ReLU to keep only features that positively influence the selected class
        cam = torch.clamp(cam, min=0)

        # Normalize between 0 and 1
        cam_max = cam.max().item()
        if cam_max > 0:
            cam = cam / cam_max

        return cam.cpu().numpy()

    def release(self):
        """Removes the hooks from the model layers. Crucial to prevent memory leaks."""
        self.forward_hook.remove()
        self.backward_hook.remove()

def generate_gradcam_overlay(image_path: str, output_path: str, target_class_idx: int = None) -> str:
    """Generates a Grad-CAM heatmap overlay on top of the original histopathology image."""
    model = get_model()
    
    # In ResNet50, the last convolutional layer is model.layer4[-1]
    target_layer = model.layer4[-1]
    
    # Ensure gradients are enabled for the parameters we are hooking
    for param in model.parameters():
        param.requires_grad = True
    
    # Load and preprocess image into a PyTorch tensor
    image = load_image(image_path)
    tensor = preprocess_image(image)
    
    # Initialize extractor
    cam_extractor = GradCAM(model, target_layer)
    
    try:
        # Run inference and backward pass with gradients explicitly enabled
        with torch.enable_grad():
            cam = cam_extractor(tensor, class_idx=target_class_idx)
    except Exception as e:
        raise RuntimeError(f"Grad-CAM generation failed during PyTorch backward pass: {str(e)}")
    finally:
        # Make sure hooks are always removed, even if prediction fails
        cam_extractor.release()
    
    # Load original image using OpenCV for colormap overlay
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        # If OpenCV fails, convert the Pillow loaded image to standard BGR
        img_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
    h, w, _ = img_bgr.shape
    
    # Resize the low-resolution 7x7 heatmap back to the original image dimensions
    heatmap = cv2.resize(cam, (w, h))
    
    # Convert normalized heatmap [0, 1] to uint8 [0, 255]
    heatmap_uint8 = np.uint8(255 * heatmap)
    
    # Apply JET colormap (Red represents high activation, Blue represents low activation)
    colored_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # Blend the original image and heatmap (40% heatmap color + 60% original image)
    alpha = 0.4
    overlay_image = cv2.addWeighted(colored_heatmap, alpha, img_bgr, 1.0 - alpha, 0)
    
    # Save the composite heatmap to disk
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, overlay_image)
    
    return output_path
