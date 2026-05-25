import os
import argparse
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, datasets
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def generate_dummy_dataset(dataset_dir: str, num_samples: int = 40):
    """Utility to generate a dummy local dataset structure for testing the training pipeline."""
    logger.info(f"Generating a mock dataset under: {dataset_dir}")
    for class_name in ["benign", "malignant"]:
        class_path = os.path.join(dataset_dir, class_name)
        os.makedirs(class_path, exist_ok=True)
        # Write small dummy images
        for i in range(num_samples // 2):
            # Pure colors ensure the model easily classifies them, displaying a clean decreasing loss trend
            color = (25, 25, 220) if class_name == "benign" else (220, 25, 25)
            img = Image.new("RGB", (224, 224), color=color)
            img.save(os.path.join(class_path, f"mock_img_{i}.png"))

class EarlyStopping:
    """Early stopping tracker to halt training if validation loss fails to improve."""
    def __init__(self, patience=3, min_delta=0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False

    def __call__(self, val_loss):
        if self.best_loss is None:
            self.best_loss = val_loss
        elif val_loss > self.best_loss - self.min_delta:
            self.counter += 1
            logger.info(f"Early Stopping Monitor: Validation loss did not improve. Counter: {self.counter}/{self.patience}")
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = val_loss
            self.counter = 0

def train_model(
    data_dir: str,
    model_save_path: str,
    epochs: int = 10,
    batch_size: int = 8,
    lr: float = 0.0001,
    use_dummy: bool = False
):
    """Executes the training loop, validates states, applies early stopping, and saves parameters."""
    if use_dummy:
        dummy_dir = os.path.join(data_dir, "mock_breakhis")
        generate_dummy_dataset(dummy_dir)
        data_dir = dummy_dir

    if not os.path.exists(data_dir):
        raise FileNotFoundError(
            f"Dataset directory '{data_dir}' not found. Please provide a valid folder or run with --dummy"
        )

    # 1. Define torchvision transforms for training (with augmentations) and validation
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 2. Ingest Dataset using ImageFolder
    logger.info("Loading histopathology dataset...")
    full_dataset = datasets.ImageFolder(root=data_dir)
    classes = full_dataset.classes
    logger.info(f"Detected classes: {classes}")

    # Set custom transforms for datasets
    # Split: 70% Train, 15% Validation, 15% Test
    total_len = len(full_dataset)
    train_len = int(0.7 * total_len)
    val_len = int(0.15 * total_len)
    test_len = total_len - train_len - val_len

    train_subset, val_subset, test_subset = random_split(
        full_dataset, [train_len, val_len, test_len], generator=torch.Generator().manual_seed(42)
    )

    # Apply transforms individually
    train_subset.dataset.transform = train_transforms
    val_subset.dataset.transform = val_transforms
    test_subset.dataset.transform = val_transforms

    # Create Dataloaders
    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_subset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_subset, batch_size=batch_size, shuffle=False, num_workers=0)

    logger.info(f"Split sizes -> Train: {train_len}, Val: {val_len}, Test: {test_len}")

    # 3. Initialize ResNet50 and modify fc layer
    logger.info("Initializing neural network model...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Utilizing training hardware: {device}")

    try:
        model = resnet50(weights=ResNet50_Weights.DEFAULT)
    except Exception:
        model = resnet50(weights=None)
    
    # Freeze all convolutional base parameters initially for transfer learning
    for param in model.parameters():
        param.requires_grad = False
    
    in_features = model.fc.in_features
    # 2 classes: Benign and Malignant
    model.fc = nn.Linear(in_features, len(classes))
    
    # Only train final layer parameters (explicitly verified)
    for param in model.fc.parameters():
        param.requires_grad = True

    model.to(device)

    # 4. Set Loss and Optimizer
    criterion = nn.CrossEntropyLoss()
    # Optimize ONLY the parameters that require gradients (the newly initialized fc classifier)
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)

    best_val_accuracy = 0.0
    early_stopping = EarlyStopping(patience=3)

    # 5. Training Epoch Loop
    logger.info("Starting training loop...")
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            # Gradient step
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            correct_train += (predicted == labels).sum().item()
            total_train += labels.size(0)

        epoch_train_loss = running_loss / train_len
        epoch_train_acc = (correct_train / total_train) * 100

        # Validation Loop
        model.eval()
        running_val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                running_val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                correct_val += (predicted == labels).sum().item()
                total_val += labels.size(0)

        epoch_val_loss = running_val_loss / val_len
        epoch_val_acc = (correct_val / total_val) * 100

        logger.info(
            f"Epoch [{epoch}/{epochs}] - "
            f"Train Loss: {epoch_train_loss:.4f}, Train Acc: {epoch_train_acc:.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f}, Val Acc: {epoch_val_acc:.2f}%"
        )

        # Check and save if validation accuracy improved
        if epoch_val_acc > best_val_accuracy:
            best_val_accuracy = epoch_val_acc
            os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
            torch.save(model.state_dict(), model_save_path)
            logger.info(f"--> Saved best model weights ({best_val_accuracy:.2f}%) to {model_save_path}")

        # Check Early Stopping threshold
        early_stopping(epoch_val_loss)
        if early_stopping.early_stop:
            logger.warning(f"Early stopping triggered at epoch {epoch}. Training stopped to prevent overfitting.")
            break

    # 6. Final Test Set Evaluation
    logger.info("Evaluating final accuracy on test set...")
    model.eval()
    correct_test = 0
    total_test = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            correct_test += (predicted == labels).sum().item()
            total_test += labels.size(0)

    test_accuracy = (correct_test / total_test) * 100
    logger.info(f"Training Complete! Final Test Accuracy: {test_accuracy:.2f}%")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ResNet50 Classifier on Biopsy Image Folders.")
    parser.add_argument("--data-dir", type=str, default="data/BreakHis", help="Path to Breakhis folder.")
    parser.add_argument("--save-path", type=str, default="models/cancer_model.pth", help="Target model weights file path.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs.")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size.")
    parser.add_argument("--lr", type=float, default=0.0001, help="Learning rate.")
    parser.add_argument("--dummy", action="store_true", help="Generate a mock dataset and train on it to test pipeline.")

    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        model_save_path=args.save_path,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        use_dummy=args.dummy
    )
