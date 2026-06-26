import { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader.jsx';
import DetectionResult from './DetectionResult.jsx';
import { CLASSES } from '../DatasetExplorer/ClassFilter.jsx';

const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

export default function LiveDetection() {
  const [file, setFile]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [conf, setConf]           = useState(0.25);

  const handleFile = useCallback((f) => {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`/api/detect?conf=${conf}`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Detection failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Live Detection
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 520 }}>
          Upload a thermal cattle image and run inference with the fine-tuned YOLOv8 model trained on this dataset.
        </p>
      </div>

      {/* Controls bar */}
      {file && (
        <div style={{
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
          padding: '14px 20px', marginBottom: 24,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Confidence threshold
            </span>
            <input
              type="range" min="0.05" max="0.95" step="0.05"
              value={conf}
              onChange={(e) => setConf(parseFloat(e.target.value))}
              style={{ width: 130, accentColor: 'var(--accent)' }}
            />
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--accent2)',
              minWidth: 36, background: 'rgba(99,102,241,0.12)',
              padding: '2px 8px', borderRadius: 6,
            }}>
              {Math.round(conf * 100)}%
            </span>
          </div>

          <button
            onClick={handleDetect}
            disabled={loading}
            style={{
              padding: '9px 28px', borderRadius: 9, border: 'none',
              background: loading ? 'var(--surface3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {loading ? <><Spinner />Running…</> : '▶ Run Detection'}
          </button>

          <button
            onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); setError(null); }}
            style={{
              padding: '9px 18px', borderRadius: 9,
              border: '1px solid var(--border2)',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 13, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ↩ New Image
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
          color: '#fca5a5', fontSize: 13,
        }}>
          ⚠ {error}
        </div>
      )}

      {!file ? (
        <ImageUploader onFile={handleFile} />
      ) : (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Image */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              {result ? 'Detection Result' : 'Preview'}
            </div>
            {result ? (
              <DetectionResult
                imageUrl={previewUrl}
                detections={result.detections}
                imageWidth={result.image_width}
                imageHeight={result.image_height}
              />
            ) : (
              <img
                src={previewUrl} alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 12, objectFit: 'contain', border: '1px solid var(--border)' }}
              />
            )}
          </div>

          {/* Results sidebar */}
          {result && (
            <div style={{ flex: '0 0 260px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                Detections ({result.detections.length})
              </div>

              {result.detections.length === 0 ? (
                <div style={{
                  padding: '24px 20px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 13, textAlign: 'center',
                }}>
                  No detections above {Math.round(conf * 100)}% confidence.
                  <br /><br />
                  Try lowering the threshold.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.detections.map((det, i) => {
                    const cls = CLASS_MAP[det.class_id] ?? { color: '#888', bg: 'rgba(128,128,128,0.1)', name: det.class_name };
                    const pct = Math.round(det.confidence * 100);
                    return (
                      <div key={i} style={{
                        padding: '12px 16px', borderRadius: 10,
                        background: 'var(--surface)',
                        border: `1px solid ${cls.color}33`,
                        borderLeft: `3px solid ${cls.color}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: cls.color, fontSize: 14 }}>{det.class_name}</span>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: pct > 70 ? '#34d399' : pct > 40 ? '#fbbf24' : '#f87171',
                          }}>
                            {pct}%
                          </span>
                        </div>
                        {/* Confidence bar */}
                        <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: cls.color,
                            borderRadius: 2, transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meta */}
              <div style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div><span style={{ color: 'var(--text-dim)' }}>Image size</span> {result.image_width}×{result.image_height}px</div>
                <div><span style={{ color: 'var(--text-dim)' }}>Model</span> YOLOv8n (fine-tuned)</div>
                <div><span style={{ color: 'var(--text-dim)' }}>Threshold</span> {Math.round(conf * 100)}%</div>
              </div>

              {result.note && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                  color: '#fbbf24', fontSize: 11,
                }}>
                  ℹ️ {result.note}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
