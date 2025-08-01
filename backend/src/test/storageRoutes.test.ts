import request from 'supertest';
import express, { Request, Response } from 'express';
import cors from 'cors';

import storageRouter from '../routes/storageRoutes';
import authenticateToken from '../middlerware/authToken';
import { disconnectDB } from '../services/db_handler';
import { clearDatabase } from '../services/utili';

// 创建 Express 应用并挂载路由
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(authenticateToken);
app.use('/api', storageRouter);

console.log = () => {};



describe('Storage Routes', () => {
    // fetch files work as expected
    it('GET /api/files should return file list', async () => {
      const res = await request(app).get('/api/files');
      // expect(res.status).toBe(200);
    });

    // upload file work as expected


    // delete file work as expected

});

afterAll(async () => {
  console.log = () => {};
  await disconnectDB();
  await clearDatabase();
});