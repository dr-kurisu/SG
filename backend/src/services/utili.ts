import path from "path";
import fs from "fs";


export const clearDatabase = () => {
  const dbName = process.env.NODE_ENV === 'test' ? "test.db" : "files.db"
  const dbPath = path.resolve(__dirname, `../../data/${dbName}`);
  try {
    fs.unlinkSync(dbPath);
    console.log(`Database was deleted`);
  } catch (err) {
    console.error(`Fail to delete database`);
  }
}


export const clearDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) return;

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.posix.join(dirPath, file);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}