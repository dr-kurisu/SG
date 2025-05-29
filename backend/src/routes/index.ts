import express from 'express';
import cors from 'cors';
import path from 'path';

import storageRouter from './storageRoutes';
import musicRouter from './musicRoutes';
import previewRouter from './previewRoutes';
// import diaryRouter from './diary';

const app = express();
const PORT = 3000;

app.use(cors())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', storageRouter);
app.use('/api/preview', previewRouter);
app.use('/api/music', musicRouter);
// app.use('/api/diary', diaryRouter);
app.use('/music', express.static(path.join(__dirname, '../uploads/Music')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
});