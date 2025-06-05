import { FileHandler, MusicHandler, initDB } from '../services/db_handler';
import { Database } from 'sqlite';
import { clearDatabase } from '../services/utili';

describe('Database Integration Tests', () => {
  let db: Database;
  const user_id = "admin";
  
  beforeAll(async () => {
    // 使用真实初始化逻辑
    clearDatabase();
    db = await initDB();
  });

  test('Full file insert and retrieve flow', async () => {
    const fileId = await FileHandler.insert({
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
  
  test('Full music insert and retrieve flow', async () => {   
    const musicId = await MusicHandler.insert({
        file_id: 1,
        duration: 60,
        user_id: user_id,
        filename: "music.mp3",
        filepath: '/music',
        size: 0,
        type: 'audio/mpeg'
    });
    
    const [music] = await MusicHandler.getAll();
    expect(musicId).toBe(music.id);
    expect(music.filepath).toBe('/music');
    expect(music.filename).toBe('music.mp3');
  });

  test('No musicRecord in table', async () => {
    const music = await MusicHandler.getByFileId(2, "admin");
    expect(music).toBe(undefined);
  });
});