export interface Song {
  id: string
  title: string
  artist: string
  url: string
  cover: string
  duration: number  // 单位：秒
}

export interface Playlist {
  id: string
  name: string
  description: string
  cover: string
  songs: Song[]
}


export interface PlayerState {
  currentSong: Song | null
  playlist: Song[]
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
}