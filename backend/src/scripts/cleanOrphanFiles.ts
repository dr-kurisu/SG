import path from 'path';
import fs from 'fs';
import { FileHandler } from '../services/db_handler'
import { getUploadDir } from '../services/storage'

// Have not tested
export const cleanupOrphanFiles = async (user_id: string, queryPath = '/') => {
  const safePath = decodeURIComponent(queryPath || '/').replace(/\.\./g, '');
  const fullDir = path.posix.join(getUploadDir(), user_id, safePath);

  let dbFiles;
  try {
    dbFiles = await FileHandler.getFilesByPath(user_id, safePath);
  } catch (err) {
    console.error('获取数据库文件失败:', err);
    return;
  }

  const orphanFiles = dbFiles.filter(file => {
    const fullPath = path.posix.join(fullDir, file.filename);
    return !fs.existsSync(fullPath);
  });

  if (orphanFiles.length === 0) {
    console.log('没有幽灵文件需要清理');
    return;
  }

  console.log(`发现 ${orphanFiles.length} 个幽灵文件，即将删除数据库记录:`);
  orphanFiles.forEach(file => console.log(` - ${file.filename}`));

  await Promise.all(orphanFiles.map(file => FileHandler.removeById(file.id!)));

  console.log('幽灵文件清理完成');
};