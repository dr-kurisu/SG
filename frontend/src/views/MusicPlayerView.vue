<template>
    <div class="music-player-view">
        <div class="sidebar">
            <Playlist @play-song="playSong" />
        </div>
        <div class="main-content">
            <Player ref="playerRef" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Player from '../components/Music/Player.vue';
import Playlist from '../components/Music/Playlist.vue';
import { ref } from 'vue';
import { usePlayerStore } from '@/stores/music';
import type { Song } from '@/types/types';

const playerRef = ref<InstanceType<typeof Player> | null>(null);
const playerStore = usePlayerStore();

// 处理从Playlist组件传来的播放歌曲事件
function playSong(song: Song) {
    // 设置当前歌曲并播放
    playerStore.setCurrentSong(song);
    playerStore.play();
}
</script>

<style scoped>
.music-player-view {
    display: flex;
    height: calc(100vh - 50px); /* 减去导航栏高度 */
    overflow: hidden;
}

.sidebar {
    width: 300px;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    background-color: #f5f5f5;
}

.main-content {
    flex: 1;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fafafa;
}
</style>