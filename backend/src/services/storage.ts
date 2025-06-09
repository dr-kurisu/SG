import fs from 'fs'
import path from 'path'
import multer from 'multer';
import { FileHandler } from './db_handler'; './db_handler';
import { FileRecord, FileItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(__dirname, '../../uploads').replace(/\\/g, '/');

export const storage = multer.diskStorage({
  destination(req, file, cb) {
    const rawPath = typeof req.query.path === 'string' ? req.query.path : '';
    const relativePath = decodeURIComponent(rawPath).replace(/\.\./g, '');
    const fullPath = path.posix.join(uploadDir, relativePath);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const decodedFileName = decodeURIComponent(file.originalname);
    const fileParts = decodedFileName.split('.');
    const name = fileParts.slice(0, -1).join('.');
    const extension = fileParts[fileParts.length - 1];
    const newFileName = `${name}-${uuidv4()}.${extension}`;
    cb(null, newFileName);
  }
});


export const getFileList = async (user_id: string, queryPath: string) => {
  const safePath = decodeURIComponent(queryPath || '/').replace(/\.\./g, '')
  const fullDir = path.posix.join(uploadDir, safePath)
  const dbFiles = await FileHandler.getFilesByPath(user_id, safePath);
  // console.log(dbFiles, safePath);
  return dbFiles.map(file => {
    const fullPath = path.posix.join(fullDir, file.filename);
    let mtime = file.updated_time;
    try {
      const stats = fs.statSync(fullPath);
      mtime = stats.mtime.toISOString();
    } catch (err) {
      // 数据库与文件不匹配
      console.warn(`文件不存在于磁盘上: ${fullPath}`);
    }

    try {
      const result: FileItem = {
        id: file.id!,
        name: file.filename,
        type: file.type,
        modifiedTime: mtime
      }
      return result;
    } catch (error) {
      console.error(`Cannot construct FileItem without fileID`, error);
    }
  });
};

export const createFolder = async (userID: string, folderName: string, relativePath: string) => {
  const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '');
  const safePath = decodeURIComponent(relativePath).replace(/\.\./g, '');
  const folderPath = path.posix.join(uploadDir, safePath, folderNameSanitized);

  if (fs.existsSync(folderPath)) {
    return { success: false, message: "Folder already exists" };
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
      success: true,
      message: 'Folder created successfully',
      folderName
    }
  }catch (err) {
    console.error('创建文件夹失败:', err);
    throw new Error('创建文件夹失败');
  }
};

export const insertFile = async (userID: string, filename: string, relativePath: string, size: number, type: string) => {
  const fileNameSanitized = filename.replace(/[<>:"/\\|?*]/g, '');
  const safePath = decodeURIComponent(relativePath).replace(/\.\./g, '');
  const file: FileRecord = {
    user_id: userID,
    filename: fileNameSanitized,
    filepath: safePath,
    size: size,
    type: type
  };
  
  await FileHandler.insert(file);
};

export const removeFolder = async (id: number, user_id: string) => {
  let folder: FileRecord | undefined;
  try {
     folder = await FileHandler.getById(id, user_id);
     if (folder == undefined) {
      console.warn(`Folder with id: ${id} not found for user: ${user_id}`);
      return false;
    }
  }catch(error) {
    console.error(`Error fetching file with id ${id}:`, error);
    return false;
  }

  try {
    await fs.promises.rm(path.posix.join(uploadDir, folder.filepath, folder.filename), { recursive: true });
    await FileHandler.removeByStartPath(folder.filepath, user_id);
    console.log(`Successfully deleted folder ${folder.filename} at path: ${folder.filepath}`);
  }catch(error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`Folder not found at path: ${folder.filepath}, but proceeding with DB record deletion`);
    } else {
      console.error(`Error deleting file at path ${folder.filepath}:`, error);
      return false;
    }
  }
  await FileHandler.removeById(id);
  return true;
};

export const removeFile = async (id: number, user_id: string): Promise<boolean> => {
  let file: FileRecord | undefined;
  try {
     file = await FileHandler.getById(id, user_id);
     if (file == undefined) {
      console.warn(`File with id: ${id} not found for user: ${user_id}`);
      return false;
    }
  }catch(error) {
    console.error(`Error fetching file with id ${id}:`, error);
    return false;
  }

  try {
    await fs.promises.unlink(path.posix.join(uploadDir, file.filepath, file.filename));
    console.log(`Successfully deleted file ${file.filename} at path: ${file.filepath}`);
  }catch(error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`File not found at path: ${file.filepath}, but proceeding with DB record deletion`);
    } else {
      console.error(`Error deleting file at path ${file.filepath}:`, error);
      return false;
    }
  }
  await FileHandler.removeById(id);
  return true;
};

export const getUploadDir = () => uploadDir;