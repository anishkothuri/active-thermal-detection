import { useCallback, useRef, useState } from 'react';

export default function ImageUploader({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    onFile(file);
  }, [onFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius: 16,
        padding: '64px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging
          ? 'rgba(99,102,241,0.06)'
          : 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)',
        transition: 'all 0.2s ease',
        boxShadow: dragging ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
        maxWidth: 600,
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
        boxShadow: dragging ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
        transition: 'all 0.2s',
      }}>
        🖼️
      </div>

      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
        {dragging ? 'Release to upload' : 'Drop a thermal image here'}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        or click to browse your files
      </div>
      <div style={{
        display: 'inline-flex', gap: 8, alignItems: 'center',
        padding: '6px 16px', borderRadius: 999,
        background: 'var(--surface3)', border: '1px solid var(--border2)',
        color: 'var(--text-muted)', fontSize: 11, fontWeight: 500,
      }}>
        PNG · JPG · JPEG · up to 20 MB
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
