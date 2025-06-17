// routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  createFolder,
  getFileList,
  storage,
  insertFile,
  removeFile,
  removeFolder,
  getNumberofFile
} from '../services/storage';

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
  try {
    await insertFile(userID, req.file.filename, relativePath, req.file.size, req.file.mimetype);
  } catch (error) {
    console.error('Error inserting file record:', error);
    res.status(500).send('Error saving file record');
    return;
  }

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
  if (!currentPath) {
    res.status(400).send('currentPath is required');
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

storageRouter.get('/filenumber', async (req: Request, res: Response) =>{
  const {currentPath} = req.body
  if (!currentPath) {
    res.status(400).send('Folder name is required');
    return;
  }
  const userId = "admin";
  try{
    const result = await getNumberofFile(userId,currentPath);
    res.json({ num: result, message: "Successfully get file number" });

  }catch (error: any){
    res.status(400).send(error.message);
  }

});

// 删除指定文件
storageRouter.delete('/delete/:id', async (req: Request, res: Response) => {
  const user_id = "admin";
  try {
    await removeFile(Number(req.params.id), user_id);
    res.status(200).json({ message: "File deleted successfully" });
  }catch(error) {
    res.status(500).json({ error: "Deletion of file failed" });
  }
});

storageRouter.delete('/deleteFolder/:id', async (req: Request, res: Response) => {
  const user_id = "admin";
  try {
    const result = await removeFolder(Number(req.params.id), user_id);
    if (result) {
      res.status(200).json({ message: "Folder deleted successfully" });
    } else {
      res.status(404).json({ error: "Folder not found or no permission" });
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: "Deletion of folder failed" });
  }
});



export default storageRouter
