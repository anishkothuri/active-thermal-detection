import * as ort from 'onnxruntime-web/wasm';

const ORT_VERSION = '1.27.0';
ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

const MODEL_URL = `${import.meta.env.BASE_URL}model/best.onnx`;
const INPUT_SIZE = 640;
const CLASS_NAMES = ['Animal', 'Body', 'Eye', 'Face', 'Rectum'];
const IOU_THRESHOLD = 0.45;

let sessionPromise = null;

function getSession() {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'] });
  }
  return sessionPromise;
}

function letterbox(source, origW, origH) {
  const scale = Math.min(INPUT_SIZE / origW, INPUT_SIZE / origH);
  const newW = Math.round(origW * scale);
  const newH = Math.round(origH * scale);
  const padX = Math.floor((INPUT_SIZE - newW) / 2);
  const padY = Math.floor((INPUT_SIZE - newH) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(114,114,114)';
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  ctx.drawImage(source, 0, 0, origW, origH, padX, padY, newW, newH);

  const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
  const area = INPUT_SIZE * INPUT_SIZE;
  const chw = new Float32Array(3 * area);
  for (let i = 0; i < area; i++) {
    chw[i] = imageData[i * 4] / 255;
    chw[area + i] = imageData[i * 4 + 1] / 255;
    chw[2 * area + i] = imageData[i * 4 + 2] / 255;
  }

  return { tensor: new ort.Tensor('float32', chw, [1, 3, INPUT_SIZE, INPUT_SIZE]), scale, padX, padY };
}

function iou(a, b) {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[2], b[2]);
  const y2 = Math.min(a[3], b[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = (a[2] - a[0]) * (a[3] - a[1]);
  const areaB = (b[2] - b[0]) * (b[3] - b[1]);
  return inter / (areaA + areaB - inter);
}

function nms(boxes, scores) {
  const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
  const suppressed = new Set();
  const keep = [];
  for (const i of order) {
    if (suppressed.has(i)) continue;
    keep.push(i);
    for (const j of order) {
      if (j === i || suppressed.has(j)) continue;
      if (iou(boxes[i], boxes[j]) > IOU_THRESHOLD) suppressed.add(j);
    }
  }
  return keep;
}

async function runOnSource(source, origW, origH, confThreshold) {
  const session = await getSession();
  const { tensor, scale, padX, padY } = letterbox(source, origW, origH);
  const feeds = { [session.inputNames[0]]: tensor };
  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];
  const data = output.data;
  const numAttrs = output.dims[1];
  const numAnchors = output.dims[2];
  const numClasses = numAttrs - 4;

  const boxes = [];
  const scores = [];
  const classIds = [];

  for (let a = 0; a < numAnchors; a++) {
    let bestScore = 0;
    let bestClass = -1;
    for (let c = 0; c < numClasses; c++) {
      const s = data[(4 + c) * numAnchors + a];
      if (s > bestScore) { bestScore = s; bestClass = c; }
    }
    if (bestScore < confThreshold) continue;

    const cx = data[a];
    const cy = data[numAnchors + a];
    const w = data[2 * numAnchors + a];
    const h = data[3 * numAnchors + a];

    const x1 = (cx - w / 2 - padX) / scale;
    const y1 = (cy - h / 2 - padY) / scale;
    const x2 = (cx + w / 2 - padX) / scale;
    const y2 = (cy + h / 2 - padY) / scale;

    boxes.push([x1, y1, x2, y2]);
    scores.push(bestScore);
    classIds.push(bestClass);
  }

  const keep = nms(boxes, scores);
  return keep.map((i) => ({
    class_id: classIds[i],
    class_name: CLASS_NAMES[classIds[i]],
    confidence: Math.round(scores[i] * 10000) / 10000,
    bbox: boxes[i].map((v) => Math.round(Math.max(0, v))),
  }));
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function detectImageOnnx(file, confThreshold = 0.25) {
  const img = await loadImageElement(file);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;
  const detections = await runOnSource(img, origW, origH, confThreshold);
  URL.revokeObjectURL(img.src);
  return {
    detections,
    image_width: origW,
    image_height: origH,
    is_custom_model: true,
    note: null,
  };
}

const VIDEO_TARGET_FPS = 3;

function loadVideoElement(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    // Chrome only decodes frames reliably for video elements attached to
    // the document, so keep this one in the DOM but visually hidden.
    video.style.position = 'fixed';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);

    video.onloadeddata = () => resolve(video);
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

function seekVideo(video, t) {
  if (Math.abs(video.currentTime - t) < 0.001 && video.readyState >= 2) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('seeked', finish);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, 3000);
    video.addEventListener('seeked', finish);
    video.currentTime = t;
  });
}

export async function detectVideoOnnx(file, confThreshold = 0.25, onProgress) {
  const video = await loadVideoElement(file);
  const origW = video.videoWidth;
  const origH = video.videoHeight;
  const duration = video.duration;
  const step = 1 / VIDEO_TARGET_FPS;
  const timestamps = [];
  for (let t = 0; t < duration; t += step) timestamps.push(t);

  const frames = [];
  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i];
    await seekVideo(video, t);
    const detections = await runOnSource(video, origW, origH, confThreshold);
    frames.push({ t: Math.round(t * 1000) / 1000, detections });
    if (onProgress) onProgress(i + 1, timestamps.length);
  }

  URL.revokeObjectURL(video.src);
  video.remove();

  return {
    frames,
    video_width: origW,
    video_height: origH,
    duration: Math.round(duration * 100) / 100,
    source_fps: VIDEO_TARGET_FPS,
    sampled_fps: VIDEO_TARGET_FPS,
    is_custom_model: true,
    note: null,
  };
}
