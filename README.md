# Thermal Image Detection

Live demo: https://anishkothuri.github.io/active-thermal-detection/

A full stack computer vision web application built to explore a full machine learning pipeline: data ingestion, model development, and training statistics. It centers on 2,024 thermal cattle images, captured frame by frame with a real thermal camera and manually annotated across 5 body part classes. A fine tuned YOLOv8 model detects Animal, Body, Eye, Face, and Rectum regions in thermal imagery.

**Features:**
- **Dataset Explorer**: browse all 2,024 annotated thermal images with class filtering, split selection, and a zoom enabled image modal
- **Live Detection**: drop an image or video to run YOLOv8 inference and view bounding boxes with confidence scores in real time
- **Sample gallery**: one click test images and clips, including held out dataset frames, real world research photos, and hand captured video
- **Model Performance**: precision, recall, and mAP pulled directly from the training run, with training curves and a confusion matrix

## Live demo

The deployed version at the link above runs entirely in your browser. The trained model is exported to ONNX and executed client side with onnxruntime web, so detection works with no backend server involved. The dataset explorer is backed by a static index generated at build time. Locally, the same app instead talks to a Node API and a Python FastAPI inference service, described below.

---

## Demo

<div align="center">
  <img src="demo.gif" alt="Active Thermal Detection live demo" width="900" />
</div>

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- `TestAnimal.yolov8.zip` placed in the parent `CattleThermalImageDetection/` folder

### Install

```bash
cd active-thermal-detection
chmod +x setup.sh
./setup.sh
```

### Run

```bash
npm start
```

This starts all three services in parallel:

| Service | Port |
|---|---|
| React frontend | 5173 |
| Node.js API | 3001 |
| Python inference, YOLOv8 | 8001 |

Open [http://localhost:5173](http://localhost:5173) in your browser.

Press `Ctrl+C` to stop all services.

---

## Training

The model is fine tuned from a YOLOv8 nano checkpoint on the annotated dataset.

```bash
cd ml
python3 train.py --epochs 100
```

Best weights are copied to `ml/models/best.pt` automatically. Restart the ML service to pick up a new model.

## Tech stack

React, Vite, Node, Express, FastAPI, PyTorch, Ultralytics YOLOv8, onnxruntime web.
