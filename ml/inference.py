import os
import io
import tempfile
from pathlib import Path
import cv2
from PIL import Image
from ultralytics import YOLO

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"

VIDEO_TARGET_FPS = 4

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
        print("Loading base yolov8n.pt, COCO pretrained. Train for cattle specific results.")
        _model = YOLO("yolov8n.pt")
        _is_custom = False

    return _model


def _boxes_to_detections(result) -> list:
    detections = []
    for box in result.boxes:
        raw_class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        if _is_custom:
            class_id = raw_class_id
            class_name = CUSTOM_CLASS_NAMES[class_id] if class_id < len(CUSTOM_CLASS_NAMES) else f"class_{class_id}"
        else:
            class_id = raw_class_id
            class_name = result.names.get(raw_class_id, f"class_{raw_class_id}")

        detections.append({
            "class_id": class_id,
            "class_name": class_name,
            "confidence": round(confidence, 4),
            "bbox": [round(x1), round(y1), round(x2), round(y2)],
        })
    return detections


def run_inference(image_bytes: bytes, conf_threshold: float = 0.25) -> dict:
    model = _load_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model.predict(image, conf=conf_threshold, verbose=False)

    detections = _boxes_to_detections(results[0])

    img_w, img_h = image.size
    return {
        "detections": detections,
        "image_width": img_w,
        "image_height": img_h,
        "is_custom_model": _is_custom,
        "note": None if _is_custom else "Using COCO pretrained model. Train on your dataset for cattle specific classes: Animal, Body, Eye, Face, Rectum.",
    }


def run_video_inference(video_bytes: bytes, conf_threshold: float = 0.25) -> dict:
    model = _load_model()

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        source_fps = cap.get(cv2.CAP_PROP_FPS) or 25
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

        vid_stride = max(1, round(source_fps / VIDEO_TARGET_FPS))
        duration = frame_count / source_fps if source_fps else 0

        frames = []
        stream = model.predict(
            source=tmp_path, conf=conf_threshold, stream=True,
            vid_stride=vid_stride, verbose=False,
        )
        for i, result in enumerate(stream):
            frame_index = i * vid_stride
            frames.append({
                "t": round(frame_index / source_fps, 3) if source_fps else 0,
                "detections": _boxes_to_detections(result),
            })

        return {
            "frames": frames,
            "video_width": width,
            "video_height": height,
            "duration": round(duration, 2),
            "source_fps": round(source_fps, 2),
            "sampled_fps": round(source_fps / vid_stride, 2) if vid_stride else source_fps,
            "is_custom_model": _is_custom,
            "note": None if _is_custom else "Using COCO pretrained model. Train on your dataset for cattle specific classes: Animal, Body, Eye, Face, Rectum.",
        }
    finally:
        os.unlink(tmp_path)
