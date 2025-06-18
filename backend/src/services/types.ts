export interface FileRecord {
  id?: number;
  user_id: string;
  filename: string;
  filepath: string; // Relative path
  size: number;  // bytes
  type: string;
  created_time?: string;
  updated_time?: string;
  is_deleted?: boolean;
  permission?: number;

}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  modifiedTime?: string;
  permission?: number;
}

export interface MusicRecord extends FileRecord{
  file_id: number; // foreign key
  artist?: string;
  year?: number;
  duration: number;
  bitrate?: number;
  cover_path?: string;
}

export interface PlayList {
  id?: number;
  user_id: string;
  name: string;
  description: string | null;
  cover_path: string | null;
  created_time: string;
  is_public: boolean;
}

export interface PlaylistEntry {
  id?: number;
  playlist_id: number;
  music_id: number;
  position?: number;
  added_at?: string;
}
