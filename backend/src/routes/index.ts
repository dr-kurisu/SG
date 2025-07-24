import express from 'express';
import cors from 'cors';
import path from 'path';

import storageRouter from './storageRoutes';
import musicRouter from './musicRoutes';
import previewRouter from './previewRoutes';
import { clearDirectory, clearDatabase } from '../services/utili';
import { scanDirectory } from '../services/utili';
import accountRouter from './accountRoutes';
import authenticateToken from '../middlerware/authToken';
import playlistRouter from './playlistRoutes';
// import diaryRouter from './diary';



const initializeDevEnvironment = async () => {
  await clearDatabase();
  await scanDirectory("/");
  console.log("dev env initialized.");
};

(async () => {
  // 在开发环境下调用
  if (process.env.NODE_ENV === 'development') {
    await initializeDevEnvironment();
  }

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.json({ limit: '50mb' }));
  
  app.use('/api/account', accountRouter);
  app.use(authenticateToken);

  app.use('/api', storageRouter);
  app.use('/api/preview', previewRouter);
  app.use('/api/music', musicRouter);
  app.use('/api/playlist', playlistRouter);
  app.use('/music', express.static(path.posix.join(__dirname, '../uploads/Music')));

  app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();