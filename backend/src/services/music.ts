import { FileRecord, MusicRecord, PlayList, PlaylistEntry } from "./types"
import { MusicHandler, FileHandler, PlayListHandler, PlayListEntryHandler } from "./db_handler"

// Insert music into database
export const insertMusicRecord = async (
    user_id: string, 
    filename: string, 
    filepath: string,
    duration: number,
    type: string,
    size: number) => 
{
    const fileNameSanitized = filename.replace(/[<>:"/\\|?*]/g, '');
    const safePath = decodeURIComponent(filepath).replace(/\.\./g, '');
    if (safePath !== filepath) {
        console.warn(`user ${user_id} upload invalid filepath ${filepath}`);
        console.warn("convert path to", safePath);
    }
    const file: FileRecord = {
        user_id: user_id,
        filename: filename,
        filepath: filepath,
        type: type,
        size: size
    }
    const file_id = await FileHandler.insert(file);
    const music: MusicRecord = {
        file_id: file_id,
        user_id: user_id,
        filename: fileNameSanitized,
        filepath: safePath,
        duration: duration,
        size: size,
        type: type
    };
    await MusicHandler.insert(music);
}

// Get Music by given path
export const getMusicByPath = async (user_id: string, path: string) => {
    const music = await MusicHandler.getMusicByPath(user_id, path);
    return music;
}
// Get music by id and user id
export const getMusicByFileID = async (user_id: string, file_id: number): Promise<MusicRecord | undefined> => {
    try {
        const music = await MusicHandler.getMusicByFileID(user_id, file_id);
        return music;
    }catch (error) {
        console.log(error);
        return undefined;
    }
}

// Get all music entries in given playlist
export const getEntriesByPlayListID = async (playlist_id: number, user_id: string): Promise<PlaylistEntry[] | []> => {
    try {
        const entries = await PlayListEntryHandler.getEntriesByPlayListID(playlist_id, user_id);
        return entries;
    } catch(error) {
        console.error(error);
        return [];
    }
};


// Add Music into given playlist
export const insertEntryByPlayListID = async (
  user_id: string,
  playlist_id: number,
  music_id: number
): Promise<number> => {
  const playlistEntry: PlaylistEntry = {
    playlist_id,
    music_id
  };

  try {
    const lastID = await PlayListEntryHandler.insertEntryByPlayListID(user_id, playlistEntry);
    if (!lastID) throw new Error("No lastID returned");
    return lastID;
  } catch (error) {
    throw new Error(`Failed to insert entry into playlist ${playlist_id}: ${(error as Error).message}`);
  }
};


// Remove music from given playlist
export const removeEntryByPlayListIDByEntryID = async (
    user_id: string,
    playlist_id: number,
    entry_id: number
): Promise<void> => {
    try {
        const result = await PlayListEntryHandler.removeEntryByPlayListIDByEntryID(user_id, playlist_id, entry_id);
        if (!result) throw new Error("Fail to delete entry");
    } catch(error) {
        throw new Error("Fail to delete entry");
    }
}


// Get all playlist
export const getAllPlaylist = async (user_id: string): Promise<PlayList[] | []> => {
    try {
        const playlists = await PlayListHandler.getPlayListsByUserID(user_id);
        return playlists;
    } catch(error) {
        console.error(error);
        return [];
    }
};


// Remove playlist
export const removePlaylist = async (playlist_id: number, user_id: string): Promise<boolean> => {
    try {
        const result = await PlayListHandler.removePlayListByID(playlist_id, user_id);
        return result;
    }catch (error) {
        console.error(error);
        return false;
    }
};

// Create new playlist
export const createPlaylist = async (
    user_id: string,
    name: string,
    description?: string,
    cover_path?: string
): Promise<number> => {
    try {
        const playlist: PlayList = {
            user_id,
            name,
            description: description || null,
            cover_path: cover_path || null,
            created_time: new Date().toISOString(),
            is_public: false
        };
        const playlist_id = await PlayListHandler.insertPlayList(playlist);
        return playlist_id;
    } catch (error) {
        throw new Error(`Failed to create playlist: ${(error as Error).message}`);
    }
};