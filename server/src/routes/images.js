import express from 'express';
import fs from 'fs';
import path from 'path';
import { queryImages, getImagePath } from '../utils/datasetIndex.js';

const router = express.Router();

// GET /api/images?split=train&classes=0,2&page=1&limit=20
router.get('/', (req, res) => {
  const { split, classes, page = '1', limit = '20' } = req.query;
  const parsedClasses = classes ? classes.split(',').map(Number).filter((n) => !isNaN(n)) : [];

  const result = queryImages({
    split: split || null,
    classes: parsedClasses,
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 100),
  });

  res.json(result);
});

// GET /api/images/:split/:filename
router.get('/:split/:filename', (req, res) => {
  const { split, filename } = req.params;
  const imagePath = getImagePath(split, filename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.sendFile(path.resolve(imagePath));
});

export default router;
