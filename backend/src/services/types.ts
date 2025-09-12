export interface FileRecord {
    id?: number,
    user_id: string,
    filename: string,
    filepath: string, // Relative path
    size: number,  // bytes
    type: string,
    created_time?: string,
    updated_time?: string,
    is_deleted?: boolean,
    permission?: number,
}

export interface FileItem {
    id: number,
    name: string,
    type: string,
    modifiedTime?: string,
    permission?: number,
}

export interface ProtectedFileRecord {
    id?: number,
    file_id: number,
    password_hash: string
}

export interface UserRecord {
    id?: number,
    username: string,
    user_id: string,
    password: string,
    permission: number,
}

export interface SongRecord extends FileRecord {
    song_id?: number,
    file_id: number,
    title: string,
    artist?: string,
    duration: number,
    cover?: string,
}

export interface Playlist {
    id?: number,
    name: string,
    user_id: string,
    description: string | null,
    cover: string | null,
    created_at?: string,
}

