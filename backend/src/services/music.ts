import { FileRecord, MusicRecord } from "./types"
import { MusicHandler, FileHandler } from "./db_handler"


export const insertMusicRecord = async (
    user_id: string, 
    filename: string, 
    filepath: string,
    duration: number,
    type: string,
    size: number) => 
{
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
        filename: filename,
        filepath: filepath,
        duration: duration,
        size: size,
        type: type
    };
    await MusicHandler.insert(music);
}