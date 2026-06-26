import { useState } from 'react';
import { CLASSES } from './ClassFilter.jsx';

const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

export default function ImageGrid({ images, onSelect }) {
  if (images.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '80px 0',
        color: 'var(--text-muted)', fontSize: 14,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        No images match the current filters.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 14,
    }}>
      {images.map((img) => <ImageCard key={`${img.split}-${img.filename}`} img={img} onSelect={onSelect} />)}
    </div>
  );
}

function ImageCard({ img, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(img)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 28px rgba(99,102,241,0.2)' : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '4/3', background: '#000', overflow: 'hidden' }}>
        <img
          src={`/api/images/${img.split}/${img.filename}`}
          alt={img.filename}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
        {/* Split badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          color: '#aaa', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          {img.split}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 7,
        }}>
          {img.filename.replace(/_png\.rf\..+$/, '').replace(/_/g, ' ')}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {img.classes.length === 0 ? (
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>No annotations</span>
          ) : (
            img.classes.map((cid) => {
              const cls = CLASS_MAP[cid];
              return cls ? (
                <span key={cid} style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 999,
                  background: cls.bg, color: cls.color,
                  border: `1px solid ${cls.color}44`,
                  fontWeight: 600,
                }}>
                  {cls.name}
                </span>
              ) : null;
            })
          )}
        </div>
      </div>
    </button>
  );
}
