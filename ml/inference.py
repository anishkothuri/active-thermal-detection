import os
import io
from pathlib import Path
from PIL import Image
from ultralytics import YOLO

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"

CUSTOM_CLASS_NAMES = ["Animal", "Body", "Eye", "Face", "Rectum"]

_model = None
_is_custom = False


def _load_model() -> YOLO:
    global _model, _is_custom
    if _model is not None:
        return _model

    custom = MODELS_DIR / "best.pt"
    if custom.exists():
        print(f"Loading custom trained model: {custom}")
        _model = YOLO(str(custom))
        _is_custom = True
    else:
        print("Loading base yolov8n.pt (COCO pretrained). Train for cattle-specific results.")
        _model = YOLO("yolov8n.pt")
        _is_custom = False

    return _model


def run_inference(image_bytes: bytes, conf_threshold: float = 0.25) -> dict:
    model = _load_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model.predict(image, conf=conf_threshold, verbose=False)

    detections = []
    for result in results:
        for box in result.boxes:
            raw_class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            if _is_custom:
                # Custom model: class IDs map directly to our 5 cattle classes
                class_id = raw_class_id
                class_name = CUSTOM_CLASS_NAMES[class_id] if class_id < len(CUSTOM_CLASS_NAMES) else f"class_{class_id}"
            else:
                # Base COCO model: use the model's own class name (e.g. "cow", "cat")
                class_id = raw_class_id
                class_name = result.names.get(raw_class_id, f"class_{raw_class_id}")

            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": [round(x1), round(y1), round(x2), round(y2)],
            })

    img_w, img_h = image.size
    return {
        "detections": detections,
        "image_width": img_w,
        "image_height": img_h,
        "is_custom_model": _is_custom,
        "note": None if _is_custom else "Using COCO pretrained model. Train on your dataset for cattle-specific classes (Animal, Body, Eye, Face, Rectum).",
    }
