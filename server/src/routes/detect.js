import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

// POST /api/detect  (multipart: field "image")
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded. Send multipart/form-data with field "image".' });
  }

  try {
    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    form.append('image', blob, req.file.originalname || 'upload.png');

    const conf = req.query.conf ?? '0.25';
    const response = await fetch(`${ML_SERVICE_URL}/detect?conf=${conf}`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'ML service error', detail: text });
    }

    res.json(await response.json());
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'ML service unavailable.',
        hint: 'Start it with: cd ml && uvicorn main:app --port 8001',
      });
    }
    console.error('Detect proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
