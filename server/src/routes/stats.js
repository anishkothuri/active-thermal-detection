import express from 'express';
import { getStats } from '../utils/datasetIndex.js';

const router = express.Router();

// GET /api/stats
router.get('/', (_req, res) => {
  res.json(getStats());
});

export default router;
