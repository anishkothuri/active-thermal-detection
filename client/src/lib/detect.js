import { detectImageOnnx, detectVideoOnnx } from './onnxDetect.js';

const STATIC = import.meta.env.VITE_STATIC === 'true';

export async function detectImage(file, conf) {
  if (STATIC) return detectImageOnnx(file, conf);

  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`/api/detect?conf=${conf}`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Detection failed');
  return data;
}

export async function detectVideo(file, conf, onProgress) {
  if (STATIC) return detectVideoOnnx(file, conf, onProgress);

  const form = new FormData();
  form.append('video', file);
  const res = await fetch(`/api/detect/video?conf=${conf}`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Detection failed');
  return data;
}
