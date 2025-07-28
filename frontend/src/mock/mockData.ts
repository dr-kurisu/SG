import type { Song, Playlist } from "@/types/types"

export const mockSongs: Song[] = [
  {
    id: '1',
    title: '春天里',
    artist: '汪峰',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/150/150?random=11',
    duration: 180,
  },
  {
    id: '2',
    title: '夜空中最亮的星',
    artist: '逃跑计划',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/150/150?random=12',
    duration: 240,
  },
  {
    id: '3',
    title: '南山南',
    artist: '马頔',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/150/150?random=13',
    duration: 301,
  },
  {
    id: '4',
    title: '平凡之路',
    artist: '朴树',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: 'https://picsum.photos/150/150?random=14',
    duration: 256,
  },
  {
    id: '5',
    title: '海阔天空',
    artist: 'Beyond',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    cover: 'https://picsum.photos/150/150?random=15',
    duration: 325,
  },
  {
    id: '6',
    title: '追光者',
    artist: '岑宁儿',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    cover: 'https://picsum.photos/150/150?random=16',
    duration: 198,
  },
  {
    id: '7',
    title: '稻香',
    artist: '周杰伦',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    cover: 'https://picsum.photos/150/150?random=17',
    duration: 210,
  },
  {
    id: '8',
    title: '小幸运',
    artist: '田馥甄',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    cover: 'https://picsum.photos/150/150?random=18',
    duration: 215,
  },
  {
    id: '9',
    title: '成都',
    artist: '赵雷',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    cover: 'https://picsum.photos/150/150?random=19',
    duration: 328,
  },
  {
    id: '10',
    title: '光辉岁月',
    artist: 'Beyond',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    cover: 'https://picsum.photos/150/150?random=20',
    duration: 271,
  },
]

export const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    name: '华语经典',
    description: '收录华语乐坛经典歌曲',
    cover: 'https://picsum.photos/300/300?random=1',
    songs: [mockSongs[4], mockSongs[9], mockSongs[2], mockSongs[3]]
  },
  {
    id: 'p2',
    name: '流行热歌',
    description: '当下最流行的热门歌曲',
    cover: 'https://picsum.photos/300/300?random=2',
    songs: [mockSongs[5], mockSongs[7], mockSongs[8], mockSongs[6]]
  },
  {
    id: 'p3',
    name: '摇滚精选',
    description: '热血沸腾的摇滚乐集合',
    cover: 'https://picsum.photos/300/300?random=3',
    songs: [mockSongs[0], mockSongs[1], mockSongs[4], mockSongs[9]]
  },
  {
    id: 'p4',
    name: '安静聆听',
    description: '舒缓心情的轻音乐',
    cover: 'https://picsum.photos/300/300?random=4',
    songs: [mockSongs[2], mockSongs[7], mockSongs[8], mockSongs[6]]
  },
  {
    id: 'p5',
    name: '我的收藏',
    description: '我收藏的喜爱歌曲',
    cover: 'https://picsum.photos/300/300?random=5',
    songs: [mockSongs[0], mockSongs[3], mockSongs[5], mockSongs[9]]
  }
]

// 为了兼容现有代码，保留原来的mockPlaylist
export const mockPlaylist: Song[] = mockSongs.slice(0, 3)