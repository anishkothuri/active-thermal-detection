const STACK = ['React', 'Vite', 'Node · Express', 'FastAPI', 'YOLOv8', 'PyTorch'];

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '20px 24px',
      marginTop: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      maxWidth: 1440,
      marginInline: 'auto',
      width: '100%',
    }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STACK.map((s) => (
          <span key={s} style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 999,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontWeight: 500,
          }}>
            {s}
          </span>
        ))}
      </div>

      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        Captured thermal camera images · fine tuned on Apple Silicon MPS
      </span>
    </footer>
  );
}
