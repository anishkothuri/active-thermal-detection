import { useEffect, useRef } from 'react';
import { CLASSES } from '../DatasetExplorer/ClassFilter.jsx';

const CLASS_COLOR = Object.fromEntries(CLASSES.map((c) => [c.id, c.color]));

export default function DetectionResult({ imageUrl, detections, imageWidth, imageHeight }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !detections) return;

    const draw = () => {
      const displayW = img.clientWidth;
      const displayH = img.clientHeight;
      const scaleX = displayW / (imageWidth || img.naturalWidth);
      const scaleY = displayH / (imageHeight || img.naturalHeight);

      canvas.width = displayW;
      canvas.height = displayH;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, displayW, displayH);

      for (const det of detections) {
        const color = CLASS_COLOR[det.class_id] ?? '#ffffff';
        const [x1, y1, x2, y2] = det.bbox;

        const px1 = x1 * scaleX;
        const py1 = y1 * scaleY;
        const pw = (x2 - x1) * scaleX;
        const ph = (y2 - y1) * scaleY;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(px1, py1, pw, ph);

        const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 12px sans-serif';
        const tw = ctx.measureText(label).width + 8;
        const th = 18;
        const lx = px1;
        const ly = py1 > th + 2 ? py1 - th - 2 : py1 + 2;

        ctx.fillStyle = color + 'cc';
        ctx.fillRect(lx, ly, tw, th);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, lx + 4, ly + 13);
      }
    };

    if (img.complete) {
      draw();
    } else {
      img.addEventListener('load', draw);
      return () => img.removeEventListener('load', draw);
    }
  }, [detections, imageWidth, imageHeight]);

  return (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Detection result"
        style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', borderRadius: 8 }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
