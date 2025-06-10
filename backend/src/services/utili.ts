import path from "path";
import fs from "fs";
import { getUploadDir, insertFile } from "./storage";
import { FileRecord } from "./types";
import { FileHandler } from "./db_handler";
import { lookup } from "mime-types";


export const clearDatabase = () => {
  const dbPath = path.resolve(__dirname, '../../data/files.db');
  try {
    fs.unlinkSync(dbPath);
    console.log(`数据库删除成功`);
  } catch (err) {
    console.error(`数据库删除失败`, err);
  }
}

export const scanDirectory = async (dirRelativePath: string): Promise<string[]> => {
  const dirPath = path.posix.join(getUploadDir(), dirRelativePath);
  console.log(`开始扫描目录: ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`目录不存在: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const filePaths: string[] = [];

  for (const file of files) {
    const fullPath = path.posix.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      console.log(`创建文件夹: ${file} 在路径: ${dirRelativePath}`);
      const folderRecord: FileRecord = {
        user_id: "admin",
        filename: file,
        filepath: dirRelativePath,
        size: 0,
        type: "folder",
      };
      await FileHandler.insert(folderRecord); // 添加 await
      const subDirFiles = await scanDirectory(path.posix.join(dirRelativePath, file));
      filePaths.push(...subDirFiles);
    } else {
      if (!dirRelativePath.endsWith('/')) {
        dirRelativePath += '/';
      }

      console.log(`插入文件: ${file} 在路径: ${dirRelativePath}`);
      const type = lookup(fullPath) || "file";
      const size = fs.statSync(fullPath).size;
      await insertFile("admin", file, dirRelativePath, size, type);
    }
  }
  return filePaths;
}


export const clearDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) return;

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.posix.join(dirPath, file);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}