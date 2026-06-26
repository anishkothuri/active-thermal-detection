import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = path.resolve(__dirname, '../../../dataset');

const CLASS_NAMES = ['Animal', 'Body', 'Eye', 'Face', 'Rectum'];

// In-memory index: list of { split, filename, classes[] }
let index = [];
let statsCache = null;

function parseLabelFile(labelPath) {
  try {
    const content = fs.readFileSync(labelPath, 'utf8').trim();
    if (!content) return [];
    return content
      .split('\n')
      .map((line) => {
        const parts = line.trim().split(' ');
        if (parts.length < 5) return null;
        const [class_id, x, y, w, h] = parts.map(Number);
        return { class_id, class_name: CLASS_NAMES[class_id] ?? 'Unknown', x, y, w, h };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function buildIndex() {
  index = [];
  statsCache = null;
  const splits = ['train', 'test', 'valid'];

  for (const split of splits) {
    const imagesDir = path.join(DATASET_DIR, split, 'images');
    const labelsDir = path.join(DATASET_DIR, split, 'labels');
    if (!fs.existsSync(imagesDir)) continue;

    const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith('.png') || f.endsWith('.jpg'));
    for (const filename of files) {
      const base = path.parse(filename).name;
      const labelPath = path.join(labelsDir, base + '.txt');
      const annotations = parseLabelFile(labelPath);
      const classes = [...new Set(annotations.map((a) => a.class_id))];
      index.push({ split, filename, classes });
    }
  }

  console.log(`Dataset index built: ${index.length} images across ${splits.join(', ')}`);
}

export function queryImages({ split, classes, page = 1, limit = 20 }) {
  let results = index;

  if (split) {
    results = results.filter((e) => e.split === split);
  }

  if (classes && classes.length > 0) {
    const classSet = new Set(classes.map(Number));
    results = results.filter((e) => e.classes.some((c) => classSet.has(c)));
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const items = results.slice(offset, offset + limit).map(({ split, filename, classes }) => ({
    split,
    filename,
    classes,
  }));

  return { items, total, page, totalPages, limit };
}

export function getStats() {
  if (statsCache) return statsCache;

  const classCounts = Object.fromEntries(CLASS_NAMES.map((name, i) => [name, 0]));
  const splitCounts = { train: 0, test: 0, valid: 0 };

  for (const entry of index) {
    splitCounts[entry.split] = (splitCounts[entry.split] || 0) + 1;
    for (const c of entry.classes) {
      const name = CLASS_NAMES[c];
      if (name) classCounts[name]++;
    }
  }

  statsCache = {
    total: index.length,
    splits: splitCounts,
    classCounts,
    classNames: CLASS_NAMES,
  };
  return statsCache;
}

export function getLabelAnnotations(split, filename) {
  const base = path.parse(filename).name;
  const labelPath = path.join(DATASET_DIR, split, 'labels', base + '.txt');
  return parseLabelFile(labelPath);
}

export function getImagePath(split, filename) {
  return path.join(DATASET_DIR, split, 'images', filename);
}

export { CLASS_NAMES, DATASET_DIR };
