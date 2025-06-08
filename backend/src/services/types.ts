export interface FileRecord {
  id?: number;
  user_id: string;
  filename: string;
  filepath: string; // Relative path
  size: number;
  type: string;
  created_time?: string;
  updated_time?: string;
  is_deleted?: boolean;
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  modifiedTime?: string;
}

export interface MusicRecord extends FileRecord{
  file_id: number; // foreign key
  artist?: string;
  year?: number;
  duration: number;
  bitrate?: number;
  cover_path?: string;
}