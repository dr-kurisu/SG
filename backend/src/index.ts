import express, { Request, Response } from 'express'
import cors from 'cors'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

const app = express()
const PORT = 3000

const uploadDir = path.join(__dirname, '../uploads')

const storage = multer.diskStorage({
    // File storage path
    destination(req, file, cb) {
        cb(null, uploadDir)
    },
    // File name config
    filename: (req, file, cb) => {
      const decodedFileName = decodeURIComponent(file.originalname);  // 解码 解决中文乱码
      const fileParts = decodedFileName.split('.');
      const name = fileParts.slice(0, -1).join('.');
      const extension = fileParts[fileParts.length - 1];
      const newFileName = `${name}-${Date.now()}.${extension}`; // 插入时间戳并重新组合文件名
      cb(null, newFileName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
})

app.use(cors())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.get('/api/files', (req, res) => {
  try {
    const path = req.query.path as string || '/';
    const entries = fs.readdirSync(uploadDir + path, { withFileTypes: true });

    const result = entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file',
    }));

    res.json(result);
  } catch (err) {
    console.error('Error reading files:', err);
    res.status(500).json({ error: '无法读取文件目录' });
  }
});

app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  // file 是上传文件的字段名
  if (!req.file) {
    res.status(400).send('No file uploaded')
    return
  }  
  res.send({
    message: 'File uploaded successfully',
    file: req.file  // 返回文件的上传信息
  })
})

app.post('/api/createFolder', (req: Request, res: Response) => {
  const { folderName } = req.body;
  if (!folderName) {
    res.status(400).send('Folder name is required');
    return
  }
  const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '');  // 清理非法字符
  const folderPath = path.join(uploadDir, folderNameSanitized);
  // 检查文件夹名称重复
  if (fs.existsSync(folderPath)) {
    res.status(400).send('Folder already exists');
    return
  }
  // 创建文件夹
  fs.mkdirSync(folderPath);
  // 返回成功信息
  res.send({
    message: 'Folder created successfully',
    folderName: folderName
  });
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})