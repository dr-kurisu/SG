import fs from 'fs'
import path from 'path'
import multer from 'multer';
import FileHandler from './DB_handler';
import { FileRecord } from './types';
import { v4 as uuidv4 } from 'uuid';

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
    const newFileName = `${name}-${uuidv4()}.${extension}`
    cb(null, newFileName)
  }
})


export const getFileList = async (user_id: string, queryPath: string) => {
  const safePath = decodeURIComponent(queryPath || '/').replace(/\.\./g, '')
  const fullDir = path.join(uploadDir, safePath)
  const dbFiles = await FileHandler.getFilesByPath(user_id, fullDir);
  return dbFiles.map(file => {
    const fullPath = path.join(fullDir, file.filename);
    let mtime = file.updated_time;
    try {
      const stats = fs.statSync(fullPath);
      mtime = stats.mtime.toISOString();
    } catch (err) {
      // 数据库与文件不匹配
      console.warn(`文件不存在于磁盘上: ${fullPath}`);
    }

    return {
      file_id: file.id,
      fileName: file.filename,
      type: file.type,
      modifiedTime: mtime,
      createdTime: file.created_time
    };
  });
}

export const createFolder = async (userID: string, folderName: string, relativePath: string) => {
  const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '');
  const safePath = decodeURIComponent(relativePath).replace(/\.\./g, '');
  const folderPath = path.join(uploadDir, safePath, folderNameSanitized);

  if (fs.existsSync(folderPath)) {
    throw new Error('Folder already exists');
  }

  try {
    fs.mkdirSync(folderPath);

    // update info in DB
    const folderRecord: FileRecord = {
      user_id: userID,
      filename: folderName,
      filepath: safePath,
      size: 0,
      type: "folder",
    };

    await FileHandler.insert(folderRecord);

    return {
      message: 'Folder created successfully',
      folderName
    }
  }catch (err) {
    console.error('创建文件夹失败:', err);
    throw new Error('创建文件夹失败');
  }


}

export const getUploadDir = () => uploadDir