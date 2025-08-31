import express from 'express';
import cors from 'cors';

import storageRouter from './storageRoutes';
import accountRouter from './accountRoutes';
import authenticateToken from '../middlerware/authToken';
import { songRouter } from './songRoutes';
import { playlistRouter } from './playlistRoutes';



const initializeDevEnvironment = async () => {
  // await clearDatabase();
  // await scanDirectory("/");
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
  app.use('/api/songs', songRouter);
  app.use('/api/playlist', playlistRouter);

  app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();