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
describe('GET /filenumber', () => {
    it('should return file number when given a valid path', async () => {
        const response = await request(app)
            .get('/api/filenumber')
            .send({ currentPath: '/' })  // 替换为有效路径
            .expect(200);

        expect(response.body).toBeDefined();
        const { num, message } = response.body;
        expect(Number(num)).toBeGreaterThan(0);
        expect(response.status).toBe(200);
    });

    it('should return 400 if there is no file in the folder', async () => {
        const response = await request(app)
            .get('/api/filenumber')
            .send({ currentPath: '/empty/folder/path' })  // 替换为空文件夹路径
            .expect(200);
    });

    it('should return 400 for server error', async () => {
        const response = await request(app)
            .get('/api/filenumber')
            .send({ currentPath: null }) // 触发错误
            .expect(400);

        expect(response.text).toMatch(/.+/); // 错误信息非空
    });
});