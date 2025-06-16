import { FileHandler, MusicHandler, PlayListEntryHandler, PlayListHandler, initDB } from '../services/db_handler';
import { Database } from 'sqlite';
import { clearDatabase } from '../services/utili';
import { FileRecord, MusicRecord, PlayList, PlaylistEntry } from '../services/types';

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

  // upload file with invlaid character

  // upload single valid file

  // upload file path invalid


  // test playlistEntry
  test('getEntriesByPlayListID returns entries for valid user and playlist', async () => {
      const user_id = "test";
      // insert mock file
      const mockFile: FileRecord = {
          user_id: user_id,
          filename: 'test.mp3',
          filepath: '/',
          size: 0,
          type: 'Audio/mp3'
      }
      const file_id = await FileHandler.insert(mockFile);
  
      // insert mock music
      const mockMusic: MusicRecord = {
          file_id: file_id,
          duration: 666,
          user_id: user_id,
          filename: "test.mp3",
          filepath: '/',
          size: 0,
          type: 'Audio/mp3'
      } 
      const music_id = await MusicHandler.insert(mockMusic);
  
      // insert mock playlist
      const mockPlaylist: PlayList = {
          user_id: user_id,
          name: "MockPlatlist",
          description: null,
          cover_path: null,
          created_time: '',
          is_public: false
      };
      const playlist_id = await PlayListHandler.insertPlayList(mockPlaylist);
  
  
      // insert mock playlist entry
      const mockEntry: PlaylistEntry = {
          playlist_id,
          music_id
      }
    await PlayListEntryHandler.insertEntryByPlayListID(user_id, mockEntry);
  
    const result = await PlayListEntryHandler.getEntriesByPlayListID(100, 'test');

    expect(result.length).toBe(1);
    expect(result[0].music_id).toBe(music_id);
    expect(result[0].position).toBe(0);
    expect(result[0].playlist_id).toBe(playlist_id);
  });
  
});