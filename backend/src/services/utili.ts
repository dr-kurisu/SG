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


type ConsoleMethods = 'log' | 'error' | 'warn' | 'info' | 'debug';
const originals: Partial<Record<ConsoleMethods, (...args: any[]) => void>> = {};
//注意 ！！！ 这里的修改是全局的 不能进行并行的测试执行 会出现问题
export function muteConsole(methods: ConsoleMethods[] = ['log']) {
    for (const method of methods) {
        if (!originals[method]) {
            originals[method] = console[method];
        }
        console[method] = () => {};
    }
    
    return () => {
        for (const method of methods) {
            if (originals[method]) {
                console[method] = originals[method]!;
            }
        }
    };
}


