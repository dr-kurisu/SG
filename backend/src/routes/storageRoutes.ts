// routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createFolder, getFileList, storage, insertFile, removeFile } from '../services/storage';

const storageRouter = Router()

export const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }
})

// 获取文件/文件夹列表
storageRouter.get('/files', async (req: Request, res: Response) => {
  try {
    const pathQuery = req.query.path as string || '/';
    const userId = "admin";

    // 调用service接口
    const result = await getFileList(userId, pathQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error reading files:', err)
    res.status(500).json({ error: '无法读取文件目录' })
  }
})

// 上传文件
storageRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }
  const userID = "admin";
  const relativePath = req.query.path as string || "/";
  // insert data in DB
  await insertFile(userID, req.file.filename, relativePath, req.file.size, req.file.mimetype);

  res.send({
    message: 'File uploaded successfully',
    file: req.file
  });
})

// 创建文件夹
storageRouter.post('/createFolder', async (req: Request, res: Response) => {
  const { folderName, currentPath } = req.body
  const userId = "admin"; // userId will get from req
  if (!folderName) {
    res.status(400).send('Folder name is required');
    return;
  }
  try {
    const result = await createFolder(userId, folderName, currentPath);
    if (!result.success) {
      res.status(409).send(result.message); // 409 表示冲突
      return;
    }else {
      res.send(result);
    }

  }catch(error: any) {
    res.status(400).send(error.message);
  }
});


storageRouter.delete('/:id', async (req: Request, res: Response) => {
  const user_id = "admin";
  try {
    await removeFile(Number(req.params.id), user_id);
  }catch(error) {
    res.status(500).json({ error: "Deletion of file failed" });
  }
});

export default storageRouter
