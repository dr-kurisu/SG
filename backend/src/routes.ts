// routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router()

const uploadDir = path.join(__dirname, '../uploads')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const rawPath = typeof req.query.path === 'string' ? req.query.path : ''
    const relativePath = decodeURIComponent(rawPath).replace(/\.\./g, '')
    const fullPath = path.join(uploadDir, relativePath)
    fs.mkdirSync(fullPath, { recursive: true })
    cb(null, fullPath)
  },
  filename: (req, file, cb) => {
    const decodedFileName = decodeURIComponent(file.originalname)
    const fileParts = decodedFileName.split('.')
    const name = fileParts.slice(0, -1).join('.')
    const extension = fileParts[fileParts.length - 1]
    const newFileName = `${name}-${Date.now()}.${extension}`
    cb(null, newFileName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
})

// 获取文件/文件夹列表
router.get('/files', (req: Request, res: Response) => {
  try {
    const pathQuery = req.query.path as string || '/'
    const safePath = decodeURIComponent(pathQuery).replace(/\.\./g, '')
    const fullDir = path.join(uploadDir, safePath)
    const entries = fs.readdirSync(fullDir, { withFileTypes: true })

    const result = entries.map(entry => {
      const fullPath = path.join(fullDir, entry.name)
      const stats = fs.statSync(fullPath)
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        modifiedTime: stats.mtime.toISOString()
      }
    })

    res.json(result)
  } catch (err) {
    console.error('Error reading files:', err)
    res.status(500).json({ error: '无法读取文件目录' })
  }
})

// 上传文件
router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
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
router.post('/createFolder', (req: Request, res: Response) => {
  const { folderName, currentPath } = req.body
  if (!folderName) {
    res.status(400).send('Folder name is required')
    return
  }
  const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '')
  const relativePath = decodeURIComponent(currentPath).replace(/\.\./g, '')
  const folderPath = path.join(uploadDir, relativePath, folderNameSanitized)
  if (fs.existsSync(folderPath)) {
    res.status(400).send('Folder already exists')
    return
  }
  fs.mkdirSync(folderPath)
  res.send({
    message: 'Folder created successfully',
    folderName
  })
})

export default router
