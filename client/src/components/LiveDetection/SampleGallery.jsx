import { useState } from 'react';
import { SAMPLES } from '../../data/samples.js';

export default function SampleGallery({ onSelect }) {
  const [loadingId, setLoadingId] = useState(null);

  const pick = async (sample) => {
    setLoadingId(sample.id);
    try {
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const file = new File([blob], `${sample.id}.${sample.src.split('.').pop()}`, { type: blob.type });
      onSelect(file);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ marginTop: 28, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Or try a sample
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {SAMPLES.map((sample) => {
          const busy = loadingId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => pick(sample)}
              disabled={loadingId !== null}
              title={sample.credit ? `${sample.credit}, ${sample.license}` : sample.tag}
              style={{
                position: 'relative',
                padding: 0,
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'var(--surface)',
                cursor: loadingId ? 'wait' : 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, transform 0.15s',
                opacity: busy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#000' }}>
                <img
                  src={sample.kind === 'video' ? sample.poster : sample.src}
                  alt={sample.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {sample.kind === 'video' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', paddingLeft: 2,
                    }}>
                      ▶
                    </div>
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: 6, left: 6,
                  padding: '2px 8px', borderRadius: 999,
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                  background: sample.kind === 'web' ? 'rgba(52,211,153,0.85)' : sample.kind === 'video' ? 'rgba(251,146,60,0.9)' : 'rgba(99,102,241,0.85)',
                  color: '#fff',
                }}>
                  {sample.kind === 'web' ? 'Web' : sample.kind === 'video' ? 'Video' : 'Dataset'}
                </span>
                {busy && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(8,10,18,0.55)',
                  }}>
                    <Spinner />
                  </div>
                )}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {sample.tag}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
