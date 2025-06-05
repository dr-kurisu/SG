import path from "path";
import fs from "fs";


export const clearDatabase = () => {
  const dbPath = path.resolve(__dirname, '../../data/files.db');
  try {
    fs.unlinkSync(dbPath);
    console.log(`数据库删除成功`);
  } catch (err) {
    console.error(`数据库删除失败`, err);
  }
}


export const clearDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) return;

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}