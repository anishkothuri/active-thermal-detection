const STATIC = import.meta.env.VITE_STATIC === 'true';
const BASE = import.meta.env.BASE_URL;

let staticIndexPromise = null;

function loadStaticIndex() {
  if (!staticIndexPromise) {
    staticIndexPromise = fetch(`${BASE}data/dataset-index.json`).then((r) => r.json());
  }
  return staticIndexPromise;
}

export async function getStats() {
  if (!STATIC) return fetch('/api/stats').then((r) => r.json());
  const idx = await loadStaticIndex();
  return idx.stats;
}

export async function queryImages({ split, classes, page = 1, limit = 20 }) {
  if (!STATIC) {
    const classParam = (classes || []).join(',');
    return fetch(`/api/images?split=${split || ''}&classes=${classParam}&page=${page}&limit=${limit}`)
      .then((r) => r.json());
  }

  const idx = await loadStaticIndex();
  let results = idx.images;
  if (split) results = results.filter((e) => e.split === split);
  if (classes && classes.length > 0) {
    const classSet = new Set(classes.map(Number));
    results = results.filter((e) => e.classes.some((c) => classSet.has(c)));
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const items = results.slice(offset, offset + limit);
  return { items, total, page, totalPages, limit };
}

export async function getLabelAnnotations(split, filename) {
  if (!STATIC) return fetch(`/api/labels/${split}/${filename}`).then((r) => r.json());
  const idx = await loadStaticIndex();
  return idx.labels[`${split}/${filename}`] || [];
}

export function imageUrl(split, filename) {
  if (!STATIC) return `/api/images/${split}/${filename}`;
  return `${BASE}dataset/${split}/images/${filename}`;
}
