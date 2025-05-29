// routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createFolder, getFileList, storage } from '../services/storage';

const storageRouter = Router()

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
})

// 获取文件/文件夹列表
storageRouter.get('/files', (req: Request, res: Response) => {
  try {
    const pathQuery = req.query.path as string || '/'
    // 调用service接口
    const result = getFileList(pathQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error reading files:', err)
    res.status(500).json({ error: '无法读取文件目录' })
  }
})

// 上传文件
storageRouter.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send('No file uploaded')
    return
  }
  res.send({
    message: 'File uploaded successfully',
    file: req.file
  })
})

// 创建文件夹
storageRouter.post('/createFolder', (req: Request, res: Response) => {
  const { folderName, currentPath } = req.body
  if (!folderName) {
    res.status(400).send('Folder name is required')
    return
  }
  try {
    const result = createFolder(folderName, currentPath);
    res.send(result);
  }catch (error: any) {
    res.status(400).send(error.message)
  }
})

export default storageRouter
