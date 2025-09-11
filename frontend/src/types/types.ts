export interface Song {
  id: number
  file_id: number
  url?: string
  title: string
  artist: string
  cover: string
  duration: number  // 单位：秒
}

export interface Playlist {
  id?: number
  name: string
  description?: string
  cover?: string
  songs?: Song[]
}


export interface PlayerState {
  currentSong: Song | null
  currentUrl: string | null
  playlist: Song[]
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  modifiedTime: string;
}

export interface Breadcrumb {
    id: number;
    name: string;
}