import { FileRecord, MusicRecord } from "./types"
import { MusicHandler, FileHandler } from "./db_handler"

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

// Get all music in given playlist


// Add Music into given playlist


// Remove music from given playlist


// Get all playlist


// Remove playlist


