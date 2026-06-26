export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);
  const pages = Array.from({ length: right - left + 1 }, (_, i) => left + i);

  const Btn = ({ children, onClick, active, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 34, height: 34, padding: '0 10px',
        borderRadius: 8,
        border: active ? 'none' : '1px solid var(--border)',
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : disabled ? 'var(--text-dim)' : 'var(--text-muted)',
        fontSize: 13, fontWeight: active ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? '0 2px 10px rgba(99,102,241,0.4)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap', alignItems: 'center' }}>
      <Btn onClick={() => onPageChange(1)} disabled={page === 1}>«</Btn>
      <Btn onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</Btn>

      {left > 1 && <><Btn onClick={() => onPageChange(1)}>1</Btn>{left > 2 && <span style={{ color: 'var(--text-dim)' }}>…</span>}</>}
      {pages.map((p) => <Btn key={p} onClick={() => onPageChange(p)} active={p === page}>{p}</Btn>)}
      {right < totalPages && <>{right < totalPages - 1 && <span style={{ color: 'var(--text-dim)' }}>…</span>}<Btn onClick={() => onPageChange(totalPages)}>{totalPages}</Btn></>}

      <Btn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</Btn>
      <Btn onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</Btn>

      <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
