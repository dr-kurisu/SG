import fs from 'fs'
import path from 'path'
import multer from 'multer';

const uploadDir = path.join(__dirname, '../../uploads')

export const storage = multer.diskStorage({
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


export const getFileList = (queryPath: string) => {
  const safePath = decodeURIComponent(queryPath || '/').replace(/\.\./g, '')
  const fullDir = path.join(uploadDir, safePath)
  const entries = fs.readdirSync(fullDir, { withFileTypes: true })

  return entries.map(entry => {
    const fullPath = path.join(fullDir, entry.name)
    const stats = fs.statSync(fullPath)
    return {
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file',
      modifiedTime: stats.mtime.toISOString()
    }
  })
}

export const createFolder = (folderName: string, currentPath: string) => {
  const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '')
  const relativePath = decodeURIComponent(currentPath).replace(/\.\./g, '')
  const folderPath = path.join(uploadDir, relativePath, folderNameSanitized)

  if (fs.existsSync(folderPath)) {
    throw new Error('Folder already exists')
  }

  fs.mkdirSync(folderPath)
  return {
    message: 'Folder created successfully',
    folderName
  }
}

export const getUploadDir = () => uploadDir