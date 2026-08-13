import { useEffect, useRef, useState, useCallback } from 'react';
import { CLASSES } from '../DatasetExplorer/ClassFilter.jsx';

const CLASS_COLOR = Object.fromEntries(CLASSES.map((c) => [c.id, c.color]));

function frameAt(frames, t) {
  if (frames.length === 0) return null;
  let lo = 0, hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid; else hi = mid - 1;
  }
  return frames[lo];
}

export default function VideoDetectionResult({ videoUrl, frames, videoWidth, videoHeight, onFrameChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displayW = video.clientWidth;
    const displayH = video.clientHeight;
    canvas.width = displayW;
    canvas.height = displayH;
    const scaleX = displayW / (videoWidth || video.videoWidth || 1);
    const scaleY = displayH / (videoHeight || video.videoHeight || 1);

    const frame = frameAt(frames, video.currentTime);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, displayW, displayH);
    if (onFrameChange) onFrameChange(frame);
    if (!frame) return;

    for (const det of frame.detections) {
      const color = CLASS_COLOR[det.class_id] ?? '#ffffff';
      const [x1, y1, x2, y2] = det.bbox;
      const px1 = x1 * scaleX, py1 = y1 * scaleY;
      const pw = (x2 - x1) * scaleX, ph = (y2 - y1) * scaleY;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px1, py1, pw, ph);

      const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 12px sans-serif';
      const tw = ctx.measureText(label).width + 8;
      const th = 18;
      const ly = py1 > th + 2 ? py1 - th - 2 : py1 + 2;
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(px1, ly, tw, th);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, px1 + 4, ly + 13);
    }
  }, [frames, videoWidth, videoHeight, onFrameChange]);

  useEffect(() => {
    const loop = () => { draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div style={{ position: 'relative', display: 'block', width: 'min(560px, 100%)' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={draw}
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, background: '#000' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      {!playing && (
        <div style={{
          position: 'absolute', bottom: 46, left: 8,
          fontSize: 10, padding: '3px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,0.6)', color: '#aaa', fontWeight: 600,
          pointerEvents: 'none',
        }}>
          ▶ press play, boxes track playback
        </div>
      )}
    </div>
  );
}
