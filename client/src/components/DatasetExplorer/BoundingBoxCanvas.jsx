import { useEffect, useRef } from 'react';
import { CLASSES } from './ClassFilter.jsx';

const CLASS_COLOR = Object.fromEntries(CLASSES.map((c) => [c.id, c.color]));

export default function BoundingBoxCanvas({ annotations, activeClasses, containerWidth, containerHeight }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerWidth || !containerHeight) return;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const filtered = annotations.filter(
      (a) => !activeClasses || activeClasses.size === 0 || activeClasses.has(a.class_id)
    );

    for (const ann of filtered) {
      const color = CLASS_COLOR[ann.class_id] ?? '#ffffff';

      // YOLO normalized (x_center, y_center, w, h) → pixel coords
      const x1 = (ann.x - ann.w / 2) * containerWidth;
      const y1 = (ann.y - ann.h / 2) * containerHeight;
      const bw = ann.w * containerWidth;
      const bh = ann.h * containerHeight;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, bw, bh);

      // Label background
      const label = ann.class_name;
      ctx.font = 'bold 11px sans-serif';
      const tw = ctx.measureText(label).width + 8;
      const th = 16;
      const lx = x1;
      const ly = y1 > th + 2 ? y1 - th - 2 : y1 + 2;

      ctx.fillStyle = color + 'cc';
      ctx.fillRect(lx, ly, tw, th);

      ctx.fillStyle = '#fff';
      ctx.fillText(label, lx + 4, ly + 11);
    }
  }, [annotations, activeClasses, containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
