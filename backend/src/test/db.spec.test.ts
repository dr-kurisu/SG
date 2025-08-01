import { disconnectDB, FileHandler, initDB, UserHandler } from '../services/db_handler';
import { Database } from 'sqlite';
import { clearDatabase } from '../services/utili';
import bcrypt from "bcryptjs";

describe('Database Integration Tests', () => {
  let db: Database;
  const user_id = "admin";
  let originalLog = console.log;
  
  beforeAll(async () => {
    console.log = () => {};
    db = await initDB();
    console.log = originalLog;
  });

  afterAll(async () => {
    console.log = () => {};
    await disconnectDB();
    await clearDatabase();
    console.log = originalLog;
  });

  test('Full file insert and retrieve flow', async () => {
    const file_id = await FileHandler.insert({
      user_id: user_id,
      filename: 'music.mp3',
      filepath: '/music',
      size: 1024,
      type: 'audio/mpeg'
    });
    expect(file_id).toBeDefined();
    const file = await FileHandler.getById(1, user_id);
    expect(file?.id).toBe(1);
    expect(file?.filename).toBe("music.mp3");
    expect(file?.filepath).toBe("/music");
  });
});


describe('File field update', () => {
  let db: Database;
  let originalLog = console.log;

  beforeAll(async () => {
    console.log = () => {};
    db = await initDB();
    console.log = originalLog;
  });

  afterAll(async () => {
    console.log = () => {};
    await disconnectDB();
    await clearDatabase();
    console.log = originalLog;
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

describe('User table test', () => {
  let db: Database;
  let originalLog = console.log;

  beforeAll(async () => {
    console.log = () => {};
    db = await initDB();
    console.log = originalLog;
  });

  afterAll(async () => {
    console.log = () => {};
    await disconnectDB();
    await clearDatabase();
    console.log = originalLog;
  });

  test('Normal case', async() => {
    const passwordHash = await bcrypt.hash("123456", 10);
    const id = await UserHandler.insert("test_user", "test_user", passwordHash, 0);
    const user = await UserHandler.getUserByUserID("test_user");

    expect(id).toBeGreaterThan(0);
    expect(user?.password).toBe(passwordHash);
    expect(user?.permission).toBe(0);
    expect(user?.username).toBe("test_user");
  });

  test('verify correct account', async() => {
    const user = await UserHandler.getUserByUserID("test_user");
    expect(user).toBeDefined();
    const result = await UserHandler.verifyUser("test_user", "123456");
    expect(result).toBeTruthy();
  });

  test('verify incorrect account', async() => {
    const user = await UserHandler.getUserByUserID("test_user");
    expect(user).toBeDefined();
    const result = await UserHandler.verifyUser("test_user", "uksdhfkshd");
    expect(result).toBeFalsy();
  });

  test('update all fields', async() => {
    const id = await UserHandler.insert("test_user_update", "test_user_update", "123456", 0);

    await UserHandler.updateUserID("test_user_update", "test_user_update1");
    await UserHandler.updateUserPassword("test_user_update1", "1234567");
    await UserHandler.updateUserPermission("test_user_update1", 1);
    await UserHandler.updateUsername("test_user_update1", "XD");
    const newUser = await UserHandler.getUserByUserID("test_user_update1");
    const oldUser = await UserHandler.getUserByUserID("test_user_update");
    expect(newUser).toBeDefined();
    expect(oldUser).toBeNull();
    expect(newUser?.id).toBe(id);
    expect(newUser?.password).toBe("1234567");
    expect(newUser?.permission).toBe(1);
    expect(newUser?.username).toBe("XD");

  });

  test('Remove account', async() => {
    const user = await UserHandler.getUserByUserID("test_user");
    expect(user).toBeDefined();
    const result = await UserHandler.removeUserByUserID("test_user");
    expect(result).toBeTruthy();
  });
});



afterAll(async () => {
  console.log = () => {};
  console.error = () => {};
  await disconnectDB();
  await clearDatabase();
});