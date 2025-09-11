// routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createFolder, getFileList, storage, insertFile, removeFile, removeFolder } from '../services/storage';
import path from 'path';
import logger from '../logger/logger';

const storageRouter = Router()

export const upload = multer({
    storage,
    limits: { fileSize: 1000 * 1024 * 1024 }
})

// 获取文件/文件夹列表
storageRouter.get('/files', async (req: Request, res: Response): Promise<any> => {
    // Get files by given current folder id will be better
    let user_id: string | undefined;
    let folder_id: number | undefined;
    try {
        folder_id = Number(req.query.folder_id);
        user_id = req.user!.user_id;

        // root folder or not valid folder_id
        if (isNaN(folder_id) || folder_id < 0) {
            const files = await getFileList(user_id!, -1);
            logger.info(`Get root files { user_id: ${user_id}, count: ${files.length} }`);
            return res.status(200).json(files);
        }else {
            const files = await getFileList(user_id!, folder_id);
            logger.info(`Get files { user_id: ${user_id}, folder_id: ${folder_id}, count: ${files.length} }`);
            return res.status(200).json(files);
        }
    }catch(err: any) {
        logger.error("Fail to get files in /api/files", {
            error: err.message,
            stack: err.stack,
            user_id: user_id ?? "unknown",
            folder_id: folder_id ?? "unknown"
        });
        return res.status(500).json({ error: "Internal Error" });
    }
})

// 上传文件
storageRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }
    const user_id = req.user!.user_id;
    const relativePath = req.query.path as string || "/";

    // insert data in DB
    try {
        await insertFile(user_id, req.file.filename, relativePath, req.file.size, req.file.mimetype);
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

// 上传文件夹
storageRouter.post('/upload-folder', upload.array('files'), async (req, res): Promise<any> => {
    const user_id = req.user!.user_id;
    const relativePaths: string[] = JSON.parse(req.body.paths || "[]");
    const folders: string[] = JSON.parse(req.body.folders || "[]");
    const currentPath = req.query.path as string | "/";
    const files = req.files as Express.Multer.File[];

    logger.info(`Attemping to add folder with ${files.length} files by user_id: ${user_id}`);

    logger.debug(`Folders: ${folders}`);
    logger.debug(`Paths: ${relativePaths}`);

    const failure: string[] = [];

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!relativePaths || relativePaths.length !== files.length) {
            return res.status(400).json({ message: 'wrong relative paths length' });
        }

        // Add files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dirPath = path.posix.dirname(relativePaths[i]);
            const fileRelativePath = path.posix.join(currentPath, dirPath);
            await insertFile(user_id, file.filename, fileRelativePath, file.size, file.mimetype);
        }

        // Add folders (BFS should be fine)
        for (const folderPath of folders) {
            const folderName = path.basename(folderPath);
            let relativePath = path.dirname(path.posix.join(currentPath, folderPath));
            if (!relativePath.endsWith("/")) {
                relativePath += "/";
            }
            const result = await createFolder(user_id, folderName, relativePath);
            if (!result) {
                failure.push(folderPath);
            }
        }

        res.status(201).json({ success: true, failure });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '上传失败' });
    }
});

// 创建文件夹
storageRouter.post('/createFolder', async (req: Request, res: Response) => {
    const { folderName, currentPath } = req.body
    const user_id = req.user!.user_id;
    if (!folderName) {
        res.status(400).send('Folder name is required');
        return;
    }
    try {
        const result = await createFolder(user_id, folderName, currentPath);
        if (!result.success) {
            res.status(409).send(result.message); // 409 表示冲突
            return;
        } else {
            res.send(result);
        }

    } catch (error: any) {
        res.status(400).send(error.message);
    }
});

// 删除指定文件
storageRouter.delete('/delete/:id', async (req: Request, res: Response) => {
    const user_id = req.user!.user_id;
    try {
        await removeFile(Number(req.params.id), user_id);
        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Deletion of file failed" });
    }
});

storageRouter.delete('/deleteFolder/:id', async (req: Request, res: Response) => {
    const user_id = req.user!.user_id;
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
