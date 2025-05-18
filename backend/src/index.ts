import express from 'express';
import cors from 'cors';
import storageRouter from './storageRoutes';
import previewRouter from './preview';
// import diaryRouter from './diary';

const app = express();
const PORT = 3000;

app.use(cors())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', storageRouter);
app.use('/api/preview', previewRouter);
// app.use('/api/diary', diaryRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
});