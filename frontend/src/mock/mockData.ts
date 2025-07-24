export interface Song {
  id: string
  title: string
  artist: string
  url: string
  cover: string
  duration: number  // 单位：秒
}

export const mockPlaylist: Song[] = [
  {
    id: '1',
    title: 'Test Song 1',
    artist: 'Demo Artist',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://via.placeholder.com/150',
    duration: 240,
  },
  {
    id: '2',
    title: 'Test Song 2',
    artist: 'Another Artist',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://via.placeholder.com/150',
    duration: 180,
  },
  {
    id: '3',
    title: 'Test Song 3',
    artist: 'Sample Band',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://via.placeholder.com/150',
    duration: 300,
  },
]