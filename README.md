

# TumorTrace — AI-Based Early Cancer Detection Using Medical Imaging

**An intelligent histopathology analysis platform powered by deep learning**

---

### Team NEXORA

| Member | Role |
|--------|------|
| **Koushik C** | Deep Learning / Model Architecture |
| **Gowtham L** | Backend & API Development |
| **Basavaraj Dhadake** | Data Pipeline & Preprocessing |
| **Manjunath V** | Frontend & Dashboard |

---

## Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Pipeline Stages](#-pipeline-stages)
- [Installation](#-installation)
- [Usage](#-usage)
- [Dataset](#-dataset)
- [Model Performance](#-model-performance)
- [Project Structure](#-project-structure)
- [Feasibility](#-feasibility)
- [Future Scope](#-future-scope)
- [Team](#-team)
- [License](#-license)

---

## Overview

**TumorTrace** is an AI-assisted histopathology analysis platform developed by **Team NEXORA**. It helps pathologists identify suspicious cancer tissue patterns from biopsy images faster and with full explainability — combining the accuracy of deep learning with the transparency required in clinical settings.

> Cancer detected early is cancer defeated. Our platform exists to make early detection accessible, accurate, and explainable.

---

## Problem Statement

Cancer is one of the leading causes of morbidity and mortality in India, with an estimated **1 million new cases** reported annually. An estimated **1 in 9 Indians** will develop cancer in their lifetime.

Early detection dramatically improves treatment outcomes — yet it remains deeply challenging:

- **Volume overload** — Pathologists must manually review thousands of biopsy slides per case
- **Subtle patterns** — Small tumors or abnormal tissue may not be visible to the human eye
- **Human fatigue** — Time-consuming review increases the risk of missed findings
- **Resource gaps** — Rural and underserved areas often lack experienced specialists
- **Delayed diagnosis** — Late-stage detection significantly reduces patient survival rates

---

## Solution

TumorTrace is an end-to-end AI pipeline that:

1. Accepts histopathology biopsy images from pathologists
2. Preprocesses and standardizes images automatically
3. Classifies tissue as **Benign** or **Malignant** using a ResNet50 model
4. Generates **Grad-CAM heatmaps** for visual explainability
5. Stores all results in MongoDB for audit and history tracking
6. Presents everything through a clean **React-based Doctor Dashboard**

---

## Features

| Feature | Description |
|---------|-------------|
| **Image Upload** | Supports JPG, PNG, and TIFF biopsy images |
| **AI Classification** | Benign / Malignant prediction using ResNet50 |
| **Confidence Score** | Probability percentage for each prediction |
| **Grad-CAM Heatmaps** | Visual explanation of AI decision regions |
| **Patient History** | Full scan history stored and retrievable |
| **Report Export** | Downloadable PDF diagnostic reports |
| **Modular Architecture** | Designed to scale with new cancer types and imaging modalities |

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Core application language |
| PyTorch | Deep learning framework |
| ResNet50 | Pre-trained CNN for classification |
| OpenCV | Image preprocessing |
| NumPy | Numerical operations |
| FastAPI | REST API layer |
| Grad-CAM | Explainability heatmap generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | Doctor dashboard UI |
| Axios | API communication |
| Chart.js | Confidence visualization |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Patient records, predictions, scan metadata |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Doctor Dashboard / Portal)                 │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│                    API Gateway                           │
│                     (FastAPI)                            │
└──────┬─────────────────┬──────────────────┬─────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────────┐
│ Auth Service│  │  AI Inference │  │  Report Service │
│             │  │   Engine      │  │  (PDF Export)   │
└─────────────┘  └───────┬───────┘  └─────────────────┘
                         │
              ┌──────────▼──────────┐
              │     ResNet50 Model  │
              │  + Grad-CAM Module  │
              └──────────┬──────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                        PostgreSQL                        │
│         (Patient Records, Predictions, History)          │
└─────────────────────────────────────────────────────────┘

---

## Pipeline Stages

### Stage 1 — Image Upload & Input Validation
The doctor uploads a histopathology biopsy image through the dashboard.

- **Supported formats:** JPG, PNG, TIFF
- **Validation checks:** file format, file size, corruption detection
- **Why:** Ensures only clean, high-quality medical images enter the pipeline

---

### Stage 2 — Image Preprocessing
Before prediction, the image is standardized using Python, OpenCV, and NumPy.

```python
# Preprocessing pipeline
image = cv2.imread(image_path)
image = cv2.resize(image, (224, 224))          # Resize for ResNet50
image = image / 255.0                          # Normalize pixel values
image = reduce_noise(image)                    # Noise reduction
image = enhance_contrast(image)                # Contrast enhancement
```

**Flow:** `Raw Image → Preprocess → Standardized Image`

---

### Stage 3 — AI-Based Cancer Classification
ResNet50 (Transfer Learning) in PyTorch classifies the tissue.

```python
model = models.resnet50(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 2)  # Binary: Benign / Malignant
prediction = model(preprocessed_image)
confidence = torch.softmax(prediction, dim=1)
```

**Why ResNet50:**
- Pre-trained on ImageNet — strong feature extraction
- Stable convergence and fast inference
- Excellent performance on texture and pattern recognition

**Output:** `Benign | Malignant` + `Confidence %`

---

### Stage 4 — Explainable AI (Grad-CAM)
Grad-CAM generates a heatmap overlay showing which regions of the biopsy image influenced the model's prediction.

```python
cam = GradCAM(model=model, target_layers=[model.layer4[-1]])
heatmap = cam(input_tensor=image_tensor)
overlay = apply_heatmap(original_image, heatmap)
```

**Why this matters:**
- Pathologists can verify *why* the AI flagged a region
- Builds clinical trust and supports informed decision-making
- Required for responsible AI deployment in healthcare

---

### Stage 5 — Data Storage & Report Tracking
All results are persisted in PostgreSQL for full traceability.

```sql
-- PostgreSQL schema
CREATE TABLE scan_results (
    id            SERIAL PRIMARY KEY,
    patient_id    VARCHAR(50)    NOT NULL,
    prediction    VARCHAR(20)    NOT NULL,  -- 'Benign' or 'Malignant'
    confidence    NUMERIC(5, 4)  NOT NULL,
    heatmap_path  TEXT,
    created_at    TIMESTAMPTZ    DEFAULT NOW()
);

-- Sample query: fetch latest scans for a patient
SELECT * FROM scan_results
WHERE patient_id = 'PT-20240501-001'
ORDER BY created_at DESC;
```

---

### Stage 6 — Doctor Dashboard
A React-based frontend for pathologists to interact with the full system.

**Capabilities:**
- Upload biopsy images
- View real-time AI prediction and confidence score
- Inspect Grad-CAM heatmap overlay
- Browse patient scan history
- Download PDF diagnostic report

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- CUDA-compatible GPU (recommended)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/nexora-team/tumortrace.git
cd tumortrace

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string, model path, and storage config

# Run the backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### Model Setup

```bash
# Download or place the pre-trained model weights
mkdir -p models/weights
# Place resnet50_cancer_classifier.pth in models/weights/

# Or train from scratch
python train.py --dataset data/breakhis --epochs 30 --batch-size 32
```

---

## Usage

1. Open the dashboard at `http://localhost:3000`
2. Log in with your pathologist credentials
3. Click **Upload Image** and select a biopsy image (JPG / PNG / TIFF)
4. The system validates, preprocesses, and classifies the image automatically
5. View the **prediction**, **confidence score**, and **Grad-CAM heatmap**
6. Save or download the **diagnostic report** as a PDF
7. Access **patient history** from the sidebar at any time

---

## Dataset

This project uses publicly available, labeled histopathology datasets:

| Dataset | Description | Classes |
|---------|-------------|---------|
| [BreakHis](https://web.inf.ufpr.br/vri/databases/breast-cancer-histopathological-database-breakhis/) | Breast cancer histopathological images | Benign / Malignant |
| [PatchCamelyon](https://github.com/basveeling/pcam) | Lymph node cancer patches | Positive / Negative |

> ⚠️ **Note:** These datasets are for research purposes only. Always obtain proper data governance approval before clinical deployment.

---

## 📈 Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | ~92% |
| Precision | ~91% |
| Recall | ~93% |
| F1 Score | ~92% |
| AUC-ROC | ~0.97 |

> Results on BreakHis dataset with ResNet50 transfer learning. Performance may vary by magnification factor and dataset split.

---

## 📂 Project Structure

```
tumortrace/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routes/
│   │   │   ├── predict.py       # Prediction endpoint
│   │   │   ├── history.py       # Patient history endpoint
│   │   │   └── reports.py       # PDF report endpoint
│   │   ├── services/
│   │   │   ├── classifier.py    # ResNet50 inference
│   │   │   ├── gradcam.py       # Grad-CAM heatmap generation
│   │   │   └── preprocessor.py  # Image preprocessing
│   │   └── models/
│   │       └── patient.py       # MongoDB schema
│   ├── train.py                 # Model training script
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── PredictionCard.jsx
│   │   │   ├── HeatmapViewer.jsx
│   │   │   └── HistoryTable.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── PatientDetail.jsx
│   │   └── App.jsx
│   └── package.json
│
├── models/
│   └── weights/
│       └── resnet50_cancer_classifier.pth
│
├── data/
│   └── sample/                  # Sample biopsy images for testing
│
├── docs/
│   └── architecture.png
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Feasibility

| Factor | Approach |
|--------|----------|
| **Focused Scope** | Single histopathology pipeline — no complex CT/MRI/DICOM handling |
| **Simplified Input** | 2D biopsy images (PNG/JPG/TIFF) only |
| **Transfer Learning** | ResNet50 pre-trained on ImageNet — faster training, better reliability |
| **Public Datasets** | BreakHis and PatchCamelyon — no data collection overhead |
| **Controlled MVP** | Core features only: upload, classify, explain, store, report |
| **Modular Design** | New cancer types or imaging modalities can be added without rebuilding |

---

## Future Scope

### Expanded Cancer Coverage
- Multi-cancer support: Breast, Skin, Colon, Brain
- Integration with CT / MRI (Radiology + Pathology workflows)
- DICOM file format support

### Advanced AI Capabilities
- Multi-modal AI combining images with patient clinical data
- Continuous learning from new labeled cases
- Uncertainty quantification for predictions
- Ensemble models for higher accuracy

### Platform & Deployment
- Cloud deployment for global hospital access
- HIPAA / DPDPA compliant data handling
- Real-time analysis with streaming results
- Mobile app for remote pathologist access
- Integration with existing Hospital Information Systems (HIS)

### Real-World Impact
- Early detection support → improved patient survival rates
- Reduced cognitive load on pathologists
- Remote diagnosis capability for rural and underserved regions
- Faster, smarter, and more auditable diagnostic workflows

---

### Output Screenshot

<img width="1022" height="1600" alt="image" src="https://github.com/user-attachments/assets/e1d0d3ef-fb73-4f02-8b58-d8dc4ed2f137" />

<img width="1600" height="770" alt="image" src="https://github.com/user-attachments/assets/2e33dd5b-f7ed-46be-bfa9-fa83b668e8ab" />

<img width="1600" height="755" alt="image" src="https://github.com/user-attachments/assets/b6039820-e790-4c25-8d8a-744a31db5b3f" />

<img width="1456" height="1600" alt="image" src="https://github.com/user-attachments/assets/3d83ec9c-8eec-4a6f-9e65-a4d9772eda64" />

<img width="1600" height="772" alt="image" src="https://github.com/user-attachments/assets/d64383dd-fde8-4fce-b392-97a59298a1b5" />

<img width="1600" height="764" alt="image" src="https://github.com/user-attachments/assets/aea478dd-f066-46a4-b83e-cea11194651a" />






## Team

### Team NEXORA

| | Member | Contribution |
|-|--------|-------------|
| | **Koushik C** | ResNet50 fine-tuning, Grad-CAM integration |
| | **Gowtham L** | Backend API development, system integration, deployment |
| | **Basavaraj Dhadake** | Data pipeline, image preprocessing, dataset preparation |
| | **Manjunath V** | React frontend, dashboard UI/UX, PDF report generation |



---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Disclaimer

This software is intended for **research and educational purposes only**. It is **not a certified medical device** and should not be used as a substitute for professional medical diagnosis. Any clinical use requires appropriate regulatory approval and validation by qualified medical professionals.

---



**Built with ❤️ by Team NEXORA**

*Making early cancer detection smarter, faster, and more accessible.*


