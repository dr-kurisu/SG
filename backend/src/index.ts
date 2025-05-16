import express from 'express';
import cors from 'cors';
import router from './routes';
import previewRouter from './preview';

const app = express();
const PORT = 3000;

app.use(cors())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', router);
app.use('/api/preview', previewRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
});