# Thermal Image Detection

A full-stack computer vision web application for exploring and running real-time inference on a manually annotated thermal cattle dataset. Fine-tuned YOLOv8 detects across 5 body-part classes specific to cattle thermal imaging.

**Features:**
- **Dataset Explorer** — browse all 2,024 annotated thermal images with class filtering, split selection, and a zoom-enabled image modal
- **Live Detection** — drag-and-drop an image to run server-side YOLOv8 inference and view bounding boxes with confidence scores in real time

---

## Demo

<div align="center">
  <img src="demo.gif" alt="Active Thermal Detection — live demo" width="900" />
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
| Python inference (YOLOv8) | 8001 |

Open [http://localhost:5173](http://localhost:5173) in your browser.

Press `Ctrl+C` to stop all services.
