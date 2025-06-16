// __tests__/playlist-entry-handler.test.ts
import { MusicHandler, PlayListEntryHandler, FileHandler, initDB, PlayListHandler } from '../services/db_handler';
import { FileRecord, MusicRecord, PlayList, PlaylistEntry } from '../services/types';

jest.mock('../services/db_handler.ts');

const mockAll = jest.fn();
const mockGet = jest.fn();
const mockRun = jest.fn();

beforeEach(() => {
  (initDB as jest.Mock).mockResolvedValue({
    all: mockAll,
    get: mockGet,
    run: mockRun,
  });
});

test('getEntriesByPlayListID returns entries for valid user and playlist', async () => {
  const mockEntries: PlaylistEntry[] = [
    { id: 1, playlist_id: 100, music_id: 200, position: 0 },
  ];
  mockAll.mockResolvedValue(mockEntries);

  const result = await PlayListEntryHandler.getEntriesByPlayListID(100, 'test');

  // expect(initDB).toHaveBeenCalled();
  expect(mockAll).toHaveBeenCalledWith(expect.stringContaining('JOIN playlist'), ['test', 100]);
  expect(result).toEqual(mockEntries);
});
