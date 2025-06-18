import {
  insertMusicRecord,
  getMusicByPath,
  getMusicByFileID,
  getEntriesByPlayListID,
  insertEntryByPlayListID,
  removeEntryByPlayListIDByEntryID,
  getAllPlaylist,
  removePlaylist
} from '../services/music';

import {
  MusicHandler,
  FileHandler,
  PlayListHandler,
  PlayListEntryHandler
} from '../services/db_handler';

jest.mock('../services/db_handler', () => ({
  FileHandler: { insert: jest.fn() },
  MusicHandler: {
    insert: jest.fn(),
    getMusicByPath: jest.fn(),
    getMusicByFileID: jest.fn()
  },
  PlayListHandler: {
    getPlayListsByUserID: jest.fn(),
    removePlayListByID: jest.fn()
  },
  PlayListEntryHandler: {
    getEntriesByPlayListID: jest.fn(),
    insertEntryByPlayListID: jest.fn(),
    removeEntryByPlayListIDByEntryID: jest.fn()
  }
}));

describe('insertMusicRecord', () => {
  it('should sanitize filename and call handlers', async () => {
    (FileHandler.insert as jest.Mock).mockResolvedValue(1);
    (MusicHandler.insert as jest.Mock).mockResolvedValue(undefined);

    await insertMusicRecord('u1', 'a.mp3', '/safe/path.mp3', 100, 'audio', 2048);

    expect(FileHandler.insert).toHaveBeenCalled();
    expect(MusicHandler.insert).toHaveBeenCalled();
  });
});

describe('getMusicByPath', () => {
  it('should return music by path', async () => {
    (MusicHandler.getMusicByPath as jest.Mock).mockResolvedValue('music');
    const result = await getMusicByPath('u1', '/path');
    expect(result).toBe('music');
  });
});

describe('getMusicByFileID', () => {
  it('should return music or undefined on error', async () => {
    (MusicHandler.getMusicByFileID as jest.Mock).mockResolvedValue('music');
    expect(await getMusicByFileID('u1', 1)).toBe('music');

    (MusicHandler.getMusicByFileID as jest.Mock).mockRejectedValue(new Error());
    expect(await getMusicByFileID('u1', 1)).toBeUndefined();
  });
});

describe('getEntriesByPlayListID', () => {
  it('should return entries or [] on error', async () => {
    (PlayListEntryHandler.getEntriesByPlayListID as jest.Mock).mockResolvedValue(['entry']);
    expect(await getEntriesByPlayListID(1, 'u1')).toEqual(['entry']);

    (PlayListEntryHandler.getEntriesByPlayListID as jest.Mock).mockRejectedValue(new Error());
    expect(await getEntriesByPlayListID(1, 'u1')).toEqual([]);
  });
});

describe('insertEntryByPlayListID', () => {
  it('should return lastID if success', async () => {
    (PlayListEntryHandler.insertEntryByPlayListID as jest.Mock).mockResolvedValue(123);
    expect(await insertEntryByPlayListID('u1', 1, 2)).toBe(123);
  });

  it('should throw if no lastID or error', async () => {
    (PlayListEntryHandler.insertEntryByPlayListID as jest.Mock).mockResolvedValue(undefined);
    await expect(insertEntryByPlayListID('u1', 1, 2)).rejects.toThrow();

    (PlayListEntryHandler.insertEntryByPlayListID as jest.Mock).mockRejectedValue(new Error());
    await expect(insertEntryByPlayListID('u1', 1, 2)).rejects.toThrow();
  });
});

describe('removeEntryByPlayListIDByEntryID', () => {
  it('should succeed when handler returns true', async () => {
    (PlayListEntryHandler.removeEntryByPlayListIDByEntryID as jest.Mock).mockResolvedValue(true);
    await expect(removeEntryByPlayListIDByEntryID('u1', 1, 1)).resolves.toBeUndefined();
  });

  it('should throw if handler returns false or throws', async () => {
    (PlayListEntryHandler.removeEntryByPlayListIDByEntryID as jest.Mock).mockResolvedValue(false);
    await expect(removeEntryByPlayListIDByEntryID('u1', 1, 1)).rejects.toThrow();

    (PlayListEntryHandler.removeEntryByPlayListIDByEntryID as jest.Mock).mockRejectedValue(new Error());
    await expect(removeEntryByPlayListIDByEntryID('u1', 1, 1)).rejects.toThrow();
  });
});

describe('getAllPlaylist', () => {
  it('should return playlists or [] on error', async () => {
    (PlayListHandler.getPlayListsByUserID as jest.Mock).mockResolvedValue(['p1']);
    expect(await getAllPlaylist('u1')).toEqual(['p1']);

    (PlayListHandler.getPlayListsByUserID as jest.Mock).mockRejectedValue(new Error());
    expect(await getAllPlaylist('u1')).toEqual([]);
  });
});

describe('removePlaylist', () => {
  it('should return true or false based on result', async () => {
    (PlayListHandler.removePlayListByID as jest.Mock).mockResolvedValue(true);
    expect(await removePlaylist(1, 'u1')).toBe(true);

    (PlayListHandler.removePlayListByID as jest.Mock).mockRejectedValue(new Error());
    expect(await removePlaylist(1, 'u1')).toBe(false);
  });
});
