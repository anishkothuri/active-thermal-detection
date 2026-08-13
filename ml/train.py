"""
Training script for cattle thermal detection using YOLOv8.

Usage:
    python3 train.py [--epochs 50] [--model yolov8n.pt] [--batch 16] [--imgsz 640] [--device mps]

After training, best.pt is automatically copied to ml/models/best.pt.
Restart the ML service to use it.
"""

import argparse
import shutil
from pathlib import Path
from ultralytics import YOLO
import torch

BASE_DIR = Path(__file__).parent
DATA_YAML = BASE_DIR.parent / "dataset" / "data.yaml"


def auto_device():
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "0"
    return "cpu"


def train(epochs: int, model_name: str, batch: int, imgsz: int, device: str, patience: int, run_name: str):
    if not DATA_YAML.exists():
        raise FileNotFoundError(
            f"Dataset config not found at {DATA_YAML}. Run setup.sh first to extract the dataset."
        )

    print(f"Training {model_name} for {epochs} epochs | device={device} | batch={batch} | imgsz={imgsz}")
    model = YOLO(model_name)
    results = model.train(
        data=str(DATA_YAML),
        epochs=epochs,
        batch=batch,
        imgsz=imgsz,
        device=device,
        patience=patience,
        project=str(BASE_DIR / "runs" / "detect"),
        name=run_name,
        exist_ok=True,
        # thermal images are colorized to encode temperature, not scene
        # color, so shrink hue jitter but keep brightness and contrast
        # jitter for camera calibration variance, and lean on geometric
        # augmentation for generalization
        hsv_h=0.0,
        hsv_s=0.5,
        hsv_v=0.4,
        degrees=5.0,
        translate=0.1,
        scale=0.3,
        fliplr=0.5,
        close_mosaic=15,
        cos_lr=True,
    )

    best_weights = BASE_DIR / "runs" / "detect" / run_name / "weights" / "best.pt"
    if best_weights.exists():
        dest = BASE_DIR / "models" / "best.pt"
        dest.parent.mkdir(exist_ok=True)
        shutil.copy(best_weights, dest)
        print(f"\nBest weights copied to {dest}")
        print("Restart the ML service to use your trained model.")
    else:
        print(f"\nTraining complete. Weights in {BASE_DIR}/runs/detect/cattle_thermal/weights/")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 on cattle thermal dataset")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--model", type=str, default="yolov8n.pt")
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", type=str, default=auto_device(),
                        help="Training device: mps, cpu, or 0 for CUDA. Auto detected if omitted.")
    parser.add_argument("--patience", type=int, default=30,
                        help="Stop early after this many epochs with no val improvement.")
    parser.add_argument("--name", type=str, default="cattle_thermal_v2",
                        help="Run name under ml/runs/detect/.")
    args = parser.parse_args()

    train(args.epochs, args.model, args.batch, args.imgsz, args.device, args.patience, args.name)
