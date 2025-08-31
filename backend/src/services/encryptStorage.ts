import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { getFileList, getUploadDir } from './storage';

/**
 * 创建或更新一个加密 ZIP 文件
 * @param zipPath 要创建或更新的路径
 * @param filesToAdd 要添加的文件路径数组
 * @param password 加密密码
 */
export const UpdateEncryptedZip = async (
  zipPath: string,
  filesToAdd: string[],
  password: string
) => {
  const isExisting = await fs.pathExists(zipPath);

  if (!isExisting) {
    const quotedFiles = filesToAdd.map(f => `"${f}"`).join(' ');
    const command = `7z a -tzip -p${password} -mem=AES256 "${zipPath}" ${quotedFiles}`;
    await execPromise(command);
    console.log('New encrypted ZIP created:', zipPath);
  } else {
    const tempDir = path.join(getUploadDir(), 'temp', Date.now().toString());
    await fs.mkdirp(tempDir);

    await execPromise(`7z x "${zipPath}" -p${password} -o"${tempDir}" -y`);

    for (const file of filesToAdd) {
      const fileName = path.basename(file);
      await fs.copyFile(file, path.join(tempDir, fileName));
    }

    await execPromise(`7z a -tzip -p${password} -mem=AES256 "${zipPath}" "${tempDir}\\*"`);

    await fs.remove(tempDir);
    console.log('Encrypted ZIP updated:', zipPath);
  }
};


export const getEncryptedFileList = async(user_id: string, queryPath: string, password: string) => {
    const result = await getFileList(user_id, queryPath);
    return result;
}



function execPromise(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('Command failed:', stderr);
        reject(stderr);
      } else {
        resolve();
      }
    });
  });
}
