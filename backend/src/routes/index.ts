import express from 'express';
import cors from 'cors';
import path from 'path';

import storageRouter from './storageRoutes';
import musicRouter from './musicRoutes';
import previewRouter from './previewRoutes';
import fs from "fs";
import { getUploadDir, createFolder } from '../services/storage';
// import diaryRouter from './diary';

function clearDatabase() {
  const dbPath = path.resolve(__dirname, '../../data/files.db');
  try {
    fs.unlinkSync(dbPath);
    console.log(`数据库删除成功`);
  } catch (err) {
    console.error(`数据库删除失败`, err);
  }
}


function clearDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

// 在开发环境下清空 uploads 内容
if (process.env.NODE_ENV === 'development') {
  clearDatabase();
  console.log("Reset uploads folder...");
  clearDirectory(getUploadDir());
  createFolder("admin", "Music", "/");
}

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

(async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();