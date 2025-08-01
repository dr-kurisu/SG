import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryDelete(filePath, retries = 5, delay = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`test.db deleted after tests at attempt ${i + 1}`);
        return;
      } else {
        console.log("test.db not found:", filePath);
        return;
      }
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed to delete test.db: ${err.message}`);
      await wait(delay);
    }
  }
  console.error(`Failed to delete test.db after ${retries} attempts.`);
}

export default async function () {
  const dbPath = path.resolve(__dirname, '../data/test.db');
  await tryDelete(dbPath);
}
