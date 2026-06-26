import { useEffect, useState, useCallback } from 'react';
import BoundingBoxCanvas from './BoundingBoxCanvas.jsx';

export default function ImageModal({ image, activeClasses, onClose }) {
  const [annotations, setAnnotations] = useState([]);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    fetch(`/api/labels/${image.split}/${image.filename}`)
      .then((r) => r.json())
      .then(setAnnotations)
      .catch(() => setAnnotations([]));
  }, [image]);

  const onImgLoad = useCallback((e) => {
    const el = e.currentTarget;
    setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Compute displayed pixel dimensions directly from zoom — no need to measure DOM
  const displayW = naturalSize.w ? Math.round(naturalSize.w * zoom) : 0;
  const displayH = naturalSize.h ? Math.round(naturalSize.h * zoom) : 0;

  const baseName = image.filename.replace(/_png\.rf\..+$/, '').replace(/_/g, ' ');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          width: 'min(960px, 94vw)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{baseName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>
              {image.split} split · {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              {naturalSize.w ? ` · ${naturalSize.w}×${naturalSize.h}px` : ''}
            </div>
          </div>

          {/* Zoom slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Zoom</span>
            <input
              type="range"
              min="1" max="10" step="0.5"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: 120, accentColor: 'var(--accent)' }}
            />
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent-hover)',
              minWidth: 36, textAlign: 'right',
            }}>
              {zoom}×
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 24, lineHeight: 1, padding: '4px 8px', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable image area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 20,
          minHeight: 0,
        }}>
          {/*
            inline-block wrapper ensures the canvas covers exactly the image.
            We set explicit px width/height on the img so displayW/displayH
            match the actual rendered size — no DOM measurement needed.
          */}
          <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0, flexShrink: 0 }}>
            <img
              src={`/api/images/${image.split}/${image.filename}`}
              alt={image.filename}
              onLoad={onImgLoad}
              style={{
                display: 'block',
                width: displayW || 'auto',
                height: displayH || 'auto',
                imageRendering: zoom >= 3 ? 'pixelated' : 'auto',
              }}
            />
            {displayW > 0 && annotations.length > 0 && (
              <BoundingBoxCanvas
                annotations={annotations}
                activeClasses={activeClasses}
                containerWidth={displayW}
                containerHeight={displayH}
              />
            )}
          </div>
        </div>

        {/* Annotations footer */}
        {annotations.length > 0 && (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}>
            {annotations.map((a, i) => (
              <span key={i} style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                background: 'var(--surface2)',
                color: 'var(--text-muted)',
              }}>
                {a.class_name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
