import request from 'supertest';
import express, { Request, Response } from 'express';
import storageRouter from '../routes/storageRoutes';

// 创建 Express 应用并挂载路由
const app = express();
app.use(express.json());
app.use('/api', storageRouter);

describe('Storage Routes', () => {
    // fetch files work as expected
    it('GET /api/files should return file list', async () => {
      const res = await request(app).get('/api/files');
      expect(res.status).toBe(200);
      // console.log(res.body);
    });

    // upload file work as expected


    // delete file work as expected

});