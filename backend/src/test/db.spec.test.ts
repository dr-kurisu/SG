import { disconnectDB, FileHandler, initDB } from '../services/db_handler';
import { Database } from 'sqlite';
import { clearDatabase } from '../services/utili';

describe('Database Integration Tests', () => {
  let db: Database;
  const user_id = "admin";
  
  beforeAll(async () => {
    db = await initDB();
  });

  afterEach(async () => {
    await disconnectDB();
    await clearDatabase();
  });

  test('Full file insert and retrieve flow', async () => {
    const file_id = await FileHandler.insert({
      user_id: user_id,
      filename: 'music.mp3',
      filepath: '/music',
      size: 1024,
      type: 'audio/mpeg'
    });
    const file = await FileHandler.getById(1, user_id);
    expect(file?.id).toBe(1);
    expect(file?.filename).toBe("music.mp3");
    expect(file?.filepath).toBe("/music");
  });
});


describe('File field update', () => {
  let db: Database;

  beforeEach(async () => {
    db = await initDB();
  });

  afterEach(async () => {
    await disconnectDB();
    await clearDatabase();
  });

  
  test('Normal case', async () => {
    const file_id = await FileHandler.insert({
      user_id: "test",
      filename: 'music.mp3',
      filepath: '/music',
      size: 1024,
      type: 'audio/mpeg'
    });
    const oldFile = await FileHandler.getById(file_id, "test");
    expect(oldFile?.permission).toBe(0);
    const result = await FileHandler.updatePermissionById(file_id, "test", 1);
    const newFile = await FileHandler.getById(file_id, "test");
    expect(result).toBe(true);
    expect(newFile?.permission).toBe(1);
  });

  test('Update require_password', async() => {
    const file_id = await FileHandler.insert({
      user_id: "test",
      filename: "test",
      filepath: "/",
      size: 1000,
      type: "audio/mpeg"
    });
    const oldFile = await FileHandler.getById(file_id, "test");
    expect(oldFile?.require_password).toBe(0);
    await FileHandler.updateRequirePassword(file_id, true);
    const newFile = await FileHandler.getById(file_id, "test");
    expect(newFile?.require_password).toBe(1);
  });
});