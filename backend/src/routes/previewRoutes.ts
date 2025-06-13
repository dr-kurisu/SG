import express from 'express';
import fs from 'fs';
import path from 'path';

const previewRouter = express.Router();
const uploadDir = path.posix.join(__dirname, '../uploads');


previewRouter.get('/', (req, res) => {
  const rawFileID = req.query.fileID as string;
  const rawPath = req.query.path as string;

  const fileID = decodeURIComponent(rawFileID);
  const currentPath = decodeURIComponent(rawPath);

  const filePath = path.posix.join(uploadDir, currentPath, fileID);

  const allowedExt = ['.txt', '.md', '.json', '.log'];
  const ext = path.extname(filePath);

  if (!allowedExt.includes(ext)) {
    res.status(400).json({ message: '不支持的文本格式' });
    return;
  }

  // 读取文件内容
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(404).json({ message: '文件不存在' });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(data);
  });
});

export default previewRouter;