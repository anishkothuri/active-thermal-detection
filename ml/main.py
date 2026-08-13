from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from inference import run_inference, run_video_inference

app = FastAPI(title="Cattle Thermal Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/detect")
async def detect(
    image: UploadFile = File(...),
    conf: float = Query(default=0.25, ge=0.01, le=1.0, description="Confidence threshold"),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    contents = await image.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        result = run_inference(contents, conf_threshold=conf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    return result


@app.post("/detect-video")
async def detect_video(
    video: UploadFile = File(...),
    conf: float = Query(default=0.25, ge=0.01, le=1.0, description="Confidence threshold"),
):
    if not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a video")

    contents = await video.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty video file")

    try:
        result = run_video_inference(contents, conf_threshold=conf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video inference failed: {str(e)}")

    return result
