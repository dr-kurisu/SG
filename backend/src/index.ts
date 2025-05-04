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
        cb(null, Date.now() + '-' + file.originalname) // using timestamp to avoid repeating
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
})

app.use(cors())
app.use(express.json())

app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, '../uploads'))
  res.json(files)
})

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})