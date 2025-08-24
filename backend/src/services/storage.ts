import fs from 'fs'
import path from 'path'
import multer from 'multer';
import { FileHandler } from './db_handler'; './db_handler';
import { FileRecord, FileItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(__dirname, '../../uploads').replace(/\\/g, '/');


export const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Get user_id
        const user_id = req.user!.user_id;
        if (!user_id) return cb(new Error('User ID missing'), '');

        const rawPath = typeof req.query.path === 'string' ? req.query.path : '';
        const relativePath = decodeURIComponent(rawPath).replace(/\.\./g, '');

        const fullPath = path.posix.join(uploadDir, user_id, relativePath);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const decodedFileName = decodeURIComponent(file.originalname);
        const fileParts = decodedFileName.split('.');
        const name = fileParts.slice(0, -1).join('.');
        const extension = fileParts[fileParts.length - 1];
        const newFileName = `${name}__${uuidv4().replace(/-/g, '')}.${extension}`;
        cb(null, newFileName);
    }
});


export const getFileList = async (user_id: string, queryPath: string) => {
    const safePath = decodeURIComponent(queryPath || '/').replace(/\.\./g, '');
    const fullDir = path.posix.join(uploadDir, user_id, safePath);
    let dbFiles: FileRecord[];
    try {
        dbFiles = await FileHandler.getFilesByPath(user_id, safePath);
    } catch (err) {
        console.log(err);
        return [];
    }

    return dbFiles.map(file => {
        const fullPath = path.posix.join(fullDir, file.filename);
        let mtime = file.updated_time;
        try {
            const stats = fs.statSync(fullPath);
            mtime = stats.mtime.toISOString();
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                console.warn(`文件不存在于磁盘上: ${fullPath}`);
            } else {
                console.error(`读取文件失败: ${fullPath}`, err);
            }
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

export const createFolder = async (user_id: string, folderName: string, relativePath: string) => {
    const folderNameSanitized = folderName.replace(/[<>:"/\\|?*]/g, '');
    const safePath = decodeURIComponent(relativePath).replace(/\.\./g, '');
    const folderPath = path.posix.join(uploadDir, user_id, safePath, folderNameSanitized);

    if (fs.existsSync(folderPath)) {
        return { success: false, message: "Folder already exists" };
    }

    try {
        fs.mkdirSync(folderPath);

        // update info in DB
        const folderRecord: FileRecord = {
            user_id: user_id,
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
    } catch (err) {
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
        type: type,
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
    } catch (error) {
        console.error(`Error fetching file with id ${id}:`, error);
        return false;
    }

    if (folder.type !== 'folder') {
        console.warn(`ID ${id} is not a folder, cannot delete`);
        return false;
    }

    if (folder.filename === 'Music') {
        console.warn(`Do no have permission to delete Music folder`);
        return false;
    }

    if (folder.permission == null) {
        console.error(`${path.posix.join(folder.filepath, folder.filename)} Has No Necessary Field Permission ! `);
        return false;
    }

    if (folder.permission > 0) {
        console.warn('Do not have permission to delete folder');
        return false;
    }

    try {
        await fs.promises.rm(path.posix.join(uploadDir, user_id, folder.filepath, folder.filename), { recursive: true });
        await FileHandler.removeByStartPath(path.posix.join(folder.filepath, folder.filename), user_id);
        console.log(`Successfully deleted folder ${folder.filename} at path: ${folder.filepath}`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`Folder not found at path: ${folder.filepath}, proceeding with DB record deletion`);
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

        if (!file) {
            console.warn(`File with id: ${id} not found for user: ${user_id}`);
            return false;
        }
        if (file.permission == null) {
            console.error(file?.filename + ` Has No Necessary Field Permission ! `);
            return false;
        }
        if (file.permission > 0) {
            console.warn('Do not have permission to delete folder');
            return false;
        }
    } catch (error) {
        console.error(`Error fetching file with id ${id}:`, error);
        return false;
    }

    // Physical deletion
    try {
        await fs.promises.unlink(path.posix.join(uploadDir, user_id, file.filepath, file.filename));
        console.log(`Successfully deleted file ${file.filename} at path: ${file.filepath}`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`File not found at path: ${file.filepath}, proceeding with DB record deletion`);
        } else {
            console.error(`Error deleting file at path ${file.filepath}:`, error);
            return false;
        }
    }
    await FileHandler.removeById(id);
    return true;
};

export const removeFileOrFolder = async(file: FileRecord) => {
    if (file.type === 'folder') {
        removeFolder(file.id!, file.user_id);
    }else {
        removeFile(file.id!, file.user_id);
    }
}

export const getUploadDir = () => uploadDir;