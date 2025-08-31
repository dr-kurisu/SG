import { SongHandler } from "./db_handler"

export async function getSongBySongID(song_id: number) {
    return await SongHandler.getSongByID(song_id);
}

export async function removeSongBySongID(song_id: number) {
    return await SongHandler.removeSongByID(song_id);
}