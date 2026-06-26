export default function Navbar({ activeTab, tabs, onTabChange }) {
  return (
    <nav style={{
      background: 'linear-gradient(180deg, #0f1120 0%, #0d0f1d 100%)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 0', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 0 20px rgba(99,102,241,0.35)',
        }}>
          🌡️
        </div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #e8eaf6, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Cattle Thermal Detection
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.5px', marginTop: 1 }}>
            YOLOv8 · 2,024 images · 5 classes
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2 }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '22px 20px',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--accent2)' : '2px solid transparent',
                color: active ? 'var(--accent2)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'color 0.2s, border-color 0.2s',
                letterSpacing: '0.1px',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right badge */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#10b981', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Model Active
        </div>
      </div>
    </nav>
  );
}
