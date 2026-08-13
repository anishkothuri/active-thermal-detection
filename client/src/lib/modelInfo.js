const STATIC = import.meta.env.VITE_STATIC === 'true';
const BASE = import.meta.env.BASE_URL;

export async function getModelInfo() {
  const url = STATIC ? `${BASE}data/model-info.json` : '/api/model-info';
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

export function plotUrl(name) {
  if (!STATIC) return `/api/model-info/plot/${name}`;
  return `${BASE}model-info/${name}`;
}
