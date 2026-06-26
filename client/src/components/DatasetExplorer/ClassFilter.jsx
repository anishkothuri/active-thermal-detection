const CLASSES = [
  { id: 0, name: 'Animal', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  { id: 1, name: 'Body',   color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  { id: 2, name: 'Eye',    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { id: 3, name: 'Face',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  { id: 4, name: 'Rectum', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
];

export { CLASSES };

export default function ClassFilter({ activeClasses, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginRight: 2 }}>
        Filter
      </span>
      {CLASSES.map((cls) => {
        const active = activeClasses.has(cls.id);
        return (
          <button
            key={cls.id}
            onClick={() => onToggle(cls.id)}
            style={{
              padding: '5px 14px',
              borderRadius: 999,
              border: `1.5px solid ${active ? cls.color : 'var(--border2)'}`,
              background: active ? cls.bg : 'transparent',
              color: active ? cls.color : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: active ? `0 0 10px ${cls.color}22` : 'none',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: active ? cls.color : 'var(--border2)',
              transition: 'background 0.15s',
            }} />
            {cls.name}
          </button>
        );
      })}
      <button
        onClick={() => onToggle('all')}
        style={{
          padding: '5px 12px', borderRadius: 999,
          border: '1.5px solid var(--border2)',
          background: 'transparent', color: 'var(--text-muted)',
          fontSize: 12, transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        All
      </button>
    </div>
  );
}
