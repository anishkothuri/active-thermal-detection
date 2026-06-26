import express from 'express';
import { getLabelAnnotations } from '../utils/datasetIndex.js';

const router = express.Router();

// GET /api/labels/:split/:filename
router.get('/:split/:filename', (req, res) => {
  const { split, filename } = req.params;
  const annotations = getLabelAnnotations(split, filename);
  res.json(annotations);
});

export default router;
