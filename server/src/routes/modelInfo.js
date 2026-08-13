import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const RUNS_DIR = path.resolve(process.cwd(), '../ml/runs/detect');
const RUN_PRIORITY = ['cattle_thermal_v2', 'cattle_thermal'];

function findRun() {
  for (const name of RUN_PRIORITY) {
    const dir = path.join(RUNS_DIR, name);
    if (fs.existsSync(path.join(dir, 'results.csv'))) return { name, dir };
  }
  return null;
}

// Picks the epoch matching ultralytics' own best.pt checkpoint selection,
// fitness is 0.1 times mAP50 plus 0.9 times mAP50 to 95, not just the last
// logged epoch. Early stopping keeps training well past the best checkpoint.
function parseBestRow(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf-8').trim();
  const lines = text.split('\n');
  const header = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => parseFloat(v));
    return Object.fromEntries(header.map((h, i) => [h, values[i]]));
  });

  const fitness = (row) => 0.1 * row['metrics/mAP50(B)'] + 0.9 * row['metrics/mAP50-95(B)'];
  const best = rows.reduce((a, b) => (fitness(b) > fitness(a) ? b : a));

  return { epochCount: rows.length, bestEpoch: best.epoch, row: best };
}

// GET /api/model-info
router.get('/', (_req, res) => {
  const run = findRun();
  if (!run) return res.status(404).json({ error: 'No training run found.' });

  try {
    const { epochCount, bestEpoch, row } = parseBestRow(path.join(run.dir, 'results.csv'));
    res.json({
      run: run.name,
      epochs: epochCount,
      bestEpoch,
      precision: row['metrics/precision(B)'],
      recall: row['metrics/recall(B)'],
      map50: row['metrics/mAP50(B)'],
      map50_95: row['metrics/mAP50-95(B)'],
      hasConfusionMatrix: fs.existsSync(path.join(run.dir, 'confusion_matrix_normalized.png')),
      hasResultsPlot: fs.existsSync(path.join(run.dir, 'results.png')),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/model-info/plot/:name for results.png or confusion_matrix_normalized.png
router.get('/plot/:name', (req, res) => {
  const run = findRun();
  if (!run) return res.status(404).end();
  const allowed = new Set(['results.png', 'confusion_matrix_normalized.png']);
  if (!allowed.has(req.params.name)) return res.status(400).end();
  const filePath = path.join(run.dir, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.sendFile(filePath);
});

export default router;
