import { useEffect, useState } from 'react';
import { getModelInfo, plotUrl } from '../../lib/modelInfo.js';

const METRICS = [
  { key: 'precision', label: 'Precision', color: '#34d399' },
  { key: 'recall',    label: 'Recall',    color: '#60a5fa' },
  { key: 'map50',     label: 'mAP@50',    color: '#818cf8' },
  { key: 'map50_95',  label: 'mAP@50 to 95', color: '#fbbf24' },
];

export default function ModelInsights() {
  const [info, setInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getModelInfo().then(setInfo).catch(() => {});
  }, []);

  if (!info) return null;

  return (
    <div style={{
      marginBottom: 24, borderRadius: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 20px', background: 'none', border: 'none', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Model Performance
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {info.run} · best epoch {info.bestEpoch} of {info.epochs}
        </span>

        <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
          {METRICS.map((m) => (
            <div key={m.key} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>
                {(info[m.key] * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          ▾
        </span>
      </button>

      {expanded && (
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap',
          padding: '0 20px 20px',
        }}>
          {info.hasResultsPlot && (
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Training curves
              </div>
              <img
                src={plotUrl('results.png')}
                alt="Training curves"
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}
              />
            </div>
          )}
          {info.hasConfusionMatrix && (
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Confusion matrix, normalized
              </div>
              <img
                src={plotUrl('confusion_matrix_normalized.png')}
                alt="Confusion matrix"
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
