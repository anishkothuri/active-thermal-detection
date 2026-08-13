import { useState, useEffect, useCallback } from 'react';
import ClassFilter from './ClassFilter.jsx';
import ImageGrid from './ImageGrid.jsx';
import ImageModal from './ImageModal.jsx';
import Pagination from './Pagination.jsx';
import { getStats, queryImages } from '../../lib/dataset.js';

const ALL_CLASSES = new Set([0, 1, 2, 3, 4]);
const SPLITS = ['train', 'test', 'valid'];
const LIMIT = 24;

const STAT_META = [
  { key: 'total', label: 'Total Images', icon: '🖼️', color: '#818cf8' },
  { key: 'train', label: 'Train',  icon: '📚', color: '#34d399', isSplit: true },
  { key: 'test',  label: 'Test',   icon: '🧪', color: '#60a5fa', isSplit: true },
  { key: 'valid', label: 'Valid',  icon: '✅', color: '#fbbf24', isSplit: true },
];

const CLASS_STATS = [
  { key: 'Animal', color: '#f87171' },
  { key: 'Body',   color: '#34d399' },
  { key: 'Eye',    color: '#60a5fa' },
  { key: 'Face',   color: '#fbbf24' },
  { key: 'Rectum', color: '#c084fc' },
];

export default function DatasetExplorer() {
  const [split, setSplit] = useState('train');
  const [activeClasses, setActiveClasses] = useState(new Set(ALL_CLASSES));
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    queryImages({ split, classes: [...activeClasses], page, limit: LIMIT })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [split, activeClasses, page]);

  const toggleClass = useCallback((id) => {
    setActiveClasses((prev) => {
      if (id === 'all') return new Set(ALL_CLASSES);
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setPage(1);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 6 }}>
          Dataset Explorer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 620 }}>
          2,024 thermal cattle images, captured frame by frame with a real thermal camera and
          manually annotated across 5 body part classes. A learning project spanning the full pipeline,
          data ingestion, model development, and training statistics.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {['1 · Data ingestion', '2 · Model development', '3 · Model statistics'].map((step) => (
            <span key={step} style={{
              fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>
              {step}
            </span>
          ))}
        </div>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {STAT_META.map(({ key, label, icon, color, isSplit }) => {
            const value = isSplit ? stats.splits[key] : stats.total;
            return (
              <div key={key} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px 18px',
                borderTop: `3px solid ${color}`,
              }}>
                <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value?.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            );
          })}
          {CLASS_STATS.map(({ key, color }) => (
            <div key={key} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 18px',
              borderTop: `3px solid ${color}`,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color, marginBottom: 8,
                boxShadow: `0 0 8px ${color}`,
              }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                {stats.classCounts[key]?.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
        alignItems: 'center', marginBottom: 20,
        padding: '14px 18px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 8, padding: 3 }}>
          {SPLITS.map((s) => (
            <button
              key={s}
              onClick={() => { setSplit(s); setPage(1); }}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none',
                background: split === s ? 'var(--accent)' : 'transparent',
                color: split === s ? '#fff' : 'var(--text-muted)',
                fontSize: 12, fontWeight: split === s ? 600 : 400,
                transition: 'all 0.15s',
                boxShadow: split === s ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <ClassFilter activeClasses={activeClasses} onToggle={toggleClass} />
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16, fontWeight: 500 }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spinner /> Loading…
          </span>
        ) : data ? (
          `${data.total.toLocaleString()} image${data.total !== 1 ? 's' : ''} · page ${data.page} of ${data.totalPages}`
        ) : null}
      </div>

      {loading ? <SkeletonGrid /> : <ImageGrid images={data?.items ?? []} onSelect={setSelectedImage} />}

      <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />

      {selectedImage && (
        <ImageModal image={selectedImage} activeClasses={activeClasses} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `${size / 8}px solid var(--border2)`,
      borderTop: `${size / 8}px solid var(--accent)`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 14,
    }}>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{ aspectRatio: '4/3', background: 'var(--surface2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ padding: '10px 12px' }}>
            <div style={{ height: 10, width: '70%', borderRadius: 4, background: 'var(--surface2)', marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 14, width: '40%', borderRadius: 999, background: 'var(--surface2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
