import { PlayListEntryHandler, initDB } from '../services/db_handler';
import { Database } from 'sqlite';
import { PlaylistEntry } from '../services/types';

// Mock the sqlite module
jest.mock('sqlite', () => ({
  open: jest.fn()
}));
jest.mock('sqlite3', () => ({
  Database: jest.fn()
}));

describe('PlayListEntryHandler', () => {
  let mockDb: Partial<Database>;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock database with necessary methods
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      exec: jest.fn()
    };
    
    // Mock initDB to return our mock database
    jest.spyOn(require('../services/db_handler'), 'initDB').mockResolvedValue(mockDb as Database);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getEntriesByPlayListID', () => {
    it('should return playlist entries for valid playlist ID and user ID', async () => {
      const mockEntries: PlaylistEntry[] = [
        { id: 1, playlist_id: 1, music_id: 1, position: 0 },
        { id: 2, playlist_id: 1, music_id: 2, position: 1 }
      ];
      
      (mockDb.all as jest.Mock).mockResolvedValue(mockEntries);
      
      const result = await PlayListEntryHandler.getEntriesByPlayListID(1, 'test');
      
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM playlistEntries'),
        ['test', 1]
      );
      expect(result).toEqual(mockEntries);
    });

    it('should return empty array when database query fails', async () => {
      (mockDb.all as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const result = await PlayListEntryHandler.getEntriesByPlayListID(1, 'test1');
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Fail to get playList entry with ID: 1 and userID: test1')
      );
    });
  });
});