import express from 'express';
import cors from 'cors';
import { buildIndex } from './utils/datasetIndex.js';
import imagesRouter from './routes/images.js';
import labelsRouter from './routes/labels.js';
import statsRouter from './routes/stats.js';
import detectRouter from './routes/detect.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/images', imagesRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/detect', detectRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

buildIndex();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
