<template>
  <div class="playlist-container">
    <h2 class="playlist-title">我的播放列表</h2>
    <div class="playlist-list">
      <div 
        v-for="playlist in playlists" 
        :key="playlist.id"
        class="playlist-item"
        @click="selectPlaylist(playlist)"
        :class="{ 'active': selectedPlaylist && selectedPlaylist.id === playlist.id }"
      >
        <div class="playlist-cover">
          <img :src="playlist.cover" :alt="playlist.name" />
        </div>
        <div class="playlist-info">
          <div class="playlist-name">{{ playlist.name }}</div>
          <div class="playlist-desc">{{ playlist.description }}</div>
          <div class="playlist-count">{{ playlist.songs.length }}首歌曲</div>
        </div>
      </div>
    </div>

    <div v-if="selectedPlaylist" class="selected-playlist">
      <h3>{{ selectedPlaylist.name }}</h3>
      <div class="song-list">
        <div 
          v-for="(song, index) in selectedPlaylist.songs" 
          :key="song.id"
          class="song-item"
          @click="playSong(song, index)"
          :class="{ 'playing': currentSong && currentSong.id === song.id }"
        >
          <div class="song-index">{{ index + 1 }}</div>
          <div class="song-info">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>
          <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { mockPlaylists } from '../../mock/mockData'
import type { Playlist, Song } from '@/types/types'
import { usePlayerStore } from '@/stores/music'

const emit = defineEmits(['play-song'])

const playlists = ref(mockPlaylists)
const selectedPlaylist = ref<Playlist | null>(null)
const currentSong = ref<Song | null>(null)
const player = usePlayerStore()

// 选择播放列表
function selectPlaylist(playlist: Playlist) {
  selectedPlaylist.value = playlist
  player.updatePlaylist(playlist.songs);
  if (!player.isEmpty) {
    player.setCurrentSong(playlist.songs[0]);
  }
}

// 播放歌曲
function playSong(song: Song, index: number) {
  currentSong.value = song
  // 触发事件通知父组件播放歌曲
  emit('play-song', song, index)
}

// 格式化时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// watch player.currentSong
watch(() => player.currentSong, (newSong) => {
  currentSong.value = newSong;
})

</script>

<style scoped>
.playlist-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.playlist-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background-color: #e0e0e0;
}

.playlist-item.active {
  background-color: #d0d0d0;
}

.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  overflow: hidden;
}

.playlist-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-desc {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 0.75rem;
  color: #888;
}

.selected-playlist {
  margin-top: 16px;
  border-top: 1px solid #ddd;
  padding-top: 16px;
}

.selected-playlist h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #333;
}

.song-list {
  display: flex;
  flex-direction: column;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #e0e0e0;
}

.song-item.playing {
  background-color: #d0d0d0;
}

.song-index {
  width: 24px;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}

.song-info {
  flex: 1;
  margin: 0 12px;
  overflow: hidden;
}

.song-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 0.8rem;
  color: #888;
  width: 40px;
  text-align: right;
}
</style>