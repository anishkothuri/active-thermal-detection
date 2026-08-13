import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT, 'dataset');
const CLIENT_PUBLIC = path.join(ROOT, 'client', 'public');
const RUN_DIR = path.join(ROOT, 'ml', 'runs', 'detect', 'cattle_thermal_v2');
const ONNX_MODEL = path.join(ROOT, 'ml', 'models', 'best.onnx');

const CLASS_NAMES = ['Animal', 'Body', 'Eye', 'Face', 'Rectum'];
const SPLITS = ['train', 'test', 'valid'];

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

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function buildDatasetData() {
  const images = [];
  const labels = {};
  const classCounts = Object.fromEntries(CLASS_NAMES.map((n) => [n, 0]));
  const splitCounts = { train: 0, test: 0, valid: 0 };

  for (const split of SPLITS) {
    const imagesDir = path.join(DATASET_DIR, split, 'images');
    const labelsDir = path.join(DATASET_DIR, split, 'labels');
    if (!fs.existsSync(imagesDir)) continue;

    const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith('.png') || f.endsWith('.jpg'));
    for (const filename of files) {
      const base = path.parse(filename).name;
      const labelPath = path.join(labelsDir, base + '.txt');
      const annotations = parseLabelFile(labelPath);
      const classes = [...new Set(annotations.map((a) => a.class_id))];

      images.push({ split, filename, classes });
      labels[`${split}/${filename}`] = annotations;

      splitCounts[split] = (splitCounts[split] || 0) + 1;
      for (const c of classes) {
        const name = CLASS_NAMES[c];
        if (name) classCounts[name]++;
      }

      copyFile(path.join(imagesDir, filename), path.join(CLIENT_PUBLIC, 'dataset', split, 'images', filename));
    }
  }

  const stats = { total: images.length, splits: splitCounts, classCounts, classNames: CLASS_NAMES };
  const outDir = path.join(CLIENT_PUBLIC, 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'dataset-index.json'), JSON.stringify({ images, labels, stats }));

  console.log(`Dataset data: ${images.length} images across ${SPLITS.join(', ')}`);
}

function buildModelInfo() {
  const csvPath = path.join(RUN_DIR, 'results.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('No training run found, skipping model info');
    return;
  }

  const text = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = text.split('\n');
  const header = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => parseFloat(v));
    return Object.fromEntries(header.map((h, i) => [h, values[i]]));
  });

  const fitness = (row) => 0.1 * row['metrics/mAP50(B)'] + 0.9 * row['metrics/mAP50-95(B)'];
  const best = rows.reduce((a, b) => (fitness(b) > fitness(a) ? b : a));

  const resultsPlot = path.join(RUN_DIR, 'results.png');
  const confusionPlot = path.join(RUN_DIR, 'confusion_matrix_normalized.png');

  const info = {
    run: path.basename(RUN_DIR),
    epochs: rows.length,
    bestEpoch: best.epoch,
    precision: best['metrics/precision(B)'],
    recall: best['metrics/recall(B)'],
    map50: best['metrics/mAP50(B)'],
    map50_95: best['metrics/mAP50-95(B)'],
    hasResultsPlot: fs.existsSync(resultsPlot),
    hasConfusionMatrix: fs.existsSync(confusionPlot),
  };

  const outDir = path.join(CLIENT_PUBLIC, 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'model-info.json'), JSON.stringify(info));

  if (info.hasResultsPlot) copyFile(resultsPlot, path.join(CLIENT_PUBLIC, 'model-info', 'results.png'));
  if (info.hasConfusionMatrix) copyFile(confusionPlot, path.join(CLIENT_PUBLIC, 'model-info', 'confusion_matrix_normalized.png'));

  console.log(`Model info: ${info.run}, best epoch ${info.bestEpoch} of ${info.epochs}`);
}

function copyOnnxModel() {
  if (!fs.existsSync(ONNX_MODEL)) {
    console.log('No ONNX model found at ml/models/best.onnx, run the export first');
    return;
  }
  copyFile(ONNX_MODEL, path.join(CLIENT_PUBLIC, 'model', 'best.onnx'));
  console.log('Copied ONNX model to client/public/model/best.onnx');
}

buildDatasetData();
buildModelInfo();
copyOnnxModel();
