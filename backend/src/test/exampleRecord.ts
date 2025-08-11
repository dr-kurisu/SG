import { FileRecord, Playlist, SongRecord } from "../services/types";

export const exampleFileRecord: FileRecord = {
    user_id: "example_user",
    filename: "example_filename",
    filepath: "/",
    size: 1024,
    type: 'audio/mpeg'
};

export const examplePlaylistRecord: Playlist = {
    name: 'example_playlist',
    user_id: 'example_user',
    description: 'No FK Description',
    cover: 'example_cover_path',
};

export const exampleSongRecord: SongRecord = {
    ...exampleFileRecord,
    file_id: 1,
    title: "test_song",
    duration: 120
}

export const examplePlaylist: Playlist = {
    name: "test_playlist",
    user_id: "test_user",
    description: null,
    cover: null
}